/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  SSMClient,
  ModifyDocumentPermissionCommand,
  ModifyDocumentPermissionCommandInput,
  ModifyDocumentPermissionCommandOutput,
  SSMClientConfig,
  SendCommandCommand,
  SendCommandCommandInput,
  SendCommandCommandOutput,
  StartAutomationExecutionCommandInput,
  StartAutomationExecutionCommand,
  StartAutomationExecutionCommandOutput,
  GetCommandInvocationCommand,
  GetCommandInvocationCommandInput,
  GetCommandInvocationCommandOutput
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

  public async sendCommand(params: SendCommandCommandInput): Promise<SendCommandCommandOutput> {
    return this._client.send(new SendCommandCommand(params));
  }

  public async getCommandInvocationCommand(
    params: GetCommandInvocationCommandInput
  ): Promise<GetCommandInvocationCommandOutput> {
    return this._client.send(new GetCommandInvocationCommand(params));
  }

  public async startAutomationExecution(
    params: StartAutomationExecutionCommandInput
  ): Promise<StartAutomationExecutionCommandOutput> {
    return this._client.send(new StartAutomationExecutionCommand(params));
  }
}
