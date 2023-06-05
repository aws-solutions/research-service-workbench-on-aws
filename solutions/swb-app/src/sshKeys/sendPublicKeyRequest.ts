/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '../base/utilities/validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const SendPublicKeyRequestParser = z
  .object({
    projectId: z.string().projId().required(),
    environmentId: z.string().envId().required(),
    userId: z.string().userId().required()
  })
  .required()
  .strict();

export type SendPublicKeyRequest = z.infer<typeof SendPublicKeyRequestParser>;
