/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

type JSONValue = string | number | boolean | { [x: string]: JSONValue } | Array<JSONValue>;

export default JSONValue;
