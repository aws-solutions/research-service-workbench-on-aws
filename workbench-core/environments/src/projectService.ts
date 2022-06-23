/* eslint-disable security/detect-object-injection */

import { AwsService } from '@amzn/workbench-core-base';
import { GetItemCommandOutput, QueryCommandOutput } from '@aws-sdk/client-dynamodb';
import Boom from '@hapi/boom';
//import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';

interface ProjectItemType {
  pk: string;
  sk: string;
  id: string;
  resourceType: string;
  envMgmtRoleArn: string;
  externalId: string;
}

export default class ProjectService {
  private _aws: AwsService;

  public constructor(constants: { TABLE_NAME: string }) {
    const { TABLE_NAME } = constants;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: TABLE_NAME });
  }

  /**
   * Get environment
   * projectID - Project Id of project to retrieve
   */
  public async getProject(projectID: string): Promise<ProjectItemType> {
    const getParams = {
      pk: 'PROJ#' + projectID,
      sk: 'PROJ#' + projectID
    };

    const project = await this._aws.helpers.ddb.get(getParams).execute();

    const item = (project as GetItemCommandOutput).Item;

    if (item === undefined) {
      throw Boom.notFound(`Could not find project ${getParams.pk}`);
    } else {
      const projectItem = item as unknown as ProjectItemType;
      return Promise.resolve(projectItem);
    }
  }

  public async getProjects(): Promise<QueryCommandOutput> {
    const queryParams = {
      key: { name: 'resourceType', value: 'project' },
      index: 'getResourceByUpdatedAt'
    };

    const allProjects = await this._aws.helpers.ddb.query(queryParams).execute();

    if (allProjects === undefined) {
      throw Boom.notFound(`Could not find projects`);
    } else {
      return Promise.resolve(allProjects);
    }
  }
}
