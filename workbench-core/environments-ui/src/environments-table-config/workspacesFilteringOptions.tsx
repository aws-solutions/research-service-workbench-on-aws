/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { PropertyFilterProps } from '@cloudscape-design/components/property-filter';

export const filteringOptions: readonly PropertyFilterProps.FilteringOption[] = [
  { propertyKey: 'owner', value: '' },
  { propertyKey: 'project', value: '' },
  { propertyKey: 'workspaceName', value: '' },
  { propertyKey: 'workspaceStatus', value: 'AVAILABLE' },
  { propertyKey: 'workspaceStatus', value: 'FAILED' },
  { propertyKey: 'workspaceStatus', value: 'PENDING' },
  { propertyKey: 'workspaceStatus', value: 'STARTING' },
  { propertyKey: 'workspaceStatus', value: 'STOPPED' },
  { propertyKey: 'workspaceStatus', value: 'STOPPING' },
  { propertyKey: 'workspaceStatus', value: 'TERMINATED' },
  { propertyKey: 'workspaceStatus', value: 'TERMINATING' }
];
