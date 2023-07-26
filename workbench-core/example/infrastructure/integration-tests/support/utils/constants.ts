/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
//Average start waiting time is 5 minutes, setting start max waiting to 10 minutes
export const ENVIRONMENT_START_MAX_WAITING_SECONDS: number = 600;

//Average start waiting time is 2 minutes, setting start max waiting to 4 minutes
export const ENVIRONMENT_STOP_MAX_WAITING_SECONDS: number = 240;

//Average start waiting time is 1:30 minutes, setting start max waiting to 3 minutes
export const ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS: number = 180;

export const DEFAULT_POLLING_INTERVAL_SECONDS: number = 15;

export const DEFAULT_POLLING_MAX_WAITING_SECONDS: number = 600;

export const DEFLAKE_DELAY_IN_MILLISECONDS: number = 2000;
