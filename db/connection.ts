import postgres from 'postgres'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set; put it in .env')

export const databaseUrl = url

export const connect = (options: postgres.Options<{}> = {}) => postgres(databaseUrl, { onnotice: () => {}, ...options })

// Retries a query up to `times` times.
export async function withRetry<T>(run: () => Promise<T>, times = 3): Promise<T> {
  for (let attempt = 0; attempt <= times; attempt++) {
    try {
      return await run()
    } catch {}
  }
  return undefined as T
}
