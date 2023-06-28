/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  FlowLog,
  FlowLogDestination,
  FlowLogResourceType,
  ISubnet,
  IVpc,
  Subnet,
  SubnetSelection,
  SubnetType,
  Vpc
} from 'aws-cdk-lib/aws-ec2';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface RSWVpcProps {
  vpcId: string;
  albSubnetIds: string[];
  ecsSubnetIds: string[];
}

export class RSWVpc extends Construct {
  public readonly vpc: IVpc;
  public readonly albSubnetSelection: SubnetSelection;
  public readonly ecsSubnetSelection: SubnetSelection;

  public constructor(scope: Construct, id: string, props: RSWVpcProps) {
    const { vpcId, albSubnetIds, ecsSubnetIds } = props;
    super(scope, id);

    this.vpc = vpcId === '' ? new Vpc(this, 'MainVPC', {}) : Vpc.fromLookup(this, 'MainVPC', { vpcId });

    const logGroup = new LogGroup(this, 'VpcFlowLogGroup', { retention: RetentionDays.TEN_YEARS });

    const role = new Role(this, 'VpcFlowLogRole', {
      assumedBy: new ServicePrincipal('vpc-flow-logs.amazonaws.com')
    });

    // eslint-disable-next-line no-new
    new FlowLog(this, 'VpcFlowLog', {
      resourceType: FlowLogResourceType.fromVpc(this.vpc),
      destination: FlowLogDestination.toCloudWatchLogs(logGroup, role)
    });

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
      const subnet = Subnet.fromSubnetId(scope, `RSW${subnetPrefix}Subnet${subnetCount}`, subnetId);
      subnets.push(subnet);
      subnetCount++;
    });

    return {
      subnets
    };
  }
}
