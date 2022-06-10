/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  DescribeEventBusCommand,
  DescribeEventBusCommandInput,
  DescribeEventBusCommandOutput,
  DescribeRuleCommand,
  DescribeRuleCommandInput,
  DescribeRuleCommandOutput,
  EventBridgeClient,
  EventBridgeClientConfig,
  PutPermissionCommand,
  PutPermissionCommandInput,
  PutPermissionCommandOutput,
  PutRuleCommand,
  PutRuleCommandInput,
  PutRuleCommandOutput,
  PutTargetsCommand,
  PutTargetsCommandInput,
  PutTargetsCommandOutput
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

  public async describeEventBus(
    params: DescribeEventBusCommandInput
  ): Promise<DescribeEventBusCommandOutput> {
    return this._client.send(new DescribeEventBusCommand(params));
  }

  public async putRule(params: PutRuleCommandInput): Promise<PutRuleCommandOutput> {
    return this._client.send(new PutRuleCommand(params));
  }

  public async putTargets(params: PutTargetsCommandInput): Promise<PutTargetsCommandOutput> {
    return this._client.send(new PutTargetsCommand(params));
  }

  public async describeRule(params: DescribeRuleCommandInput): Promise<DescribeRuleCommandOutput> {
    return this._client.send(new DescribeRuleCommand(params));
  }
}
