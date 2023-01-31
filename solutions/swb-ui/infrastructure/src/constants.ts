/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import { join } from 'path';

function getConstants(): {
  STAGE: string;
  ACCOUNT_ID: string;
  API_BASE_URL: string;
  AWS_REGION: string;
  STACK_NAME: string;
  SWB_DOMAIN_NAME: string;
  MAIN_ACCT_ALB_LISTENER_ARN: string;
  COGNITO_DOMAIN_NAME_OUTPUT_KEY: string;
  COGNITO_DOMAIN_NAME: string;
  VPC_ID: string;
  ECS_SUBNET_IDS: string[];
  ECS_AZS: string[];
  ECR_REPOSITORY_NAME: string;
  WEBSITE_URL_OUTPUT_NAME: string;
} {
  const config = getAPIOutputs();
  const STAGE = process.env.STAGE || '';
  const namePrefix = `swb-ui-${process.env.STAGE}-${config.awsRegionShortName}`;
  const ACCOUNT_ID = config.accountId;
  const API_BASE_URL = config.apiUrlOutput?.replace('/dev/', '') || '';
  const AWS_REGION = config.awsRegion;
  const COGNITO_DOMAIN_NAME_OUTPUT_KEY = 'CognitoURL';
  const COGNITO_DOMAIN_NAME = config.cognitoDomainName;
  const STACK_NAME = namePrefix;
  const MAIN_ACCT_ALB_LISTENER_ARN = config.mainAccountAlbListenerArn;
  const VPC_ID = config.vpcId;
  const ECS_SUBNET_IDS = config.ecsSubnetIds;
  const ECS_AZS = config.ecsAzs;
  const SWB_DOMAIN_NAME = config.swbDomainName;
  const ECR_REPOSITORY_NAME = config.ecrRepositoryName;
  const WEBSITE_URL_OUTPUT_NAME = 'WebsiteURL';

  return {
    STAGE,
    ACCOUNT_ID,
    API_BASE_URL,
    AWS_REGION,
    STACK_NAME,
    SWB_DOMAIN_NAME,
    MAIN_ACCT_ALB_LISTENER_ARN,
    COGNITO_DOMAIN_NAME_OUTPUT_KEY,
    COGNITO_DOMAIN_NAME,
    VPC_ID,
    ECS_SUBNET_IDS,
    ECS_AZS,
    ECR_REPOSITORY_NAME,
    WEBSITE_URL_OUTPUT_NAME
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAPIOutputs(): {
  accountId: string;
  awsRegionShortName: string;
  apiUrlOutput: string;
  awsRegion: string;
  cognitoDomainName: string;
  swbDomainName: string;
  mainAccountAlbListenerArn: string;
  vpcId: string;
  ecsSubnetIds: string[];
  ecsAzs: string[];
  ecrRepositoryName: string;
} {
  try {
    if (process.env.aws_account_number && process.env.SYNTH_REGION_SHORTNAME && process.env.SYNTH_REGION)
      //allow environment variable override for synth pipeline check
      return {
        accountId: '',
        awsRegionShortName: process.env.SYNTH_REGION_SHORTNAME,
        apiUrlOutput: '',
        awsRegion: process.env.SYNTH_REGION,
        cognitoDomainName: '',
        swbDomainName: '',
        mainAccountAlbListenerArn: '',
        vpcId: '',
        ecsSubnetIds: [],
        ecsAzs: [],
        ecrRepositoryName: ''
      };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiStackOutputs: any = JSON.parse(
      // __dirname is a variable that reference the current directory. We use it so we can dynamically navigate to the
      // correct file
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.readFileSync(join(__dirname, `../../../swb-reference/src/config/${process.env.STAGE}.json`), 'utf8') // nosemgrep
    );
    const apiStackName = Object.entries(apiStackOutputs).map(([key, value]) => key)[0]; //output has a format { stackname: {...props} }
    // eslint-disable-next-line security/detect-object-injection
    const outputs = apiStackOutputs[apiStackName];
    const ecrRepositoryName = outputs.SwbEcrRepositoryNameOutput;
    const mainAccountAlbListenerArn = outputs.MainAccountLoadBalancerListenerArnOutput;
    const swbDomainName = outputs.SwbDomainNameOutput;
    const vpcId = outputs.SwbVpcIdOutput;
    const ecsSubnetIds = outputs.SwbEcsSubnetIdsOutput.split(',');
    const ecsAzs = outputs.SwbEcsAzsOutput.split(',');

    if (!outputs.awsRegionShortName || !outputs.apiUrlOutput || !outputs.awsRegion) {
      throw new Error(
        `Configuration file for ${process.env.STAGE} was found with incorrect format. Please deploy application swb-reference and try again.`
      ); //validate when API unsuccessfully finished and UI is deployed
    }

    return {
      accountId: outputs.accountId,
      awsRegionShortName: outputs.awsRegionShortName,
      apiUrlOutput: outputs.apiUrlOutput,
      awsRegion: outputs.awsRegion,
      cognitoDomainName: outputs.cognitoDomainName,
      swbDomainName: swbDomainName,
      mainAccountAlbListenerArn: mainAccountAlbListenerArn,
      vpcId: vpcId,
      ecsSubnetIds: ecsSubnetIds,
      ecsAzs: ecsAzs,
      ecrRepositoryName: ecrRepositoryName
    };
  } catch {
    console.error(
      `No API Stack deployed found for ${process.env.STAGE}.Please deploy application swb-reference and try again.`
    );
    throw new Error(`No API Stack deployed found for ${process.env.STAGE}.`);
  }
}

export { getConstants };
