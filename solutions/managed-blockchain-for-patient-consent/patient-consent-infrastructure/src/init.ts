import { mainRouter } from '@amzn/patient-consent-express';
import serverlessExpress from '@vendia/serverless-express';
import express, { Express } from 'express';

const app: Express = express();
app.use('/', mainRouter);

exports.handler = serverlessExpress({ app });
