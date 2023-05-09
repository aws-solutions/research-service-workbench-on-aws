/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const SendPublicKeyResponseParser = z
  .object({
    publicDnsName: z.string().required(),
    publicIp: z.string().required(),
    privateDnsName: z.string().required(),
    privateIp: z.string().required()
  })
  .strict();

export type SendPublicKeyResponse = z.infer<typeof SendPublicKeyResponseParser>;
