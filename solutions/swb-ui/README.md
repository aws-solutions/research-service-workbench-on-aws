# Service Workbench App

## Code Coverage

| Statements | Branches | Functions | Lines |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-Unknown%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-Unknown%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-Unknown%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-Unknown%25-brightgreen.svg?style=flat) |

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

## Run App

### Prerequisite

1. Follow instructions in [Installation](../swb-reference/SETUP_v2p1.md##deploy-the-code) 


### Start App

1. Navigate to `solutions/swb-reference/src/config/<STAGE>.js`

2. Copy value from variable `apiUrlOutput`, the value has the format `https://{apiId}.execute-api.{region}.amazonaws.com/dev/`

3. Assign value to environment variable `NEXT_PUBLIC_API_BASE_URL="<apiUrlOutput>"`


For local instances, in `swb-ui` directory, create a file with name `.env.local` containing the API URL variable with the format:
```
NEXT_PUBLIC_API_BASE_URL="<API_URL>"
```

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
rushx dev
```

## App

Open [http://localhost:3000](http://localhost:3000) in your browser to access the app.

The environments page is at [http://localhost:3000/environments](http://localhost:3000/environments).

## API

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/environments](http://localhost:3000/api/environments).


## Deploy UI

### Prerequisite:

1. Make sure to Follow instructions in [Installation](../swb-reference/SETUP_v2p1.md##deploy-the-code) 


### Deploy static website

Project swb-ui can be deployed as a static website using S3 Bucket and CloudFront by following the next steps:

1. Navigate to `solutions/swb-ui`

2. Run command `STAGE=<STAGE> rushx deploy`

```

After the deployment is completed you'll see the following output:

```
Outputs:
swb-ui-dev-va.S3BucketArtifactsArnOutput = arn:aws:s3:::swb-ui-dev-va-arn-id
swb-ui-dev-va.WebsiteURL = https://domainId.cloudfront.net
Stack ARN:
arn:aws:cloudformation:region:account:stack/swb-ui-dev-va/id

✨  Total time: 250.4s
```
To navigate to the website, follow the link provided by `swb-ui-dev-va.WebsiteURL`.


## Design system

For the design system we are using @awsui project. More information can be found on its [website](https://polaris.a2z.com) or [GitHub](https://github.com/aws/awsui-documentation).