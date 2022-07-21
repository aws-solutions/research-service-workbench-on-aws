import { useState, useEffect } from 'react';
import { useCollection } from '@awsui/collection-hooks';
import { TableEmptyDisplay } from '../common/tableEmptyState';
import { TableSelectDisplay } from '../common/tableSelectState';
import { columnDefinitions } from '../hpc-table-config/jobsColumnDefinitions';
import { filteringProperties } from '../hpc-table-config/jobsFilteringProperties';
import { useCluster, useJobQueue, stopJob } from '../api/hpc-clusters';
import { Box, Button, Header, Pagination, SpaceBetween, Table } from '@awsui/components-react';
import JobSubmitModal from './JobSubmitModal';

interface JobsTableProps {
  projectId: string;
  clusterName: string;
}

export default function JobsTable(props: JobsTableProps): JSX.Element {
  const cluster = useCluster(props.projectId, props.clusterName);

  const [isJobsLoading, setJobsLoading] = useState(false);

  const { jobs, jobisValidating, jobMutate } = useJobQueue(
    props.projectId,
    props.clusterName,
    cluster !== undefined
      ? cluster.headNode?.state === 'running'
        ? cluster.headNode?.instanceId!
        : undefined!
      : undefined!
  );

  useEffect(() => {
    if (props.clusterName === undefined) {
      setJobsLoading(false);
    } else if (cluster === undefined || (jobs.length === 0 && jobisValidating)) {
      setJobsLoading(true);
    } else {
      setJobsLoading(false);
    }
  }, [props.clusterName, cluster, jobs, jobisValidating]);

  const [showJobModal, setShowJobModal] = useState(false);

  const [jobsTablePreferences] = useState({ pageSize: 4 });

  const emptyItemType: string = 'job';
  const selectItemType: string = 'cluster';

  const { items, collectionProps, paginationProps } = useCollection(jobs, {
    propertyFiltering: {
      filteringProperties: filteringProperties,
      empty:
        props.clusterName === undefined
          ? TableSelectDisplay(selectItemType)
          : TableEmptyDisplay(emptyItemType)
    },
    selection: {
      trackBy: 'job_id'
    },
    pagination: { pageSize: jobsTablePreferences.pageSize },
    sorting: {}
  });

  const shouldDisableStopJobButton = (): boolean => {
    if (collectionProps.selectedItems?.length !== 0) {
      return collectionProps.selectedItems!.some((job) =>
        ['STOPPING', 'FAILED', 'COMPLETED', 'CANCELLED'].includes(job?.job_state)
      );
    }
    return true;
  };

  const executeStopJob = async (): Promise<void> => {
    collectionProps.selectedItems?.forEach(async (job) => {
      await stopJob(props.projectId, props.clusterName, cluster.headNode?.instanceId!, job.job_id);
      await jobMutate();
    });
  };

  const closeModal = () => {
    setShowJobModal(false);
  };

  return (
    <>
      {showJobModal && (
        <JobSubmitModal
          projectId={props.projectId}
          clusterName={props.clusterName}
          instanceId={cluster !== undefined ? cluster.headNode?.instanceId! : undefined!}
          closeModal={closeModal}
        />
      )}
      <Table
        {...collectionProps}
        selectionType="multi"
        selectedItems={collectionProps.selectedItems}
        columnDefinitions={columnDefinitions}
        loading={isJobsLoading}
        loadingText="Loading jobs..."
        items={items}
        pagination={<Pagination {...paginationProps} />}
        header={
          <SpaceBetween direction="vertical" size="xs">
            <Header
              counter={
                collectionProps.selectedItems?.length !== 0
                  ? `(${collectionProps.selectedItems?.length}/${jobs.length})`
                  : `(${jobs.length})`
              }
              actions={
                <Box float="right">
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button disabled={shouldDisableStopJobButton()} onClick={() => executeStopJob()}>
                      Stop Job
                    </Button>
                    <Button
                      variant="primary"
                      disabled={cluster !== undefined ? cluster.headNode?.state! !== 'running' : true}
                      onClick={() => setShowJobModal(true)}
                    >
                      Submit Job
                    </Button>
                  </SpaceBetween>
                </Box>
              }
              variant="h2"
            >
              Job Management
            </Header>
            <Box float="left">
              <SpaceBetween direction="horizontal" size="xs">
                <Box variant="h3" color="text-label">
                  Head Node Instance ID:{' '}
                  {props.clusterName !== undefined
                    ? cluster !== undefined
                      ? cluster.headNode?.instanceId!
                      : 'Loading...'
                    : 'N/A'}
                </Box>
                <Box variant="h3" color="text-label">
                  State:{' '}
                  {props.clusterName !== undefined
                    ? cluster !== undefined
                      ? cluster.headNode?.state!
                      : 'Loading...'
                    : 'N/A'}
                </Box>
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        }
      />
    </>
  );
}
