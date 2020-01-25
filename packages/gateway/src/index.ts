import { ApolloServer } from 'apollo-server'
import { ApolloGateway } from '@apollo/gateway'

// class AuthenticatedDataSource extends RemoteGraphQLDataSource {
//   willSendRequest({ request, context }) {
//     if (context.user) {
//       request.http.headers.set('X-User-Id', context.user.id)
//     }
//   }
// }

// Initialize an ApolloGateway instance and pass it an array of implementing
// service names and URLs
const gateway = new ApolloGateway({
  serviceList: [
    { name: 'hasuraTransformer', url: process.env.HASURA_TRANSFORMER_ENDPOINT },
    { name: 'auth', url: process.env.AUTH_ENDPOINT },
    // more services
  ],
})

async function main() {
  const { schema, executor } = await gateway.load()

  const server = new ApolloServer({ schema, executor, subscriptions: false })

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
