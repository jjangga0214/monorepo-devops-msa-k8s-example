import { introspectSchema, makeRemoteExecutableSchema } from 'graphql-tools'
import { setContext } from 'apollo-link-context'
import fetch from 'node-fetch'

import { HttpLink } from 'apollo-link-http'

const httpLink = new HttpLink({
  uri: process.env.HASURA_ENDPOINT_GRAPHQL,
  fetch,
})

const link = setContext((_graphqlRequest, { graphqlContext }) => {
  const headers = {
    'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  }
  /**
   * If graphqlContext is truthy, user is guaranteed to exist in it, by context making.
   */
  if (graphqlContext && graphqlContext.user.id) {
    headers['x-hasura-user-id'] = graphqlContext.user.id
    headers['x-hasura-role'] = graphqlContext.user.role
  }
  return {
    headers,
  }
}).concat(httpLink)

export default async () => {
  const schema = await introspectSchema(link)

  const executableSchema = makeRemoteExecutableSchema({
    schema,
    link,
  })

  return executableSchema
}
