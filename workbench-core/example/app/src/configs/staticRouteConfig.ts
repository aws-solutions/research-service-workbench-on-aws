/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { RoutesIgnored, RoutesMap } from '@aws/workbench-core-authorization';
import { groupIDRegExpAsString, uuidRegExpAsString } from '@aws/workbench-core-base';
import { dataSetPrefix, endPointPrefix } from './constants';

export const routesMap: RoutesMap = {
  '/hello-world': {
    GET: [
      {
        action: 'READ',
        subject: 'Example'
      }
    ]
  },
  '/datasets': {
    GET: [
      {
        action: 'READ',
        subject: 'Dataset'
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: 'Dataset'
      }
    ]
  },
  '/datasets/import': {
    POST: [
      {
        action: 'CREATE',
        subject: 'Dataset'
      }
    ]
  },
  '/datasets/iam': {
    POST: [
      {
        action: 'CREATE',
        subject: 'DatasetRole'
      }
    ],
    PATCH: [
      {
        action: 'UPDATE',
        subject: 'DatasetRole'
      }
    ]
  },
  [`/datasets/${dataSetPrefix.toLowerCase()}-${uuidRegExpAsString}`]: {
    GET: [
      {
        action: 'READ',
        subject: 'Dataset'
      }
    ],
    DELETE: [
      {
        action: 'DELETE',
        subject: 'Dataset'
      }
    ]
  },
  [`/datasets/${dataSetPrefix.toLowerCase()}-${uuidRegExpAsString}/permissions`]: {
    POST: [
      {
        action: 'CREATE',
        subject: 'DatasetAccess'
      }
    ],
    GET: [
      {
        action: 'READ',
        subject: 'DatasetAccess'
      }
    ]
  },
  [`/datasets/${dataSetPrefix.toLowerCase()}-${uuidRegExpAsString}/permissions/users/${uuidRegExpAsString}`]:
    {
      GET: [
        {
          action: 'READ',
          subject: 'DatasetAccess'
        }
      ],
      DELETE: [
        {
          action: 'DELETE',
          subject: 'DatasetAccess'
        }
      ]
    },
  [`/datasets/${dataSetPrefix.toLowerCase()}-${uuidRegExpAsString}/permissions/roles/${groupIDRegExpAsString}`]:
    {
      GET: [
        {
          action: 'READ',
          subject: 'DatasetAccess'
        }
      ],
      DELETE: [
        {
          action: 'DELETE',
          subject: 'DatasetAccess'
        }
      ]
    },
  [`/datasets/${dataSetPrefix.toLowerCase()}-${uuidRegExpAsString}/share`]: {
    POST: [
      {
        action: 'CREATE',
        subject: 'Endpoint'
      }
    ]
  },
  [`/datasets/${dataSetPrefix.toLowerCase()}-${uuidRegExpAsString}/presignedUpload`]: {
    POST: [
      {
        action: 'CREATE',
        subject: 'DatasetFile'
      }
    ]
  },
  [`/datasets/${dataSetPrefix.toLowerCase()}-${uuidRegExpAsString}}/share/${endPointPrefix.toLowerCase()}-${uuidRegExpAsString}`]:
    {
      DELETE: [
        {
          action: 'DELETE',
          subject: 'Endpoint'
        }
      ]
    },
  '/datasets/storage': {
    GET: [
      {
        action: 'READ',
        subject: 'Storage'
      }
    ]
  },
  '/roles': {
    POST: [
      {
        action: 'CREATE',
        subject: 'Role'
      }
    ]
  },
  [`/roles/${groupIDRegExpAsString}`]: {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'Role'
      }
    ]
  },
  '/users': {
    GET: [
      {
        action: 'READ',
        subject: 'User'
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: 'User'
      }
    ]
  },
  [`/users/${uuidRegExpAsString}`]: {
    GET: [
      {
        action: 'READ',
        subject: 'User'
      }
    ],
    DELETE: [
      {
        action: 'DELETE',
        subject: 'User'
      }
    ]
  },
  [`/users/${uuidRegExpAsString}/activate`]: {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'User'
      }
    ]
  },
  [`/users/${uuidRegExpAsString}/deactivate`]: {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'User'
      }
    ]
  },
  [`/users/${uuidRegExpAsString}/roles`]: {
    GET: [
      {
        action: 'READ',
        subject: 'User'
      }
    ]
  },
  '/authorization/groups': {
    POST: [
      {
        action: 'CREATE',
        subject: 'AuthorizationGroup'
      }
    ]
  },
  [`/authorization/groups/users/${uuidRegExpAsString}`]: {
    GET: [
      {
        action: 'READ',
        subject: 'AuthorizationUser'
      }
    ]
  },
  [`/authorization/groups/${groupIDRegExpAsString}/add-user`]: {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'AuthorizationGroup'
      }
    ]
  },
  [`/authorization/groups/${groupIDRegExpAsString}/remove-user`]: {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'AuthorizationGroup'
      }
    ]
  },
  [`/authorization/groups/${groupIDRegExpAsString}/get-users`]: {
    GET: [
      {
        action: 'READ',
        subject: 'AuthorizationGroup'
      }
    ]
  },
  [`/authorization/groups/${groupIDRegExpAsString}/is-user-assigned/${uuidRegExpAsString}`]: {
    GET: [
      {
        action: 'READ',
        subject: 'AuthorizationGroup'
      }
    ]
  },
  [`/authorization/groups/${groupIDRegExpAsString}`]: {
    DELETE: [
      {
        action: 'DELETE',
        subject: 'AuthorizationGroup'
      }
    ]
  },
  '/authorization/permissions': {
    POST: [
      {
        action: 'CREATE',
        subject: 'IdentityPermission'
      }
    ],
    DELETE: [
      {
        action: 'DELETE',
        subject: 'IdentityPermission'
      }
    ]
  },
  '/authorization/permissions/identity': {
    GET: [
      {
        action: 'READ',
        subject: 'IdentityPermission'
      }
    ]
  },
  '/authorization/permissions/subject': {
    GET: [
      {
        action: 'READ',
        subject: 'IdentityPermission'
      }
    ],
    DELETE: [
      {
        action: 'DELETE',
        subject: 'IdentityPermission'
      }
    ]
  },
  '/authorization/routes/ignored': {
    GET: [
      {
        action: 'READ',
        subject: 'Routes'
      }
    ]
  },
  '/authorization/routes/protected': {
    GET: [
      {
        action: 'READ',
        subject: 'Routes'
      }
    ]
  }
};

export const routesIgnored: RoutesIgnored = {
  '/login': {
    GET: true
  },
  '/token': {
    POST: true
  },
  '/logout': {
    POST: true
  },
  '/refresh': {
    GET: true
  },
  '/loggedIn': {
    GET: true
  }
};
