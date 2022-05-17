export class PluginConfigurationError extends Error {
  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PluginConfigurationError);
    }

    this.name = this.constructor.name;
  }
}
