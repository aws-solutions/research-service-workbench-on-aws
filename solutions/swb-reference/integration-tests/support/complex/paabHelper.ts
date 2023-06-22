/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import {
  CreateDataSetRequest,
  CreateDataSetRequestParser
} from '@aws/swb-app/lib/dataSets/createDataSetRequestParser';
import ClientSession from '../clientSession';
import Setup from '../setup';
import RandomTextGenerator from '../utils/randomTextGenerator';

interface PaabResources {
  adminSession: ClientSession;
  pa1Session: ClientSession;
  pa2Session: ClientSession;
  rs1Session: ClientSession;
  anonymousSession: ClientSession;
  project1Id: string;
  project2Id: string;
  project3Id: string;
}

export class PaabHelper {
  private _setup: Setup;
  private _randomTextGenerator: RandomTextGenerator;
  private _outputError: boolean | undefined;
  private _numberOfProjects: number = 3;

  public constructor(numberOfProjects?: number, outputError?: boolean) {
    this._setup = Setup.getSetup();
    this._randomTextGenerator = new RandomTextGenerator(this._setup.getSettings().get('runId'));
    this._outputError = outputError;
    if (numberOfProjects) this._numberOfProjects = numberOfProjects;
  }

  public async createResources(filename: string): Promise<PaabResources> {
    if (this._numberOfProjects > 3) {
      throw new Error('PaabHelper cannot support more than 3 projects');
    }

    // create IT admin session
    const adminSession: ClientSession = await this._setup.getDefaultAdminSession(this._outputError);
    const anonymousSession: ClientSession = await this._setup.createAnonymousSession();
    // Example: lib/integration-tests/tests/isolated/datasets/create.test.ts => isolated-datasets-create
    const testName: string = filename
      .replace(/.test.js/g, '')
      .split('/')
      .slice(-3)
      .join('-');
    console.log(testName);

    // set up new cost center
    const { data: costCenter } = await adminSession.resources.costCenters.create({
      name: this._randomTextGenerator.getFakeText('fakeCostCenterName'),
      accountId: this._setup.getSettings().get('defaultHostingAccountId'),
      description: 'Cost Center for integ test'
    });
    const projectIds: string[] = [];

    for (let i = 1; i <= this._numberOfProjects; i++) {
      const projectName = `Project${i}`;
      const projectResponse = await adminSession.resources.projects.create({
        name: testName + this._randomTextGenerator.getFakeText(projectName),
        description: `${projectName} for integ tests ${testName}`,
        costCenterId: costCenter.id
      });
      projectIds.push(projectResponse.data.id);
    }

    const [project1Id, project2Id, project3Id] = projectIds;

    // create PA1, PA2, Researcher1 sessions
    const pa1Session: ClientSession = await this._setup.getSessionForUserType(
      'projectAdmin1',
      this._outputError
    );
    const pa2Session: ClientSession = await this._setup.getSessionForUserType(
      'projectAdmin2',
      this._outputError
    );
    const rs1Session: ClientSession = await this._setup.getSessionForUserType(
      'researcher1',
      this._outputError
    );

    // associate users with corresponding projects properly (as IT Admin)
    if (this._numberOfProjects >= 1) {
      await adminSession.resources.projects
        .project(project1Id)
        .assignUserToProject(pa1Session.getUserId()!, { role: 'ProjectAdmin' });
      await adminSession.resources.projects
        .project(project1Id)
        .assignUserToProject(rs1Session.getUserId()!, { role: 'Researcher' });
    }
    if (this._numberOfProjects >= 2) {
      await adminSession.resources.projects
        .project(project2Id)
        .assignUserToProject(pa2Session.getUserId()!, { role: 'ProjectAdmin' });
    }
    if (this._numberOfProjects === 3) {
      await adminSession.resources.projects
        .project(project3Id)
        .assignUserToProject(pa1Session.getUserId()!, { role: 'ProjectAdmin' });
      await adminSession.resources.projects
        .project(project3Id)
        .assignUserToProject(rs1Session.getUserId()!, { role: 'Researcher' });
    }

    return {
      adminSession,
      pa1Session,
      pa2Session,
      rs1Session,
      anonymousSession,
      project1Id,
      project2Id,
      project3Id
    };
  }

  public createDatasetRequest(projectId: string): CreateDataSetRequest {
    const settings = this._setup.getSettings();
    const dataSetName = this._randomTextGenerator.getFakeText('integration-test-dataSet');

    return CreateDataSetRequestParser.parse({
      storageName: settings.get('DataSetsBucketName'),
      awsAccountId: settings.get('mainAccountId'),
      path: dataSetName, // using same name to help potential troubleshooting
      name: dataSetName,
      region: settings.get('awsRegion'),
      type: 'internal'
    });
  }

  public async cleanup(): Promise<void> {
    await this._setup.cleanup();
  }
}
