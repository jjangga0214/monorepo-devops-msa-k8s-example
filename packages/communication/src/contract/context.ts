// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'express'
import { ExecutionParams } from 'subscriptions-transport-ws'

export declare interface UserContext {
  id?: string | undefined
  role?: string | undefined
}

export declare interface Context {
  req?: Request
  connection?: ExecutionParams
  user: UserContext
  isFromService?: boolean
}
