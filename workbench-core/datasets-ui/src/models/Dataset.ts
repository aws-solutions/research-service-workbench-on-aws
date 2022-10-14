/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export interface DatasetItem {
  path: string;
  awsAccountId: string;
  storageType: string;
  id: string;
  name: string;
  storageName: string;
}

interface DatasetMetadata {
  owningProjectId?: string;
}

export interface CreateDatasetForm {
  name?: string;
  description?: string;
  metadata?: DatasetMetadata;
}

export interface CreateDatasetFormValidation {
  nameError: string;
  descriptionError: string;
  projectIdError: string;
}
