/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { RoutesIgnored, RoutesMap } from '@aws/workbench-core-authorization';
/**
 * This config file is used for testing of static authorization service
 */
export const sampleStaticRoutesMap: RoutesMap = {
  '/staticSampleRoute': {
    GET: [
      {
        action: 'READ',
        subject: 'staticSampleRoutes'
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: 'staticSampleRoutes'
      }
    ],
    PUT: [
      {
        action: 'UPDATE',
        subject: 'staticSampleRoutes'
      }
    ],
    DELETE: [
      {
        action: 'DELETE',
        subject: 'staticSampleRoutes'
      }
    ]
  },
  [`/staticSampleRoute/[A-Za-z0-9_]+`]: {
    GET: [
      {
        action: 'READ',
        subject: 'staticSampleRouteParam'
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: 'staticSampleRouteParam'
      }
    ]
  }
};

export const sampleStaticRouteIgnored: RoutesIgnored = {
  '/sampleStaticIgnoreRoute': {
    POST: true
  }
};
