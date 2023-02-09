/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateSshKeyRequest } from './createSshKeyRequest';
import { CreateSshKeyResponse } from './createSshKeyResponse';
import { DeleteSshKeyRequest } from './deleteSshKeyRequest';
import { ListUserSshKeysForProjectRequest } from './listUserSshKeysForProjectRequest';
import { ListUserSshKeysForProjectResponse } from './listUserSshKeysForProjectResponse';
import { SendPublicKeyRequest } from './sendPublicKeyRequest';
import { SendPublicKeyResponse } from './sendPublicKeyResponse';

export interface SshKeyPlugin {
  listUserSshKeysForProject(
    request: ListUserSshKeysForProjectRequest
  ): Promise<ListUserSshKeysForProjectResponse>;

  deleteSshKey(request: DeleteSshKeyRequest): Promise<void>;

  createSshKey(request: CreateSshKeyRequest): Promise<CreateSshKeyResponse>;

  sendPublicKey(request: SendPublicKeyRequest): Promise<SendPublicKeyResponse>;
}
