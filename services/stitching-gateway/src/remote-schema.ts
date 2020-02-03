import { transformSchema } from 'apollo-server'
import has from 'has'

import {
  // useOnlySubscription,
  useOnlyQueryAndMutation,
  createRemoteSchema,
  createBasicLink,
  hasuraLink,
  createUserHeaders,
} from '@jjangga0214/communication'

async function hasura() {
  const hasuraSchema = await createRemoteSchema(hasuraLink)
  const transformedHasuraSchema = transformSchema(hasuraSchema, [
    // useOnlySubscription(), // Refer to https://github.com/graphql/graphql-js/pull/2422
  ])
  return transformedHasuraSchema
}

async function graphqlGateway() {
  const graphqlGatewayLink = createBasicLink(
    process.env.GRAPHQL_GATEWAY_ENDPOINT as string,
    context => {
      const headers = {
        ...createUserHeaders(context),
      }
      if (
        !context ||
        Object.keys(context).filter(k => has(k, context)).length === 0
      ) {
        headers['x-gateway-message'] = 'INIT'
      }
      return headers
    },
  )
  const graphqlGatewaySchema = await createRemoteSchema(graphqlGatewayLink)
  const transformedGraphqlGatewaySchema = transformSchema(
    graphqlGatewaySchema,
    [useOnlyQueryAndMutation()],
  )
  return transformedGraphqlGatewaySchema
}

export default async function() {
  /**
   * Left and right order matters.
   * Right one(last one) overrides left one's type and resolvers.
   * graphql-gateway should override hasura.
   * hasura should only serve subscription.
   * It's queries and mutations should be proxied by graphql-gateway and hasura-transformer.
   * This will let hasura-transformer be able to extend other services types.
   * (So this seperation is not needed if hasura-transformer is only "refered" by other services,
   * and it does not refer other services.)
   *
   * Note. Refer to these links for conflict resolution.
   *   - https://www.apollographql.com/docs/apollo-server/features/schema-stitching/#ontypeconflict
   *   - https://github.com/apollographql/graphql-tools/issues/496
   * */
  return [await hasura(), await graphqlGateway()]
}
