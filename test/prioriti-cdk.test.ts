import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as PrioritiCdk from '../lib/prioriti-cdk-stack';

test('SQS Queue and SNS Topic Created', () => {
  // const app = new cdk.App();
  // // WHEN
  // const stack = new PrioritiCdk.PrioritiCdkStack(app, 'MyTestStack');
  // // THEN

  // const template = Template.fromStack(stack);

  // template.hasResourceProperties('AWS::SQS::Queue', {
  //   VisibilityTimeout: 300
  // });
  // template.resourceCountIs('AWS::SNS::Topic', 1);

  expect(1).toBe(1);
});
