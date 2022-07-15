import { AuthenticatedUser, retrieveUser } from '@amzn/workbench-core-authorization';
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
    try {
      const action = generateAction(req.method, req.originalUrl);

      // Sets source to be the ip address
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const source = {
        ip
      };

      // Sets actor to be the AuthenticatedUser's id.
      const authenticatedUser: AuthenticatedUser = retrieveUser(res);
      const actor = {
        uid: authenticatedUser.id
      };

      const metadata: Metadata = {
        action,
        source,
        actor
      };
      return metadata;
    } catch (err) {
      throw new Error('Error extracting metadata');
    }
  }
};
