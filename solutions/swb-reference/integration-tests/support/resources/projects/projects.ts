/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../clientSession';
import CollectionResource from '../base/collectionResource';
import Project from './project';

export default class Projects extends CollectionResource {
  public constructor(clientSession: ClientSession) {
    super(clientSession, 'projects', 'project');
    this._api = 'projects';
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public project(id: string): Project {
    return new Project(id, this._clientSession, this._api);
  }
}
