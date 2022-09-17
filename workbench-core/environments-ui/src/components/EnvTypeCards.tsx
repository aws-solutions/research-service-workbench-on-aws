/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { TableEmptyDisplay, TableNoMatchDisplay } from '@aws/workbench-core-swb-common-ui';
import { useCollection } from '@cloudscape-design/collection-hooks';
import {
  CollectionPreferences,
  Cards,
  Pagination,
  Box,
  TextFilter,
  CardsProps,
  TextContent
} from '@cloudscape-design/components';
import React, { useState } from 'react';
import { EnvTypeItem } from '../models/EnvironmentType';

interface OnSelectEnvTypeFunction {
  (selection: CardsProps.SelectionChangeDetail<EnvTypeItem>): void;
}
export interface EnvTypesProps {
  onSelect: OnSelectEnvTypeFunction;
  allItems: EnvTypeItem[];
  selectedItem?: string;
  isLoading?: boolean;
}

export const searchableColumns: string[] = ['name', 'description'];
export default function EnvTypeCards(props: EnvTypesProps): JSX.Element {
  const [preferences, setPreferences] = useState({
    pageSize: 10
  });
  const itemType: string = 'Compute Platforms';
  const { items, filterProps, paginationProps } = useCollection(props.allItems, {
    filtering: {
      empty: TableEmptyDisplay(itemType),
      noMatch: TableNoMatchDisplay(itemType),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filteringFunction: (item: any, filteringText: string): any => {
        const filteringTextLowerCase = filteringText.toLowerCase();
        return searchableColumns.some(
          (key) =>
            // eslint-disable-next-line security/detect-object-injection
            typeof item[key] === 'string' && item[key].toLowerCase().indexOf(filteringTextLowerCase) > -1
        );
      }
    },
    pagination: { pageSize: preferences.pageSize }
  });

  const selected = props.allItems.filter((i) => i.id === props.selectedItem);
  const [selectedItems, setSelectedItems] = useState(selected);

  return (
    <Cards
      data-testid="EnvTypeCards"
      loading={props.isLoading}
      loadingText="Loading Compute Platforms"
      onSelectionChange={({ detail }) => {
        setSelectedItems((prevState) => detail.selectedItems);
        props.onSelect(detail);
      }}
      selectedItems={selectedItems}
      cardDefinition={{
        header: (e) => <div data-testid={e.name}>{e.name}</div>,
        sections: [
          {
            id: 'description',
            content: (e) => {
              return <TextContent>{e.description}</TextContent>;
            }
          }
        ]
      }}
      items={items}
      selectionType="single"
      trackBy="id"
      visibleSections={['description']}
      empty={
        <Box textAlign="center" color="inherit">
          <b>No {itemType}</b>
          <Box padding={{ bottom: 's' }} variant="p" color="inherit">
            No {itemType} to display.
          </Box>
        </Box>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find Compute Platform"
          data-testid="environmentTypeSearch"
        />
      }
      pagination={<Pagination {...paginationProps} />}
      preferences={
        <CollectionPreferences
          title="Preferences"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          preferences={preferences}
          onConfirm={({ detail: { pageSize } }) => setPreferences({ pageSize: pageSize || 10 })}
          pageSizePreference={{
            title: 'Page size',
            options: [
              { label: '10', value: 10 },
              { label: '15', value: 15 },
              { label: '20', value: 20 }
            ]
          }}
        />
      }
    />
  );
}
