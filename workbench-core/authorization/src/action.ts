/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const ActionParser = z.union([
  z.literal('CREATE'),
  z.literal('READ'),
  z.literal('UPDATE'),
  z.literal('DELETE')
]);
/**
 * Actions that can be performed.
 */
export type Action = z.infer<typeof ActionParser>;
