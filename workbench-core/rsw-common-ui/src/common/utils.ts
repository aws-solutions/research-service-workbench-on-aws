/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export const nameRegex: RegExp = new RegExp('^[A-Za-z]{1}[A-Za-z0-9-\\s]*$');

/* eslint-disable security/detect-unsafe-regex */
export const cidrRegex: RegExp = new RegExp(
  '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])[.]){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(/(3[0-2]|[1-2][0-9]|[0-9]))$'
);

export const emailRegex: RegExp = new RegExp(
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,4}))$/
);
/* eslint-enable security/detect-unsafe-regex */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const convertToRecord = (queryObject: any): Record<string, string> => {
  const result: Record<string, string> = {};
  if (!queryObject) return result;
  Object.entries(queryObject).forEach(([key, value]) => {
    // eslint-disable-next-line security/detect-object-injection
    if (value) result[key] = value as string;
  });

  return result;
};
