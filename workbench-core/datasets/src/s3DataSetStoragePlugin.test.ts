/* eslint-disable max-lines */
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
import { mockClient } from 'aws-sdk-client-mock';
import { fc, itProp } from 'jest-fast-check';
import { S3DataSetStoragePlugin } from './';

describe('S3DataSetStoragePlugin', () => {
  describe('constructor', () => {
    itProp(
      'class is intialized given the specified parameters',
      [fc.string(), fc.string(), fc.string()],
      (accessKeyId: string, secretAccessKey, kmsKeyArn) => {
        const awsCreds = {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey
        };

        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: kmsKeyArn
        });

        expect(plugin).toHaveProperty('_kmsKeyArn', kmsKeyArn);
      }
    );
  });

  describe('createStorage', () => {
    itProp(
      "Appends '/' to the end of the path when not supplied",
      [fc.string(), fc.string()],
      async (name, path) => {
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

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
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

        const s3Mock = mockClient(S3Client);
        s3Mock.on(PutObjectCommand).resolves({});
        const pathWithSlash: string = `${path}/`;
        const s3Uri = await plugin.createStorage(name, pathWithSlash);
        expect(s3Uri).toMatch(`s3://${name}/${pathWithSlash}`);
      }
    );
  });

  describe('addExternalEndpoint', () => {
    itProp(
      'does not alter bucket policy if it access point delegation already exists.',
      [fc.string(), fc.string()],
      async (externalEndpointName, externalRoleName) => {
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const name: string = 'bucketName';
        const path: string = 'dataset-prefix';

        // const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`
        const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

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
                  "Action": "*",
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
          plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleName)
        ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);
        expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(0);
      }
    );

    itProp(
      'adds a bucket policy statement when the account ID is different.',
      [fc.string(), fc.string()],
      async (externalEndpointName, externalRoleName) => {
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const name: string = 'bucketName';
        const path: string = 'dataset-prefix';

        // const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`
        const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

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
                  "Action": "*",
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
            AccessPointArn: accessPointArn
          })
          .on(GetAccessPointPolicyCommand)
          .resolves({})
          .on(PutAccessPointPolicyCommand)
          .resolves({});

        await expect(
          plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleName)
        ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);
        expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Bucket).toEqual(name);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Policy).toEqual(
          '{"Statement":[{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"000000000000"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]},{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]}],"Version":"2012-10-17"}'
        );
      }
    );

    itProp(
      'adds a bucket policy statement when the condition is different.',
      [fc.string(), fc.string()],
      async (externalEndpointName, externalRoleName) => {
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const name: string = 'bucketName';
        const path: string = 'dataset-prefix';

        // const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`
        const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

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
                  "Action": "*",
                  "Resource": [
                      "arn:aws:s3:::${name}",
                      "arn:aws:s3:::${name}/*"
                  ],
                  "Condition": {
                      "StringNotEquals": {
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
          plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleName)
        ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);
        expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Bucket).toEqual(name);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Policy).toEqual(
          '{"Statement":[{"Action":"*","Condition":{"StringNotEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]},{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]}],"Version":"2012-10-17"}'
        );
      }
    );

    itProp(
      'adds a bucket policy statement when the condition key is different.',
      [fc.string(), fc.string()],
      async (externalEndpointName, externalRoleName) => {
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const name: string = 'bucketName';
        const path: string = 'dataset-prefix';

        // const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`
        const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

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
                  "Action": "*",
                  "Resource": [
                      "arn:aws:s3:::${name}",
                      "arn:aws:s3:::${name}/*"
                  ],
                  "Condition": {
                      "StringEquals": {
                          "ec2:DataAccessPointAccount": "123456789012"
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
          plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleName)
        ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);
        expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Bucket).toEqual(name);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Policy).toEqual(
          '{"Statement":[{"Action":"*","Condition":{"StringEquals":{"ec2:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]},{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]}],"Version":"2012-10-17"}'
        );
      }
    );

    itProp(
      'adds a bucket policy statement when only a single resource is given.',
      [fc.string(), fc.string()],
      async (externalEndpointName, externalRoleName) => {
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const name: string = 'bucketName';
        const path: string = 'dataset-prefix';

        // const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`
        const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

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
                  "Action": "*",
                  "Resource": "*",
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
          plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleName)
        ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);
        expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Bucket).toEqual(name);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Policy).toEqual(
          '{"Statement":[{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":"*"},{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]}],"Version":"2012-10-17"}'
        );
      }
    );

    itProp(
      'adds a bucket policy statement when the bucket arn resource does not match.',
      [fc.string(), fc.string()],
      async (externalEndpointName, externalRoleName) => {
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const name: string = 'bucketName';
        const path: string = 'dataset-prefix';

        // const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`
        const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

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
                  "Action": "*",
                  "Resource": [                      
                      "arn:aws:ec2:::${name}",
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
          plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleName)
        ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);
        expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Bucket).toEqual(name);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Policy).toEqual(
          '{"Statement":[{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:ec2:::bucketName","arn:aws:s3:::bucketName/*"]},{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]}],"Version":"2012-10-17"}'
        );
      }
    );

    itProp(
      'adds a bucket policy statement when the objecs bucket arn resource does not match.',
      [fc.string(), fc.string()],
      async (externalEndpointName, externalRoleName) => {
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const name: string = 'bucketName';
        const path: string = 'dataset-prefix';

        // const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`
        const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

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
                  "Action": "*",
                  "Resource": [                      
                      "arn:aws:s3:::${name}",
                      "arn:aws:ec2:::${name}/*"
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
          plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleName)
        ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);
        expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Bucket).toEqual(name);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Policy).toEqual(
          '{"Statement":[{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:ec2:::bucketName/*"]},{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]}],"Version":"2012-10-17"}'
        );
      }
    );

    itProp(
      'adds a bucket policy statement when the effect is different.',
      [fc.string(), fc.string()],
      async (externalEndpointName, externalRoleName) => {
        // this behavior should be noted in the README as it currently requires IT intervention.
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const name: string = 'bucketName';
        const path: string = 'dataset-prefix';

        // const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`
        const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

        const s3Mock = mockClient(S3Client);
        s3Mock
          .on(GetBucketPolicyCommand)
          .resolves({
            Policy: `
        {
          "Version": "2012-10-17",
          "Statement": [
              {
                  "Effect": "Deny",
                  "Principal": {
                      "AWS": "*"
                  },
                  "Action": "*",
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
          plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleName)
        ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);
        expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Bucket).toEqual(name);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Policy).toEqual(
          '{"Statement":[{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Deny","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]},{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]}],"Version":"2012-10-17"}'
        );
      }
    );

    itProp(
      'adds a bucket policy statement when the principal is different.',
      [fc.string(), fc.string()],
      async (externalEndpointName, externalRoleName) => {
        // this behavior should be noted in the README as it currently requires IT intervention.
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const name: string = 'bucketName';
        const path: string = 'dataset-prefix';

        // const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`
        const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

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
                      "AWS": "arn:aws:::role/somerole"
                  },
                  "Action": "*",
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
          plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleName)
        ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);
        expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Bucket).toEqual(name);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Policy).toEqual(
          '{"Statement":[{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"arn:aws:::role/somerole"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]},{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]}],"Version":"2012-10-17"}'
        );
      }
    );

    itProp(
      'adds a bucket policy statement when the principal is missing.',
      [fc.string(), fc.string()],
      async (externalEndpointName, externalRoleName) => {
        // this behavior should be noted in the README as it currently requires IT intervention.
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const name: string = 'bucketName';
        const path: string = 'dataset-prefix';

        // const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`
        const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

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
                  "Action": "*",
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
          plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleName)
        ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);
        expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Bucket).toEqual(name);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Policy).toEqual(
          '{"Statement":[{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]},{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]}],"Version":"2012-10-17"}'
        );
      }
    );

    itProp(
      'adds a bucket policy statement when multiple actions are given.',
      [fc.string(), fc.string()],
      async (externalEndpointName, externalRoleName) => {
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const name: string = 'bucketName';
        const path: string = 'dataset-prefix';

        // const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`
        const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

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
                  "Action": [
                    "s3:ListBucket",
                    "s3:GetObject"
                  ],
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
          plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleName)
        ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);
        expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Bucket).toEqual(name);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Policy).toEqual(
          '{"Statement":[{"Action":["s3:ListBucket","s3:GetObject"],"Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]},{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]}],"Version":"2012-10-17"}'
        );
      }
    );

    itProp(
      'adds a bucket policy statement when the action is different.',
      [fc.string(), fc.string()],
      async (externalEndpointName, externalRoleName) => {
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const name: string = 'bucketName';
        const path: string = 'dataset-prefix';

        // const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`
        const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

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
                  "Action": "s3:ListBucket",
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
          plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleName)
        ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);
        expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Bucket).toEqual(name);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)[0].firstArg.input.Policy).toEqual(
          '{"Statement":[{"Action":"s3:ListBucket","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]},{"Action":"*","Condition":{"StringEquals":{"s3:DataAccessPointAccount":"123456789012"}},"Effect":"Allow","Principal":{"AWS":"*"},"Resource":["arn:aws:s3:::bucketName","arn:aws:s3:::bucketName/*"]}],"Version":"2012-10-17"}'
        );
      }
    );

    itProp(
      'throws when the arn for the access point is invalid. ',
      [fc.string(), fc.string()],
      async (externalEndpointName, externalRoleName) => {
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const name: string = 'bucketName';
        const path: string = 'dataset-prefix';

        const endPointNameNoColon = externalEndpointName.replace(/\:/g, '_');
        const accessPointArn = `arn:s3:us-east-1:123456789012:accesspoint/${endPointNameNoColon}`;
        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

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
                  "Action": "*",
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
          plugin.addExternalEndpoint(name, path, endPointNameNoColon, externalRoleName)
        ).rejects.toThrow(new Error("Expected an arn with at least six ':' sepearted values."));
        expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(0);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(0);
      }
    );

    itProp(
      'Creates a bucket policy if none exists.',
      [fc.string(), fc.string()],
      async (externalEndpointName, externalRoleName) => {
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const name: string = 'bucketName';
        const path: string = 'dataset-prefix';

        // const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`
        const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

        const s3Mock = mockClient(S3Client);
        s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

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
          plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleName)
        ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);

        expect(s3Mock.commandCalls(GetBucketPolicyCommand)).toHaveLength(1);
        expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
        expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      }
    );

    it('Does not create an access policy if one exists.', async () => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const name: string = 'bucketName';
      const path: string = 'dataset-prefix';
      const externalRoleName: string = 'someRole';
      const externalEndpointName: string = 'someEndpoint';
      const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`;
      const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn
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
                "Resource": "${accessPointArn}"
            },
            {
                "Sid": "Statement2",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "${externalRoleArn}"
                },
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject"
                ],
                "Resource": "${accessPointArn}/object/${path}/*"
            }
        ]
    }
        `
        })
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleArn)
      ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(0);
    });

    it('updates the list bucket access point policy if the prinicpal is missing', async () => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const name: string = 'bucketName';
      const path: string = 'dataset-prefix';
      const externalRoleName: string = 'someRole';
      const externalEndpointName: string = 'someEndpoint';
      const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`;
      const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn
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
                "Resource": "${accessPointArn}"
            },
            {
                "Sid": "Statement2",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "${externalRoleArn}"
                },
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject"
                ],
                "Resource": "${accessPointArn}/object/${path}/*"
            }
        ]
    }
        `
        })
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleArn)
      ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.AccountId).toEqual(
        '123456789012'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Name).toEqual(
        'someEndpoint'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":"s3:ListBucket","Effect":"Allow","Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint","Sid":"Statement1"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*","Sid":"Statement2"},{"Action":"s3:ListBucket","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint"}],"Version":"2012-10-17"}'
      );
    });

    it('updates the list bucket access point policy if the prinicpal is incorrect.', async () => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const name: string = 'bucketName';
      const path: string = 'dataset-prefix';
      const externalRoleName: string = 'someRole';
      const externalEndpointName: string = 'someEndpoint';
      const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`;
      const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn
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
                  "AWS": "*"
              },
                "Action": "s3:ListBucket",
                "Resource": "${accessPointArn}"
            },
            {
                "Sid": "Statement2",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "${externalRoleArn}"
                },
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject"
                ],
                "Resource": "${accessPointArn}/object/${path}/*"
            }
        ]
    }
        `
        })
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleArn)
      ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.AccountId).toEqual(
        '123456789012'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Name).toEqual(
        'someEndpoint'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":"s3:ListBucket","Effect":"Allow","Principal":{"AWS":"*"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint","Sid":"Statement1"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*","Sid":"Statement2"},{"Action":"s3:ListBucket","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint"}],"Version":"2012-10-17"}'
      );
    });

    it('updates the list bucket access point policy if the effect is incorrect.', async () => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const name: string = 'bucketName';
      const path: string = 'dataset-prefix';
      const externalRoleName: string = 'someRole';
      const externalEndpointName: string = 'someEndpoint';
      const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`;
      const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn
        })
        .on(GetAccessPointPolicyCommand)
        .resolves({
          Policy: `
      {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "Statement1",
                "Effect": "Deny",
                "Principal": {
                  "AWS": "${externalRoleArn}"
              },
                "Action": "s3:ListBucket",
                "Resource": "${accessPointArn}"
            },
            {
                "Sid": "Statement2",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "${externalRoleArn}"
                },
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject"
                ],
                "Resource": "${accessPointArn}/object/${path}/*"
            }
        ]
    }
        `
        })
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleArn)
      ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.AccountId).toEqual(
        '123456789012'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Name).toEqual(
        'someEndpoint'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":"s3:ListBucket","Effect":"Deny","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint","Sid":"Statement1"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*","Sid":"Statement2"},{"Action":"s3:ListBucket","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint"}],"Version":"2012-10-17"}'
      );
    });

    it('updates the list bucket access point policy there is more than one action.', async () => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const name: string = 'bucketName';
      const path: string = 'dataset-prefix';
      const externalRoleName: string = 'someRole';
      const externalEndpointName: string = 'someEndpoint';
      const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`;
      const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn
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
                "Action": [
                  "s3:ListBucket",
                  "s3:GetObject"
                ],
                "Resource": "${accessPointArn}"
            },
            {
                "Sid": "Statement2",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "${externalRoleArn}"
                },
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject"
                ],
                "Resource": "${accessPointArn}/object/${path}/*"
            }
        ]
    }
        `
        })
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleArn)
      ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.AccountId).toEqual(
        '123456789012'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Name).toEqual(
        'someEndpoint'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":["s3:ListBucket","s3:GetObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint","Sid":"Statement1"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*","Sid":"Statement2"},{"Action":"s3:ListBucket","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint"}],"Version":"2012-10-17"}'
      );
    });

    it('updates the list bucket access point policy the action is incorrect.', async () => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const name: string = 'bucketName';
      const path: string = 'dataset-prefix';
      const externalRoleName: string = 'someRole';
      const externalEndpointName: string = 'someEndpoint';
      const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`;
      const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn
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
                "Action": "s3:GetObject",
                "Resource": "${accessPointArn}"
            },
            {
                "Sid": "Statement2",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "${externalRoleArn}"
                },
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject"
                ],
                "Resource": "${accessPointArn}/object/${path}/*"
            }
        ]
    }
        `
        })
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleArn)
      ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.AccountId).toEqual(
        '123456789012'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Name).toEqual(
        'someEndpoint'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":"s3:GetObject","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint","Sid":"Statement1"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*","Sid":"Statement2"},{"Action":"s3:ListBucket","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint"}],"Version":"2012-10-17"}'
      );
    });

    it('updates the list bucket access point policy there is more than one resource.', async () => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const name: string = 'bucketName';
      const path: string = 'dataset-prefix';
      const externalRoleName: string = 'someRole';
      const externalEndpointName: string = 'someEndpoint';
      const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`;
      const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn
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
                "Resource": [
                  "${accessPointArn}",
                  "*"
                ]
            },
            {
                "Sid": "Statement2",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "${externalRoleArn}"
                },
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject"
                ],
                "Resource": "${accessPointArn}/object/${path}/*"
            }
        ]
    }
        `
        })
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleArn)
      ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.AccountId).toEqual(
        '123456789012'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Name).toEqual(
        'someEndpoint'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":"s3:ListBucket","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":["arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint","*"],"Sid":"Statement1"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*","Sid":"Statement2"},{"Action":"s3:ListBucket","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint"}],"Version":"2012-10-17"}'
      );
    });

    it('updates the list bucket access point policy when the resource is incorrect', async () => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const name: string = 'bucketName';
      const path: string = 'dataset-prefix';
      const externalRoleName: string = 'someRole';
      const externalEndpointName: string = 'someEndpoint';
      const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`;
      const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn
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
                "Resource": "*"
            },
            {
                "Sid": "Statement2",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "${externalRoleArn}"
                },
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject"
                ],
                "Resource": "${accessPointArn}/object/${path}/*"
            }
        ]
    }
        `
        })
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleArn)
      ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.AccountId).toEqual(
        '123456789012'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Name).toEqual(
        'someEndpoint'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":"s3:ListBucket","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"*","Sid":"Statement1"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*","Sid":"Statement2"},{"Action":"s3:ListBucket","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint"}],"Version":"2012-10-17"}'
      );
    });

    it('updates the get/put bucket access point policy if the prinicpal is missing', async () => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const name: string = 'bucketName';
      const path: string = 'dataset-prefix';
      const externalRoleName: string = 'someRole';
      const externalEndpointName: string = 'someEndpoint';
      const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`;
      const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn
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
                "Resource": "${accessPointArn}"
            },
            {
                "Sid": "Statement2",
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject"
                ],
                "Resource": "${accessPointArn}/object/${path}/*"
            }
        ]
    }
        `
        })
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleArn)
      ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.AccountId).toEqual(
        '123456789012'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Name).toEqual(
        'someEndpoint'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":"s3:ListBucket","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint","Sid":"Statement1"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*","Sid":"Statement2"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*"}],"Version":"2012-10-17"}'
      );
    });

    it('updates the get/put bucket access point policy if the prinicpal is incorrect.', async () => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const name: string = 'bucketName';
      const path: string = 'dataset-prefix';
      const externalRoleName: string = 'someRole';
      const externalEndpointName: string = 'someEndpoint';
      const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`;
      const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn
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
                "Resource": "${accessPointArn}"
            },
            {
                "Sid": "Statement2",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "*"
                },
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject"
                ],
                "Resource": "${accessPointArn}/object/${path}/*"
            }
        ]
    }
        `
        })
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleArn)
      ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.AccountId).toEqual(
        '123456789012'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Name).toEqual(
        'someEndpoint'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":"s3:ListBucket","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint","Sid":"Statement1"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"*"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*","Sid":"Statement2"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*"}],"Version":"2012-10-17"}'
      );
    });

    it('updates the get/put bucket access point policy if the effect is incorrect.', async () => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const name: string = 'bucketName';
      const path: string = 'dataset-prefix';
      const externalRoleName: string = 'someRole';
      const externalEndpointName: string = 'someEndpoint';
      const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`;
      const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn
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
                "Resource": "${accessPointArn}"
            },
            {
                "Sid": "Statement2",
                "Effect": "Deny",
                "Principal": {
                    "AWS": "${externalRoleArn}"
                },
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject"
                ],
                "Resource": "${accessPointArn}/object/${path}/*"
            }
        ]
    }
        `
        })
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleArn)
      ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.AccountId).toEqual(
        '123456789012'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Name).toEqual(
        'someEndpoint'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":"s3:ListBucket","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint","Sid":"Statement1"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Deny","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*","Sid":"Statement2"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*"}],"Version":"2012-10-17"}'
      );
    });

    it('updates the get/put bucket access point policy is missing an action.', async () => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const name: string = 'bucketName';
      const path: string = 'dataset-prefix';
      const externalRoleName: string = 'someRole';
      const externalEndpointName: string = 'someEndpoint';
      const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`;
      const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn
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
                "Action": [
                  "s3:ListBucket"
                ],
                "Resource": "${accessPointArn}"
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
        plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleArn)
      ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.AccountId).toEqual(
        '123456789012'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Name).toEqual(
        'someEndpoint'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":"s3:ListBucket","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint","Sid":"Statement1"},{"Action":"s3:GetObject","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*","Sid":"Statement2"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*"}],"Version":"2012-10-17"}'
      );
    });

    it('updates the get/put bucket access point policy the action is incorrect.', async () => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const name: string = 'bucketName';
      const path: string = 'dataset-prefix';
      const externalRoleName: string = 'someRole';
      const externalEndpointName: string = 'someEndpoint';
      const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`;
      const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn
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
                "Resource": "${accessPointArn}"
            },
            {
                "Sid": "Statement2",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "${externalRoleArn}"
                },
                "Action": [
                    "s3:ListBucket",
                    "s3:PutObject"
                ],
                "Resource": "${accessPointArn}/object/${path}/*"
            }
        ]
    }
        `
        })
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleArn)
      ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.AccountId).toEqual(
        '123456789012'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Name).toEqual(
        'someEndpoint'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":"s3:ListBucket","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint","Sid":"Statement1"},{"Action":["s3:ListBucket","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*","Sid":"Statement2"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*"}],"Version":"2012-10-17"}'
      );
    });

    it('updates the list bucket access point policy there is more than one resource.', async () => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const name: string = 'bucketName';
      const path: string = 'dataset-prefix';
      const externalRoleName: string = 'someRole';
      const externalEndpointName: string = 'someEndpoint';
      const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`;
      const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn
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
                "Resource": "${accessPointArn}"
            },
            {
                "Sid": "Statement2",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "${externalRoleArn}"
                },
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject"
                ],
                "Resource": [
                  "${accessPointArn}/object/${path}/*",
                 "*"
                ]
            }
        ]
    }
        `
        })
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleArn)
      ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.AccountId).toEqual(
        '123456789012'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Name).toEqual(
        'someEndpoint'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":"s3:ListBucket","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint","Sid":"Statement1"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":["arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*","*"],"Sid":"Statement2"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*"}],"Version":"2012-10-17"}'
      );
    });

    it('updates the get/put bucket access point policy when the resource is incorrect', async () => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const name: string = 'bucketName';
      const path: string = 'dataset-prefix';
      const externalRoleName: string = 'someRole';
      const externalEndpointName: string = 'someEndpoint';
      const externalRoleArn = `arn:aws:iam::123456789012:role/${externalRoleName}`;
      const accessPointArn = `arn:aws:s3:us-east-1:123456789012:accesspoint/${externalEndpointName}`;
      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      const s3Mock = mockClient(S3Client);
      s3Mock.on(GetBucketPolicyCommand).resolves({}).on(PutBucketPolicyCommand).resolves({});

      const s3ControlMock = mockClient(S3ControlClient);
      s3ControlMock
        .on(CreateAccessPointCommand)
        .resolves({
          AccessPointArn: accessPointArn
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
                "Resource": "${accessPointArn}"
            },
            {
                "Sid": "Statement2",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "${externalRoleArn}"
                },
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject"
                ],
                "Resource": "${accessPointArn}/object/${path}/somethingelse*"
            }
        ]
    }
        `
        })
        .on(PutAccessPointPolicyCommand)
        .resolves({});

      await expect(
        plugin.addExternalEndpoint(name, path, externalEndpointName, externalRoleArn)
      ).resolves.toEqual(`s3://${accessPointArn}/${path}/`);

      expect(s3Mock.commandCalls(PutBucketPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)).toHaveLength(1);
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.AccountId).toEqual(
        '123456789012'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Name).toEqual(
        'someEndpoint'
      );
      expect(s3ControlMock.commandCalls(PutAccessPointPolicyCommand)[0].firstArg.input.Policy).toEqual(
        '{"Statement":[{"Action":"s3:ListBucket","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint","Sid":"Statement1"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/somethingelse*","Sid":"Statement2"},{"Action":["s3:GetObject","s3:PutObject"],"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:role/someRole"},"Resource":"arn:aws:s3:us-east-1:123456789012:accesspoint/someEndpoint/object/dataset-prefix/*"}],"Version":"2012-10-17"}'
      );
    });
  });

  describe('addRoleToEndpoint', () => {
    itProp(
      'throws not implemented error.',
      [fc.string(), fc.string(), fc.string()],
      async (name, externalEndpointName, externalRoleName) => {
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

        await expect(
          plugin.addRoleToExternalEndpoint(name, externalEndpointName, externalRoleName)
        ).rejects.toEqual(new Error('Method not implemented.'));
      }
    );
  });

  describe('removeRoleFromEndpoint', () => {
    itProp(
      'throws not implemented error.',
      [fc.string(), fc.string(), fc.string()],
      async (name, externalEndpointName, externalRoleName) => {
        const awsCreds = {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        };

        const plugin = new S3DataSetStoragePlugin({
          region: 'us-east-1',
          credentials: awsCreds,
          kmsKeyArn: 'not an Arn'
        });

        await expect(
          plugin.removeRoleFromExternalEndpoint(name, externalEndpointName, externalRoleName)
        ).rejects.toEqual(new Error('Method not implemented.'));
      }
    );
  });

  // describe('getExternalEndpoint', () => {
  //   itProp('throws not implemented error.',
  //   [fc.string(), fc.string()],
  //   async(name, externalEndpointName) => {
  //     const awsCreds = {
  //       accessKeyId: 'fakeKey',
  //       secretAccessKey: 'fakeSecret'
  //     };

  //     const plugin = new S3DataSetStoragePlugin({
  //       region: 'us-east-1',
  //       credentials: awsCreds,
  //       kmsKeyArn: 'not an Arn',
  //     });

  //     await expect(plugin.getExternalEndpoint(name, externalEndpointName))
  //     .rejects
  //     .toEqual(new Error('Method not implemented.'));
  //   });
  // });

  describe('createPresignedUploadUrl', () => {
    itProp('throws not implemented error.', [fc.string(), fc.nat()], async (name, ttl) => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      await expect(plugin.createPresignedUploadUrl(name, ttl)).rejects.toEqual(
        new Error('Method not implemented.')
      );
    });
  });

  describe('createPresignedMultiPartUploadUrls', () => {
    itProp('throws not implemented error.', [fc.string(), fc.nat(), fc.nat()], async (name, parts, ttl) => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      await expect(plugin.createPresignedMultiPartUploadUrls(name, parts, ttl)).rejects.toEqual(
        new Error('Method not implemented.')
      );
    });
  });

  describe('_awsAccountIdFromArn', () => {
    it('throws when the supplied arn contains an empty accountId', () => {
      const awsCreds = {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      };

      const plugin = new S3DataSetStoragePlugin({
        region: 'us-east-1',
        credentials: awsCreds,
        kmsKeyArn: 'not an Arn'
      });

      // @tsignore
      expect(() => plugin[`_awsAccountIdFromArn`]('arn:aws:s3:us-east-1::accessPoint/someName')).toThrow(
        new Error('Expected an arn with an AWS AccountID however AWS AccountID field is empty.')
      );
    });
  });
});
