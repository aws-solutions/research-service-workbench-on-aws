#!/usr/bin/env bash
set -e

BRANCH=$1

function upload_docker_image_ecr() {
  swb_stack_name="$(jq -r '. |= keys[0]' ../../swb-reference/src/config/${STAGE}.json)"
  aws_region=$(jq -r '.[].awsRegion' ../../swb-reference/src/config/${STAGE}.json)
  ecr_repository_name=$(aws cloudformation describe-stacks --stack-name "$swb_stack_name" --output text --region "$aws_region" --query 'Stacks[0].Outputs[?OutputKey==`SwbEcrRepositoryNameOutput`].OutputValue')
  aws_account_number=$(aws sts get-caller-identity --query 'Account' --output text)
  apiUrl=$(cat ../../swb-reference/src/config/${STAGE}.json| grep apiUrlOutput | awk '{print $NF}' | sed 's/\"//g' | sed 's/,//g' ) ##Get value from swb-reference/src/config/{STAGE}.json and replace all '"' and ',' with empty.

  printf "\nDeploying UI from branch $BRANCH\n"
  docker build --no-cache -t $ecr_repository_name . --build-arg BRANCH=$BRANCH --build-arg STAGE=$STAGE --build-arg API_URL=$apiUrl
  aws ecr get-login-password --region $aws_region | docker login --username AWS --password-stdin $aws_account_number.dkr.ecr.$aws_region.amazonaws.com
  docker tag $ecr_repository_name:latest $aws_account_number.dkr.ecr.$aws_region.amazonaws.com/$ecr_repository_name:latest
  docker push $aws_account_number.dkr.ecr.$aws_region.amazonaws.com/$ecr_repository_name:latest
}

printf "\nBuilding and deploying docker image for SWB v2.\n"

if [ -z "$STAGE" ]
then
    >&2 echo "[ERROR] STAGE is not set. Exiting..."
    exit 1
fi

if [ -z "$BRANCH" ]
then
    printf "\nBRANCH not set. Using origin/develop...\n"
    BRANCH="origin/develop"
fi

upload_docker_image_ecr

printf "\nCompleted deploying SWB v2 UI image to ECR.\n"

if [ ! -f ../infrastructure/src/config/${STAGE}.json ]
then
    printf "\nUI Infra has not been deployed yet. Skipping update on ECS tasks. Exiting...\n"
else
    printf "\nUpdating images for ECS tasks.\n"
    cluster_name="$(jq -r '.[].ecsClusterName' ../infrastructure/src/config/${STAGE}.json)"
    service_name="$(jq -r '.[].ecsServiceName' ../infrastructure/src/config/${STAGE}.json)"
    aws ecs update-service --cluster $cluster_name --service $service_name --force-new-deployment
    printf "\nCompleted updating images for ECS tasks. Exiting...\n"
fi

