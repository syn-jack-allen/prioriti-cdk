#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { PrioritiStackProps } from '../lib/interface';
import { PrioritiCdkStack } from '../lib/prioriti-cdk-stack';
import { readYaml } from '../src/helpers';

const config: any = readYaml('config/defaults.yaml');

new PrioritiCdkStack(new App(), 'PrioritiStack', {
  ...config,
  env: { account: '094778403647', region: 'eu-west-2' }
} as PrioritiStackProps);
