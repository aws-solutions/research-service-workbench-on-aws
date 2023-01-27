/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const SendPublicKeyResponseParser = z
  .object({
    publicDnsName: z.string(),
    publicIp: z.string(),
    privateDnsName: z.string(),
    privateIp: z.string()
  })
  .strict();

export type SendPublicKeyResponse = z.infer<typeof SendPublicKeyResponseParser>;
