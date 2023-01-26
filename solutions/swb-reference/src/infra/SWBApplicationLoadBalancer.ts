/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { IVpc, SubnetSelection } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

export interface SWBApplicationLoadBalancerProps {
  vpc: IVpc;
  subnets: SubnetSelection;
  internetFacing: boolean;
}

export class SWBApplicationLoadBalancer extends Construct {
  public readonly applicationLoadBalancer: ApplicationLoadBalancer;

  public constructor(scope: Construct, id: string, props: SWBApplicationLoadBalancerProps) {
    const { vpc, subnets, internetFacing } = props;
    super(scope, id);

    this.applicationLoadBalancer = new ApplicationLoadBalancer(this, id, {
      vpc,
      vpcSubnets: subnets,
      internetFacing
    });
  }
}
