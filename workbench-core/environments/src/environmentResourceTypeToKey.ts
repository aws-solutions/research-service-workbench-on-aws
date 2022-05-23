const envResourceTypeToKey: {
  environment: string;
  project: string;
  envType: string;
  envTypeConfig: string;
  dataset: string;
  instance: string;
} = {
  environment: 'ENV',
  project: 'PROJ',
  envType: 'ET',
  envTypeConfig: 'ETC',
  dataset: 'DS',
  instance: 'INID'
};

export default envResourceTypeToKey;
