import express, { Request, Response, Router } from 'express';

export const router: Router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.sendStatus(200).send('Hello');
});

router.get('/user', (req: Request, res: Response) => {
  res.sendStatus(200).send('Hello user');
});
