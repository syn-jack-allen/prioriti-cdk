import middy from '@middy/core';
import { decode, JwtPayload } from 'jsonwebtoken';
import {
  JWTHttpError,
  JWTInvalidTokenError,
  JWTMatchError,
  JWTTokenNotFoundError
} from './errors/JWTError';

enum Match {
  ALL,
  ONE
}

interface HTTPHeaders {
  [name: string]: string | undefined;
}

interface JwtPermissionsPayload extends JwtPayload {
  permissions: string[];
}

export interface JWTAuthOptions {
  permissions?: string[];
  match?: Match;
}

const defaultOptions: Required<JWTAuthOptions> = {
  permissions: [],
  match: Match.ALL
};

function isPermissionsPayload(
  payload: string | JwtPayload | null
): payload is JwtPermissionsPayload {
  return (
    !!payload &&
    typeof payload !== 'string' &&
    Array.isArray(payload.permissions) &&
    payload.permissions.every((permission) => typeof permission === 'string')
  );
}

function jwtAuth(jwtAuthOptions?: JWTAuthOptions) {
  const options: Required<JWTAuthOptions> = {
    ...defaultOptions,
    ...jwtAuthOptions
  };

  const before = (request: middy.Request<{ headers: HTTPHeaders }>) => {
    try {
      // find authorization object key in headers object
      const authorizationKey = Object.keys(request.event.headers || {}).find(
        (key) => /authorization/i.test(key)
      );

      if (!authorizationKey) throw new JWTTokenNotFoundError();

      // get token from Authorization header
      const authorization = request.event.headers[authorizationKey] || '';

      // header is in format 'Bearer xxxtokenxxx'
      const split = authorization.split(' ');
      if (split.length !== 2) throw new JWTTokenNotFoundError();

      const token = split[1];

      // decode payload from JWT token
      const payload = decode(token);

      // ensure payload contains a permissions property
      if (!isPermissionsPayload(payload)) {
        throw new JWTInvalidTokenError(
          token,
          'The token payload does not contain any permissions'
        );
      }

      // finally, check payload contains all required permissions
      if (
        !options.permissions.every((permission) =>
          payload.permissions.includes(permission)
        )
      )
        throw new JWTMatchError(
          token,
          options.permissions,
          payload.permissions
        );
    } catch (error) {
      // wrap our thrown errors as HTTP errors
      // so they can be correctly interpreted by an error handling middleware

      if (error instanceof JWTMatchError) {
        throw new JWTHttpError(
          403,
          'The JWT token does not have the correct permissions',
          error
        );
      }

      if (error instanceof JWTInvalidTokenError) {
        throw new JWTHttpError(401, 'The JWT token is invalid', error);
      }

      if (error instanceof JWTTokenNotFoundError) {
        throw new JWTHttpError(401, 'Could not find the JWT token', error);
      }

      throw error;
    }
  };

  return {
    before
  };
}

export { jwtAuth };
