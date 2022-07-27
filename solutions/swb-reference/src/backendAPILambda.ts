import serverlessExpress from '@vendia/serverless-express';
import backendAPIApp from './backendAPI';

exports.handler = serverlessExpress({ app: backendAPIApp });
