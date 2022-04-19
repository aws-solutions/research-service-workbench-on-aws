import { transports } from 'winston';
import { makeLogger } from '.';
import { ConsoleTransport } from './consoleTransport';

describe('makeLogger tests', () => {
  it('log level should default to info when options.logLevel is undefined', () => {
    const logger = makeLogger();

    expect(logger.level).toBe('info');
  });

  it('log level should equal options.logLevel when defined', () => {
    const logger = makeLogger({ logLevel: 'debug' });

    expect(logger.level).toBe('debug');
  });

  it('metadata should be undefined when options.metadata is undefined', () => {
    const logger = makeLogger();

    expect(logger.defaultMeta).toMatchObject({ meta: undefined });
  });

  it('metadata should be defined when options.metadata is defined', () => {
    const metadata = {
      some: 'metadata'
    };
    const logger = makeLogger({ metadata });

    expect(logger.defaultMeta).toMatchObject({ meta: metadata });
  });

  it('ConsoleTransport should be used when options.transports is undefined', () => {
    const logger = makeLogger();

    expect(logger.transports[0]).toBeInstanceOf(ConsoleTransport);
  });

  it('user defined transports should be used when options.transports is defined', () => {
    const userTransports = [new transports.Console(), new transports.Console(), new transports.Console()];
    const logger = makeLogger({ transports: userTransports });

    expect(logger.transports.length).toBe(3);
    expect(logger.transports[0]).toBeInstanceOf(transports.Console);
    expect(logger.transports[1]).toBeInstanceOf(transports.Console);
    expect(logger.transports[2]).toBeInstanceOf(transports.Console);
  });
});
