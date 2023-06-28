/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../clientSession';
import CollectionResource from '../base/collectionResource';
import Project from './project';

export default class Projects extends CollectionResource {
  public constructor(clientSession: ClientSession, parentApi: string = '') {
    super(clientSession, 'projects', 'project');
    const parentRoute = parentApi ? `${parentApi}/` : '';
    this._api = `${parentRoute}projects`;
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public project(id: string): Project {
    return new Project(id, this._clientSession, this._api);
  }
}
