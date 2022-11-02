/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-new */
import { InstanceType, SubnetFilter, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { SWBUIStack } from '../SWBUIStack';

export function createECSCluster(
  stack: SWBUIStack,
  apiGwUrl: string,
  albArn: string,
  vpcId: string,
  subnetIds: string[],
  isNetworkPublic: boolean = true
): void {
  // Create VPC, or use config-entered VPC
  const vpc = Vpc.fromLookup(stack, 'MainVPC', { vpcId });
  const subnets = vpc.selectSubnets({ subnetFilters: [SubnetFilter.byIds(subnetIds)] });

  // Create an ECS cluster
  new Cluster(stack, 'Cluster', {
    vpc,
    capacity: { instanceType: new InstanceType('t2.xlarge'), vpcSubnets: subnets }
  });

  const taskDefinition = new FargateTaskDefinition(stack, 'TaskDefinition', {
    cpu: 512,
    memoryLimitMiB: 1024,
    family: 'AutoScalingServiceTask',
    executionRole: new Role(stack, 'EcsExecutionRole', {
      assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
      roleName: `${stack.stackName}-ExecutionRole`,
      description: 'A role needed by ECS',
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
      ]
    })
  });

  taskDefinition.addContainer('HostContainer', {
    image: ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
    memoryLimitMiB: 1024,
    portMappings: [{ containerPort: 80 }]
  });
}
