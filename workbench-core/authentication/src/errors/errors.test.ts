/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  IdpUnavailableError,
  InvalidAuthorizationCodeError,
  InvalidCodeVerifierError,
  InvalidJWTError,
  InvalidParameterError,
  InvalidTokenError,
  InvalidTokenTypeError,
  isIdpUnavailableError,
  isInvalidAuthorizationCodeError,
  isInvalidCodeVerifierError,
  isInvalidJWTError,
  isInvalidParameterError,
  isInvalidTokenError,
  isInvalidTokenTypeError,
  isPluginConfigurationError,
  isRoleAlreadyExistsError,
  isRoleNotFoundError,
  isUserAlreadyExistsError,
  isUserNotFoundError,
  PluginConfigurationError,
  RoleAlreadyExistsError,
  RoleNotFoundError,
  UserAlreadyExistsError,
  UserNotFoundError
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

  describe('InvalidAuthorizationCodeError tests', () => {
    it('should be an instance of itself', () => {
      const error = new InvalidAuthorizationCodeError();

      expect(isInvalidAuthorizationCodeError(error)).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new InvalidAuthorizationCodeError();

      expect(error instanceof Error).toBe(true);
    });
  });

  describe('InvalidCodeVerifierError tests', () => {
    it('should be an instance of itself', () => {
      const error = new InvalidCodeVerifierError();

      expect(isInvalidCodeVerifierError(error)).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new InvalidCodeVerifierError();

      expect(error instanceof Error).toBe(true);
    });
  });

  describe('InvalidJWTError tests', () => {
    it('should be an instance of itself', () => {
      const error = new InvalidJWTError();

      expect(isInvalidJWTError(error)).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new InvalidJWTError();

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

  describe('InvalidTokenError tests', () => {
    it('should be an instance of itself', () => {
      const error = new InvalidTokenError();

      expect(isInvalidTokenError(error)).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new InvalidTokenError();

      expect(error instanceof Error).toBe(true);
    });
  });

  describe('InvalidTokenTypeError tests', () => {
    it('should be an instance of itself', () => {
      const error = new InvalidTokenTypeError();

      expect(isInvalidTokenTypeError(error)).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new InvalidTokenTypeError();

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
});
