/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import { InvalidIamRoleError } from '../errors/invalidIamRoleError';

export interface AddDatasetPermissionsToRoleRequest {
  /**
   * A JSON.stringified IAM role
   */
  roleString: string;

  /**
   * The ARN of the access point used to access the dataset
   */
  accessPointArn: string;

  /**
   * the S3 prefix defining the dataset
   */
  datasetPrefix: string;
}

export interface AddDatasetPermissionsToRoleResponse {
  /**
   * The updated JSON.stringified IAM role
   */
  iamRoleString: string;
}

/**
 * Add a policy to an existing IAM role with permissions to modify the defined dataset
 * @param request - {@link AddDatasetPermissionsToRoleRequest}
 * @returns - {@link AddDatasetPermissionsToRoleResponse}
 * @throws {@link InvalidIamRoleError}
 */
export function addDatasetPermissionsToRole(
  request: AddDatasetPermissionsToRoleRequest
): AddDatasetPermissionsToRoleResponse {
  const { roleString, accessPointArn, datasetPrefix } = request;

  const policy = {
    PolicyName: `${datasetPrefix}-permissions`,
    PolicyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: 's3:ListBucket',
          Resource: [accessPointArn],
          Condition: {
            StringLike: {
              's3:prefix': `${datasetPrefix}/*`
            }
          }
        },
        {
          Effect: 'Allow',
          Action: ['s3:GetObject', 's3:PutObject'],
          Resource: `${accessPointArn}/object/${datasetPrefix}/*`
        }
      ]
    }
  };

  try {
    const role = JSON.parse(roleString);

    if (!_.find(role.Properties.Policies, (p) => p.PolicyName === policy.PolicyName)) {
      role.Properties.Policies.push(policy);
    }

    return { iamRoleString: JSON.stringify(role) };
  } catch (e) {
    throw new InvalidIamRoleError();
  }
}
