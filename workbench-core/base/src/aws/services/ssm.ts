/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  SSMClient,
  ModifyDocumentPermissionCommand,
  ModifyDocumentPermissionCommandInput,
  ModifyDocumentPermissionCommandOutput,
  SSMClientConfig
} from '@aws-sdk/client-ssm';

// Documentation for client and methods
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ssm/index.html

export default class SSM {
  private _client: SSMClient;
  public constructor(config: SSMClientConfig) {
    this._client = new SSMClient(config);
  }

  public async modifyDocumentPermission(
    params: ModifyDocumentPermissionCommandInput
  ): Promise<ModifyDocumentPermissionCommandOutput> {
    return this._client.send(new ModifyDocumentPermissionCommand(params));
  }
}
