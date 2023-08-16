# Change Log - @aws/workbench-core-user-management

## 1.0.1
Wed, 16 Aug 2023

### Patches

- Replacing toMatchObject with toStrictEqual
- Remove all temp role access when role is deleted

## 1.0.0
Wed, 07 Jun 2023 21:47:22 GMT

### Breaking changes

- BREAKING CHANGE - refactored user management into its own package

### Minor changes

- Added `getUserRoles` API.
- add validate user groups

### Patches

- add pagination to listUsersForRole
- Add zod validations to user APIs
- add cognito group limit
- solution renaming
- new error message
- add pagination to list users
- revert
- Added `TooManyRequestError`s to all Cognito functions
- update rush dependencies
- update rush dependencies
- nodejs version update
- add pagination to user role call

