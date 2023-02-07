/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import { join } from 'path';
import { AwsService } from '@aws/workbench-core-base';
import yaml from 'js-yaml';

interface Constants {
  STAGE: string;
  STACK_NAME: string;
  SC_PORTFOLIO_NAME: string;
  AWS_REGION: string;
  SSM_DOC_OUTPUT_KEY_SUFFIX: string;
  S3_ACCESS_LOGS_BUCKET_NAME_OUTPUT_KEY: string;
  S3_ACCESS_BUCKET_PREFIX: string;
  S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY: string;
  S3_DATASETS_BUCKET_ARN_OUTPUT_KEY: string;
  S3_ARTIFACT_BUCKET_SC_PREFIX: string;
  S3_ARTIFACT_BUCKET_BOOTSTRAP_PREFIX: string;
  LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY: string;
  AMI_IDS_TO_SHARE: string;
  USER_POOL_CLIENT_NAME: string;
  USER_POOL_NAME: string;
  ACCT_HANDLER_ARN_OUTPUT_KEY: string;
  API_HANDLER_ARN_OUTPUT_KEY: string;
  STATUS_HANDLER_ARN_OUTPUT_KEY: string;
  ALLOWED_ORIGINS: string;
  AWS_REGION_SHORT_NAME: string;
  COGNITO_DOMAIN: string;
  WEBSITE_URLS: string[];
  USER_POOL_ID: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  VPC_ID: string;
  MAIN_ACCT_ENCRYPTION_KEY_ARN_OUTPUT_KEY: string;
  MAIN_ACCT_ALB_ARN_OUTPUT_KEY: string;
  SWB_DOMAIN_NAME_OUTPUT_KEY: string;
  MAIN_ACCT_ALB_LISTENER_ARN_OUTPUT_KEY: string;
  VPC_ID_OUTPUT_KEY: string;
  ALB_SUBNET_IDS: string[];
  ECS_SUBNET_IDS: string[];
  ECS_SUBNET_IDS_OUTPUT_KEY: string;
  ECS_SUBNET_AZS_OUTPUT_KEY: string;
  ALB_INTERNET_FACING: boolean;
  HOSTED_ZONE_ID: string;
  DOMAIN_NAME: string;
  FIELDS_TO_MASK_WHEN_AUDITING: string[];
}

interface SecretConstants {
  ROOT_USER_EMAIL: string;
  DYNAMIC_AUTH_TABLE_NAME: string;
}

//CDK Constructs doesn't support Promises https://github.com/aws/aws-cdk/issues/8273
function getConstants(): Constants {
  const config = getConfig();

  const STACK_NAME = `swb-${config.stage}-${config.awsRegionShortName}`;
  const SC_PORTFOLIO_NAME = `swb-${config.stage}-${config.awsRegionShortName}`; // Service Catalog Portfolio Name
  const AWS_REGION = config.awsRegion;
  const AWS_REGION_SHORT_NAME = config.awsRegionShortName;
  const S3_ACCESS_BUCKET_PREFIX = 'service-workbench-access-log';
  const S3_ARTIFACT_BUCKET_SC_PREFIX = 'service-catalog-cfn-templates/';
  const S3_ARTIFACT_BUCKET_BOOTSTRAP_PREFIX = 'environment-files/'; // Location of env bootstrap scripts in the artifacts bucket
  const allowedOrigins: string[] = config.allowedOrigins || [];
  const USER_POOL_CLIENT_NAME = `swb-client-${config.stage}-${config.awsRegionShortName}`;
  const USER_POOL_NAME = `swb-userpool-${config.stage}-${config.awsRegionShortName}`;
  const COGNITO_DOMAIN = config.cognitoDomain;
  const WEBSITE_URLS = allowedOrigins;
  const USER_POOL_ID = config.userPoolId || '';
  const CLIENT_ID = config.clientId || '';
  const CLIENT_SECRET = config.clientSecret || '';
  const VPC_ID = config.vpcId || '';
  const ALB_SUBNET_IDS = config.albSubnetIds || [];
  const ECS_SUBNET_IDS = config.ecsSubnetIds || [];
  const ALB_INTERNET_FACING = config.albInternetFacing || false;
  const HOSTED_ZONE_ID = config.hostedZoneId || '';
  const DOMAIN_NAME = config.domainName || '';

  const FIELDS_TO_MASK_WHEN_AUDITING: string[] = config.fieldsToMaskWhenAuditing;

  const AMI_IDS: string[] = [];

  // These are the OutputKey for the SWB Main Account CFN stack
  const SSM_DOC_OUTPUT_KEY_SUFFIX = 'SSMDocOutput';
  const S3_ACCESS_LOGS_BUCKET_NAME_OUTPUT_KEY = `${config.stage}-S3BucketAccessLogsNameOutput`;
  const S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY = 'S3BucketArtifactsArnOutput';
  const S3_DATASETS_BUCKET_ARN_OUTPUT_KEY = 'S3BucketDatasetsArnOutput';
  const LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY = 'LaunchConstraintIamRoleNameOutput';
  const ACCT_HANDLER_ARN_OUTPUT_KEY = 'AccountHandlerLambdaRoleOutput';
  const API_HANDLER_ARN_OUTPUT_KEY = 'ApiLambdaRoleOutput';
  const STATUS_HANDLER_ARN_OUTPUT_KEY = 'StatusHandlerLambdaArnOutput';
  const MAIN_ACCT_ENCRYPTION_KEY_ARN_OUTPUT_KEY = 'MainAccountEncryptionKeyOutput';
  const MAIN_ACCT_ALB_ARN_OUTPUT_KEY = 'MainAccountLoadBalancerArnOutput';
  const SWB_DOMAIN_NAME_OUTPUT_KEY = 'SwbDomainNameOutput';
  const MAIN_ACCT_ALB_LISTENER_ARN_OUTPUT_KEY = 'MainAccountLoadBalancerListenerArnOutput';
  const VPC_ID_OUTPUT_KEY = 'SwbVpcIdOutput';
  const ECS_SUBNET_IDS_OUTPUT_KEY = 'SwbEcsSubnetIdsOutput';
  const ECS_SUBNET_AZS_OUTPUT_KEY = 'SwbEcsAzsOutput';

  return {
    STAGE: config.stage,
    STACK_NAME,
    SC_PORTFOLIO_NAME,
    AWS_REGION,
    SSM_DOC_OUTPUT_KEY_SUFFIX,
    S3_ACCESS_LOGS_BUCKET_NAME_OUTPUT_KEY,
    S3_ACCESS_BUCKET_PREFIX,
    S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY,
    S3_DATASETS_BUCKET_ARN_OUTPUT_KEY,
    S3_ARTIFACT_BUCKET_SC_PREFIX,
    S3_ARTIFACT_BUCKET_BOOTSTRAP_PREFIX,
    LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY,
    AMI_IDS_TO_SHARE: JSON.stringify(AMI_IDS),
    USER_POOL_CLIENT_NAME,
    USER_POOL_NAME,
    ALLOWED_ORIGINS: JSON.stringify(allowedOrigins),
    AWS_REGION_SHORT_NAME: AWS_REGION_SHORT_NAME,
    ACCT_HANDLER_ARN_OUTPUT_KEY,
    API_HANDLER_ARN_OUTPUT_KEY,
    STATUS_HANDLER_ARN_OUTPUT_KEY,
    COGNITO_DOMAIN,
    WEBSITE_URLS,
    USER_POOL_ID,
    CLIENT_ID,
    CLIENT_SECRET,
    VPC_ID,
    MAIN_ACCT_ENCRYPTION_KEY_ARN_OUTPUT_KEY,
    MAIN_ACCT_ALB_ARN_OUTPUT_KEY,
    SWB_DOMAIN_NAME_OUTPUT_KEY,
    MAIN_ACCT_ALB_LISTENER_ARN_OUTPUT_KEY,
    VPC_ID_OUTPUT_KEY,
    HOSTED_ZONE_ID,
    DOMAIN_NAME,
    ALB_SUBNET_IDS,
    ECS_SUBNET_IDS,
    ECS_SUBNET_IDS_OUTPUT_KEY,
    ECS_SUBNET_AZS_OUTPUT_KEY,
    ALB_INTERNET_FACING,
    FIELDS_TO_MASK_WHEN_AUDITING
  };
}

