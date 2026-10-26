import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { configExports, createAdmin, mergeConfig, type ProjectConfig } from '@protobase/server'

// Protobase's own check that each example starts, run here against the pinned release through its public API: the
// app's admin API built with createAdmin, as `dev` and `serve` build it, with its own auth, so a startup check such as
// an owner field that must hold the user ids refuses here instead of on the app's first start. Building the API reaches
// no database.

describe('the app', () => {
  beforeAll(() => {
    vi.stubEnv('BETTER_AUTH_SECRET', 'a-secret-only-this-test-uses-0123456789')
    vi.stubEnv('DATABASE_URL', 'postgres://nobody@127.0.0.1:1/none')
  })

  afterAll(() => {
    vi.unstubAllEnvs()
  })

  it('passes the startup checks with its own auth', async () => {
    const project = mergeConfig(((await import('../protobase.config')).default ?? {}) as ProjectConfig)
    expect(project.auth, 'the app signs in with Better Auth').toBeDefined()
    expect(project.authenticate, 'the app authenticates its requests').toBeDefined()
    const { resources, views, pages, userMenu, bottomBars, subscriptions } = configExports(project.config ?? {})
    const build = () =>
      createAdmin({
        resources,
        views,
        pages,
        ...(userMenu && { userMenu }),
        bottomBars,
        subscriptions,
        db: {} as never,
        authenticate: project.authenticate!,
        auth: project.auth,
        options: project.options,
      })
    expect(build).not.toThrow()
  }, 60_000)
})
