import { makeLogger } from '.';

/**
 * Log levels (highest to lowest priority):
 *
 * error: 0,
 * warn: 1,
 * info: 2,
 * http: 3,
 * verbose: 4,
 * debug: 5,
 * silly: 6
 *
 */

describe('ConsoleTransport tests', () => {
  it('error log level should output using console.error', () => {
    const logger = makeLogger({ logLevel: 'silly' });

    const errorSpy = jest.spyOn(console, 'error');

    logger.error('a log message');

    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('warn log level should output using console.warn', () => {
    const logger = makeLogger({ logLevel: 'silly' });

    const warnSpy = jest.spyOn(console, 'warn');

    logger.warn('this should be logged');

    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('info log level should output using console.info', () => {
    const logger = makeLogger({ logLevel: 'silly' });

    const infoSpy = jest.spyOn(console, 'info');

    logger.info('this should be logged');

    expect(infoSpy).toHaveBeenCalledTimes(1);
  });

  it('debug log level should output using console.debug', () => {
    const logger = makeLogger({ logLevel: 'silly' });

    const debugSpy = jest.spyOn(console, 'debug');

    logger.debug('this shouldnt be logged');

    expect(debugSpy).toHaveBeenCalledTimes(1);
  });

  it('http, verbose, and silly log level should output using console.log', () => {
    const logger = makeLogger({ logLevel: 'silly' });

    const logSpy = jest.spyOn(console, 'log');

    logger.http('this shouldnt be logged');
    logger.verbose('this shouldnt be logged');
    logger.silly('this shouldnt be logged');

    expect(logSpy).toHaveBeenCalledTimes(3);
  });
});
