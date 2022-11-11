/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { RoutesIgnored, RoutesMap } from '@aws/workbench-core-authorization';
import { uuidWithLowercasePrefixRegExp } from '@aws/workbench-core-base';
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
  '/datasets/share': {
    POST: [
      {
        action: 'CREATE',
        subject: 'Endpoint'
      }
    ]
  },
  [`/datasets/${uuidWithLowercasePrefixRegExp(dataSetPrefix)}`]: {
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
  [`/datasets/${uuidWithLowercasePrefixRegExp(dataSetPrefix)}/share/${uuidWithLowercasePrefixRegExp(
    endPointPrefix
  )}`]: {
    DELETE: [
      {
        action: 'DELETE',
        subject: 'Endpoint'
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
