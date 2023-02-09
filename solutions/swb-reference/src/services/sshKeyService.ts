/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { EC2 } from '@aws-sdk/client-ec2';
import { EC2InstanceConnect } from '@aws-sdk/client-ec2-instance-connect';
import {
  CreateSshKeyRequest,
  CreateSshKeyResponse,
  DeleteSshKeyRequest,
  ListUserSshKeysForProjectRequest,
  ListUserSshKeysForProjectResponse,
  SshKeyPlugin,
  SendPublicKeyRequest,
  SendPublicKeyResponse
} from '@aws/swb-app';
import { AwsService } from '@aws/workbench-core-base';

export default class SshKeyService implements SshKeyPlugin {
  private _aws: AwsService;
  private _resourceType: string = 'sshkey';
  public constructor(aws: AwsService) {
    this._aws = aws;
  }

  /**
   * Lists user-owned SSH Keys for the given project
   *
   * @param request - a {@link ListUserSshKeysForProjectRequest}
   * @returns a {@link ListUserSshKeysForProjectResponse} object
   */
  public async listUserSshKeysForProject(
    request: ListUserSshKeysForProjectRequest
  ): Promise<ListUserSshKeysForProjectResponse> {
    // TODO: implement
    throw new Error('Method not implemented.');
  }

  /**
   * Deletes the given SSH Key
   *
   * @param request - a {@link DeleteSshKeyRequest}
   */
  public async deleteSshKey(request: DeleteSshKeyRequest): Promise<void> {
    // TODO: implement
    throw new Error('Method not implemented.');
  }

  /**
   * Creates an SSH Key for the current user and given project
   *
   * @param request - a {@link CreateSshKeyRequest}
   * @returns a {@link CreateSshKeyResponse}
   */
  public async createSshKey(request: CreateSshKeyRequest): Promise<CreateSshKeyResponse> {
    // TODO: implement
    throw new Error('Method not implemented.');
  }

  /**
   * Sends the public key of a Key Pair to the designated environment to allow connection
   *
   * @param request - a {@link SendPublicKeyRequest}
   */
  public async sendPublicKey(request: SendPublicKeyRequest): Promise<SendPublicKeyResponse> {
    // TODO implement
    throw new Error('Method not implemented.');
  }

  /**
   * Get the EC2 and EC2 Instance Connect clients for the hosting account
   *
   * @param envMgmtRoleArn - the env management role ARN for the hosting account that has permissions
   *                         for EC2 and EC2 Instance Connect actions
   * @param operation - 'ListForProject' | 'Delete' | 'Create' | 'Connect' depending on the action happening
   * @param externalId - the external id for the hosting account
   * @param aws - the {@link AwsService} for the main account to ask for the hosting account {@link AwsService}
   * @returns an object containing an {@link EC2} client and an {@link EC2InstanceConnect} client for the hosting account
   */
  private async _getEc2ClientsForHostingAccount(
    envMgmtRoleArn: string,
    operation: 'ListForProject' | 'Delete' | 'Create' | 'Connect',
    externalId: string,
    aws: AwsService
  ): Promise<{ ec2: EC2; ec2InstanceConnect: EC2InstanceConnect }> {
    const params = {
      roleArn: envMgmtRoleArn,
      roleSessionName: `${operation}-${this._resourceType}-${Date.now()}`,
      region: process.env.AWS_REGION!,
      externalId: externalId
    };

    const hostSdk = await aws.getAwsServiceForRole(params);
    const ec2 = hostSdk.clients.ec2;
    const ec2InstanceConnect = hostSdk.clients.ec2InstanceConnect;

    return { ec2, ec2InstanceConnect };
  }
}
