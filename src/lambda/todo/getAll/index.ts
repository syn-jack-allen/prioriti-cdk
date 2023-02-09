import middy from '@middy/core';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpResponseSerializer from '@middy/http-response-serializer';
import validator from '@middy/validator';
import { APIGatewayProxyEventV2WithJWTAuthorizer, Context } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import responseSchema from '../../../../api/getAllTodo-response.json';
import { logger } from '../../../constants';
import { GetAllTodoResponse } from '../../../interfaces/Todo';
import { errorHandler } from '../../../middleware/errorHandler';
import { httpLogger } from '../../../middleware/httpLogger';
import { HttpError } from '../../errors';
import isUserId from '../isUserId';
import { TodoProvider } from '../todo';
import { getEnvironmentVars } from './getEnvironmentVars';

const dynamodb = new DynamoDB({ apiVersion: '2012-08-10' });
const envVars = getEnvironmentVars();
const todoProvider = new TodoProvider(dynamodb, envVars.TODO_TABLE_NAME);

async function baseHandler(
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
  context: Context
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
  .use(validator({ responseSchema, ajvOptions: { coerceTypes: true } }));

export default baseHandler;
export { handler };
