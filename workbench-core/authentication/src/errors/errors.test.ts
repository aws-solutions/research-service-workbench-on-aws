import {
  InvalidAuthorizationCodeError,
  InvalidCodeVerifierError,
  InvalidJWTError,
  InvalidTokenError,
  InvalidTokenTypeError,
  isInvalidAuthorizationCodeError,
  isInvalidCodeVerifierError,
  isInvalidJWTError,
  isInvalidTokenError,
  isInvalidTokenTypeError,
  isPluginConfigurationError,
  PluginConfigurationError
} from '../';

describe('custom error tests', () => {
  describe('InvalidAuthorizationCodeError tests', () => {
    it('should be an instance of itself', () => {
      const error = new InvalidAuthorizationCodeError();

      expect(isInvalidAuthorizationCodeError(error)).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new InvalidAuthorizationCodeError();

      expect(error instanceof Error).toBe(true);
    });

    it('should not be an instance of the other custom error classes', () => {
      const error = new InvalidAuthorizationCodeError();

      expect(isInvalidCodeVerifierError(error)).toBe(false);
      expect(isInvalidJWTError(error)).toBe(false);
      expect(isInvalidTokenError(error)).toBe(false);
      expect(isInvalidTokenTypeError(error)).toBe(false);
      expect(isPluginConfigurationError(error)).toBe(false);
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

    it('should not be an instance of the other custom error classes', () => {
      const error = new InvalidCodeVerifierError();

      expect(isInvalidAuthorizationCodeError(error)).toBe(false);
      expect(isInvalidJWTError(error)).toBe(false);
      expect(isInvalidTokenError(error)).toBe(false);
      expect(isInvalidTokenTypeError(error)).toBe(false);
      expect(isPluginConfigurationError(error)).toBe(false);
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

    it('should not be an instance of the other custom error classes', () => {
      const error = new InvalidJWTError();

      expect(isInvalidAuthorizationCodeError(error)).toBe(false);
      expect(isInvalidCodeVerifierError(error)).toBe(false);
      expect(isInvalidTokenError(error)).toBe(false);
      expect(isInvalidTokenTypeError(error)).toBe(false);
      expect(isPluginConfigurationError(error)).toBe(false);
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

    it('should not be an instance of the other custom error classes', () => {
      const error = new InvalidTokenError();

      expect(isInvalidAuthorizationCodeError(error)).toBe(false);
      expect(isInvalidCodeVerifierError(error)).toBe(false);
      expect(isInvalidJWTError(error)).toBe(false);
      expect(isInvalidTokenTypeError(error)).toBe(false);
      expect(isPluginConfigurationError(error)).toBe(false);
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

    it('should not be an instance of the other custom error classes', () => {
      const error = new InvalidTokenTypeError();

      expect(isInvalidAuthorizationCodeError(error)).toBe(false);
      expect(isInvalidCodeVerifierError(error)).toBe(false);
      expect(isInvalidJWTError(error)).toBe(false);
      expect(isInvalidTokenError(error)).toBe(false);
      expect(isPluginConfigurationError(error)).toBe(false);
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

    it('should not be an instance of the other custom error classes', () => {
      const error = new PluginConfigurationError();

      expect(isInvalidAuthorizationCodeError(error)).toBe(false);
      expect(isInvalidCodeVerifierError(error)).toBe(false);
      expect(isInvalidJWTError(error)).toBe(false);
      expect(isInvalidTokenError(error)).toBe(false);
      expect(isInvalidTokenTypeError(error)).toBe(false);
    });
  });
});
