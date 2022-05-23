import {
  SageMakerClient,
  StartNotebookInstanceCommand,
  StartNotebookInstanceCommandInput,
  StartNotebookInstanceCommandOutput,
  StopNotebookInstanceCommand,
  StopNotebookInstanceCommandInput,
  StopNotebookInstanceCommandOutput,
  SageMakerClientConfig
} from '@aws-sdk/client-sagemaker';

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sagemaker/index.html

export default class SageMaker {
  private _client: SageMakerClient;
  public constructor(config: SageMakerClientConfig) {
    this._client = new SageMakerClient(config);
  }

  public async startNotebookInstance(
    params: StartNotebookInstanceCommandInput
  ): Promise<StartNotebookInstanceCommandOutput> {
    return this._client.send(new StartNotebookInstanceCommand(params));
  }

  public async stopNotebookInstance(
    params: StopNotebookInstanceCommandInput
  ): Promise<StopNotebookInstanceCommandOutput> {
    return this._client.send(new StopNotebookInstanceCommand(params));
  }
}
