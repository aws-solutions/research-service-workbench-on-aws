import { getClusters } from '../api/hpc-clusters';
import { Cluster } from '../models/Cluster';
import { Table } from '@awsui/components-react';
import { TableEmptyDisplay } from '../common/tableEmptyState';
import { columnDefinitions } from '../hpc-table-config/clustersColumnDefinitions';
import { useCollection } from '@awsui/collection-hooks';
import { filteringProperties } from '../hpc-table-config/clustersFilteringProperties';
import React from 'react';

interface ClustersTableProps {
  projectId: string;
}

export default function ClustersTable(props: ClustersTableProps): JSX.Element {
  const [clusters, setClusters] = React.useState([] as Cluster[]);

  React.useEffect(() => {
    getClusters(props.projectId).then((items) => setClusters(items));
  }, []);

  console.log('Project ID Prop: ', props.projectId);

  console.log('Obtained Clusters', clusters);

  const itemType: string = 'cluster';

  const { items, collectionProps } = useCollection(clusters, {
    propertyFiltering: {
      filteringProperties: filteringProperties,
      empty: TableEmptyDisplay(itemType)
    },
    sorting: {},
    selection: {}
  });

  return (
    <Table
      {...collectionProps}
      selectionType="single"
      selectedItems={collectionProps.selectedItems}
      columnDefinitions={columnDefinitions}
      loadingText="Loading clusters"
      items={items}
    />
  );
}
