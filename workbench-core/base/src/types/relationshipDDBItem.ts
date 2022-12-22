/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const RelationshipDDBItemParser = z.object({
  sk: z.string(),
  pk: z.string(),
  id: z.string()
});

export type RelationshipDDBItem = z.infer<typeof RelationshipDDBItemParser>;
