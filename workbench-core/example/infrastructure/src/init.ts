import { router } from '@amzn/workbench-core-express';
import serverlessExpress from '@vendia/serverless-express';
import express, { Express } from 'express';

const app: Express = express();
app.use('/', router);

exports.handler = serverlessExpress({ app });
