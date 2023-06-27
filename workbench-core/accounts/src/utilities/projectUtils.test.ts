/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { FilterRequest, SortRequest } from '@aws/workbench-core-base';
import { ProjectStatus } from '../constants/projectStatus';
import { Project } from '../models/projects/project';
import { manualFilterProjects, manualSortProjects } from './projectUtils';

describe('projectUtils', () => {
  let projects: Project[];

  beforeEach(() => {
    projects = [
      {
        id: '',
        name: 'name1',
        description: '',
        costCenterId: 'cc-1',
        status: ProjectStatus.AVAILABLE,
        createdAt: '2022-11-10T04:19:00.000Z',
        updatedAt: '',
        awsAccountId: '',
        envMgmtRoleArn: '',
        hostingAccountHandlerRoleArn: '',
        vpcId: '',
        subnetId: '',
        environmentInstanceFiles: '',
        encryptionKeyArn: '',
        externalId: '',
        accountId: ''
      },
      {
        id: '',
        name: 'name2',
        description: '',
        costCenterId: 'cc-2',
        status: ProjectStatus.SUSPENDED,
        createdAt: '2022-11-10T04:20:00.000Z',
        updatedAt: '',
        awsAccountId: '',
        envMgmtRoleArn: '',
        hostingAccountHandlerRoleArn: '',
        vpcId: '',
        subnetId: '',
        environmentInstanceFiles: '',
        encryptionKeyArn: '',
        externalId: '',
        accountId: ''
      },
      {
        id: '',
        name: 'name3',
        description: '',
        costCenterId: 'cc-3',
        status: ProjectStatus.DELETED,
        createdAt: '2022-11-10T04:21:00.000Z',
        updatedAt: '',
        awsAccountId: '',
        envMgmtRoleArn: '',
        hostingAccountHandlerRoleArn: '',
        vpcId: '',
        subnetId: '',
        environmentInstanceFiles: '',
        encryptionKeyArn: '',
        externalId: '',
        accountId: ''
      }
    ];
  });

  describe('manualSortProjects', () => {
    let sortRequest: SortRequest;
    let expectedProjects: Project[];

    test('should return original list if no sort passed in', async () => {
      expect(manualSortProjects(sortRequest, projects)).toEqual(projects);
    });

    test('should fail if too many sort attributes passed', async () => {
      // BUILD
      sortRequest = { createdAt: 'asc', name: 'asc' };

      // OPERATE n CHECK
      expect(() => manualSortProjects(sortRequest, projects)).toThrow(
        'Cannot sort by more than one attribute.'
      );
    });

    test('should fail if sortValue is undefined', async () => {
      // BUILD
      sortRequest = { createdAt: undefined };

      // OPERATE n CHECK
      expect(() => manualSortProjects(sortRequest, projects)).toThrow('Sort contains invalid format');
    });

    test('should fail if sortKey is not property on project', async () => {
      // BUILD
      sortRequest = { notAnAttribute: 'asc' };

      // OPERATE n CHECK
      expect(() => manualSortProjects(sortRequest, projects)).toThrow(
        `Requested sort key does not exist on Project. Please sort by another attribute.`
      );
    });

    test('sort on createdAt ascending', async () => {
      // BUILD
      sortRequest = { createdAt: 'asc' };
      expectedProjects = projects;

      // OPERATE n CHECK
      expect(manualSortProjects(sortRequest, projects)).toEqual(expectedProjects);
    });

    test('sort on createdAt descending', async () => {
      // BUILD
      sortRequest = { createdAt: 'desc' };
      expectedProjects = projects.reverse();

      // OPERATE n CHECK
      expect(manualSortProjects(sortRequest, projects)).toEqual(expectedProjects);
    });

    test('sort on dependency ascending', async () => {
      // BUILD
      sortRequest = { dependency: 'asc' };
      expectedProjects = projects;

      // OPERATE n CHECK
      expect(manualSortProjects(sortRequest, projects)).toEqual(expectedProjects);
    });

    test('sort on dependency descending', async () => {
      // BUILD
      sortRequest = { dependency: 'desc' };
      expectedProjects = projects.reverse();

      // OPERATE n CHECK
      expect(manualSortProjects(sortRequest, projects)).toEqual(expectedProjects);
    });

    test('sort on name ascending', async () => {
      // BUILD
      sortRequest = { name: 'asc' };
      expectedProjects = projects;

      // OPERATE n CHECK
      expect(manualSortProjects(sortRequest, projects)).toEqual(expectedProjects);
    });

    test('sort on name descending', async () => {
      // BUILD
      sortRequest = { createdAt: 'desc' };
      expectedProjects = projects.reverse();

      // OPERATE n CHECK
      expect(manualSortProjects(sortRequest, projects)).toEqual(expectedProjects);
    });

    test('sort on status ascending', async () => {
      // BUILD
      sortRequest = { status: 'asc' };
      expectedProjects = [projects[0], projects[2], projects[1]];

      // OPERATE n CHECK
      expect(manualSortProjects(sortRequest, projects)).toEqual(expectedProjects);
    });

    test('sort on status descending', async () => {
      // BUILD
      sortRequest = { status: 'desc' };
      expectedProjects = [projects[1], projects[2], projects[0]];

      // OPERATE n CHECK
      expect(manualSortProjects(sortRequest, projects)).toEqual(expectedProjects);
    });
  });

  describe('manualFilterProjects', () => {
    let filterRequest: FilterRequest;
    let expectedProjects: Project[];

    test('should return original list if no filter passed in', async () => {
      expect(manualFilterProjects(filterRequest, projects)).toEqual(projects);
    });

    test('should fail if too many filter attributes passed', async () => {
      // BUILD
      filterRequest = { createdAt: { eq: 'date1' }, name: { eq: 'name1' } };

      // OPERATE n CHECK
      expect(() => manualFilterProjects(filterRequest, projects)).toThrow(
        'Cannot filter by more than one attribute.'
      );
    });

    test('should fail if filterKey is not property on project', async () => {
      // BUILD
      filterRequest = { notAnAttribute: { eq: 'blah' } };

      // OPERATE n CHECK
      expect(() => manualFilterProjects(filterRequest, projects)).toThrow(
        `Requested filter does not exist on Project. Please filter by another attribute.`
      );
    });

    test('should fail if filterValue is undefined', async () => {
      // BUILD
      filterRequest = { createdAt: { eq: undefined } };

      // OPERATE n CHECK
      expect(() => manualFilterProjects(filterRequest, projects)).toThrow('Filter contains invalid format');
    });

    test('filter on eq createdAt', async () => {
      // BUILD
      filterRequest = {
        createdAt: { eq: '2022-11-10T04:19:00.000Z' }
      };
      expectedProjects = [projects[0]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on lt createdAt', async () => {
      // BUILD
      filterRequest = {
        createdAt: { lt: '2022-11-10T04:20:00.000Z' }
      };
      expectedProjects = [projects[0]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on lte createdAt', async () => {
      // BUILD
      filterRequest = {
        createdAt: { lte: '2022-11-10T04:20:00.000Z' }
      };
      expectedProjects = [projects[0], projects[1]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on gt createdAt', async () => {
      // BUILD
      filterRequest = {
        createdAt: { gt: '2022-11-10T04:19:00.000Z' }
      };
      expectedProjects = [projects[1], projects[2]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on gte createdAt', async () => {
      // BUILD
      filterRequest = {
        createdAt: { gte: '2022-11-10T04:20:00.000Z' }
      };
      expectedProjects = [projects[1], projects[2]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on between createdAt', async () => {
      // BUILD
      filterRequest = {
        createdAt: { between: { value1: '2022-11-10T04:19:00.000Z', value2: '2022-11-10T04:21:00.000Z' } }
      };
      expectedProjects = projects;

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on begins createdAt', async () => {
      // BUILD
      filterRequest = {
        createdAt: { begins: '2022' }
      };
      expectedProjects = [projects[0], projects[1], projects[2]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on eq dependency', async () => {
      // BUILD
      filterRequest = {
        dependency: { eq: 'cc-1' }
      };
      expectedProjects = [projects[0]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on lt dependency', async () => {
      // BUILD
      filterRequest = {
        dependency: { lt: 'cc-2' }
      };
      expectedProjects = [projects[0]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on lte dependency', async () => {
      // BUILD
      filterRequest = {
        dependency: { lte: 'cc-2' }
      };
      expectedProjects = [projects[0], projects[1]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on gt dependency', async () => {
      // BUILD
      filterRequest = {
        dependency: { gt: 'cc-1' }
      };
      expectedProjects = [projects[1], projects[2]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on gte dependency', async () => {
      // BUILD
      filterRequest = {
        dependency: { gte: 'cc-2' }
      };
      expectedProjects = [projects[1], projects[2]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on between dependency', async () => {
      // BUILD
      filterRequest = {
        dependency: { between: { value1: 'cc-1', value2: 'cc-2' } }
      };
      expectedProjects = [projects[0], projects[1]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on begins dependency', async () => {
      // BUILD
      filterRequest = {
        dependency: { begins: 'cc-' }
      };
      expectedProjects = [projects[0], projects[1], projects[2]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on eq name', async () => {
      // BUILD
      filterRequest = {
        name: { eq: 'name1' }
      };
      expectedProjects = [projects[0]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on lt name', async () => {
      // BUILD
      filterRequest = {
        name: { lt: 'name2' }
      };
      expectedProjects = [projects[0]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on lte name', async () => {
      // BUILD
      filterRequest = {
        name: { lte: 'name2' }
      };
      expectedProjects = [projects[0], projects[1]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on gt name', async () => {
      // BUILD
      filterRequest = {
        name: { gt: 'name1' }
      };
      expectedProjects = [projects[1], projects[2]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on gte name', async () => {
      // BUILD
      filterRequest = {
        name: { gte: 'name2' }
      };
      expectedProjects = [projects[1], projects[2]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on between name', async () => {
      // BUILD
      filterRequest = {
        name: { between: { value1: 'name1', value2: 'name3' } }
      };
      expectedProjects = projects;

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on begins name', async () => {
      // BUILD
      filterRequest = {
        name: { begins: 'name' }
      };
      expectedProjects = [projects[0], projects[1], projects[2]];

      /// OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on eq status', async () => {
      // BUILD
      filterRequest = {
        status: { eq: ProjectStatus.AVAILABLE }
      };
      expectedProjects = [projects[0]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on lt status', async () => {
      // BUILD
      filterRequest = {
        status: { lt: ProjectStatus.DELETED }
      };
      expectedProjects = [projects[0]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on lte status', async () => {
      // BUILD
      filterRequest = {
        status: { lte: ProjectStatus.DELETED }
      };
      expectedProjects = [projects[0], projects[2]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on gt status', async () => {
      // BUILD
      filterRequest = {
        status: { gt: ProjectStatus.AVAILABLE }
      };
      expectedProjects = [projects[1], projects[2]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on gte status', async () => {
      // BUILD
      filterRequest = {
        status: { gte: ProjectStatus.AVAILABLE }
      };
      expectedProjects = [projects[0], projects[1], projects[2]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on between status', async () => {
      // BUILD
      filterRequest = {
        status: { between: { value1: ProjectStatus.AVAILABLE, value2: ProjectStatus.DELETED } }
      };
      expectedProjects = [projects[0], projects[2]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });

    test('filter on begins status', async () => {
      // BUILD
      filterRequest = {
        status: { begins: 'avail' }
      };
      expectedProjects = [projects[0], projects[1], projects[2]];

      // OPERATE n CHECK
      expect(manualFilterProjects(filterRequest, projects)).toEqual(expectedProjects);
    });
  });
});
