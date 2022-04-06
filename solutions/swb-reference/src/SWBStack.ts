/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-new */
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Runtime, Function, Code } from 'aws-cdk-lib/aws-lambda';
import { Rule, Schedule, EventBus } from 'aws-cdk-lib/aws-events';
import { App, CfnOutput, Stack } from 'aws-cdk-lib';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { join } from 'path';
import Workflow from './environment/workflow';

export class SWBStack extends Stack {
  public constructor(app: App, id: string) {
    super(app, id);
    const apiLambda: Function = this._createAPILambda();
    this._createRestApi(apiLambda);

    this._createStatusHandlerLambda();
    this._createAccountHandlerLambda();

    const workflow = new Workflow(this);
    workflow.createSSMDocuments();

    this._createEventBridgeResources();
  }

  private _createEventBridgeResources(): void {
    const bus = new EventBus(this, 'bus', {
      eventBusName: this.stackName
    });

    new CfnOutput(this, 'EventBus', {
      exportName: 'eventBusArn',
      value: bus.eventBusArn
    });
  }

  private _createStatusHandlerLambda(): void {
    new Function(this, 'statusHandlerLambda', {
      code: Code.fromAsset(join(__dirname, '../build/statusHandler')),
      handler: 'statusHandlerLambda.handler',
      runtime: Runtime.NODEJS_14_X
    });
  }

  private _createAccountHandlerLambda(): void {
    const lambda = new Function(this, 'accountHandlerLambda', {
      code: Code.fromAsset(join(__dirname, '../build/accountHandler')),
      handler: 'accountHandlerLambda.handler',
      runtime: Runtime.NODEJS_14_X
    });

    // Run lambda function every 5 minutes
    const eventRule = new Rule(this, 'scheduleRule', {
      schedule: Schedule.cron({ minute: '5' })
    });
    eventRule.addTarget(new targets.LambdaFunction(lambda));
  }

  private _createAPILambda(): Function {
    const apiLambda = new Function(this, 'apiLambda', {
      code: Code.fromAsset(join(__dirname, '../build/backendAPI')),
      handler: 'backendAPILambda.handler',
      runtime: Runtime.NODEJS_14_X
    });

    new CfnOutput(this, 'apiLambdaRole', {
      exportName: 'apiLambdaRoleArn',
      value: apiLambda.role!.roleArn
    });

    return apiLambda;
  }

  // API Gateway
  private _createRestApi(apiLambda: Function): void {
    const API: RestApi = new RestApi(this, `API-Gateway API`, {
      restApiName: 'Backend API Name',
      description: 'Backend API',
      deployOptions: {
        stageName: 'dev'
      },
      defaultCorsPreflightOptions: {
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000']
      }
    });
    // eslint-disable-next-line no-new
    new CfnOutput(this, 'apiUrl', { value: API.url });

    API.root.addProxy({
      defaultIntegration: new LambdaIntegration(apiLambda)
    });
  }
}
