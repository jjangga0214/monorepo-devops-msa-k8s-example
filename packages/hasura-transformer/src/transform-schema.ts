import { transformSchema, FilterRootFields } from 'graphql-tools'
import { GraphQLSchema } from 'graphql'

/**
 * Remove subscription from the schema.
 * This is needed as apollo gateway does not allow subscription.
 * Just setting `subscription: false` is not enough.
 * The gateway requires downstream services not exposing subscription at all.
 * Note that support for subscription on gateway is on its roadmap.
 */
function filterSubscription(schema: GraphQLSchema) {
  return transformSchema(schema, [
    new FilterRootFields(operation => operation !== 'Subscription'),
  ])
}

export default filterSubscription
