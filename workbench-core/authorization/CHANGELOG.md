# Change Log - @aws/workbench-core-authorization

## 1.0.1
Wed, 16 Aug 2023

### Patches

- Replacing toMatchObject with toStrictEqual

## 1.0.0
Wed, 07 Jun 2023 21:47:22 GMT

### Breaking changes

- Add new Template getting API, upgrade packages

### Minor changes

- Updates for separating UI packages
- Added `getGroupUsers` API
- add createIdentityPermissions
- deleteIdentityPermissions implemented
- implement doesGroupExist
- Implementing deleteSubjectIdentityPermissions
- add getIdentityPermissionsByIdentity
- getIdentityPermissionsBySubject implemented
- Added GroupManagementPlugin interface and reference implementation.
- Exposed `AuthenticatedUserParser` at the top-level.
- Added createGroup API to DynamicAuthorizationService
- Implemented `getGroupStatus` and `setGroupStatus` methods in `WBCGroupManagementPlugin`.
- Implemented `getUserGroups` function.
- Implemented `isUserAssignedToGroup` API.
- Implemented removeUserFromGroup API.
- add dynamicAuthorizationMiddleware
- add isAuthorizedOnSubject to DynamicAuthorizationService
- add isAuthorizedOnSubject and isAuthorizedOnRoute to DynamicAuthorizationService
- add getOperationsByRoute, isRouteProtected, and isRouteIgnored
- implement limit on number identity permissions retrieved
- add validate user groups

### Patches

- added Remove Dataset functionality
- exported parser
- Integrating AuthZ with Projects
- adding pagination to listUsersByRole
- fix validation issue with auth user object
- Add length and format validations
- Adding implementation of dynamicAuthorization.deleteGroup
- fix delete group of non existent group to be idempotent
- Updated `createGroup` and `setGroupStatus` to not allow operations with incorrect statuses.
- solution renaming
- add userId zod
- revert
- Add AuditService to addUserToGroup method
- Changing Admin to ITAdmin
- add rate limiter to middleware
- Remove delete_pending status information
- Added implementation of method addUserToGroup
- update rush dependencies
- update rush dependencies and change ttl type to number
- fix to make DENY take precedence
- AddUserToGroup to verify group is NOT being deleted
- nodejs version update

## 0.1.1
Fri, 29 Jul 2022 19:02:48 GMT

_Version update only_

## 0.1.0
Fri, 29 Jul 2022 16:54:02 GMT

### Minor changes

- Initial release

