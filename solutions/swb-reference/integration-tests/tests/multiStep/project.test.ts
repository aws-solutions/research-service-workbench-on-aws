/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../support/clientSession';
import { PaabHelper } from '../../support/complex/paabHelper';
import Setup from '../../support/setup';
import { generateRandomString, validSwbName } from '../../support/utils/utilities';

describe('multiStep project tests', () => {
  const paabHelper = new PaabHelper(1);
  let pa1Session: ClientSession;
  const setup: Setup = Setup.getSetup();
  let adminSession: ClientSession;
  let costCenterId: string;
  let projectName: string;
  let project1Id: string;

  beforeAll(async () => {
    ({ adminSession, pa1Session, project1Id } = await paabHelper.createResources(__filename));
  });

  beforeEach(async () => {
    const { data: costCenter } = await adminSession.resources.costCenters.create({
      name: 'project-integration-test-cost-center',
      accountId: setup.getSettings().get('defaultHostingAccountId'),
      description: 'a test object'
    });

    costCenterId = costCenter.id;
    projectName = generateRandomString(10, validSwbName);
  });

  afterAll(async () => {
    await paabHelper.cleanup();
    await setup.cleanup();
  });

  test('happy path', async () => {
    console.log('Creating Project');
    const { data: createdProject } = await adminSession.resources.projects.create({
      name: projectName,
      description: 'happy path--Project for TOP SECRET dragon research',
      costCenterId
    });

    console.log('Getting Project');
    const { data: getProjectAsITAdmin } = await adminSession.resources.projects
      .project(createdProject.id)
      .get();
    expect(getProjectAsITAdmin).toMatchObject(createdProject);

    const { data: getProjectAsPA } = await pa1Session.resources.projects.project(project1Id).get();
    expect(getProjectAsPA.id).toEqual(project1Id);

    const { data: getProjectAsResearcher } = await adminSession.resources.projects.project(project1Id).get();
    expect(getProjectAsResearcher.id).toEqual(project1Id);

    console.log('Listing Projects');
    const { data: listProject } = await adminSession.resources.projects.get({
      'filter[name][eq]': createdProject.name
    });
    expect(listProject.data).toEqual([createdProject]);

    console.log('Updating Project');
    const newName = generateRandomString(10, validSwbName);
    const newDescription = 'Happy path--Not a Project studying dragons';
    const { data: updatedProject } = await adminSession.resources.projects
      .project(createdProject.id)
      .update({ name: newName, description: newDescription }, true);
    expect(updatedProject).toMatchObject({ name: newName, description: newDescription });
    const { data: updatedProjectAsPA } = await adminSession.resources.projects
      .project(project1Id)
      .update({ description: newDescription }, true);
    expect(updatedProjectAsPA).toMatchObject({ name: getProjectAsPA.name, description: newDescription });

    console.log('Deleting Project');
    await adminSession.resources.projects.project(createdProject.id).delete();
    await pa1Session.resources.projects.project(project1Id).delete();

    console.log("Listing projects doesn't return deleted project");
    const { data: listProjectAfterDelete } = await adminSession.resources.projects.get({
      'filter[name][eq]': newName
    });
    expect(listProjectAfterDelete.data.length).toEqual(0);
  });

  test('createProject', async () => {
    console.log('Creating Project');
    const projectName = generateRandomString(10, validSwbName);
    const { data: createdProject1 } = await adminSession.resources.projects.create({
      name: projectName,
      description: 'My uniquely name project',
      costCenterId
    });

    console.log('Delete Project');
    // eslint-disable-next-line no-unused-expressions
    expect(await adminSession.resources.projects.project(createdProject1.id).delete()).resolves;

    console.log('Creating Project with name of deleted project');
    // eslint-disable-next-line no-unused-expressions
    const { data: createdProject2 } = await adminSession.resources.projects.create({
      name: projectName,
      description: 'Another project to replace my uniquely named project',
      costCenterId
    });

    console.log('Deleting New Project');
    // eslint-disable-next-line no-unused-expressions
    expect(await adminSession.resources.projects.project(createdProject2.id).delete()).resolves;
  });

  test('updateProject', async () => {
    console.log('Creating Two Projects');
    const { data: createdProject1 } = await adminSession.resources.projects.create({
      name: projectName,
      description: 'Currently top of my todo list',
      costCenterId
    });

    const otherName = generateRandomString(10, validSwbName);
    const { data: createdProject2 } = await adminSession.resources.projects.create({
      name: otherName,
      description: 'Backlog project',
      costCenterId
    });

    console.log('Deleting Project');
    // eslint-disable-next-line no-unused-expressions
    expect(await adminSession.resources.projects.project(createdProject1.id).delete()).resolves;

    console.log('Updating remaining project to have the same name as the deleted one');
    const newName = createdProject1.name;
    const newDescription = createdProject1.description;
    const { data: updatedProject } = await adminSession.resources.projects
      .project(createdProject2.id)
      .update({ name: newName, description: newDescription }, true);
    expect(updatedProject).toMatchObject({ name: newName, description: newDescription });

    console.log('Deleting Updated Project');
    // eslint-disable-next-line no-unused-expressions
    expect(await adminSession.resources.projects.project(createdProject2.id).delete()).resolves;
  });
});
