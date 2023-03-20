import middy from '@middy/core';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpResponseSerializer from '@middy/http-response-serializer';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import { APIGatewayProxyEventV2WithJWTAuthorizer, Context } from 'aws-lambda';
import eventSchema from '../../../api/putTodo-event.json';
import { logger } from '../../constants';
import { dynamodbClient } from '../../dynamodbClient';
import { PutTodoResponse } from '../../interfaces/Todo';
import { errorHandler } from '../../middleware/errorHandler';
import { httpLogger } from '../../middleware/httpLogger';
import { HttpError } from '../errors';
import { getEnvironmentVars } from './getEnvironmentVars';
import isUserId from './isUserId';
import { TodoProvider } from './todo';

interface RequestBody {
  summary?: string;
  deadline?: string;
  color?: string;
  description?: string;
}

const { TODO_TABLE_NAME } = getEnvironmentVars();
const todoProvider = new TodoProvider(dynamodbClient, TODO_TABLE_NAME);

async function baseHandler(
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
  context: Context
): Promise<PutTodoResponse> {
  const userId = event.requestContext.authorizer.jwt.claims.sub;

  if (!isUserId(userId))
    throw new HttpError(401, 'Unable to authenticate user');

  const todoId = event.pathParameters?.todoId;

  if (!todoId) throw new HttpError(400, 'Unable to get todo ID');

  // event body is pre-validated
  const body = (event.body || {}) as RequestBody;

  try {
    const todo = await todoProvider.putTodo(userId, todoId, body);

    return {
      statusCode: 200,
      body: {
        data: todo
      }
    };
  } catch (error) {
    // for TS's sake
    if (!(error instanceof Error)) throw error;

    if (error.name === 'ConditionalCheckFailedException')
      throw new HttpError(404, 'There is no todo item with that ID', error);

    throw error;
  }
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
  // parses JSON from string body
  .use(jsonBodyParser())
  // normalizes all headers to Canonical-Format
  .use(httpHeaderNormalizer())
  .use(validator({ eventSchema: transpileSchema(eventSchema) }))
  .use(errorHandler())
  .use(httpLogger({ logger }));

export default baseHandler;
export { handler };
