/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { PaginatedResponse } from '@aws/workbench-core-base';
import { CreateKeyPairRequest } from './createKeyPairRequest';
import { CreateKeyPairResponse } from './createKeyPairResponse';
import { DeleteKeyPairRequest } from './deleteKeyPairRequest';
import { GetKeyPairRequest } from './getKeyPairRequest';
import { GetKeyPairResponse } from './getKeyPairResponse';
import { KeyPair } from './keyPair';
import { ListKeyPairsRequest } from './listKeyPairsRequest';
import { SendPublicKeyRequest } from './sendPublicKeyRequest';
import { SendPublicKeyResponse } from './sendPublicKeyResponse';

export interface KeyPairPlugin {
  getKeyPair(request: GetKeyPairRequest): Promise<GetKeyPairResponse>;

  listKeyPairs(request: ListKeyPairsRequest): Promise<PaginatedResponse<KeyPair>>;

  deleteKeyPair(request: DeleteKeyPairRequest): Promise<void>;

  createKeyPair(request: CreateKeyPairRequest): Promise<CreateKeyPairResponse>;

  sendPublicKey(request: SendPublicKeyRequest): Promise<SendPublicKeyResponse>;
}
