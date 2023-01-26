/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { httpApiGet, httpApiPost, httpApiPut, httpApiDelete } from './api/apiHelper';
import { login, logout, token, checkIfLoggedIn } from './api/auth';
import { addUserToRole, createUser, useUsers } from './api/users';
import { TerminateWarning } from './common/alerts';
import { relativeOptions, datei18nStrings } from './common/dateRelativeOptions';
import { isValidRangeFunction, convertToAbsoluteRange } from './common/dateRelativeProperties';
import { i18nStrings, layoutLabels, paginationLables, headerLabels, NavigationLabels } from './common/labels';
import { getFilterCounterText } from './common/tableCounterStrings';
import { TableEmptyDisplay } from './common/tableEmptyState';
import { TableNoMatchDisplay } from './common/tableNoMatchState';
import { nameRegex, cidrRegex, emailRegex, convertToRecord } from './common/utils';
import BaseLayout from './components/BaseLayout';
import Header from './components/Header';
import Hero from './components/Hero';
import Login from './components/Login';
import Navigation from './components/Navigation';
import RouteGuard from './components/RouteGuard';
import { AuthenticationProvider, useAuthentication } from './context/AuthenticationContext';
import { NotificationsProvider, useNotifications } from './context/NotificationContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { defaultAppSettings } from './models/AppSettings';
import {
  researcherUser,
  adminUser,
  type CreateUserForm,
  type CreateUserFormValidation,
  type UserItem
} from './models/User';

export {
  // From '/api' folder
  httpApiGet,
  httpApiPost,
  httpApiPut,
  httpApiDelete,
  login,
  logout,
  token,
  checkIfLoggedIn,
  addUserToRole,
  createUser,
  useUsers,
  // From '/common' folder:
  TerminateWarning,
  isValidRangeFunction,
  convertToAbsoluteRange,
  getFilterCounterText,
  TableEmptyDisplay,
  TableNoMatchDisplay,
  convertToRecord,
  relativeOptions,
  datei18nStrings,
  i18nStrings,
  layoutLabels,
  paginationLables,
  headerLabels,
  NavigationLabels,
  nameRegex,
  cidrRegex,
  emailRegex,
  // From '/components' folder
  BaseLayout,
  Header,
  Hero,
  Navigation,
  Login,
  RouteGuard,
  // From '/context' folder
  AuthenticationProvider,
  useAuthentication,
  NotificationsProvider,
  useNotifications,
  SettingsProvider,
  useSettings,
  // From '/models' folder
  defaultAppSettings,
  researcherUser,
  adminUser,
  CreateUserForm,
  CreateUserFormValidation,
  UserItem
};
