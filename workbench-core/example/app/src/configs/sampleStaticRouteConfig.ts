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
