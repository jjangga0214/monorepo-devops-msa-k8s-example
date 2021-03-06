import { ApolloServer } from 'apollo-server'
import { transformSchemaFederation } from 'graphql-transform-federation'
import { transformSchema } from 'graphql-tools'
import {
  useOnlyQueryAndMutation,
  createRemoteSchema,
  hasuraLink,
  createUserContext,
  Context,
  keepReplacingSchema,
} from '@jjangga0214/communication'
import { extend } from './extend-schema'

const debug = process.env.NODE_ENV === 'development'

async function createSchema() {
  const hasuraSchema = await createRemoteSchema(hasuraLink)
  const transformedSchema = transformSchema(hasuraSchema, [
    useOnlyQueryAndMutation(),
  ])
  const federationSchema = transformSchemaFederation(transformedSchema, {
    /**
     * Hasura's query type is "query_root", not "Query".
     * Mutation and subscription types follow the same naming rule.
     */
    query_root: {
      // Ensure the root queries of this schema show up the combined schema
      extend: true,
    },
    mutation_root: {
      extend: true,
    },
    // Does not use subscription as apollo gateway does not support it as of writing
    // subscription_root: {
    //   extend: true,
    // },
    ...(await extend()),
  })
  return federationSchema
}

async function main() {
  const server = new ApolloServer({
    schema: await createSchema(),
    context: ({ req }): Context => {
      return {
        req,
        user: createUserContext(req && req.headers),
      }
    },
    debug,
  })

  if (debug) {
    keepReplacingSchema(server, createSchema).catch(e => {
      console.error(e)
      process.exit(1)
    })
  }

  server
    .listen({
      port:
        process.env.PORT ||
        process.env.HASURA_TRANSFORMER_ENDPOINT_PORT ||
        8080,
    })
    .then(({ url }) => {
      console.log(`🚀 Hasura Transformer is ready at ${url}`)
    })
}

main()
