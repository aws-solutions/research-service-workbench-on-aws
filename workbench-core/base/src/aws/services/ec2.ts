/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  EC2Client,
  ModifyImageAttributeCommand,
  ModifyImageAttributeRequest,
  ModifyImageAttributeCommandOutput
} from '@aws-sdk/client-ec2';

// Documentation for client and methods
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ec2/index.html

export default class EC2 {
  private _client: EC2Client;
  public constructor(options: { region: string }) {
    this._client = new EC2Client({ ...options });
  }

  public async modifyImageAttribute(
    params: ModifyImageAttributeRequest
  ): Promise<ModifyImageAttributeCommandOutput> {
    return this._client.send(new ModifyImageAttributeCommand(params));
  }
}
