/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import AuditService from './auditService';
import { BaseExtractor } from './baseExtractor';
import { Extractor } from './extractor';
import Metadata from './metadata';

/**
 * Configuration for the audit middleware
 */
export interface AuditConfig {
  /**
   * {@link AuditService}.
   */
  auditService: AuditService;

  /**
   * Paths to be excluded from auditing.
   */
  excludePaths: string[];

  /**
   * Specific extractor for metadata information.
   */
  extractor?: Extractor;
}

/**
 * Generate the audit middleware with {@link AuditConfig}.
 * @param auditConfig  - {@link AuditConfig}
 * @returns an audit middleware function.
 */
export function WithAudit(
  auditConfig: AuditConfig
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  /**
   * Audit Middleware
   */
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const path = req.path;
    // Checks for if path should be audited.
    if (auditConfig.excludePaths.includes(path)) {
      next();
      return;
    }
    const extractor = auditConfig.extractor ?? BaseExtractor;
    const metadata: Metadata = extractor.getMetadata(req, res);
    next();
    metadata.statusCode = res.statusCode;

    // TODO: include the option to audit response body
    await auditConfig.auditService.write(metadata);
  };
}
