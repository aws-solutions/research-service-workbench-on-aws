interface Setting {
  runId: string;
  rootUserNameParamStorePath: string;
  rootPasswordParamStorePath: string;
  ExampleS3BucketExampleS3BucketDatasetsArnOutput393A6D8B: string;
  AwsRegion: string;
  ExampleCognitoUserPoolClientId: string;
  ExampleEncryptionKeyEncryptionKeyOutput172B0370: string;
  ExampleS3BucketAccessLogsNameOutput: string;
  ExampleRestApiEndpoint9C6D55BB: string;
  ExampleAPIEndpoint: string;
  ExampleCognitoDomainName: string;
  ExampleDynamoDBTableOutput: string;
  ExampleCognitoUserPoolId: string;
  ExampleLambdaRoleOutput: string;
  mainAccountId: string;
}
export declare type SettingKey = keyof Setting;
/**
 * All settings used during the tests are stored here. The main advantage of having to use get/set methods
 * when accessing settings values is so that we can print an informative message when keys are missing.
 */
export default class Settings {
  private _content;
  constructor(yamlObject: Setting);
  get entries(): Setting;
  set(key: SettingKey, value: string): void;
  get(key: SettingKey): string;
  optional(key: SettingKey, defaultValue?: string): string | undefined;
}
export {};
//# sourceMappingURL=settings.d.ts.map
