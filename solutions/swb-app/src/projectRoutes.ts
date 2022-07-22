import { ProjectService } from '@amzn/environments';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';

export function setUpProjectRoutes(router: Router, projectService: ProjectService): void {
  // Get projects
  router.get(
    '/projects',
    wrapAsync(async (req: Request, res: Response) => {
      const projects = await projectService.listProjects();
      res.send(projects);
    })
  );
}
