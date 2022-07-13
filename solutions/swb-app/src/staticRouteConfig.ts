import { RoutesIgnored, RoutesMap } from '@amzn/workbench-core-authorization';

export const routesMap: RoutesMap = {
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
  '/environments/sampleEnvironment': {
    DELETE: [
      {
        action: 'DELETE',
        subject: 'sampleEnvironment'
      }
    ],
    GET: [
      {
        action: 'READ',
        subject: 'sampleEnvironment'
      }
    ]
  },
  '/environments/sampleEnvironment/start': {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'sampleEnvironment'
      }
    ]
  },
  '/environments/sampleEnvironment/stop': {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'sampleEnvironment'
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
  '/users/sampleUser/roles/sampleRole': {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'sampleRole-SampleUser'
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
  },

  // TODO: Ignoring these routes right now, but eventually will need to send token in Authorization header and validate
  '/environments': {
    GET: true,
    POST: true
  },
  '/environments/': {
    GET: true,
    DELETE: true
  },
  '/users': {
    // GET: true,
    POST: true
  },
  '/roles': {
    POST: true
  },
  '/users/*/roles/Researcher': {
    PUT: true
  },
  '/aws-accounts': {
    POST: true
  }
};
