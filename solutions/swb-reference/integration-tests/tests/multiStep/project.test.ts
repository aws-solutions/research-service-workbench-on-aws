/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';

describe('multiStep project tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let costCenterId: string;

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();

    const { data: costCenter } = await adminSession.resources.costCenters.create({
      name: 'project integration test cost center',
      accountId: setup.getSettings().get('defaultHostingAccountId'),
      description: 'a test object'
    });

    costCenterId = costCenter.id;
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('happy path', async () => {
    console.log('Creating Project');
    const { data: createdProject } = await adminSession.resources.projects.create({
      name: 'Dragon Project',
      description: 'Project for TOP SECRET dragon research',
      costCenterId
    });

    console.log('Getting Project');
    const { data: getProject } = await adminSession.resources.projects.project(createdProject.id).get();
    expect(getProject).toMatchObject(createdProject);

    console.log('Listing Projects');
    const { data: listProject } = await adminSession.resources.projects.get({
      'filter[name][eq]': 'Dragon Project'
    });
    expect(listProject.data.length).toEqual(1);
    expect(listProject.data[0]).toMatchObject(createdProject);

    console.log('Updating Project');
    const newName = 'Totally Normal Project';
    const newDescription = 'Not a Project studying dragons!';
    const { data: updatedProject } = await adminSession.resources.projects
      .project(createdProject.id)
      .update({ name: newName, description: newDescription }, true);
    expect(updatedProject).toMatchObject({ name: newName, description: newDescription });

    console.log('Deleting Project');
    // eslint-disable-next-line no-unused-expressions
    expect(await adminSession.resources.projects.project(createdProject.id).softDelete()).resolves;

    console.log("Listing projects doesn't return deleted project");
    const { data: listProjectAfterDelete } = await adminSession.resources.projects.get({
      'filter[name][eq]': 'Totally Normal Project'
    });
    expect(listProjectAfterDelete.data.length).toEqual(0);
  });

  test('createProject', async () => {
    console.log('Creating Project');
    const projectName = 'Unique Name!';
    const { data: createdProject1 } = await adminSession.resources.projects.create({
      name: projectName,
      description: 'My uniquely name project',
      costCenterId
    });

    console.log('Delete Project');
    // eslint-disable-next-line no-unused-expressions
    expect(await adminSession.resources.projects.project(createdProject1.id).softDelete()).resolves;

    console.log('Creating Project with name of deleted project');
    // eslint-disable-next-line no-unused-expressions
    const { data: createdProject2 } = await adminSession.resources.projects.create({
      name: projectName,
      description: 'Another project to replace my uniquely named project',
      costCenterId
    });

    console.log('Deleting New Project');
    // eslint-disable-next-line no-unused-expressions
    expect(await adminSession.resources.projects.project(createdProject2.id).softDelete()).resolves;
  });

  test('updateProject', async () => {
    console.log('Creating Two Projects');
    const { data: createdProject1 } = await adminSession.resources.projects.create({
      name: 'Top Priority Project',
      description: 'Currently top of my todo list',
      costCenterId
    });
    const { data: createdProject2 } = await adminSession.resources.projects.create({
      name: 'Other Project',
      description: 'Backlog project',
      costCenterId
    });

    console.log('Deleting Project');
    // eslint-disable-next-line no-unused-expressions
    expect(await adminSession.resources.projects.project(createdProject1.id).softDelete()).resolves;

    console.log('Updating remaining project to have the same name as the deleted one');
    const newName = createdProject1.name;
    const newDescription = createdProject1.description;
    const { data: updatedProject } = await adminSession.resources.projects
      .project(createdProject2.id)
      .update({ name: newName, description: newDescription }, true);
    expect(updatedProject).toMatchObject({ name: newName, description: newDescription });

    console.log('Deleting Updated Project');
    // eslint-disable-next-line no-unused-expressions
    expect(await adminSession.resources.projects.project(createdProject2.id).softDelete()).resolves;
  });
});
