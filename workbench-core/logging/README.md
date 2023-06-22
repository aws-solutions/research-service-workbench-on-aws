# Workbench Core Logging
## `main branch coverage`
[![codecov](https://codecov.io/github/aws-solutions/research-service-workbench-on-aws/branch/main/graph/badge.svg?flag=workbench-core-logging)](https://app.codecov.io/github/aws-solutions/research-service-workbench-on-aws/tree/main)

## `develop branch coverage`
[![codecov](https://codecov.io/github/aws-solutions/research-service-workbench-on-aws/branch/develop/graph/badge.svg?flag=workbench-core-logging)](https://app.codecov.io/github/aws-solutions/research-service-workbench-on-aws/tree/develop)

## Description

An extendable logging service

### Create a LoggingService Instance

Create a LoggingService instance using `new LoggingService()`.
```ts
const logger = new LoggingService({
    maxLogLevel: 'warn',
    includeLocation: false,
    metadata: {
        serviceName: 'example service'
    }
});
```

## Logging Messages

Messages can be logged using any of the log level methods.
```ts
//
// Any LoggingService instance
//
instance.error('This is an error message');
instance.warn('This is a warning message');
instance.info('This is an info message');
instance.http('This is an http message');
instance.verbose('This is a verbose message');
instance.debug('This is a debug message');
instance.silly('This is a silly message');
```

Messages are of the LogMessage type.
```ts
//
// Any LoggingService instance
//
instance.error(404);
instance.warn('This is a warning message');
instance.info(infoObject);
```

A LogMessageObject can also be added to log messages. If it is, the message parameter must be a string.
```ts
//
// Any LoggingService instance
//
instance.info('This is an error message', infoObject);
```

### Example

Input:
```ts
const logger = new LoggingService({
    maxLogLevel: 'debug',
    defaultMetadata: {
        serviceName: 'example service'
    }
});

logger.warn("warning message");

logger.info({
    parameters: ["param1", 123, false],
    extra: "information"
});

logger.error("Log message", {
    parameters: ["param1", 123, false],
    extra: "information"
});
```

Output:
```json
{
    "level": "warn",
    "location": "someFunction someFile:lineNumber",
    "message": "warning message",
    "meta": {
        "serviceName": "example service"
    }
}

{
    "level": "info",
    "location": "someFunction someFile:lineNumber",
    "message": {
        "extra": "information",
        "parameters": ["param1", 123, false]
    },
    "meta": {
        "serviceName": "example service"
    }
}


{
    "extra": "information",
    "level": "error",
    "location": "someFunction someFile:lineNumber",
    "message": "Log message",
    "meta": {
        "serviceName": "example service"
    },
    "parameters": ["param1", 123, false]
}
```

## Extending LoggingService

`LoggingService` uses `WinstonPlugin` as the default `LoggingPlugin` but can be replaced with a user-provided plugin.
User-provided plugin must meet the following criteria:
- Implement the `LoggingPlugin` interface
- Implement the following log levels and their priorities (highest to lowest)
    - `error: 0`
    - `warn: 1`
    - `info: 2`
    - `http: 3`
    - `verbose: 4`
    - `debug: 5`
    - `silly: 6`
- Handle ignoring logs with log levels higher than the log level set with `setMaxLogLevel()`

## Extending WinstonPlugin

`WinstonPlugin` uses `ConsoleTransport` as the default transport but can be replaced with a user-provided transport (or multiple transports).
User-provided transports must extend the `TransportStream` class from the `winston-transport` npm package found [here](https://www.npmjs.com/package/winston-transport).
