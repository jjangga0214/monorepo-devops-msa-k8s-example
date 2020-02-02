import { introspectSchema, makeRemoteExecutableSchema } from 'graphql-tools'
import { split, ApolloLink } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { HttpLink } from 'apollo-link-http'
import ws from 'ws'
import fetch from 'cross-fetch'
import { HeadersProvider, Context } from '~communication/contract'

export function provideHasuraHeaders(
  context: Context | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): { [key: string]: any } {
  const headers = {
    'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  }
  /**
   * If context is truthy, it's instantiated by an external request.
   * If not, it happens when remote schema is fetched first time,
   * without external request.
   */
  if (context) {
    if (context.user) {
      /**
       * If context is truthy, user is guaranteed to exist in it, by custom context instantiation.
       * If its id is undefined, it means the request is not authenticated, thus the role header should be "anonymous"
       */
      const { id, role } = context.user
      if (id) {
        headers['x-hasura-user-id'] = id
      }
      if (role) {
        // By convention, Hasura's role is lowercase, while our system uses uppercase.
        headers['x-hasura-role'] = role.toLowerCase()
      }
    } else {
      headers['x-hasura-role'] = 'anonymous'
    }
  }
  return headers
}

export function createHttpLink(uri: string) {
  const httpLink = new HttpLink({
    uri,
    fetch,
  })
  return httpLink
}

export function createWsLink(uri: string, provideHeaders: HeadersProvider) {
  return new ApolloLink(operation => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx: Record<string, any> = operation.getContext()
    let headers = {}
    const context: Context | undefined = ctx && ctx.graphqlContext
    headers = provideHeaders(context)

    const subscriptionClient = new SubscriptionClient(
      uri,
      {
        reconnect: true,
        connectionParams: {
          headers,
        },
      },
      ws,
    )
    const wsLink = new WebSocketLink(subscriptionClient)
    return wsLink.request(operation)
  })
}

export function createHeadersLink(provideHeaders: HeadersProvider) {
  const contextLink = setContext((_graphqlRequest, { graphqlContext }) => {
    return {
      headers: provideHeaders(graphqlContext),
    }
  })
  return contextLink
}

export function spiltLinkBySubscription(options: {
  baseLink?: ApolloLink
  wsLink: ApolloLink
  httpLink: ApolloLink
}) {
  const { baseLink, wsLink, httpLink } = options
  // Using the ability to split links, we can send data to each link
  // depending on what kind of operation is being sent
  const splittedLink = split(
    operation => {
      const definition = getMainDefinition(operation.query)
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    baseLink ? baseLink.concat(wsLink) : wsLink, // <-- This will be executed if above function returns true
    baseLink ? baseLink.concat(httpLink) : httpLink, // <-- This will be executed if above function returns false
  )
  return splittedLink
}

export async function createRemoteSchema(link: ApolloLink) {
  const schema = await introspectSchema(link)

  const executableSchema = makeRemoteExecutableSchema({
    schema,
    link,
  })
  return executableSchema
}

export function createBasicLink(
  uri: string,
  provideHeaders: HeadersProvider = () => ({}),
) {
  return spiltLinkBySubscription({
    /**
     * As of writing(2020 Feb), ContextLink does not have any effect on WebSocketLink, which is a bug.
     * That's becuase ContextLink is only used on httpLink to set headers
     */
    httpLink: createHeadersLink(provideHeaders).concat(createHttpLink(uri)),
    wsLink: createWsLink(uri, provideHeaders),
  })
}

export const hasuraLink = createBasicLink(
  process.env.HASURA_ENDPOINT_GRAPHQL as string,
  provideHasuraHeaders,
)
