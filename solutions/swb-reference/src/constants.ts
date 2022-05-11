import yaml from 'js-yaml';
import fs from 'fs';
import { join } from 'path';

function getConstants(): {
  STAGE: string;
  STACK_NAME: string;
  PORTFOLIO_NAME: string;
  AWS_REGION: string;
  SSM_DOC_NAME_SUFFIX: string;
  S3_ARTIFACT_BUCKET_ARN_NAME: string;
  MAIN_ACCOUNT_BUS_ARN_NAME: string;
  S3_ARTIFACT_BUCKET_SC_PREFIX: string;
  LAUNCH_CONSTRAINT_ROLE_NAME: string;
  AMI_IDS_TO_SHARE: string;
  ROOT_USER_EMAIL: string;
  USER_POOL_NAME: string;
  EXTERNAL_ID: string;
} {
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
  const ROOT_USER_EMAIL = config.rootUserEmail;
  const USER_POOL_NAME = `swb-${config.stage}-${config.awsRegionShortName}`;

  // external id used to establish trust relationship with hosting account
  const EXTERNAL_ID = config.externalId;

  const AMI_IDS: string[] = [];

  // These are the OutputKey for the SWB Main Account CFN stack
  const MAIN_ACCOUNT_BUS_ARN_NAME = 'EventBusOutput';
  const SSM_DOC_NAME_SUFFIX = 'SSMDocOutput';
  const S3_ARTIFACT_BUCKET_ARN_NAME = 'S3BucketArtifactsArnOutput';
  const LAUNCH_CONSTRAINT_ROLE_NAME = 'LaunchConstraintIamRoleNameOutput';

  return {
    STAGE: config.stage,
    STACK_NAME,
    PORTFOLIO_NAME,
    AWS_REGION,
    SSM_DOC_NAME_SUFFIX,
    S3_ARTIFACT_BUCKET_ARN_NAME,
    MAIN_ACCOUNT_BUS_ARN_NAME,
    S3_ARTIFACT_BUCKET_SC_PREFIX,
    LAUNCH_CONSTRAINT_ROLE_NAME,
    AMI_IDS_TO_SHARE: JSON.stringify(AMI_IDS),
    ROOT_USER_EMAIL,
    USER_POOL_NAME,
    EXTERNAL_ID
  };
}

export { getConstants };
