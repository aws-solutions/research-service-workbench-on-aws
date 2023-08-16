# Change Log - @aws/workbench-core-infrastructure

## 1.0.1
Wed, 16 Aug 2023

### Patches
* Allow multiple App clientIds for Cognito

## 1.0.0
Wed, 07 Jun 2023 21:47:22 GMT

### Breaking changes

- BREAKING CHANGE: changed MFA default to OPTIONAL, changed default accessTokenValidity to 7 days, added optional parameters to change these values
- Add new Template getting API, upgrade packages

### Minor changes

- Renamed `websiteUrl` to `websiteUrls` and changed type to string array to allow one backend API to serve multiple UI clients
- Updates for separating UI packages
- Adding support for user pool advanced security mode

### Patches

- Integrating AuthZ with Projects
- Parameterize user inputs for Solutions
- Added default token validity length (15 minutes for id and access, 30 days for refresh)
- enable 'ALLOW_USER_PASSWORD_AUTH'
- solution renaming
- replace with authorized fictitious data
- revert commit
- revert
- update rush dependencies
- update rush dependencies
- cdk and nodejs version update

## 0.1.1
Wed, 10 Aug 2022 17:48:12 GMT

### Patches

- get cognito access_token programmatically

## 0.1.0
Fri, 29 Jul 2022 16:54:02 GMT

### Minor changes

- Initial release

