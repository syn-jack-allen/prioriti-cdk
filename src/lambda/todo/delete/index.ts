import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpResponseSerializer from '@middy/http-response-serializer';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import {
  APIGatewayEvent,
  Context,
  APIGatewayProxyStructuredResultV2
} from 'aws-lambda';
import { errorHandler } from '../../../middleware/errorHandler';
import { httpLogger } from '../../../middleware/httpLogger';
import { logger } from '../../../constants';

async function baseHandler(
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyStructuredResultV2> {
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
