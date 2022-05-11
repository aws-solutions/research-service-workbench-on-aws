import {
  CreatePresignedNotebookInstanceUrlCommandInput,
  CreatePresignedNotebookInstanceUrlCommandOutput,
  CreatePresignedNotebookInstanceUrlCommand,
  SageMakerClient,
  SageMakerClientConfig
} from '@aws-sdk/client-sagemaker';

export default class Sagemaker {
  private _client: SageMakerClient;

  public constructor(config: SageMakerClientConfig) {
    this._client = new SageMakerClient(config);
  }

  public createPresignedNotebookInstanceUrl(
    params: CreatePresignedNotebookInstanceUrlCommandInput
  ): Promise<CreatePresignedNotebookInstanceUrlCommandOutput> {
    return this._client.send(new CreatePresignedNotebookInstanceUrlCommand(params));
  }
}
