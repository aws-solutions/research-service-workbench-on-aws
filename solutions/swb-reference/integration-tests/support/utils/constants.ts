/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
//Average start waiting time is 5 minutes, setting start max waiting to 8 minutes
export const ENVIRONMENT_START_MAX_WAITING_SECONDS: number = 480;

//Average start waiting time is 2 minutes, setting start max waiting to 3:30 minutes
export const ENVIRONMENT_STOP_MAX_WAITING_SECONDS: number = 210;

//Average start waiting time is 1:30 minutes, setting start max waiting to 3 minutes
export const ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS: number = 180;

export const ENVIRONMENT_STOP_AND_TERMINATE_MAX_WAITING_SECONDS: number =
  ENVIRONMENT_STOP_MAX_WAITING_SECONDS + ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS;
