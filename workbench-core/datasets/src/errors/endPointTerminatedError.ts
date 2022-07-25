export class EndPointTerminatedError extends Error {
  public readonly isEndPointTerminatedError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isEndPointTerminatedError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, EndPointTerminatedError);
    }
  }
}

export function isEndPointTerminatedError(error: unknown): error is EndPointTerminatedError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as EndPointTerminatedError).isEndPointTerminatedError === true
  );
}
