/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import AuditEntry from '../auditEntry';
import Metadata from '../metadata';

/**
 * This is an interface for the writer and enables an extension to write to desire output source.
 *
 * Steps to create a writer:
 * 1. Implement this interface.
 * 2. Define the write functionality
 * 3. This function will be where the output source is defined.
 * This could be a Logger, DynamoDB table, etc.
 *
 * If additional modifications need to be done to the {@link AuditEntry}:
 * Implement the prepare functionality and insert necessary modifications.
 *
 * @example
 * Here is an example using the logger as the output source.
 * ```
 * class AuditLogger implements Writer {
 *  private logger:Logger;
 *  public async write(metadata:Metadata, auditEntry: AuditEntry): Promise<void> {
 *   logger.info(auditEntry);
 *  }
 * }
 * ```
 *
 */
export default interface Writer {
  /**
   * Write the audit entry to an output source.
   * @param metadata - {@link Metadata}
   * @param auditEntry - {@link AuditEntry}
   */
  write(metadata: Metadata, auditEntry: AuditEntry): Promise<void>;
  /**
   * Prepare the audit entry to be written.
   * @param metadata - {@link Metadata}
   * @param auditEntry - {@link AuditEntry}
   */
  prepare?(metadata: Metadata, auditEntry: AuditEntry): Promise<void>;
}
