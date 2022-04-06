import express, { Express } from 'express';
import { router } from '@amzn/workbench-core-express';
import serverlessExpress from '@vendia/serverless-express';
import { Handler } from 'aws-lambda';

const app: Express = express();
app.use('/', router);
app.listen(8080);
const handler: Handler = serverlessExpress({ app });

export = handler;
