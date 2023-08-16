# Change Log - @aws/workbench-core-datasets

## 1.0.1
Wed, 16 Aug 2023

### Patches

- Replacing toMatchObject with toStrictEqual

## 1.0.0
Wed, 07 Jun 2023 21:47:22 GMT

### Breaking changes

- Optimized listStorageLocations to query storageLocation ddb entry.
- Renamed AddExternalEndpoint to AddExternalEndpointForUser and updated for AuthZ.
- Added authorization to `getDataSetMountObject` API.
- Updated `listDataSets` to only return the DataSets the `AuthorizedUser` has access to.
- Add new Template getting API, upgrade packages
- Added `fileName` parameter to `createPresignedUploadUrl` function

### Minor changes

- Exposed getPaginationToken API.
- Implemented removeDataset API
- Updates for separating UI packages
- Added functions to generate/update datasets IAM role CFN template
- Implement AddAccessPermission
- Add addDataSetAccessPermissions to DataSetService
- Expand auditing and correctly include 'actor'
- add dataSetsAuthorizationPlugin interface and associated objects
- add getDataSetAccessPermissions and GetAllDataSetAccessPermissions
- Added JSON schema objects for `addDatasetPermissionsToRole()` and `createRegisterExternalBucketRole()` functions.
- add removeDataSetAccessPermission
- update removeDataSet to also remove dataSet permissions
- implement access permission update on dataset creation
- create authorization plugin and pull into DataSetsService
- Added `addDataSetExternalEndpointForGroup` API.
- Added the listStorageLocations API to DatasetsService.
- Implemented presignedSinglePartUploadUrl endpoint.
- enabled pageSize for getAllDataSetAccessPermissions
- Added optional `owner`, `type`, and `description` fields to `DataSet` interface.

### Patches

- update project and dataset relationship management
- Updating params for account creation and updating
- added Remove Dataset functionality
- Updated type being used for authenticatedUser
- Integrating AuthZ with Projects
- added ListDataSetAccessPermission functionality
- Adding pagination to ListDataSets
- update datasets integration test
- refactor ddb.update()
- Added VPC compatibility to S3 access points
- fix: use aws cdk lib for iam
- Removed AuthenticatedUser from Datasets DDB entries.
- Reverted accidental change to CreateDataSet schema object.
- solution renaming
- add prefixes to resource ids to allow easier resource identification
- revert
- revert
- add optional checkDependency function to dataset
- add check to ensure dataset has no external endpoints before removal
- Updated @aws-sdk/* dependencies to ^3.186.0
- update create/import dataset to favor owner for read-only permissions over authenticated user
- add a group fallback to AddExternalEndpointForUser
- update rush dependencies
- update rush dependencies
- nodejs version update

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

