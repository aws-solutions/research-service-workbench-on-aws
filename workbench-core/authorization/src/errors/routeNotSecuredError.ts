export class RouteNotSecuredError extends Error {
  public readonly isRouteNotSecuredError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isRouteNotSecuredError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, RouteNotSecuredError);
    }
  }
}

export function isRouteNotSecuredError(error: unknown): error is RouteNotSecuredError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as RouteNotSecuredError).isRouteNotSecuredError === true
  );
}
