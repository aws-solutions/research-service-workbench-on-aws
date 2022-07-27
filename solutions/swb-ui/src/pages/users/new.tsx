/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  Box,
  BreadcrumbGroupProps,
  SpaceBetween,
  Form,
  Header,
  Input,
  FormField,
  Button,
  Container
} from '@awsui/components-react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { addUserToRole, createUser } from '../../api/users';
import { emailRegex, nameRegex } from '../../common/utils';
import BaseLayout from '../../components/BaseLayout';
import { CreateUserForm, CreateUserFormValidation } from '../../models/User';

export interface UserProps {
  locale: string;
}

const User: NextPage = () => {
  // App settings constant

  const router = useRouter();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateUserForm>({ email: '' });
  const [formErrors, setFormErrors] = useState<CreateUserFormValidation>({});

  const breadcrumbs: BreadcrumbGroupProps.Item[] = [
    {
      text: 'Service Workbench',
      href: '/'
    },
    {
      text: 'Users',
      href: '/users'
    },
    {
      text: 'Create Researcher',
      href: '/users/new'
    }
  ];

  const validationRules = [
    {
      field: 'email',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: (a: any) => !!a && emailRegex.test(a),
      message: 'A valid email address is required.'
    },
    {
      field: 'email',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: (a: any) => !!a && a.length <= 128,
      message: 'Email cannot be longer than 128 characters'
    },
    {
      field: 'firstName',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: (a: any) => !!a,
      message: 'Given Name is Required'
    },
    {
      field: 'firstName',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: (a: any) => !!a && a.length <= 128,
      message: 'Given Name cannot be longer than 128 characters'
    },
    {
      field: 'firstName',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: (a: any) => !!a && nameRegex.test(a),
      message:
        'Given Name must start with an alphabetic character and can only contain alphanumeric characters (case sensitive) and hyphens.'
    },
    {
      field: 'lastName',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: (a: any) => !!a,
      message: 'Family Name is Required'
    },
    {
      field: 'lastName',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: (a: any) => !!a && a.length <= 128,
      message: 'Family Name cannot be longer than 128 characters'
    },
    {
      field: 'lastName',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: (a: any) => !!a && nameRegex.test(a),
      message:
        'Family Name must start with an alphabetic character and can only contain alphanumeric characters (case sensitive) and hyphens.'
    }
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateField = (field: keyof CreateUserForm, value: any): boolean => {
    for (const rule of validationRules.filter((f) => f.field === field)) {
      // eslint-disable-next-line security/detect-object-injection
      if (!rule.condition(value)) {
        setFormErrors((prevState: CreateUserFormValidation) => ({
          ...prevState,
          [`${field}Error`]: rule.message
        }));
        return false;
      }
    }
    setFormErrors((prevState: CreateUserFormValidation) => ({ ...prevState, [`${field}Error`]: '' }));
    return true;
  };

  const submitForm = async (): Promise<void> => {
    setIsSubmitLoading(true);
    try {
      await createUser(formData);
    } catch {
      setError('There was a problem creating user.');
    }

    try {
      await addUserToRole(formData.email, 'Researcher');
      await router.push({
        pathname: '/users',
        query: {
          message: 'Researcher Created Successfully',
          notificationType: 'success'
        }
      });
    } catch {
      setError('There was a problem assigning user to Researcher role.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  useEffect(() => {
    setDisableSubmit(
      !validationRules.every((rule) => rule.condition(formData[rule.field as keyof CreateUserForm]))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const getContent = (): JSX.Element => {
    return (
      <Container id="userContainer">
        <Box>
          <form onSubmit={(e) => e.preventDefault()}>
            <Form
              id="createUser"
              errorText={error}
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button formAction="none" variant="link" href="/users">
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    disabled={disableSubmit || isSubmitLoading}
                    loading={isSubmitLoading}
                    onClick={async () => await submitForm()}
                  >
                    Create Researcher
                  </Button>
                </SpaceBetween>
              }
              header={
                <Header variant="h1" description="Create a user assigned to the Researcher role">
                  Create Researcher
                </Header>
              }
            >
              <SpaceBetween direction="vertical" size="l">
                <FormField
                  label="Email"
                  constraintText={
                    <>
                      <li>Must be a valid email address.</li>
                      <li>Cannot be longer than 128 characters.</li>
                    </>
                  }
                  errorText={formErrors?.emailError}
                >
                  <Input
                    value={formData?.email || ''}
                    onChange={({ detail: { value } }) => {
                      setFormData({ ...formData, email: value });
                      validateField('email', value);
                    }}
                  />
                </FormField>
                <FormField
                  label="Given Name"
                  constraintText={
                    <>
                      <li>
                        Given Name can only contain alphanumeric characters (case sensitive) and hyphens.
                      </li>
                      <li>It must start with an alphabetic character.</li>
                      <li>Cannot be longer than 128 characters.</li>
                    </>
                  }
                  errorText={formErrors?.givenNameError}
                >
                  <Input
                    value={formData?.firstName || ''}
                    onChange={({ detail: { value } }) => {
                      setFormData({ ...formData, firstName: value });
                      validateField('firstName', value);
                    }}
                  />
                </FormField>
                <FormField
                  label="Family Name"
                  constraintText={
                    <>
                      <li>
                        Family Name can only contain alphanumeric characters (case sensitive) and hyphens.
                      </li>
                      <li>It must start with an alphabetic character.</li>
                      <li>Cannot be longer than 128 characters.</li>
                    </>
                  }
                  errorText={formErrors?.givenNameError}
                >
                  <Input
                    value={formData?.lastName || ''}
                    onChange={({ detail: { value } }) => {
                      setFormData({ ...formData, lastName: value });
                      validateField('lastName', value);
                    }}
                  />
                </FormField>
              </SpaceBetween>
            </Form>
          </form>
        </Box>
      </Container>
    );
  };

  return (
    <BaseLayout breadcrumbs={breadcrumbs} activeHref="/users">
      {getContent()}
    </BaseLayout>
  );
};

export default User;
