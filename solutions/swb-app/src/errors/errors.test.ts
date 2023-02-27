/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsServiceError, isAwsServiceError } from './awsServiceError';
import { ConflictError, isConflictError } from './conflictError';
import {
  ConnectionInfoNotDefinedError,
  isConnectionInfoNotDefinedError
} from './connectionInfoNotDefinedError';
import { DuplicateKeyError, isDuplicateKeyError } from './duplicateKeyError';
import { Ec2Error, isEc2Error } from './ec2Error';
import { isNoInstanceFoundError, NoInstanceFoundError } from './noInstanceFoundError';
import { isNoKeyExistsError, NoKeyExistsError } from './noKeyExistsError';
import { isNonUniqueKeyError, NonUniqueKeyError } from './nonUniqueKeyError';
import { isProjectDeletedError, ProjectDeletedError } from './projectDeletedError';

describe('custom error tests', () => {
  test('noKeyExistsError', () => {
    const noKeyExistsError = new NoKeyExistsError();
    expect(isNoKeyExistsError(noKeyExistsError)).toBe(true);
  });

  test('nonUniqueKeyError', () => {
    const nonUniqueKeyError = new NonUniqueKeyError();
    expect(isNonUniqueKeyError(nonUniqueKeyError)).toBe(true);
  });

  test('ec2Error', () => {
    const ec2Error = new Ec2Error();
    expect(isEc2Error(ec2Error)).toBe(true);
  });

  test('awsServiceError', () => {
    const awsServiceError = new AwsServiceError();
    expect(isAwsServiceError(awsServiceError)).toBe(true);
  });

  test('conflictError', () => {
    const conflictError = new ConflictError();
    expect(isConflictError(conflictError)).toBe(true);
  });

  test('duplicateKeyError', () => {
    const duplicateKeyError = new DuplicateKeyError();
    expect(isDuplicateKeyError(duplicateKeyError)).toBe(true);
  });

  test('connectionInfoNotDefinedError', () => {
    const connectionInfoNotDefinedError = new ConnectionInfoNotDefinedError();
    expect(isConnectionInfoNotDefinedError(connectionInfoNotDefinedError)).toBe(true);
  });

  test('noInstanceFoundError', () => {
    const noInstanceFoundError = new NoInstanceFoundError();
    expect(isNoInstanceFoundError(noInstanceFoundError)).toBe(true);
  });

  test('projectDeletedError', () => {
    const projectDeletedError = new ProjectDeletedError();
    expect(isProjectDeletedError(projectDeletedError)).toBe(true);
  });

  describe('is not *Error', () => {
    let error: Error;

    beforeEach(() => {
      error = new Error();
    });

    test('not noKeyExistsError', () => {
      expect(isNoKeyExistsError(error)).toBe(false);
    });

    test('not nonUniqueKeyError', () => {
      expect(isNonUniqueKeyError(error)).toBe(false);
    });

    test('not ec2Error', () => {
      expect(isEc2Error(error)).toBe(false);
    });

    test('not awsServiceError', () => {
      expect(isAwsServiceError(error)).toBe(false);
    });

    test('not conflictError', () => {
      expect(isConflictError(error)).toBe(false);
    });

    test('not duplicateKeyError', () => {
      expect(isDuplicateKeyError(error)).toBe(false);
    });

    test('not connectionInfoNotDefinedError', () => {
      expect(isConnectionInfoNotDefinedError(error)).toBe(false);
    });

    test('not noInstanceFoundError', () => {
      expect(isNoInstanceFoundError(error)).toBe(false);
    });

    test('not projectDeletedError', () => {
      expect(isProjectDeletedError(error)).toBe(false);
    });
  });
});
