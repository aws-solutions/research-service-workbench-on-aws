/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import { KeyPairParser } from './keyPair';

// eslint-disable-next-line @rushstack/typedef-var
export const GetKeyPairResponseParser = z
  .object({
    keyPair: KeyPairParser
  })
  .strict();

export type GetKeyPairResponse = z.infer<typeof GetKeyPairResponseParser>;
