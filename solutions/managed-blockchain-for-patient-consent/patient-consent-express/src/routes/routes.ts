import { Request, Response, Router } from 'express';

export const router: Router = Router();

router.get('/patient', async (req: Request, res: Response) => {
  const response = {
    body: 'Patient API'
  };
  res.send(response.body);
});
router.get('/organization', async (req: Request, res: Response) => {
  const response = {
    body: 'Organization API'
  };
  res.send(response.body);
});
router.get('/consent', async (req: Request, res: Response) => {
  const response = {
    body: 'Consent API'
  };
  res.send(response.body);
});
