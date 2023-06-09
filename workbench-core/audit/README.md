# Workbench Core Audit
## `main branch coverage`
[![codecov](https://codecov.io/github/aws-solutions/research-service-workbench-on-aws/branch/main/graph/badge.svg?flag=workbench-core-audit)](https://codecov.io/gh/aws-solutions/research-service-workbench-on-aws/tree/main)

## `develop branch coverage`
[![codecov](https://codecov.io/github/aws-solutions/research-service-workbench-on-aws/branch/develop/graph/badge.svg?flag=workbench-core-audit)](https://codecov.io/gh/aws-solutions/research-service-workbench-on-aws/tree/develop)

## Description
The audit component is a flexible and extensible auditing library. It is designed with the plugin-architecture to allow developers to decide and implement their own process of storing audit logs.

## How to use
### Components

#### Audit Plugin:
The audit plugin enables developers to extend and develop the `Audit Service` to configure the `Audit Entry` using the `Metadata` to their specification. The component requires a `writer` and `prepare` functionality. The BaseAuditPlugin is the reference implementation 

#### Writer:
The Writer is an interface that was created to enable developers to implement their own methods of storing auditing log. The following will be implemented using a `Logger` service.

### 1. Create a writer
```ts
export default interface Writer {  
/**  
* Write the audit entry to an output source.  
* @param metadata - {@link Metadata}  
* @param auditEntry - {@link AuditEntry}  
*/  
write(metadata: Metadata, auditEntry: AuditEntry): Promise<void>;  
/**  
* Prepare the audit entry to be written.  
* @param metadata - {@link Metadata}  
* @param auditEntry - {@link AuditEntry}  
*/  
prepare?(metadata: Metadata, auditEntry: AuditEntry): Promise<void>;  
}
```

The above is an interface for the Writer. Developers can create a separate class that implements this interface. There they would set the method for which they would like to store the audit logs(S3, CloudWatch, DynamoDB, etc...);  
  
Here is an example of an AuditLogger that implements the Writer:  
```ts
class AuditLogger implements Writer {  
    private logger:Logger;  
    public constructor(logger: Logger) {  
        this.logger = logger;  
    }  
    public async write(metadata:Metadata, auditEntry: AuditEntry): Promise<void> {  
    logger.info(auditEntry);  
    }  
}
```
### 2. Create the BaseAuditPlugin
This is the reference implementation of the AuditPlugin and helps to standardize what is required for auditing. The following are the required values for auditing with the BaseAuditPlugin:

- **statusCode**: The status code of the request
- **action**:  The requested action 
- **actor**:  The actor that is performing the action
- **source**:  The source of where the request is coming from

The following is an example on how to instantiate the BaseAuditPlugin using the `AuditLogger`.
```ts
const writer: Writer = new AuditLogger(logger);  
const baseAuditPlugin:BaseAuditPlugin = new BaseAuditPlugin(writer);
```

### 3. Create the Audit Config
This config will be used for the Audit Service and comes with options to configure.

#### Config options
```ts
interface AuditServiceConfig {
	continueOnError?: boolean;
	auditPlugin: AuditPlugin;
	requiredAuditValues: string[];
	fieldsToMask: string[];
}
```
- **auditPlugin**:  A configured AuditPlugin
- **requiredAuditValues**: An array strings required for auditing. The default is set to `['actor', 'source', 'statusCode', 'action']`
- **continueOnError**: An optional flag indicating if the method should continue on error when audit entry does not have all required values. The default is set to `false`.
- **fieldsToMask**: Fields to mask. The default is set to `['password', 'accessKey']`

### 3. Create the Audit Service
The audit service is the core component of this library and is where the plugins will be utilized.

The following is an example:
```ts
const continueOnError = false;
const requiredAuditValues = ['actor', 'source'];
const fieldsToMask = ['user', 'password'];
const auditService:AuditService = new AuditService(
	baseAuditPlugin, 
	continueOnError,
	requiredAuditValues,
	fieldsToMask
 );
```

## Integrating with ExpressJS using Middleware
Audit implemented as a middleware is a common use case. This library contains an audit middleware that integrates with ExpressJS.

The audit middleware requires a config. 

Below are the config options:
### Config options
```ts
export  interface  AuditConfig {
auditService: AuditService;
/**
* Paths to be excluded from auditing.
*/
excludePaths: string[];
/**
* Specific extractor for metadata information.
*/
extractor?: Extractor;
}
```
- **auditService**: A configured audit service
- **excludePaths**: An array string with paths to exclude from auditing
- **extractor**: An extractor used to extract the metadata. This gives developers flexibility in the way they want to extract the metadata from the Request and Response. The default is set to [BaseExtractor](https://github.com/aws-solutions/research-service-workbench-on-aws/blob/main/workbench-core/audit/src/baseExtractor.ts).
```ts
const app = express();
const excludePaths = ['\login','\signin'];
app.use(WithAudit({
	auditService,
	excludePaths
}));
```
**REQUIRED**: The middleware function needs to be mounted at the [app](https://expressjs.com/en/guide/using-middleware.html#middleware.application) level with no path, as it should execute every time a request is received. Click [here](https://expressjs.com/en/guide/using-middleware.html) for more information about ExpressJS middleware.