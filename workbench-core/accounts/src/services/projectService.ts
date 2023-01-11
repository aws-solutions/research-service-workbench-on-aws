/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable security/detect-object-injection */

import { BatchGetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { AuthenticatedUser } from '@aws/workbench-core-authorization';
import {
  AwsService,
  buildDynamoDBPkSk,
  QueryParams,
  resourceTypeToKey,
  uuidWithLowercasePrefix,
  DEFAULT_API_PAGE_SIZE,
  addPaginationToken,
  toPaginationToken,
  fromPaginationToken,
  validateSingleSortAndFilter,
  getFilterQueryParams,
  getSortQueryParams,
  PaginatedResponse
} from '@aws/workbench-core-base';
import * as Boom from '@hapi/boom';
import _ from 'lodash';
import { ProjectStatus } from '../constants/projectStatus';
import { CostCenter } from '../models/costCenters/costCenter';
import { CreateProjectRequest } from '../models/projects/createProjectRequest';
import { DeleteProjectRequest } from '../models/projects/deleteProjectRequest';
import { GetProjectRequest } from '../models/projects/getProjectRequest';
import { listProjectGSINames, ListProjectsRequest } from '../models/projects/listProjectsRequest';
import { Project, ProjectParser } from '../models/projects/project';
import { UpdateProjectRequest } from '../models/projects/updateProjectRequest';
import { manualFilterProjects, manualSortProjects } from '../utilities/projectUtils';
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
   * @param request - the request object for getting a project
   *
   * @returns Project entry in DDB
   */
  public async getProject(request: GetProjectRequest): Promise<Project> {
    const response = await this._aws.helpers.ddb.getItem({
      key: buildDynamoDBPkSk(request.projectId, resourceTypeToKey.project)
    });

    if (response === undefined) {
      throw Boom.notFound(`Could not find project ${request.projectId}`);
    }

    return this._mapDDBItemToProject(response);
  }

  // TODO--delete after dynamic Authz
  private _mockGetUserGroups(): string[] {
    return ['ITAdmin'];
  }

  /**
   * List projects
   *
   * @param request - the request object for listing projects
   * @returns Project entries in DDB, with optional pagination token
   */
  public async listProjects(request: ListProjectsRequest): Promise<PaginatedResponse<Project>> {
    // Get the values from request
    const { filter, sort } = request;
    let { pageSize, paginationToken } = request;
    if (pageSize && pageSize < 0) {
      throw Boom.badRequest('Please supply a non-negative page size.');
    }
    pageSize = pageSize && pageSize >= 0 ? pageSize : DEFAULT_API_PAGE_SIZE;
    validateSingleSortAndFilter(filter, sort);

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
          limit: pageSize
        };

        const filterQuery = getFilterQueryParams(filter, listProjectGSINames);
        const sortQuery = getSortQueryParams(sort, listProjectGSINames);
        queryParams = { ...queryParams, ...filterQuery, ...sortQuery };

        queryParams = addPaginationToken(paginationToken, queryParams);

        const projectsResponse = await this._aws.helpers.ddb.getPaginatedItems(queryParams);

        paginationToken = projectsResponse.paginationToken;

        if (projectsResponse.data) {
          const items = projectsResponse.data.map((item) => this._mapDDBItemToProject(item));
          return { data: items, paginationToken: paginationToken };
        } else {
          return { data: [], paginationToken: undefined };
        }
      }

      // If member of 1 group, get project item
      const projectId = userGroupsForCurrentUser[0].split('#')[0];
      const project = await this.getProject({ projectId: projectId });
      return { data: [project], paginationToken: undefined };
    }

    // Else, member of more than 1 group, batch get items and manually filter, sort, and paginate
    const projectIds: string[] = userGroupsForCurrentUser.map(
      (projectGroup: string) => projectGroup.split('#')[0]
    );
    const keys: Record<string, unknown>[] = projectIds.map((projectId) =>
      buildDynamoDBPkSk(projectId, resourceTypeToKey.project)
    );
    const projectsResponse = (await this._aws.helpers.ddb.get(keys).execute()) as BatchGetItemCommandOutput;
    if (!projectsResponse.Responses) {
      return { data: [], paginationToken: undefined };
    }
    // parse responses from DDB
    const projects: Project[] = projectsResponse.Responses[this._tableName].map((item) =>
      this._mapDDBItemToProject(item)
    );
    // apply sort or filter
    let projectsOnPage: Project[] = projects;
    if (filter) {
      projectsOnPage = manualFilterProjects(filter, projects);
    }
    if (sort) {
      projectsOnPage = manualSortProjects(sort, projects);
    }
    if (filter === undefined && sort === undefined) {
      // default sort is by createdAt
      projectsOnPage = manualSortProjects({ createdAt: 'asc' }, projects);
    }
    // build page and pagination token
    return this._buildPageAndPaginationTokenAfterGetItems(paginationToken, projectsOnPage, pageSize);
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
    // Verify caller is an IT Admin--TODO implement after dynamic AuthZ--this can happen in the middleware during integration but keeping here so this code gets moved properly
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
    // const identityPermissions: IdentityPermission[] = this._generateIdentityPermissionsForProject(projectId);
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
      status: ProjectStatus.AVAILABLE,
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
          item: this._mapToDDBItemFromProject(newProject)
        })
        .execute();
    } catch (e) {
      console.error('Failed to create project', e);
      throw Boom.internal('Failed to create project');
    }

    return newProject;
  }

  /**
   * Update the name or description of an existing project.
   *
   * @param request - a {@link UpdateProjectRequest} object that contains the id of the project to update
   *                  as well as the new field values
   * @returns a {@link Project} object that reflects the changes requested
   */
  public async updateProject(request: UpdateProjectRequest): Promise<Project> {
    const { projectId, updatedValues } = request;

    // verify at least one attribute is being updated
    if (!updatedValues.name && !updatedValues.description) {
      throw Boom.badRequest('You must supply a new nonempty name and/or description to update the project.');
    }

    // if updating name, verify it is not in use and project exists
    if (updatedValues.name) {
      await Promise.all([this._isProjectNameInUse(updatedValues.name), this.getProject({ projectId })]);
    } else {
      // else, verify project still exists
      await this.getProject({ projectId });
    }

    // update project DDB item
    try {
      const updateResponse = await this._aws.helpers.ddb.updateExecuteAndFormat({
        key: buildDynamoDBPkSk(projectId, resourceTypeToKey.project),
        params: { item: updatedValues, return: 'ALL_NEW' }
      });

      if (!updateResponse.Attributes) {
        throw Boom.badImplementation('Could not update project.');
      }

      return this._mapDDBItemToProject(updateResponse.Attributes);
    } catch (e) {
      console.error(`Failed to update project ${request.projectId}}`, e);
      throw Boom.internal('Could not update project.');
    }
  }

  /**
   * Soft deletes a project from the database.
   *
   * @param request - a {@link DeleteProjectRequest} object that contains the id of the project to delete
   * @param checkDependencies - an async function that checks if there are dependencies associated with the project
   */
  public async softDeleteProject(
    request: DeleteProjectRequest,
    checkDependencies: (projectId: string) => Promise<void>
  ): Promise<void> {
    // verify all dependencies are empty
    await checkDependencies(request.projectId);

    // verify project exists
    await this.getProject({ projectId: request.projectId });

    // Delete Permissions for the groups--TODO implement after dynamic AuthZ
    // const identityPermissions: IdentityPermission[] = this._generateIdentityPermissionsForProject(projectId);
    // const deleteIdentityPermissionsResponse = this._dynamicAuthorizationService.deleteIdentityPermissions(
    //   identityPermissions
    // );
    // if (!createIdentityPermissionsResponse.deleted) {
    //   throw Boom.badImplementation(
    //     'Failed to delete batch identity permissions for project with dyamic authorization service.'
    //   );
    // }

    // Delete ProjectAdmin and Researcher groups--TODO implement after dynamic AuthZ
    // const deleteProjectAdminGroupResponse = this._dynamicAuthorizationService.deleteGroup(user, {
    //   groupId: `${projId}#PA`
    // });
    // const deleteResearcherGroupResponse = this._dynamicAuthorizationService.deleteGroup(user, {
    //   groupId: `${projId}#Researcher`
    // });
    // if (!deleteProjectAdminGroupResponse.created || !deleteResearcherGroupResponse.created) {
    //   throw Boom.badImplementation(
    //     'Failed to delete Project Admin group or Researcher group with dynamic authorization service.'
    //   );
    // }

    // delete from DDB
    try {
      await this._aws.helpers.ddb.updateExecuteAndFormat({
        key: buildDynamoDBPkSk(request.projectId, resourceTypeToKey.project),
        params: {
          item: { resourceType: `${this._resourceType}_deleted`, status: ProjectStatus.DELETED }
        }
      });
    } catch (e) {
      console.error(`Failed to delete project ${request.projectId}}`, e);
      throw Boom.internal('Could not delete Project');
    }
  }

  /**
   * This method formats a Project object as a DDB item containing project data
   *
   * @param project - The Project object to prepare for DDB
   * @returns an object containing project data as well as pertinent DDB attributes based on project data
   */
  private _mapToDDBItemFromProject(project: Project): Record<string, string> {
    const dynamoItem: Record<string, string> = {
      ...project,
      resourceType: 'project',
      dependency: project.costCenterId
    };

    delete dynamoItem.costCenterId;

    return dynamoItem;
  }

  /**
   * This method formats a DDB item containing project data as a Project object
   *
   * @param item - the DDB item to conver to a Project object
   * @returns a Project object containing only project data from DDB attributes
   */
  private _mapDDBItemToProject(item: Record<string, unknown>): Project {
    const project: Record<string, unknown> = { ...item, costCenterId: item.dependency };

    // parse will remove pk and sk from the DDB item
    return ProjectParser.parse(project);
  }

  /**
   * Builds the Page and Pagination Token after GetItems call has been used to
   * get project information from DDB.
   *
   * @param paginationToken - string pagination token if need to display not the first page. Otherwise, undefined
   * @param projectsOnPage - list of {@link Project}s to build a page from
   * @param pageSize - number of projects to include in the page
   * @returns a {@link ListProjectsResponse} object containing a list of Projects and the pagination token
   */
  private async _buildPageAndPaginationTokenAfterGetItems(
    paginationToken: string | undefined,
    projectsOnPage: Project[],
    pageSize: number
  ): Promise<PaginatedResponse<Project>> {
    if (paginationToken) {
      const manualExclusiveStartKey = fromPaginationToken(paginationToken);
      const exclusiveStartProjectId = manualExclusiveStartKey.pk.split('#')[1];
      const exclusiveStartProject = projectsOnPage.find((project) => project.id === exclusiveStartProjectId);
      if (exclusiveStartProject === undefined) {
        throw Boom.badRequest('Pagination token is invalid.');
      }
      const indexOfExclusiveStartProject = projectsOnPage.indexOf(exclusiveStartProject);
      projectsOnPage = projectsOnPage.slice(indexOfExclusiveStartProject + 1);
    }
    if (projectsOnPage.length < pageSize) {
      return {
        data: projectsOnPage,
        paginationToken: undefined
      };
    } else {
      projectsOnPage = projectsOnPage.slice(0, pageSize);
      const manualLastEvaluatedKey = buildDynamoDBPkSk(
        projectsOnPage[pageSize - 1].id,
        resourceTypeToKey.project
      );
      return { data: projectsOnPage, paginationToken: toPaginationToken(manualLastEvaluatedKey) };
    }
  }

  private async _isProjectNameInUse(projectName: string): Promise<void> {
    // query by name
    const queryParams: QueryParams = {
      key: { name: 'resourceType', value: 'project' },
      index: 'getResourceByName',
      sortKey: 'name',
      eq: { S: projectName }
    };
    const response = await this._aws.helpers.ddb.getPaginatedItems(queryParams);

    // If anything is responded, name is in use so error
    if (response.data.length !== 0) {
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
  // private _generateIdentityPermissionsForProject(projectId: string): IdentityPermissions[] {
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
