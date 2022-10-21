export class GroupAlreadyExistsError extends Error {
  public readonly isGroupAlreadyExistsError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isGroupAlreadyExistsError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, GroupAlreadyExistsError);
    }
  }
}

export function isGroupAlreadyExistsError(error: unknown): error is GroupAlreadyExistsError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as GroupAlreadyExistsError).isGroupAlreadyExistsError === true
  );
}
