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
    ],
    DELETE: [
      {
        action: 'DELETE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_COST_CENTER,
          subjectId: '${costCenter}'
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
  '/projects/:projectId/datasets': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_DATASET_LIST,
          subjectId: '*',
          projectId: '${projectId}'
        }
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_DATASET,
          subjectId: '*',
          projectId: '${projectId}'
        }
      }
    ]
  },
  '/projects/:projectId/datasets/:datasetId': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_DATASET,
          subjectId: '${datasetId}',
          projectId: '${projectId}'
        }
      }
    ],
    DELETE: [
      {
        action: 'DELETE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_DATASET,
          subjectId: '${datasetId}',
          projectId: '${projectId}'
        }
      }
    ]
  },
  '/projects/:projectId/datasets/:datasetId/permissions': {
    PUT: [
      {
        action: 'UPDATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_DATASET_ACCESS_LEVEL,
          subjectId: '${datasetId}'
        }
      }
    ],
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_DATASET_ACCESS_LEVEL,
          subjectId: '${datasetId}'
        }
      }
    ]
  },
  '/projects/:projectId/datasets/:datasetId/upload-requests': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_DATASET_UPLOAD,
          subjectId: '${datasetId}',
          projectId: '${projectId}'
        }
      }
    ]
  },
  '/projects/:projectId/datasets/import': {
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_DATASET,
          subjectId: '*',
          projectId: '${projectId}'
        }
      }
    ]
  },
  '/projects/:projectId/datasets/share': {
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_DATASET,
          subjectId: '*',
          projectId: '${projectId}'
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
  '/environmentTypes/:envTypeId': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ENVIRONMENT_TYPE,
          subjectId: '${envTypeId}'
        }
      }
    ],
    PATCH: [
      {
        action: 'UPDATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ENVIRONMENT_TYPE,
          subjectId: '${envTypeId}'
        }
      }
    ]
  },
  '/environmentTypes/:envTypeId/configurations': {
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
  '/environmentTypes/:envTypeId/configurations/:envTypeConfigId': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ETC,
          subjectId: '${envTypeConfigId}' // no required boundary to control which ETs a user can see
        }
      }
    ],
    PATCH: [
      {
        action: 'UPDATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ETC,
          subjectId: '${envTypeConfigId}' // no required boundary to control which ETs a user can see
        }
      }
    ],
    DELETE: [
      {
        action: 'DELETE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ETC,
          subjectId: '${envTypeConfigId}' // no required boundary to control which ETs a user can see
        }
      }
    ]
  },
  '/environmentTypes/:envTypeId/configurations/:envTypeConfigId/projects': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_PROJECT_LIST_BY_ETC,
          subjectId: '*'
        }
      }
    ]
  },
  '/projects': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_PROJECT_LIST,
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
          subjectId: '${datasetId}'
        }
      }
    ],
    DELETE: [
      {
        action: 'DELETE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_DATASET_ACCESS_LEVEL,
          subjectId: '${datasetId}'
        }
      }
    ]
  },
  '/projects/:projectId/environmentTypes/:envTypeId/configurations': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ETC,
          subjectId: '*',
          projectId: '${projectId}'
        }
      }
    ]
  },
  '/projects/:projectId/environmentTypes/:envTypeId/configurations/:envTypeConfigId': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_ETC,
          subjectId: '*',
          projectId: '${projectId}'
        }
      }
    ]
  },
  '/projects/:projectId/environmentTypes/:envTypeId/configurations/:envTypeConfigId/relationships': {
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
    ],
    DELETE: [
      {
        action: 'DELETE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_PROJECT,
          subjectId: '${projectId}'
        }
      }
    ]
  },
  '/projects/:projectId/users/:userId/relationships': {
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_PROJECT_USER_ASSOCIATION,
          subjectId: '*',
          projectId: '${projectId}'
        }
      }
    ],
    DELETE: [
      {
        action: 'DELETE',
        subject: {
          subjectType: SwbAuthZSubject.SWB_PROJECT_USER_ASSOCIATION,
          subjectId: '*',
          projectId: '${projectId}'
        }
      }
    ]
  },
  '/projects/:projectId/users': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_PROJECT_USER_ASSOCIATION,
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
  '/users/:userId/purge': {
    DELETE: [
      {
        action: 'DELETE',
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
  '/projects/:projectId/sshKeys/:sshKeyId/purge': {
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
  },
  '/projects/:projectId/environments/:environmentId/sshKeys': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: SwbAuthZSubject.SWB_SSH_KEY,
          subjectId: '*',
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
