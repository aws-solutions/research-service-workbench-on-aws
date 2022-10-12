import _ from 'lodash';

export interface GenerateDatasetPermissionsRequest {
  roleString: string;
  accessPointArn: string;
  datasetPrefix: string;
}

export interface GenerateDatasetPermissionsResponse {
  iamRoleString: string;
}

export function addDatasetPermissionsToRole(
  request: GenerateDatasetPermissionsRequest
): GenerateDatasetPermissionsResponse {
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
    throw new Error();
    // TODO throw new "not valid IAM role string" error
  }
}
