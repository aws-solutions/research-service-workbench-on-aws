/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

interface CreateCostCenterRequest {
  name: string;
  accountId: string;
  description: string;
}

export default CreateCostCenterRequest;
