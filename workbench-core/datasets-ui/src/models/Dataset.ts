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
  datasetName?: string;
  description?: string;
  customMetadata?: DatasetMetadata;
}

export interface CreateDatasetFormValidation {
  nameError: string;
  descriptionError: string;
  projectIdError: string;
}
