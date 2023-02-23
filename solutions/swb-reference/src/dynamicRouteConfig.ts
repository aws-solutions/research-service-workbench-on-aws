/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DynamicRoutesMap, RoutesIgnored } from '@aws/workbench-core-authorization';
import { SwbAuthZSubject } from './constants';

export const dynamicRoutesMap: DynamicRoutesMap = {
  '/awsAccounts': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_AWS_ACCOUNT,
          subjectId: '*'
        }
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_AWS_ACCOUNT,
          subjectId: '*'
        }
      }
    ]
  },
  '/awsAccountTemplateUrls': {
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_AWS_ACCOUNT_TEMPLATE_URL,
          subjectId: '*'
        }
      }
    ]
  },
  '/awsAccounts/:awsAccountId': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_AWS_ACCOUNT,
          subjectId: '${awsAccountId}'
        }
      }
    ],
    PATCH: [
      {
        action: 'UPDATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_AWS_ACCOUNT,
          subjectId: '${awsAccountId}'
        }
      }
    ]
  },
  '/costCenters': {
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_COST_CENTER,
          subjectId: '*'
        }
      }
    ],
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_COST_CENTER,
          subjectId: '*'
        }
      }
    ]
  },
  '/costCenters/:costCenter': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_COST_CENTER,
          subjectId: '${costCenter}'
        }
      }
    ],
    PATCH: [
      {
        action: 'UPDATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_COST_CENTER,
          subjectId: '${costCenter}'
        }
      }
    ]
  },
  '/costCenters/:costCenter/softDelete': {
    PUT: [
      {
        action: 'DELETE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_COST_CENTER,
          subjectId: '${costCenter}'
        }
      }
    ]
  },
  '/datasets': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_DATASET,
          subjectId: '*'
        }
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_DATASET,
          subjectId: '*'
        }
      }
    ]
  },
  '/datasets/:datasetId': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_DATASET,
          subjectId: '${datasetId}'
        }
      }
    ]
  },
  '/datasets/import': {
    // May need to add datasetId into this for authz
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_DATASET,
          subjectId: '*'
        }
      }
    ]
  },
  '/datasets/share': {
    // May need to add datasetId into this for authz
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_DATASET,
          subjectId: '*'
        }
      }
    ]
  },
  '/environments': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ENVIRONMENT,
          subjectId: '*'
        }
      }
    ]
  },
  '/projects/:projectId/environments': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ENVIRONMENT,
          subjectId: '*',
          projectId: '${projectId}'
        }
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ENVIRONMENT,
          subjectId: '*',
          projectId: '${projectId}'
        }
      }
    ]
  },
  '/projects/:projectId/environments/:environmentId': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ENVIRONMENT,
          subjectId: '${environmentId}',
          projectId: '${projectId}'
        }
      }
    ]
  },
  '/projects/:projectId/environments/:environmentId/connections': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ENVIRONMENT_CONNECTION,
          subjectId: '${environmentId}',
          projectId: '${projectId}'
        }
      }
    ]
  },
  '/projects/:projectId/environments/:environmentId/start': {
    PUT: [
      {
        action: 'UPDATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ENVIRONMENT,
          subjectId: '${environmentId}',
          projectId: '${projectId}'
        }
      }
    ]
  },
  '/projects/:projectId/environments/:environmentId/stop': {
    PUT: [
      {
        action: 'UPDATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ENVIRONMENT,
          subjectId: '${environmentId}',
          projectId: '${projectId}'
        }
      }
    ]
  },
  '/projects/:projectId/environments/:environmentId/terminate': {
    PUT: [
      {
        action: 'UPDATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ENVIRONMENT,
          subjectId: '${environmentId}',
          projectId: '${projectId}'
        }
      }
    ]
  },
  '/environmentTypes': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ENVIRONMENT_TYPE,
          subjectId: '*'
        }
      }
    ]
  },
  '/environmentTypes/:environmentTypeId': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ENVIRONMENT_TYPE,
          subjectId: '${environmentTypeId}'
        }
      }
    ],
    PATCH: [
      {
        action: 'UPDATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ENVIRONMENT_TYPE,
          subjectId: '${environmentTypeId}'
        }
      }
    ]
  },
  '/environmentTypes/:environmentTypeId/configurations': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ETC,
          subjectId: '*' // Doesn't need environmentTypeId because no required boundary to control which ETs a user can see
        }
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ETC,
          subjectId: '*' // Doesn't need environmentTypeId because no required boundary to control which ETs a user can see
        }
      }
    ]
  },
  '/environmentTypes/:environmentTypeId/configurations/:etcId': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ETC,
          subjectId: '${etcId}' // no required boundary to control which ETs a user can see
        }
      }
    ],
    PATCH: [
      {
        action: 'UPDATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ETC,
          subjectId: '${etcId}' // no required boundary to control which ETs a user can see
        }
      }
    ],
    DELETE: [
      {
        action: 'DELETE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ETC,
          subjectId: '${etcId}' // no required boundary to control which ETs a user can see
        }
      }
    ]
  },
  '/projects': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_PROJECT,
          subjectId: '*'
        }
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_PROJECT,
          subjectId: '*'
        }
      }
    ]
  },
  '/projects/:projectId/datasets/:datasetId/relationships': {
    PUT: [
      {
        action: 'UPDATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_DATASET_ACCESS_LEVEL,
          subjectId: '${datasetId}',
          projectId: '${projectId}'
        }
      }
    ]
  },
  '/projects/:projectId/environmentTypes/:environmentTypeId/configurations': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ETC,
          subjectId: '*' // only be called by ITAdmin with no Project boundary
        }
      }
    ]
  },
  '/projects/:projectId/environmentTypes/:environmentTypeId/configurations/:etcId/relationships': {
    PUT: [
      {
        action: 'UPDATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ETC,
          subjectId: '*' // only be called by ITAdmin with no Project boundary
        }
      }
    ],
    DELETE: [
      {
        action: 'DELETE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ETC,
          subjectId: '*' // only be called by ITAdmin with no Project boundary
        }
      }
    ]
  },
  '/projects/:projectId': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_PROJECT,
          subjectId: '${projectId}'
        }
      }
    ],
    PATCH: [
      {
        action: 'UPDATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_PROJECT,
          subjectId: '${projectId}'
        }
      }
    ]
  },
  '/projects/:projectId/softDelete': {
    PUT: [
      {
        action: 'DELETE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_PROJECT,
          subjectId: '${projectId}'
        }
      }
    ]
  },
  '/projects/:projectId/users/:userId': {
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_PROJECT_USER_ASSOCIATION,
          subjectId: '${projectId}' // Not using userId because no boundary on which users can be used
        }
      }
    ],
    DELETE: [
      {
        action: 'DELETE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_PROJECT_USER_ASSOCIATION,
          subjectId: '${projectId}' // Not using userId because no boundary on which users can be used
        }
      }
    ]
  },
  '/projects/:projectId/roles/:role/users': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_USER,
          subjectId: '*',
          projectId: '${projectId}'
        }
      }
    ]
  },
  '/users': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_USER,
          subjectId: '*'
        }
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_USER,
          subjectId: '*'
        }
      }
    ]
  },
  '/users/:userId': {
    DELETE: [
      {
        action: 'DELETE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_USER,
          subjectId: '${userId}'
        }
      }
    ],
    PATCH: [
      {
        action: 'UPDATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_USER,
          subjectId: '${userId}'
        }
      }
    ],
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_USER,
          subjectId: '${userId}'
        }
      }
    ]
  },
  '/projects/:projectId/sshKeys': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_SSH_KEY,
          subjectId: '*',
          projectId: '${projectId}'
        }
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_SSH_KEY,
          subjectId: '*',
          projectId: '${projectId}'
        }
      }
    ]
  },
  '/projects/:projectId/sshKeys/:sshKeyId': {
    DELETE: [
      {
        action: 'DELETE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_SSH_KEY,
          subjectId: '${sshKeyId}',
          projectId: '${projectId}'
        }
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
