/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  IdpUnavailableError,
  InvalidParameterError,
  isIdpUnavailableError,
  isInvalidParameterError,
  isPluginConfigurationError,
  isRoleAlreadyExistsError,
  isRoleNotFoundError,
  isTooManyRequestsError,
  isUserAlreadyExistsError,
  isUserNotFoundError,
  isUserRolesExceedLimitError,
  PluginConfigurationError,
  RoleAlreadyExistsError,
  RoleNotFoundError,
  TooManyRequestsError,
  UserAlreadyExistsError,
  UserNotFoundError,
  UserRolesExceedLimitError
} from '../';

describe('custom error tests', () => {
  describe('IdpUnavailableError tests', () => {
    it('should be an instance of itself', () => {
      const error = new IdpUnavailableError();

      expect(isIdpUnavailableError(error)).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new IdpUnavailableError();

      expect(error instanceof Error).toBe(true);
    });
  });

  describe('InvalidParameterError tests', () => {
    it('should be an instance of itself', () => {
      const error = new InvalidParameterError();

      expect(isInvalidParameterError(error)).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new InvalidParameterError();

      expect(error instanceof Error).toBe(true);
    });
  });

  describe('PluginConfigurationError tests', () => {
    it('should be an instance of itself', () => {
      const error = new PluginConfigurationError();

      expect(isPluginConfigurationError(error)).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new PluginConfigurationError();

      expect(error instanceof Error).toBe(true);
    });
  });

  describe('RoleAlreadyExistsError tests', () => {
    it('should be an instance of itself', () => {
      const error = new RoleAlreadyExistsError();

      expect(isRoleAlreadyExistsError(error)).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new RoleAlreadyExistsError();

      expect(error instanceof Error).toBe(true);
    });
  });

  describe('RoleNotFoundError tests', () => {
    it('should be an instance of itself', () => {
      const error = new RoleNotFoundError();

      expect(isRoleNotFoundError(error)).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new RoleNotFoundError();

      expect(error instanceof Error).toBe(true);
    });
  });

  describe('UserAlreadyExistsError tests', () => {
    it('should be an instance of itself', () => {
      const error = new UserAlreadyExistsError();

      expect(isUserAlreadyExistsError(error)).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new UserAlreadyExistsError();

      expect(error instanceof Error).toBe(true);
    });
  });

  describe('UserNotFoundError tests', () => {
    it('should be an instance of itself', () => {
      const error = new UserNotFoundError();

      expect(isUserNotFoundError(error)).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new UserNotFoundError();

      expect(error instanceof Error).toBe(true);
    });
  });

  describe('TooManyRequestsError tests', () => {
    it('should be an instance of itself', () => {
      const error = new TooManyRequestsError();

      expect(isTooManyRequestsError(error)).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new TooManyRequestsError();

      expect(error instanceof Error).toBe(true);
    });
  });

  describe('UserRolesExceedLimitError tests', () => {
    it('should be an instance of itself', () => {
      const error = new UserRolesExceedLimitError();

      expect(isUserRolesExceedLimitError(error)).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new UserRolesExceedLimitError();

      expect(error instanceof Error).toBe(true);
    });
  });
});
