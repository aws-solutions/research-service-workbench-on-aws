/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import {
  AttachRolePolicyCommand,
  AttachRolePolicyCommandInput,
  AttachRolePolicyCommandOutput,
  CreatePolicyCommand,
  CreatePolicyCommandInput,
  CreatePolicyCommandOutput,
  CreateRoleCommand,
  CreateRoleCommandInput,
  CreateRoleCommandOutput,
  DeleteRolePolicyCommand,
  DeleteRolePolicyCommandInput,
  DeleteRolePolicyCommandOutput,
  DetachRolePolicyCommand,
  DetachRolePolicyCommandInput,
  DetachRolePolicyCommandOutput,
  GetPolicyCommand,
  GetPolicyCommandInput,
  GetPolicyCommandOutput,
  GetPolicyVersionCommand,
  GetPolicyVersionCommandInput,
  GetPolicyVersionCommandOutput,
  GetRoleCommand,
  GetRoleCommandInput,
  GetRoleCommandOutput,
  GetRolePolicyCommand,
  GetRolePolicyCommandInput,
  GetRolePolicyCommandOutput,
  IAMClient,
  IAMClientConfig,
  ListAttachedRolePoliciesCommand,
  ListAttachedRolePoliciesCommandInput,
  ListAttachedRolePoliciesCommandOutput,
  ListRolePoliciesCommand,
  ListRolePoliciesCommandInput,
  ListRolePoliciesCommandOutput,
  PutRolePolicyCommand,
  PutRolePolicyCommandInput,
  PutRolePolicyCommandOutput,
  UpdateAssumeRolePolicyCommand,
  UpdateAssumeRolePolicyCommandInput,
  UpdateAssumeRolePolicyCommandOutput
} from '@aws-sdk/client-iam';

// Documentation for client and methods
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-iam/index.html

export default class IAM {
  private _client: IAMClient;
  public constructor(config: IAMClientConfig) {
    this._client = new IAMClient(config);
  }

  public async getRole(params: GetRoleCommandInput): Promise<GetRoleCommandOutput> {
    return this._client.send(new GetRoleCommand(params));
  }

  public async createRole(params: CreateRoleCommandInput): Promise<CreateRoleCommandOutput> {
    return this._client.send(new CreateRoleCommand(params));
  }

  public async deleteRolePolicy(
    params: DeleteRolePolicyCommandInput
  ): Promise<DeleteRolePolicyCommandOutput> {
    return this._client.send(new DeleteRolePolicyCommand(params));
  }

  public async detachRolePolicy(
    params: DetachRolePolicyCommandInput
  ): Promise<DetachRolePolicyCommandOutput> {
    return this._client.send(new DetachRolePolicyCommand(params));
  }

  public async getPolicy(params: GetPolicyCommandInput): Promise<GetPolicyCommandOutput> {
    return this._client.send(new GetPolicyCommand(params));
  }

  public async getPolicyVersion(
    params: GetPolicyVersionCommandInput
  ): Promise<GetPolicyVersionCommandOutput> {
    return this._client.send(new GetPolicyVersionCommand(params));
  }

  public async createPolicy(params: CreatePolicyCommandInput): Promise<CreatePolicyCommandOutput> {
    return this._client.send(new CreatePolicyCommand(params));
  }

  public async getRolePolicy(params: GetRolePolicyCommandInput): Promise<GetRolePolicyCommandOutput> {
    return this._client.send(new GetRolePolicyCommand(params));
  }

  public async updateAssumeRolePolicy(
    params: UpdateAssumeRolePolicyCommandInput
  ): Promise<UpdateAssumeRolePolicyCommandOutput> {
    return this._client.send(new UpdateAssumeRolePolicyCommand(params));
  }

  public async listRolePolicies(
    params: ListRolePoliciesCommandInput
  ): Promise<ListRolePoliciesCommandOutput> {
    return this._client.send(new ListRolePoliciesCommand(params));
  }

  public async listAttachedRolePolicies(
    params: ListAttachedRolePoliciesCommandInput
  ): Promise<ListAttachedRolePoliciesCommandOutput> {
    return this._client.send(new ListAttachedRolePoliciesCommand(params));
  }

  public async putRolePolicy(params: PutRolePolicyCommandInput): Promise<PutRolePolicyCommandOutput> {
    return this._client.send(new PutRolePolicyCommand(params));
  }

  public async attachRolePolicy(
    params: AttachRolePolicyCommandInput
  ): Promise<AttachRolePolicyCommandOutput> {
    return this._client.send(new AttachRolePolicyCommand(params));
  }
}
