import { Logger } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';
import { serializeError } from 'serialize-error';

interface LoggerOptions {
  logger?: Logger;
}

export const defaultOptions: Required<LoggerOptions> = {
  logger: new Logger()
};

/**
 * Logs any errors to the console.
 * Logs the lambda response (should be called before any serialisation).
 * @param errorHandlerOptions
 * @returns
 */
function httpLogger(errorHandlerOptions?: LoggerOptions) {
  const options: Required<LoggerOptions> = {
    ...defaultOptions,
    ...errorHandlerOptions
  };

  const before = (request: middy.Request) => {
    options.logger.info('Incoming event and context', {
      event: request.event,
      context: request.context
    });
  };

  const onError = (request: middy.Request) => {
    const error = request.error;
    if (error)
      options.logger.error(error.message, { error: serializeError(error) });

    // log final response to client
    const response = request.response;
    if (response)
      options.logger.info('Final lambda response', {
        headers: response.headers,
        body: response.body
      });
  };

  const after = (request: middy.Request) => {
    // log final response to client
    const response = request.response;
    if (response)
      options.logger.info('Final lambda response', {
        headers: response.headers,
        body: response.body
      });
  };

  return {
    before,
    onError,
    after
  };
}

export { httpLogger };
