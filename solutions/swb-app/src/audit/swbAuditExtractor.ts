/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { BaseExtractor, Extractor, Metadata } from '@aws/workbench-core-audit';
import { Request, Response } from 'express';

export default class SwbAuditExtractor implements Extractor {
  public getMetadata(req: Request, res: Response): Metadata {
    const baseMetadata = BaseExtractor.getMetadata(req, res);
    return { ...baseMetadata, body: req.body };
  }
}
