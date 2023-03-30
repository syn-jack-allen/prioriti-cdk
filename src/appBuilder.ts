import { App } from 'aws-cdk-lib';
import { join } from 'path';
import { PrioritiStackProps } from '../lib/interface';
import { PrioritiCdkStack } from '../lib/prioriti-cdk-stack';
import { readYaml } from './helpers';

interface IAppBuilderOptions {
  configDirectory: string;
  prodConfigFile: string;
  devConfigFile: string;
}

const defaultOptions: IAppBuilderOptions = {
  configDirectory: './config',
  prodConfigFile: 'prod.yaml',
  devConfigFile: 'dev.yaml'
};

export default class {
  app: App;

  private options: IAppBuilderOptions;

  constructor(options?: IAppBuilderOptions) {
    this.app = new App();
    this.options = { ...defaultOptions, ...options };
  }

  getConfig() {
    const config = readYaml(
      join(this.options.configDirectory, this.options.prodConfigFile)
    );

    return config;
  }

  build(props: PrioritiStackProps) {
    new PrioritiCdkStack(this.app, 'PrioritiCdkStack', props);
  }
}
