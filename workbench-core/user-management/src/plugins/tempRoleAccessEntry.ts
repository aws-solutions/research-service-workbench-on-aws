/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from "zod";


// eslint-disable-next-line @rushstack/typedef-var
export const AccessTypeParser = z.union([z.literal('ALLOW'), z.literal('DENY')]);

// eslint-disable-next-line @rushstack/typedef-var
export const TempRoleAccessEntryParser = z.object({
    /**
     * Role that will temporarily be revoked/granted access
     */
    roleId: z.string(),
    /**
     * The access which should apply to the role
     */
    access: AccessTypeParser,
    /**
     * The given time for expiration in DynamoDB(MUST ENABLE TTL)
     */
    expirationTime: z.number(),

    /**
     * The identity represents a compound key of the TempRoleAccessPrefix and roleId 
     */
    identity: z.string()
});


// eslint-disable-next-line @rushstack/typedef-var
export const TempRoleAccessItemParser = z.object({
    /**
     * Partition Key is a compound key of the TempRoleAccessPrefix and userId
     */
    pk: z.string(),

    /**
     * Sort Key is a compound key of the TempRoleAccessPrefix and roleId
     */
    sk: z.string(),
    /**
     * Role that will temporarily be revoked/granted access
     */
    roleId: z.string(),
    /**
     * The access which should apply to the role
     */
    access: AccessTypeParser,
    /**
     * The given time for expiration in DynamoDB(MUST ENABLE TTL)
     */
    expirationTime: z.number(),

    /**
     * The identity represents a compound key of the TempRoleAccessPrefix and roleId 
     */
    identity: z.string()
});
/**
 * The access which should apply to the role
 */
export type AccessType = z.infer<typeof AccessTypeParser>;
/**
 * The temporary access entry in DynamoDB
 */
export type TempRoleAccessEntry = z.infer<typeof TempRoleAccessEntryParser>;