/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable security/detect-object-injection */

import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { AuthenticatedUser } from '@aws/workbench-core-authorization';
import {
  AwsService,
  buildDynamoDBPkSk,
  QueryParams,
  resourceTypeToKey,
  uuidWithLowercasePrefix,
  DEFAULT_API_PAGE_SIZE,
  addPaginationToken,
  getPaginationToken
} from '@aws/workbench-core-base';
import Boom from '@hapi/boom';
import _ from 'lodash';
import CostCenter from '../models/costCenter';
import CreateProjectRequest from '../models/createProjectRequest';
import ListProjectsRequest from '../models/listProjectsRequest';
import ListProjectsResponse from '../models/listProjectsResponse';
import Project from '../models/project';
import CostCenterService from './costCenterService';

export default class ProjectService {
  private _aws: AwsService;
  private _resourceType: string = 'project';
  private _tableName: string;
  // TODO implement after dynamic AuthZ
  // private _dynamicAuthorizationService: DynamicAuthorizationService;

  public constructor(constants: { TABLE_NAME: string }) {
    const { TABLE_NAME } = constants;
    this._tableName = TABLE_NAME;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: TABLE_NAME });
    // TODO implement after dynamic AuthZ
    // this._dynamicAuthorizationService = new DynamicAuthorizationService();
  }

  /**
   * Get project
   * @param projectId - Project Id of project to retrieve
   *
   * @returns Project entry in DDB
   */
  public async getProject(projectId: string): Promise<Project> {
    const response = await this._aws.helpers.ddb
      .get(buildDynamoDBPkSk(projectId, resourceTypeToKey.project))
      .execute();

    const item = (response as GetItemCommandOutput).Item;

    if (item === undefined) {
      throw Boom.notFound(`Could not find project ${projectId}`);
    } else {
      const project = item as unknown as Project;
      return Promise.resolve(project);
    }
  }

  // TODO--delete after dynamic Authz
  private _mockGetUserGroups(): string[] {
    return [];
  }

  /**
   * List projects
   *
   * @param request - the optional fields to list projects
   * @param user - authenticated user listing the projects
   * @returns Project entries in DDB
   */
  // TODO--add filter support
  public async listProjects(request: ListProjectsRequest): Promise<ListProjectsResponse> {
    const pageSize = request.pageSize;
    let paginationToken = request.paginationToken;
    // Get user groups--TODO implement after dynamic AuthZ
    // const userGroupsForCurrentUser: string[] = await this._dynamicAuthorizationService.getUserGroups(request.user.id);
    const userGroupsForCurrentUser: string[] = this._mockGetUserGroups(); // mock so the tests work

    // If no group membership, return
    if (_.isEmpty(userGroupsForCurrentUser)) {
      return { data: [], paginationToken: undefined };
    }

    // If IT Admin, return all with pagination
    if (userGroupsForCurrentUser.length === 1) {
      if (userGroupsForCurrentUser[0] === 'ITAdmin') {
        let queryParams: QueryParams = {
          key: { name: 'resourceType', value: this._resourceType },
          index: 'getResourceByCreatedAt',
          limit: pageSize && pageSize >= 0 ? pageSize : DEFAULT_API_PAGE_SIZE
        };

        queryParams = addPaginationToken(paginationToken, queryParams);

        const projectsResponse = await this._aws.helpers.ddb.query(queryParams).execute();

        paginationToken = getPaginationToken(projectsResponse);

        return {
          data: projectsResponse.Items as unknown as Project[],
          paginationToken: paginationToken
        };
      }

      // If member of 1 group, get project item
      const projectId = userGroupsForCurrentUser[0].split('#')[0];
      const project = await this.getProject(projectId);
      return { data: [project], paginationToken: undefined };
    }

    // Else, member of more than 1 group, query for project items with pagination
    // welcome to party town
    const projectIds: string[] = userGroupsForCurrentUser.map(
      (projectGroup: string) => projectGroup.split('#')[0]
    );

    // i = 0
    let filterExpression = 'id = :proj1';
    const expressionAttributeValues: { [key: string]: string } = { ':proj1': projectIds[0] };
    for (let i = 1; i < projectIds.length; i++) {
      // build filter string "id = :proj1 OR id = :proj2 OR ... OR id = projN+1"
      filterExpression = filterExpression + ` OR id = :proj${i + 1}`;
      // build expressionAttributeValues object {":proj1": "projectId1", ..., ":projN+1": "projectIdN"}
      expressionAttributeValues[`:proj${i + 1}`] = projectIds[i];
    }

    const pageSizeLimit = pageSize && pageSize >= 0 ? pageSize : DEFAULT_API_PAGE_SIZE;

    // TODO--extend to other GSIs after filtering is added
    let queryParams: QueryParams = {
      key: { name: 'resourceType', value: this._resourceType },
      index: 'getResourceByCreatedAt',
      limit: pageSizeLimit,
      filter: filterExpression,
      values: expressionAttributeValues
    };

    let projects: Project[] = [];

    let returnedCount = 0;
    while (returnedCount < pageSizeLimit && returnedCount < projectIds.length) {
      queryParams = addPaginationToken(paginationToken, queryParams);

      const projectsResponse = await this._aws.helpers.ddb.query(queryParams).execute();

      returnedCount += projectsResponse.Count!;

      // nothing else to get from DDB
      if (projectsResponse.LastEvaluatedKey === undefined) {
        projects = projects.concat(projectsResponse.Items as unknown as Project[]);
        paginationToken = undefined;
      }

      // too little--while loop continues
      else if (returnedCount < pageSizeLimit) {
        projects = projects.concat(projectsResponse.Items as unknown as Project[]);
        paginationToken = getPaginationToken(projectsResponse);
      }

      // juuuust the right amount--getPaginationToken from response and exit loop
      else if (returnedCount === pageSizeLimit) {
        paginationToken = getPaginationToken(projectsResponse);
        projects = projects.concat(projectsResponse.Items as unknown as Project[]);
      }

      // too much--take enough to fill and manually get pagination token from reponse and exit loop
      else if (returnedCount > pageSizeLimit) {
        const leftoverAmount = returnedCount - pageSizeLimit;
        const totalProjectsFromResponse = projectsResponse.Items as unknown as Project[];
        projects = projects.concat(totalProjectsFromResponse.slice(0, -leftoverAmount));
        const manualLastEvaluatedItem =
          projectsResponse.Items![totalProjectsFromResponse.length - (leftoverAmount + 1)]; // this will be the whole entry
        // If we query on GSI, then the LastEvaluatedKey will be the compose of GSI partition key, GSI sort key, primary partition key and primary sort key.
        // TODO--extend to other GSIs after filtering is added
        const manualLastEvaluatedKey = {
          pk: manualLastEvaluatedItem.pk,
          sk: manualLastEvaluatedItem.sk,
          resourceType: manualLastEvaluatedItem.resourceType,
          createdAt: manualLastEvaluatedItem.createdAt
        };
        paginationToken = Buffer.from(JSON.stringify(manualLastEvaluatedKey)).toString('base64');
      }
      if (paginationToken === undefined) {
        break;
      }
    }

    return {
      data: projects,
      paginationToken: paginationToken
    };
  }

  /**
   * Check whether a CostCenter have any projects associated with it
   * @param costCenterId - id of CostCenter we want to check
   * @returns Whether a CostCenter have any projects associated with it
   */
  public async doesCostCenterHaveProjects(costCenterId: string): Promise<boolean> {
    const queryParams: QueryParams = {
      index: 'getResourceByDependency',
      key: { name: 'resourceType', value: 'project' },
      sortKey: 'dependency',
      eq: { S: costCenterId },
      limit: 1
    };

    const associatedProjResponse = await this._aws.helpers.ddb.getPaginatedItems(queryParams);
    return associatedProjResponse.data.length > 0;
  }

  /**
   * Creates a new project
   *
   * @param params - the required fields to create a new project
   * @param user - authenticated user creating the project
   * @returns Project object of new project
   */
  public async createProject(params: CreateProjectRequest, user: AuthenticatedUser): Promise<Project> {
    // Verify caller is an IT Admin--TODO implement after dynamic AuthZ
    // const userGroupsForCurrentUser: string[] = await this._dynamicAuthorizationService.getUserGroups(user.id);
    // if(userGroupsForCurrentUser.length !== 1 || userGroupsForCurrentUser[0] !== 'ITAdmin') {
    //   throw Boom.forbidden('Only IT Admins are allowed to create new Projects.');
    // }

    // Verify project name is unique and cost center exists
    const resultsFromValidityChecks = await Promise.all([
      this._isProjectNameInUse(params.name),
      this._getCostCenter(params.costCenterId)
    ]);
    const costCenter: CostCenter = resultsFromValidityChecks[1];

    // Generate Project ID
    const projectId = uuidWithLowercasePrefix(resourceTypeToKey.project);

    // Create ProjectAdmin and Researcher groups--TODO implement after dynamic AuthZ
    // const createProjectAdminGroupResponse = this._dynamicAuthorizationService.createGroup(user, {
    //   groupId: `${projId}#PA`,
    //   description: `Project Admin group for ${projId}`
    // });
    // const createResearcherGroupResponse = this._dynamicAuthorizationService.createGroup(user, {
    //   groupId: `${projId}#Researcher`,
    //   description: `Researcher group for ${projId}`
    // });
    // if (!createProjectAdminGroupResponse.created || !createResearcherGroupResponse.created) {
    //   throw Boom.badImplementation(
    //     'Failed to create Project Admin group or Researcher group with dynamic authorization service.'
    //   );
    // }

    // Create Permissions for the groups--TODO implement after dynamic AuthZ
    // const identityPermissions: IdentityPermission[] = this._createIdentityPermissionsForProject(projectId);
    // const createIdentityPermissionsResponse = this._dynamicAuthorizationService.createIdentityPermissions(
    //   user,
    //   identityPermissions
    // );
    // if (!createIdentityPermissionsResponse.created) {
    //   throw Boom.badImplementation(
    //     'Failed to create batch identity permissions for project with dyamic authorization service.'
    //   );
    // }

    // Create Proj in DDB
    const currentTime = new Date(Date.now()).toISOString();

    const newProject: Project = {
      id: projectId,
      createdAt: currentTime,
      costCenterId: params.costCenterId,
      description: params.description,
      name: params.name,
      updatedAt: currentTime,
      status: 'AVAILABLE',
      // Acc Metadata (get from cost center)
      subnetId: costCenter.subnetId,
      vpcId: costCenter.vpcId,
      envMgmtRoleArn: costCenter.envMgmtRoleArn,
      externalId: costCenter.externalId,
      encryptionKeyArn: costCenter.encryptionKeyArn,
      environmentInstanceFiles: costCenter.environmentInstanceFiles,
      hostingAccountHandlerRoleArn: costCenter.hostingAccountHandlerRoleArn,
      awsAccountId: costCenter.awsAccountId,
      accountId: costCenter.accountId
    };
    try {
      await this._aws.helpers.ddb
        .update(buildDynamoDBPkSk(projectId, resourceTypeToKey.project), {
          item: this._formatForDDB(newProject)
        })
        .execute();
    } catch (e) {
      console.error('Failed to create project', e);
      throw Boom.internal('Failed to create project');
    }

    return newProject;
  }

  private _formatForDDB(project: Project): { [key: string]: string } {
    const dynamoItem: { [key: string]: string } = {
      ...project,
      resourceType: 'project',
      depdency: project.accountId
    };

    delete dynamoItem.accountId;

    return dynamoItem;
  }

  private async _isProjectNameInUse(projectName: string): Promise<void> {
    // query by name
    const response = await this._aws.helpers.ddb
      .query({
        key: { name: 'resourceType', value: 'project' },
        index: 'getResourceByName',
        sortKey: 'name',
        eq: { S: projectName }
      })
      .execute();

    // If anything is responded, name is in use so error
    if (response.Count !== 0) {
      throw Boom.badRequest(
        `Project name "${projectName}" is in use by a non deleted project. Please use another name.`
      );
    }

    // no error so do not do anything
  }

  private async _getCostCenter(costCenterId: string): Promise<CostCenter> {
    const costCenterService = new CostCenterService({ TABLE_NAME: this._tableName });

    try {
      return costCenterService.getCostCenter(costCenterId);
    } catch (e) {
      throw Boom.badRequest(`Could not find cost center ${costCenterId}`);
    }
  }

  // TODO--implement after dynamic AuthZ
  // private _createIdentityPermissionsForProject(projectId: string): IdentityPermissions[] {
  //   return [
  //     {
  //       // create for PA
  //       identityType: 'GROUP',
  //       identityId: `${projectId}#PA`,
  //       effect: 'ALLOW',
  //       action: 'Action.CREATE',
  //       subject: 'Project',
  //       subjectId: projectId,
  //       fields: ['Environment', 'InternalDataset', 'SSHKey', 'User']
  //     },
  //     {
  //       // read for PA
  //       identityType: 'GROUP',
  //       identityId: `${projectId}#PA`,
  //       effect: 'ALLOW',
  //       action: 'Action.READ',
  //       subject: 'Project',
  //       subjectId: projectId,
  //       fields: ['Environment', 'EnvTypeConfig', 'InternalDataset', 'SSHKey', 'User']
  //     },
  //     {
  //       // update for PA
  //       identityType: 'GROUP',
  //       identityId: `${projectId}#PA`,
  //       effect: 'ALLOW',
  //       action: 'Action.UPDATE',
  //       subject: 'Project',
  //       subjectId: projectId,
  //       fields: ['Environment', 'InternalDataset', 'SSHKey']
  //     },
  //     {
  //       // delete for PA
  //       identityType: 'GROUP',
  //       identityId: `${projectId}#PA`,
  //       effect: 'ALLOW',
  //       action: 'Action.DELETE',
  //       subject: 'Project',
  //       subjectId: projectId,
  //       fields: ['Environment', 'InternalDataset', 'SSHKey', 'User']
  //     },
  //     {
  //       // create for Researcher
  //       identityType: 'GROUP',
  //       identityId: `${projectId}#Researcher`,
  //       effect: 'ALLOW',
  //       action: 'Action.CREATE',
  //       subject: 'Project',
  //       subjectId: projectId,
  //       fields: ['Environment', 'SSHKey']
  //     },
  //     {
  //       // read for Researcher
  //       identityType: 'GROUP',
  //       identityId: `${projectId}#Researcher`,
  //       effect: 'ALLOW',
  //       action: 'Action.READ',
  //       subject: 'Project',
  //       subjectId: projectId,
  //       fields: ['Environment', 'EnvTypeConfig', 'InternalDataset', 'SSHKey']
  //     },
  //     {
  //       // update for Researcher
  //       identityType: 'GROUP',
  //       identityId: `${projectId}#Researcher`,
  //       effect: 'ALLOW',
  //       action: 'Action.UPDATE',
  //       subject: 'Project',
  //       subjectId: projectId,
  //       fields: ['Environment', 'SSHKey']
  //     },
  //     {
  //       // delete for Researcher
  //       identityType: 'GROUP',
  //       identityId: `${projectId}#Researcher`,
  //       effect: 'ALLOW',
  //       action: 'Action.DELETE',
  //       subject: 'Project',
  //       subjectId: projectId,
  //       fields: ['Environment', 'SSHKey']
  //     }
  //   ];
  // }
}
