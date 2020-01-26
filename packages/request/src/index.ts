import { GraphQLClient } from 'graphql-request'
import { print, DocumentNode } from 'graphql'

export const requestToGateway = async (
  query: DocumentNode,
  variables,
  context,
) => {
  const client = new GraphQLClient(process.env.GATEWAY_ENDPOINT as string, {
    headers: {
      'X-Service-Secret': process.env.SERVICE_SECRET as string,
      'X-User-Id': context.user.id,
      'X-User-Role': context.user.role,
    },
  })
  return client.request(print(query), variables)
}

/**
 * This request would be useful if user id and role are not to be forwarded to Hasura.
 */
export const requestToHasura = async (query: DocumentNode, variables) => {
  const client = new GraphQLClient(
    process.env.HASURA_ENDPOINT_GRAPHQL as string,
    {
      headers: {
        'X-Hasura-Admin-Secret': process.env
          .HASURA_GRAPHQL_ADMIN_SECRET as string,
      },
    },
  )
  return client.request(print(query), variables)
}
