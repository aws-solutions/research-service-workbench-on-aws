import { useState } from 'react';
import { submitJob } from '../api/hpc-clusters';
import { JobParameters } from '../models/HPC-UI-Types';
import { Box, Button, FormField, Input, Modal, SpaceBetween } from '@awsui/components-react';

interface JobSubmitModalProps {
  projectId: string;
  clusterName: string;
  instanceId: string;
  closeModal: () => void;
}

export default function JobSubmitModal(props: JobSubmitModalProps): JSX.Element {
  const [jobForm, setJobForm] = useState<JobParameters>({
    s3DataFolder: '',
    command: '',
    job_name: '',
    nodes: 0,
    ntasks: 0,
    partition: ''
  });

  const shouldDisableSubmitButton = (): boolean => {
    return !(
      jobForm.s3DataFolder !== '' &&
      jobForm.command !== '' &&
      jobForm.job_name !== '' &&
      jobForm.nodes !== 0 &&
      jobForm.ntasks !== 0 &&
      jobForm.partition !== ''
    );
  };

  const executeSubmitJobProcess = (): void => {
    submitJob(props.projectId, props.clusterName, props.instanceId, jobForm);
    props.closeModal();
  };

  return (
    <Modal
      onDismiss={() => props.closeModal()}
      visible
      closeAriaLabel="Close modal"
      size="medium"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button onClick={() => props.closeModal()}>Cancel</Button>
            <Button disabled={shouldDisableSubmitButton()} onClick={() => executeSubmitJobProcess()}>
              Submit
            </Button>
          </SpaceBetween>
        </Box>
      }
      header="Submit Job"
    >
      <SpaceBetween direction="vertical" size="l">
        <FormField label="Job Name" description="Please choose an identifier for this job.">
          <Input
            onChange={({ detail }) => setJobForm({ ...jobForm, job_name: detail.value })}
            value={jobForm.job_name}
            placeholder="job-name"
          />
        </FormField>
        <FormField label="Nodes" description="Number of nodes for job.">
          <Input
            onChange={({ detail }) => setJobForm({ ...jobForm, nodes: parseInt(detail.value, 10) || 0 })}
            value={jobForm.nodes.toString()}
            inputMode="numeric"
            placeholder="0"
          />
        </FormField>
        <FormField label="Number of Tasks" description="Number of tasks for job.">
          <Input
            onChange={({ detail }) => setJobForm({ ...jobForm, ntasks: parseInt(detail.value, 10) || 0 })}
            value={jobForm.ntasks.toString()}
            inputMode="numeric"
            placeholder="0"
          />
        </FormField>
        <FormField label="Queue" description="Queue where the job will run.">
          <Input
            onChange={({ detail }) => setJobForm({ ...jobForm, partition: detail.value })}
            value={jobForm.partition}
            placeholder="queue0"
          />
        </FormField>
        <FormField
          label="S3 Bucket Data Folder URI"
          description="S3 URI to data folder containing script and data for job."
        >
          <Input
            onChange={({ detail }) => setJobForm({ ...jobForm, s3DataFolder: detail.value })}
            value={jobForm.s3DataFolder}
            placeholder={'s3://my_bucket/my_job/'}
          />
        </FormField>
        <FormField label="Script Name" description="Name of script to run. Must be on S3 bucket.">
          <Input
            onChange={({ detail }) => setJobForm({ ...jobForm, command: detail.value })}
            value={jobForm.command}
            placeholder={'myscript.sh'}
          />
        </FormField>
      </SpaceBetween>
    </Modal>
  );
}
