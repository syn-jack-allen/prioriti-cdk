import middy from '@middy/core';
import { APIGatewayEvent, Context } from 'aws-lambda';

export async function baseHandler(event: APIGatewayEvent, context: Context) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: 'Hello callers!', event })
  };
}

export const handler = middy(baseHandler);
