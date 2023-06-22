/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { JSONValue } from '@aws/workbench-core-base';
import { z } from 'zod';
import { ActionParser } from '../../models/action';
import { EffectParser } from '../../models/effect';

// eslint-disable-next-line @rushstack/typedef-var
export const IdentityTypeParser = z.union([z.literal('GROUP'), z.literal('USER')]);

/**
 * The type of identity requesting access
 */
export type IdentityType = z.infer<typeof IdentityTypeParser>;

// eslint-disable-next-line @rushstack/typedef-var
export const IdentityParser = z.object({
  identityType: IdentityTypeParser,
  identityId: z.string()
});

export type Identity = z.infer<typeof IdentityParser>;
/* istanbul ignore next */
export const JSONValueParser: z.ZodSchema<JSONValue> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.record(JSONValueParser), z.array(JSONValueParser)])
);

// eslint-disable-next-line @rushstack/typedef-var
export const IdentityPermissionParser = z
  .object({
    /**
     * {@link IdentityType}
     */
    identityType: IdentityTypeParser,

    /**
     * IdentityID associated to the permission
     */
    identityId: z.string(),

    /**
     * The {@link Effect} of a Permission.
     */
    effect: EffectParser,

    /**
     * The subject type that the {@link Action} acts on.
     */
    action: ActionParser,

    /**
     * The subject that the {@link Action} acts on.
     */
    subjectType: z.string(),

    /**
     * The id associated to the subject
     * Capable of using a wildcard '*' to represent all ids
     */
    subjectId: z.string(),

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
export type IdentityPermission = z.infer<typeof IdentityPermissionParser>;
