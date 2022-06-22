# Service Workbench App

## Code Coverage

| Statements | Branches | Functions | Lines |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-Unknown%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-Unknown%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-Unknown%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-Unknown%25-brightgreen.svg?style=flat) |

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

In order to run the application We need to setup the base API Url environment variable first.
-Copy API url from [Installation](../swb-reference/SETUP_v2p1.md) '### Deploy the code' step on the <APIGatewayAPIEndpoint> output from cloud formation. API url has the next format "https://{api}.{region}.amazonaws.com/dev/".
API url can also be found by login to aws with Main Account:
    -Select Services menu 
    -Select API Gateway option
    -In APis grid select the API created
    -Select Dashboard option on the left panel
    -Url will be shown at the top of the page with the format "Invoke this API at: <API_URL>"

-Assign value to environment variable NEXT_PUBLIC_API_BASE_URL=<API_URL>
-For local instances, in swb-ui directory create a file with name .env.local containing the API url variable with the next format:
  NEXT_PUBLIC_API_BASE_URL=<API_URL>




In the project directory, ensure all dependencies are installed. Run:
```
rush update
rush build
```
Run the server:

```
rushx start
```

If needed, run the development server with:
```
yarn dev
```

## App

Open [http://localhost:3000](http://localhost:3000) in your browser to access the app.

The environments page is at [http://localhost:3000/environments](http://localhost:3000/environments).

## API

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/environments](http://localhost:3000/api/environments).


## Design system

For the design system we are using @awsui project. More information can be found on its [website](https://polaris.a2z.com) or [GitHub](https://github.com/aws/awsui-documentation).
