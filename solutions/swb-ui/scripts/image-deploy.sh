#!/bin/bash
set -e

BRANCH=$1
STAGE=$2

swb_stack_name="$(jq -r '. |= keys[0]' ../swb-reference/src/config/${STAGE}.json)"

function upload_docker_image_ecr() {
  aws_region=$(jq -r '.[].awsRegion' ../swb-reference/src/config/${STAGE}.json)
  ecr_repository_name=$(aws cloudformation describe-stacks --stack-name "$swb_stack_name" --output text --region "$aws_region" --query 'Stacks[0].Outputs[?OutputKey==`ECRRepositoryName`].OutputValue')
  aws_account_number=$(aws sts get-caller-identity --query 'Account' --output text)

  pushd ../.. > /dev/null
  docker build -t $ecr_repository_name . --build-arg BRANCH=$BRANCH --build-arg STAGE=$STAGE
  aws ecr get-login-password --region $aws_region | docker login --username AWS --password-stdin $aws_account_number.dkr.ecr.$aws_region.amazonaws.com
  docker tag $ecr_repository_name:latest $aws_account_number.dkr.ecr.$aws_region.amazonaws.com/$ecr_repository_name:latest
  docker push $aws_account_number.dkr.ecr.$aws_region.amazonaws.com/$ecr_repository_name:latest
  popd > /dev/null
}

printf "\nBuilding and deploying docker image for SWB v2.\n"
upload_docker_image_ecr
printf "\nCompleted deploying SWB v2 UI image to ECR.\n"

printf "\nUpdating images for ECS tasks.\n"
aws ecs update-service --cluster $cluster_name --service swb-ui --force-new-deployment
printf "\nCompleted updating images for ECS tasks. Exiting...\n"

