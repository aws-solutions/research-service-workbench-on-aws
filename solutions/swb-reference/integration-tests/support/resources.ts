import ClientSession from './clientSession';

function getResources(clientSession: ClientSession): Resources {
  return {
    environments: {}
  };
}

interface Resources {
  // eslint-disable-next-line
  environments: any;
}

export { getResources, Resources };
