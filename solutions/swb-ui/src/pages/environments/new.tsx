import {
  AppLayout,
  Box,
  BreadcrumbGroup,
  BreadcrumbGroupProps,
  SpaceBetween,
  Form,
  Header,
  ExpandableSection,
  Input,
  FormField,
  Button,
  Container,
  Link,
  Textarea,
  Select,
  Multiselect
} from '@awsui/components-react';
import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useDatasets } from '../../api/datasets';
import { createEnvironment } from '../../api/environments';
import { useEnvTypeConfigs } from '../../api/environmentTypeConfigs';
import { useEnvironmentType } from '../../api/environmentTypes';
import { useProjects } from '../../api/projects';
import { layoutLabels } from '../../common/labels';
import { nameRegex, cidrRegex } from '../../common/utils';
import EnvTypeCards from '../../components/EnvTypeCards';
import EnvTypeConfigCards from '../../components/EnvTypeConfigCards';
import Navigation from '../../components/Navigation';
import { CreateEnvironmentForm, CreateEnvironmentFormValidation } from '../../models/Environment';
import { EnvTypeItem } from '../../models/EnvironmentType';
import { EnvTypeConfigItem } from '../../models/EnvironmentTypeConfig';

export interface EnvironmentProps {
  locale: string;
}

export const getServerSideProps = async ({ locale }: EnvironmentProps): Promise<unknown> => ({
  props: {
    ...(await serverSideTranslations(locale, ['common']))
  }
});

