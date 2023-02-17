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
  project1: { id: string };
  project2: { id: string };
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
    const projects: { id: string }[] = [];

    for (const projectName of ProjectNames) {
      // must follow Array order
      const projectResponse = await adminSession.resources.projects.create({
        name: this._randomTextGenerator.getFakeText(projectName),
        description: `${projectName} for integ tests`,
        costCenterId: costCenter.id
      });
      projects.push(projectResponse.data);
    }
    const [project1, project2]: { id: string }[] = projects;

    // create PA1, PA2, Researcher1 sessions
    const pa1Session: ClientSession = await this._setup.getSessionForUserType('projectAdmin1');
    const pa2Session: ClientSession = await this._setup.getSessionForUserType('projectAdmin2');
    const rs1Session: ClientSession = await this._setup.getSessionForUserType('researcher1');

    // associate users with corresponding projects properly (as IT Admin)
    await adminSession.resources.projects
      .project(project1.id)
      .assignUserToProject(pa1Session.getUserId()!, { role: 'ProjectAdmin' });
    await adminSession.resources.projects
      .project(project2.id)
      .assignUserToProject(pa2Session.getUserId()!, { role: 'ProjectAdmin' });
    await adminSession.resources.projects
      .project(project1.id)
      .assignUserToProject(rs1Session.getUserId()!, { role: 'Researcher' });

    return {
      adminSession,
      pa1Session,
      pa2Session,
      rs1Session,
      project1,
      project2
    };
  }

  public async cleanup(): Promise<void> {
    await this._setup.cleanup();
  }
}
