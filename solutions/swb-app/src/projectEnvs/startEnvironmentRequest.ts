/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '../base/utilities/validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const StartEnvironmentRequestParser = z.object({
  projectId: z.string().projId().required(),
  environmentId: z.string().envId().required()
});

export type StartEnvironmentRequest = z.infer<typeof StartEnvironmentRequestParser>;
