/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import { SshKeyParser } from './sshKey';

// eslint-disable-next-line @rushstack/typedef-var
export const ListUserSshKeysForProjectResponseParser = z
  .object({
    sshKeys: z.array(SshKeyParser)
  })
  .required()
  .strict();

export type ListUserSshKeysForProjectResponse = z.infer<typeof ListUserSshKeysForProjectResponseParser>;
