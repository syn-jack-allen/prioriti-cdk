import { StackProps } from 'aws-cdk-lib';

export interface PrioritiLambdaProps {
  id: string;
  description: string;
  handler: string;
  entry: string;
  timeout: number;
  memorySize: number;
}

export interface ApiGatewayProps {
  jwtIssuer: string;
  allowOrigins: string[];
}

export interface PrioritiStackProps extends StackProps {
  helloWorldLambda: PrioritiLambdaProps;
  getTodoLambdaProps: PrioritiLambdaProps;
  getAllTodoLambdaProps: PrioritiLambdaProps;
  deleteTodoLambdaProps: PrioritiLambdaProps;
  postTodoLambdaProps: PrioritiLambdaProps;
  putTodoLambdaProps: PrioritiLambdaProps;
  apiGateway: ApiGatewayProps;
}
