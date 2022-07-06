import ClustersTable from './components/ClustersTable';
import TopBar from './components/TopBar';
import JobsTable from './components/JobsTable';
import { SpaceBetween } from '@awsui/components-react';

import React from 'react';

function App() {
  return (
    <div className="App">
      <SpaceBetween direction="vertical" size="xs">
        <TopBar></TopBar>
        <ClustersTable projectId="proj-123" />
        <JobsTable projectId="proj-123" clusterName="hosting-cluster"></JobsTable>
      </SpaceBetween>
    </div>
  );
}

export default App;
