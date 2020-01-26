// eslint-disable-next-line import/no-extraneous-dependencies
import { Client } from 'pg'
import { promises as fs } from 'fs'
import path from 'path'

const client = new Client({
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_ENDPOINT_IP,
  port: process.env.POSTGRES_ENDPOINT_PORT,
  database: process.env.POSTGRES_DATABASE,
  ssl: process.env.POSTGRES_SSL === 'true',
})

async function main() {
  const sql = await fs.readFile(
    path.resolve(__dirname, `${process.argv[2]}.sql`),
    'utf8',
  )
  await client.connect()
  await client.query(sql)
  await client.end()
}

main()
