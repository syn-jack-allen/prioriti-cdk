import middy from '@middy/core';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpResponseSerializer from '@middy/http-response-serializer';
import validator from '@middy/validator';
import { APIGatewayProxyEventV2WithJWTAuthorizer, Context } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import eventSchema from '../../../../api/postTodo-event.json';
import { logger } from '../../../constants';
import { PostTodoResponse, Todo } from '../../../interfaces/Todo';
import { errorHandler } from '../../../middleware/errorHandler';
import { httpLogger } from '../../../middleware/httpLogger';
import { HttpError } from '../../errors';
import isUserId from '../isUserId';
import { TodoProvider } from '../todo';
import { getEnvironmentVars } from './getEnvironmentVars';

const dynamodb = new DynamoDB({ apiVersion: '2012-08-10' });
const envVars = getEnvironmentVars();
const todoProvider = new TodoProvider(dynamodb, envVars.TODO_TABLE_NAME);

interface RequestBody {
  summary: string;
  deadline: string;
  color?: string;
  description?: string;
}

async function baseHandler(
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
  context: Context
): Promise<PostTodoResponse> {
  const userId = event.requestContext.authorizer.jwt.claims.sub;

  if (!isUserId(userId))
    throw new HttpError(401, 'Unable to authenticate user');

  const todoId = uuid();

  // event body is pre-validated
  const body = (event.body || {}) as RequestBody;

  // TODO check number of todo items a user has

  const todo: Todo = {
    id: todoId,
    summary: body.summary,
    description: body.description || '',
    deadline: body.deadline,
    color: body.color || 'red'
  };

  try {
    await todoProvider.postTodo(userId, todo);

    logger.info(`Created new todo with id ${todoId} for ${userId}`);

    return {
      statusCode: 200,
      body: {
        todoId
      }
    };
  } catch (error) {
    // for TS's sake
    if (!(error instanceof Error)) throw error;

    if (error.name === 'TransactionCanceledException')
      throw new HttpError(
        402,
        'You have reached the maximum number of todo items',
        error
      );

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
  .use(validator({ eventSchema }))
  .use(httpLogger({ logger }))
  .use(errorHandler());

export default baseHandler;
export { handler };
