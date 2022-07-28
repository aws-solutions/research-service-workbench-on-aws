##This script must only run by using command `STAGE=<STAGE> rushx deploy-ui-and-api` from `/swb-ui` directory, running this script directly from this directory will not work correctly as it needs to change folders
(rushx build && rushx export) && 
(
    cd infrastructure 
    rushx cdk bootstrap && rushx cdk-deploy
) &&
(
    cd ../swb-reference/ 
    rushx cdk-deploy
)