/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { Extractor } from '../extractor';
import Metadata from '../metadata';

export const mockMetadata: Metadata = {
  action: 'GET /user',
  source: { ip: 'sampleIp' },
  actor: { uid: ' sampleId' }
};

export const BaseExtractor: Extractor = {
  getMetadata: jest.fn((req: Request, res: Response): Metadata => {
    return {
      action: 'GET /user',
      source: { ip: 'sampleIp' },
      actor: { uid: ' sampleId' }
    };
  })
};
