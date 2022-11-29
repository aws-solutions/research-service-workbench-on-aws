/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { RoutesIgnored, RoutesMap } from '@aws/workbench-core-authorization';
import { resourceTypeToKey, validRolesRegExpAsString, uuidRegExpAsString } from '@aws/workbench-core-base';

export const routesMap: RoutesMap = {
  '/aws-accounts': {
    POST: [
      {
        action: 'CREATE',
        subject: 'Account'
      }
    ]
  },
  '/costCenters': {
    POST: [
      {
        action: 'CREATE',
        subject: 'CostCenter'
      }
    ]
  },
  [`/costCenters/${resourceTypeToKey.costCenter.toLowerCase()}-${uuidRegExpAsString}`]: {
    GET: [
      {
        action: 'READ',
        subject: 'CostCenter'
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
  [`/datasets/${resourceTypeToKey.dataset.toLowerCase()}-${uuidRegExpAsString}`]: {
    GET: [
      {
        action: 'READ',
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
  '/datasets/share': {
    POST: [
      {
        action: 'CREATE',
        subject: 'Dataset'
      }
    ]
  },
  '/environments': {
    GET: [
      {
        action: 'READ',
        subject: 'Environment'
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: 'Environment'
      }
    ]
  },
  [`/environments/${resourceTypeToKey.environment.toLowerCase()}-${uuidRegExpAsString}`]: {
    GET: [
      {
        action: 'READ',
        subject: 'Environment'
      }
    ]
  },
  [`/environments/${resourceTypeToKey.environment.toLowerCase()}-${uuidRegExpAsString}/connections`]: {
    GET: [
      {
        action: 'READ',
        subject: 'EnvironmentConnection'
      }
    ]
  },
  [`/environments/${resourceTypeToKey.environment.toLowerCase()}-${uuidRegExpAsString}/start`]: {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'Environment'
      }
    ]
  },
  [`/environments/${resourceTypeToKey.environment.toLowerCase()}-${uuidRegExpAsString}/stop`]: {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'Environment'
      }
    ]
  },
  [`/environments/${resourceTypeToKey.environment.toLowerCase()}-${uuidRegExpAsString}/terminate`]: {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'Environment'
      }
    ]
  },
  '/environmentTypes': {
    GET: [
      {
        action: 'READ',
        subject: 'EnvironmentType'
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: 'EnvironmentType'
      }
    ]
  },
  [`/environmentTypes/${uuidRegExpAsString}`]: {
    GET: [
      {
        action: 'READ',
        subject: 'EnvironmentType'
      }
    ],
    PUT: [
      {
        action: 'UPDATE',
        subject: 'EnvironmentType'
      }
    ]
  },
  [`/environmentTypes/${uuidRegExpAsString}/configurations`]: {
    GET: [
      {
        action: 'READ',
        subject: 'EnvironmentTypeConfig'
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: 'EnvironmentTypeConfig'
      }
    ]
  },
  [`/environmentTypes/${uuidRegExpAsString}/configurations/${resourceTypeToKey.envTypeConfig.toLowerCase()}-${uuidRegExpAsString}`]:
    {
      GET: [
        {
          action: 'READ',
          subject: 'EnvironmentTypeConfig'
        }
      ],
      PUT: [
        {
          action: 'UPDATE',
          subject: 'EnvironmentTypeConfig'
        }
      ]
    },
  '/projects': {
    GET: [
      {
        action: 'READ',
        subject: 'Project'
      }
    ]
  },
  [`/projects/${resourceTypeToKey.project.toLowerCase()}-${uuidRegExpAsString}/users/${uuidRegExpAsString}`]:
    {
      POST: [
        {
          action: 'CREATE',
          subject: 'AssignUserToProject'
        }
      ],
      DELETE: [
        {
          action: 'DELETE',
          subject: 'AssignUserToProject'
        }
      ]
    },
  [`/projects/${resourceTypeToKey.project.toLowerCase()}-${uuidRegExpAsString}/users/${validRolesRegExpAsString}`]:
    {
      GET: [
        {
          action: 'READ',
          subject: 'Project'
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
    DELETE: [
      {
        action: 'DELETE',
        subject: 'User'
      }
    ],
    PATCH: [
      {
        action: 'UPDATE',
        subject: 'User'
      }
    ]
  },
  '/roles/Researcher': {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'Role'
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
