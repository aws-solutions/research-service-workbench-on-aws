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

export default class CloudFormation {
  private _client: CloudFormationClient;
  public constructor(options: { region: string }) {
    this._client = new CloudFormationClient({ ...options });
  }

  /**
   * Returns the list of CloudFormation stacks in a given AWS account
   *
   * @param params - The DescribeStacksCommandInput object expected by the SDK command
   * @returns A list of CfN stacks in the AWS account
   */
  public async describeStacks(params: DescribeStacksCommandInput): Promise<DescribeStacksCommandOutput> {
    return this._client.send(new DescribeStacksCommand(params));
  }
}
