import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
export const getAllTodoEvent: APIGatewayProxyEventV2WithJWTAuthorizer = {
  version: '2.0',
  routeKey: 'GET /todo',
  rawPath: '/dev/todo',
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
      method: 'GET',
      path: '/dev/todo',
      protocol: 'HTTP/1.1',
      sourceIp: '',
      userAgent: ''
    },
    requestId: '',
    routeKey: 'GET /todo',
    stage: 'dev',
    time: '',
    timeEpoch: 0
  },
  isBase64Encoded: false,
  pathParameters: {},
  queryStringParameters: {}
};
