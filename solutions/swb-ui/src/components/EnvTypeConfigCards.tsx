/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { useCollection } from '@awsui/collection-hooks';
import { Cards, Box, CardsProps } from '@awsui/components-react';
import React, { useEffect, useState } from 'react';
import { EnvTypeConfigItem } from '../models/EnvironmentTypeConfig';

interface OnSelectEnvTypeConfigFunction {
  (selection: CardsProps.SelectionChangeDetail<EnvTypeConfigItem>): void;
}
export interface EnvTypeConfigsProps {
  onSelect: OnSelectEnvTypeConfigFunction;
  allItems: EnvTypeConfigItem[];
  isLoading?: boolean;
}

export default function EnvTypeConfigCards(props: EnvTypeConfigsProps): JSX.Element {
  const itemType: string = 'Configurations';
  const { items } = useCollection(props.allItems, {});
  const [selectedItems, setSelectedItems] = useState<EnvTypeConfigItem[]>([]);
  useEffect(() => {
    setSelectedItems([]); //clean selection on reload items
  }, [items]);
  return (
    <Cards
      onSelectionChange={({ detail }) => {
        setSelectedItems(detail.selectedItems);
        props.onSelect(detail);
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
            content: (e) => e.type,
            header: 'Instance Type'
          }
        ]
      }}
      cardsPerRow={[{ cards: 1 }, { minWidth: 300, cards: 3 }]}
      items={items}
      loading={props.isLoading}
      loadingText="Loading Configurations"
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
