/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export interface Tokens {
  idToken: {
    token: string;
    expiresIn?: number; // seconds
  };
  accessToken: {
    token: string;
    expiresIn?: number; // seconds
  };
  refreshToken?: {
    token: string;
    expiresIn?: number; // seconds
  };
}
