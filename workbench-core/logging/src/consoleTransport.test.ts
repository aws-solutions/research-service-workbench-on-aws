import { makeLogger } from '.';

describe('To console tests', () => {
  it('should default to info log level when there is no parameter specified or environment variable defined', () => {
    const logger = makeLogger({ logLevel: 'silly' });

    const errorSpy = jest.spyOn(console, 'error');
    const warnSpy = jest.spyOn(console, 'warn');
    const infoSpy = jest.spyOn(console, 'info');
    const debugSpy = jest.spyOn(console, 'debug');
    const logSpy = jest.spyOn(console, 'log');

    logger.error('this should be logged');
    logger.warn('this should be logged');
    logger.info('this should be logged');
    logger.http('this shouldnt be logged');
    logger.verbose('this shouldnt be logged');
    logger.debug('this shouldnt be logged');
    logger.silly('this shouldnt be logged');

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledTimes(3);
  });
});
