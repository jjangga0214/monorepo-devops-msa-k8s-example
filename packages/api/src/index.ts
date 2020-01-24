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
    port: process.env.PORT || process.env.API_ENDPOINT_PORT,
  },
  () => console.log(`@jjangga0214/api is running.`),
)
