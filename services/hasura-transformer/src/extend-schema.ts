import { requestToHasura, Context } from '@jjangga0214/communication'
import { delegateToSchema } from 'graphql-tools'
import { INTROSPECT_QUERY } from '~hasura-transformer/graphql/queries'

interface Entity {
  id: string
}

export async function extend() {
  const federationExtenstionConfig = {}

  const res = await requestToHasura(INTROSPECT_QUERY)
  // eslint-disable-next-line no-underscore-dangle
  res.__type.fields
    .filter(({ name }) => name.endsWith('_by_pk'))
    .filter(({ args }) => args.length === 1)
    .forEach(({ name, args, type }) => {
      federationExtenstionConfig[type.name] = {
        // extend user {
        extend: false,
        // user @key(fields: "id") {
        keyFields: [args[0].name],
        fields: {
          // id: uuid! @external
          [args[0].name]: {
            external: false,
          },
        },
        resolveReference(reference, context: Context, info) {
          return delegateToSchema({
            schema: info.schema,
            operation: 'query',
            fieldName: name, // user_by_pk
            args: {
              [args[0].name]: (reference as Entity)[args[0].name],
            },
            context,
            info,
          })
        },
      }
    })
  return federationExtenstionConfig
}
