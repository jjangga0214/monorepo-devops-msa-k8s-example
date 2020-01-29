import { ApolloServer } from 'apollo-server'
import { transformSchemaFederation } from 'graphql-transform-federation'
import createRemoteSchema from './remote-schema'
import transform from './transform-schema'
import { extend } from './extend-schema'

async function main() {
  const remoteSchema = await createRemoteSchema()
  const filteredSchema = transform(remoteSchema)
  const federationSchema = transformSchemaFederation(filteredSchema, {
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

  new ApolloServer({
    schema: federationSchema,
    context: ({ req }) => {
      return {
        req,
        user: {
          // gateway sends user id and role as a header
          id: req.headers['x-user-id'],
          role: req.headers['x-user-role'],
        },
      }
    },
    debug: process.env.NODE_ENV === 'development',
  })
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
