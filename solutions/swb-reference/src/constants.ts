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
  STATUS_HANDLER_ROLE_ARN_OUTPUT_KEY: string;
  ALLOWED_ORIGINS: string;
  AWS_REGION_SHORT_NAME: string;
  COGNITO_DOMAIN: string;
  WEBSITE_URLS: string[];
  USER_POOL_ID: string;
  WEB_UI_CLIENT_ID: string;
  WEB_UI_CLIENT_SECRET: string;
  PROGRAMMATIC_ACCESS_CLIENT_ID: string;
  VPC_ID: string;
  S3_DATASETS_ENCRYPTION_KEY_ARN_OUTPUT_KEY: string;
  S3_ARTIFACT_ENCRYPTION_KEY_ARN_OUTPUT_KEY: string;
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
  USER_AGENT_STRING: string;
}

interface SecretConstants {
  ROOT_USER_EMAIL: string;
  DYNAMIC_AUTH_TABLE_NAME: string;
}

const SolutionId: string = 'SO0231'; //TODO: retrieve value dynamically
const SolutionName: string = 'Research Service Workbench on AWS'; //TODO: retrieve value dynamically
const SolutionVersion: string = '2.0.1'; //TODO: retrieve value dynamically
const ApplicationType: string = 'AWS-Solutions'; //TODO: retrieve value dynamically
const customUserAgentString: string = `AwsSolution/${SolutionId}/${SolutionVersion}`;

const regionShortNamesMap: { [id: string]: string } = {
  'us-east-2': 'oh',
  'us-east-1': 'va',
  'us-west-1': 'ca',
  'us-west-2': 'or',
  'ap-east-1': 'hk',
  'ap-south-1': 'mum',
  'ap-northeast-3': 'osa',
  'ap-northeast-2': 'sel',
  'ap-southeast-1': 'sg',
  'ap-southeast-2': 'syd',
  'ap-northeast-1': 'ty',
  'ca-central-1': 'ca',
  'cn-north-1': 'cn',
  'cn-northwest-1': 'nx',
  'eu-central-1': 'fr',
  'eu-west-1': 'irl',
  'eu-west-2': 'ldn',
  'eu-west-3': 'par',
  'eu-north-1': 'sth',
  'me-south-1': 'bhr',
  'sa-east-1': 'sao',
  'us-gov-east-1': 'gce',
  'us-gov-west-1': 'gcw'
};

//CDK Constructs doesn't support Promises https://github.com/aws/aws-cdk/issues/8273
function getConstants(region?: string): Constants {
  const config = getConfig();

  const IS_SOLUTIONS_BUILD = isSolutionsBuild();
  const AWS_REGION = IS_SOLUTIONS_BUILD ? region! : config.awsRegion;
  // eslint-disable-next-line security/detect-object-injection
  const AWS_REGION_SHORT_NAME = config.awsRegionShortName || regionShortNamesMap[AWS_REGION]; // If users forgot to enter shortname, this can fill it in

  const STACK_NAME = `rsw-${config.stage}-${AWS_REGION_SHORT_NAME}`;
  const SC_PORTFOLIO_NAME = `rsw-${config.stage}-${AWS_REGION_SHORT_NAME}`; // Service Catalog Portfolio Name
  const USER_POOL_CLIENT_NAME = `rsw-client-${config.stage}-${AWS_REGION_SHORT_NAME}`;
  const USER_POOL_NAME = `rsw-userpool-${config.stage}-${AWS_REGION_SHORT_NAME}`;
  const S3_ACCESS_BUCKET_PREFIX = 'service-workbench-access-log';
  const S3_ARTIFACT_BUCKET_SC_PREFIX = 'service-catalog-cfn-templates/';
  const S3_ARTIFACT_BUCKET_BOOTSTRAP_PREFIX = 'environment-files/'; // Location of env bootstrap scripts in the artifacts bucket
  const allowedOrigins: string[] = config.allowedOrigins || [];
  const COGNITO_DOMAIN = config.cognitoDomain;
  const WEBSITE_URLS = allowedOrigins;
  const USER_POOL_ID = config.userPoolId || '';
  const WEB_UI_CLIENT_ID = config.webUiClientId || '';
  const WEB_UI_CLIENT_SECRET = config.webUiClientSecret || '';
  const PROGRAMMATIC_ACCESS_CLIENT_ID = config.programmaticAccessClientId || '';
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
  const STATUS_HANDLER_ROLE_ARN_OUTPUT_KEY = 'StatusHandlerLambdaRoleOutput';
  const S3_DATASETS_ENCRYPTION_KEY_ARN_OUTPUT_KEY = 'S3DatasetsEncryptionKeyOutput';
  const S3_ARTIFACT_ENCRYPTION_KEY_ARN_OUTPUT_KEY = 'S3ArtifactEncryptionKeyOutput';
  const MAIN_ACCT_ALB_ARN_OUTPUT_KEY = 'MainAccountLoadBalancerArnOutput';
  const SWB_DOMAIN_NAME_OUTPUT_KEY = 'SwbDomainNameOutput';
  const MAIN_ACCT_ALB_LISTENER_ARN_OUTPUT_KEY = 'MainAccountLoadBalancerListenerArnOutput';
  const VPC_ID_OUTPUT_KEY = 'RswVpcIdOutput';
  const ECS_SUBNET_IDS_OUTPUT_KEY = 'RswEcsSubnetIdsOutput';
  const ECS_SUBNET_AZS_OUTPUT_KEY = 'RswEcsAzsOutput';
  const USER_AGENT_STRING = customUserAgentString;

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
    AWS_REGION_SHORT_NAME,
    ACCT_HANDLER_ARN_OUTPUT_KEY,
    API_HANDLER_ARN_OUTPUT_KEY,
    STATUS_HANDLER_ARN_OUTPUT_KEY,
    STATUS_HANDLER_ROLE_ARN_OUTPUT_KEY,
    COGNITO_DOMAIN,
    WEBSITE_URLS,
    USER_POOL_ID,
    WEB_UI_CLIENT_ID,
    WEB_UI_CLIENT_SECRET,
    PROGRAMMATIC_ACCESS_CLIENT_ID,
    VPC_ID,
    S3_DATASETS_ENCRYPTION_KEY_ARN_OUTPUT_KEY,
    S3_ARTIFACT_ENCRYPTION_KEY_ARN_OUTPUT_KEY,
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
    FIELDS_TO_MASK_WHEN_AUDITING,
    USER_AGENT_STRING
  };
}

