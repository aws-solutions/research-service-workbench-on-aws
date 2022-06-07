export class InvalidTokenTypeError extends Error {
  public readonly isInvalidTokenTypeError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidTokenTypeError);
    }

    this.name = this.constructor.name;
    this.isInvalidTokenTypeError = true;
  }
}

export function isInvalidTokenTypeError(error: unknown): error is InvalidTokenTypeError {
  return Boolean(error) && (error as InvalidTokenTypeError).isInvalidTokenTypeError === true;
}
