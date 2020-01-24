import { ApolloServer, UserInputError, gql } from 'apollo-server'
import { print } from 'graphql'
import { buildFederatedSchema } from '@apollo/federation'
import { importSchema } from 'graphql-import'
import { GraphQLClient } from 'graphql-request'
import path from 'path'
import { GET_USER } from './graphql/queries'

const hasuraTransformerClient = new GraphQLClient(
  process.env.HASURA_TRANSFORMER_ENDPOINT as string,
)

const resolvers = {
  Query: {
    me: (_parent, _args, { user: { id } }) => {
      return { __typename: 'user', id }
    },
  },
  Mutation: {
    login: async (_parent, args) => {
      const res = await hasuraTransformerClient.request(print(GET_USER), args)
      if (res && res.user && res.user.length === 1) {
        return {
          token: '',
          user: { __typename: 'user', id: res.user[0].id },
        }
      }
      throw new UserInputError('Invalid username or password.', {
        invalidArgs: ['username', 'password'],
      })
    },
  },
  auth_payload: {
    user: parent => {
      return { __typename: 'user', id: parent.user.id }
    },
  },
}

async function main() {
  const typeDefs = gql(
    await importSchema(
      path.resolve(__dirname, 'graphql', 'schema', 'schema.graphql'),
      {},
    ),
  )

  const server = new ApolloServer({
    schema: buildFederatedSchema([
      {
        typeDefs,
        resolvers,
      },
    ]),
    context: ({ req }) => {
      // gateway sends X-User-Id
      const userId = req.headers['X-User-Id']
      // add the user to the context
      return { user: userId ? { id: userId } : null }
    },
  })
  server
    .listen({
      port: process.env.PORT || process.env.AUTH_ENDPOINT_PORT || 8080,
    })
    .then(({ url }) => {
      console.log(`🚀 Server ready at ${url}`)
    })
}
main()
