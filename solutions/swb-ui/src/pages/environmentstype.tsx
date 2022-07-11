import { AppLayout } from '@awsui/components-react';
import { useState } from 'react';
import AwsServiceCatalogProductsTable from '../components/awsServiceCatalogProductsTable';
import Navigation from '../components/Navigation';
import WorkspaceTypesTable from '../components/WorkspaceTable';

const Environmentstype = (): JSX.Element => {
  // eslint-disable-next-line prefer-const
  let [navigationOpen, setNavigationOpen] = useState(false);
  return (
    <>
      <AppLayout
        headerSelector="#header"
        navigationOpen={navigationOpen}
        navigation={<Navigation activeHref="#/" />}
        onNavigationChange={({ detail }) => {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          setNavigationOpen(detail.open);
          navigationOpen = true;
        }}
        content={
          <>
            <br />
            <br />
            <AwsServiceCatalogProductsTable />
            <WorkspaceTypesTable />
          </>
        }
      ></AppLayout>
    </>
  );
};

export default Environmentstype;
