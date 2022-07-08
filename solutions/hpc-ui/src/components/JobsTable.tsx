import { Box, Header, SpaceBetween, Table, Button } from '@awsui/components-react';
import { TableEmptyDisplay } from '../common/tableEmptyState';
import { columnDefinitions } from '../hpc-table-config/jobsColumnDefinitions';
import { useCollection } from '@awsui/collection-hooks';
import { filteringProperties } from '../hpc-table-config/jobsFilteringProperties';
import { useCluster, useJobQueue, stopJob } from '../api/hpc-clusters';
import JobSubmitForm from './JobSubmitForm';
import React from 'react';

interface JobsTableProps {
  projectId: string;
  clusterName: string;
}

export default function JobsTable(props: JobsTableProps): JSX.Element {
  const cluster = useCluster(props.projectId, props.clusterName);

  const { jobs, jobMutate } = useJobQueue(
    props.projectId,
    props.clusterName,
    cluster !== undefined ? cluster.headNode?.instanceId! : cluster
  );

  const [viewJobForm, setViewJobForm] = React.useState(false);

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
      await stopJob(props.projectId, props.clusterName, cluster.headNode?.instanceId!, job.job_id);
      await jobMutate();
    });
  };

  const handleViewJobFormCallBack = () => {
    setViewJobForm(!viewJobForm);
  };

  return (
    <>
      {viewJobForm && (
        <JobSubmitForm
          projectId={props.projectId}
          clusterName={props.clusterName}
          instanceId={cluster !== undefined ? cluster.headNode?.instanceId! : cluster}
          handleViewJobFormCallBack={handleViewJobFormCallBack}
        />
      )}
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
                      <Button
                        variant="primary"
                        disabled={
                          cluster !== undefined
                            ? cluster.headNode?.state! !== 'running'
                              ? true
                              : false
                            : true
                        }
                        onClick={() => setViewJobForm(!viewJobForm)}
                      >
                        Submit Job
                      </Button>
                    </SpaceBetween>
                  </Box>
                }
                variant="h2"
              >
                {props.clusterName !== undefined ? `Cluster: ${props.clusterName}` : 'No cluster selected'}
              </Header>
              <Box float="left">
                <SpaceBetween direction="horizontal" size="xs">
                  <Box variant="h3" color="text-label">
                    Head Node Instance ID:{' '}
                    {cluster !== undefined ? cluster.headNode?.instanceId! : 'Loading...'}
                  </Box>
                  <Box variant="h3" color="text-label">
                    State: {cluster !== undefined ? cluster.headNode?.state! : 'Loading...'}
                  </Box>
                </SpaceBetween>
              </Box>
            </SpaceBetween>
          </>
        }
      />
    </>
  );
}
