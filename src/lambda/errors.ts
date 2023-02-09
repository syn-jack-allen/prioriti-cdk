export class HttpError extends Error {
  statusCode: number;

  cause: Error | undefined;

  expose: boolean;

  constructor(statusCode: number, msg: string, cause?: Error) {
    super(msg);

    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.cause = cause;
  }
}
