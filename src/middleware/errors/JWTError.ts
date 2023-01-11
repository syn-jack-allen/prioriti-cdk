/**
 * For when the JWT token is invalid in some way.
 * This error can form a base error for other cases.
 */
export class JWTInvalidTokenError extends Error {
  token: string;

  constructor(token: string, message?: string) {
    super(message || 'The given token is invalid');
    this.name = 'JWTInvalidTokenError';
    this.token = token;
  }
}

/**
 * For when the JWT token does not contain all the required permissions
 */
export class JWTMatchError extends JWTInvalidTokenError {
  expectedPermissions: string[];

  receivedPermissions: string[];

  constructor(
    token: string,
    expectedPermissions: string[],
    receivedPermissions: string[]
  ) {
    super(
      token,
      'The given token does not contain all of the expected permissions'
    );
    this.name = 'JWTMatchError';
    this.expectedPermissions = expectedPermissions;
    this.receivedPermissions = receivedPermissions;
  }
}

/**
 * For when the JWT token cannot be found
 */
export class JWTTokenNotFoundError extends Error {
  constructor() {
    super('Missing JWT token');
  }
}

/**
 * The error to throw to the client.
 *
 * When a JWT error occurs, throw this error for error handling middlewares.
 */
export class JWTHttpError extends Error {
  statusCode: number;

  cause: Error;

  constructor(statusCode: number, message: string, cause: Error) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'JWTError';
    this.cause = cause;
  }
}
