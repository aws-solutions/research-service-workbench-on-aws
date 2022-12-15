import { BaseExtractor, Extractor, Metadata } from '@aws/workbench-core-audit';
import { Request, Response } from 'express';

export default class SwbAuditExtractor implements Extractor {
  public getMetadata(req: Request, res: Response): Metadata {
    const baseMetadata = BaseExtractor.getMetadata(req, res);
    return { ...baseMetadata, body: req.body, params: req.params };
  }
}
