import AdminView from './AdminView';
import ResearcherView from './ResearcherView';
import { Tabs } from '@awsui/components-react';

export default function Main(): JSX.Element {
  return (
    <Tabs
      tabs={[
        {
          label: 'Admin',
          id: 'admin',
          content: <AdminView />
        },
        {
          label: 'Researcher',
          id: 'researcher',
          content: <ResearcherView />
        }
      ]}
    />
  );
}
