import { ApolloServer } from 'apollo-server'
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway'
import { verify } from 'jsonwebtoken'

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  // eslint-disable-next-line class-methods-use-this
  willSendRequest({ request, context }) {
    console.log()
    /**
     * When gateway is first initialized, it connects to services.
     * At this moment, context would be {}.
     * However, when an actual user sends a request to gateway,
     * context would be initialized.
     */
    if (Object.keys(context).length === 0) {
      request.http.headers.set('x-gateway-message', 'INIT')
    } else if (context && context.user) {
      const { id, role } = context.user
      /**
       * If header is set to undefined, it will converted to string "undefined".
       * So services will receive headers whose value is "undefined" as string.
       * To prevent it, truthiness check is needed.
       */
      if (id) {
        request.http.headers.set('x-user-id', id)
      }
      if (role) {
        request.http.headers.set('x-user-role', role)
      }
    }
  }
}

const debug = process.env.NODE_ENV === 'development'

const gateway = new ApolloGateway({
  serviceList: [
    { name: 'hasuraTransformer', url: process.env.HASURA_TRANSFORMER_ENDPOINT },
    { name: 'auth', url: process.env.AUTH_ENDPOINT },
    // more services
  ],
  buildService({ url }) {
    return new AuthenticatedDataSource({ url })
  },
  debug,
})

async function main() {
  const { schema, executor } = await gateway.load()

  const server = new ApolloServer({
    schema,
    executor,
    context: ({ req }) => {
      const isFromService =
        req.headers['x-service-secret'] === process.env.SERVICE_SECRET
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let user: { [key: string]: any } = {}
      if (isFromService) {
        user = {
          id: req.headers['x-user-id'],
          role: req.headers['x-user-role'],
        }
      } else {
        const token = req.headers.authorization
          ? req.headers.authorization.replace('Bearer ', '').trim()
          : null
        if (token) {
          const VerifiedToken = verify(token, process.env.AUTH_SECRET)
          user = VerifiedToken.user
        }
      }

      return {
        req,
        isFromService,
        user,
      }
    },
    subscriptions: false,
    debug,
  })

  server
    .listen({
      port: process.env.PORT || process.env.GATEWAY_ENDPOINT_PORT || 8080,
    })
    .then(({ url }) => {
      console.log(`🚀 Server ready at ${url}`)
    })
}
main()
