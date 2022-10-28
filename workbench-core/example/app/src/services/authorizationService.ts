/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AuthorizationService,
  CASLAuthorizationPlugin,
  PermissionsMap,
  RoutesIgnored,
  RoutesMap,
  StaticPermissionsPlugin
} from '@aws/workbench-core-authorization';
import * as StaticPermissionsConfig from '../configs/staticPermissionsConfig';
import * as StaticRoutesConfig from '../configs/staticRouteConfig';
import { logger } from './loggingService';

const staticPermissionsMap: PermissionsMap = StaticPermissionsConfig.permissionsMap;
const staticRoutesMap: RoutesMap = StaticRoutesConfig.routesMap;
const staticRoutesIgnored: RoutesIgnored = StaticRoutesConfig.routesIgnored;
const staticPermissionsPlugin: StaticPermissionsPlugin = new StaticPermissionsPlugin(
  staticPermissionsMap,
  staticRoutesMap,
  staticRoutesIgnored,
  logger
);

const caslAuthorizationsPlugin: CASLAuthorizationPlugin = new CASLAuthorizationPlugin();
const authorizationService: AuthorizationService = new AuthorizationService(
  caslAuthorizationsPlugin,
  staticPermissionsPlugin
);

export { authorizationService, staticRoutesIgnored };
