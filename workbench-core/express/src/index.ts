// import serverlessExpress from '@vendia/serverless-express';
// import { Handler } from 'aws-lambda';
// import app from './app';

// const port: number = 8080;

// app.listen(port, () => {
//   console.log('Server started at http://localhost:' + port);
// });

// const handler: Handler = serverlessExpress({ app });

// export = handler;

export * from './routes/default';
