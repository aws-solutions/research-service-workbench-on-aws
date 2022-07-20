(rushx build && rushx export) && 
(
    cd infrastructure 
    rushx cdk bootstrap && rushx cdk-deploy
) &&
(
    cd ../swb-reference/ 
    rushx cdk-deploy
)