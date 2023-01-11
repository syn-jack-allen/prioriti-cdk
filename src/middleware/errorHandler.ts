import middy from '@middy/core';

interface HttpError extends Error {
  statusCode: number;
  expose?: boolean;
}

interface ErrorLogger {
  error: (msg: string, err: Error) => void;
}

interface ErrorHandlerOptions {
  // the message that is displayed if the underlying error message shouldn't be exposed
  fallbackMessage?: string;
}

export const defaultOptions: Required<ErrorHandlerOptions> = {
  fallbackMessage: 'An unexpected error occurred'
};

const isHttpError = (error: Error): error is HttpError => 'statusCode' in error;

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
