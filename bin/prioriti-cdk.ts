#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { PrioritiCdkStack } from '../lib/prioriti-cdk-stack';
import AppBuilder from '../src/appBuilder';
import { readYaml } from '../src/helpers';
import { PrioritiStackProps } from '../src/interface';

const config: any = readYaml('config/defaults.yaml');

new PrioritiCdkStack(new App(), 'PrioritiStack', config as PrioritiStackProps);
