import express, { Express } from 'express';
import { router } from '@amzn/workbench-core-express';
import serverlessExpress from '@vendia/serverless-express';

const app: Express = express();
app.use('/', router);

// const port: number = 3000;

// app.listen(port, () => {
//     console.log(`Server started at http://localhost:${port}`);
// });

exports.handler = serverlessExpress({ app });
