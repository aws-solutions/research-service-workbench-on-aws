##This script can only be run by using the command `STAGE=<STAGE> rushx deploy-ui-and-api` from `/swb-ui` directory, running this script directly from this directory will not work correctly as it uses relative paths.
apiURL=$(cat ../../swb-reference/src/config/${STAGE}.json | grep apiUrlOutput | awk '{print $NF}' | sed 's/\"//g' | sed 's/,//g' ) ##Get value from swb-reference/src/config/{STAGE}.json and replace all '"' and ',' with empty.
ecsSubnetId=$(cat ../../swb-reference/src/config/${STAGE}.yaml | grep ecsSubnetIds | awk '{print $NF}' | sed 's/\"//g' | sed 's/,//g' | sed 's/\[//g' | sed 's/\]//g' ) ##Get value from swb-reference/src/config/{STAGE}.yaml and replace all '"', '[', ']' and ',' with empty.
websiteURL=$(cat ../../swb-ui/infrastructure/src/config/${STAGE}.json | grep WebsiteURL | awk '{print $NF}' | sed 's/\"//g' | sed 's/,//g' ) ##Get value from swb-ui/infrastructure/src/config/{STAGE}.json and replace all '"' and ',' with empty.
if [[ -z $apiURL ]]; ## Validate not empty apiURL
then
    echo 'Configuration with STAGE='"'${STAGE}'"' not found, make sure to deploy API with STAGE=${STAGE} and try again.'
    exit 1
else
    (rush build && NEXT_PUBLIC_API_BASE_URL=$apiURL rushx build) && ##rushx build is necessary as rush build does not take in count NEXT_PUBLIC_API_BASE_URL env variable for swb-ui build
    (
        ## Check if BYON is turned on and if UI not deployed yet
        if [[ -z $websiteURL ]];
        then
            echo 'UI has not been deployed yet for STAGE='"'${STAGE}'"'. Check if custom network needs to be used...'
            ## TODO: Create and check for the useCloudFront flag from stage config. 
            ## Perform next steps only if that is set to false
            echo 'First time UI deployment for a custom network ECS will require Docker to be running in order to build the image necessary for ECS.'
            ## Make sure docker is running
            if curl -s --unix-socket /var/run/docker.sock http/_ping 2>&1 >/dev/null
            then
                ./image-deploy.sh develop ${STAGE}
            else
                echo 'Docker server is not accessible. Please make sure Docker engine is running and connected, and then try again'
                exit 1
            fi
        fi
    )
    (
        cd ../infrastructure
        rushx cdk bootstrap && rushx cdk-deploy
    ) &&
    (
        cd ../../swb-reference/
        rushx cdk-deploy
    )
fi
