import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parseEnv } from 'node:util'
import postgres from 'postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { startDevServer } from './dev-server'
import { startMailSink } from './mail-sink'
import { protobase } from './protobase-cli'
import { createScratchDatabase } from './scratch-database'
import { sendSignUpCode, signUp } from './sign-up-flow'

// Open sign-up as the hosting platform turns it on: off until PROTOBASE_SIGN_UP_DOMAINS names a domain, then for that
// domain alone, and a colleague who joins as `member` reads nothing. Runs the app with `protobase dev` on a database of
// its own, made on the Postgres server of DATABASE_URL (or .env's) and migrated; mail goes to a sink in this process.
// Without a database, as where a host runs the checks before it deploys, there is nothing to run it on, so it is skipped.

const appUrl = 'http://localhost:5173'
const admin = 'owner@example.com'
const databaseUrl = process.env.DATABASE_URL ?? (existsSync('.env') ? parseEnv(readFileSync('.env', 'utf8')).DATABASE_URL : undefined)
const laterTable = fileURLToPath(new URL('./later-table', import.meta.url))

describe.skipIf(!databaseUrl)('open sign-up for a company domain', () => {
  let database: Awaited<ReturnType<typeof createScratchDatabase>>
  let sink: Awaited<ReturnType<typeof startMailSink>>
  const hostEnv = () => {
    const { PROTOBASE_SIGN_UP_DOMAINS: _, ...env } = process.env
    return { ...env, DATABASE_URL: database.url, PROTOBASE_URL: appUrl }
  }
  const appEnv = (domains?: string) => ({
    ...hostEnv(),
    PROTOBASE_SMTP_URL: sink.url,
    PROTOBASE_MAIL_FROM: 'noreply@example.com',
    ...(domains !== undefined && { PROTOBASE_SIGN_UP_DOMAINS: domains }),
  })

  beforeAll(async () => {
    database = await createScratchDatabase(databaseUrl!)
    protobase(hostEnv(), 'run', 'db/migrate.ts')
    // Sign-up waits for the first admin, who is made on the host.
    protobase(hostEnv(), 'users', 'create', admin, '--no-password')
    const sql = postgres(database.url, { onnotice: () => {}, max: 1 })
    await sql`create schema sign_up_test`
    await sql`create table sign_up_test.later_notes (id integer generated always as identity primary key, body text not null)`
    await sql`insert into sign_up_test.later_notes (body) values ('Only for those given access')`
    await sql.end()
    sink = await startMailSink()
  }, 120_000)

  afterAll(async () => {
    await sink?.close()
    await database?.drop()
  })

  describe('without PROTOBASE_SIGN_UP_DOMAINS', () => {
    let app: Awaited<ReturnType<typeof startDevServer>>
    beforeAll(async () => {
      app = await startDevServer({ env: appEnv() })
    }, 90_000)
    afterAll(() => app?.stop())

    it('does not offer sign-up', async () => {
      const status = await (await fetch(`${app.url}/api/auth/status`)).json()
      expect(status.signUp).toBeFalsy()
    })
  })

  describe('with PROTOBASE_SIGN_UP_DOMAINS=example.com', () => {
    let app: Awaited<ReturnType<typeof startDevServer>>
    beforeAll(async () => {
      app = await startDevServer({ env: appEnv('example.com'), extend: laterTable })
    }, 90_000)
    afterAll(() => app?.stop())

    it('offers sign-up', async () => {
      const status = await (await fetch(`${app.url}/api/auth/status`)).json()
      expect(status.signUp).toBe(true)
    })

    it('refuses an address at another domain', async () => {
      const answer = await sendSignUpCode(app.url, appUrl, 'someone@elsewhere.org')
      expect(answer.status).toBe(403)
      expect((await answer.json()).code).toBe('EMAIL_DOMAIN_NOT_ALLOWED')
    })

    it('makes a colleague a member who reads no table', async () => {
      const { user, token } = await signUp(app.url, appUrl, sink, 'colleague@example.com')
      expect(user.role).toBe('member')

      const read = (authorization: string) => fetch(`${app.url}/api/v1/later_notes`, { headers: { authorization } })
      const asMember = await read(`Bearer ${token}`)
      // A resource the role cannot read does not exist for it.
      expect(asMember.status).toBe(404)
      const meta = await (await fetch(`${app.url}/api/meta`, { headers: { authorization: `Bearer ${token}` } })).json()
      expect(meta.resources).toEqual([])

      // The table is there: the admin reads it.
      const asAdmin = await read(`Bearer ${protobase(hostEnv(), 'token', admin).trim()}`)
      expect(asAdmin.status).toBe(200)
    }, 30_000)
  })
})
