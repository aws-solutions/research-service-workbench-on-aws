/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import CloudFormation from './services/cloudformation';

export default class AwsService {
  public cloudformation: CloudFormation;
  public constructor(awsConfig: { AWS_REGION: string }) {
    const { AWS_REGION } = awsConfig;

    this.cloudformation = new CloudFormation({ region: AWS_REGION });
  }
}
