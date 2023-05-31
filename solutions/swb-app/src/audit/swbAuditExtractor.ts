/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { BaseExtractor } from './baseExtractor';
import { Extractor } from './extractor';
import Metadata from './metadata';

export default class SwbAuditExtractor implements Extractor {
  public getMetadata(req: Request, res: Response): Metadata {
    const baseMetadata = BaseExtractor.getMetadata(req, res);
    return { ...baseMetadata, body: req.body };
  }
}
