import { AwsService } from '@aws/workbench-core-base';

export const aws: AwsService = new AwsService({
  region: process.env.AWS_REGION!,
  ddbTableName: process.env.STACK_NAME!
});
