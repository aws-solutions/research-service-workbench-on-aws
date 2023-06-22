/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
export default class RandomTextGenerator {
  private _runId: string;
  public constructor(runId: string) {
    this._runId = runId;
  }

  public getFakeText(text: string): string {
    return `${this._runId}-${text}-${this._getRandomNumberAsString()}`;
  }

  private _getRandomNumberAsString(): string {
    const num = Math.round(Math.random() * 1000000000) + 1;
    return num.toString();
  }
}
