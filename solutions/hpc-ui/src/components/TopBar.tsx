import { Box, Select, ColumnLayout, SpaceBetween } from '@awsui/components-react';
import { useCollection } from '@awsui/collection-hooks';
import React from 'react';
import ClustersTable from './ClustersTable';
import { OptionDefinition } from '@awsui/components-react/internal/components/option/interfaces';

export default function TopBar(): JSX.Element {
  /*const [projects, setClusters] = React.useState([])

    React.useEffect(() => {
      getProjects().then(items => setClusters(items));
    },[]);*/

  const [selectedOption, setSelectedOption] = React.useState({} as OptionDefinition);

  return (
    <>
      <SpaceBetween direction="vertical" size="xs">
        <div>
          <Box float="left">
            <SpaceBetween direction="horizontal" size="xs">
              <Box variant="h3" textAlign="right">
                Projects
              </Box>
              <Select
                selectedOption={selectedOption}
                onChange={({ detail }) => setSelectedOption(detail.selectedOption!)}
                options={[{ label: 'proj-123', value: 'proj-123' }]}
                placeholder="Choose a project"
                selectedAriaLabel="Selected"
                empty="No projects"
              />
            </SpaceBetween>
          </Box>
          <Box float="right">
            <img src={require('../assets/hpc_logo.png')} alt={'HPC Logo'} />
          </Box>
        </div>
      </SpaceBetween>
    </>
  );
}
