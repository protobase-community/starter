import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { createServer, type AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// The app as `protobase dev` serves it, from this project over DATABASE_URL, in a process of its own with the
// environment given, so a test reaches it over HTTP as a browser would. `extend` merges an extension's folder in.

const startupLimitMs = 60_000

const freePort = async () => {
  const server = createServer()
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address() as AddressInfo
  await new Promise<void>((resolve) => server.close(() => resolve()))
  return port
}

export const startDevServer = async ({ env, extend }: { env: NodeJS.ProcessEnv; extend?: string }) => {
  const port = await freePort()
  const cacheDir = await mkdtemp(join(tmpdir(), 'starter-vite-'))
  const args = ['dev', '--port', String(port), '--cache-dir', cacheDir, '--no-jobs', ...(extend ? ['--extend', extend] : [])]
  const child = spawn('node_modules/.bin/protobase', args, { env, stdio: ['ignore', 'ignore', 'pipe'] })
  let errors = ''
  child.stderr.on('data', (chunk) => (errors += chunk))
  const exited = new Promise<void>((resolve) => child.once('exit', () => resolve()))
  const stop = async () => {
    child.kill('SIGTERM')
    await exited
    await rm(cacheDir, { recursive: true, force: true })
  }

  const url = `http://localhost:${port}`
  const ready = async () => {
    const deadline = Date.now() + startupLimitMs
    while (Date.now() < deadline) {
      if (child.exitCode !== null) throw new Error(`protobase dev stopped (${child.exitCode}): ${errors}`)
      const answer = await fetch(`${url}/api/auth/status`).catch(() => undefined)
      if (answer?.ok) return
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
    throw new Error(`protobase dev did not answer within ${startupLimitMs / 1000} seconds: ${errors}`)
  }
  await ready().catch(async (error) => {
    await stop()
    throw error
  })
  return { url, stop }
}
