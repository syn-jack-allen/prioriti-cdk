import middy from '@middy/core';
import { GetTodoResponse } from './../../../interfaces/Todo';
import { APIGatewayEvent, Context } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import httpResponseSerializer from '@middy/http-response-serializer';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpEventNormalizer from '@middy/http-event-normalizer';
import { errorHandler } from '../../../middleware/errorHandler';
import { httpLogger } from '../../../middleware/httpLogger';
import { logger } from '../../../constants';
import responseSchema from '../../../../api/getTodo-response.json';
import validator from '@middy/validator';

async function baseHandler(
  event: APIGatewayEvent,
  context: Context
): Promise<GetTodoResponse> {
  return {
    statusCode: 200,
    body: {
      data: {
        id: uuid(),
        summary: 'A test summary object with all other fields',
        description:
          'Here is a description. These tend to be rather long and will have the potential to support rich text for formatting',
        deadline: '2023-03-25',
        color: 'red'
      }
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
  .use(validator({ responseSchema }))

  .use(errorHandler())
  .use(httpLogger({ logger }));

export default baseHandler;
export { handler };
