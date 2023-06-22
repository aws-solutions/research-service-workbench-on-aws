/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export { AuthenticationPlugin } from './authenticationPlugin';
export { AuthenticationService } from './authenticationService';
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
export { DecodedJWT } from './decodedJWT';
export { Tokens } from './tokens';
export { getTimeInMS, TimeUnits } from './utils';
export { TokenRevocationService } from './tokenRevocationService';
export {
  csurf,
  getAuthorizationCodeUrl,
  getTokensFromAuthorizationCode,
  isUserLoggedIn,
  logoutUser,
  refreshAccessToken,
  verifyToken
} from './authenticationMiddleware';
