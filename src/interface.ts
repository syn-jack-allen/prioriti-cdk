import { StackProps } from "aws-cdk-lib";

export default interface PriorityStackProps extends StackProps {
  prioritiCdkQueue: {
    visibilityTimeout: number;
  };
}
