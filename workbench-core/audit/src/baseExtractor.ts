/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { Extractor } from './extractor';
import Metadata from './metadata';

/**
 * Generates an action given method and url.
 *
 * @param method - HTTPS method.
 * @param url - The URL path.
 * @returns a string constructed of the method and url.
 */
function generateAction(method: string, url: string): string {
  return `${method} ${url}`;
}
/**
 * Base Extractor
 */
export const BaseExtractor: Extractor = {
  getMetadata: function (req: Request, res: Response): Metadata {
    const action = generateAction(req.method, req.originalUrl);

    // Sets source to be the ip address
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const source = {
      ip
    };

    // Sets actor to be the AuthenticatedUser's id.
    let actor = { uid: 'user not found' };
    if (res.locals.user) {
      const authenticatedUser = res.locals.user;
      actor = {
        uid: authenticatedUser.id
      };
    }

    const metadata: Metadata = {
      action,
      source,
      actor
    };
    return metadata;
  }
};
