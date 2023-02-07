/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateKeyPairRequest } from './createKeyPairRequest';
import { CreateKeyPairResponse } from './createKeyPairResponse';
import { DeleteKeyPairRequest } from './deleteKeyPairRequest';
import { GetKeyPairRequest } from './getKeyPairRequest';
import { GetKeyPairResponse } from './getKeyPairResponse';
import { SendPublicKeyRequest } from './sendPublicKeyRequest';
import { SendPublicKeyResponse } from './sendPublicKeyResponse';

export interface KeyPairPlugin {
  getKeyPair(request: GetKeyPairRequest): Promise<GetKeyPairResponse>;

  deleteKeyPair(request: DeleteKeyPairRequest): Promise<void>;

  createKeyPair(request: CreateKeyPairRequest): Promise<CreateKeyPairResponse>;

  sendPublicKey(request: SendPublicKeyRequest): Promise<SendPublicKeyResponse>;
}
