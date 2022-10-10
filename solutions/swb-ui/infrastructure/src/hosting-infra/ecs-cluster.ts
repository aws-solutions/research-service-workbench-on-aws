/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Duration } from 'aws-cdk-lib';
import { Dashboard, GraphWidget } from 'aws-cdk-lib/aws-cloudwatch';
import { InstanceType, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { SWBUIStack } from '../SWBUIStack';

export function createECSCluster(stack: SWBUIStack, vpcId: string = ''): void {
  // Create VPC, or use config-entered VPC
  const vpc = vpcId === '' ? new Vpc(stack, 'MainVPC', {}) : Vpc.fromLookup(stack, 'MainVPC', { vpcId });

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
    image: ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
    memoryLimitMiB: 1024,
    portMappings: [{ containerPort: 80 }]
  });

  // Creating ALB resources just so ECS provisioning could complete,
  // and dashboard to help us during future performance testing
  const dashboard = new Dashboard(stack, 'Dashboard', {
    dashboardName: 'AutoScaleDashboard'
  });

  const albService = new ApplicationLoadBalancedFargateService(stack, 'AutoScalingService', {
    cluster: cluster,
    taskDefinition,
    desiredCount: 2,
    securityGroups: [new SecurityGroup(stack, 'ContainerSecurityGroup', { vpc })],
    // stack may need to be adjusted if the container takes a while to start up
    healthCheckGracePeriod: Duration.seconds(30)
  });

  const scalableTaskCount = albService.service.autoScaleTaskCount({
    minCapacity: 2,
    maxCapacity: 10
  });

  scalableTaskCount.scaleOnCpuUtilization('CpuUtilizationScaling', {
    targetUtilizationPercent: 50,
    scaleInCooldown: Duration.seconds(60),
    scaleOutCooldown: Duration.seconds(60)
  });

  const cpuUtilizationMetric = albService.service.metricCpuUtilization({
    period: Duration.minutes(1),
    label: 'CPU Utilization'
  });

  dashboard.addWidgets(
    new GraphWidget({
      left: [cpuUtilizationMetric],
      width: 12,
      title: 'CPU Utilization'
    })
  );
}
