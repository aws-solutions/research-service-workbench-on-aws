/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { App, Aspects } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AwsSolutionsChecks } from 'cdk-nag';
import { ExampleStack } from '../example-stack';

describe('TestExampleStack', () => {
  test('Infrastructure Test', () => {
    const app = new App();
    const exampleStack = new ExampleStack(app, 'ExampleStack');
    const exampleStackTemplate = Template.fromStack(exampleStack);
    Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
    expect(exampleStackTemplate).toMatchSnapshot();
  });
});
