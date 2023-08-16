/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as crypto from 'crypto';
import {
  AwsServiceError,
  ConflictError,
  CreateSshKeyRequest,
  CreateSshKeyResponse,
  DeleteSshKeyRequest,
  DuplicateKeyError,
  Ec2Error,
  ListUserSshKeysForProjectRequest,
  ListUserSshKeysForProjectResponse,
  ListUserSshKeysForProjectResponseParser,
  NoKeyExistsError,
  NonUniqueKeyError,
  SendPublicKeyRequest,
  SendPublicKeyResponse,
  SendPublicKeyResponseParser,
  SshKey,
  SshKeyPlugin,
  NoInstanceFoundError,
  ConnectionInfoNotDefinedError
} from '@aws/swb-app';
import { CreateSshKeyResponseParser } from '@aws/swb-app/lib/sshKeys/createSshKeyResponse';
import { ProjectService } from '@aws/workbench-core-accounts';
import { ForbiddenError } from '@aws/workbench-core-authorization';
import { AwsService, resourceTypeToKey } from '@aws/workbench-core-base';
import { EnvironmentService } from '@aws/workbench-core-environments';
import {
  DescribeKeyPairsCommandOutput,
  EC2,
  KeyFormat,
  KeyType,
  KeyPairInfo,
  Reservation,
  Tag
} from '@aws-sdk/client-ec2';
import { EC2InstanceConnect } from '@aws-sdk/client-ec2-instance-connect';

