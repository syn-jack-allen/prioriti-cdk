#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { PrioritiCdkStack } from '../lib/prioriti-cdk-stack';
import AppBuilder from '../src/appBuilder';
import { readYaml } from '../src/helpers';
import { PrioritiStackProps } from '../lib/interface';

const config: any = readYaml('config/defaults.yaml');

new PrioritiCdkStack(new App(), 'PrioritiStack', {
  ...config,
  env: { account: '094778403647', region: 'eu-west-2' }
} as PrioritiStackProps);
