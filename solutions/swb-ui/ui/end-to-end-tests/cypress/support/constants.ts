/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
export const ADMIN_PASSWORD_PROPERTY: string = 'ADMIN_PASSWORD';
export const ADMIN_USER_PROPERTY: string = 'ADMIN_USER';
export const COGNITO_DOMAIN_NAME_PROPERTY: string = 'COGNITO_DOMAIN_NAME';
export const ENVIRONMENT_TYPES_PROPERTY: string = 'ENVIRONMENT_TYPES';
export const ENVIRONMENT_PROJECT_PROPERTY: string = 'ENVIRONMENT_PROJECT';
export const ENVIRONMENT_STUDIES_PROPERTY: string = 'ENVIRONMENT_STUDIES';
export const CLEAN_UP_ENVIRONMENTS: string = 'CLEAN_UP_ENVIRONMENTS';

//Average start waiting time is 5 minutes, setting start max waiting to 10 minutes
export const ENVIRONMENT_START_MAX_WAITING_MILISECONDS: number = 600000;

//Average start waiting time is 2 minutes, setting start max waiting to 4 minutes
export const ENVIRONMENT_STOP_MAX_WAITING_MILISECONDS: number = 240000;

//Average start waiting time is 1:30 minutes, setting start max waiting to 3 minutes
export const ENVIRONMENT_TERMINATE_MAX_WAITING_MILISECONDS: number = 180000;

//From creating to starting the environments grid sometimes take ~10 seconds to show the created env
export const ENVIRONMENT_STARTNG_MAX_WAITING_MILISECONDS: number = 20000;

//Avoid throttling when connecting to multiple environments
export const DEFLAKE_DELAY_IN_MILLISECONDS: number = 2000;

//Loading environments grid for cleanup as we cannot wait for rows to load
export const CLEANUP_WAIT_ENVIRONMENTS_GRID_IN_MILISECONDS: number = 4000;

export const ENVIRONMENT_TABLE_DATA_TEST_ID: string = 'environmentTable';
