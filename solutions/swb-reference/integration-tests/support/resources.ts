import ClientSession from './clientSession';
import Environments from './resources/environments/environments';

function getResources(clientSession: ClientSession): Resources {
  return {
    environments: new Environments(clientSession)
  };
}

interface Resources {
  environments: Environments;
}

export { getResources, Resources };
