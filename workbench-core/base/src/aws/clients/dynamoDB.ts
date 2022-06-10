/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
  QueryCommandInput,
  QueryCommand,
  QueryCommandOutput,
  GetItemCommandInput,
  GetItemCommandOutput,
  GetItemCommand,
  BatchGetItemCommand,
  BatchGetItemCommandInput,
  BatchGetItemCommandOutput,
  UpdateItemCommand,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
  DeleteItemCommand,
  DeleteItemCommandInput,
  DeleteItemCommandOutput,
  BatchWriteItemCommand,
  BatchWriteItemCommandInput,
  BatchWriteItemCommandOutput,
  TransactWriteItemsCommandInput,
  TransactWriteItemsCommandOutput,
  TransactWriteItemsCommand
} from '@aws-sdk/client-dynamodb';

export default class DynamoDB {
  private _client: DynamoDBClient;
  public constructor(config: { region: string }) {
    this._client = new DynamoDBClient({ ...config });
  }
  public async scan(params: ScanCommandInput): Promise<ScanCommandOutput> {
    return await this._client.send(new ScanCommand(params));
  }
  public async query(params: QueryCommandInput): Promise<QueryCommandOutput> {
    return await this._client.send(new QueryCommand(params));
  }

  public async get(params: GetItemCommandInput): Promise<GetItemCommandOutput> {
    return this._client.send(new GetItemCommand(params));
  }

  public async batchGet(params: BatchGetItemCommandInput): Promise<BatchGetItemCommandOutput> {
    return await this._client.send(new BatchGetItemCommand(params));
  }

  public async update(params: UpdateItemCommandInput): Promise<UpdateItemCommandOutput> {
    return await this._client.send(new UpdateItemCommand(params));
  }

  public async delete(params: DeleteItemCommandInput): Promise<DeleteItemCommandOutput> {
    return await this._client.send(new DeleteItemCommand(params));
  }

  public async batchWriteOrDelete(params: BatchWriteItemCommandInput): Promise<BatchWriteItemCommandOutput> {
    return await this._client.send(new BatchWriteItemCommand(params));
  }

  public async transactWrite(
    params: TransactWriteItemsCommandInput
  ): Promise<TransactWriteItemsCommandOutput> {
    return await this._client.send(new TransactWriteItemsCommand(params));
  }
}
