/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

interface CreateProjectRequest {
  name: string;
  description: string;
  costCenterId: string;
}

export default CreateProjectRequest;
