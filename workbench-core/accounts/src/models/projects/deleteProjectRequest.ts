/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// TODO--get rid of dependencies and fix tests
// eslint-disable-next-line @rushstack/typedef-var
export const DeleteProjectRequestParser = z.object({
  projectId: z.string(),
  dependencies: z.record(z.array(z.string()))
});

export type DeleteProjectRequest = z.infer<typeof DeleteProjectRequestParser>;
