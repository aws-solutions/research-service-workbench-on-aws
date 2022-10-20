/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ProjectItem } from '@aws/workbench-core-accounts-ui/lib/esm/models/Project';
import { validateField } from '@aws/workbench-core-swb-common-ui';
import {
  Box,
  SpaceBetween,
  Form,
  Header,
  ExpandableSection,
  Input,
  FormField,
  Button,
  Container,
  Textarea,
  Select,
  TextContent,
  Link
} from '@cloudscape-design/components';
import React, { useEffect, useState } from 'react';
import { CreateDatasetForm, CreateDatasetFormValidation } from '../models/Dataset';
import {
  datasetDescriptionValidationRules,
  datasetNameValidationRules,
  datasetProjectIdValidationRules
} from '../utils';

interface NewDatasetFormProps {
  onFormSubmit: (formData: CreateDatasetForm) => Promise<void>;
  projects: ProjectItem[];
  areProjectsLoading: boolean;
}

export const NewDatasetForm = ({
  onFormSubmit,
  projects,
  areProjectsLoading
}: NewDatasetFormProps): JSX.Element => {
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateDatasetForm>({});
  const [formErrors, setFormErrors] = useState<CreateDatasetFormValidation>({
    descriptionError: '',
    nameError: '',
    projectIdError: ''
  });

  const validateAll = (): boolean => {
    let isValid = validateField<string | undefined, CreateDatasetFormValidation>(
      'nameError',
      setFormErrors,
      datasetNameValidationRules,
      formData.datasetName
    );

    isValid =
      validateField<string | undefined, CreateDatasetFormValidation>(
        'descriptionError',
        setFormErrors,
        datasetDescriptionValidationRules,
        formData.description
      ) && isValid;

    isValid =
      validateField<string | undefined, CreateDatasetFormValidation>(
        'projectIdError',
        setFormErrors,
        datasetProjectIdValidationRules,
        formData.owningProjectId
      ) && isValid;

    return isValid;
  };

  const submitForm = async (): Promise<void> => {
    if (!validateAll()) {
      return;
    }

    setIsSubmitLoading(true);
    try {
      await onFormSubmit(formData);
    } catch {
      setError('There was a problem creating a dataset.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line security/detect-object-injection
    setDisableSubmit(Object.keys(formErrors).some((field) => !!formErrors[field]));
  }, [formErrors]);

  const getBasicDetailsSection = (): JSX.Element => {
    return (
      <ExpandableSection
        defaultExpanded
        variant="container"
        header={
          <Header
            variant="h2"
            description="This Dataset will be added to your Organizational datasets and can be shared according to permissions"
          >
            Internal Dataset Details
          </Header>
        }
      >
        <SpaceBetween direction="vertical" size="l">
          <FormField
            label="Dataset Name"
            description="Create a unique name that you can reference easily in the Organization datasets dashboard"
            constraintText={<>Alphanumeric characters and hyphens.</>}
            errorText={formErrors.nameError}
          >
            <Input
              data-testid="datasetName"
              value={formData?.datasetName || ''}
              onChange={({ detail: { value } }) => {
                setFormData({ ...formData, datasetName: value });
                validateField<string | undefined, CreateDatasetFormValidation>(
                  'nameError',
                  setFormErrors,
                  datasetNameValidationRules,
                  value
                );
              }}
            />
          </FormField>
          <FormField
            label={
              <>
                Dataset description - <i>optional</i>
              </>
            }
            description="Enter a short description of your dataset. Max character limit 500."
            errorText={formErrors.descriptionError}
          >
            <Textarea
              data-testid="datasetDescription"
              onChange={({ detail: { value } }) => {
                setFormData({ ...formData, description: value });
                validateField<string | undefined, CreateDatasetFormValidation>(
                  'descriptionError',
                  setFormErrors,
                  datasetDescriptionValidationRules,
                  value
                );
              }}
              value={formData?.description || ''}
              placeholder="Description"
            />
          </FormField>
          <FormField
            label="Owning Project"
            // TODO: add href
            info={<Link>Info</Link>}
            description="The Project administrators on the selected project will be able to manage access to the dataset. This cannot be changed later."
            errorText={formErrors.projectIdError}
          >
            <Select
              data-testid="datasetProject"
              selectedOption={
                areProjectsLoading
                  ? null
                  : projects
                      .map((p) => ({ label: p.name, value: p.id }))
                      .filter((p) => p.value === formData.owningProjectId)[0] || null
              }
              loadingText="Loading Projects"
              options={projects.map((p) => ({ label: p.name, value: p.id }))}
              selectedAriaLabel={formData?.owningProjectId}
              onChange={({ detail: { selectedOption } }) => {
                setFormData({ ...formData, owningProjectId: selectedOption.value });
                validateField<string | undefined, CreateDatasetFormValidation>(
                  'projectIdError',
                  setFormErrors,
                  datasetProjectIdValidationRules,
                  selectedOption.value
                );
              }}
              statusType={areProjectsLoading ? 'loading' : 'finished'}
            />
          </FormField>
        </SpaceBetween>
      </ExpandableSection>
    );
  };

  const getSharedProjectsSection = (): JSX.Element => {
    return (
      <ExpandableSection
        defaultExpanded
        variant="container"
        header={
          <Header
            variant="h2"
            description="Selected projects are visible to all users that are a part of the project."
          >
            Set permission to share project
          </Header>
        }
      >
        <TextContent>TODO: shared projects component</TextContent>
      </ExpandableSection>
    );
  };

  return (
    <Container>
      <Box>
        <form onSubmit={(e) => e.preventDefault()}>
          <Form
            errorText={error}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button formAction="none" variant="link" href="/datasets">
                  Cancel
                </Button>
                <Button
                  data-testid="datasetCreateSubmit"
                  variant="primary"
                  disabled={disableSubmit || isSubmitLoading}
                  loading={isSubmitLoading}
                  onClick={async () => await submitForm()}
                >
                  Save
                </Button>
              </SpaceBetween>
            }
            header={
              <Header
                data-testid="datasetCreateHeader"
                variant="h1"
                description="Create or import a new Dataset located within your AWS account. All fields are required unless otherwise indicated."
              >
                Create new dataset
              </Header>
            }
          >
            <SpaceBetween direction="vertical" size="l">
              {getBasicDetailsSection()}
              {getSharedProjectsSection()}
            </SpaceBetween>
          </Form>
        </form>
      </Box>
    </Container>
  );
};
