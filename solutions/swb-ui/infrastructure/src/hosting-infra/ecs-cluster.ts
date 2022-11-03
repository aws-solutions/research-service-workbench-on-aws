/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-new */
import { InstanceType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage, FargateService, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancer, ApplicationProtocol } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { SWBUIStack } from '../SWBUIStack';

export function createECSCluster(
  stack: SWBUIStack,
  albArn: string,
  vpcId: string = '',
  repositoryName: string
): void {
  const vpc = Vpc.fromLookup(stack, 'MainVPC', { vpcId });

  // Create an ECS cluster
  const cluster = new Cluster(stack, 'Cluster', {
    vpc,
    capacity: { instanceType: new InstanceType('t2.xlarge') }
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
    image: ContainerImage.fromRegistry(
      `${stack.account}.dkr.ecr.${stack.region}.amazonaws.com/${repositoryName}:latest`
    ),
    // image: ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
    memoryLimitMiB: 1024,
    portMappings: [{ containerPort: 80 }]
  });
  const fargateService = new FargateService(stack, 'SwbUi', { cluster, taskDefinition });

  const alb = ApplicationLoadBalancer.fromLookup(stack, 'SWBApplicationLoadBalancer', {
    loadBalancerArn: albArn
  });

  const httpListener = alb.addListener('HTTPListener', {
    protocol: ApplicationProtocol.HTTP,
    port: 80
  });

  httpListener.addTargets('uiContainer', {
    port: 80,
    protocol: ApplicationProtocol.HTTP,
    targets: [
      fargateService.loadBalancerTarget({
        containerName: 'HostContainer',
        containerPort: 80
      })
    ]
  });
}
