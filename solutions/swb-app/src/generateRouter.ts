/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Router, Express, json } from 'express';
import { setUpAccountRoutes } from './accountRoutes';
import { ApiRouteConfig } from './apiRouteConfig';
import { WithAudit } from './audit/auditMiddleware';
import AuditService from './audit/auditService';
import BaseAuditPlugin from './audit/plugins/baseAuditPlugin';
import Writer from './audit/plugins/writer';
import SwbAuditExtractor from './audit/swbAuditExtractor';
import SwbAuditLogger from './audit/swbAuditLogger';
import SwbAuditPlugin from './audit/swbAuditPlugin';
import { csurf, verifyToken } from './authentication/authenticationMiddleware';
import { AuthenticationService } from './authentication/authenticationService';
import {
  CognitoAuthenticationPlugin,
  CognitoAuthenticationPluginOptions
} from './authentication/plugins/cognitoAuthenticationPlugin';
import { TokenRevocationService } from './authentication/tokenRevocationService';
import withDynamicAuth from './authorization/dynamicAuthorization/dynamicAuthorizationMiddleware';
import { setUpAuthRoutes } from './authRoutes';
import { setUpCostCenterRoutes } from './costCenterRoutes';
import { setUpDSRoutes } from './dataSetRoutes';
import { setUpEnvRoutes } from './environmentRoutes';
import { setUpEnvTypeConfigRoutes } from './environmentTypeConfigRoutes';
import { setUpEnvTypeRoutes } from './environmentTypeRoutes';
import { boomErrorHandler, unknownErrorHandler } from './errorHandlers';
import { LoggingService } from './logging/loggingService';
import { setUpProjectEnvRoutes } from './projectEnvironmentRoutes';
import { setUpProjectEnvTypeConfigRoutes } from './projectEnvTypeConfigRoutes';
import { setUpProjectRoutes } from './projectRoutes';
import { setUpSshKeyRoutes } from './sshKeyRoutes';
import { setUpUserRoutes } from './userRoutes';

export function generateRouter(apiRouteConfig: ApiRouteConfig): Express {
  const app: Express = express();
  app.disable('x-powered-by');
  const router: Router = Router();

  app.use(
    cors({
      origin: apiRouteConfig.allowedOrigins,
      credentials: true
    })
  );
  // parse application/json
  app.use(json());
  app.use(cookieParser());
  app.use(csurf('none'));

  const tokenRevocationService: TokenRevocationService = new TokenRevocationService({
    dynamoDBSettings: {
      region: process.env.AWS_REGION!,
      table: process.env.REVOKED_TOKENS_DDB_TABLE_NAME!
    }
  });
  const cognitoPluginOptions: CognitoAuthenticationPluginOptions = {
    cognitoDomain: process.env.COGNITO_DOMAIN!,
    userPoolId: process.env.USER_POOL_ID!,
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    tokenRevocationService
  };

  const authenticationService = new AuthenticationService(
    new CognitoAuthenticationPlugin(cognitoPluginOptions)
  );

  const logger: LoggingService = new LoggingService();

  app.use(
    verifyToken(authenticationService, {
      ignoredRoutes: apiRouteConfig.routesIgnored,
      loggingService: logger
    })
  );
  app.use(withDynamicAuth(apiRouteConfig.authorizationService, { logger: logger }));

  // Auditing
  const continueOnError = false;
  const requiredAuditValues = ['actor', 'source'];
  const fieldsToMask = JSON.parse(process.env.FIELDS_TO_MASK_WHEN_AUDITING!);
  const writer: Writer = new SwbAuditLogger();
  const swbAuditPlugin: BaseAuditPlugin = new SwbAuditPlugin(writer);
  const auditService = new AuditService(swbAuditPlugin, continueOnError, requiredAuditValues, fieldsToMask);
  const excludePaths: string[] = [];
  app.use(WithAudit({ auditService, excludePaths, extractor: new SwbAuditExtractor() }));
  setUpCostCenterRoutes(router, apiRouteConfig.costCenterService, apiRouteConfig.projectService);
  setUpDSRoutes(router, apiRouteConfig.dataSetService);
  setUpAccountRoutes(router, apiRouteConfig.account);
  setUpAuthRoutes(router, authenticationService, logger);
  setUpUserRoutes(router, apiRouteConfig.userManagementService);
  setUpEnvRoutes(router, apiRouteConfig.environmentPlugin);
  setUpEnvTypeRoutes(router, apiRouteConfig.environmentTypeService);
  setUpEnvTypeConfigRoutes(router, apiRouteConfig.environmentTypeConfigService);
  setUpProjectRoutes(
    router,
    apiRouteConfig.projectPlugin,
    apiRouteConfig.environmentService,
    apiRouteConfig.metadataService,
    apiRouteConfig.userManagementService
  );
  setUpProjectEnvRoutes(router, apiRouteConfig.environments, apiRouteConfig.projectEnvPlugin);
  setUpProjectEnvTypeConfigRoutes(router, apiRouteConfig.projectEnvTypeConfigPlugin);
  setUpSshKeyRoutes(router, apiRouteConfig.sshKeyService);

  // Error handling. Order of the error handlers is important
  router.use(boomErrorHandler);
  router.use(unknownErrorHandler);

  app.use('/', router);

  return app;
}
