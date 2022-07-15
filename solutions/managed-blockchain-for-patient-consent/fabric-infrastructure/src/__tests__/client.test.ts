import * as cdk from 'aws-cdk-lib';
import * as assertions from 'aws-cdk-lib/assertions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import * as hyperledger from '../components';

const DEFAULT_ENV = { env: { region: 'us-east-1' } };

const TOKEN_REGEXP = /^\$\{Token\[TOKEN\.[0-9]+\]\}$/;

describe('HyperledgerFabricClient', () => {
  test('Create a client network with default properties', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember',
      prefix: 'patient-consent',
      adminCidr: '192.168.1.1/32'
    });

    const template = assertions.Template.fromStack(stack);
    template.resourceCountIs('AWS::EC2::VPC', 1);
    template.hasResource('AWS::EC2::VPC', {
      Properties: {
        CidrBlock: '10.0.0.0/16',
        EnableDnsHostnames: true,
        EnableDnsSupport: true
      }
    });
    template.resourceCountIs('AWS::EC2::FlowLog', 1);
    template.resourceCountIs('AWS::Logs::LogGroup', 1);
    template.resourceCountIs('AWS::EC2::VPCEndpoint', 3);

    expect(network.client.vpc.vpcId).toMatch(TOKEN_REGEXP);
    expect(network.client.vpcEndpoint.vpcEndpointId).toMatch(TOKEN_REGEXP);
  });

  test('Create endpoints on existing a client network ', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const vpc = new ec2.Vpc(stack, 'ClientVpc', {
      cidr: '40.0.0.0/16',
      subnetConfiguration: [
        { name: 'Private', subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        { name: 'Public', subnetType: ec2.SubnetType.PUBLIC }
      ]
    });
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember',
      prefix: 'patient-consent',
      client: {
        vpc: vpc
      },
      adminCidr: '192.168.1.1/32'
    });
    const template = assertions.Template.fromStack(stack);
    template.resourceCountIs('AWS::EC2::VPC', 1);
    template.hasResource('AWS::EC2::VPC', {
      Properties: {
        CidrBlock: '40.0.0.0/16',
        EnableDnsHostnames: true,
        EnableDnsSupport: true
      }
    });
    template.resourceCountIs('AWS::EC2::FlowLog', 1);
    template.resourceCountIs('AWS::Logs::LogGroup', 1);
    template.resourceCountIs('AWS::EC2::VPCEndpoint', 3);

    expect(network.client.vpc.vpcId).toMatch(TOKEN_REGEXP);
    expect(network.client.vpcEndpoint.vpcEndpointId).toMatch(TOKEN_REGEXP);
  });
});
