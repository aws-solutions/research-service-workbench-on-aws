/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { ActionParser } from '../../models/action';
import { EffectParser } from '../../models/effect';
import { JSONValueParser } from './identityPermission';

// eslint-disable-next-line @rushstack/typedef-var
export const IdentityPermissionItemParser = z
  .object({
    /**
     * Partition key of a Permission.
     */
    pk: z.string(),

    /**
     * Sort key of a Permission.
     */
    sk: z.string(),

    /**
     * The user or group associated with a Permission.
     */
    identity: z.string(),

    /**
     * The {@link Effect} of a Permission.
     */
    effect: EffectParser,

    /**
     * The subject type that the {@link Action} acts on.
     */
    action: ActionParser,

    /**
     * Used to restrict a {@link User}'s action to a subject's field.
     *
     * @example
     * Allows User update access to only 'method';
     * ```
     *  class Article {
     *    method() {
     *    }
     *    methodTwo() {
     *    }
     *  }
     *
     * const permission:Permission = {
     *  action: Action.UPDATE,
     *  subject: 'Article',
     *  fields: ['method']
     * };
     * ```
     */
    fields: z.array(z.string()).optional(),
    /**
     * Used to conditionally restrict a {@link User}'s action
     */
    conditions: z.record(JSONValueParser).optional(),
    /**
     * Description of permission
     */
    description: z.string().optional()
  })
  .strict();

/**
 * Represents an Identity Permission
 */
export type IdentityPermissionItem = z.infer<typeof IdentityPermissionItemParser>;
