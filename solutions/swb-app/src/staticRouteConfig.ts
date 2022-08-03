/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { RoutesIgnored, RoutesMap } from '@aws/workbench-core-authorization';

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
  },
  '/projects/[A-Za-z0-9-]+/clusters/[A-Za-z0-9-]+': {
    GET: [
      {
        action: 'READ',
        subject: 'SingleAWSCluster'
      }
    ]
  },
  '/projects/[A-Za-z0-9-]+/clusters': {
    GET: [
      {
        action: 'READ',
        subject: 'AllAWSClusters'
      }
    ]
  },
  '/projects/[A-Za-z0-9-]+/clusters/[A-Za-z0-9-]+/headNode/[A-Za-z0-9-]+/jobs': {
    GET: [
      {
        action: 'READ',
        subject: 'JobQueue'
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: 'SubmitJob'
      }
    ]
  },
  '/projects/[A-Za-z0-9-]+/clusters/[A-Za-z0-9-]+/headNode/[A-Za-z0-9-]+/jobs/[0-9]+/cancel': {
    PUT: [
      {
        action: 'DELETE',
        subject: 'CancelJob'
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
