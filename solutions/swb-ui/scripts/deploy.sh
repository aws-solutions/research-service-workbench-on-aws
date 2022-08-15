##This script can only be run by using the command `STAGE=<STAGE> rushx deploy-ui-and-api` from `/swb-ui` directory, running this script directly from this directory will not work correctly as it uses relative paths.
apiURL=$(cat ../swb-reference/src/config/${STAGE}.json | grep apiUrlOutput | awk '{print $NF}' | sed 's/\"//g' | sed 's/,//g' ) ##Get value from swb-reference/src/config/{STAGE}.json and replace all '"' and ',' with empty.
if [[ -z $apiURL ]]; ## Validate not empty apiURL
then 
    echo Configuration with STAGE='"'${STAGE}'"' not found, make sure to deploy API with STAGE=${STAGE} and try again.
    exit 1
else
    (rushx build && NEXT_PUBLIC_API_BASE_URL=$apiURL rushx export) && 
    (
        cd infrastructure 
        rushx cdk bootstrap && rushx cdk-deploy
    ) &&
    (
        cd ../swb-reference/ 
        rushx cdk-deploy
    )
fi