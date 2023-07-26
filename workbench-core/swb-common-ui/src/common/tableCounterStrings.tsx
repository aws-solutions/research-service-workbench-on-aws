/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export const getFilterCounterText = (count: number | undefined): string =>
  `${count} ${count === 1 ? 'match' : 'matches'}`;
