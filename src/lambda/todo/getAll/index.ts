import middy from '@middy/core';
import { APIGatewayEvent, Context } from 'aws-lambda';
import { GetAllTodoResponse } from '../../../interfaces/Todo';
import { v4 as uuid } from 'uuid';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import { errorHandler } from '../../../middleware/errorHandler';
import httpResponseSerializer from '@middy/http-response-serializer';
import httpEventNormalizer from '@middy/http-event-normalizer';
import { httpLogger } from '../../../middleware/httpLogger';
import { logger } from '../../../constants';
import validator from '@middy/validator';
import responseSchema from '../../../../api/getAllTodo-response.json';

async function baseHandler(
  event: APIGatewayEvent,
  context: Context
): Promise<GetAllTodoResponse> {
  return {
    statusCode: 200,
    body: {
      results: [
        {
          id: uuid(),
          summary: 'A test summary object with all other fields',
          description:
            'Here is a description. These tend to be rather long and will have the potential to support rich text for formatting',
          deadline: '2023-03-25',
          color: 'red'
        },
        {
          id: uuid(),
          summary: 'A test summary object with an empty description',
          description: '',
          deadline: '2023-03-22',
          color: 'red'
        },
        {
          id: uuid(),
          summary: 'Another summary',
          description: 'Another shorter description',
          deadline: '2023-04-12',
          color: ''
        },
        {
          id: uuid(),
          summary: 'A test summary object with no colour',
          description: '',
          deadline: '2023-01-16',
          color: 'blue'
        },
        {
          id: uuid(),
          summary: 'Shopping',
          description: 'Need to pickup toothpaste',
          deadline: '2023-01-10',
          color: 'green'
        }
      ],
      pageNumber: 1,
      pageSize: 5,
      totalResults: 13
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
