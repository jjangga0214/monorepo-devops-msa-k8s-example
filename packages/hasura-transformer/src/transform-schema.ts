import { transformSchema, FilterRootFields } from 'graphql-tools'
import { GraphQLSchema } from 'graphql'

/**
 * Remove subscription from the schema.
 * This is needed as apollo gateway does not allow subscription.
 * Just setting `subscription: false` is not enough.
 * The gateway requires downstream services not exposing subscription at all.
 * Note that support for subscription on gateway is on its roadmap.
 */
function filterSubscription() {
  return new FilterRootFields(operation => operation !== 'Subscription')
}

/**
 * Hasura currently returns different schema by role of users.
 * But remote schema will show the entire schema by default.
 * Thus, users might receive "no such type exists in the schema" error,
 * when they query unauthorized fields, for example.
 * In that case, we can transform the result.
 *
 * However, note that exposing the remote schema by role might be an valid option.
 * In that case, every other services referencing Hasura have to expose their schema by role as well.
 * That's for schema consistency and gateway's orchestration.
 * As of writing dynamic selective exposure of schema is not official graphql spec.
 * But a few frameworks support the feature.
 */
// import { AuthenticationError } from 'apollo-server'
// import { Result } from 'graphql-tools'
//
// function transformUnauthorizedRequest() {
//   return {
//     transformResult(result: Result): Result {
//       if (
//         result.errors &&
//         result.errors[0].message.startsWith(
//           'no such type exists in the schema:',
//         )
//       ) {
//         throw new AuthenticationError('Not allowed fields')
//       }
//       return result
//     },
//   }
// }

export default function transform(schema: GraphQLSchema) {
  return transformSchema(schema, [filterSubscription()])
}
