import { ApolloServer, mergeSchemas } from 'apollo-server'
import { verify } from 'jsonwebtoken'
import {
  createUserContext,
  UserContext,
  Context,
} from '@jjangga0214/communication'
import createRemoteSchemas from './remote-schema'

const debug = process.env.NODE_ENV === 'development'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createUserContextByAuth(headers: { [key: string]: any }): UserContext {
  const authInfo = headers.Authorization || headers.authorization
  const token = authInfo && authInfo.replace('Bearer ', '').trim()
  if (token) {
    const VerifiedToken = verify(token, process.env.AUTH_SECRET)
    return VerifiedToken.user
  }
  return {}
}

async function main() {
  const server = new ApolloServer({
    schema: mergeSchemas({
      schemas: await createRemoteSchemas(),
    }),
    context: ({ req, connection }): Context => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const headers: { [key: string]: any } =
        (connection && connection.context) || (req && req.headers) || {}
      const isFromService =
        headers['x-service-secret'] === process.env.SERVICE_SECRET

      return {
        req,
        connection,
        isFromService,
        user: isFromService
          ? createUserContext(headers)
          : createUserContextByAuth(headers),
      }
    },
    debug,
  })

  server
    .listen({
      port:
        process.env.PORT || process.env.STITCHING_GATEWAY_ENDPOINT_PORT || 8080,
    })
    .then(({ url }) => {
      console.log(`🚀 Server ready at ${url}`)
    })
}
main()
