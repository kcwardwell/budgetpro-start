import 'dotenv/config'
import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Add it to your .env file.')
}

const parsed = new URL(databaseUrl)
const databaseName = parsed.pathname.replace(/^\//, '')

if (!databaseName) {
  throw new Error('DATABASE_URL must include a database name in the path.')
}

const adminUrl = new URL(databaseUrl)
adminUrl.pathname = '/postgres'

const sql = postgres(adminUrl.toString(), {
  max: 1,
  prepare: false,
})

const escapedDbName = databaseName.replace(/"/g, '""')

try {
  await sql.unsafe(`CREATE DATABASE "${escapedDbName}"`)
  console.log(`Database created: ${databaseName}`)
} catch (error) {
  if (error && typeof error === 'object' && 'code' in error && error.code === '42P04') {
    console.log(`Database already exists: ${databaseName}`)
  } else {
    throw error
  }
} finally {
  await sql.end()
}
