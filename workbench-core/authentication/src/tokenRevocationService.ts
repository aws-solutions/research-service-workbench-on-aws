/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DynamoDBService, buildDynamoDBPkSk } from '@aws/workbench-core-base';
import jwtDecode from 'jwt-decode';
import _ from 'lodash';
import { InvalidJWTError } from './errors/invalidJwtError';

interface TokenRevocationRecord {
  key: {
    pk: string;
    sk: string;
  };
  item: {
    ttl: number;
  };
}
/**
 * Service used to revoke tokens
 */
export class TokenRevocationService {
  private readonly _tokenRevocationType: string = 'REVOKEDTOKEN';
  private _ddbService: DynamoDBService;
  public constructor(options: {
    dynamoDBSettings: {
      region: string;
      table: string;
    };
  }) {
    const { dynamoDBSettings } = options;
    this._ddbService = new DynamoDBService(dynamoDBSettings);
  }
  /**
   * Revoke given token
   * @param revokeTokenRequest - requires the token to be revoked
   */
  public async revokeToken(revokeTokenRequest: { token: string }): Promise<void> {
    const { token } = revokeTokenRequest;
    const { key, item } = this._transformToTokenRevocationRecord(token);

    await this._ddbService.updateExecuteAndFormat({
      key,
      params: {
        item
      }
    });
  }
  /**
   * Checks if a given token is revoked
   * @param isRevokedRequest - requires the token to be checked
   * @returns
   */
  public async isRevoked(isRevokedRequest: { token: string }): Promise<boolean> {
    const { token } = isRevokedRequest;

    const { key } = this._transformToTokenRevocationRecord(token);
    const item = await this._ddbService.getItem({
      key
    });
    return !!item;
  }

  private _transformToTokenRevocationRecord(token: string): TokenRevocationRecord {
    try {
      const payload = jwtDecode(token);
      // Store using the signature to prevent storing access tokens
      const signature = token.split('.')[2];

      const key = buildDynamoDBPkSk(signature, this._tokenRevocationType);

      const item = {
        ttl: _.get(payload, 'exp', 0)
      };
      return {
        key,
        item
      };
    } catch (error) {
      throw new InvalidJWTError('token is invalid');
    }
  }
}
