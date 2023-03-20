import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
export const deleteTodoEvent: APIGatewayProxyEventV2WithJWTAuthorizer = {
  version: '2.0',
  routeKey: 'DELETE /todo/{todoId}',
  rawPath: '/dev/todo/185d1ac8-9587-49b8-8095-4aaa5a7d02cf',
  rawQueryString: '',
  headers: {
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br',
    authorization: '',
    'content-length': '0',
    host: 'api.prioriti.plus',
    'x-amzn-trace-id': '',
    'x-forwarded-for': '',
    'x-forwarded-port': '443',
    'x-forwarded-proto': 'https'
  },
  requestContext: {
    accountId: '',
    apiId: '',
    authorizer: {
      principalId: '',
      integrationLatency: 0,
      jwt: {
        claims: {
          aud: 'https://api.prioriti.plus',
          azp: '',
          exp: '',
          gty: '',
          iat: '',
          iss: 'https://dev-5k08t45j1chz5c4k.us.auth0.com/',
          sub: 'SPqLVBgJZmhgLCWis6GfxpWctA3fHZKA@clients'
        },
        scopes: []
      }
    },
    domainName: 'api.prioriti.plus',
    domainPrefix: 'api',
    http: {
      method: 'DELETE',
      path: '/dev/todo/185d1ac8-9587-49b8-8095-4aaa5a7d02cf',
      protocol: 'HTTP/1.1',
      sourceIp: '',
      userAgent: ''
    },
    requestId: '',
    routeKey: 'DELETE /todo/{todoId}',
    stage: 'dev',
    time: '',
    timeEpoch: 0
  },
  body: '',
  isBase64Encoded: false,
  pathParameters: {
    todoId: '185d1ac8-9587-49b8-8095-4aaa5a7d02cf'
  },
  queryStringParameters: {}
};
