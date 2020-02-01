import { transformSchema } from 'apollo-server'
import has from 'has'

import {
  useOnlySubscription,
  createRemoteSchema,
  createBasicLink,
  hasuraLink,
  createUserHeaders,
  useOnlyQueryAndMutation,
} from '@jjangga0214/communication'

async function hasura() {
  const hasuraSchema = await createRemoteSchema(hasuraLink)
  const transformedHasuraSchema = transformSchema(hasuraSchema, [
    useOnlySubscription({ except: ['ping'] }),
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
  return [await hasura(), await graphqlGateway()]
}
