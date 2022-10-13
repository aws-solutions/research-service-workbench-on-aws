/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ISubnet, IVpc, Subnet, SubnetSelection, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface SWBVpcProps {
  vpcId: string;
  subnetIds: string[];
}

export class SWBVpc extends Construct {
  public readonly vpc: IVpc;
  public readonly subnetSelection: SubnetSelection;

  public constructor(scope: Construct, id: string, props: SWBVpcProps) {
    const { vpcId, subnetIds } = props;
    super(scope, id);

    this.vpc =
      vpcId === '' ? new Vpc(this, 'MainVPC', {}) : Vpc.fromLookup(this, 'MainVPC', { vpcId: vpcId });
    if (subnetIds.length === 0) {
      this.subnetSelection = this.vpc.selectSubnets({
        // Default behavior if no subnets are given is to use all public subnets from vpc above
        // This should be switched to PRIVATE_WITH_NAT when setting this up with private subnets
        subnetType: SubnetType.PUBLIC
      });
    } else {
      const subnets: ISubnet[] = [];
      let subnetCount = 1;
      subnetIds.forEach(function (subnetId: string) {
        const subnet = Subnet.fromSubnetId(scope, 'SWBSubnet' + subnetCount, subnetId);
        subnets.push(subnet);
        subnetCount++;
      });
      this.subnetSelection = {
        subnets: subnets
      };
    }
  }
}
