/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import {
  CognitoIdentityProvider,
  GroupType,
  paginateAdminListGroupsForUser
} from '@aws-sdk/client-cognito-identity-provider';

export default class CognitoService {
  private _cognito: CognitoIdentityProvider;
  public constructor(cognito: CognitoIdentityProvider) {
    this._cognito = cognito;
  }
  /*
   * Get groups of a user
   */
  public async getUserGroups(userPoolId: string, userName: string): Promise<GroupType[]> {
    const groups = [];
    for await (const page of paginateAdminListGroupsForUser(
      { client: this._cognito },
      { UserPoolId: userPoolId, Username: userName }
    )) {
      // page contains a single paginated output.
      groups.push(...(page.Groups as GroupType[]));
    }
    return groups;
  }
}
