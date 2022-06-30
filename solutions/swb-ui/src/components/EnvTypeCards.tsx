import React, { useState } from 'react';
import {
  CollectionPreferences,
  Header,
  Cards,
  Pagination,
  Box,
  TextFilter,
  CardsProps,
  TextContent
} from '@awsui/components-react';
import { TableEmptyDisplay } from '../common/tableEmptyState';
import { TableNoMatchDisplay } from '../common/tableNoMatchState';
import { useCollection } from '@awsui/collection-hooks';

interface OnSelectEnvTypeFunction {
  (selection: CardsProps.SelectionChangeDetail<EnvTypeItem>): void;
}
export interface EnvTypesProps {
  OnSelect: OnSelectEnvTypeFunction;
  allItems: EnvTypeItem[];
  selectedItem?: string;
}

export type EnvTypeItem = {
  id: string;
  name: string;
  description: string;
};

export const searchableColumns: string[] = ['name', 'description'];
export default (props: EnvTypesProps) => {
  const [preferences, setPreferences] = useState({
    pageSize: 10
  });
  const itemType: string = 'Compute Platform';
  const { items, filterProps, paginationProps } = useCollection(props.allItems, {
    filtering: {
      empty: TableEmptyDisplay(itemType),
      noMatch: TableNoMatchDisplay(itemType),
      filteringFunction: (item: any, filteringText: string): any => {
        const filteringTextLowerCase = filteringText.toLowerCase();
        return (
          searchableColumns
            // eslint-disable-next-line security/detect-object-injection
            .map((key) => item[key])
            .some(
              (value) => typeof value === 'string' && value.toLowerCase().indexOf(filteringTextLowerCase) > -1
            )
        );
      }
    },
    pagination: { pageSize: preferences.pageSize }
  });

  let selected = props.allItems.filter((i) => i.id === props.selectedItem);
  const [selectedItems, setSelectedItems] = useState(selected);

  return (
    <Cards
      onSelectionChange={({ detail }) => {
        setSelectedItems((prevState) => detail.selectedItems);
        props.OnSelect(detail);
      }}
      selectedItems={selectedItems}
      cardDefinition={{
        header: (e) => e.name,
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
      loadingText="Loading Compute Platforms"
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
      filter={<TextFilter {...filterProps} filteringPlaceholder="Find Compute Platform" />}
      pagination={<Pagination {...paginationProps} />}
      preferences={
        <CollectionPreferences
          title="Preferences"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          preferences={preferences}
          onConfirm={({ detail }) => setPreferences(detail)}
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
};
