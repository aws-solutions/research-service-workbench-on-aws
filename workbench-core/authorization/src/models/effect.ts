/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const EffectParser = z.union([z.literal('ALLOW'), z.literal('DENY')]);

/**
 * States whether a {@link Permission} should be ALLOW or DENY.
 */
export type Effect = z.infer<typeof EffectParser>;
