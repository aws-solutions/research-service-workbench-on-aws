import useSWR from 'swr';
import { httpApiGet, httpApiPut, httpApiDelete } from './apiHelper';
import { EnvironmentItem, EnvironmentConnectResponse } from '../models/Environment';
import { EnvTypeItem } from '../components/EnvTypeCards';
import { EnvTypeConfigItem } from '../components/EnvTypeConfigCards';
const useEnvironments = () => {
  const { data, mutate } = useSWR('environments', httpApiGet, { refreshInterval: 5000 });

  let environments = (data && data.envs) || [];
  environments.forEach((item: EnvironmentItem) => {
    item.workspaceName = item.name;
    item.workspaceStatus = item.status;
    item.project = item.projectId;
    item.workspaceCost = 0;
  });
  return { environments, mutate };
};

const start = async (id: string): Promise<void> => {
  await httpApiPut(`environments/${id}/start`, {});
};

const stop = async (id: string): Promise<void> => {
  await httpApiPut(`environments/${id}/stop`, {});
};

const terminate = async (id: string): Promise<void> => {
  await httpApiDelete(`environments/${id}`, {});
};

const connect = async (id: string): Promise<EnvironmentConnectResponse> => {
  return await httpApiGet(`environments/${id}/connections`, {});
};
const envTypes: EnvTypeItem[] = [
  {
    id: '1',
    name: 'Item 1',
    description: '<li>This is the first item</li><li>other item</li>'
  },
  {
    id: '2',
    name: 'Item 2',
    description: 'This is the first item'
  },
  {
    id: '3',
    name: 'Item 3',
    description: 'This is the first item 2'
  },
  {
    id: '4',
    name: 'Item 4',
    description: 'This is the first item 4'
  },
  {
    id: '5',
    name: 'Item 5',
    description: 'This is the first item 6'
  },
  {
    id: '6',
    name: 'Item 1',
    description: 'This is the first item 66'
  },
  {
    id: '7',
    name: 'Item 2',
    description: 'This is the first item'
  },
  {
    id: '8',
    name: 'Item 3',
    description: 'This is the first item'
  },
  {
    id: '9',
    name: 'Item 9',
    description: 'This is the first item'
  },
  {
    id: '10',
    name: 'Item 10',
    description: 'This is the first item'
  },
  {
    id: '11',
    name: 'Item 1',
    description: 'This is the first item'
  },
  {
    id: '12',
    name: 'Item 2',
    description: 'This is the first item'
  },
  {
    id: '13',
    name: 'Item 3',
    description: 'This is the first item 2'
  },
  {
    id: '14',
    name: 'Item 4',
    description: 'This is the first item 4'
  },
  {
    id: '15',
    name: 'Item 5',
    description: 'This is the first item 6'
  },
  {
    id: '16',
    name: 'Item 1',
    description: 'This is the first item 66'
  },
  {
    id: '17',
    name: 'Item 2',
    description: 'This is the first item'
  },
  {
    id: '18',
    name: 'Item 3',
    description: 'This is the first item'
  },
  {
    id: '19',
    name: 'Item 9',
    description: 'This is the first item'
  },
  {
    id: '20',
    name: 'Item 10',
    description: 'This is the first item'
  },
  {
    id: '21',
    name: 'Item 1',
    description: 'This is the first item'
  },
  {
    id: '22',
    name: 'Item 2',
    description: 'This is the first item'
  },
  {
    id: '23',
    name: 'Item 3',
    description: 'This is the first item 2'
  },
  {
    id: '24',
    name: 'Item 4',
    description: 'This is the first item 4'
  },
  {
    id: '25',
    name: 'Item 5',
    description: 'This is the first item 6'
  },
  {
    id: '26',
    name: 'Item 1',
    description: 'This is the first item 66'
  },
  {
    id: '27',
    name: 'Item 2',
    description: 'This is the first item'
  },
  {
    id: '28',
    name: 'Item 3',
    description: 'This is the first item'
  },
  {
    id: '29',
    name: 'Item 9',
    description: 'This is the first item'
  },
  {
    id: '30',
    name: 'Item 10',
    description: 'This is the first item'
  }
];
const envTypeConfigs: EnvTypeConfigItem[] = [
  {
    id: '1',
    name: 'config1',
    estimatedCost: '3456',
    instanceType: 'type1'
  },
  {
    id: '2',
    name: 'config2',
    estimatedCost: '3456',
    instanceType: 'type1'
  },
  {
    id: '3',
    name: 'config3',
    estimatedCost: '3456',
    instanceType: 'type1'
  },
  {
    id: '4',
    name: 'config4',
    estimatedCost: '3456',
    instanceType: 'type1'
  },
  {
    id: '5',
    name: 'config5',
    estimatedCost: '3456',
    instanceType: 'type1'
  }
];
export { useEnvironments, start, stop, terminate, connect, envTypes, envTypeConfigs };
