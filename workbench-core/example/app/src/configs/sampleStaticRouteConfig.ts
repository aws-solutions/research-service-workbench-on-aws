import { RoutesMap } from '@aws/workbench-core-authorization';

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
    ]
  }
};