async function getConstantsWithSecrets(): Promise<Constants & SecretConstants> {
  const config = getConfig();
  const AWS_REGION = config.awsRegion;
  const awsService = new AwsService({ region: AWS_REGION });
  const rootUserParamStorePath = config.rootUserEmailParamStorePath;

  const ROOT_USER_EMAIL = await getSSMParamValue(awsService, rootUserParamStorePath);
  return { ...getConstants(), ROOT_USER_EMAIL, DYNAMIC_AUTH_TABLE_NAME: getDynamicAuthTableName() };
}

interface Config {
  stage: string;
  awsRegion: string;
  awsRegionShortName: string;
  rootUserEmailParamStorePath: string;
  allowedOrigins: string[];
  cognitoDomain: string;
  userPoolId?: string;
  clientId?: string;
  clientSecret?: string;
  vpcId?: string;
  albSubnetIds?: string[];
  ecsSubnetIds?: string[];
  albInternetFacing?: boolean;
  hostedZoneId?: string;
  domainName?: string;
  fieldsToMaskWhenAuditing: string[];
}
function getConfig(): Config {
  return yaml.load(
    // __dirname is a variable that reference the current directory. We use it so we can dynamically navigate to the
    // correct file
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(join(__dirname, `../../src/config/${process.env.STAGE}.yaml`), 'utf8') // nosemgrep
  ) as unknown as Config;
}

function getDynamicAuthTableName(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const outputs: any = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(join(__dirname, `../../src/config/${process.env.STAGE}.json`), 'utf8') // nosemgrep
  );
  const stackName = Object.entries(outputs).map(([key, value]) => key)[0]; //output has a format { stackname: {...props} }
  // eslint-disable-next-line security/detect-object-injection
  return outputs[stackName].dynamicAuthDDBTableName;
}

async function getSSMParamValue(awsService: AwsService, ssmParamName: string): Promise<string> {
  const response = await awsService.clients.ssm.getParameter({
    Name: ssmParamName,
    WithDecryption: true
  });

  return response.Parameter!.Value!;
}

const dataSetPrefix: string = 'DATASET';
const endPointPrefix: string = 'ENDPOINT';
const authorizationGroupPrefix: string = 'GROUP';

const enum SwbAuthZSubject {
  SWB_DATASET = 'SWB_DATASET',
  SWB_DATASET_ACCESS_LEVEL = 'SWB_DATASET_ACCESS_LEVEL',
  SWB_ENVIRONMENT = 'SWB_ENVIRONMENT',
  SWB_ENVIRONMENT_TYPE = 'SWB_ENVIRONMENT_TYPE',
  SWB_ETC = 'SWB_ETC',
  SWB_PROJECT = 'SWB_PROJECT',
  SWB_SSH_KEY = 'SWB_SSH_KEY',
  SWB_USER = 'SWB_USER'
}

export {
  getConstants,
  getConstantsWithSecrets,
  dataSetPrefix,
  endPointPrefix,
  authorizationGroupPrefix,
  SwbAuthZSubject
};
