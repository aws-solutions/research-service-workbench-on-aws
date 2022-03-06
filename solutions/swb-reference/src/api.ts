import {
  IResource,
  LambdaIntegration,
  MockIntegration,
  PassthroughBehavior,
  RestApi
} from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { App, Stack } from 'aws-cdk-lib';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'path';

export class ApiLambdaCrudDynamoDBStack extends Stack {
  public constructor(app: App, id: string) {
    super(app, id);
    const dynamoTable = Table.fromTableArn(
      this,
      'dbTable',
      'arn:aws:dynamodb:us-west-2:924333530956:table/POC-EnvManagement'
    );

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        //minify: true,
        externalModules: ['aws-sdk']
      },
      depsLockFilePath: join(__dirname, '..', 'lambdas', 'package-lock.json'),
      environment: {
        PRIMARY_KEY: 'ProvisionedProductName',
        TABLE_NAME: dynamoTable.tableName
      },
      runtime: Runtime.NODEJS_14_X
    };

    // Create a Lambda function for each of the CRUD operations
    const apiLambda = new NodejsFunction(this, 'apiFunction', {
      entry: join(__dirname, '..', 'src', 'all-api.ts'),
      ...nodeJsFunctionProps
    });

    // Grant the Lambda function read access to the DynamoDB table
    dynamoTable.grantReadWriteData(apiLambda);

    // Grant access for lambda to assume role
    // const lambdaRole = new Role(this, 'apiRole', {
    //     roleName: 'apiRole',
    //     assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    // });

    // const adminRole = Role.fromRoleArn(this, 'adminrole', 'arn:aws:iam::924333530956:role/MASC', {});

    // Integrate the Lambda functions with the API Gateway resource
    const getAllIntegration = new LambdaIntegration(apiLambda, { proxy: true });

    // Create an API Gateway resource for each of the CRUD operations
    const api = new RestApi(this, 'proxy');
    // Create Usage Plan and add it to the API
    const apiKey = api.addApiKey('dev');
    const plan = api.addUsagePlan('usagePlan', { apiStages: [{ api: api, stage: api.deploymentStage }] });
    plan.addApiKey(apiKey);

    const rootProxy = api.root.addProxy({
      defaultIntegration: getAllIntegration,
      defaultMethodOptions: { apiKeyRequired: true }
    });

    addCorsOptions(rootProxy);
  }
}

export function addCorsOptions(apiResource: IResource): void {
  apiResource.addMethod(
    'OPTIONS',
    new MockIntegration({
      integrationResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers':
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
            'method.response.header.Access-Control-Allow-Origin': "'*'",
            'method.response.header.Access-Control-Allow-Credentials': "'false'",
            'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'"
          }
        }
      ],
      passthroughBehavior: PassthroughBehavior.NEVER,
      requestTemplates: {
        'application/json': '{"statusCode": 200}'
      }
    }),
    {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Methods': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
            'method.response.header.Access-Control-Allow-Origin': true
          }
        }
      ]
    }
  );
}
