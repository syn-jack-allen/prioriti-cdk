import middy from '@middy/core';
import { sign } from 'jsonwebtoken';
import { jwtAuth } from '../jwtAuth';

const testToken = sign({ permissions: ['read'] }, 'secret');
const testTokenAllPermissions = sign(
  { permissions: ['read', 'write'] },
  'secret'
);
const testTokenNoPermissions = sign({}, 'secret');

describe('jwtAuth', () => {
  const middleware = jwtAuth({ permissions: ['read', 'write'] });

  test('throws 401 if cannot find token', async () => {
    const request = {
      event: {}
    } as middy.Request;

    expect(() => {
      middleware.before(request);
    }).toThrow(
      expect.objectContaining({
        statusCode: 401,
        message: 'Could not find the JWT token'
      })
    );
  });

  test('throws 401 if token doesnt contain permissions in payload', async () => {
    const request = {
      event: {
        headers: {
          Authorization: `Bearer ${testTokenNoPermissions}`
        }
      }
    } as middy.Request;

    expect(() => {
      middleware.before(request);
    }).toThrow(
      expect.objectContaining({
        statusCode: 401,
        message: 'The JWT token is invalid',
        cause: expect.objectContaining({ token: testTokenNoPermissions })
      })
    );
  });

  test('throws 403 if token is missing a required permission', async () => {
    const request = {
      event: {
        headers: {
          Authorization: `Bearer ${testToken}`
        }
      }
    } as middy.Request;

    expect(() => {
      middleware.before(request);
    }).toThrow(
      expect.objectContaining({
        statusCode: 403,
        message: 'The JWT token does not have the correct permissions',
        cause: expect.objectContaining({
          token: testToken,
          expectedPermissions: ['read', 'write'],
          receivedPermissions: ['read']
        })
      })
    );
  });
  test('does not throw if token has all required permissions', async () => {
    const request = {
      event: {
        headers: {
          Authorization: `Bearer ${testTokenAllPermissions}`
        }
      }
    } as middy.Request;

    expect(() => {
      middleware.before(request);
    }).not.toThrow();
  });
});
