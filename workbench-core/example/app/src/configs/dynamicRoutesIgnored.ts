/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { RoutesIgnored } from '@aws/workbench-core-authorization';

export const routesUsedByStaticAuthorization: RoutesIgnored = {
  '/hello-world': {
    GET: true
  },
  '/datasets': {
    GET: true,
    POST: true
  },
  '/datasets/import': {
    POST: true
  },
  '/datasets/iam': {
    POST: true,
    PATCH: true
  },
  '/datasets/storage': {
    GET: true
  },
  '/datasets/:datasetId/share': {
    POST: true
  },
  '/datasets/:datasetId/share/:endpointId': {
    DELETE: true
  },
  '/datasets/:datasetId/share/:endpointId/mount-object': {
    GET: true
  },
  '/datasets/:datasetId/presignedUpload': {
    POST: true
  },
  '/datasets/:datasetId': {
    GET: true,
    DELETE: true
  },
  '/datasets/:datasetId/permissions': {
    POST: true,
    GET: true
  },
  '/datasets/:datasetId/permissions/roles/:roleId': {
    GET: true,
    DELETE: true
  },
  '/datasets/:datasetId/permissions/users/:userId': {
    GET: true,
    DELETE: true
  },
  '/users': {
    POST: true,
    GET: true
  },
  '/users/:userId': {
    GET: true,
    DELETE: true
  },
  '/users/:userId/activate': {
    PUT: true
  },
  '/users/:userId/deactivate': {
    PUT: true
  },
  '/users/:userId/roles': {
    GET: true
  },
  '/roles': {
    POST: true
  },
  '/roles/:roleName': {
    PUT: true
  },
  '/authorization/groups': {
    POST: true
  },
  '/authorization/groups/users/:userId': {
    GET: true
  },
  '/authorization/groups/:groupId/add-user': {
    PUT: true
  },
  '/authorization/groups/:groupId': {
    DELETE: true
  },
  '/authorization/groups/:groupId/remove-user': {
    PUT: true
  },
  '/authorization/groups/:groupId/get-users': {
    GET: true
  },
  '/authorization/groups/:groupId/is-user-assigned/:userId': {
    GET: true
  },
  '/authorization/groups/:groupId/does-group-exist': {
    GET: true
  },
  '/authorization/permissions': {
    POST: true,
    DELETE: true
  },
  '/authorization/permissions/identity': {
    GET: true
  },
  '/authorization/permissions/subject': {
    GET: true,
    DELETE: true
  },
  '/authorization/routes/protected': {
    GET: true
  },
  '/authorization/routes/ignored': {
    GET: true
  },
  '/authorization/authorize/subject': {
    GET: true
  }
};