function getSolutionId(): string {
  return 'SO0231';
}

function isSolutionsBuild(): boolean {
  return process.env.SOLUTION_ID === getSolutionId();
}

async function getConstantsWithSecrets(): Promise<Constants & SecretConstants> {
  const config = getConfig();
  const AWS_REGION = config.awsRegion;
  const awsService = new AwsService({ region: AWS_REGION, userAgent: customUserAgentString });
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
  webUiClientId?: string;
  webUiClientSecret?: string;
  programmaticAccessClientId?: string;
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
const storageLocationPrefix: string = 'STORAGELOCATION';
const authorizationGroupPrefix: string = 'GROUP';

const enum SwbAuthZSubject {
  SWB_AWS_ACCOUNT = 'SWB_AWS_ACCOUNT',
  SWB_AWS_ACCOUNT_TEMPLATE_URL = 'SWB_AWS_ACCOUNT_TEMPLATE_URL',
  SWB_COST_CENTER = 'SWB_COST_CENTER',
  SWB_DATASET = 'SWB_DATASET',
  SWB_DATASET_LIST = 'SWB_DATASET_LIST',
  SWB_DATASET_ACCESS_LEVEL = 'SWB_DATASET_ACCESS_LEVEL',
  SWB_DATASET_UPLOAD = 'SWB_DATASET_UPLOAD',
  SWB_ENVIRONMENT = 'SWB_ENVIRONMENT',
  SWB_ENVIRONMENT_CONNECTION = 'SWB_ENVIRONMENT_CONNECTION',
  SWB_ENVIRONMENT_TYPE = 'SWB_ENVIRONMENT_TYPE',
  SWB_ETC = 'SWB_ETC',
  SWB_PROJECT_LIST_BY_ETC = 'SWB_PROJECT_LIST_BY_ETC',
  SWB_PROJECT = 'SWB_PROJECT',
  SWB_PROJECT_LIST = 'SWB_PROJECT_LIST',
  SWB_PROJECT_USER_ASSOCIATION = 'SWB_PROJECT_USER_ASSOCIATION',
  SWB_SSH_KEY = 'SWB_SSH_KEY',
  SWB_USER = 'SWB_USER'
}

export {
  isSolutionsBuild,
  getConstants,
  getConstantsWithSecrets,
  dataSetPrefix,
  endPointPrefix,
  storageLocationPrefix,
  authorizationGroupPrefix,
  SwbAuthZSubject,
  SolutionId,
  SolutionName,
  SolutionVersion,
  customUserAgentString,
  ApplicationType
};
