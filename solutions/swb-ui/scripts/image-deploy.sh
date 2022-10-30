#!/bin/bash

#
swb_ui_stack_name="$(jq '. |= keys[0]' infrastructure/src/config/${STAGE}.json)"
if [[ -z $swb_ui_stack_name ]]; ## Validate not empty

function upload_docker_image_ecr_without_build() {
  aws_region="$(jq '.[].awsRegion' ../swb-reference/src/config/${STAGE}.json)"
  ecr_repository_name="$(aws cloudformation describe-stacks --stack-name "$swb_ui_stack_name" --output text --region "$aws_region" --query 'Stacks[0].Outputs[?OutputKey==`ECRRepositoryName`].OutputValue')"
  aws_account_number="$(aws sts get-caller-identity --query 'Account' --output text)"

  pushd "$SOLUTION_DIR/ui" > /dev/null

  npm run build

  aws ecr get-login-password --region $aws_region | docker login --username AWS --password-stdin $aws_account_number.dkr.ecr.$aws_region.amazonaws.com
  docker build  --platform linux/amd64 -t $ECR_Repository_Name .
  docker tag $ECR_Repository_Name:latest $aws_account_number.dkr.ecr.$aws_region.amazonaws.com/$ECR_Repository_Name:latest
  docker push $aws_account_number.dkr.ecr.$aws_region.amazonaws.com/$ECR_Repository_Name:latest

  popd > /dev/null
}

printf "\nDeploying image...\n"
upload_docker_image_ecr_without_build
printf "\nCompleted deploying image.\n"
