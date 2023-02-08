/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

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
}
