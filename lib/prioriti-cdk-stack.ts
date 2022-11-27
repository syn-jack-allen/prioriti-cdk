import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { join } from 'path';
import { PrioritiStackProps } from '../src/interface';

export class PrioritiCdkStack extends Stack {
  constructor(scope: Construct, id: string, props: PrioritiStackProps) {
    super(scope, id, props);

    const helloWorldLambdaProps = props.helloWorldLambda;
    const helloWorldLambda = new Function(this, 'HelloWorldLambda', {
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromAsset(join(__dirname, '..', helloWorldLambdaProps.code)),
      handler: helloWorldLambdaProps.handler
    });
  }
}