const Environment: NextPage = () => {
  // App settings constant

  const router = useRouter();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(true);
  const [selectedEnvType, setSelectedEnvType] = useState<EnvTypeItem>();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateEnvironmentForm>({});
  const [formErrors, setFormErrors] = useState<CreateEnvironmentFormValidation>({});
  const { envTypes, areEnvTypesLoading } = useEnvironmentType();
  const { envTypeConfigs, areEnvTypeConfigsLoading } = useEnvTypeConfigs(formData?.envTypeId || '');
  const { projects, areProjectsLoading } = useProjects();
  const { datasets, areDatasetsLoading } = useDatasets();

  const breadcrumbs: BreadcrumbGroupProps.Item[] = [
    {
      text: 'Service Workbench',
      href: '/'
    },
    {
      text: 'Workspaces',
      href: '/environments'
    },
    {
      text: 'Create Workspace',
      href: '/environments/new'
    }
  ];
  const validationRules = [
    {
      field: 'name',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: (a: any) => !!a,
      message: 'Workspace Name is Required'
    },
    {
      field: 'name',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: (a: any) => !!a && nameRegex.test(a),
      message:
        'Workspace Name must start with an alphabetic character and can only contain alphanumeric characters (case sensitive) and hyphens.'
    },
    {
      field: 'name',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: (a: any) => !!a && a.length <= 128,
      message: 'Workspace Name cannot be longer than 128 characters'
    },
    {
      field: 'cidr',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: (a: any) => (a ? cidrRegex.test(a) : true),
      message: 'Restricted CIDR must be in the format range:  [1.0.0.0/0 - 255.255.255.255/32].'
    },
    {
      field: 'cidr',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: (a: any) => (a ? a.length <= 128 : true),
      message: 'Restricted CIDR cannot be longer than 128 characters'
    },
    {
      field: 'projectId',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: (a: any) => !!a,
      message: 'Project ID is Required'
    },
    {
      field: 'envTypeId',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: (a: any) => !!a,
      message: 'Compute Platform is Required'
    },
    {
      field: 'envTypeConfigId',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: (a: any) => !!a,
      message: 'Configuration is Required'
    },
    {
      field: 'description',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: (a: any) => !a || a.length <= 500,
      message: 'Description cannot be longer than 500 characters'
    }
  ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateField = (field: keyof CreateEnvironmentForm, value: any): boolean => {
    for (const rule of validationRules.filter((f) => f.field === field)) {
      // eslint-disable-next-line security/detect-object-injection
      if (!rule.condition(value)) {
        setFormErrors((prevState: CreateEnvironmentFormValidation) => ({
          ...prevState,
          [`${field}Error`]: rule.message
        }));
        return false;
      }
    }
    setFormErrors((prevState: CreateEnvironmentFormValidation) => ({ ...prevState, [`${field}Error`]: '' }));
    return true;
  };
  const onSelectEnvType = async (selection: EnvTypeItem[]): Promise<void> => {
    const selected = (selection && selection.at(0)) || undefined;
    setSelectedEnvType(selected);
    setFormData({
      ...formData,
      envTypeId: selected?.id,
      envTypeConfigId: undefined,
      envType: selected?.type,
      datasetIds: []
    });
    validateField('envType', selected?.id);
    validateField('envTypeConfigId', undefined);
  };
  const onSelectEnvTypeConfig = (selection: EnvTypeConfigItem[]): void => {
    const selected = (selection && selection.at(0)) || undefined;
    setFormData({ ...formData, envTypeConfigId: selected?.id });
    validateField('envTypeConfigId', selected?.id);
  };
  const submitForm = async (): Promise<void> => {
    setIsSubmitLoading(true);
    try {
      console.log('formData', formData);
      await createEnvironment(formData);
      await router.push({
        pathname: '/environments',
        query: {
          message: 'Workspace Created Successfully',
          notificationType: 'success'
        }
      });
    } catch {
      setError('There was a problem creating a workspace.');
    } finally {
      setIsSubmitLoading(false);
    }
  };
  const [navigationOpen, setNavigationOpen] = useState(false);

  useEffect(() => {
    setDisableSubmit(
      !validationRules.every((rule) => rule.condition(formData[rule.field as keyof CreateEnvironmentForm]))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  return (
    <AppLayout
      id="environment"
      headerSelector="#header"
      stickyNotifications
      maxContentWidth={Number.MAX_VALUE}
      toolsHide
      ariaLabels={layoutLabels}
      navigationOpen={navigationOpen}
      navigation={<Navigation activeHref="#/" />}
      onNavigationChange={({ detail }) => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        setNavigationOpen(detail.open);
      }}
      breadcrumbs={
        <BreadcrumbGroup items={breadcrumbs} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
      }
      content={
        <Container id="environmentContainer">
          <Box>
            <form onSubmit={(e) => e.preventDefault()}>
              <Form
                id="createEnvironment"
                errorText={error}
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button formAction="none" variant="link" href="/environments">
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      disabled={disableSubmit || isSubmitLoading}
                      loading={isSubmitLoading}
                      onClick={async () => await submitForm()}
                    >
                      Create Workspace
                    </Button>
                  </SpaceBetween>
                }
                header={
                  <Header variant="h1" description="Short Description of create workspaces">
                    Create Research Workspace
                  </Header>
                }
              >
                <SpaceBetween direction="vertical" size="l">
                  <ExpandableSection
                    variant="container"
                    header={
                      <Header variant="h2">
                        Select Compute Platform ({envTypes.length})
                        <Box>Selected: {selectedEnvType?.name || 'None'} </Box>
                      </Header>
                    }
                    defaultExpanded
                  >
                    <FormField errorText={formErrors?.envTypeIdError}>
                      <EnvTypeCards
                        isLoading={areEnvTypesLoading}
                        allItems={envTypes}
                        onSelect={async (selected) => await onSelectEnvType(selected.selectedItems)}
                      />
                    </FormField>
                  </ExpandableSection>
                  <ExpandableSection
                    defaultExpanded
                    variant="container"
                    header={<Header variant="h2">Select Configurations</Header>}
                  >
                    <SpaceBetween direction="vertical" size="l">
                      <FormField
                        label="Workspace Name"
                        constraintText={
                          <>
                            <li>
                              Name can only contain alphanumeric characters (case sensitive) and hyphens.
                            </li>
                            <li>It must start with an alphabetic character.</li>
                            <li>Cannot be longer than 128 characters.</li>
                          </>
                        }
                        errorText={formErrors?.nameError}
                      >
                        <Input
                          value={formData?.name || ''}
                          onChange={({ detail: { value } }) => {
                            setFormData({ ...formData, name: value });
                            validateField('name', value);
                          }}
                        />
                      </FormField>
                      <FormField
                        label="Restricted CIDR (Optional)"
                        description="This research workspace will only be reachable from this CIDR. You can get your CIDR range from your IT Department. The provided default is the CIDR that restricts your IP address."
                        constraintText="Note: an environment config with a hardcoded CIDR will override this value."
                        errorText={formErrors?.cidrError}
                      >
                        <Input
                          value={formData?.cidr || ''}
                          onChange={({ detail: { value } }) => {
                            setFormData({ ...formData, cidr: value });
                            validateField('cidr', value);
                          }}
                        />
                      </FormField>
                      <FormField label="Project ID" errorText={formErrors?.projectIdError}>
                        <Select
                          selectedOption={
                            areProjectsLoading
                              ? null
                              : projects
                                  .map((p) => ({ label: p.name, value: p.id }))
                                  .filter((p) => p.value === formData?.projectId)
                                  .at(0) || null
                          }
                          loadingText="Loading Projects"
                          options={projects.map((p) => ({ label: p.name, value: p.id }))}
                          selectedAriaLabel={formData?.projectId}
                          onChange={({ detail: { selectedOption } }) => {
                            setFormData({ ...formData, projectId: selectedOption.value });
                            validateField('projectId', selectedOption.value);
                          }}
                          statusType={areProjectsLoading ? 'loading' : 'finished'}
                        />
                      </FormField>
                      <FormField
                        label="Dataset"
                        errorText={formErrors?.datasetError}
                        description="Studies that you would like to mount to your workspace"
                      >
                        <Multiselect
                          selectedOptions={
                            areDatasetsLoading
                              ? []
                              : datasets
                                  .map((ds) => ({ label: ds.name, value: ds.id }))
                                  .filter((ds) => formData.datasetIds?.includes(ds.value))
                          }
                          options={datasets.map((ds) => ({ label: ds.name, value: ds.id }))}
                          onChange={(changeDetails) => {
                            const datasetIds = changeDetails.detail.selectedOptions.map((selectOption) => {
                              return selectOption.value;
                            }) as string[];
                            setFormData({
                              ...formData,
                              datasetIds
                            });
                          }}
                          placeholder="Choose options"
                          selectedAriaLabel="Selected"
                        />
                      </FormField>
                      <FormField errorText={formErrors?.envTypeConfigIdError}>
                        <Header>
                          Configuration ({envTypeConfigs.length}) <Link href="#">Info</Link>
                        </Header>
                        <EnvTypeConfigCards
                          isLoading={areEnvTypeConfigsLoading}
                          allItems={envTypeConfigs}
                          onSelect={(selected) => {
                            onSelectEnvTypeConfig(selected.selectedItems);
                          }}
                        />
                      </FormField>
                      <FormField
                        label="Description - optional"
                        constraintText="Description cannot be longer than 500 characters."
                        errorText={formErrors?.descriptionError}
                      >
                        <Textarea
                          onChange={({ detail: { value } }) => {
                            setFormData({ ...formData, description: value });
                            validateField('description', value);
                          }}
                          value={formData?.description || ''}
                          placeholder="Description"
                        />
                      </FormField>
                    </SpaceBetween>
                  </ExpandableSection>
                </SpaceBetween>
              </Form>
            </form>
          </Box>
        </Container>
      }
      contentType="form"
    />
  );
};

export default Environment;
