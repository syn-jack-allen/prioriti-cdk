import middy from '@middy/core';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpResponseSerializer from '@middy/http-response-serializer';
import {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2,
  Context
} from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { logger } from '../../../constants';
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
): Promise<APIGatewayProxyStructuredResultV2> {
  const userId = event.requestContext.authorizer.jwt.claims.sub;

  if (!isUserId(userId))
    throw new HttpError(401, 'Unable to authenticate user');

  const todoId = event.pathParameters?.todoId;

  if (!todoId) throw new HttpError(404, 'Unable to get todo ID');

  try {
    await todoProvider.deleteTodo(userId, todoId);
  } catch (error) {
    // for TS's sake
    if (!(error instanceof Error)) throw error;

    // don't throw cancelled transaction errors
    if (error.name !== 'TransactionCanceledException') throw error;
  }

  return {
    statusCode: 200
  };
}

const handler = middy(baseHandler)
  // ensures pathParameters, queryStringParameters properties exist on the event
  .use(httpEventNormalizer())
  // parses JSON from string body
  .use(jsonBodyParser())
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
  // normalizes all headers to Canonical-Format
  .use(httpHeaderNormalizer())
  .use(errorHandler())
  .use(httpLogger({ logger }));

export default baseHandler;
export { handler };
