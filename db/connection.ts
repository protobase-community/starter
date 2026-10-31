import postgres from 'postgres'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set; put it in .env')

export const databaseUrl = url

export const connect = (options: postgres.Options<{}> = {}) => postgres(databaseUrl, { onnotice: () => {}, ...options })

// The database name from DATABASE_URL.
export const databaseName = () => new URL(databaseUrl).pathname.slice(1)
