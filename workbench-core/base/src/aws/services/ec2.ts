/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  EC2Client,
  ModifyImageAttributeCommand,
  ModifyImageAttributeRequest,
  ModifyImageAttributeCommandOutput,
  EC2ClientConfig
} from '@aws-sdk/client-ec2';

// Documentation for client and methods
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ec2/index.html

export default class EC2 {
  private _client: EC2Client;
  public constructor(config: EC2ClientConfig) {
    this._client = new EC2Client(config);
  }

  public async modifyImageAttribute(
    params: ModifyImageAttributeRequest
  ): Promise<ModifyImageAttributeCommandOutput> {
    return this._client.send(new ModifyImageAttributeCommand(params));
  }
}
