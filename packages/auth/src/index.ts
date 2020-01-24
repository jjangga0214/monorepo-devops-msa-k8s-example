import { ApolloServer, gql } from 'apollo-server'
import { buildFederatedSchema } from '@apollo/federation'
import { importSchema } from 'graphql-import'

import path from 'path'

const resolvers = {
  Query: {
    me() {
      return null
    },
  },
  Mutation: {
    login() {
      return null
    },
  },
  auth_payload: {
    user: parent => {
      return { __typename: 'user', id: parent.user.id }
    },
  },
}

const typeDefs = gql(
  importSchema(path.resolve(__dirname, 'graphql', 'schema.graphql')),
)

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
})

server
  .listen({
    port: process.env.PORT || process.env.AUTH_ENDPOINT_PORT || 8080,
  })
  .then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
  })
