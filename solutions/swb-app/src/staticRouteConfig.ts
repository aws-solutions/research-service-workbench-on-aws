/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { RoutesIgnored, RoutesMap } from '@aws/workbench-core-authorization';
import { resourceTypeToKey } from '@aws/workbench-core-base';

const uuidRegExp: string = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
export const routesMap: RoutesMap = {
  '/aws-accounts': {
    POST: [
      {
        action: 'CREATE',
        subject: 'Account'
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
  [`/datasets/${resourceTypeToKey.dataset.toLowerCase()}-${uuidRegExp}`]: {
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
  [`/environments/${resourceTypeToKey.environment.toLowerCase()}-${uuidRegExp}`]: {
    GET: [
      {
        action: 'READ',
        subject: 'Environment'
      }
    ]
  },
  [`/environments/${resourceTypeToKey.environment.toLowerCase()}-${uuidRegExp}/connections`]: {
    GET: [
      {
        action: 'READ',
        subject: 'EnvironmentConnection'
      }
    ]
  },
  [`/environments/${resourceTypeToKey.environment.toLowerCase()}-${uuidRegExp}/start`]: {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'Environment'
      }
    ]
  },
  [`/environments/${resourceTypeToKey.environment.toLowerCase()}-${uuidRegExp}/stop`]: {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'Environment'
      }
    ]
  },
  [`/environments/${resourceTypeToKey.environment.toLowerCase()}-${uuidRegExp}/terminate`]: {
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
  [`/environmentTypes/${uuidRegExp}`]: {
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
  [`/environmentTypes/${uuidRegExp}/configurations`]: {
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
  [`/environmentTypes/${uuidRegExp}/configurations/${resourceTypeToKey.envTypeConfig.toLowerCase()}-${uuidRegExp}`]:
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
