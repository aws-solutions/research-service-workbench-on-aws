/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/**
 * Available log levels (highest to lowest priority):
 *
 * error: 0,
 * warn: 1,
 * info: 2,
 * http: 3,
 * verbose: 4,
 * debug: 5,
 * silly: 6
 *
 */
export type LogLevel = 'silly' | 'debug' | 'verbose' | 'http' | 'info' | 'warn' | 'error';
