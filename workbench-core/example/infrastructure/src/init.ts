import { router } from '@amzn/workbench-core-example-express';
import serverlessExpress from '@vendia/serverless-express';
import express, { Express } from 'express';

const app: Express = express();
app.disable('x-powered-by');
app.use('/', router);

exports.handler = serverlessExpress({ app });
