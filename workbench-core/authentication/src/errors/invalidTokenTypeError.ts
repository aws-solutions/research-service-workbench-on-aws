export class InvalidTokenTypeError extends Error {
  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidTokenTypeError);
    }

    this.name = this.constructor.name;
  }
}
