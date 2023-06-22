/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { LoggingService } from '@aws/workbench-core-logging';
import AuditEntry from '../auditEntry';
import Metadata from '../metadata';
import Writer from './writer';

export default class AuditLogger implements Writer {
  private _logger: LoggingService;
  public constructor(logger: LoggingService) {
    this._logger = logger;
  }

  public async write(metadata: Metadata, auditEntry: AuditEntry): Promise<void> {
    this._logger.info(JSON.stringify(auditEntry));
  }
}
