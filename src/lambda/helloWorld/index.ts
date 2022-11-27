import middy from '@middy/core';
import { APIGatewayEvent, Context } from 'aws-lambda';

async function baseHandler(event: APIGatewayEvent, context: Context) {
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
