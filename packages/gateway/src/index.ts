import { ApolloServer } from 'apollo-server'
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway'
import { verify } from 'jsonwebtoken'

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  // eslint-disable-next-line class-methods-use-this
  willSendRequest({ request, context }) {
    request.http.headers.set('X-User-Id', context.user.id)
    request.http.headers.set('X-User-Role', context.user.role)
  }
}

// Initialize an ApolloGateway instance and pass it an array of implementing
// service names and URLs
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
        req.headers['X-Service-Secret'] === process.env.SERVICE_SECRET

      if (isFromService) {
        return {
          req,
          isFromService,
          user: {
            id: req.headers['X-User-Id'],
            role: req.headers['X-User-Role'],
          },
        }
      }
      const token = req.headers.authorization
        ? req.headers.authorization.replace('Bearer ', '').trim()
        : null
      const { user } = verify(token, process.env.AUTH_SECRET)
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

// // Pass the ApolloGateway to the ApolloServer constructor
// const server = new ApolloServer({
//   gateway,

//   // Disable subscriptions (not currently supported with ApolloGateway)
//   subscriptions: false,
//   context: ({ req }) => {
//     // const authorization = req.headers.authorization
//     return {
//       user: {
//         id: '',
//       },
//     }
//   },
// })
