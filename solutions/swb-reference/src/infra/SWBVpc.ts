/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ISubnet, IVpc, Subnet, SubnetSelection, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface SWBVpcProps {
  vpcId: string;
  albSubnetIds: string[];
  ecsSubnetIds: string[];
}

export class SWBVpc extends Construct {
  public readonly vpc: IVpc;
  public readonly albSubnetSelection: SubnetSelection;
  public readonly ecsSubnetSelection: SubnetSelection;

  public constructor(scope: Construct, id: string, props: SWBVpcProps) {
    const { vpcId, albSubnetIds, ecsSubnetIds } = props;
    super(scope, id);

    this.vpc = vpcId === '' ? new Vpc(this, 'MainVPC', {}) : Vpc.fromLookup(this, 'MainVPC', { vpcId });
    this.albSubnetSelection = this._getSubnetSelection(scope, albSubnetIds, 'ALB');
    this.ecsSubnetSelection = this._getSubnetSelection(scope, ecsSubnetIds, 'ECS');
  }

  private _getSubnetSelection(scope: Construct, subnetIds: string[], subnetPrefix: string): SubnetSelection {
    if (!subnetIds.length) {
      return this.vpc.selectSubnets({
        // Default behavior if no subnets are given is to use all public subnets from vpc above
        // This should be switched to PRIVATE_WITH_NAT when setting this up with private subnets
        subnetType: SubnetType.PUBLIC
      });
    }

    const subnets: ISubnet[] = [];
    let subnetCount = 1;
    subnetIds.forEach(function (subnetId: string) {
      const subnet = Subnet.fromSubnetId(scope, `SWB${subnetPrefix}Subnet${subnetCount}`, subnetId);
      subnets.push(subnet);
      subnetCount++;
    });

    return {
      subnets
    };
  }
}
