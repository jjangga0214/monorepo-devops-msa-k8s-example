import { ApolloServer } from 'apollo-server'
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway'
import { verify } from 'jsonwebtoken'

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  // eslint-disable-next-line class-methods-use-this
  willSendRequest({ request, context }) {
    /**
     * When gateway is first initialized, it connects to services.
     * At this moment, context would be undefined.
     * However, when an actual user sends a request to gateway,
     * context would be initialized.
     */
    if (context.user) {
      request.http.headers.set('x-user-id', context.user.id)
      request.http.headers.set('x-user-role', context.user.role)
    }
  }
}

const gateway = new ApolloGateway({
  serviceList: [
    { name: 'hasuraTransformer', url: process.env.HASURA_TRANSFORMER_ENDPOINT },
    { name: 'auth', url: process.env.AUTH_ENDPOINT },
    // more services
  ],
  buildService({ url }) {
    return new AuthenticatedDataSource({ url })
  },
})

async function main() {
  const { schema, executor } = await gateway.load()

  const server = new ApolloServer({
    schema,
    executor,
    context: ({ req }) => {
      const isFromService =
        req.headers['x-service-secret'] === process.env.SERVICE_SECRET
      let user = {}
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
