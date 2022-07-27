/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditEntry, Writer } from '@amzn/workbench-core-audit';
import Metadata from '@amzn/workbench-core-audit/lib/metadata';
import { LoggingService } from '@amzn/workbench-core-logging';

export default class AuditLogger implements Writer {
  private _logger: LoggingService;
  public constructor(logger: LoggingService) {
    this._logger = logger;
  }
  public async write(metadata: Metadata, auditEntry: AuditEntry): Promise<void> {
    // const message = JSON.stringify(auditEntry, null, 2);
    this._logger.warn('Example warning message');

    this._logger.info('Example info message', {
      responseStatus: metadata.statusCode!,
      responseMessage: JSON.stringify(auditEntry.body)
    });

    this._logger.error('Example Error message', {
      action: metadata.action!,
      actor: JSON.stringify(metadata.actor)
    });

    this._logger.debug('Example Debug message', {
      source: JSON.stringify(metadata.source, null, 2)
    });
  }
}
