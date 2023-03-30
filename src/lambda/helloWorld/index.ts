import middy from '@middy/core';
import { APIGatewayEvent } from 'aws-lambda';

async function baseHandler(event: APIGatewayEvent) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: 'Hello caller!', event })
  };
}

const handler = middy(baseHandler);

export default baseHandler;
export { handler };
