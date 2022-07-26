/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { RoutesIgnored, RoutesMap } from '@amzn/workbench-core-authorization';

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
  '/datasets/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}': {
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
  '/environments/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}': {
    GET: [
      {
        action: 'READ',
        subject: 'Environment'
      }
    ]
  },
  '/environments/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/connections': {
    GET: [
      {
        action: 'READ',
        subject: 'EnvironmentConnection'
      }
    ]
  },
  '/environments/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/start': {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'Environment'
      }
    ]
  },
  '/environments/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/stop': {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'Environment'
      }
    ]
  },
  '/environments/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/terminate': {
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
  '/environmentTypes/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}': {
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
  '/environmentTypes/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/configurations': {
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
  '/environmentTypes/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/configurations/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}':
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
    GET: true
  },
  '/refresh': {
    GET: true
  },
  '/loggedIn': {
    GET: true
  }
};
