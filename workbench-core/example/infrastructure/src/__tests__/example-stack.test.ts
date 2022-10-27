/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ExampleStack } from '../example-stack';

describe('TestExampleStack', () => {
  test('Infrastructure Test', () => {
    const app = new App();
    const exampleStack = new ExampleStack(app, 'TestExamplStack');
    const exampleStackTemplate = Template.fromStack(exampleStack);
    expect(exampleStackTemplate).toMatchSnapshot();
  });
});
