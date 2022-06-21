// Auth management
import {
  AuthenticationService,
  getAuthorizationCodeUrl,
  getTokensFromAuthorizationCode,
  logoutUser,
  refreshAccessToken
  // verifyToken
} from '@amzn/workbench-core-authentication';
import { LoggingService } from '@amzn/workbench-core-logging';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';

// Create Logger Service
const logger: LoggingService = new LoggingService();

export function setUpAuthRoutes(router: Router, auth: AuthenticationService): void {
  // Exchange auth code for token
  router.post(
    '/token',
    wrapAsync(async (req: Request, res: Response) => {
      const response = getTokensFromAuthorizationCode(auth, { loggingService: logger });
      res.send(response);
    })
  );

  router.get(
    '/login',
    wrapAsync(async (req: Request, res: Response) => {
      const response = getAuthorizationCodeUrl(auth);
      res.send(response);
    })
  );

  router.get(
    '/logout',
    wrapAsync(async (req: Request, res: Response) => {
      const response = logoutUser(auth, { loggingService: logger });
      res.send(response);
    })
  );

  router.get(
    '/refresh',
    wrapAsync(async (req: Request, res: Response) => {
      const response = refreshAccessToken(auth, { loggingService: logger });
      res.send(response);
    })
  );
}
