import { Context, UserContext } from './context'

export { Context, UserContext } from './context'

export declare type HeadersProvider = (
  context: Context | undefined,
) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
{ [key: string]: any }

export function createUserHeaders(context: Context | undefined) {
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
