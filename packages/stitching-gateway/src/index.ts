import { ApolloServer, mergeSchemas } from 'apollo-server'
import { verify } from 'jsonwebtoken'
import {
  createUserContext,
  UserContext,
  Context,
} from '@jjangga0214/communication'
import createRemoteSchemas from './remote-schema'

const debug = process.env.NODE_ENV === 'development'

async function main() {
  const server = new ApolloServer({
    schema: mergeSchemas({
      schemas: await createRemoteSchemas(),
    }),
    context: ({ req }): Context => {
      const isFromService =
        req.headers['x-service-secret'] === process.env.SERVICE_SECRET
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let user: UserContext = {}
      if (isFromService) {
        user = createUserContext(req)
      } else {
        const token = req.headers.authorization
          ? req.headers.authorization.replace('Bearer ', '').trim()
          : null
        if (token) {
          const VerifiedToken = verify(token, process.env.AUTH_SECRET)
          user = VerifiedToken.user
        }
      }

      return {
        req,
        isFromService,
        user,
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
