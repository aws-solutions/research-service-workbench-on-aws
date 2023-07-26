/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { fc, itProp } from 'jest-fast-check';
import { LEVEL, MESSAGE } from 'triple-beam';
import { ConsoleTransport } from '../..';

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
  itProp('error log level should output using console.error', [fc.string()], (message) => {
    const transport = new ConsoleTransport();

    const errorSpy = jest.spyOn(console, 'error');

    transport.log({ [MESSAGE]: message, [LEVEL]: 'error' }, () => {});

    expect(errorSpy).toBeCalledWith(message);
  });

  itProp('warn log level should output using console.warn', [fc.string()], (message) => {
    const transport = new ConsoleTransport();

    const warnSpy = jest.spyOn(console, 'warn');

    transport.log({ [MESSAGE]: message, [LEVEL]: 'warn' }, () => {});

    expect(warnSpy).toBeCalledWith(message);
  });

  itProp('info log level should output using console.info', [fc.string()], (message) => {
    const transport = new ConsoleTransport();

    const infoSpy = jest.spyOn(console, 'info');

    transport.log({ [MESSAGE]: message, [LEVEL]: 'info' }, () => {});

    expect(infoSpy).toBeCalledWith(message);
  });

  itProp('debug log level should output using console.debug', [fc.string()], (message) => {
    const transport = new ConsoleTransport();

    const debugSpy = jest.spyOn(console, 'debug');

    transport.log({ [MESSAGE]: message, [LEVEL]: 'debug' }, () => {});

    expect(debugSpy).toBeCalledWith(message);
  });

  itProp(
    'http, verbose, and silly log level should output using console.log',
    [fc.array(fc.string(), { minLength: 3, maxLength: 3 })],
    (messages) => {
      const transport = new ConsoleTransport();

      const logSpy = jest.spyOn(console, 'log');

      transport.log({ [MESSAGE]: messages[0], [LEVEL]: 'http' }, () => {}); // nosemgrep
      expect(logSpy).lastCalledWith(messages[0]);

      transport.log({ [MESSAGE]: messages[1], [LEVEL]: 'verbose' }, () => {}); // nosemgrep
      expect(logSpy).lastCalledWith(messages[1]);

      transport.log({ [MESSAGE]: messages[2], [LEVEL]: 'silly' }, () => {}); // nosemgrep
      expect(logSpy).lastCalledWith(messages[2]);
    }
  );

  it('should call the callback when it is provided', () => {
    const callback = jest.fn(() => {});
    const transport = new ConsoleTransport();

    transport.log({ [MESSAGE]: 'message', [LEVEL]: 'http' }, callback);

    expect(callback).toBeCalledTimes(1);
  });
});
