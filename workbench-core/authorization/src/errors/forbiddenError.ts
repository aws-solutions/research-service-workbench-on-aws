export class ForbiddenError extends Error {
  public readonly isForbiddenError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isForbiddenError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ForbiddenError);
    }
  }
}

export function isForbiddenError(error: unknown): error is ForbiddenError {
  return Boolean(error) && error instanceof Error && (error as ForbiddenError).isForbiddenError === true;
}
