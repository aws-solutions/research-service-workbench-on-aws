/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class Ec2Error extends Error {
  public readonly isEc2Error: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isEc2Error = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, Ec2Error);
    }
  }
}

export function isEc2Error(error: unknown): error is Ec2Error {
  return Boolean(error) && error instanceof Error && (error as Ec2Error).isEc2Error === true;
}
