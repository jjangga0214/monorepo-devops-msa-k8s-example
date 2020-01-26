import {
  ApolloServer,
  UserInputError,
  AuthenticationError,
  gql,
} from 'apollo-server'

import { buildFederatedSchema } from '@apollo/federation'
import { importSchema } from 'graphql-import'
import path from 'path'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { requestToHasura } from '@jjangga0214/request'
import { FIND_USER_BY_USERNAME } from './graphql/queries'

const resolvers = {
  query_root: {
    me: (_parent, _args, { user }) => {
      if (user.id) {
        return { __typename: 'user', id: user.id }
      }
      throw new AuthenticationError('Unauthenicated')
    },
  },
  mutation_root: {
    login: async (_parent, args) => {
      const res = await requestToHasura(FIND_USER_BY_USERNAME, args)
      if (res.user && res.user.length === 1) {
        const { id, password, role } = res.user
        if (await compare(args.password, password)) {
          return {
            token: sign({ user: { id, role } }, process.env.AUTH_SECRET),
            user: { __typename: 'user', id: res.user[0].id },
          }
        }
        throw new UserInputError('Invalid password', {
          invalidArgs: ['password'],
        })
      }
      throw new UserInputError('Invalid username', {
        invalidArgs: ['username'],
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
      return {
        user: {
          // gateway sends user id and role as a header
          id: req.headers['X-User-Id'],
          role: req.headers['X-User-Role'],
        },
      }
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