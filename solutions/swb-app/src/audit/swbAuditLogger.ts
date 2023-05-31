/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import AuditEntry from './auditEntry';
import Writer from './plugins/writer';

export default class SwbAuditLogger implements Writer {
  public async write(metadata: unknown, auditEntry: AuditEntry): Promise<void> {
    console.log(auditEntry);
  }
}
