/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { InvalidArgumentError } from '../errors';
import { getITAdminRole, getProjectAdminRole, getResearcherRole } from './roleUtils';

describe('Test roleUtilities', () => {
  describe('getITAdmin', () => {
    test('returns ITAdmin role', () => {
      expect(getITAdminRole()).toEqual('ITAdmin');
    });
  });

  const VALID_PROJECT_ID = 'proj-123';
  const INVALID_PROJECT_ID = 'notValidProject';

  describe('getProjectAdminRole', () => {
    test('returns ProjectAdmin Role when given valid ProjectID', () => {
      expect(getProjectAdminRole(VALID_PROJECT_ID)).toEqual('proj-123#ProjectAdmin');
    });

    test('throws InvalidArgumentError when given invalid ProjectID', () => {
      expect(function () {
        getProjectAdminRole(INVALID_PROJECT_ID);
      }).toThrow(new InvalidArgumentError());
    });
  });

  describe('getResearcherRole', () => {
    test('returns Researcher Role when given valid ProjectID', () => {
      expect(getResearcherRole(VALID_PROJECT_ID)).toEqual('proj-123#Researcher');
    });

    test('throws InvalidArgumentError when given invalid ProjectID', () => {
      expect(function () {
        getResearcherRole(INVALID_PROJECT_ID);
      }).toThrow(new InvalidArgumentError());
    });
  });
});
