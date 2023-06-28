/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

enum ErrorMessages {
  invalidArgument = 'Invalid argument'
}

class InvalidArgumentError extends Error {
  public constructor() {
    super(ErrorMessages.invalidArgument);

    Object.setPrototypeOf(this, InvalidArgumentError.prototype);
  }
}

export { InvalidArgumentError };
