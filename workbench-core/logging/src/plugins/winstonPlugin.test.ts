/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Jest mocks must be placed before importing any packages
jest.mock('winston', () => ({
  format: {
    combine: jest.fn(),
    errors: jest.fn(),
    json: jest.fn()
  },
  createLogger: jest.fn(function (creationOpts: LoggerOptions) {
    return {
      level: creationOpts.level,
      log: jest.fn(),
      defaultMeta: creationOpts.defaultMeta,
      transports: creationOpts.transports
    };
  }),
  transports: {
    Console: jest.fn()
  }
}));

jest.mock('./winstonTransports/consoleTransport');

import { fc, itProp } from 'jest-fast-check';
import { LoggerOptions, transports, createLogger } from 'winston';
import { ConsoleTransport, LogMessageObject, WinstonPlugin } from '..';

describe('WinstonPlugin tests', () => {
  describe('constructor', () => {
    it('should use defaults when transports is undefined', () => {
      new WinstonPlugin();

      expect(createLogger).lastReturnedWith(
        expect.objectContaining({
          transports: expect.arrayContaining([expect.any(ConsoleTransport)])
        })
      );
    });

    it('should use transports when defined', () => {
      const userTransports = [new transports.Console(), new transports.Console(), new transports.Console()];

      new WinstonPlugin(userTransports);

      expect(createLogger).lastReturnedWith(
        expect.objectContaining({
          transports: expect.arrayContaining([...userTransports])
        })
      );
    });
  });

  it('setMaxLogLevel() should set _logger.level to level', () => {
    const logger = new WinstonPlugin();

    logger.setMaxLogLevel('silly');

    expect(logger['_logger'].level).toBe('silly'); // nosemgrep
  });

  itProp(
    'setDefaultMetadata() should set _logger.defaultMeta to metadata',
    [fc.object({ values: [fc.string(), fc.double(), fc.integer(), fc.boolean()] })],
    (metadata) => {
      const logger = new WinstonPlugin();

      logger.setDefaultMetadata(metadata as LogMessageObject);

      expect(logger['_logger'].defaultMeta).toStrictEqual({ meta: metadata }); // nosemgrep
    }
  );

  itProp('log() should correctly handle a double as the message parameter', [fc.double()], (message) => {
    const logger = new WinstonPlugin();

    logger.log('error', message);

    expect(logger['_logger'].log).lastCalledWith('error', message); // nosemgrep
  });

  itProp('log() should correctly handle an integer as the message parameter', [fc.integer()], (message) => {
    const logger = new WinstonPlugin();

    logger.log('error', message);

    expect(logger['_logger'].log).lastCalledWith('error', message); // nosemgrep
  });

  itProp('log() should correctly handle a string as the message parameter', [fc.string()], (message) => {
    const logger = new WinstonPlugin();

    logger.log('error', message);

    expect(logger['_logger'].log).lastCalledWith('error', message); // nosemgrep
  });

  itProp('log() should correctly handle a boolean as the message parameter', [fc.boolean()], (message) => {
    const logger = new WinstonPlugin();

    logger.log('error', message);

    expect(logger['_logger'].log).lastCalledWith('error', message); // nosemgrep
  });

  itProp(
    'log() should correctly handle a LogMessageArray as the message parameter',
    [fc.array(fc.oneof(fc.string(), fc.double(), fc.integer(), fc.boolean()))],
    (message) => {
      const logger = new WinstonPlugin();

      logger.log('error', message);

      expect(logger['_logger'].log).lastCalledWith('error', { message }); // nosemgrep
    }
  );

  itProp(
    'log() should correctly handle a LogMessageObject as the message parameter',
    [fc.object({ values: [fc.string(), fc.double(), fc.integer(), fc.boolean()] })],
    (message) => {
      const logger = new WinstonPlugin();

      logger.log('error', message as LogMessageObject);

      expect(logger['_logger'].log).lastCalledWith('error', { message }); // nosemgrep
    }
  );

  it('log() should correctly handle an Error as the message parameter', () => {
    const logger = new WinstonPlugin();

    const error = new Error();

    logger.log('error', error);

    expect(logger['_logger'].log).lastCalledWith('error', { message: error }); // nosemgrep
  });

  itProp(
    'log() should correctly handle a string for the message parameter and a LogMessageObject as the meta parameter',
    [fc.string(), fc.object({ values: [fc.string(), fc.double(), fc.integer(), fc.boolean()] })],
    (message, meta) => {
      const logger = new WinstonPlugin();

      logger.log('error', message, meta as LogMessageObject);

      expect(logger['_logger'].log).lastCalledWith('error', message, meta); // nosemgrep
    }
  );

  itProp(
    'log() should correctly handle a string for the message parameter and an Error as the meta parameter',
    [fc.string()],
    (message) => {
      const logger = new WinstonPlugin();

      const error = new Error();

      logger.log('error', message, error);

      expect(logger['_logger'].log).lastCalledWith('error', message, error); // nosemgrep
    }
  );
});
