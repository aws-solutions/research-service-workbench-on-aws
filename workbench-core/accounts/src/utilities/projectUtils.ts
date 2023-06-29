/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { FilterRequest, QueryStringParamFilter, SortRequest } from '@aws/workbench-core-base';
import * as Boom from '@hapi/boom';
import _ from 'lodash';
import { Project } from '../models/projects/project';

/**
 * Manually sorts a list of Projects. This is designed to be used following a batchGetItems call to get multiple
 * projects since the sort cannot happen on call to DDB.
 *
 * @param sort - {@link ProjectSort} sort request to apply
 * @param projects - list of {@link Project} objects to sort
 * @returns a list of {@link Project} objects after sort
 */
export function manualSortProjects(sort: SortRequest, projects: Project[]): Project[] {
  // if no sort attribute, return original list
  if (!sort || Object.keys(sort).length === 0) {
    return projects;
  }

  // if too many sort attributes, throw error
  if (Object.keys(sort).length > 1) {
    throw Boom.badRequest('Cannot sort by more than one attribute.');
  }

  // only one entry will exist due to validation above
  const { sortKey, sortValue } = Object.entries(sort).map(([sortKey, sortValue]) => {
    return { sortKey, sortValue };
  })[0];

  if (sortValue === undefined) {
    throw Boom.badRequest('Sort contains invalid format');
  }

  let selectedSort = sortKey;
  // replace DDB attribute for dependency
  if (selectedSort === 'dependency') {
    selectedSort = 'costCenterId';
  }

  return projects.sort((project1, project2) => order(selectedSort, sortValue, project1, project2));
}

function order(sortKey: string, selectedDirection: string, project1: Project, project2: Project): number {
  if (!project1.hasOwnProperty(sortKey) || !project2.hasOwnProperty(sortKey)) {
    throw Boom.badRequest(`Requested sort key does not exist on Project. Please sort by another attribute.`);
  }
  const project1Value = project1[sortKey as keyof Project];
  const project2Value = project2[sortKey as keyof Project];
  if (selectedDirection === 'asc') {
    return project1Value.localeCompare(project2Value);
  } else if (selectedDirection === 'desc') {
    return project2Value.localeCompare(project1Value);
  } else {
    throw Boom.badRequest('Invalid sort operation.');
  }
}

export function manualFilterProjects(filter: FilterRequest, projects: Project[]): Project[] {
  // if no filter attribute, return original list
  if (!filter || Object.keys(filter).length === 0) {
    return projects;
  }

  // if too many filter attributes, throw error
  if (Object.keys(filter).length > 1) {
    throw Boom.badRequest('Cannot filter by more than one attribute.');
  }

  // get filter attribute, operator, and value
  const filterKey = Object.keys(filter)[0];
  const filterValue = Object.values(filter)[0] as QueryStringParamFilter;
  if (filterValue === undefined || Object.values(filterValue)[0] === undefined) {
    throw Boom.badRequest('Filter contains invalid format');
  }
  const selectedQualifier = Object.keys(filterValue)[0];

  let selectedFilter = filterKey;
  // replace DDB attribute for dependency
  if (selectedFilter === 'dependency') {
    selectedFilter = 'costCenterId';
  }

  return projects.filter((project) => compare(selectedFilter, selectedQualifier, filterValue, project));
}

function compare(
  selectedFilter: string,
  selectedQualifier: string,
  filterValue: QueryStringParamFilter,
  project: Project
): boolean {
  const selectedValue = Object.values(filterValue)[0];
  let projectValue;
  if (project.hasOwnProperty(selectedFilter)) {
    projectValue = project[selectedFilter as keyof Project];
  } else {
    throw Boom.badRequest(`Requested filter does not exist on Project. Please filter by another attribute.`);
  }
  switch (selectedQualifier) {
    case 'eq':
      return projectValue === selectedValue;
    case 'lt':
      return projectValue < selectedValue;
    case 'lte':
      return projectValue <= selectedValue;
    case 'gt':
      return projectValue > selectedValue;
    case 'gte':
      return projectValue >= selectedValue;
    case 'between':
      if (!_.isObject(selectedValue)) {
        throw Boom.badRequest('Need to pass object for between operation');
      }
      if (_.isObject(selectedValue) && !(selectedValue.value1 && selectedValue.value2)) {
        throw Boom.badRequest('Need two values for between operation');
      }
      return projectValue >= selectedValue.value1 && projectValue <= selectedValue.value2;
    case 'begins':
      if (!_.isString(selectedValue)) {
        throw Boom.badRequest('Need to pass string for begins operation');
      }
      return selectedValue.startsWith(selectedValue);
    default:
      throw Boom.badRequest('You supplied an invalid comparison. Please try again');
  }
}
