/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */
import { ApolloGateway, GatewayConfig } from '@apollo/gateway'
import loglevel, { Logger } from 'loglevel'
import loglevelDebug from 'loglevel-debug'
import delay from 'delay'

export class DevApolloGateway extends ApolloGateway {
  public get logger_() {
    return this.logger
  }

  protected customLogger: Logger

  constructor(config?: GatewayConfig) {
    super(config)

    // Setup logging facilities, scoped under the appropriate name.
    this.customLogger = loglevel.getLogger(`apollo-gateway::`)

    // Support DEBUG environment variable, à la https://npm.im/debug/.
    loglevelDebug(this.customLogger)

    // And also support the `debug` option, if it's truthy.
    if (this.config.debug === true) {
      this.customLogger.enableAll()
    }

    this.logger_.info = arg => {
      if (!arg.includes('Gateway successfully loaded schema')) {
        this.customLogger.info(arg)
      }
    }
    const debugLogBlackList = [
      'No change in service definitions since last check',
      'Loading configuration for gateway',
    ]
    this.logger_.debug = arg => {
      if (
        debugLogBlackList
          .map(sentence => !arg.includes(sentence))
          .reduce((previous, current) => previous && current)
      ) {
        this.customLogger.debug(arg)
      }
    }

    const pollSchemas = async () => {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        await delay(500)
        this.load()
      }
    }
    pollSchemas()
  }
}
