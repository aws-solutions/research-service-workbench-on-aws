# Change Log - @aws/workbench-core-base

## 1.0.1
Wed, 16 Aug 2023

### Patches

- Replacing toMatchObject with toStrictEqual
- Allowing multiple App clientIds for Cognito
- Remove ID from error message

## 1.0.0
Wed, 07 Jun 2023 21:47:22 GMT

### Breaking changes

- changed AddPutRequests, add addPutItems
- Add new Template getting API, upgrade packages

### Minor changes

- Added CostCenter
- Added new method to replace `query.execute()` because it's static return type doesn't match its runtime return type.
- Update routes for ETC with project as boundary
- Updates for separating UI packages
- update generateCognitoToken to allow param rootUserNameParamStorePath
- Add metadata service
- User to project association API
- add methods to manage metadata to metadataService
- Added presigned URL creation helper for file upload.
- add aws region and datasetId zod validation

### Patches

- update project and dataset relationship management
- update name validation
- Updating params for account creation and updating
- Added commitTransaction method to DynamoDBService
- adding `type` and `owner` to dataset creation API
- add pagination to listUsersForRole
- Merging from Solutions Pipeline creation
- chore: add zod id formats
- ETC zod updates
- chore: update user zod validations
- chore: update zod method usages
- add new ddb update method
- Add environment type revoke validation
- add appRegistry Service
- add lenght restriction functions
- add getItems ddb method and update metadata service
- add Zod extension methods for validations
- Add length and format validations
- Add zod generic pagination
- Add Filter and Sorting schemas and functions 
- fix: DS api and user regex fixes
- remove audit logger
- add zod filters
- Add services in SC to retrieve provision artifacts
- added groupID regex string
- add zod to filter
- add solution identifier to user agent
- solution renaming
- add zod awsAccountId method
- enforce between val1 <= val2
- add Zod model regex
- update validatorHelper
- update ZodString interface
- add new delete method with proper return type
- fix bug in updater method
- small enhancements to pagination and query utilities
- update pag helper to take in and return string as a type optionally
- add error to pagination token decoding
- add new ddb method with proper type
- refactor DDB and pagination utilities
- add ssh route pattern variables
- add sshkey and userid zod
- add textUtil functions for managing text formatting
- Add utility for concatenating multiple keys into SK
- revert
- reverting
- fix incorrect exception change
- Adding retry strategy to aws sdk clients
- fix getPaginatedItem bug
- update error message for accounts
- regular expression updates for creating account
- Changing Admin to ITAdmin
- Updated @aws-sdk/* dependencies to ^3.186.0
- ddbService addPutRequests handling of undefined expressionAttributeValues
- Refactored `createPresignedUploadUrl` helper function.
- update rush dependencies
- update rush dependencies
- add getItem method to retrieve single item unmarshalled
- nodejs version update
- add cognito service

## 0.1.2
Wed, 10 Aug 2022 17:48:12 GMT

### Patches

- get cognito access_token programmatically

## 0.1.1
Fri, 29 Jul 2022 19:02:48 GMT

_Version update only_

## 0.1.0
Fri, 29 Jul 2022 16:54:02 GMT

### Minor changes

- Initial release

