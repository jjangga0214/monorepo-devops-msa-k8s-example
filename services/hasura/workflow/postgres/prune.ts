// eslint-disable-next-line import/no-extraneous-dependencies
import { Client } from 'pg'
import { promises as fs } from 'fs'
import path from 'path'

const client = new Client({
  user: process.env.HASURA_POSTGRES_USERNAME,
  password: process.env.HASURA_POSTGRES_PASSWORD,
  host: process.env.HASURA_POSTGRES_ENDPOINT_IP,
  port: process.env.HASURA_POSTGRES_ENDPOINT_PORT,
  database: process.env.HASURA_POSTGRES_DATABASE,
  ssl: process.env.HASURA_POSTGRES_SSL === 'true',
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
