import { Button } from '@awsui/components-react';

export const allItems = [
  {
    workspace: 'workspace1',
    workspaceStatus: 'Pending',
    updatedAt: '5/3/2022',
    project: 'TestProject',
    owner: 'Test User',
    connections: 0,
    workspaceActions: (
      <>
        <Button href="#" disabled>
          Connect
        </Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#" disabled>
          Terminate
        </Button>
      </>
    )
  },
  {
    workspace: 'workspace2',
    workspaceStatus: 'Errored',
    updatedAt: '5/3/2022',
    project: 'SampleProject',
    owner: 'Test User',
    connections: 0,
    workspaceActions: (
      <>
        <Button href="#" disabled>
          Connect
        </Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace3',
    workspaceStatus: 'Available',
    updatedAt: '5/2/2022',
    project: 'MyProject',
    owner: 'Sample User',
    connections: 3,
    workspaceActions: (
      <>
        <Button href="#" disabled>
          Connect
        </Button>{' '}
        <Button href="#">Stop</Button> <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace4',
    workspaceStatus: 'Available',
    updatedAt: '5/2/2022',
    project: 'SampleProject',
    owner: 'Sample User',
    connections: 8,
    workspaceActions: (
      <>
        <Button href="#" disabled>
          Connect
        </Button>{' '}
        <Button href="#">Stop</Button> <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace5',
    workspaceStatus: 'Stopped',
    updatedAt: '4/29/2022',
    project: 'MVPProject',
    owner: 'Sample User',
    connections: 41,
    workspaceActions: (
      <>
        <Button href="#">Connect</Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace6',
    workspaceStatus: 'Stopped',
    updatedAt: '4/29/2022',
    project: 'TestProject',
    owner: 'Test User',
    connections: 7,
    workspaceActions: (
      <>
        <Button href="#">Connect</Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace7',
    workspaceStatus: 'Stopped',
    updatedAt: '4/20/2022',
    project: 'CAProject',
    owner: 'Intern User',
    connections: 33,
    workspaceActions: (
      <>
        <Button href="#">Connect</Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace8',
    workspaceStatus: 'Stopped',
    updatedAt: '4/18/2022',
    project: 'BRProject',
    owner: 'Senior User',
    connections: 1,
    workspaceActions: (
      <>
        <Button href="#">Connect</Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace9',
    workspaceStatus: 'Terminated',
    updatedAt: '4/17/2022',
    project: 'NYCProject',
    owner: 'Admin User',
    connections: 0,
    workspaceActions: (
      <>
        <Button href="#" disabled>
          Connect
        </Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#" disabled>
          Terminate
        </Button>
      </>
    )
  },
  {
    workspace: 'workspace10',
    workspaceStatus: 'Pending',
    updatedAt: '5/3/2022',
    project: 'TestProject',
    owner: 'Test User',
    connections: 0,
    workspaceActions: (
      <>
        <Button href="#" disabled>
          Connect
        </Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#" disabled>
          Terminate
        </Button>
      </>
    )
  },
  {
    workspace: 'workspace11',
    workspaceStatus: 'Errored',
    updatedAt: '5/3/2022',
    project: 'SampleProject',
    owner: 'Test User',
    connections: 0,
    workspaceActions: (
      <>
        <Button href="#" disabled>
          Connect
        </Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace12',
    workspaceStatus: 'Available',
    updatedAt: '5/2/2022',
    project: 'MyProject',
    owner: 'Sample User',
    connections: 3,
    workspaceActions: (
      <>
        <Button href="#" disabled>
          Connect
        </Button>{' '}
        <Button href="#">Stop</Button> <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace13',
    workspaceStatus: 'Available',
    updatedAt: '5/2/2022',
    project: 'SampleProject',
    owner: 'Sample User',
    connections: 8,
    workspaceActions: (
      <>
        <Button href="#" disabled>
          Connect
        </Button>{' '}
        <Button href="#">Stop</Button> <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace14',
    workspaceStatus: 'Stopped',
    updatedAt: '4/29/2022',
    project: 'MVPProject',
    owner: 'Sample User',
    connections: 41,
    workspaceActions: (
      <>
        <Button href="#">Connect</Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace15',
    workspaceStatus: 'Stopped',
    updatedAt: '4/29/2022',
    project: 'TestProject',
    owner: 'Test User',
    connections: 7,
    workspaceActions: (
      <>
        <Button href="#">Connect</Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace16',
    workspaceStatus: 'Stopped',
    updatedAt: '4/20/2022',
    project: 'CAProject',
    owner: 'Intern User',
    connections: 33,
    workspaceActions: (
      <>
        <Button href="#">Connect</Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace17',
    workspaceStatus: 'Stopped',
    updatedAt: '4/18/2022',
    project: 'BRProject',
    owner: 'Senior User',
    connections: 1,
    workspaceActions: (
      <>
        <Button href="#">Connect</Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace18',
    workspaceStatus: 'Terminated',
    updatedAt: '4/17/2022',
    project: 'NYCProject',
    owner: 'Admin User',
    connections: 0,
    workspaceActions: (
      <>
        <Button href="#" disabled>
          Connect
        </Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#" disabled>
          Terminate
        </Button>
      </>
    )
  },
  {
    workspace: 'workspace19',
    workspaceStatus: 'Pending',
    updatedAt: '5/3/2022',
    project: 'TestProject',
    owner: 'Test User',
    connections: 0,
    workspaceActions: (
      <>
        <Button href="#" disabled>
          Connect
        </Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#" disabled>
          Terminate
        </Button>
      </>
    )
  },
  {
    workspace: 'workspace20',
    workspaceStatus: 'Errored',
    updatedAt: '5/3/2022',
    project: 'SampleProject',
    owner: 'Test User',
    connections: 0,
    workspaceActions: (
      <>
        <Button href="#" disabled>
          Connect
        </Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace21',
    workspaceStatus: 'Available',
    updatedAt: '5/2/2022',
    project: 'MyProject',
    owner: 'Sample User',
    connections: 3,
    workspaceActions: (
      <>
        <Button href="#" disabled>
          Connect
        </Button>{' '}
        <Button href="#">Stop</Button> <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace22',
    workspaceStatus: 'Available',
    updatedAt: '5/2/2022',
    project: 'SampleProject',
    owner: 'Sample User',
    connections: 8,
    workspaceActions: (
      <>
        <Button href="#" disabled>
          Connect
        </Button>{' '}
        <Button href="#">Stop</Button> <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace23',
    workspaceStatus: 'Stopped',
    updatedAt: '4/29/2022',
    project: 'MVPProject',
    owner: 'Sample User',
    connections: 41,
    workspaceActions: (
      <>
        <Button href="#">Connect</Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace24',
    workspaceStatus: 'Stopped',
    updatedAt: '4/29/2022',
    project: 'TestProject',
    owner: 'Test User',
    connections: 7,
    workspaceActions: (
      <>
        <Button href="#">Connect</Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace25',
    workspaceStatus: 'Stopped',
    updatedAt: '4/20/2022',
    project: 'CAProject',
    owner: 'Intern User',
    connections: 33,
    workspaceActions: (
      <>
        <Button href="#">Connect</Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace26',
    workspaceStatus: 'Stopped',
    updatedAt: '4/18/2022',
    project: 'BRProject',
    owner: 'Senior User',
    connections: 1,
    workspaceActions: (
      <>
        <Button href="#">Connect</Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace27',
    workspaceStatus: 'Terminated',
    updatedAt: '4/17/2022',
    project: 'NYCProject',
    owner: 'Admin User',
    connections: 0,
    workspaceActions: (
      <>
        <Button href="#" disabled>
          Connect
        </Button>{' '}
        <Button href="#" disabled>
          Stop
        </Button>{' '}
        <Button href="#" disabled>
          Terminate
        </Button>
      </>
    )
  }
];
