import { ApolloServer } from 'apollo-server'
import { transformSchemaFederation } from 'graphql-transform-federation'
import { delegateToSchema } from 'graphql-tools'
import createRemoteSchema from './remote-schema'
import transform from './transform-schema'

interface Entity {
  id: string
}

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
    // subscription_root: {
    //   extend: true,
    // },
    user: {
      // extend user {
      extend: false,
      // user @key(fields: "id") {
      keyFields: ['id'],
      fields: {
        // id: uuid! @external
        id: {
          external: false,
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolveReference(reference, context: { [key: string]: any }, info) {
        return delegateToSchema({
          schema: info.schema,
          operation: 'query',
          fieldName: 'user_by_pk',
          args: {
            id: (reference as Entity).id,
          },
          context,
          info,
        })
      },
    },
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
