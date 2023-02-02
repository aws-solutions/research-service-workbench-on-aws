/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-new */
import { CfnOutput, Duration } from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage, FargateService, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';
import {
  ApplicationListener,
  ApplicationTargetGroup,
  ListenerCondition,
  Protocol,
  TargetType
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { SWBUIStack } from '../SWBUIStack';

export function createECSCluster(
  stack: SWBUIStack,
  listenerArn: string,
  repositoryName: string,
  vpcId: string,
  subnetIds: string[],
  availabilityZones: string[]
): void {
  const vpc = Vpc.fromVpcAttributes(stack, 'MainVPC', {
    vpcId,
    availabilityZones: availabilityZones,
    privateSubnetIds: subnetIds
  });

  // Create an ECS cluster
  const cluster = new Cluster(stack, 'Cluster', {
    vpc
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
    memoryLimitMiB: 1024,
    portMappings: [{ containerPort: 3000 }]
  });
  const fargateService = new FargateService(stack, 'SwbUi', {
    cluster,
    taskDefinition,
    desiredCount: 2
  });
  const scalableTaskCount = fargateService.autoScaleTaskCount({
    maxCapacity: 20,
    minCapacity: 2
  });
  scalableTaskCount.scaleOnCpuUtilization('CpuUtilizationScaling', {
    targetUtilizationPercent: 50,
    scaleInCooldown: Duration.seconds(60)
  });

  const albListener = ApplicationListener.fromLookup(stack, 'SWBApplicationListener', {
    listenerArn: listenerArn
  });

  const fargateServiceTarget = fargateService.loadBalancerTarget({
    containerName: 'HostContainer',
    containerPort: 3000
  });

  const httpsTargetGroup = new ApplicationTargetGroup(stack, 'httpsUiContainerTargetGroup', {
    port: 80,
    targetType: TargetType.IP,
    vpc,
    healthCheck: {
      path: '/',
      port: '3000',
      protocol: Protocol.HTTP,
      timeout: Duration.seconds(30),
      interval: Duration.seconds(60)
    }
  });

  fargateServiceTarget.attachToApplicationTargetGroup(httpsTargetGroup);

  albListener.addTargetGroups('httpsUiContainer', {
    conditions: [ListenerCondition.httpRequestMethods(['GET', 'OPTIONS'])],
    priority: 2,
    targetGroups: [httpsTargetGroup]
  });

  new CfnOutput(stack, 'ecsClusterName', {
    value: cluster.clusterName
  });
  new CfnOutput(stack, 'ecsServiceName', {
    value: fargateService.serviceName
  });
}
