// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'express'

export declare interface UserContext {
  id?: string | undefined
  role?: string | undefined
}

export declare interface Context {
  req: Request
  user: UserContext
  isFromService?: boolean
}
