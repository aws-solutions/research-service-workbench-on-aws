const envResourceTypeToKey: {
  environment: string;
  project: string;
  envType: string;
  envTypeConfig: string;
  dataset: string;
  endpoint: string;
  instance: string;
  awsAccount: string;
  account: string;
} = {
  environment: 'ENV',
  project: 'PROJ',
  envType: 'ET',
  envTypeConfig: 'ETC',
  dataset: 'DATASET',
  endpoint: 'ENDPOINT',
  instance: 'INID',
  awsAccount: 'AWSACC',
  account: 'ACC'
};

export default envResourceTypeToKey;
