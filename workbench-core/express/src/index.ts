import serverlessExpress from '@vendia/serverless-express';
import { Handler } from 'aws-lambda';
import app from './app';

const handler: Handler = serverlessExpress({ app });

export = handler;
