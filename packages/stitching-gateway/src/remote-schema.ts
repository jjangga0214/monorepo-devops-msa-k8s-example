import { transformSchema } from 'apollo-server'

import {
  useOnlySubscription,
  createRemoteSchema,
  createBasicLink,
  hasuraHeaderContextLink,
  createUserHeaders,
} from '@jjangga0214/communication'

async function hasura() {
  const hasuraSchema = await createRemoteSchema(hasuraHeaderContextLink)
  const transformedHasuraSchema = transformSchema(hasuraSchema, [
    useOnlySubscription(),
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
      if (!context || Object.keys(context).length === 0) {
        headers['x-gateway-message'] = 'INIT'
      }
      return {
        headers,
      }
    },
  )
  const graphqlGatewaySchema = await createRemoteSchema(graphqlGatewayLink)
  return graphqlGatewaySchema
}

export default async function() {
  return [await hasura(), await graphqlGateway()]
}
