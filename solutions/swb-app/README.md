# Code Coverage
| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-Unknown%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-Unknown%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-Unknown%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-Unknown%25-brightgreen.svg?style=flat) |
# Getting Started with [Fastify-CLI](https://www.npmjs.com/package/fastify-cli)
This project was bootstrapped with Fastify-CLI.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

To start the app in dev mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm start`

For production mode

### `npm run test`

Run the test cases.

## Learn More

To learn Fastify, check out the [Fastify documentation](https://www.fastify.io/docs/latest/).

## Update static auth configs
To add or remove routes, update `src/staticRouteConfig.ts`. The `routesMap` must contain any routes that require authorization. Routes are formatted with the key string representing the route as a string or regex pattern (this allows for variable path params). The value is an object containing each method type that is authorized, along with an object containing a subject and an action and a header. Actions should be limited to "CREATE", "READ", "UPDATE", or "DELETE". Subjects are defined to match what will be added to `src/staticPermissionsConfig.ts`.

There are permissions for Admin and Researcher defined in `src/staticPermissionsConfig.ts`. The permissions are lists of objects containing an effect, action, and subject. Effect can be "ALLOW" or "DENY" (note default behavior is to deny any route methods that are not defined here). Action and subject must match what is defined in the `staticRouteConfig` in order to allow a user of the respective group to be able to access the given route.
