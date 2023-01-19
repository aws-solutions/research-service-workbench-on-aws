/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DynamicRoutesMap, RoutesIgnored } from '@aws/workbench-core-authorization';

export const dynamicRoutesMap: DynamicRoutesMap = {
  '/helloworld': {
    GET: [
      {
        action: 'CREATE',
        subject: {
          subjectType: 'Example',
          subjectId: '*'
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
