import middy from '@middy/core';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpResponseSerializer from '@middy/http-response-serializer';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import eventSchema from '../../../api/postTodo-event.json';
import { logger } from '../../constants';
import { dynamodbClient } from '../../dynamodbClient';
import { PostTodoResponse, Todo } from '../../interfaces/Todo';
import { errorHandler } from '../../middleware/errorHandler';
import { httpLogger } from '../../middleware/httpLogger';
import { HttpError } from '../errors';
import { getEnvironmentVars } from './getEnvironmentVars';
import isUserId from './isUserId';
import { TodoProvider } from './todo';

const { TODO_TABLE_NAME } = getEnvironmentVars();
const todoProvider = new TodoProvider(dynamodbClient, TODO_TABLE_NAME);

interface RequestBody {
  summary: string;
  deadline: string;
  color?: string;
  description?: string;
}

async function baseHandler(
  event: APIGatewayProxyEventV2WithJWTAuthorizer
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

  await todoProvider.postTodo(userId, todo);

  logger.info(`Created new todo with id ${todoId} for ${userId}`);

  return {
    statusCode: 200,
    body: {
      todoId
    }
  };
}

const handler = middy(baseHandler)
  // normalizes all headers to Canonical-Format
  .use(httpHeaderNormalizer())
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
  .use(validator({ eventSchema: transpileSchema(eventSchema) }))
  .use(httpLogger({ logger }))
  .use(errorHandler());

export default baseHandler;
export { handler };
