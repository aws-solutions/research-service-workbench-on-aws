// Auth management
import {
  AuthenticationService,
  getAuthorizationCodeUrl,
  getTokensFromAuthorizationCode,
  logoutUser,
  refreshAccessToken
} from '@amzn/workbench-core-authentication';
import { LoggingService } from '@amzn/workbench-core-logging';
import { Router } from 'express';
import { wrapAsync } from './errorHandlers';

export function setUpAuthRoutes(router: Router, auth: AuthenticationService, logger: LoggingService): void {
  // Exchange auth code for token
  router.post('/token', wrapAsync(getTokensFromAuthorizationCode(auth, { loggingService: logger })));

  router.get('/login', wrapAsync(getAuthorizationCodeUrl(auth)));

  router.get('/logout', wrapAsync(logoutUser(auth, { loggingService: logger })));

  router.get('/refresh', wrapAsync(refreshAccessToken(auth, { loggingService: logger })));
}
