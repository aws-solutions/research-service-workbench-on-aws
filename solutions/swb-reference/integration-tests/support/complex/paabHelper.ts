/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../clientSession';
import Setup from '../setup';
import RandomTextGenerator from '../utils/randomTextGenerator';

interface PaabResources {
  adminSession: ClientSession;
  pa1Session: ClientSession;
  pa2Session: ClientSession;
  rs1Session: ClientSession;
  project1Id: string;
  project2Id: string;
}

export class PaabHelper {
  private _setup: Setup;
  private _randomTextGenerator: RandomTextGenerator;

  public constructor() {
    this._setup = new Setup();
    this._randomTextGenerator = new RandomTextGenerator(this._setup.getSettings().get('runId'));
  }

  public async createResources(): Promise<PaabResources> {
    // create IT admin session
    const adminSession: ClientSession = await this._setup.getDefaultAdminSession();

    // set up new cost center
    const { data: costCenter } = await adminSession.resources.costCenters.create({
      name: this._randomTextGenerator.getFakeText('fakeCostCenterName'),
      accountId: this._setup.getSettings().get('defaultHostingAccountId'),
      description: 'Cost Center for integ test'
    });

    // create two projects
    const ProjectNames: string[] = ['Project1', 'Project2'];
    const projectIds: string[] = [];

    for (const projectName of ProjectNames) {
      // must follow Array order
      const projectResponse = await adminSession.resources.projects.create({
        name: this._randomTextGenerator.getFakeText(projectName),
        description: `${projectName} for integ tests`,
        costCenterId: costCenter.id
      });
      projectIds.push(projectResponse.data.id);
    }
    const [project1Id, project2Id] = projectIds;

    // create PA1, PA2, Researcher1 sessions
    let pa1Session: ClientSession = await this._setup.getSessionForUserType('projectAdmin1');
    let pa2Session: ClientSession = await this._setup.getSessionForUserType('projectAdmin2');
    let rs1Session: ClientSession = await this._setup.getSessionForUserType('researcher1');

    // associate users with corresponding projects properly (as IT Admin)
    console.log(`projects: ${projectIds}`);
    console.log(`project1Id: ${project1Id}`);
    console.log(`pa1SessionUserId: ${pa1Session.getUserId()!}`);
    await adminSession.resources.projects
      .project(project1Id)
      .assignUserToProject(pa1Session.getUserId()!, { role: 'ProjectAdmin' });
    await adminSession.resources.projects
      .project(project2Id)
      .assignUserToProject(pa2Session.getUserId()!, { role: 'ProjectAdmin' });
    await adminSession.resources.projects
      .project(project1Id)
      .assignUserToProject(rs1Session.getUserId()!, { role: 'Researcher' });

    pa1Session = await this._setup.getSessionForUserType('projectAdmin1');
    pa2Session = await this._setup.getSessionForUserType('projectAdmin2');
    rs1Session = await this._setup.getSessionForUserType('researcher1');

    return {
      adminSession,
      pa1Session,
      pa2Session,
      rs1Session,
      project1Id,
      project2Id
    };
  }

  public async cleanup(): Promise<void> {
    await this._setup.cleanup();
  }
}
