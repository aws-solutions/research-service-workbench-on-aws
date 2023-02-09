/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { EnvironmentService, isEnvironmentStatus, isSortAttribute } from '@aws/workbench-core-environments';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import _ from 'lodash';
import { wrapAsync } from './errorHandlers';

export function setUpEnvRoutes(router: Router, environmentService: EnvironmentService): void {
  // Get environments
  router.get(
    '/environments',
    wrapAsync(async (req: Request, res: Response) => {
      const {
        status,
        name,
        createdAtFrom,
        createdAtTo,
        owner,
        type,
        project,
        paginationToken,
        pageSize,
        ascending,
        descending
      } = req.query;
      // Apply filter if applicable
      let filter: { [key: string]: string } | undefined = {};
      if (status && isEnvironmentStatus(status)) {
        filter = { ...filter, status };
      }
      if (name && typeof name === 'string') {
        filter = { ...filter, name };
      }
      if (createdAtFrom && typeof createdAtFrom === 'string') {
        filter = { ...filter, createdAtFrom };
      }
      if (createdAtTo && typeof createdAtTo === 'string') {
        filter = { ...filter, createdAtTo };
      }
      if (owner && typeof owner === 'string') {
        filter = { ...filter, owner };
      }
      if (type && typeof type === 'string') {
        filter = { ...filter, type };
      }
      if (project && typeof project === 'string') {
        filter = { ...filter, project };
      }
      if (_.isEmpty(filter)) {
        filter = undefined;
      }
      // Apply sort if applicable
      let sort: { [key: string]: boolean } | undefined = {};
      if (ascending && isSortAttribute(ascending)) {
        sort[`${ascending}`] = true;
      } else if (descending && isSortAttribute(descending)) {
        sort[`${descending}`] = false;
      }
      if (_.isEmpty(sort)) {
        sort = undefined;
      }
      // Apply pagination if applicable
      if ((paginationToken && typeof paginationToken !== 'string') || (pageSize && Number(pageSize) <= 0)) {
        throw Boom.badRequest(
          'Invalid pagination token and/or page size. Please try again with valid inputs.'
        );
      } else if (status && !isEnvironmentStatus(status)) {
        throw Boom.badRequest('Invalid environment status. Please try again with valid inputs.');
      } else if ((ascending && !isSortAttribute(ascending)) || (descending && !isSortAttribute(descending))) {
        throw Boom.badRequest('Invalid sort attribute. Please try again with valid inputs.');
      } else if (ascending && descending) {
        throw Boom.badRequest('Cannot sort on two attributes. Please try again with valid inputs.');
      } else if ((createdAtFrom && !createdAtTo) || (!createdAtFrom && createdAtTo)) {
        throw Boom.badRequest(
          `Invalid value for attribute ${createdAtTo ? 'createdAtTo' : 'createdAtFrom'}.`
        );
      } else {
        const response = await environmentService.listEnvironments(
          res.locals.user,
          filter,
          pageSize ? Number(pageSize) : undefined,
          paginationToken,
          sort
        );
        res.send(response);
      }
    })
  );
}
