import express, { Express } from 'express';
import { router } from '@amzn/workbench-core-express';
import serverlessExpress from '@vendia/serverless-express';

const app: Express = express();
app.use('/', router);

exports.handler = serverlessExpress({ app });
