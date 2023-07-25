/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CfnResource } from 'aws-cdk-lib';
import { IVpc, SubnetSelection } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { isSolutionsBuild } from '../constants';

export interface RSWApplicationLoadBalancerProps {
  vpc: IVpc;
  subnets: SubnetSelection;
  internetFacing: boolean;
  accessLogsBucket: Bucket;
}

export class RSWApplicationLoadBalancer extends Construct {
  public readonly applicationLoadBalancer: ApplicationLoadBalancer;

  public constructor(scope: Construct, id: string, props: RSWApplicationLoadBalancerProps) {
    const { vpc, subnets, internetFacing, accessLogsBucket } = props;
    super(scope, id);

    this.applicationLoadBalancer = new ApplicationLoadBalancer(this, id, {
      vpc,
      vpcSubnets: subnets,
      internetFacing,
      deletionProtection: true
    });
    // logAccessLogs() depends on region being specified on the stack, which is only possible during non-Solutions deployment
    if (!isSolutionsBuild()) {
      this.applicationLoadBalancer.logAccessLogs(accessLogsBucket);
    } else {
      const albMetadataNode = this.applicationLoadBalancer.node.defaultChild as CfnResource;
      albMetadataNode.addMetadata('cfn_nag', {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        rules_to_suppress: [
          {
            id: 'W52',
            reason: 'Enabling ALB access logging for Solutions Implementation is documented as a manual step'
          }
        ]
      });
    }

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
