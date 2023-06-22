/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DynamicRoutesMap, RoutesIgnored } from '@aws/workbench-core-authorization';
import { routesUsedByStaticAuthorization } from './dynamicRoutesIgnored';

export const dynamicRoutesMap: DynamicRoutesMap = {
  '/helloworld': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectType: 'helloworld',
          subjectId: 'helloworld'
        }
      }
    ]
  },
  '/parentResource/:parentId/resource/:resourceId': {
    PUT: [
      {
        action: 'UPDATE',
        subject: {
          subjectId: '${resourceId}',
          subjectType: 'sampleResource',
          parentId: '${parentId}'
        }
      }
    ]
  },
  '/listAllResources': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectId: '*',
          subjectType: 'sampleResource'
        }
      }
    ]
  },
  '/listResources/:parentId': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectId: '*',
          subjectType: 'sampleResource',
          parentId: '${parentId}'
        }
      }
    ]
  },
  '/createResource': {
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectId: '*',
          subjectType: 'sampleResource'
        }
      }
    ]
  },
  '/audit': {
    POST: [
      {
        action: 'CREATE',
        subject: {
          subjectId: '*',
          subjectType: 'auditEntry'
        }
      }
    ]
  },
  '/audit/is-audit-complete': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectId: '*',
          subjectType: 'auditEntry'
        }
      }
    ]
  },
  '/staticAuthorization/isAuthorizedOnRoute': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectId: '*',
          subjectType: 'staticRouteConfig'
        }
      }
    ]
  },
  '/staticAuthorization/isRouteIgnored': {
    GET: [
      {
        action: 'READ',
        subject: {
          subjectId: '*',
          subjectType: 'staticRouteIgnored'
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
  },
  ...routesUsedByStaticAuthorization
};
