import { useState } from 'react';
import { submitJob } from '../api/hpc-clusters';
import { JobParameters } from '../models/HPC-UI-Types';
import { Box, Button, FormField, Header, Input, Modal, SpaceBetween } from '@awsui/components-react';

interface JobSubmitFormProps {
  projectId: string;
  clusterName: string;
  instanceId: string;
  handleViewJobFormCallBack: () => void;
}

export default function JobSubmitForm(props: JobSubmitFormProps): JSX.Element {
  const [jobForm, setJobForm] = useState({
    command: '',
    job_name: '',
    nodes: 0,
    ntasks: 0,
    partition: ''
  } as JobParameters);

  const noSubmit = (): boolean => {
    let flag = true;
    if (
      jobForm.command !== '' &&
      jobForm.job_name !== '' &&
      jobForm.nodes !== 0 &&
      jobForm.ntasks !== 0 &&
      jobForm.partition !== ''
    ) {
      flag = false;
    }
    return flag;
  };

  const submitProcess = (): void => {
    submitJob(props.projectId, props.clusterName, props.instanceId, jobForm);
    props.handleViewJobFormCallBack();
  };

  return (
    <Modal
      onDismiss={() => props.handleViewJobFormCallBack()}
      visible
      closeAriaLabel="Close modal"
      size="medium"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button onClick={() => props.handleViewJobFormCallBack()}>Cancel</Button>
            <Button disabled={noSubmit()} onClick={() => submitProcess()}>
              Submit
            </Button>
          </SpaceBetween>
        </Box>
      }
      header="Submit Job"
    >
      <SpaceBetween direction="vertical" size="xxs" key="job-name">
        <Header variant="h2" description="Please choose an identifier for this job.">
          Job Name
        </Header>
        <FormField>
          <Input
            onChange={({ detail }) => setJobForm({ ...jobForm, job_name: detail.value })}
            value={jobForm.job_name}
            placeholder="job-name"
          />
        </FormField>
      </SpaceBetween>

      <SpaceBetween direction="vertical" size="xxs" key="nodes">
        <Header variant="h2" description="Number of nodes for job">
          Nodes
        </Header>
        <FormField>
          <Input
            onChange={({ detail }) => setJobForm({ ...jobForm, nodes: detail.value as unknown as number })}
            value={jobForm.nodes as unknown as string}
            inputMode="numeric"
            placeholder="0"
          />
        </FormField>
      </SpaceBetween>

      <SpaceBetween direction="vertical" size="xxs" key="ntasks">
        <Header variant="h2" description="Number of tasks for job">
          Number of Tasks
        </Header>
        <FormField>
          <Input
            onChange={({ detail }) => setJobForm({ ...jobForm, ntasks: detail.value as unknown as number })}
            value={jobForm.ntasks as unknown as string}
            inputMode="numeric"
            placeholder="0"
          />
        </FormField>
      </SpaceBetween>

      <SpaceBetween direction="vertical" size="xxs" key="partition">
        <Header variant="h2" description="Queue where the job will run.">
          Queue
        </Header>
        <FormField>
          <Input
            onChange={({ detail }) => setJobForm({ ...jobForm, partition: detail.value })}
            value={jobForm.partition}
            placeholder="queue0"
          />
        </FormField>
      </SpaceBetween>

      <SpaceBetween direction="vertical" size="xxs" key="command">
        <Header variant="h2" description={'Path to the script to run.'}>
          Script Path
        </Header>
        <FormField>
          <Input
            onChange={({ detail }) => setJobForm({ ...jobForm, command: detail.value })}
            value={jobForm.command}
            placeholder={'/home/ec2-user/myscript.sh'}
          />
        </FormField>
      </SpaceBetween>
    </Modal>
  );
}
