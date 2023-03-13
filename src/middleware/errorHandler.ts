import middy from '@middy/core';

interface HttpError extends Error {
  statusCode: number;
  expose?: boolean;
}

interface ErrorHandlerOptions {
  // the message that is displayed if the underlying error message shouldn't be exposed
  fallbackMessage?: string;
}

export const defaultOptions: Required<ErrorHandlerOptions> = {
  fallbackMessage: 'An unexpected error occurred'
};

const isHttpError = (error: Error): error is HttpError => 'statusCode' in error;

/**
 * This middleware handles any errors that occur in the middleware stack by formatting
 * the error into a response appropriate for the client.
 *
 * The response error message depends on the original error thrown.
 *
 * For HTTP errors - defined as errors with a `statusCode` property - the error message
 * is the same as the original error message and the status code is set to the `statusCode`
 * property of the error.
 *
 * For non-HTTP errors such as unexpected runtime errors, the status code is set to 500
 * and a generic error message is returned. This defaults to 'An unexpected error
 * occurred' which is configurable in the options.
 *
 * To use the original error message of a non-HTTP error, make sure the error has
 * an `expose` property set to true.
 * @param errorHandlerOptions The options for this middleware
 * @returns
 */
function errorHandler(errorHandlerOptions?: ErrorHandlerOptions) {
  const options: Required<ErrorHandlerOptions> = {
    ...defaultOptions,
    ...errorHandlerOptions
  };

  const onError = (request: middy.Request) => {
    // the default error response
    const errorResponse = {
      error: {
        message: options.fallbackMessage
      }
    };
    let statusCode = 500;

    const error = request.error;

    if (error && isHttpError(error)) {
      statusCode = error.statusCode;

      if (error.statusCode < 500 || error.expose)
        errorResponse.error.message = error.message;
    }

    request.response = {
      statusCode,
      body: errorResponse
    };
  };

  return {
    onError
  };
}

export { errorHandler };
