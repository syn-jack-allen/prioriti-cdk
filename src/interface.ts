import { StackProps } from 'aws-cdk-lib';

export interface PrioritiLambdaProps {
  code: string;
  handler: string;
  // seconds until lambda times out
  timeout?: number;
}

export interface PrioritiStackProps extends StackProps {
  helloWorldLambda: PrioritiLambdaProps;
}
