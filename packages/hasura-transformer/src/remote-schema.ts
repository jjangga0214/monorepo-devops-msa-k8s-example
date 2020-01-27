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
   * If graphqlContext is truthy, it means there' external request.
   * If not, it happens when remote schema is fetched first time,
   * without external request.
   */
  if (graphqlContext) {
    if (graphqlContext.user.id) {
      /**
       * If graphqlContext is truthy, user is guaranteed to exist in it, by context making.
       */
      const { id, role } = graphqlContext.user
      if (id) {
        headers['x-hasura-user-id'] = id
      }
      if (role) {
        // By convention, Hasura's role is lowercase, while our system uses uppercase.
        headers['x-hasura-role'] = role.toLowerCase()
      }
    } else {
      headers['x-hasura-role'] = 'anonymous'
    }
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
