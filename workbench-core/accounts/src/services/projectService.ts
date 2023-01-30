/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable security/detect-object-injection */

import { BatchGetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import {
  AuthenticatedUser,
  DynamicAuthorizationService,
  IdentityPermission
} from '@aws/workbench-core-authorization';
import {
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
  PaginatedResponse,
  DynamoDBService
} from '@aws/workbench-core-base';
import * as Boom from '@hapi/boom';
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
  private _resourceType: string = 'project';
  private readonly _dynamoDBService: DynamoDBService;

  private _dynamicAuthorizationService: DynamicAuthorizationService;
  private _costCenterService: CostCenterService;

  public constructor(
    dynamoDBService: DynamoDBService,
    dynamicAuthZService: DynamicAuthorizationService,
    costCenterService: CostCenterService
  ) {
    this._dynamoDBService = dynamoDBService;
    this._dynamicAuthorizationService = dynamicAuthZService;
    this._costCenterService = costCenterService;
  }

  /**
   * Get project
   * @param request - the request object for getting a project
   *
   * @returns Project entry in DDB
   */
  public async getProject(request: GetProjectRequest): Promise<Project> {
    const response = await this._dynamoDBService.getItem({
      key: buildDynamoDBPkSk(request.projectId, resourceTypeToKey.project)
    });

    if (response === undefined) {
      throw Boom.notFound(`Could not find project ${request.projectId}`);
    }

    return this._mapDDBItemToProject(response);
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

    const emptyResponse = {
      data: [],
      paginationToken: undefined
    };

    const getUserGroupsResponse = await this._dynamicAuthorizationService.getUserGroups({
      authenticatedUser: request.user,
      userId: request.user.id
    });

    const userGroupsForCurrentUser = getUserGroupsResponse.data.groupIds;

    if (!userGroupsForCurrentUser.length) {
      return emptyResponse;
    }

    //If user is ITAdmin
    if (userGroupsForCurrentUser.includes('ITAdmin')) {
      let queryParams: QueryParams = {
        key: { name: 'resourceType', value: this._resourceType },
        index: 'getResourceByCreatedAt',
        limit: pageSize
      };

      const filterQuery = getFilterQueryParams(filter, listProjectGSINames);
      const sortQuery = getSortQueryParams(sort, listProjectGSINames);
      queryParams = { ...queryParams, ...filterQuery, ...sortQuery };

      queryParams = addPaginationToken(paginationToken, queryParams);
      const projectsResponse = await this._dynamoDBService.getPaginatedItems(queryParams);

      paginationToken = projectsResponse.paginationToken;
      const items = projectsResponse.data.map((item) => this._mapDDBItemToProject(item));

      return {
        data: items,
        paginationToken
      };
    }

    if (userGroupsForCurrentUser.length === 1) {
      // If member of 1 group, get project item
      const projectId = userGroupsForCurrentUser[0].split('#')[0];
      const project = await this.getProject({ projectId: projectId });

      return {
        data: [project],
        paginationToken: undefined
      };
    }

    // Else, member of more than 1 group, batch get items and manually filter, sort, and paginate
    const projectIds: string[] = userGroupsForCurrentUser.map(
      (projectGroup: string) => projectGroup.split('#')[0]
    );
    const keys: Record<string, unknown>[] = projectIds.map((projectId) =>
      buildDynamoDBPkSk(projectId, resourceTypeToKey.project)
    );
    const projectsResponse = (await this._dynamoDBService.get(keys).execute()) as BatchGetItemCommandOutput;
    if (!projectsResponse.Responses) {
      return { data: [], paginationToken: undefined };
    }
    // parse responses from DDB
    const projects: Project[] = projectsResponse.Responses[this._dynamoDBService.getTableName()].map((item) =>
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
   * Creates a new project
   *
   * @param params - the required fields to create a new project
   * @param user - authenticated user creating the project
   * @returns Project object of new project
   */
  public async createProject(params: CreateProjectRequest, user: AuthenticatedUser): Promise<Project> {
    // Verify project name is unique and cost center exists
    const resultsFromValidityChecks = await Promise.all([
      this._isProjectNameInUse(params.name),
      this._getCostCenter(params.costCenterId)
    ]);
    const costCenter: CostCenter = resultsFromValidityChecks[1];

    // Generate Project ID
    const projectId = uuidWithLowercasePrefix(resourceTypeToKey.project);

    await this._dynamicAuthorizationService.createGroup({
      authenticatedUser: user,
      groupId: `${projectId}#ProjectAdmin`,
      description: `Project Admin group for ${projectId}`
    });
    await this._dynamicAuthorizationService.createGroup({
      authenticatedUser: user,
      groupId: `${projectId}#Researcher`,
      description: `Researcher group for ${projectId}`
    });

    const identityPermissions: IdentityPermission[] = this._generateIdentityPermissionsForProject(projectId);
    await this._dynamicAuthorizationService.createIdentityPermissions({
      authenticatedUser: user,
      identityPermissions: identityPermissions
    });

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
      await this._dynamoDBService.updateExecuteAndFormat({
        key: buildDynamoDBPkSk(projectId, resourceTypeToKey.project),
        params: {
          item: this._mapToDDBItemFromProject(newProject)
        }
      });
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
      const updateResponse = await this._dynamoDBService.updateExecuteAndFormat({
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
    const { projectId, authenticatedUser } = request;

    // verify all dependencies are empty
    await checkDependencies(projectId);

    // verify project exists
    await this.getProject({ projectId });

    const identityPermissions: IdentityPermission[] = this._generateIdentityPermissionsForProject(projectId);
    await this._dynamicAuthorizationService.deleteIdentityPermissions({
      authenticatedUser,
      identityPermissions
    });

    await this._dynamicAuthorizationService.deleteGroup({
      authenticatedUser,
      groupId: `${projectId}#ProjectAdmin`
    });
    await this._dynamicAuthorizationService.deleteGroup({
      authenticatedUser,
      groupId: `${projectId}#Researcher`
    });

    // delete from DDB
    try {
      await this._dynamoDBService.updateExecuteAndFormat({
        key: buildDynamoDBPkSk(projectId, resourceTypeToKey.project),
        params: {
          item: { resourceType: `${this._resourceType}_deleted`, status: ProjectStatus.DELETED }
        }
      });
    } catch (e) {
      console.error(`Failed to delete project ${projectId}}`, e);
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
    const response = await this._dynamoDBService.getPaginatedItems(queryParams);

    // If anything is responded, name is in use so error
    if (response.data.length !== 0) {
      throw Boom.badRequest(
        `Project name "${projectName}" is in use by a non deleted project. Please use another name.`
      );
    }
    // no error so do not do anything
  }

  private async _getCostCenter(costCenterId: string): Promise<CostCenter> {
    try {
      return this._costCenterService.getCostCenter(costCenterId);
    } catch (e) {
      throw Boom.badRequest(`Could not find cost center ${costCenterId}`);
    }
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

    const associatedProjResponse = await this._dynamoDBService.getPaginatedItems(queryParams);
    return associatedProjResponse.data.length > 0;
  }

  /***
   * Generates the default identity permissions for the project
   * @param projectId - the project the permissions are being generated for
   * @returns an array of Identity Permissions
   */
  private _generateIdentityPermissionsForProject(projectId: string): IdentityPermission[] {
    const identityType = 'GROUP';
    const effect = 'ALLOW';
    const subjectType = 'Project';
    const subjectId = projectId;
    const projectAdminIdentity = `${projectId}#ProjectAdmin`;
    const researcherIdentity = `${projectId}#Researcher`;

    const projectAdminPermissions: IdentityPermission[] = [
      {
        // create for PA
        identityType,
        identityId: projectAdminIdentity,
        effect,
        action: 'CREATE',
        subjectType,
        subjectId,
        fields: ['Environment', 'InternalDataset', 'SSHKey', 'User']
      },
      {
        // read for PA
        identityType,
        identityId: projectAdminIdentity,
        effect,
        action: 'READ',
        subjectType,
        subjectId,
        fields: ['Environment', 'EnvTypeConfig', 'InternalDataset', 'SSHKey', 'User']
      },
      {
        // update for PA
        identityType,
        identityId: projectAdminIdentity,
        effect,
        action: 'UPDATE',
        subjectType,
        subjectId,
        fields: ['Environment', 'InternalDataset', 'SSHKey']
      },
      {
        // delete for PA
        identityType,
        identityId: projectAdminIdentity,
        effect,
        action: 'DELETE',
        subjectType: 'Project',
        subjectId: projectId,
        fields: ['Environment', 'InternalDataset', 'SSHKey', 'User']
      }
    ];

    const researcherPermissions: IdentityPermission[] = [
      {
        // create for Researcher
        identityType,
        identityId: researcherIdentity,
        effect,
        action: 'CREATE',
        subjectType,
        subjectId,
        fields: ['Environment', 'SSHKey']
      },
      {
        // read for Researcher
        identityType,
        identityId: researcherIdentity,
        effect,
        action: 'READ',
        subjectType,
        subjectId,
        fields: ['Environment', 'EnvTypeConfig', 'InternalDataset', 'SSHKey']
      },
      {
        // update for Researcher
        identityType,
        identityId: researcherIdentity,
        effect,
        action: 'UPDATE',
        subjectType,
        subjectId,
        fields: ['Environment', 'SSHKey']
      },
      {
        // delete for Researcher
        identityType,
        identityId: researcherIdentity,
        effect,
        action: 'DELETE',
        subjectType,
        subjectId,
        fields: ['Environment', 'SSHKey']
      }
    ];

    return projectAdminPermissions.concat(researcherPermissions);
  }
}
