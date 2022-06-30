/* eslint-disable @typescript-eslint/no-unused-vars */
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
  Select
} from '@awsui/components-react';
import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect, useState } from 'react';
import { layoutLabels } from '../common/labels';
import Navigation from '../components/Navigation';
import EnvTypeCards, { EnvTypeItem } from '../components/EnvTypeCards';
import EnvTypeConfigCards, { EnvTypeConfigItem } from '../components/EnvTypeConfigCards';
import { useSettings } from '../context/SettingsContext';
import { envTypeConfigs, envTypes } from '../api/environments';
export interface EnvironmentProps {
  locale: string;
}

type CreateEnvironmentForm = {
  envTypeId?: string;
  name?: string;
  restrictedCIDR?: string;
  projectId?: string;
  envTypeConfigId?: string;
  description?: string;
};

type CreateEnvironmentFormValidation = {
  envTypeIdError?: string;
  nameError?: string;
  restrictedCIDRError?: string;
  projectIdError?: string;
  envTypeConfigIdError?: string;
  descriptionError?: string;
};

export const getServerSideProps = async ({ locale }: EnvironmentProps): Promise<unknown> => ({
  props: {
    ...(await serverSideTranslations(locale, ['common']))
  }
});

const Environment: NextPage = () => {
  // App settings constant

  const { settings } = useSettings();
  const [preferences] = useState({
    pageSize: 20
  });
  const [selectedEnvType, setselectedEnvType] = useState<EnvTypeItem>();

  const [error, setError] = useState('');

  const OnSelectEnvType = (selection: EnvTypeItem[]) => {
    const selected = (selection && selection.at(0)) || undefined;
    setselectedEnvType(selected);
    setFormData({ ...formData, envTypeId: selected?.id, envTypeConfigId: undefined });
  };
  const OnSelectEnvTypeConfig = (selection: EnvTypeConfigItem[]) => {
    const selected = (selection && selection.at(0)) || undefined;
    setFormData({ ...formData, envTypeConfigId: selected?.id });
  };

  const [formData, setFormData] = useState<CreateEnvironmentForm>({});
  const [formErrors, setFormErrors] = useState<CreateEnvironmentFormValidation>({});
  // eslint-disable-next-line prefer-const
  let [navigationOpen, setNavigationOpen] = useState(false);
  // App layout constants

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
      href: '/environment'
    }
  ];
  const validationRules = [
    {
      field: 'name',
      condition: (a: any) => !!a,
      message: 'Workspace Name is Required'
    },
    {
      field: 'name',
      condition: (a: any) => !!a && a.length <= 128,
      message: 'Workspace Name cannot be longer than 128 characters'
    },
    {
      field: 'restrictedCIDR',
      condition: (a: any) => !!a,
      message: 'restrictedCIDR is Required'
    },
    {
      field: 'restrictedCIDR',
      condition: (a: any) => !!a && a.length <= 128,
      message: 'Restricted CIDR cannot be longer than 128 characters'
    },
    {
      field: 'projectId',
      condition: (a: any) => !!a,
      message: 'Project ID is Required'
    },
    {
      field: 'envTypeId',
      condition: (a: any) => !!a,
      message: 'Compute Platform is Required'
    },
    {
      field: 'envTypeConfigId',
      condition: (a: any) => !!a,
      message: 'Configuration is Required'
    },
    {
      field: 'description',
      condition: (a: any) => !a || a.length <= 128,
      message: 'Description cannot be longer than 128 characters'
    }
  ];
  const validateField = (field: keyof CreateEnvironmentForm): boolean => {
    for (let rule of validationRules.filter((f) => f.field == field)) {
      if (!rule.condition(formData[field])) {
        setFormErrors((prevState) => ({ ...prevState, [`${field}Error`]: rule.message }));
        return false;
      }
    }
    setFormErrors((prevState) => ({ ...prevState, [`${field}Error`]: '' }));
    return true;
  };
  const validateForm = (): boolean => {
    let valid = true;
    valid = validateField('name') && valid;

    valid = validateField('restrictedCIDR') && valid;
    valid = validateField('envTypeConfigId') && valid;
    valid = validateField('envTypeId') && valid;
    valid = validateField('projectId') && valid;
    valid = validateField('description') && valid;
    if (!valid) {
      setError('Fields requirements have not been met.');
    } else setError('');
    return valid;
  };

  const projects = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
    { label: 'Option 4', value: '4' },
    { label: 'Option 5', value: '5' }
  ];
  useEffect(() => {
    validateField('envTypeId');
    validateField('envTypeConfigId');
  }, [formData]);

  return (
    <AppLayout
      id="environment"
      stickyNotifications
      toolsHide
      ariaLabels={layoutLabels}
      navigation={<Navigation activeHref="#/" />}
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
                    <Button formAction="none" variant="link">
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={() => validateForm()}>
                      Save Workspace
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
                        allItems={envTypes}
                        OnSelect={(selected) => OnSelectEnvType(selected.selectedItems)}
                      />
                    </FormField>
                  </ExpandableSection>
                  <ExpandableSection
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
                          onChange={({ detail: { value } }) => setFormData({ ...formData, name: value })}
                          onBlur={() => validateField('name')}
                        />
                      </FormField>
                      <FormField
                        label="Restricted CIDR"
                        description="This research workspace will only be reachable from this CIDR. You can get your CIDR range from your IT Department. The provided default is the CIDR that restricts your IP address."
                        constraintText="Note: an environment config with a hardcoded CIDR will override this value."
                        errorText={formErrors?.restrictedCIDRError}
                      >
                        <Input
                          value={formData?.restrictedCIDR || ''}
                          onChange={({ detail: { value } }) =>
                            setFormData({ ...formData, restrictedCIDR: value })
                          }
                          onBlur={() => validateField('restrictedCIDR')}
                        />
                      </FormField>
                      <FormField label="Project ID" errorText={formErrors?.projectIdError}>
                        <Select
                          selectedOption={
                            projects.filter((p) => p.value === formData?.projectId).at(0) || null
                          }
                          options={projects}
                          selectedAriaLabel={formData?.projectId}
                          onChange={({ detail: { selectedOption } }) => {
                            setFormData({ ...formData, projectId: selectedOption.value });
                          }}
                          onBlur={() => validateField('projectId')}
                        />
                      </FormField>
                      <FormField errorText={formErrors?.envTypeConfigIdError}>
                        <Header>
                          Configuration ({envTypeConfigs.length}) <Link href="#">Info</Link>
                        </Header>
                        <EnvTypeConfigCards
                          allItems={envTypeConfigs}
                          OnSelect={(selected) => OnSelectEnvTypeConfig(selected.selectedItems)}
                        />
                      </FormField>
                      <FormField
                        label="Description - optional"
                        constraintText="Requirements."
                        errorText={formErrors?.descriptionError}
                      >
                        <Textarea
                          onChange={({ detail: { value } }) =>
                            setFormData({ ...formData, description: value })
                          }
                          value={formData?.description || ''}
                          placeholder="This is a placeholder"
                          onBlur={() => validateField('description')}
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
      onNavigationChange={({ detail }) => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        setNavigationOpen(detail.open);
        navigationOpen = true;
      }}
      minContentWidth={1300}
    />
  );
};

export default Environment;
