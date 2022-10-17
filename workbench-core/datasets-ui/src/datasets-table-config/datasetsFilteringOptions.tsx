/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { PropertyFilterProps } from '@cloudscape-design/components/property-filter';

export const filteringOptions: readonly PropertyFilterProps.FilteringOption[] = [
  { propertyKey: 'datasetName', value: '' },
  { propertyKey: 'category', value: 'Internal' },
  { propertyKey: 'category', value: 'External' },
  { propertyKey: 'description', value: '' }
];