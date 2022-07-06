import { Box, Header, SpaceBetween, Table, Button } from '@awsui/components-react';
import { TableEmptyDisplay } from '../common/tableEmptyState';
import { columnDefinitions } from '../hpc-table-config/jobsColumnDefinitions';
import { useCollection } from '@awsui/collection-hooks';
import { filteringProperties } from '../hpc-table-config/jobsFilteringProperties';
import { useCluster, useJobQueue, stopJob } from '../api/hpc-clusters';
import React from 'react';

interface JobsTableProps {
  projectId: string;
  clusterName: string;
}

export default function JobsTable(props: JobsTableProps): JSX.Element {
  const { cluster, clusterMutate } = useCluster(props.projectId, props.clusterName);

  const { jobs, jobMutate } = useJobQueue(props.projectId, props.clusterName, 'i-029a9e4888c80902c');

  const [error, setError] = React.useState('');

  /*React.useEffect(() => {
        getJobs().then(items => setClusters(items));
    },[]);*/

  console.log('The Cluster', cluster);

  console.log('All Jobs', jobs);

  const itemType: string = 'job';

  const { items, collectionProps } = useCollection(jobs, {
    propertyFiltering: {
      filteringProperties: filteringProperties,
      empty: TableEmptyDisplay(itemType)
    },
    sorting: {},
    selection: {}
  });

  const noStop = (): boolean => {
    let flag = false;
    if (collectionProps.selectedItems?.length === 0) {
      flag = true;
    }
    collectionProps.selectedItems?.forEach((job) => {
      if (
        job?.job_state === 'STOPPING' ||
        job?.job_state === 'FAILED' ||
        job?.job_state === 'COMPLETED' ||
        job?.job_state === 'CANCELLED'
      ) {
        flag = true;
      }
    });
    return flag;
  };

  const executeStop = async (): Promise<void> => {
    collectionProps.selectedItems?.forEach(async (job) => {
      try {
        setError('');
        await stopJob(props.projectId, props.clusterName, 'i-029a9e4888c80902c', job.job_id);
        await jobMutate();
      } catch {
        setError(`There was a problem trying to stop the job.`);
      }
    });
  };

  return (
    <Table
      {...collectionProps}
      selectionType="multi"
      selectedItems={collectionProps.selectedItems}
      columnDefinitions={columnDefinitions}
      loadingText="Loading jobs"
      items={items}
      header={
        <>
          <SpaceBetween direction="vertical" size="xs">
            <Header
              counter={
                collectionProps.selectedItems?.length
                  ? `(${collectionProps.selectedItems.length}/${jobs.length})`
                  : `(${jobs.length})`
              }
              actions={
                <Box float="right">
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button disabled={noStop()} onClick={() => executeStop()}>
                      Stop Job
                    </Button>
                    <Button variant="primary">Submit Job</Button>
                  </SpaceBetween>
                </Box>
              }
              variant="h2"
            >
              {props.clusterName}
            </Header>
            <Box float="left">
              <SpaceBetween direction="horizontal" size="xs">
                <Box variant="h3" color="text-label">
                  Head Node Instance ID: clusterInstanceID
                </Box>
                <Box variant="h3" color="text-label">
                  State: clusterState
                </Box>
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        </>
      }
    />
  );
}
