import yaml from 'js-yaml';
import fs from 'fs';
import { join } from 'path';

function getConstants(): { [key: string]: string } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: any = yaml.load(
    // __dirname is a variable that reference the current directory. We use it so we can dynamically navigate to the
    // correct file
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(join(__dirname, `../src/config/${process.env.STAGE}.yaml`), 'utf8') // nosemgrep
  );

  const STACK_NAME = `swb-${config.stage}-${config.awsRegionShortName}`;
  const PORTFOLIO_NAME = `swb-${config.stage}-${config.awsRegionShortName}`;
  const AWS_REGION = config.awsRegion;
  const S3_ARTIFACT_BUCKET_SC_PREFIX = 'service-catalog-cfn-templates/';

  // These are the OutputKey for the SWB Main Account CFN stack
  const S3_ARTIFACT_BUCKET_ARN_NAME = 'S3BucketArtifactsArnOutput';
  const LAUNCH_CONSTRAINT_ROLE_NAME = 'LaunchConstraintIamRoleNameOutput';

  return {
    STAGE: config.stage,
    STACK_NAME,
    PORTFOLIO_NAME,
    AWS_REGION,
    S3_ARTIFACT_BUCKET_ARN_NAME,
    S3_ARTIFACT_BUCKET_SC_PREFIX,
    LAUNCH_CONSTRAINT_ROLE_NAME
  };
}

export { getConstants };
