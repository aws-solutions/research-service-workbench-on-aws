/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  SSMClient,
  ModifyDocumentPermissionCommand,
  ModifyDocumentPermissionCommandInput,
  ModifyDocumentPermissionCommandOutput
} from '@aws-sdk/client-ssm';

// Documentation for client and methods
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ssm/index.html

export default class SSM {
  private _client: SSMClient;
  public constructor(options: { region: string }) {
    this._client = new SSMClient({ ...options });
  }

  public async modifyDocumentPermission(
    params: ModifyDocumentPermissionCommandInput
  ): Promise<ModifyDocumentPermissionCommandOutput> {
    return this._client.send(new ModifyDocumentPermissionCommand(params));
  }
}
