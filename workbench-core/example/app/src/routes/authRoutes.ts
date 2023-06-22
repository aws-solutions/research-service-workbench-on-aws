/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Auth management
import {
  AuthenticationService,
  getAuthorizationCodeUrl,
  getTokensFromAuthorizationCode,
  isUserLoggedIn,
  logoutUser,
  refreshAccessToken
} from '@aws/workbench-core-authentication';
import { LoggingService } from '@aws/workbench-core-logging';
import { Router } from 'express';
import { wrapAsync } from '../utilities/errorHandlers';

export function setUpAuthRoutes(router: Router, auth: AuthenticationService, logger: LoggingService): void {
  // Get auth provider's login URL with temporary state and PKCE strings
  router.get('/login', wrapAsync(getAuthorizationCodeUrl(auth)));

  // User would have manually logged in at this point, and received an auth code. Exchange auth code for token
  router.post(
    '/token',
    wrapAsync(getTokensFromAuthorizationCode(auth, { loggingService: logger, sameSite: 'none' }))
  );

  router.post('/logout', wrapAsync(logoutUser(auth, { loggingService: logger, sameSite: 'none' })));

  router.get('/refresh', wrapAsync(refreshAccessToken(auth, { loggingService: logger, sameSite: 'none' })));

  router.get('/loggedIn', wrapAsync(isUserLoggedIn(auth, { loggingService: logger, sameSite: 'none' })));
}
