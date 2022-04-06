import express, { Request, Response, Router } from 'express';

export const router: Router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

router.get('/user', (req: Request, res: Response) => {
  res.send('Hello User');
});
