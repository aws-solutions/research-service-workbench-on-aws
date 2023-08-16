# Change Log - @aws/workbench-core-accounts

## 1.0.1
Wed, 16 Aug 2023

### Patches

- Cost Centers require a CURRENT account
- Main account can be hosting
- Remove ID from error message

## 1.0.0
Wed, 07 Jun 2023 21:47:22 GMT

### Breaking changes

- Add template signing + parameters, upgrade packages
- Add new Template getting API, upgrade packages

### Minor changes

- Added CostCenter
- Added object parsing and changed db method
- Update routes for ETC with project as boundary
- change HostingAccountLifecycleService to attach host account to S3DatasetsEncryptionKey S3ArtifactsEncryptionKey policy
- Add CREATE Project API
- add Update Project
- add template api/route
- User to project association API
- added support for Cost Center list API

### Patches

- update name validation
- Updating params for account creation and updating
- added CreateCostCenterParser
- Integrating AuthZ with Projects
- updated types
- fixed getUserRole test
- add pagination to listUsersForRole
- update dataset integration tests
- chore: make packages more modular
- chore: update zod method usages
- refactor ddb.update()
- Remove pk sk from environment response
- Add zod generic pagination
- fix: use aws cdk lib for iam
- checkDepdendency should return Promise not void
- Updated `buildTemplateUrlsForAccount` in `HostingAccountLifecycleService` to use the correct arn for the status handler role.
- add zod to filter
- solution renaming
- add zod regex to cost center and account parser
- add zod to projRoute
- update route
- Remove DynamicAuthZ logic from ProjectService
- Remove DynamicAuthZ logic from ProjectService
- delete accountService.delete as it is never used
- updated List Projects logic
- update GET project method
- add filter and sort support for List Projects
- update with pag helper change
- small refactors and improvements
- add export
- add userId zod
- add prefixes to resource ids to allow easier resource identification
- revert
- Add export for ProjectStatus
- Update account handler to check onboard-account-byon.cfn.yml and onboard-account.cfn.yml so if users have a hosting account that isn't onboard-account.cfn.yml, their account status is correct.
- added Zod parser for account services
- update error message
- error validation for create account
- Updated @aws-sdk/* dependencies to ^3.186.0
- return template URLs for byon deployments along with vanilla.
- update rush dependencies
- update rush dependencies
- Verify that Cost Center was not deleted before creating new Project
- nodejs version update

