/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as crypto from 'crypto';
import { DescribeKeyPairsCommandOutput, EC2, Tag } from '@aws-sdk/client-ec2';
import { EC2InstanceConnect } from '@aws-sdk/client-ec2-instance-connect';
import {
  CreateSshKeyRequest,
  CreateSshKeyResponse,
  DeleteSshKeyRequest,
  ListUserSshKeysForProjectRequest,
  ListUserSshKeysForProjectResponse,
  ListUserSshKeysForProjectResponseParser,
  SshKey,
  SshKeyPlugin,
  SendPublicKeyRequest,
  SendPublicKeyResponse,
  Ec2Error,
  NoKeyExistsError,
  NonUniqueKeyError,
  AwsServiceError
} from '@aws/swb-app';
import { ProjectService } from '@aws/workbench-core-accounts';
import { ForbiddenError } from '@aws/workbench-core-authorization';
import { AwsService, resourceTypeToKey } from '@aws/workbench-core-base';

export default class SshKeyService implements SshKeyPlugin {
  private _aws: AwsService;
  private _projectService: ProjectService;
  private _resourceType: string = 'sshkey';
  public constructor(aws: AwsService, projectService: ProjectService) {
    this._aws = aws;
    this._projectService = projectService;
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
    const { projectId, userId } = request;

    // get envMgmtRoleArn and externalId from project record
    const { envMgmtRoleArn, externalId } = await this._getEnvMgmtRoleArnAndExternalIdFromProject(projectId);
    // get EC2 client
    const { ec2 } = await this._getEc2ClientsForHostingAccount(
      envMgmtRoleArn,
      'ListForProject',
      externalId,
      this._aws
    );

    // get ssh key from ec2
    let keyPairs = [];
    const sshKeyId = this._getSshKeyId(userId, projectId);
    try {
      const ec2DescribeKeyPairsParam = {
        Filters: [{ Name: 'key-name', Values: [sshKeyId] }],
        IncludePublicKey: true
      };
      const ec2Response: DescribeKeyPairsCommandOutput = await ec2.describeKeyPairs(ec2DescribeKeyPairsParam);
      keyPairs = ec2Response.KeyPairs || [];
    } catch (e) {
      throw new Ec2Error(e);
    }

    let sshKeys: SshKey[] = [];
    keyPairs.forEach((key) => {
      sshKeys.push({
        publicKey: key.PublicKey!,
        createTime: key.CreateTime!.toISOString(),
        projectId,
        sshKeyId: key.KeyName!,
        owner: userId
      });
    });
    return ListUserSshKeysForProjectResponseParser.parse({ sshKeys: sshKeys });
  }

  /**
   * Deletes the given SSH Key
   *
   * @param request - a {@link DeleteSshKeyRequest}
   */
  public async deleteSshKey(request: DeleteSshKeyRequest): Promise<void> {
    const { projectId, sshKeyId, currentUserId } = request;

    // get envMgmtRoleArn and externalId from project record
    const { envMgmtRoleArn, externalId } = await this._getEnvMgmtRoleArnAndExternalIdFromProject(projectId);

    // get EC2 client
    const { ec2 } = await this._getEc2ClientsForHostingAccount(
      envMgmtRoleArn,
      'Delete',
      externalId,
      this._aws
    );

    // get ssh key
    let keys = [];
    try {
      const response = await ec2.describeKeyPairs({ Filters: [{ Name: 'key-name', Values: [sshKeyId] }] });
      keys = response.KeyPairs || [];
    } catch (e) {
      throw new Ec2Error(e);
    }
    if (keys.length === 0) {
      throw new NoKeyExistsError(`Key ${sshKeyId} does not exist`);
    }
    if (keys.length > 1) {
      throw new NonUniqueKeyError(
        `More than one key exists with ${sshKeyId}. Cannot determine which to delete.`
      );
    }

    // Check that current user owns the key from the request
    const sshKeyUser = this._getUserFromTags(keys[0].Tags!);
    if (sshKeyUser !== currentUserId) {
      throw new ForbiddenError(`Current user ${currentUserId} cannot delete a key they do not own`);
    }

    // delete ssh key
    try {
      await ec2.deleteKeyPair({ KeyName: sshKeyId });
    } catch (e) {
      throw new Ec2Error(e);
    }
  }

  /**
   * Get the user UUID from the list of tags passed or undefined if there is no user tag present.
   *
   * @param tags - list of {@link EC2.Tags}
   * @returns a string user UUID or undefined if no user tag present
   */
  private _getUserFromTags(tags: Tag[]): string | undefined {
    return tags.filter((tag) => tag.Key === 'user')[0].Value;
  }

  /**
   * Get the env mgmt role arn and external id from the project record given the project id
   *
   * @param projectId - the project id to get the project record for
   * @returns an object containing two strings for the env mgmt role and external id
   */
  private async _getEnvMgmtRoleArnAndExternalIdFromProject(
    projectId: string
  ): Promise<{ envMgmtRoleArn: string; externalId: string }> {
    const project = await this._projectService.getProject({ projectId });
    const { envMgmtRoleArn, externalId } = project;
    return { envMgmtRoleArn, externalId };
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

    try {
      const hostSdk = await aws.getAwsServiceForRole(params);
      const ec2 = hostSdk.clients.ec2;
      const ec2InstanceConnect = hostSdk.clients.ec2InstanceConnect;

      return { ec2, ec2InstanceConnect };
    } catch (e) {
      throw new AwsServiceError(`Could not get host EC2 clients using ${envMgmtRoleArn} and ${externalId}`);
    }
  }

  /**
   * Given the user id and the project it, hash them to create the unique ID for the SSH Key
   *
   * @param userId - the owner of the SSH Key
   * @param projectId - the project that the SSH Key is bounded by
   * @returns the string sshKeyId (aka EC2 KeyName)
   */
  private _getSshKeyId(userId: string, projectId: string): string {
    const hashedUuid = crypto
      .createHash('sha256', { outputLength: 32 })
      .update(userId)
      .update(projectId)
      .digest('hex');
    return `${resourceTypeToKey.sshKey.toLowerCase()}-${hashedUuid}`;
  }
}