export default class SshKeyService implements SshKeyPlugin {
  private _aws: AwsService;
  private _projectService: ProjectService;
  private _environmentService: EnvironmentService;
  private _resourceType: string = 'sshkey';
  public constructor(
    aws: AwsService,
    projectService: ProjectService,
    environmentService: EnvironmentService
  ) {
    this._aws = aws;
    this._projectService = projectService;
    this._environmentService = environmentService;
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

    const sshKeys: SshKey[] = [];
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
    const key = await this._getSshKey(sshKeyId, projectId);

    // Check that current user owns the key from the request
    const sshKeyUser = this._getUserFromTags(key.Tags!);
    if (sshKeyUser !== currentUserId) {
      throw new ForbiddenError(`Current user cannot delete a key they do not own`);
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
    const { projectId, userId } = request;
    const sshKeyId = this._getSshKeyId(userId, projectId);

    // get envMgmtRoleArn and externalId from project record
    const { envMgmtRoleArn, externalId } = await this._getEnvMgmtRoleArnAndExternalIdFromProject(projectId);

    // get EC2 client
    const { ec2 } = await this._getEc2ClientsForHostingAccount(
      envMgmtRoleArn,
      'Create',
      externalId,
      this._aws
    );

    // create key
    try {
      const createKeyPairResponse = await ec2.createKeyPair({
        KeyFormat: KeyFormat.pem,
        KeyName: sshKeyId,
        KeyType: KeyType.rsa,
        TagSpecifications: [
          {
            ResourceType: 'key-pair',
            Tags: [
              {
                Key: 'user',
                Value: userId
              },
              {
                Key: 'project',
                Value: projectId
              }
            ]
          }
        ]
      });
      return CreateSshKeyResponseParser.parse({
        projectId,
        privateKey: createKeyPairResponse.KeyMaterial!,
        id: sshKeyId,
        owner: userId
      });
    } catch (e) {
      if (e.Code === 'InvalidKeyPair.Duplicate') {
        throw new DuplicateKeyError(e.message);
      }
      throw new Ec2Error(e.message);
    }
  }

  /**
   * Sends the public key of a Key Pair to the designated environment to allow connection
   *
   * @param request - a {@link SendPublicKeyRequest}
   */
  public async sendPublicKey(request: SendPublicKeyRequest): Promise<SendPublicKeyResponse> {
    const { projectId: reqProjectId, environmentId, userId } = request;

    // get environment instanceId and projectId
    const { instanceId, projectId, status } = await this._environmentService.getEnvironment(environmentId);
    if (reqProjectId !== projectId) {
      throw new ConflictError(`Requested Project ID does not match environment Project ID`);
    }
    if (!instanceId) {
      // getEnvironment could return an environment before the instance is spun up
      throw new NoInstanceFoundError(`Instance Id is not defined for environment yet. Try again later.`);
    }
    if (status !== 'COMPLETED') {
      // getEnvironment could return an environment before the instance is available
      throw new ConnectionInfoNotDefinedError(`The environment is not available yet. Try again later.`);
    }

    // get the key for the user and given project
    const sshKeyId = this._getSshKeyId(userId, projectId);
    const key = await this._getSshKey(sshKeyId, projectId);

    // get envMgmtRoleArn and externalId from project
    const { envMgmtRoleArn, externalId } = await this._getEnvMgmtRoleArnAndExternalIdFromProject(projectId);

    // get the EC2 clients
    const { ec2, ec2InstanceConnect } = await this._getEc2ClientsForHostingAccount(
      envMgmtRoleArn,
      'Connect',
      externalId,
      this._aws
    );

    // get instance metadata
    let response;
    try {
      response = await ec2.describeInstances({ InstanceIds: [instanceId!] });
    } catch (e) {
      throw new Ec2Error(e.message);
    }

    // send ssh public key
    try {
      const { Success: success } = await ec2InstanceConnect.sendSSHPublicKey({
        InstanceId: instanceId,
        InstanceOSUser: 'ec2-user',
        SSHPublicKey: key.PublicKey
      });
      if (!success) {
        throw new Ec2Error(`Could not send SSH Public Key to environment`);
      }
    } catch (e) {
      throw new Ec2Error(e.message);
    }

    // return network info
    const reservations = response.Reservations;
    if (!reservations || reservations.length !== 1) {
      throw new NoInstanceFoundError('No instance found');
    }

    const reservation = reservations[0];
    return this._getConnectionInfoFromReservation(reservation);
  }

  /**
   * Private method to get a single SSH Key from EC2
   *
   * @param sshKeyId - the KeyName of the SSH Key to get
   * @param projectId - the project the key belongs to
   * @returns {@link KeyPairInfo} with the SSH Key info
   */
  private async _getSshKey(sshKeyId: string, projectId: string): Promise<KeyPairInfo> {
    // get envMgmtRoleArn and externalId from project record
    const { envMgmtRoleArn, externalId } = await this._getEnvMgmtRoleArnAndExternalIdFromProject(projectId);

    // get EC2 client
    const { ec2 } = await this._getEc2ClientsForHostingAccount(envMgmtRoleArn, 'Get', externalId, this._aws);

    // get ssh key
    let keys = [];
    try {
      const response = await ec2.describeKeyPairs({
        Filters: [{ Name: 'key-name', Values: [sshKeyId] }],
        IncludePublicKey: true
      });
      keys = response.KeyPairs || [];
    } catch (e) {
      throw new Ec2Error(e);
    }
    if (keys.length === 0) {
      throw new NoKeyExistsError(`Key does not exist`);
    }
    if (keys.length > 1) {
      throw new NonUniqueKeyError(`More than one key exists with requested ID.`);
    }
    // must only be 1 key
    return keys[0];
  }

  /**
   * Gets the connection info (public DNS name, public IP address, private DNS name, private IP address)
   * from an EC2 {@link Reservation} for a single instance
   *
   * @param reservation - a {@link Reservation} for a single instance
   * @returns {@link SendPublicKeyResponse} that contains the connection info
   */
  private _getConnectionInfoFromReservation(reservation: Reservation): SendPublicKeyResponse {
    const instances = reservation.Instances;
    if (!instances || instances.length !== 1) {
      throw new NoInstanceFoundError('No instance found');
    }

    const instance = instances[0];
    const {
      PublicDnsName: publicDnsName,
      PublicIpAddress: publicIp,
      PrivateDnsName: privateDnsName,
      PrivateIpAddress: privateIp
    } = instance;
    if (!(publicDnsName && publicIp && privateDnsName && privateIp)) {
      const notDefined = [publicDnsName, publicIp, privateDnsName, privateIp].filter((val) => !val);
      throw new ConnectionInfoNotDefinedError(`Some connection info is not defined: ${notDefined}`);
    }

    return SendPublicKeyResponseParser.parse({
      publicDnsName,
      publicIp,
      privateDnsName,
      privateIp
    });
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
    operation: 'ListForProject' | 'Delete' | 'Create' | 'Connect' | 'Get',
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
