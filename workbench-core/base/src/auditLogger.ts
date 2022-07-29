/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Writer, AuditEntry } from '@amzn/workbench-core-audit';
import { LoggingService } from '@amzn/workbench-core-logging';

export default class AuditLogger implements Writer {
  private _logger: LoggingService;
  public constructor(logger: LoggingService) {
    this._logger = logger;
  }

  public async write(metadata: unknown, auditEntry: AuditEntry): Promise<void> {
    this._logger.info('test', {});
  }
}
