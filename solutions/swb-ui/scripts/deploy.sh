(NEXT_PUBLIC_API_BASE_URL=$(cat ../swb-reference/src/config/${STAGE}.js | grep apiUrlOutput | awk '{print $NF}')  
rushx build &&
rushx export) && 
(cd infrastructure 
rushx cdk bootstrap && rushx cdk-deploy) &&
(cd ../swb-reference/
rushx cdk-deploy)