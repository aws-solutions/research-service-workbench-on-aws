/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { LoggingService } from './loggingService';

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

const stringMessage = 'test message';
const numberMessage = 123;
const booleanMessage = false;
const arrayMessage = [stringMessage, numberMessage, booleanMessage];
const objectMessage = {
  arrayMessage,
  booleanMessage,
  numberMessage,
  stringMessage
};
const errorMessage = new Error();
errorMessage.stack = 'error stack';
const errorMessage2 = new Error('this is an error');
errorMessage2.stack = 'error stack';

describe('package tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly log a LogMessage message', () => {
    const service = new LoggingService({
      includeLocation: false
    });

    const outputSpy = jest.spyOn(console, 'error');

    service.error(stringMessage);
    expect(outputSpy).lastCalledWith(`{"level":"error","message":"${stringMessage}"}`);

    service.error(numberMessage);
    expect(outputSpy).lastCalledWith(`{"level":"error","message":${numberMessage}}`);

    service.error(booleanMessage);
    expect(outputSpy).lastCalledWith(`{"level":"error","message":${booleanMessage}}`);

    service.error(arrayMessage);
    expect(outputSpy).lastCalledWith(`{"level":"error","message":${JSON.stringify(arrayMessage)}}`);

    service.error(objectMessage);
    expect(outputSpy).lastCalledWith(`{"level":"error","message":${JSON.stringify(objectMessage)}}`);

    service.error(errorMessage);
    expect(outputSpy).lastCalledWith(`{"level":"error","message":"","stack":"error stack"}`);

    service.error(errorMessage2);
    expect(outputSpy).lastCalledWith(`{"level":"error","message":"this is an error","stack":"error stack"}`);
  });

  it('should correctly log a LogMessage message with default metadata', () => {
    const defaultMetadata = {
      service: 'example service'
    };

    const service = new LoggingService({
      includeLocation: false,
      defaultMetadata
    });

    const outputSpy = jest.spyOn(console, 'error');

    service.error(stringMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","message":"${stringMessage}","meta":${JSON.stringify(defaultMetadata)}}`
    );

    service.error(numberMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","message":${numberMessage},"meta":${JSON.stringify(defaultMetadata)}}`
    );

    service.error(booleanMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","message":${booleanMessage},"meta":${JSON.stringify(defaultMetadata)}}`
    );

    service.error(arrayMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","message":${JSON.stringify(arrayMessage)},"meta":${JSON.stringify(defaultMetadata)}}`
    );

    service.error(objectMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","message":${JSON.stringify(objectMessage)},"meta":${JSON.stringify(defaultMetadata)}}`
    );

    service.error(errorMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","message":"","meta":${JSON.stringify(defaultMetadata)},"stack":"error stack"}`
    );

    service.error(errorMessage2);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","message":"this is an error","meta":${JSON.stringify(
        defaultMetadata
      )},"stack":"error stack"}`
    );
  });

  it('should correctly log a LogMessage message with location', () => {
    const service = new LoggingService({
      includeLocation: true
    });

    const outputSpy = jest.spyOn(console, 'error');

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(stringMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":"${stringMessage}"}`
    );

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(numberMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":${numberMessage}}`
    );

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(booleanMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":${booleanMessage}}`
    );

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(arrayMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":${JSON.stringify(arrayMessage)}}`
    );

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(objectMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":${JSON.stringify(objectMessage)}}`
    );

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(errorMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":"","stack":"error stack"}`
    );

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(errorMessage2);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":"this is an error","stack":"error stack"}`
    );
  });

  it('should correctly log a LogMessage message with location and default metadata', () => {
    const defaultMetadata = {
      service: 'example service'
    };

    const service = new LoggingService({
      includeLocation: true,
      defaultMetadata
    });

    const outputSpy = jest.spyOn(console, 'error');

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(stringMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":"${stringMessage}","meta":${JSON.stringify(
        defaultMetadata
      )}}`
    );

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(numberMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":${numberMessage},"meta":${JSON.stringify(
        defaultMetadata
      )}}`
    );

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(booleanMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":${booleanMessage},"meta":${JSON.stringify(
        defaultMetadata
      )}}`
    );

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(arrayMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":${JSON.stringify(
        arrayMessage
      )},"meta":${JSON.stringify(defaultMetadata)}}`
    );

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(objectMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":${JSON.stringify(
        objectMessage
      )},"meta":${JSON.stringify(defaultMetadata)}}`
    );

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(errorMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":"","meta":${JSON.stringify(
        defaultMetadata
      )},"stack":"error stack"}`
    );

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(errorMessage2);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":"this is an error","meta":${JSON.stringify(
        defaultMetadata
      )},"stack":"error stack"}`
    );
  });

  it('should correctly log string message and log metadata', () => {
    const service = new LoggingService({
      includeLocation: false
    });

    const message = 'test message';
    const logMeta = {
      number: 436234645,
      string: 'dgtadfhsdfh',
      bool: true
    };

    const outputSpy = jest.spyOn(console, 'error');

    service.error(message, logMeta);
    expect(outputSpy).lastCalledWith(
      `{"bool":true,"level":"error","message":"${message}","number":436234645,"string":"dgtadfhsdfh"}`
    );

    service.error(message, errorMessage);
    expect(outputSpy).lastCalledWith(`{"level":"error","message":"${message}","stack":"error stack"}`);

    service.error(message, errorMessage2);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","message":"${message} this is an error","stack":"error stack"}`
    );
  });

  it('should correctly log string message, log metadata, and default metadata', () => {
    const defaultMetadata = {
      service: 'example service'
    };

    const service = new LoggingService({
      includeLocation: false,
      defaultMetadata
    });

    const message = 'test message';
    const logMeta = {
      number: 436234645,
      string: 'dgtadfhsdfh',
      bool: true
    };

    const outputSpy = jest.spyOn(console, 'error');

    service.error(message, logMeta);
    expect(outputSpy).lastCalledWith(
      `{"bool":true,"level":"error","message":"${message}","meta":${JSON.stringify(
        defaultMetadata
      )},"number":436234645,"string":"dgtadfhsdfh"}`
    );

    service.error(message, errorMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","message":"${message}","meta":${JSON.stringify(
        defaultMetadata
      )},"stack":"error stack"}`
    );

    service.error(message, errorMessage2);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","message":"${message} this is an error","meta":${JSON.stringify(
        defaultMetadata
      )},"stack":"error stack"}`
    );
  });

  it('should correctly log string message, log metadata, and location', () => {
    const service = new LoggingService({
      includeLocation: true
    });

    const message = 'test message';
    const logMeta = {
      number: 436234645,
      string: 'dgtadfhsdfh',
      bool: true
    };

    const outputSpy = jest.spyOn(console, 'error');

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(message, logMeta);
    expect(outputSpy).lastCalledWith(
      `{"bool":true,"level":"error","location":"bound (domain.js:421:15)","message":"${message}","number":436234645,"string":"dgtadfhsdfh"}`
    );

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(message, errorMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":"${message}","stack":"error stack"}`
    );

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(message, errorMessage2);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":"${message} this is an error","stack":"error stack"}`
    );
  });

  it('should correctly log string message, log metadata, default metadata, and location', () => {
    const defaultMetadata = {
      service: 'example service'
    };

    const service = new LoggingService({
      includeLocation: true,
      defaultMetadata
    });

    const message = 'test message';
    const logMeta = {
      number: 436234645,
      string: 'dgtadfhsdfh',
      bool: true
    };

    const outputSpy = jest.spyOn(console, 'error');

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(message, logMeta);
    expect(outputSpy).lastCalledWith(
      `{"bool":true,"level":"error","location":"bound (domain.js:421:15)","message":"${message}","meta":${JSON.stringify(
        defaultMetadata
      )},"number":436234645,"string":"dgtadfhsdfh"}`
    );

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(message, errorMessage);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":"${message}","meta":${JSON.stringify(
        defaultMetadata
      )},"stack":"error stack"}`
    );

    jest.spyOn(Error, 'prepareStackTrace').mockImplementationOnce(() => testErrorStack);
    service.error(message, errorMessage2);
    expect(outputSpy).lastCalledWith(
      `{"level":"error","location":"bound (domain.js:421:15)","message":"${message} this is an error","meta":${JSON.stringify(
        defaultMetadata
      )},"stack":"error stack"}`
    );
  });

  it('should ignore logs with lower priority than the default (info)', () => {
    const service = new LoggingService();

    const errorSpy = jest.spyOn(console, 'error');
    const warnSpy = jest.spyOn(console, 'warn');
    const infoSpy = jest.spyOn(console, 'info');
    const debugSpy = jest.spyOn(console, 'debug');
    const logSpy = jest.spyOn(console, 'log');

    service.error('should be called');
    service.warn('should be called');
    service.info('should be called');
    service.http('shouldnt be called');
    service.verbose('shouldnt be called');
    service.debug('shouldnt be called');
    service.silly('shouldnt be called');

    expect(errorSpy).toBeCalledTimes(1);
    expect(warnSpy).toBeCalledTimes(1);
    expect(infoSpy).toBeCalledTimes(1);
    expect(debugSpy).toBeCalledTimes(0);
    expect(logSpy).toBeCalledTimes(0);
  });

  it('should ignore logs with lower priority than error', () => {
    const service = new LoggingService({ maxLogLevel: 'error' });

    const errorSpy = jest.spyOn(console, 'error');
    const warnSpy = jest.spyOn(console, 'warn');
    const infoSpy = jest.spyOn(console, 'info');
    const debugSpy = jest.spyOn(console, 'debug');
    const logSpy = jest.spyOn(console, 'log');

    service.error('should be called');
    service.warn('shouldnt be called');
    service.info('shouldnt be called');
    service.http('shouldnt be called');
    service.verbose('shouldnt be called');
    service.debug('shouldnt be called');
    service.silly('shouldnt be called');

    expect(errorSpy).toBeCalledTimes(1);
    expect(warnSpy).toBeCalledTimes(0);
    expect(infoSpy).toBeCalledTimes(0);
    expect(debugSpy).toBeCalledTimes(0);
    expect(logSpy).toBeCalledTimes(0);
  });

  it('should ignore logs with lower priority than warn', () => {
    const service = new LoggingService({ maxLogLevel: 'warn' });

    const errorSpy = jest.spyOn(console, 'error');
    const warnSpy = jest.spyOn(console, 'warn');
    const infoSpy = jest.spyOn(console, 'info');
    const debugSpy = jest.spyOn(console, 'debug');
    const logSpy = jest.spyOn(console, 'log');

    service.error('should be called');
    service.warn('should be called');
    service.info('shouldnt be called');
    service.http('shouldnt be called');
    service.verbose('shouldnt be called');
    service.debug('shouldnt be called');
    service.silly('shouldnt be called');

    expect(errorSpy).toBeCalledTimes(1);
    expect(warnSpy).toBeCalledTimes(1);
    expect(infoSpy).toBeCalledTimes(0);
    expect(debugSpy).toBeCalledTimes(0);
    expect(logSpy).toBeCalledTimes(0);
  });

  it('should ignore logs with lower priority than info', () => {
    const service = new LoggingService({ maxLogLevel: 'info' });

    const errorSpy = jest.spyOn(console, 'error');
    const warnSpy = jest.spyOn(console, 'warn');
    const infoSpy = jest.spyOn(console, 'info');
    const debugSpy = jest.spyOn(console, 'debug');
    const logSpy = jest.spyOn(console, 'log');

    service.error('should be called');
    service.warn('should be called');
    service.info('should be called');
    service.http('shouldnt be called');
    service.verbose('shouldnt be called');
    service.debug('shouldnt be called');
    service.silly('shouldnt be called');

    expect(errorSpy).toBeCalledTimes(1);
    expect(warnSpy).toBeCalledTimes(1);
    expect(infoSpy).toBeCalledTimes(1);
    expect(debugSpy).toBeCalledTimes(0);
    expect(logSpy).toBeCalledTimes(0);
  });

  it('should ignore logs with lower priority than http', () => {
    const service = new LoggingService({ maxLogLevel: 'http' });

    const errorSpy = jest.spyOn(console, 'error');
    const warnSpy = jest.spyOn(console, 'warn');
    const infoSpy = jest.spyOn(console, 'info');
    const debugSpy = jest.spyOn(console, 'debug');
    const logSpy = jest.spyOn(console, 'log');

    service.error('should be called');
    service.warn('should be called');
    service.info('should be called');
    service.http('should be called');
    service.verbose('shouldnt be called');
    service.debug('shouldnt be called');
    service.silly('shouldnt be called');

    expect(errorSpy).toBeCalledTimes(1);
    expect(warnSpy).toBeCalledTimes(1);
    expect(infoSpy).toBeCalledTimes(1);
    expect(debugSpy).toBeCalledTimes(0);
    expect(logSpy).toBeCalledTimes(1);
  });

  it('should ignore logs with lower priority than verbose', () => {
    const service = new LoggingService({ maxLogLevel: 'verbose' });

    const errorSpy = jest.spyOn(console, 'error');
    const warnSpy = jest.spyOn(console, 'warn');
    const infoSpy = jest.spyOn(console, 'info');
    const debugSpy = jest.spyOn(console, 'debug');
    const logSpy = jest.spyOn(console, 'log');

    service.error('should be called');
    service.warn('should be called');
    service.info('should be called');
    service.http('should be called');
    service.verbose('should be called');
    service.debug('shouldnt be called');
    service.silly('shouldnt be called');

    expect(errorSpy).toBeCalledTimes(1);
    expect(warnSpy).toBeCalledTimes(1);
    expect(infoSpy).toBeCalledTimes(1);
    expect(debugSpy).toBeCalledTimes(0);
    expect(logSpy).toBeCalledTimes(2);
  });

  it('should ignore logs with lower priority than debug', () => {
    const service = new LoggingService({ maxLogLevel: 'debug' });

    const errorSpy = jest.spyOn(console, 'error');
    const warnSpy = jest.spyOn(console, 'warn');
    const infoSpy = jest.spyOn(console, 'info');
    const debugSpy = jest.spyOn(console, 'debug');
    const logSpy = jest.spyOn(console, 'log');

    service.error('should be called');
    service.warn('should be called');
    service.info('should be called');
    service.http('should be called');
    service.verbose('should be called');
    service.debug('should be called');
    service.silly('shouldnt be called');

    expect(errorSpy).toBeCalledTimes(1);
    expect(warnSpy).toBeCalledTimes(1);
    expect(infoSpy).toBeCalledTimes(1);
    expect(debugSpy).toBeCalledTimes(1);
    expect(logSpy).toBeCalledTimes(2);
  });

  it('should log all logs when silly level is set', () => {
    const service = new LoggingService({ maxLogLevel: 'silly' });

    const errorSpy = jest.spyOn(console, 'error');
    const warnSpy = jest.spyOn(console, 'warn');
    const infoSpy = jest.spyOn(console, 'info');
    const debugSpy = jest.spyOn(console, 'debug');
    const logSpy = jest.spyOn(console, 'log');

    service.error('should be called');
    service.warn('should be called');
    service.info('should be called');
    service.http('should be called');
    service.verbose('should be called');
    service.debug('should be called');
    service.silly('should be called');

    expect(errorSpy).toBeCalledTimes(1);
    expect(warnSpy).toBeCalledTimes(1);
    expect(infoSpy).toBeCalledTimes(1);
    expect(debugSpy).toBeCalledTimes(1);
    expect(logSpy).toBeCalledTimes(3);
  });
});
