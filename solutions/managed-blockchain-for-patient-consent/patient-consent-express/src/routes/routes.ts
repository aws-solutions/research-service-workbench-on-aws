import { Request, Response, Router } from 'express';

export const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  const response = {
    body: 'Hello World'
  };
});
