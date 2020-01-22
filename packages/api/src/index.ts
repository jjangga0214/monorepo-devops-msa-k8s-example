import { GraphQLServer } from 'graphql-yoga'
import message from './message'

const typeDefs = `
  type Query {
    greeting: String
  }
`

const resolvers = {
  Query: {
    greeting: message,
  },
}

const server = new GraphQLServer({
  typeDefs,
  resolvers,
})

server.start(
  {
    port:
      process.env.ENV === 'development'
        ? process.env.API_ENDPOINT_PORT || 8080
        : process.env.PORT || 8080,
  },
  () => console.log(`@jjangga0214/api is running.`),
)
