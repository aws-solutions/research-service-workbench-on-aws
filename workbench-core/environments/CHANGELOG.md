# Change Log - @aws/workbench-core-environments

## 1.0.1
Wed, 16 Aug 2023

### Patches

- Replacing toMatchObject with toStrictEqual
- Remove ID from error message

## 1.0.0
Wed, 07 Jun 2023 21:47:22 GMT

### Breaking changes

- Prevent updates on TERMINATED environments and removed projectId from createEnvironmentRequest
- Add new Template getting API, upgrade packages

### Minor changes

- Update routes for ETC with project as boundary
- Updates for separating UI packages
- Add environment type creation and update id format
- pass mainaccount keys to env provisioning

### Patches

- Create reciprical Database With Env item on environment creation
- Integrating AuthZ with Projects
- update datasets integration tests
- refactor: moved handler/envTypeHandler to postDeployment/envTypeSetup
- chore: add zod validations
- ETC zod updates
- chore: update zod method usages
- refactor ddb.update()
- Add environment type revoke validation
- Add environments to app registry on launch
- Add zod to environments API
- restrict ET model inputs
- Remove pk sk from envrionments response
- allow non admin users to see environments within same project
- add get environment type configs service method to retrieve by batch
- Add Zod generic pagination
- change putRequests params to putItems
- fix: cognito user pool id retrieval
- Updated to use new storageLocation optimization.
- Fixing postDeployment setup
- Replaced require with import
- Updated for DataSets AuthZ.
- solution renaming
- replace with authorized fictitious data
-  update nonEmpty() to optionalNonEmpty()
- Small refactor
- update test
- refactor pagination utilities
- Updated file path parsing to use the `path` module.
- added better error handling when launching an environment and metadata doesn't exist
- add prefixes to resource ids to allow easier resource identification
- Add Project to Dataset+Endpoint metadata to track relationship during environment create/delete
- revert
- add post deployment script for mock dynamic auth z
- Modified Environment object: removed datasetIds and changed type to be the Environment Type Config's sk value
- Add AVAILABLE/DELETE status to ETC
- Changing Admin to ITAdmin
- Updated @aws-sdk/* dependencies to ^3.186.0
- basic changes to avoid failure when handling new dataset authenticated user parameters
- update audit config
- updating DataSetService usage for new constructor argument
- Updated to use `addDataSetExternalEndpointForGroup`.
- Updated unit tests to match new Datasets interface.
- update rush dependencies
- update rush dependencies
- Replace schemas with Zod and use new ddb schema on ETC routes
- nodejs version update
- remove log that might expose sensitive information

## 0.1.2
Wed, 10 Aug 2022 17:48:12 GMT

_Version update only_

## 0.1.1
Fri, 29 Jul 2022 19:02:48 GMT

_Version update only_

## 0.1.0
Fri, 29 Jul 2022 16:54:02 GMT

### Minor changes

- Initial release

