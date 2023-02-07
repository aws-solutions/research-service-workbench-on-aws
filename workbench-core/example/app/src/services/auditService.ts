/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditLogger, AuditService, BaseAuditPlugin, Writer } from '@aws/workbench-core-audit';
import { logger } from './loggingService';

const writer: Writer = new AuditLogger(logger);
const baseAuditPlugin: BaseAuditPlugin = new BaseAuditPlugin(writer);

export const auditService: AuditService = new AuditService(baseAuditPlugin, true);

export const strictAuditService: AuditService = new AuditService(baseAuditPlugin);
