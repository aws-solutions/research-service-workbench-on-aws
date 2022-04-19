/* eslint-disable security/detect-non-literal-fs-filename */
import { ServiceCatalogSetup } from '@amzn/environments';
import { getConstants } from './constants';
import { join } from 'path';
async function run(): Promise<void> {
  const {
    AWS_REGION,
    S3_ARTIFACT_BUCKET_SC_PREFIX,
    PORTFOLIO_NAME,
    S3_ARTIFACT_BUCKET_ARN_NAME,
    LAUNCH_CONSTRAINT_ROLE_NAME,
    STACK_NAME
  } = getConstants();
  const scSetup = new ServiceCatalogSetup({
    AWS_REGION,
    S3_ARTIFACT_BUCKET_SC_PREFIX,
    PORTFOLIO_NAME,
    S3_ARTIFACT_BUCKET_ARN_NAME,
    LAUNCH_CONSTRAINT_ROLE_NAME,
    STACK_NAME
  });

  const cfnFilePaths: string[] = scSetup.getCfnTemplate(join(__dirname, '../src/environment'));
  await scSetup.run(cfnFilePaths);

  //TODO: Upload `onboard-account.cfn.yml` to S3
}

/* eslint-disable-next-line @typescript-eslint/no-floating-promises*/
(async (): Promise<void> => {
  await run();
})();
