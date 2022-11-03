#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PrioritiCdkStack } from '../lib/prioriti-cdk-stack';

const app = new cdk.App();
new PrioritiCdkStack(app, 'PrioritiCdkStack');
