/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import { JSONValueParser } from './auditEntry';

// eslint-disable-next-line @rushstack/typedef-var
export const MetadataParser = z.record(z.any()).and(
  z.object({
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
 * Interface that enables metadata to be passed to the {@link AuditService}
 */
type Metadata = z.infer<typeof MetadataParser>;

export default Metadata;
