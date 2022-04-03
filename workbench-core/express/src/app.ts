import express, { Express, Request, Response } from 'express';

const app: Express = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

const port: number = 8080;

app.listen(port, () => {
  console.log('Server started at http://localhost:' + port);
});

export = app;
