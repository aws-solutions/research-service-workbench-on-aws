/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export default interface EnvironmentConnectionLinkPlaceholder {
  type: 'link';
  hrefKey: string; // key value should be returned from `environmentConnectionService.getAuthCreds()`. The link will direct users to the URL defined at `hrefKey`
  text: string; // text value of the link as displayed to the user
}
