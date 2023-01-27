/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { UpdateUserRequest, UpdateUserRequestParser } from './models/updateUserRequest';
import CreateRoleSchema from './schemas/createRole';
import CreateUserSchema from './schemas/createUser';
import UpdateRoleSchema from './schemas/updateRole';

export { Status, User, CreateUser } from './user';
export { UserManagementPlugin } from './userManagementPlugin';
export { PluginConfigurationError, isPluginConfigurationError } from './errors/pluginConfigurationError';
export { IdpUnavailableError, isIdpUnavailableError } from './errors/idpUnavailableError';
export { InvalidParameterError, isInvalidParameterError } from './errors/invalidParameterError';
export { RoleAlreadyExistsError, isRoleAlreadyExistsError } from './errors/roleAlreadyExistsError';
export { RoleNotFoundError, isRoleNotFoundError } from './errors/roleNotFoundError';
export { TooManyRequestsError, isTooManyRequestsError } from './errors/tooManyRequestsError';
export { UserAlreadyExistsError, isUserAlreadyExistsError } from './errors/userAlreadyExistsError';
export { UserNotFoundError, isUserNotFoundError } from './errors/userNotFoundError';
export { CognitoUserManagementPlugin } from './plugins/cognitoUserManagementPlugin';
export { UserManagementService } from './userManagementService';
export { CreateRoleSchema, CreateUserSchema, UpdateRoleSchema, UpdateUserRequest, UpdateUserRequestParser };
