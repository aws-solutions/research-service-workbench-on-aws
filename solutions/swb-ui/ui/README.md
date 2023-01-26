# swb-ui

⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

## Code Coverage

| Statements | Branches | Functions | Lines |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-Unknown%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-Unknown%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-Unknown%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-Unknown%25-brightgreen.svg?style=flat) |

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Deploy UI to AWS

### Prerequisite:

Follow instructions [here](../swb-reference/SETUP_v2p1.md##installation) to setup installation of API.

### Deploy static website

#### ECS

To deploy the UI using ECS, make sure all code that needs to be deployed has been pushed to a remote branch in GitHub. Also, make sure to have the Docker daemon running locally.

1. Navigate to `solutions/swb-ui`

2. Run command `STAGE=<STAGE> rushx deploy-ui-and-api` to deploy origin/develop.
To use a specific branch, pass in the branch name as follows: `STAGE=<STAGE> BRANCH=<BRANCH_NAME> rushx deploy-ui-and-api`.

After the deployment is completed you'll see the following output:

```
✨  Deployment time: 183.7s

Outputs:
swb-<STAGE>-<awsRegionShortName>.APIGatewayAPIEndpoint67A1C4AD = https://<apiId>.execute-<region>.amazonaws.com/dev/
swb-<STAGE>-<awsRegionShortName>.AccountHandlerLambdaRoleOutput = accountrole
swb-<STAGE>-<awsRegionShortName>.ApiLambdaRoleOutput = ApiLambdaRoleOutput
swb-<STAGE>-<awsRegionShortName>.LaunchConstraintIamRoleNameOutput = LaunchConstraintIamRoleNameOutput
swb-<STAGE>-<awsRegionShortName>.S3BucketArtifactsArnOutput = S3BucketArtifactsArnOutput
swb-<STAGE>-<awsRegionShortName>.S3BucketDatasetsArnOutput = S3BucketDatasetsArnOutput
swb-<STAGE>-<awsRegionShortName>.SagemakerNotebookLaunchSSMDocOutput = SagemakerNotebookLaunchSSMDocOutput
swb-<STAGE>-<awsRegionShortName>.SagemakerNotebookTerminateSSMDocOutput = SagemakerNotebookTerminateSSMDocOutput
swb-<STAGE>-<awsRegionShortName>.StatusHandlerLambdaArnOutput = StatusHandlerLambdaArnOutput
swb-<STAGE>-<awsRegionShortName>.StatusHandlerLambdaRoleOutput = StatusHandlerLambdaRoleOutput
swb-<STAGE>-<awsRegionShortName>.apiUrlOutput = https://<apiId>.execute-<region>.amazonaws.com/dev/
swb-<STAGE>-<awsRegionShortName>.awsRegion = awsRegion
swb-<STAGE>-<awsRegionShortName>.awsRegionShortName = awsRegionShortName
swb-<STAGE>-<awsRegionShortName>.dynamoDBTableOutput = dynamoDBTableOutput
swb-<STAGE>-<awsRegionShortName>.uiClientURL = https://<id>.cloudfront.net
Stack ARN: ARN

✨  Total time: 186.07s
```
To navigate to the website, follow the link provided by `swb-<STAGE>-<awsRegionShortName>.uiClientURL`.

## Running UI App locally

### Prerequisite
Follow instructions [here](../swb-reference/SETUP_v2p1.md##installation) to setup installation of API.

### Start App

1. Navigate to `solutions/swb-ui/ui`

2. In the project directory, ensure all dependencies are installed. Run:
    ```
    rush update
    rush build
    ```

3. Run the server:
    ```
    STAGE=<STAGE> rushx dev
    ```

## App

Open [http://localhost:3000](http://localhost:3000) in your browser to access the app.


## End To End Tests

End to end testing is implemented in Service Workbench by using Cypress framework inside `swb-ui/ui/end-to-end-tests` directory


### Cypress Configuration

In order for end to end tests to run, Cypress needs environment variables such as website URL or user and password to login.
All environment variables for end to end testing are retrieved from `swb-ui/ui/end-to-end-tests/config/<STAGE>.yaml` and `swb-ui/infrastructure/src/config/<STAGE>.json`(generated after deploying UI) files and set inside `swb-ui/ui/cypress.config.ts`.


### Running End To End Tests

#### Prerequisite:
Follow the instructions [here](#deploy-ui-to-aws) to deploy the SWB UI to AWS. 

1. In `swb-ui/ui/end-to-end-tests/config` make a copy of `example.yaml` and name it `<STAGE>.yaml`. Uncomment the attributes and provide the appropriate config value.
2. Go to `swb-ui/ui` directory
3. Run command `STAGE=<STAGE> rushx e2e-test`


### Debugging End to End Tests

#### Prerequisite:

Follow the instructions [here](#deploy-ui-to-aws) to deploy the SWB UI to AWS. 


1. Go to `swb-ui/ui` directory
2. Run command `STAGE=<STAGE> rushx e2e-test:open`, a new Cypress window will be displayed
4. Select E2E Testing in Cypress Window
5. Select preferred browser to test
6. Click Start E2E Testing Button, this will open a page with all test cases.
7. Click the link with the test case name to run inside the grid, this will trigger the test case and display a list with all the steps the test case followed

Cypress will normally give a description for errors that happen during the test, for more details open the browser console. 


### Writing End To End Tests

In order for Cypress to read a test file, it must have the extension `.cy.ts` and be located in a folder inside `swb-ui/ui/end-to-end-tests/cypress`.
All Cypress configuration and env variables logic is contained in `swb-ui/ui/cypress.config.ts` file.

To create a new test case that needs authentication, the command `cy.login('<role>')` must be used, login state will not be saved in between test cases but we can invoke function `beforeEach(()=> {})` at the begining of the test to make a function run before every test in that file.

Example of code with login

```ts
describe('Page routing', () => {
  it('Should navigate to /environments after login as IT Admin', async () => {
    cy.login('ITAdmin');
    cy.location('pathname').should('eq', '/environments');
  });
});
```

Example of code with `beforeEach(()=> {})`

```ts
describe('Redirects IT Admin', () => {
  beforeEach(()=> {
    cy.login('ITAdmin');
  });
  it('Should navigate to /environments after login', async () => {
    cy.location('pathname').should('eq', '/environments');
  });

  it('Should navigate to /environments/new on create click', async () => {
    cy.get('[data-testid="createEnvironment"]').click();
    cy.location('pathname').should('eq', '/environments/new');
  });
});
```
For more information about Cypress and End to End tests good practices visit [Cypress Documentation](https://docs.cypress.io/guides/references/best-practices).



## Design system

For the design system we are using @cloudscape-design project. More information can be found on the [Cloudscape Design site](https://cloudscape.design/). 

