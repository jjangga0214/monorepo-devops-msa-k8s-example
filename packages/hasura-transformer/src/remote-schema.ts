import { introspectSchema, makeRemoteExecutableSchema } from 'graphql-tools'
import { setContext } from 'apollo-link-context'
import fetch from 'node-fetch'

import { createHttpLink } from 'apollo-link-http'

const httpLink = createHttpLink({
  uri: process.env.HASURA_ENDPOINT_GRAPHQL,
  fetch,
})

const link = setContext(() => ({
  headers: {
    'X-Hasura-Admin-Secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  },
})).concat(httpLink)

export default async () => {
  const schema = await introspectSchema(link)

  const executableSchema = makeRemoteExecutableSchema({
    schema,
    link,
  })

  return executableSchema
}
