import { Button } from '@awsui/components-react';
import React from 'react';

export const allItems: ReadonlyArray<any> = [
  {
    workspace: 'workspace1',
    workspaceStatus: 'PENDING',
    updatedAt: '5/3/2022',
    project: 'TestProject',
    owner: 'Test User',
    connections: 0,
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
    workspace: 'workspace2',
    workspaceStatus: 'FAILED',
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
    workspaceStatus: 'AVAILABLE',
    updatedAt: '5/2/2022',
    project: 'MyProject',
    owner: 'Sample User',
    connections: 3,
    workspaceActions: (
      <>
        <Button href="#">Connect</Button> <Button href="#">Stop</Button> <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace4',
    workspaceStatus: 'AVAILABLE',
    updatedAt: '5/2/2022',
    project: 'SampleProject',
    owner: 'Sample User',
    connections: 8,
    workspaceActions: (
      <>
        <Button href="#">Connect</Button> <Button href="#">Stop</Button> <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace5',
    workspaceStatus: 'STOPPED',
    updatedAt: '4/29/2022',
    project: 'MVPProject',
    owner: 'Sample User',
    connections: 45,
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
    workspaceStatus: 'STOPPED',
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
    workspaceStatus: 'STOPPED',
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
    workspaceStatus: 'STOPPED',
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
    workspaceStatus: 'TERMINATED',
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
    workspaceStatus: 'PENDING',
    updatedAt: '5/3/2022',
    project: 'TestProject',
    owner: 'Test User',
    connections: 0,
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
    workspace: 'workspace11',
    workspaceStatus: 'FAILED',
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
    workspaceStatus: 'STARTING',
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
    workspaceStatus: 'STARTING',
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
    workspaceStatus: 'STOPPED',
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
    workspaceStatus: 'STOPPED',
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
    workspaceStatus: 'STOPPED',
    updatedAt: '4/20/2022',
    project: 'CAProject',
    owner: 'Intern User',
    connections: 30,
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
    workspaceStatus: 'STOPPED',
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
    workspaceStatus: 'TERMINATED',
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
    workspaceStatus: 'PENDING',
    updatedAt: '5/3/2022',
    project: 'TestProject',
    owner: 'Test User',
    connections: 0,
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
    workspace: 'workspace20',
    workspaceStatus: 'FAILED',
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
    workspaceStatus: 'AVAILABLE',
    updatedAt: '5/2/2022',
    project: 'MyProject',
    owner: 'Sample User',
    connections: 3,
    workspaceActions: (
      <>
        <Button href="#">Connect</Button> <Button href="#">Stop</Button> <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace22',
    workspaceStatus: 'AVAILABLE',
    updatedAt: '5/2/2022',
    project: 'SampleProject',
    owner: 'Sample User',
    connections: 8,
    workspaceActions: (
      <>
        <Button href="#">Connect</Button> <Button href="#">Stop</Button> <Button href="#">Terminate</Button>
      </>
    )
  },
  {
    workspace: 'workspace23',
    workspaceStatus: 'STOPPED',
    updatedAt: '4/29/2022',
    project: 'MVPProject',
    owner: 'My User',
    connections: 42,
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
    workspaceStatus: 'STOPPED',
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
    workspaceStatus: 'STOPPED',
    updatedAt: '4/20/2022',
    project: 'CAProject',
    owner: 'Intern User',
    connections: 34,
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
    workspaceStatus: 'STOPPED',
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
    workspaceStatus: 'TERMINATED',
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
