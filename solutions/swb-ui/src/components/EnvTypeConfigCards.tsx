import { useCollection } from '@awsui/collection-hooks';
import { Cards, Box, CardsProps } from '@awsui/components-react';
import React, { useState } from 'react';

interface OnSelectEnvTypeConfigFunction {
  (selection: CardsProps.SelectionChangeDetail<EnvTypeConfigItem>): void;
}
export interface EnvTypeConfigsProps {
  OnSelect: OnSelectEnvTypeConfigFunction;
  allItems: EnvTypeConfigItem[];
  selectedItem?: string;
}

export interface EnvTypeConfigItem {
  id: string;
  name: string;
  estimatedCost: string;
  instanceType: string;
}

export default function EnvTypeConfigCards(props: EnvTypeConfigsProps): JSX.Element {
  const itemType: string = 'Environment Type Configuration';
  const { items } = useCollection(props.allItems, {});
  const selected = props.allItems.filter((i) => i.id === props.selectedItem);
  const [selectedItems, setSelectedItems] = useState<EnvTypeConfigItem[]>(selected);
  return (
    <Cards
      onSelectionChange={({ detail }) => {
        setSelectedItems(detail.selectedItems);
        props.OnSelect(detail);
      }}
      selectedItems={selectedItems}
      cardDefinition={{
        header: (e) => e.name,
        sections: [
          {
            id: 'estimatedCost',
            content: (e) => e.estimatedCost,
            header: 'Estimated Cost'
          },
          {
            id: 'instanceType',
            content: (e) => e.instanceType,
            header: 'Instance Type'
          }
        ]
      }}
      cardsPerRow={[{ cards: 1 }, { minWidth: 300, cards: 3 }]}
      items={items}
      loadingText="Loading Environment Type Configurations"
      selectionType="single"
      trackBy="id"
      visibleSections={['estimatedCost', 'instanceType']}
      empty={
        <Box textAlign="center" color="inherit">
          <b>No {itemType}</b>
          <Box padding={{ bottom: 's' }} variant="p" color="inherit">
            No {itemType} to display.
          </Box>
        </Box>
      }
    />
  );
}
