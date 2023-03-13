import { Logger } from '@aws-lambda-powertools/logger';

export const logger = new Logger({
  serviceName: 'API',
  logLevel: 'DEBUG',
  persistentLogAttributes: {
    // persistent attributes to appear in every log
  }
});
