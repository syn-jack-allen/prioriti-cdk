import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import PriorityStackProps from '../src/interface';

export class PrioritiCdkStack extends Stack {
  constructor(scope: Construct, id: string, props: PriorityStackProps) {
    super(scope, id, props);

    const queue = new Queue(this, 'PrioritiCdkQueue', {
      visibilityTimeout: Duration.seconds(
        props.prioritiCdkQueue.visibilityTimeout
      )
    });

    const topic = new Topic(this, 'PrioritiCdkTopic');

    topic.addSubscription(new SqsSubscription(queue));
  }
}
