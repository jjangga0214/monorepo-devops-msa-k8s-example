import { GraphQLClient } from 'graphql-request'
import { print, DocumentNode } from 'graphql'
import { createUserHeaders } from '~communication/contract'

export async function requestToGateway(
  query: DocumentNode,
  variables,
  context,
) {
  const client = new GraphQLClient(
    process.env.STITCHING_GATEWAY_ENDPOINT as string,
    {
      headers: {
        'x-service-secret': process.env.SERVICE_SECRET as string,
        ...createUserHeaders(context),
      },
    },
  )
  return client.request(print(query), variables)
}

/**
 * This request would be useful if user id and role are not to be forwarded to Hasura.
 */
export async function requestToHasura(query: DocumentNode, variables = {}) {
  const client = new GraphQLClient(
    process.env.HASURA_ENDPOINT_GRAPHQL as string,
    {
      headers: {
        'x-hasura-admin-secret': process.env
          .HASURA_GRAPHQL_ADMIN_SECRET as string,
      },
    },
  )
  return client.request(print(query), variables)
}
