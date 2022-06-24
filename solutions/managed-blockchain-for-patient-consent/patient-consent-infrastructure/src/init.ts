import serverlessExpress from '@vendia/serverless-express';
import express, { Express } from 'express';

const app: Express = express();

exports.handler = serverlessExpress({ app });
