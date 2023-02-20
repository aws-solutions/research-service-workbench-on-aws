/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CfnResource } from 'aws-cdk-lib';
import { IVpc, SubnetSelection } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface SWBApplicationLoadBalancerProps {
  vpc: IVpc;
  subnets: SubnetSelection;
  internetFacing: boolean;
  accessLogsBucket: Bucket;
}

export class SWBApplicationLoadBalancer extends Construct {
  public readonly applicationLoadBalancer: ApplicationLoadBalancer;

  public constructor(scope: Construct, id: string, props: SWBApplicationLoadBalancerProps) {
    const { vpc, subnets, internetFacing, accessLogsBucket } = props;
    super(scope, id);

    this.applicationLoadBalancer = new ApplicationLoadBalancer(this, id, {
      vpc,
      vpcSubnets: subnets,
      internetFacing
    });
    this.applicationLoadBalancer.logAccessLogs(accessLogsBucket);

    const albSGMetadataNode = this.applicationLoadBalancer.node.findChild('SecurityGroup').node
      .defaultChild as CfnResource;
    albSGMetadataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W29',
          reason: 'TODO: Security Groups found egress with port range instead of just a single port'
        },
        {
          id: 'W9',
          reason: 'TODO: Security Groups found with ingress cidr that is not /32'
        },
        {
          id: 'W2',
          reason:
            'TODO: Security Groups found with cidr open to world on ingress.  This should never be true on instance.  Permissible on ELB.'
        }
      ]
    });
  }
}
