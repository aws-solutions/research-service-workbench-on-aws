##This script must only run by using command `STAGE=<STAGE> rushx deploy-ui-and-api` from `/swb-ui` directory, running this script directly from this directory will not work correctly as it uses relative paths.
apiURL=$(cat ../swb-reference/src/config/${STAGE}.js | grep apiUrlOutput | awk '{print $NF}' | sed 's/\"//g' | sed 's/,//g' ) ##Get value from swb-reference/src/config/{STAGE}.js and replace all '"' and ',' with empty.
if [ $apiURL == ''] 
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
