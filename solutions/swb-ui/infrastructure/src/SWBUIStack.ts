/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-new */

import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { getConstants } from './constants';
import { createECSCluster } from './hosting-infra/ecs-cluster';

export class SWBUIStack extends Stack {
  public uiEnvVars: {
    STAGE: string;
    STACK_NAME: string;
    API_BASE_URL: string;
    AWS_REGION: string;
    COGNITO_DOMAIN_NAME_OUTPUT_KEY: string;
    COGNITO_DOMAIN_NAME: string;
    WEBSITE_URL_OUTPUT_NAME: string;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  constructor(scope: Construct, id: string, props?: StackProps) {
    const {
      STAGE,
      STACK_NAME,
      API_BASE_URL,
      AWS_REGION,
      SWB_DOMAIN_NAME,
      MAIN_ACCT_ALB_LISTENER_ARN,
      COGNITO_DOMAIN_NAME_OUTPUT_KEY,
      COGNITO_DOMAIN_NAME,
      ECR_REPOSITORY_NAME,
      VPC_ID,
      ECS_SUBNET_IDS,
      ECS_AZS,
      WEBSITE_URL_OUTPUT_NAME
    } = getConstants();
    super(scope, STACK_NAME, props);

    this.uiEnvVars = {
      STAGE,
      STACK_NAME,
      API_BASE_URL,
      AWS_REGION,
      COGNITO_DOMAIN_NAME_OUTPUT_KEY,
      COGNITO_DOMAIN_NAME,
      WEBSITE_URL_OUTPUT_NAME
    };
    new CfnOutput(this, this.uiEnvVars.WEBSITE_URL_OUTPUT_NAME, {
      value: `https://${SWB_DOMAIN_NAME}`
    });
    createECSCluster(this, MAIN_ACCT_ALB_LISTENER_ARN, ECR_REPOSITORY_NAME, VPC_ID, ECS_SUBNET_IDS, ECS_AZS);
    this._addCognitoURLOutput();
  }

  private _addCognitoURLOutput(): void {
    new CfnOutput(this, this.uiEnvVars.COGNITO_DOMAIN_NAME_OUTPUT_KEY, {
      value: this.uiEnvVars.COGNITO_DOMAIN_NAME
    });
  }
}
