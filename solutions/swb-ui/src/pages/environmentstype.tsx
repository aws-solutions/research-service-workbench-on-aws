import AwsServiceCatalogProductsTable from '../components/awsServiceCatalogProductsTable';
import WorkspaceTypesTable from '../components/WorkspaceTable';

const environmentstype = (): JSX.Element => {
  return (
    <>
      <div>
        <br></br>
        <br></br>
        <br></br>
      </div>
      <AwsServiceCatalogProductsTable />
      <WorkspaceTypesTable />
    </>
  );
};

export default environmentstype;
