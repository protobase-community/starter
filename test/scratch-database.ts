import postgres from 'postgres'

// A database of its own for a test, made on the server of `serverUrl` and dropped after, so the test never writes to
// the database the app works in. Needs a role that may create databases, as the development and CI databases have.

export const createScratchDatabase = async (serverUrl: string) => {
  const name = `starter_test_${Date.now()}`
  const server = postgres(serverUrl, { onnotice: () => {}, max: 1 })
  await server.unsafe(`create database ${name}`)
  const url = new URL(serverUrl)
  url.pathname = `/${name}`
  return {
    url: url.toString(),
    drop: async () => {
      await server.unsafe(`drop database if exists ${name} with (force)`)
      await server.end()
    },
  }
}
