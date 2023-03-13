import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB({ apiVersion: '2012-08-10' });
export const dynamodbClient = new DynamoDB.DocumentClient({
  service: dynamodb
});
