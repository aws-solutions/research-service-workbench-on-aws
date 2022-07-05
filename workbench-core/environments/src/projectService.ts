/* eslint-disable security/detect-object-injection */

import { AwsService, buildDynamoDBPkSk } from '@amzn/workbench-core-base';
import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import Boom from '@hapi/boom';
import environmentResourceTypeToKey from './environmentResourceTypeToKey';

interface Project {
  pk: string;
  sk: string;
  id: string;
  resourceType: string;
  envMgmtRoleArn: string;
  externalId: string;
  accountHandlerRoleArn: string;
  accountId: string;
  awsAccountId: string;
  createdAt: string;
  createdBy: string;
  dependency: string;
  description: string;
  encryptionKeyArn: string;
  environmentInstanceFiles: string;
  indexId: string;
  name: string;
  owner: string;
  projectAdmins: string[];
  subnetId: string;
  updatedAt: string;
  updatedBy: string;
  vpcId: string;
}

export default class ProjectService {
  private _aws: AwsService;
  private _resourceType: string = 'project';

  public constructor(constants: { TABLE_NAME: string }) {
    const { TABLE_NAME } = constants;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: TABLE_NAME });
  }

  /**
   * Get project
   * projectID - Project Id of project to retrieve
   */
  public async getProject(projectId: string): Promise<Project> {
    const response = await this._aws.helpers.ddb
      .get(buildDynamoDBPkSk(projectId, environmentResourceTypeToKey.project))
      .execute();

    const item = (response as GetItemCommandOutput).Item;

    if (item === undefined) {
      throw Boom.notFound(`Could not find project ${projectId}`);
    } else {
      const project = item as unknown as Project;
      return Promise.resolve(project);
    }
  }

  public async getProjects(): Promise<{ data: Project[] }> {
    const queryParams = {
      key: { name: 'resourceType', value: this._resourceType },
      index: 'getResourceByUpdatedAt'
    };

    const projectsResponse = await this._aws.helpers.ddb.query(queryParams).execute();

    return Promise.resolve({ data: projectsResponse.Items as unknown as Project[] });
  }
}
