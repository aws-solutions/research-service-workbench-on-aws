import fs from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

function getConstants(): {
  STAGE: string;
  STACK_NAME: string;
  SC_PORTFOLIO_NAME: string;
  AWS_REGION: string;
  SSM_DOC_NAME_SUFFIX: string;
  S3_ARTIFACT_BUCKET_ARN_NAME: string;
  S3_ARTIFACT_BUCKET_SC_PREFIX: string;
  LAUNCH_CONSTRAINT_ROLE_NAME: string;
  AMI_IDS_TO_SHARE: string;
  ROOT_USER_EMAIL: string;
  USER_POOL_NAME: string;
  STATUS_HANDLER_ARN_NAME: string;
  ALLOWED_ORIGINS: string;
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: any = yaml.load(
    // __dirname is a variable that reference the current directory. We use it so we can dynamically navigate to the
    // correct file
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(join(__dirname, `../src/config/${process.env.STAGE}.yaml`), 'utf8') // nosemgrep
  );

  const STACK_NAME = `swb-${config.stage}-${config.awsRegionShortName}`;
  const SC_PORTFOLIO_NAME = `swb-${config.stage}-${config.awsRegionShortName}`; // Service Catalog Portfolio Name
  const AWS_REGION = config.awsRegion;
  const S3_ARTIFACT_BUCKET_SC_PREFIX = 'service-catalog-cfn-templates/';
  const ROOT_USER_EMAIL = config.rootUserEmail;
  const USER_POOL_NAME = `swb-${config.stage}-${config.awsRegionShortName}`;

  const AMI_IDS: string[] = [];

  // These are the OutputKey for the SWB Main Account CFN stack
  const SSM_DOC_NAME_SUFFIX = 'SSMDocOutput';
  const S3_ARTIFACT_BUCKET_ARN_NAME = 'S3BucketArtifactsArnOutput';
  const LAUNCH_CONSTRAINT_ROLE_NAME = 'LaunchConstraintIamRoleNameOutput';
  const STATUS_HANDLER_ARN_NAME = 'StatusHandlerLambdaArnOutput';

  return {
    STAGE: config.stage,
    STACK_NAME,
    SC_PORTFOLIO_NAME,
    AWS_REGION,
    SSM_DOC_NAME_SUFFIX,
    S3_ARTIFACT_BUCKET_ARN_NAME,
    S3_ARTIFACT_BUCKET_SC_PREFIX,
    LAUNCH_CONSTRAINT_ROLE_NAME,
    AMI_IDS_TO_SHARE: JSON.stringify(AMI_IDS),
    ROOT_USER_EMAIL,
    USER_POOL_NAME,
    STATUS_HANDLER_ARN_NAME,
    ALLOWED_ORIGINS: JSON.stringify(config.allowedOrigins)
  };
}

export { getConstants };
