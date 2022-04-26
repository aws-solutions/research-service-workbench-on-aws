/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  EventBridgeClient,
  EventBridgeClientConfig,
  PutPermissionCommand,
  PutPermissionCommandInput,
  PutPermissionCommandOutput
} from '@aws-sdk/client-eventbridge';

// Documentation for client and methods
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-eventbridge/index.html

export default class EventBridge {
  private _client: EventBridgeClient;
  public constructor(config: EventBridgeClientConfig) {
    this._client = new EventBridgeClient(config);
  }

  public async putPermission(params: PutPermissionCommandInput): Promise<PutPermissionCommandOutput> {
    return this._client.send(new PutPermissionCommand(params));
  }
}
