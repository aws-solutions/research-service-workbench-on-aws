/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { SSM } from '@aws-sdk/client-ssm';

export interface SecretsServiceInterface {
  getSecret(name: string): Promise<string>;
}

export class SecretsService implements SecretsServiceInterface {
  private _ssm: SSM;

  public constructor(ssm: SSM) {
    this._ssm = ssm;
  }

  public async getSecret(name: string): Promise<string> {
    const response = await this._ssm.getParameter({
      Name: name,
      WithDecryption: true
    });

    return response.Parameter!.Value!;
  }
}
