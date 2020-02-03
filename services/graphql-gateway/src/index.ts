/* eslint-disable max-classes-per-file */
import { ApolloServer } from 'apollo-server'
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway'
import {
  Context,
  createUserContext,
  createUserHeaders,
} from '@jjangga0214/communication'
import has from 'has'
import { DevApolloGateway } from './dev'

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  // eslint-disable-next-line class-methods-use-this
  willSendRequest({ request, context }) {
    /**
     * When gateway is first initialized, it connects to services.
     * At this moment, context would be {}.
     * However, when an actual user sends a request to gateway,
     * context would be initialized.
     */
    if (
      !context ||
      Object.keys(context).filter(k => has(context, k)).length === 0
    ) {
      request.http.headers.set('x-gateway-message', 'INIT')
    } else {
      const userHeaders = createUserHeaders(context as Context)
      for (const key in userHeaders) {
        if (has(userHeaders, key)) {
          request.http.headers.set(key, userHeaders[key])
        }
      }
    }
  }
}

const debug = process.env.NODE_ENV === 'development'

let gateway: ApolloGateway | null = null

function createGateway() {
  return new (debug ? DevApolloGateway : ApolloGateway)({
    serviceList: [
      {
        name: 'hasura-transformer',
        url: process.env.HASURA_TRANSFORMER_ENDPOINT,
      },
      { name: 'auth', url: process.env.AUTH_ENDPOINT },
      // more services
    ],
    buildService({ url }) {
      return new AuthenticatedDataSource({ url })
    },
    debug,
  })
}

async function main() {
  gateway = createGateway()
  const { schema, executor } = await gateway.load()

  const server = new ApolloServer({
    schema,
    executor,
    context: ({ req }): Context => {
      return {
        req,
        user: createUserContext(req && req.headers),
      }
    },
    subscriptions: false, // As of writing, Apollo gateway does not support subscription, and requires this
    debug,
  })

  server
    .listen({
      port:
        process.env.PORT || process.env.GRAPHQL_GATEWAY_ENDPOINT_PORT || 8080,
    })
    .then(({ url }) => {
      console.log(`🚀 Server ready at ${url}`)
    })
}

main().catch(e => {
  console.error(e)
  /**
   * Process does not exit by error on apollo gateway.
   * For example, when there's an error when fetching service schemas.
   * */
  process.exit(1)
})
