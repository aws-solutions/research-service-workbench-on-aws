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

    // if only ecs or alb subnets are defined - use them for both alb and ecs
    this.albSubnetSelection = this._getSubnetSelection(
      scope,
      !albSubnetIds.length ? ecsSubnetIds : albSubnetIds,
      SubnetType.PUBLIC
    );
    this.ecsSubnetSelection = this._getSubnetSelection(
      scope,
      !ecsSubnetIds.length ? albSubnetIds : ecsSubnetIds,
      SubnetType.PRIVATE_WITH_NAT
    );
  }

  private _getSubnetSelection(
    scope: Construct,
    subnetIds: string[],
    subnetType: SubnetType
  ): SubnetSelection {
    if (!subnetIds.length) {
      return this.vpc.selectSubnets({
        subnetType
      });
    }

    const subnetPrefix = subnetType === SubnetType.PUBLIC ? 'ALB' : 'ECS';
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
