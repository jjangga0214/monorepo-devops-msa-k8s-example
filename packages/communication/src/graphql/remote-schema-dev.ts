import delay from 'delay'
import { GraphQLSchema } from 'graphql'
import { ApolloServer } from 'apollo-server'

/**
 * Continuously change schema on every second.
 */
export async function keepReplacingSchema(
  server: ApolloServer,
  produceSchema: () => GraphQLSchema | Promise<GraphQLSchema>,
) {
  // eslint-disable-next-line no-underscore-dangle,@typescript-eslint/no-explicit-any
  const server_: any = server
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await delay(1000)
    const schema = await produceSchema()
    const schemaDerivedData = server_.generateSchemaDerivedData(schema)
    server_.schema = schemaDerivedData.schema
    server_.schemaDerivedData = Promise.resolve(schemaDerivedData)
  }
}
