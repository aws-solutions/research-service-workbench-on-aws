/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(() => {
    return 'sampleUrl';
  })
}));

import { GetKeyPolicyCommand, KMSClient, PutKeyPolicyCommand } from '@aws-sdk/client-kms';
import {
  GetBucketPolicyCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import {
  CreateAccessPointCommand,
  GetAccessPointPolicyCommand,
  PutAccessPointPolicyCommand,
  S3ControlClient
} from '@aws-sdk/client-s3-control';
import { AwsService } from '@aws/workbench-core-base';
import { mockClient } from 'aws-sdk-client-mock';
import { fc, itProp } from 'jest-fast-check';
import { AddStorageExternalEndpointResponse } from './models/addStorageExternalEndpoint';
import { S3DataSetStoragePlugin } from './s3DataSetStoragePlugin';

describe('S3DataSetStoragePlugin', () => {
  const region: string = 'us-east-1';
  const awsCreds = {
    accessKeyId: 'fakeKey',
    secretAccessKey: 'fakeSecret'
  } as const;

  const mockAwsAccountId = '123456789012';
  const name: string = 'bucketName';
  const path: string = 'dataset-prefix';
  const externalEndpointName: string = 'someAccessPoint';
  const mockAccessPointAlias: string = `${externalEndpointName}-s3alias`;
  const externalRoleName: string = 'someRole';
  const accessPointArn: string = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
  const externalRoleArn: string = `arn:aws:iam::123456789012:role/${externalRoleName}`;
  const kmsKeyArn: string = 'arn:aws:kms:us-east-1:123456789012:key/4c3fd651-3841-4000-97f0-11e99f011888';
  const vpcId: string = 'vpc-1234567890abcdefg';
  const endPointUrl: string = `s3://${accessPointArn}/`;

  let aws: AwsService;
  let plugin: S3DataSetStoragePlugin;

  beforeEach(() => {
    aws = new AwsService({
      region,
      credentials: awsCreds
    });

    plugin = new S3DataSetStoragePlugin(aws);
  });
  describe('constructor', () => {
    itProp(
      'class is intialized given the specified parameters',
      [fc.string(), fc.string(), fc.string()],
      (accessKeyId: string, secretAccessKey, kmsKeyArn) => {
        const randomAwsCreds = {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey
        };
        aws = new AwsService({
          region,
          credentials: randomAwsCreds
        });
        const plugin = new S3DataSetStoragePlugin(aws);

        expect(plugin).toHaveProperty('_aws', aws);
      }
    );
  });

  describe('createStorage', () => {
    itProp(
      "Appends '/' to the end of the path when not supplied",
      [fc.string(), fc.string()],
      async (name, path) => {
        const s3Mock = mockClient(S3Client);
        s3Mock.on(PutObjectCommand).resolves({});
        const pathNoSlash: string = path.replace(/\//g, '_');
        const nameNoSlash: string = name.replace(/\//g, '_');
        const s3Uri = await plugin.createStorage(nameNoSlash, pathNoSlash);
        expect(s3Uri).toMatch(`s3://${nameNoSlash}/${pathNoSlash}/`);
      }
    );

    itProp(
      "Doesn't append '/' to the end of the path when supplied",
      [fc.string(), fc.string()],
      async (name, path) => {
        const s3Mock = mockClient(S3Client);
        s3Mock.on(PutObjectCommand).resolves({});
        const pathWithSlash: string = `${path}/`;
        const s3Uri = await plugin.createStorage(name, pathWithSlash);
        expect(s3Uri).toMatch(`s3://${name}/${pathWithSlash}`);
      }
    );
  });

  describe('importStorage', () => {
    itProp(
      "Appends '/' to the end of the path when not supplied",
      [fc.string(), fc.string()],
      async (name, path) => {
        const pathNoSlash: string = path.replace(/\//g, '_');
        const nameNoSlash: string = name.replace(/\//g, '_');
        const s3Uri = await plugin.importStorage(nameNoSlash, pathNoSlash);
        expect(s3Uri).toMatch(`s3://${nameNoSlash}/${pathNoSlash}/`);
      }
    );

    itProp(
      "Doesn't append '/' to the end of the path when supplied",
      [fc.string(), fc.string()],
      async (name, path) => {
        const pathWithSlash: string = `${path}/`;
        const s3Uri = await plugin.importStorage(name, pathWithSlash);
        expect(s3Uri).toMatch(`s3://${name}/${pathWithSlash}`);
      }
    );
  });

  describe('addExternalEndpoint', () => {
    it('does not alter bucket policy if access point delegation already exists.', async () => {
      const s3Mock = mockClient(S3Client);
      s3Mock
        .on(GetBucketPolicyCommand)
        .resolves({
          Policy: `
        {
          "Version": "2012-10-17",
          "Statement": [
              {
                  "Effect": "Allow",
                  "Principal": {
                      "AWS": ["*"]
                  },
                  "Action": ["s3:*"],
                  "Resource": [
                      "arn:aws:s3:::${name}",
                      "arn:aws:s3:::${name}/*"
                  ],
                  "Condition": {
                      "StringEquals": {
                          "s3:DataAccessPointAccount": "123456789012"
                      }
                  }
              }
          ]
        }
      `
        })
        .on(PutBucketPolicyCommand)
        .resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn,
          Alias: mockAccessPointAlias
        })
        .on(GetAccessPointPolicyCommand)
        .resolves({})
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint({
          name,
          path,
          externalEndpointName,
          ownerAccountId: mockAwsAccountId,
          accessLevel: 'read-only',
          externalRoleName
        })
      ).resolves.toMatchObject<AddStorageExternalEndpointResponse>({
        data: {
          connections: {
            endPointUrl: `s3://${accessPointArn}`,
            endPointAlias: mockAccessPointAlias
          }
        }
      });
      expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(1);
      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(0);
    });

    it('adds a bucket policy statement when the account ID is different.', async () => {
      const s3Mock = mockClient(S3Client);
      s3Mock
        .on(GetBucketPolicyCommand)
        .resolves({
          Policy: `
        {
          "Version": "2012-10-17",
          "Statement": [
              {
                  "Effect": "Allow",
                  "Principal": {
                      "AWS": "*"
                  },
                  "Action": "s3:*",
                  "Resource": [
                      "arn:aws:s3:::${name}",
                      "arn:aws:s3:::${name}/*"
                  ],
                  "Condition": {
                      "StringEquals": {
                          "s3:DataAccessPointAccount": "000000000000"
                      }
                  }
              }
          ]
        }
      `
        })
        .on(PutBucketPolicyCommand)
        .resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn,
          Alias: mockAccessPointAlias
        })
        .on(GetAccessPointPolicyCommand)
        .resolves({})
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint({
          name,
          path,
          externalEndpointName,
          ownerAccountId: mockAwsAccountId,
          accessLevel: 'read-only',
          externalRoleName
        })
      ).resolves.toMatchObject<AddStorageExternalEndpointResponse>({
        data: {
          connections: {
            endPointUrl: `s3://${accessPointArn}`,
            endPointAlias: mockAccessPointAlias
          }
        }
      });
      expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(1);
      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Bucket).toEqual(name);
      expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":"s3:*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"000000000000"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]},{"Action":"s3:*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]}],"Version":"2012-10-17"}'
      );
    });

    it('throws when the arn for the access point is invalid. ', async () => {
      const endPointNameNoColon = externalEndpointName.replace(/\:/g, '_');
      const accessPointArn = `arn:s3:us-east-1:123456789012:accesspoint/${endPointNameNoColon}`;

      const s3Mock = mockClient(S3Client);
      s3Mock
        .on(GetBucketPolicyCommand)
        .resolves({
          Policy: `
        {
          "Version": "2012-10-17",
          "Statement": [
              {
                  "Effect": "Allow",
                  "Principal": {
                      "AWS": "*"
                  },
                  "Action": "s3:*",
                  "Resource": [
                      "arn:aws:s3:::${name}",
                      "arn:aws:s3:::${name}/*"
                  ],
                  "Condition": {
                      "StringEquals": {
                          "s3:DataAccessPointAccount": "123456789012"
                      }
                  }
              }
          ]
        }
      `
        })
        .on(PutBucketPolicyCommand)
        .resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn
        })
        .on(GetAccessPointPolicyCommand)
        .resolves({})
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint({
          name,
          path,
          externalEndpointName: endPointNameNoColon,
          ownerAccountId: mockAwsAccountId,
          accessLevel: 'read-only',
          externalRoleName
        })
      ).rejects.toThrow(new Error("Expected an arn with at least six ':' separated values."));
      expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(0);
      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(0);
    });

    it('Creates a bucket policy if none exists.', async () => {
      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn,
          Alias: mockAccessPointAlias
        })
        .on(GetAccessPointPolicyCommand)
        .resolves({})
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint({
          name,
          path,
          externalEndpointName,
          ownerAccountId: mockAwsAccountId,
          accessLevel: 'read-only',
          externalRoleName
        })
      ).resolves.toMatchObject<AddStorageExternalEndpointResponse>({
        data: {
          connections: {
            endPointUrl: `s3://${accessPointArn}`,
            endPointAlias: mockAccessPointAlias
          }
        }
      });

      expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(1);
      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
    });

    it('Does not create an access policy if one exists.', async () => {
      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn,
          Alias: mockAccessPointAlias
        })
        .on(GetAccessPointPolicyCommand)
        .resolves({
          Policy: `
      {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "Statement1",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "${externalRoleArn}"
                },
                "Action": "s3:ListBucket",
                "Resource": "${accessPointArn}",
                "Condition": {
                  "StringLike": {
                    "s3:prefix": "${path}/*"
                  }
                }
            },
            {
                "Sid": "Statement2",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "${externalRoleArn}"
                },
                "Action": "s3:GetObject",
                "Resource": "${accessPointArn}/object/${path}/*"
            }
        ]
    }
        `
        })
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint({
          name,
          path,
          externalEndpointName,
          ownerAccountId: mockAwsAccountId,
          accessLevel: 'read-only',
          externalRoleName: externalRoleArn
        })
      ).resolves.toMatchObject<AddStorageExternalEndpointResponse>({
        data: {
          connections: {
            endPointUrl: `s3://${accessPointArn}`,
            endPointAlias: mockAccessPointAlias
          }
        }
      });
      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(0);
    });

    it('updates the list bucket access point policy if the principal is missing', async () => {
      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn,
          Alias: mockAccessPointAlias
        })
        .on(GetAccessPointPolicyCommand)
        .resolves({
          Policy: `
      {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "Statement1",
                "Effect": "Allow",
                "Action": "s3:ListBucket",
                "Resource": "${accessPointArn}",
                "Condition": {
                  "StringLike": {
                    "s3:prefix": "${path}/*"
                  }
                }
            },
            {
                "Sid": "Statement2",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "${externalRoleArn}"
                },
                "Action": "s3:GetObject",
                "Resource": "${accessPointArn}/object/${path}/*"
            }
        ]
    }
        `
        })
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint({
          name,
          path,
          externalEndpointName,
          ownerAccountId: mockAwsAccountId,
          accessLevel: 'read-only',
          externalRoleName: externalRoleArn
        })
      ).resolves.toMatchObject<AddStorageExternalEndpointResponse>({
        data: {
          connections: {
            endPointUrl: `s3://${accessPointArn}`,
            endPointAlias: mockAccessPointAlias
          }
        }
      });

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.AccountId).toEqual(
        '123456789012'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Name).toEqual(
        externalEndpointName
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":"s3:ListBucket","Condition":{"StringLike":{"s3:prefix":"dataset-prefix/*"}},"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someAccessPoint","Sid":"Statement1"},{"Action":"s3:GetObject","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someAccessPoint/object/dataset-prefix/*","Sid":"Statement2"}],"Version":"2012-10-17"}'
      );
    });

    it('updates the get/put bucket access point policy if the prinicpal is missing', async () => {
      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn,
          Alias: mockAccessPointAlias
        })
        .on(GetAccessPointPolicyCommand)
        .resolves({
          Policy: `
      {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "Statement1",
                "Effect": "Allow",
                "Principal": {
                  "AWS": "${externalRoleArn}"
                },
                "Action": "s3:ListBucket",
                "Resource": "${accessPointArn}",
                "Condition": {
                  "StringLike": {
                    "s3:prefix": "${path}/*"
                  }
                }
            },
            {
                "Sid": "Statement2",
                "Effect": "Allow",
                "Action": "s3:GetObject",
                "Resource": "${accessPointArn}/object/${path}/*"
            }
        ]
    }
        `
        })
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint({
          name,
          path,
          externalEndpointName,
          ownerAccountId: mockAwsAccountId,
          accessLevel: 'read-only',
          externalRoleName: externalRoleArn
        })
      ).resolves.toMatchObject<AddStorageExternalEndpointResponse>({
        data: {
          connections: {
            endPointUrl: `s3://${accessPointArn}`,
            endPointAlias: mockAccessPointAlias
          }
        }
      });

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.AccountId).toEqual(
        '123456789012'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Name).toEqual(
        externalEndpointName
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":"s3:GetObject","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someAccessPoint/object/dataset-prefix/*","Sid":"Statement2"},{"Action":"s3:ListBucket","Condition":{"StringLike":{"s3:prefix":"dataset-prefix/*"}},"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someAccessPoint","Sid":"Statement1"}],"Version":"2012-10-17"}'
      );
    });

    it('gives the get/put bucket access point policy s3:putBucket permission if the access level is read_write', async () => {
      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn,
          Alias: mockAccessPointAlias
        })
        .on(GetAccessPointPolicyCommand)
        .resolves({})
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint({
          name,
          path,
          externalEndpointName,
          ownerAccountId: mockAwsAccountId,
          accessLevel: 'read-write',
          externalRoleName: externalRoleArn
        })
      ).resolves.toMatchObject<AddStorageExternalEndpointResponse>({
        data: {
          connections: {
            endPointUrl: `s3://${accessPointArn}`,
            endPointAlias: mockAccessPointAlias
          }
        }
      });

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.AccountId).toEqual(
        '123456789012'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Name).toEqual(
        externalEndpointName
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":"s3:ListBucket","Condition":{"StringLike":{"s3:prefix":"dataset-prefix/*"}},"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someAccessPoint"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someAccessPoint/object/dataset-prefix/*"}],"Version":"2012-10-17"}'
      );
    });

    it('creates an internet access point if the vpc id is not specified.', async () => {
      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});
      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn,
          Alias: mockAccessPointAlias
        })
        .on(GetAccessPointPolicyCommand)
        .resolves({})
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint({
          name,
          path,
          externalEndpointName,
          ownerAccountId: mockAwsAccountId,
          accessLevel: 'read-only',
          externalRoleName: externalRoleArn
        })
      ).resolves.toMatchObject<AddStorageExternalEndpointResponse>({
        data: {
          connections: {
            endPointUrl: `s3://${accessPointArn}`,
            endPointAlias: mockAccessPointAlias
          }
        }
      });
      expect(
        s3ControlMock.commandCalls(
          CreateAccessPointCommand,
          {
            Name: externalEndpointName,
            Bucket: name,
            AccountId: mockAwsAccountId
          },
          true
        )
      ).toHaveLength(1);
      expect(
        s3ControlMock.commandCalls(
          CreateAccessPointCommand,
          {
            Name: externalEndpointName,
            Bucket: name,
            AccountId: mockAwsAccountId,
            VpcConfiguration: {
              VpcId: vpcId
            }
          },
          true
        )
      ).toHaveLength(0);
    });

    it('creates a VPC access point if the vpc id is specified.', async () => {
      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});
      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn,
          Alias: mockAccessPointAlias
        })
        .on(GetAccessPointPolicyCommand)
        .resolves({})
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint({
          name,
          path,
          externalEndpointName,
          ownerAccountId: mockAwsAccountId,
          accessLevel: 'read-only',
          externalRoleName: externalRoleArn,
          vpcId
        })
      ).resolves.toMatchObject<AddStorageExternalEndpointResponse>({
        data: {
          connections: {
            endPointUrl: `s3://${accessPointArn}`,
            endPointAlias: mockAccessPointAlias
          }
        }
      });
      expect(
        s3ControlMock.commandCalls(
          CreateAccessPointCommand,
          {
            Name: externalEndpointName,
            Bucket: name,
            AccountId: mockAwsAccountId
          },
          true
        )
      ).toHaveLength(0);
      expect(
        s3ControlMock.commandCalls(
          CreateAccessPointCommand,
          {
            Name: externalEndpointName,
            Bucket: name,
            AccountId: mockAwsAccountId,
            VpcConfiguration: {
              VpcId: vpcId
            }
          },
          true
        )
      ).toHaveLength(1);
    });

    it("doesn't add a key policy if the key arn is not specified.", async () => {
      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});
      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn,
          Alias: mockAccessPointAlias
        })
        .on(GetAccessPointPolicyCommand)
        .resolves({})
        .on(PutAccessPointPolicyCommand)
        .resolves({});
      const kmsMock = mockClient(KMSClient);
      kmsMock.on(GetKeyPolicyCommand).resolves({}).on(PutKeyPolicyCommand).resolves({});
      await expect(
        plugin.addExternalEndpoint({
          name,
          path,
          externalEndpointName,
          ownerAccountId: mockAwsAccountId,
          accessLevel: 'read-only',
          externalRoleName: externalRoleArn
        })
      ).resolves.toMatchObject<AddStorageExternalEndpointResponse>({
        data: {
          connections: {
            endPointUrl: `s3://${accessPointArn}`,
            endPointAlias: mockAccessPointAlias
          }
        }
      });
      expect(kmsMock.commandCalls(GetKeyPolicyCommand)).toHaveLength(0);
      expect(kmsMock.commandCalls(PutKeyPolicyCommand)).toHaveLength(0);
    });

    it('adds a key policy if the key arn is specified, and no key policy exists.', async () => {
      const name: string = 'bucketName';
      const path: string = 'dataset-prefix';
      const externalRoleName: string = 'someRole';
      const externalEndpointName: string = 'someEndpoint';
      const mockAccessPointAlias: string = `${externalEndpointName}-s3alias`;
      const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`;
      const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
      const kmsKeyArn = 'arn:aws:kms:us-east-1:123456789012:key/4c3fd651-3841-4000-97f0-11e99f011888';
      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});
      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn,
          Alias: mockAccessPointAlias
        })
        .on(GetAccessPointPolicyCommand)
        .resolves({})
        .on(PutAccessPointPolicyCommand)
        .resolves({});
      const kmsMock = mockClient(KMSClient);
      kmsMock.on(GetKeyPolicyCommand).resolves({}).on(PutKeyPolicyCommand).resolves({});
      await expect(
        plugin.addExternalEndpoint({
          name,
          path,
          externalEndpointName,
          ownerAccountId: mockAwsAccountId,
          accessLevel: 'read-only',
          externalRoleName: externalRoleArn,
          kmsKeyArn
        })
      ).resolves.toMatchObject<AddStorageExternalEndpointResponse>({
        data: {
          connections: {
            endPointUrl: `s3://${accessPointArn}`,
            endPointAlias: mockAccessPointAlias
          }
        }
      });
      expect(kmsMock.commandCalls(GetKeyPolicyCommand)).toHaveLength(1);
      expect(kmsMock.commandCalls(PutKeyPolicyCommand)).toHaveLength(1);
    });

    it('adds a key policy if the key arn is specified, and only a grant policy exists.', async () => {
      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});
      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn,
          Alias: mockAccessPointAlias
        })
        .on(GetAccessPointPolicyCommand)
        .resolves({})
        .on(PutAccessPointPolicyCommand)
        .resolves({});
      const kmsMock = mockClient(KMSClient);
      kmsMock
        .on(GetKeyPolicyCommand)
        .resolves({
          Policy: `
        {
          "Version": "2012-10-17",
          "Statement": [
              {
                "Effect": "Allow",
                "Principal": {
                  "AWS":"arn:aws:iam::123456789012:root"
                },
                "Action": [
                  "kms:CreateGrant",
                  "kms:ListGrant",
                  "kms:RevokeGrant"
                ],
                "Resource": "*",
                "Condition": {
                  "Bool": {
                    "kms:GrantIsForAWSResource": "true"
                  }
                }
              }
          ]
        }`
        })
        .on(PutKeyPolicyCommand)
        .resolves({});
      await expect(
        plugin.addExternalEndpoint({
          name,
          path,
          externalEndpointName,
          ownerAccountId: mockAwsAccountId,
          accessLevel: 'read-only',
          externalRoleName: externalRoleArn,
          kmsKeyArn
        })
      ).resolves.toMatchObject<AddStorageExternalEndpointResponse>({
        data: {
          connections: {
            endPointUrl: `s3://${accessPointArn}`,
            endPointAlias: mockAccessPointAlias
          }
        }
      });
      expect(kmsMock.commandCalls(GetKeyPolicyCommand)).toHaveLength(1);
      expect(kmsMock.commandCalls(PutKeyPolicyCommand)).toHaveLength(1);
      expect(kmsMock.commandCalls(PutKeyPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":["kms:CreateGrant","kms:ListGrant","kms:RevokeGrant"],"Condition":{"Bool":{"kms:GrantIsForAWSResource":"true"}},"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:root"},"Resource":"*"},{"Action":["kms:Encrypt","kms:Decrypt","kms:ReEncrypt*","kms:GenerateDataKey*","kms:DescribeKey"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:root"},"Resource":"*"}],"Version":"2012-10-17"}'
      );
    });

    it('does not add a key policy if the key arn is specified, and both usage and resource grant statements exist.', async () => {
      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});
      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn,
          Alias: mockAccessPointAlias
        })
        .on(GetAccessPointPolicyCommand)
        .resolves({})
        .on(PutAccessPointPolicyCommand)
        .resolves({});
      const kmsMock = mockClient(KMSClient);
      kmsMock
        .on(GetKeyPolicyCommand)
        .resolves({
          Policy: `
        {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "AWS": "arn:aws:iam::123456789012:root"
              },
              "Action": [
                "kms:Encrypt",
                "kms:Decrypt",
                "kms:ReEncrypt*",
                "kms:GenerateDataKey*",
                "kms:DescribeKey"
              ],
              "Resource": "*"
            },
            {
              "Effect": "Allow",
              "Principal": {
                "AWS":"arn:aws:iam::123456789012:root"
              },
              "Action": [
                "kms:CreateGrant",
                "kms:ListGrant",
                "kms:RevokeGrant"
              ],
              "Resource": "*",
              "Condition": {
                "Bool": {
                  "kms:GrantIsForAWSResource": "true"
                }
              }
            }
          ]
      }`
        })
        .on(PutKeyPolicyCommand)
        .resolves({});
      await expect(
        plugin.addExternalEndpoint({
          name,
          path,
          externalEndpointName,
          ownerAccountId: mockAwsAccountId,
          accessLevel: 'read-only',
          externalRoleName: externalRoleArn,
          kmsKeyArn
        })
      ).resolves.toMatchObject<AddStorageExternalEndpointResponse>({
        data: {
          connections: {
            endPointUrl: `s3://${accessPointArn}`,
            endPointAlias: mockAccessPointAlias
          }
        }
      });
      expect(kmsMock.commandCalls(GetKeyPolicyCommand)).toHaveLength(1);
      expect(kmsMock.commandCalls(PutKeyPolicyCommand)).toHaveLength(0);
    });

    it('adds a key policy if the key arn is specified, and only a usage policy exists.', async () => {
      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});
      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn,
          Alias: mockAccessPointAlias
        })
        .on(GetAccessPointPolicyCommand)
        .resolves({})
        .on(PutAccessPointPolicyCommand)
        .resolves({});
      const kmsMock = mockClient(KMSClient);
      kmsMock
        .on(GetKeyPolicyCommand)
        .resolves({
          Policy: `
        {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "AWS": "arn:aws:iam::123456789012:root"
              },
              "Action": [
                "kms:Encrypt",
                "kms:Decrypt",
                "kms:ReEncrypt*",
                "kms:GenerateDataKey*",
                "kms:DescribeKey"
              ],
              "Resource": "*"
            }
          ]
      }`
        })
        .on(PutKeyPolicyCommand)
        .resolves({});
      await expect(
        plugin.addExternalEndpoint({
          name,
          path,
          externalEndpointName,
          ownerAccountId: mockAwsAccountId,
          accessLevel: 'read-only',
          externalRoleName: externalRoleArn,
          kmsKeyArn
        })
      ).resolves.toMatchObject<AddStorageExternalEndpointResponse>({
        data: {
          connections: {
            endPointUrl: `s3://${accessPointArn}`,
            endPointAlias: mockAccessPointAlias
          }
        }
      });
      expect(kmsMock.commandCalls(GetKeyPolicyCommand)).toHaveLength(1);
      expect(kmsMock.commandCalls(PutKeyPolicyCommand)).toHaveLength(1);
      expect(kmsMock.commandCalls(PutKeyPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":["kms:Encrypt","kms:Decrypt","kms:ReEncrypt*","kms:GenerateDataKey*","kms:DescribeKey"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:root"},"Resource":"*"},{"Action":["kms:CreateGrant","kms:ListGrant","kms:RevokeGrant"],"Condition":{"Bool":{"kms:GrantIsForAWSResource":"true"}},"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:root"},"Resource":"*"}],"Version":"2012-10-17"}'
      );
    });
  });

  describe('addRoleToEndpoint', () => {
    it('updates KMS key policy if key arn is provided.', async () => {
      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock.on(GetAccessPointPolicyCommand).resolves({}).on(PutAccessPointPolicyCommand).resolves({});
      const kmsMock = mockClient(KMSClient);
      kmsMock.on(GetKeyPolicyCommand).resolves({}).on(PutKeyPolicyCommand).resolves({});

      await expect(
        plugin.addRoleToExternalEndpoint(
          name,
          path,
          externalEndpointName,
          externalRoleArn,
          endPointUrl,
          kmsKeyArn
        )
      ).resolves.toBeUndefined();
      expect(s3ControlMock.commandCalls(GetAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(kmsMock.commandCalls(GetKeyPolicyCommand)).toHaveLength(1);
      expect(kmsMock.commandCalls(PutKeyPolicyCommand)).toHaveLength(1);
    });

    it('does not update KMS if no key is provided.', async () => {
      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock.on(GetAccessPointPolicyCommand).resolves({}).on(PutAccessPointPolicyCommand).resolves({});
      const kmsMock = mockClient(KMSClient);
      kmsMock.on(GetKeyPolicyCommand).resolves({});

      await expect(
        plugin.addRoleToExternalEndpoint(name, path, externalEndpointName, externalRoleName, endPointUrl)
      ).resolves.toBeUndefined();
      expect(s3ControlMock.commandCalls(GetAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(kmsMock.commandCalls(GetKeyPolicyCommand)).toHaveLength(0);
    });
  });

  describe('removeRoleFromEndpoint', () => {
    itProp(
      'throws not implemented error.',
      [fc.string(), fc.string(), fc.string()],
      async (name, externalEndpointName, externalRoleName) => {
        await expect(
          plugin.removeRoleFromExternalEndpoint(name, externalEndpointName, externalRoleName)
        ).rejects.toEqual(new Error('Method not implemented.'));
      }
    );
  });

  describe('createPresignedUploadUrl', () => {
    it('returns a presigned url for a single part file upload', async () => {
      const ttl = 3600;
      const fileName = 'test.txt';

      const url = await plugin.createPresignedUploadUrl(
        { name: path, storageName: name, path, storageType: 'S3' },
        fileName,
        ttl
      );

      expect(url).toBe('sampleUrl');
    });
  });

  describe('createPresignedMultiPartUploadUrls', () => {
    itProp('throws not implemented error.', [fc.string(), fc.nat(), fc.nat()], async (name, parts, ttl) => {
      await expect(plugin.createPresignedMultiPartUploadUrls(name, parts, ttl)).rejects.toEqual(
        new Error('Method not implemented.')
      );
    });
  });

  describe('_awsAccountIdFromArn', () => {
    it('throws when the supplied arn contains an empty accountId', () => {
      // @tsignore
      expect(() => plugin[`_awsAccountIdFromArn`]('arn:aws:s3:us-east-1::accessPoint/someName')).toThrow(
        new Error('Expected an arn with an AWS AccountID however AWS AccountID field is empty.')
      );
    });
  });
});
