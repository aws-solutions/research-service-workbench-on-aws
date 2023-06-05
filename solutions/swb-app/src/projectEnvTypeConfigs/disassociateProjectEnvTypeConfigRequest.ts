/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUserParser } from '../authorization/models/authenticatedUser';
import { z } from '../base/utilities/validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const DisassociateProjectEnvTypeConfigRequestParser = z
  .object({
    envTypeId: z.string().etId().required(),
    envTypeConfigId: z.string().etcId().required(),
    projectId: z.string().projId().required(),
    user: AuthenticatedUserParser
  })
  .strict();

export type DisassociateProjectEnvTypeConfigRequest = z.infer<
  typeof DisassociateProjectEnvTypeConfigRequestParser
>;
