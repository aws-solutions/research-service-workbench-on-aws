# Service Workbench App

## Code Coverage

| Statements | Branches | Functions | Lines |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-Unknown%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-Unknown%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-Unknown%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-Unknown%25-brightgreen.svg?style=flat) |

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Retrieve API URL

In order to run the application We need to setup the base API URL environment variable first.

Copy API URL from [Installation](../swb-reference/SETUP_v2p1.md##deploy-the-code) step.

Look for the cloud formation output `APIGatewayAPIEndpoint`. The API URL has the format `https://{api}.{region}.amazonaws.com/dev/`

API URL can also be found by login to aws with Main Account:

1. Select Services menu 

1. Select API Gateway option

1. In APis grid select the API created

1. Select Dashboard option on the left panel

1. URL will be displayed at the top of the page with the format `Invoke this API at: <API_URL>`


Assign value to environment variable `NEXT_PUBLIC_API_BASE_URL="<API_URL>"`

For local instances, in `swb-ui` directory create a file with name `.env.local` containing the API URL variable with the format:
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


## Design system

For the design system we are using @awsui project. More information can be found on its [website](https://polaris.a2z.com) or [GitHub](https://github.com/aws/awsui-documentation).

## Deploy Applcation

Make sure to follow instructions [Retrieve API URL](##retrieve-api-url) and assign value to `NEXT_PUBLIC_API_BASE_URL` in `.env.local` before starting next steps for deploy process.

### Setuo Config File
1. Navigate to `solutions/swb-ui/cdk/infrastructure/src/config`
1. Copy `solutions/swb-ui/cdk/infrastructure/src/config/example.yaml` and create a new file in the format `<STAGE>.yaml` in the config folder. The stage value uniquely identifies this deployment. Some common values that can be used are `dev`, `beta`, and `gamma`.`
1. Open your new `<STAGE>.yaml` file and uncomment the `stage` attribute. Provide the correct `<STAGE>` value for the attribute
1. Open your new `<STAGE>.yaml` file and uncomment `awsRegion` and `awsRegionShortName`. `aws-region` value can be one of the values on this [table](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html#Concepts.RegionsAndAvailabilityZones.Regions), under the `Region` column. `awsRegionName` can be a two or three letter abbreviation for that region, of your own choosing. The `awsRegion` value will determine which region SWBv2 is deployed in.
1. Open your new `<STAGE>.yaml` file and uncomment the `apiBaseUrl` attribute. Provide `apiBaseUrl` value from step [Retrieve API URL](##retrieve-api-url).
1. Run `chmod 777 <STAGE>.yaml` to allow local script to read the file

### Export Site
In order to deploy application we need to export the application as a static website
1. Navigate to `solutions/swb-ui/`
1. Run command `rushx export`

### Deploy static website
1. Navigate to `solutions/swb-ui/cdk/infrastructure`
1. Run commands
```
rushx build
STAGE=<STAGE> cdk deploy

```
