// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'express'
import { Context, UserContext } from './context'

export { Context, UserContext } from './context'
// export { Context } from './context'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare type HeadersProvider = (
  context: Context,
) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
{ [key: string]: any }

export function createUserHeaders(context: Context) {
  const headers = {}
  if (context && context.user) {
    const { id, role } = context.user
    /**
     * If header is set to undefined, it will converted to string "undefined".
     * So services will receive headers whose value is "undefined" as string.
     * To prevent it, truthiness check is needed.
     */
    if (id) {
      headers['x-user-id'] = id
    }
    if (role) {
      headers['x-user-role'] = role
    }
  }
  return headers
}

export function createUserContext(headers: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}): UserContext {
  if (headers) {
    return {
      id: headers['x-user-id'] as string,
      role: headers['x-user-role'] as string,
    }
  }
  return {}
}
