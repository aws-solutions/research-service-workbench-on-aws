/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('./plugins/winstonPlugin');

import { fc, itProp } from 'jest-fast-check';
import { LogMessageObject } from './logMessage';
import { LoggingPlugin, LoggingService, LogLevel, WinstonPlugin } from '.';

const testErrorStack = `Error
  at REPL1:1:13
  at Script.runInThisContext (vm.js:134:12)
  at REPLServer.defaultEval (repl.js:566:29)
  at bound (domain.js:421:15)
  at REPLServer.runBound [as eval] (domain.js:432:12)
  at REPLServer.onLine (repl.js:909:10)
  at REPLServer.emit (events.js:412:35)
  at REPLServer.emit (domain.js:475:12)
  at REPLServer.Interface._onLine (readline.js:434:10)
  at REPLServer.Interface._line (readline.js:791:8)`;

describe('LoggingService tests', () => {
  describe('constructor', () => {
    it('should use defaults when options is undefined', () => {
      const logger = new LoggingService();

      expect(logger['_includeLocation']).toBe(true); // nosemgrep
      expect(logger['_loggingPlugin']).toBeInstanceOf(WinstonPlugin); // nosemgrep
      expect(logger['_loggingPlugin'].setMaxLogLevel).toBeCalledWith('info'); // nosemgrep
      expect(logger['_loggingPlugin'].setDefaultMetadata).not.toBeCalled(); // nosemgrep
    });

    it('should use options.logLevel when defined', () => {
      const logger = new LoggingService({ maxLogLevel: 'debug' });

      expect(logger['_loggingPlugin'].setMaxLogLevel).toBeCalledWith('debug'); // nosemgrep
    });

    itProp(
      'should use options.metadata when defined',
      [fc.object({ values: [fc.string(), fc.double(), fc.integer(), fc.boolean()] })],
      (metadata) => {
        const logger = new LoggingService({ defaultMetadata: metadata as LogMessageObject });

        expect(logger['_loggingPlugin'].setDefaultMetadata).toBeCalledWith(metadata); // nosemgrep
      }
    );

    it('should use options.loggingPlugin when defined', () => {
      class FakePlugin implements LoggingPlugin {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public log(level: LogLevel, message: any, ...meta: any[]): void {}
        public setMaxLogLevel(level: LogLevel): void {}
        public setDefaultMetadata(metadata: LogMessageObject): void {}
      }

      const logger = new LoggingService({ loggingPlugin: new FakePlugin() });

      expect(logger['_loggingPlugin']).toBeInstanceOf(FakePlugin); // nosemgrep
    });
  });

  it('error() should log using the "error" log level', () => {
    const logger = new LoggingService({ includeLocation: false });

    logger.error('error message');

    expect(logger['_loggingPlugin'].log).lastCalledWith('error', 'error message'); // nosemgrep
  });

  it('warn() should log using the "warn" log level', () => {
    const logger = new LoggingService({ includeLocation: false });

    logger.warn('warn message');

    expect(logger['_loggingPlugin'].log).lastCalledWith('warn', 'warn message'); // nosemgrep
  });

  it('info() should log using the "info" log level', () => {
    const logger = new LoggingService({ includeLocation: false });

    logger.info('info message');

    expect(logger['_loggingPlugin'].log).lastCalledWith('info', 'info message'); // nosemgrep
  });

  it('http() should log using the "http" log level', () => {
    const logger = new LoggingService({ includeLocation: false });

    logger.http('http message');

    expect(logger['_loggingPlugin'].log).lastCalledWith('http', 'http message'); // nosemgrep
  });

  it('verbose() should log using the "verbose" log level', () => {
    const logger = new LoggingService({ includeLocation: false });

    logger.verbose('verbose message');

    expect(logger['_loggingPlugin'].log).lastCalledWith('verbose', 'verbose message'); // nosemgrep
  });

  it('debug() should log using the "debug" log level', () => {
    const logger = new LoggingService({ includeLocation: false });

    logger.debug('debug message');

    expect(logger['_loggingPlugin'].log).lastCalledWith('debug', 'debug message'); // nosemgrep
  });

  it('silly() should log using the "silly" log level', () => {
    const logger = new LoggingService({ includeLocation: false });

    logger.silly('silly message');

    expect(logger['_loggingPlugin'].log).lastCalledWith('silly', 'silly message'); // nosemgrep
  });

  it('log should include location when _includeLocation is true', () => {
    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);

    const logger = new LoggingService({ includeLocation: true });

    logger.info('info message');

    expect(logger['_loggingPlugin'].log).lastCalledWith('info', 'info message', {
      location: 'bound (domain.js:421:15)'
    }); // nosemgrep
  });

  it('log should append location to meta object if provided when _includeLocation is true', () => {
    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);

    const logger = new LoggingService({ includeLocation: true });

    logger.info('info message', { meta: 'object' });

    expect(logger['_loggingPlugin'].log).lastCalledWith(
      'info',
      'info message',
      expect.objectContaining({
        meta: 'object',
        location: 'bound (domain.js:421:15)'
      })
    ); // nosemgrep
  });

  it('log location field should be "undefined" when Error.stack is undefined', () => {
    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => undefined);

    const logger = new LoggingService({ includeLocation: true });

    logger.info('info message');

    expect(logger['_loggingPlugin'].log).lastCalledWith('info', 'info message', { location: 'undefined' }); // nosemgrep
  });
});
