/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Json } from 'aws-jwt-verify/safe-json-parse';

// https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-token-claims
export interface DecodedJWT {
  iss?: string; // Issuer of the JWT
  sub?: string; // Subject of the JWT
  aud?: string | string[]; // Recipient for which the JWT is intended
  exp?: number; // Time after which the JWT expires
  nbf?: number; // Time before which the JWT must not be accepted for processing
  iat?: number; // Time at which the JWT was issued; can be used to determine age of the JWT
  jti?: string; // Unique identifier; can be used to prevent the JWT from being replayed (allows a token to be used only once)
  [key: string]: Json | undefined;
}
