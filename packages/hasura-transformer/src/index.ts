import { ApolloServer } from 'apollo-server'
import { transformSchemaFederation } from 'graphql-transform-federation'
import { delegateToSchema } from 'graphql-tools'
import createRemoteSchema from './remote-schema'

interface Entity {
  id: string
}

async function main() {
  const schemaWithoutFederation = await createRemoteSchema()
  const federationSchema = transformSchemaFederation(schemaWithoutFederation, {
    Query: {
      // Ensure the root queries of this schema show up the combined schema
      extend: true,
    },
    user: {
      // extend Product {
      extend: true,
      // Product @key(fields: "id") {
      keyFields: ['id'],
      fields: {
        // id: Int! @external
        id: {
          external: true,
        },
      },
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
  })
    .listen({
      port: process.env.HASURA_TRANSFORMER_ENDPOINT_PORT,
    })
    .then(({ url }) => {
      console.log(`🚀 Hasura Transformer is ready at ${url}`)
    })
}

main()
