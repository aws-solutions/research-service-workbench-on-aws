/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { TableProps } from '@cloudscape-design/components';
import React from 'react';

export const columnDefinitions: readonly TableProps.ColumnDefinition<object>[] = [
  {
    id: 'workspaceName',
    header: 'Workspace name',
    cell: (e: { workspaceName: string }) => <div data-testid={e.workspaceName}>{e.workspaceName}</div>,
    sortingField: 'name'
  },
  {
    id: 'workspaceStatus',
    header: 'Workspace status',
    cell: (e: { workspaceStatus: string }) => e.workspaceStatus,
    sortingField: 'status'
  },
  {
    id: 'createdAt',
    header: 'Created at',
    cell: (e: { createdAt: string }) => new Date(e.createdAt).toLocaleString(),
    sortingField: 'createdAt'
  },
  {
    id: 'project',
    header: 'Project',
    cell: (e: { project: string }) => e.project,
    sortingField: 'project'
  },
  {
    id: 'owner',
    header: 'Owner',
    cell: (e: { owner: string }) => e.owner,
    sortingField: 'owner'
  }
];

export const searchableColumns: string[] = [
  'workspaceName',
  'workspaceStatus',
  'createdAt',
  'project',
  'owner'
];
