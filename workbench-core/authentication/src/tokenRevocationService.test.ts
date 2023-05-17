/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  DynamoDBClient,
  ServiceOutputTypes,
  ServiceInputTypes,
  UpdateItemCommand,
  GetItemCommand
} from '@aws-sdk/client-dynamodb';
import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import { InvalidJWTError } from './errors/invalidJwtError';
import { TokenRevocationService } from './tokenRevocationService';

describe('tokenRevocationService unit tests', () => {
  let tokenRevocationService: TokenRevocationService;
  let region: string;
  let revokedTokenDDBTableName: string;
  let mockDDB: AwsStub<ServiceInputTypes, ServiceOutputTypes>;
  let token: string;
  let signature: string;
  beforeAll(() => {
    region = 'us-east-1';
    revokedTokenDDBTableName = 'sampleRevokedTokensTableName';
    tokenRevocationService = new TokenRevocationService({
      dynamoDBSettings: {
        region,
        table: revokedTokenDDBTableName
      }
    });
    mockDDB = mockClient(DynamoDBClient);
    signature = '_YGCKnYZM1VyZqRiok_fs3fRan1WTMBYPZZ5BsF9e4w';
    token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZXN0IjoidmFsdWUiLCJpYXQiOjE2MDYyMTQ1OTR9.${signature}`;
  });

  beforeEach(() => {
    expect.hasAssertions();
    mockDDB.reset();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('revokeToken', () => {
    it('Invalid JWT should throw InvalidJWTError', async () => {
      await expect(
        tokenRevocationService.revokeToken({
          token: 'invalidToken'
        })
      ).rejects.toThrow(InvalidJWTError);
    });

    it('Valid JWT should be revoked', async () => {
      mockDDB.on(UpdateItemCommand).resolvesOnce({});
      await expect(
        tokenRevocationService.revokeToken({
          token
        })
      ).resolves.not.toThrow();
    });
  });

  describe('isRevoked', () => {
    it('Invalid JWT should throw InvalidJWTError', async () => {
      await expect(
        tokenRevocationService.isRevoked({
          token: 'invalidToken'
        })
      ).rejects.toThrow(InvalidJWTError);
    });

    it('JWT exist in revokedTable should be revoked', async () => {
      mockDDB.on(GetItemCommand).resolvesOnce({
        Item: {
          ttl: {
            S: 'sampleTTL'
          }
        }
      });
      await expect(
        tokenRevocationService.isRevoked({
          token
        })
      ).resolves.toStrictEqual(true);
    });

    it('JWT does not exist in revokedTable should not be revoked', async () => {
      mockDDB.on(GetItemCommand).resolves({});
      await expect(
        tokenRevocationService.isRevoked({
          token
        })
      ).resolves.toStrictEqual(false);
    });
  });
});
