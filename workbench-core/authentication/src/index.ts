/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import CreateRoleSchema from './schemas/createRole';
import CreateUserSchema from './schemas/createUser';
import UpdateRoleSchema from './schemas/updateRole';

export { AuthenticationPlugin } from './authenticationPlugin';
export { AuthenticationService } from './authenticationService';
export { User } from './user';
export { UserManagementPlugin } from './userManagementPlugin';
export {
  CognitoAuthenticationPlugin,
  CognitoAuthenticationPluginOptions
} from './plugins/cognitoAuthenticationPlugin';
export { InvalidJWTError, isInvalidJWTError } from './errors/invalidJwtError';
export {
  InvalidAuthorizationCodeError,
  isInvalidAuthorizationCodeError
} from './errors/invalidAuthorizationCodeError';
export { PluginConfigurationError, isPluginConfigurationError } from './errors/pluginConfigurationError';
export { InvalidTokenTypeError, isInvalidTokenTypeError } from './errors/invalidTokenTypeError';
export { InvalidCodeVerifierError, isInvalidCodeVerifierError } from './errors/invalidCodeVerifierError';
export { InvalidTokenError, isInvalidTokenError } from './errors/invalidTokenError';
export { IdpUnavailableError, isIdpUnavailableError } from './errors/idpUnavailableError';
export { InvalidParameterError, isInvalidParameterError } from './errors/invalidParameterError';
export { RoleAlreadyExistsError, isRoleAlreadyExistsError } from './errors/roleAlreadyExistsError';
export { RoleNotFoundError, isRoleNotFoundError } from './errors/roleNotFoundError';
export { UserAlreadyExistsError, isUserAlreadyExistsError } from './errors/userAlreadyExistsError';
export { UserNotFoundError, isUserNotFoundError } from './errors/userNotFoundError';
export { DecodedJWT } from './decodedJWT';
export { Tokens } from './tokens';
export { getTimeInSeconds } from './utils';
export {
  getAuthorizationCodeUrl,
  getTokensFromAuthorizationCode,
  isUserLoggedIn,
  logoutUser,
  refreshAccessToken,
  verifyToken,
  isUserLoggedIn
} from './authenticationMiddleware';
export { CognitoUserManagementPlugin } from './plugins/cognitoUserManagementPlugin';
export { UserManagementService } from './userManagementService';
export { CreateRoleSchema, CreateUserSchema, UpdateRoleSchema };
