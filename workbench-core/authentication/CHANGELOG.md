# Change Log - @aws/workbench-core-authentication

## 1.0.1
Wed, 16 Aug 2023

### Patches

- Replacing toMatchObject with toStrictEqual
- Allowing multiple App ClientIds for Cognito

## 1.0.0
Wed, 07 Jun 2023 21:47:22 GMT

### Breaking changes

- Updated getUserRolesFromToken to not throw when roles are not found.
- Add new Template getting API, upgrade packages
- BREAKING CHANGE: User interface now uses `id` instead of `uid`
- BREAKING CHANGE: An instance of AwsService is required in the CognitoUserManagementPlugin constructor.
- BREAKING CHANGE: `listUsers` returns a list of `User` instead of a list of user ids.
- BREAKING CHANGE: `createUser` function now returns the created `User`.
- BREAKING CHANGE - refactored user management into its own package
- BREAKING CHANGE: added `status` to User interface, replaced `User` with `CreateUser` interface in `createUser` function

### Minor changes

- Added CSRF middleware, updated other middlware/route handlers to accept a csrf parameter
- Added `websiteUrl` param to AuthenticationService to allow for dynamic redirection after login/logout
- Updates for separating UI packages
- Added option to middleware to set the sameSite cookie option if 'strict' is too restrictive, removed Authorization header based authentication, now using maxAge instead of expires for auth cookies, changed getTimeInSeconds to getTimeInMS, cognitoAuthenticationPlugin now uses ms internally, validateToken now only validates access tokens
- Added activate/deactive user functionality to UserManagementService.
- implement token revocation

### Patches

- Fixed bug in authenticationMiddleware where verifyToken used Authorization header instead of access_token cookie
- solution renaming
- user management api
- Changing Admin to ITAdmin
- Updated @aws-sdk/* dependencies to ^3.186.0
- update rush dependencies
- update rush dependencies
- revert
- Refactored thrown errors to use the encapsulated error message.
- nodejs version update

## 0.1.1
Fri, 29 Jul 2022 19:02:48 GMT

_Version update only_

## 0.1.0
Fri, 29 Jul 2022 16:54:02 GMT

### Minor changes

- Initial release

