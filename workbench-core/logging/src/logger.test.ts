import { transports } from 'winston';
import { makeLogger } from '.';

describe('makeLogger tests', () => {
  it('log level should default to info when there is no parameter or environment variable defined', () => {
    const logger = makeLogger();

    expect(logger.level).toBe('info');
  });

  it('log level should equal process.env.LOG_LEVEL when there is no parameter included', () => {
    process.env.LOG_LEVEL = 'error';
    const logger = makeLogger();

    expect(logger.level).toBe('error');
  });

  it('log level should equal options.logLevel when parameter is included', () => {
    const logger = makeLogger({ logLevel: 'debug' });

    expect(logger.level).toBe('debug');
  });

  it('metadata should be undefined when parameter is not included', () => {
    const logger = makeLogger();

    expect(logger.defaultMeta).toMatchObject({ meta: undefined });
  });

  it('metadata should be defined when parameter is included', () => {
    const metadata = {
      some: 'metadata'
    };
    const logger = makeLogger({ metadata });

    expect(logger.defaultMeta).toMatchObject({ meta: metadata });
  });

  it('user defined transports should be used when included', () => {
    const userTransports = [new transports.Console(), new transports.Console(), new transports.Console()];
    const logger = makeLogger({ transports: userTransports });

    expect(logger.transports.length).toBe(3);
  });
});
