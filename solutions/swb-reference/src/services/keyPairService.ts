/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  CreateKeyPairRequest,
  CreateKeyPairResponse,
  DeleteKeyPairRequest,
  GetKeyPairRequest,
  GetKeyPairResponse,
  KeyPair,
  KeyPairParser,
  KeyPairPlugin,
  ListKeyPairsRequest,
  SendPublicKeyRequest,
  SendPublicKeyResponse,
  DatabaseError,
  NoKeyExistsError,
  NonUniqueKeyError
} from '@aws/swb-app';
import { DynamoDBService, PaginatedResponse } from '@aws/workbench-core-base';

export default class KeyPairService implements KeyPairPlugin {
  private _dynamoDbService: DynamoDBService;
  // TODO: have this be 'keyPair' in workbench-core since SWB ref uses ssh key but other apps might use diff keys
  private _resourceType: string = 'sshKey';
  public constructor(dynamoDbService: DynamoDBService) {
    this._dynamoDbService = dynamoDbService;
  }

  /**
   * Gets a Key Pair record
   *
   * @param request - a {@link GetKeyPairRequest}
   * @returns a {@link KeyPair}
   */
  public async getKeyPair(request: GetKeyPairRequest): Promise<GetKeyPairResponse> {
    // TODO implement
    throw new Error('Method not implemented.');
  }

  /**
   * Lists Key Pair records
   *
   * @param request - a {@link ListKeyPairsRequest}
   * @returns a {@link PaginatedResponse} of {@link KeyPair}s
   */
  public async listKeyPairs(request: ListKeyPairsRequest): Promise<PaginatedResponse<KeyPair>> {
    // TODO implement
    throw new Error('Method not implemented.');
  }

  /**
   * Deletes a Key Pair record
   *
   * @param request - a {@link DeleteKeyPairRequest}
   */
  public async deleteKeyPair(request: DeleteKeyPairRequest): Promise<void> {
    const { userId, projectId } = request;
    // check if project exists
    const queryResult = await this._dynamoDbService.getPaginatedItems({
      index: 'getResourceByOwner',
      key: { name: 'resourceType', value: this._resourceType },
      sortKey: userId,
      filter: `dependency = ${projectId}`
    });

    if (queryResult.data === undefined || queryResult.data.length === 0) {
      throw new NoKeyExistsError(`No key exists for user ${userId} and project ${projectId}`);
    }
    if (queryResult.data.length > 1) {
      throw new NonUniqueKeyError(
        `More than one key exists for user ${userId} and project ${projectId}. Cannot determine which to delete.`
      );
    }

    const existingKeyPair = queryResult.data[0];

    // HARD delete item
    try {
      await this._dynamoDbService.deleteItem({ key: { pk: existingKeyPair.pk, sk: existingKeyPair.sk } });
    } catch (e) {
      throw new DatabaseError(e.message);
    }
  }

  /**
   * Creates a Key Pair record
   *
   * @param request - a {@link CreateKeyPairRequest}
   * @returns a {@link CreateKeyPairResponse}
   */
  public async createKeyPair(request: CreateKeyPairRequest): Promise<CreateKeyPairResponse> {
    // TODO implement
    throw new Error('Method not implemented.');
  }

  /**
   * Sends the public key of a Key Pair to the designated environment to allow connection
   *
   * @param request - a {@link SendPublicKeyRequest}
   */
  public async sendPublicKey(request: SendPublicKeyRequest): Promise<SendPublicKeyResponse> {
    // TODO implement
    throw new Error('Method not implemented.');
  }

  /**
   * This method formats a Key Pair object as a DDB item containing key pair data
   *
   * @param keyPair - the {@link KeyPair} object to prepare for DDB
   * @returns an object containing key pair data as well as pertinent DDB attributes based on key pair data
   */
  private _mapToDDBItemFromKeyPair(keyPair: KeyPair): Record<string, string> {
    const dynamoItem: Record<string, string> = {
      ...keyPair,
      resourceType: this._resourceType,
      dependency: keyPair.projectId
    };

    delete dynamoItem.projectId;

    return dynamoItem;
  }

  /**
   * Formats a DDB Item containing key pair data as a {@link KeyPair} object
   *
   * @param item - the DDB item to convert to a Key Pair object
   * @returns a Key Pair object containing only key pair data from DDB attributes
   */
  private _mapDDBItemToKeyPair(item: Record<string, unknown>): KeyPair {
    const keyPair: Record<string, unknown> = { ...item, projectId: item.dependency };

    // parse will remove pk, sk, and resourceType from the DDB Item
    return KeyPairParser.parse(keyPair);
  }
}
