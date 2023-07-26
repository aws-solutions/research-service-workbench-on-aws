/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';

/* istanbul ignore next */
export const JSONValueParser: z.ZodSchema = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.record(JSONValueParser), z.array(JSONValueParser)])
);
// eslint-disable-next-line @rushstack/typedef-var
export const AuditEntryParser = z.record(z.any()).and(
  z.object({
    /**
     * When in a log group, this is used differentiate the audit entry.
     */
    logEventType: z.string().optional(),

    /**
     * The body for the audit entry
     */
    body: z.any().optional(),

    /**
     * The status code of the request
     */
    statusCode: z.number().optional(),

    /**
     * The status of the request
     */
    status: z.string().optional(),

    /**
     * The requested action
     */
    action: z.string().optional(),

    /**
     * The actor that is performing the action.
     */
    actor: z.record(JSONValueParser).optional(),

    /**
     * The source of where the request is coming from.
     */
    source: z.record(JSONValueParser).optional()
  })
);

/**
 * An interface containing the necessary values for an audit entry.
 */
type AuditEntry = z.infer<typeof AuditEntryParser>;

export default AuditEntry;
