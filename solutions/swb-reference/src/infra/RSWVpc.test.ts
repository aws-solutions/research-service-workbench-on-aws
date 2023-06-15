/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Subnet, Vpc } from 'aws-cdk-lib/aws-ec2';
import { RSWVpc, RSWVpcProps } from './RSWVpc';

describe('SWBvpc tests', () => {
  it('has the correct vpc properties when given no arguments', () => {
    const rswVpcPropsProps: RSWVpcProps = {
      vpcId: '',
      albSubnetIds: [],
      ecsSubnetIds: []
    };
    const stack = new Stack();
    new RSWVpc(stack, 'TestRSWVpc', rswVpcPropsProps);
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::EC2::VPC', 1);
    template.resourceCountIs('AWS::EC2::Subnet', 4);
    template.resourceCountIs('AWS::EC2::RouteTable', 4);
    template.resourceCountIs('AWS::EC2::SubnetRouteTableAssociation', 4);
    template.resourceCountIs('AWS::EC2::Route', 4);
    template.resourceCountIs('AWS::EC2::EIP', 2);
    template.resourceCountIs('AWS::EC2::NatGateway', 2);
    template.resourceCountIs('AWS::EC2::InternetGateway', 1);
    template.resourceCountIs('AWS::EC2::VPCGatewayAttachment', 1);

    template.hasResourceProperties('AWS::EC2::VPC', {
      CidrBlock: '10.0.0.0/16',
      EnableDnsHostnames: true,
      EnableDnsSupport: true,
      InstanceTenancy: 'default',
      Tags: [
        {
          Key: 'Name',
          Value: 'Default/TestRSWVpc/MainVPC'
        }
      ]
    });
    template.hasResourceProperties('AWS::EC2::VPC', {
      CidrBlock: '10.0.0.0/16',
      EnableDnsHostnames: true,
      EnableDnsSupport: true,
      InstanceTenancy: 'default',
      Tags: [
        {
          Key: 'Name',
          Value: 'Default/TestRSWVpc/MainVPC'
        }
      ]
    });
    template.hasResourceProperties('AWS::EC2::Route', {
      DestinationCidrBlock: '0.0.0.0/0'
    });
  });

  it('has the correct vpc properties when given vpcId and albSubnetId', () => {
    const stack = new Stack();
    const template = Template.fromStack(stack);
    const mockVpc = new Vpc(stack, 'testVpc');
    const mockSubnet = new Subnet(stack, 'SWBSubnet1', {
      availabilityZone: 'us-east-1z',
      vpcId: mockVpc.vpcId,
      cidrBlock: '0.0.0.0/0'
    });
    jest.spyOn(Vpc, 'fromLookup').mockReturnValue(mockVpc);
    jest.spyOn(Subnet, 'fromSubnetId').mockReturnValue(mockSubnet);

    const rswVpcPropsProps: RSWVpcProps = {
      vpcId: mockVpc.vpcId,
      albSubnetIds: [mockSubnet.subnetId],
      ecsSubnetIds: []
    };
    const rswVpc = new RSWVpc(stack, 'TestRSWVpc', rswVpcPropsProps);

    expect(rswVpc.vpc.vpcId).toEqual(mockVpc.vpcId);
    expect(rswVpc.albSubnetSelection.subnets).toEqual([mockSubnet]);

    // No VPCs or Subnets should be in the template because we are taking existing resources
    template.resourceCountIs('AWS::EC2::VPC', 0);
    template.resourceCountIs('AWS::EC2::Subnet', 0);
  });
});
