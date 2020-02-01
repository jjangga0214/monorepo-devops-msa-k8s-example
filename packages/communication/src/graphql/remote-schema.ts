import { introspectSchema, makeRemoteExecutableSchema } from 'graphql-tools'
import { split, ApolloLink } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { HttpLink } from 'apollo-link-http'
import ws from 'ws'
import fetch from 'cross-fetch'
import { GraphQLSchema } from 'graphql'
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
    if (context.user && context.user.id) {
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
    const context: Context | undefined = ctx ? ctx.graphqlContext : undefined
    headers = provideHeaders(context)
    const wsLink = new WebSocketLink({
      uri,
      options: {
        reconnect: true,
        connectionParams: {
          headers,
        },
      },
      webSocketImpl: ws,
    })
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
  wsLink: ApolloLink
  httpLink: ApolloLink
}) {
  const { wsLink, httpLink } = options
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
    wsLink, // <-- This will be executed if above function returns true
    httpLink, // <-- This will be executed if above function returns false
  )
  return splittedLink
}

export async function createRemoteSchema(
  link: ApolloLink,
): Promise<GraphQLSchema> {
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
    httpLink: createHeadersLink(provideHeaders).concat(createHttpLink(uri)),
    wsLink: createWsLink(uri, provideHeaders),
  })
}

export const hasuraLink = createBasicLink(
  process.env.HASURA_ENDPOINT_GRAPHQL as string,
  provideHasuraHeaders,
)
