/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { KeyPairParser } from './keyPair';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateKeyPairResponseParser = z
  .object({
    keyPair: KeyPairParser,
    privateKey: z.string()
  })
  .strict();

export type CreateKeyPairResponse = z.infer<typeof CreateKeyPairResponseParser>;
