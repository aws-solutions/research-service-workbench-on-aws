/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { EnvironmentPlugin, ListEnvironmentsRequest, EnvironmentItem } from '@aws/swb-app';
import { PaginatedResponse } from '@aws/workbench-core-base';
import { EnvironmentService, ListEnvironmentsServiceRequestParser } from '@aws/workbench-core-environments';

export class SWBEnvironmentService implements EnvironmentPlugin {
  private _environmentService: EnvironmentService;

  public constructor(environmentService: EnvironmentService) {
    this._environmentService = environmentService;
  }

  public async listEnvironments(
    request: ListEnvironmentsRequest
  ): Promise<PaginatedResponse<EnvironmentItem>> {
    const parsedRequest = ListEnvironmentsServiceRequestParser.parse(request); //removing project properties
    //Replacing project prop for dependency
    if (request.filter?.projectId && parsedRequest.filter)
      parsedRequest.filter.dependency = request.filter.projectId;
    if (request.sort?.projectId && parsedRequest.sort) parsedRequest.sort.dependency = request.sort.projectId;
    return await this._environmentService.listEnvironments(parsedRequest);
  }
}
