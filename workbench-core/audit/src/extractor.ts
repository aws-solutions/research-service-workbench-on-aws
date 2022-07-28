/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import Metadata from './metadata';

/**
 * Interface for an Extractor.
 */
export interface Extractor {
  /**
   * Extract metadata from express's {@link Request} and {@link Response}.
   *
   * @param req - {@link Request}
   * @param res - {@link Response}
   * @returns - {@link Metadata}
   *
   * @throws - {@link Error} when encountering issues extracting metadata.
   */
  getMetadata: (req: Request, res: Response) => Metadata;
}
