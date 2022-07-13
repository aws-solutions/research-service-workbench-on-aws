export class EndPointExistsError extends Error {
  public readonly isEndPointExistsError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isEndPointExistsError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, EndPointExistsError);
    }
  }
}

export function isEndPointExistsError(error: unknown): error is EndPointExistsError {
  return (
    Boolean(error) && error instanceof Error && (error as EndPointExistsError).isEndPointExistsError === true
  );
}
