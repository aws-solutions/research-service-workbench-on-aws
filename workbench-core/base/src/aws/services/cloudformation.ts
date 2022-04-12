/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  CloudFormationClient,
  DescribeStacksCommand,
  DescribeStacksCommandInput,
  DescribeStacksCommandOutput
} from '@aws-sdk/client-cloudformation';

// Documentation for client and methods
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cloudformation/index.html

export default class CloudFormation {
  private _client: CloudFormationClient;
  public constructor(options: { region: string }) {
    this._client = new CloudFormationClient({ ...options });
  }

  public async describeStacks(params: DescribeStacksCommandInput): Promise<DescribeStacksCommandOutput> {
    return this._client.send(new DescribeStacksCommand(params));
  }
}
