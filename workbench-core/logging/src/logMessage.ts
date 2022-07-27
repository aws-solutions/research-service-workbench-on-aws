/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export type LogMessagePrimitive = number | string | boolean;

export type LogMessageArray = (LogMessagePrimitive | LogMessageArray | LogMessageObject)[];

export interface LogMessageObject {
  [key: string]: LogMessagePrimitive | LogMessageArray | this;
}

export type LogMessage = LogMessagePrimitive | LogMessageArray | LogMessageObject | Error;

export type LogMessageMeta = LogMessageObject | Error;
