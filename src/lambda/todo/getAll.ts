import middy from '@middy/core';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpResponseSerializer from '@middy/http-response-serializer';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import responseSchema from '../../../api/getAllTodo-response.json';
import { logger } from '../../constants';
import { dynamodbClient } from '../../dynamodbClient';
import { GetAllTodoResponse } from '../../interfaces/Todo';
import { errorHandler } from '../../middleware/errorHandler';
import { httpLogger } from '../../middleware/httpLogger';
import { HttpError } from '../errors';
import { getEnvironmentVars } from './getEnvironmentVars';
import isUserId from './isUserId';
import { TodoProvider } from './todo';

const { TODO_TABLE_NAME } = getEnvironmentVars();
const todoProvider = new TodoProvider(dynamodbClient, TODO_TABLE_NAME);

async function baseHandler(
  event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<GetAllTodoResponse> {
  const userId = event.requestContext.authorizer.jwt.claims.sub;

  if (!isUserId(userId))
    throw new HttpError(401, 'Unable to authenticate user');

  const results = await todoProvider.getAllTodo(userId);

  return {
    statusCode: 200,
    body: {
      results,
      pageNumber: 1,
      pageSize: results.length || 1,
      totalResults: results.length
    }
  };
}

const handler = middy(baseHandler)
  // parses JSON string from JS object body
  .use(
    httpResponseSerializer({
      serializers: [
        {
          regex: /^application\/json$/,
          serializer: ({ body }) => JSON.stringify(body)
        }
      ],
      defaultContentType: 'application/json'
    })
  )
  // ensures pathParameters, queryStringParameters properties exist on the event
  .use(httpEventNormalizer())
  // normalizes all headers to Canonical-Format
  .use(httpHeaderNormalizer())
  .use(httpLogger({ logger }))
  .use(errorHandler())
  .use(validator({ responseSchema: transpileSchema(responseSchema) }));

export default baseHandler;
export { handler };
