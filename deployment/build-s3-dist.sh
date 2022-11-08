#!/bin/bash
#
# This assumes all of the OS-level configuration has been completed and git repo has already been cloned
#
# This script should be run from the repo's deployment directory
# cd deployment
# ./build-s3-dist.sh source-bucket-base-name trademarked-solution-name version-code
#
# Parameters:
#  - source-bucket-base-name: Name for the S3 bucket location where the template will source the Lambda
#    code from. The template will append '-[region_name]' to this bucket name.
#    For example: ./build-s3-dist.sh solutions my-solution v1.0.2
#    The template will then expect the source code to be located in the solutions-[region_name] bucket
#
#  - trademarked-solution-name: name of the solution for consistency
#
#  - version-code: version of the package

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
    echo "Please provide the base source bucket name, trademark approved solution name and version where the lambda code will eventually reside."
    echo "For example: ./build-s3-dist.sh solutions trademarked-solution-name v1.0.2"
    exit 1
fi

# Get reference for all important folders
template_dir="$PWD"
template_dist_dir="$template_dir/global-s3-assets"
build_dist_dir="$template_dir/regional-s3-assets"
source_dir="$template_dir/../source"

echo "------------------------------------------------------------------------------"
echo "[Init] Clean old dist folders"
echo "------------------------------------------------------------------------------"
echo "rm -rf $template_dist_dir"
rm -rf $template_dist_dir
echo "mkdir -p $template_dist_dir"
mkdir -p $template_dist_dir
echo "rm -rf $build_dist_dir"
rm -rf $build_dist_dir
echo "mkdir -p $build_dist_dir"
mkdir -p $build_dist_dir

echo "------------------------------------------------------------------------------"
echo "[Packing] Templates"
echo "------------------------------------------------------------------------------"
echo "cp $template_dir/operations-conductor.template $template_dist_dir/operations-conductor.template"
cp $template_dir/operations-conductor.template $template_dist_dir/operations-conductor.template

if [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac OS
    echo "Updating code source bucket in template with $1"
    replace="s/%%BUCKET_NAME%%/$1/g"
    echo "sed -i '' -e $replace $template_dist_dir/operations-conductor.template"
    sed -i '' -e $replace $template_dist_dir/operations-conductor.template
    replace="s/%%SOLUTION_NAME%%/$2/g"
    echo "sed -i '' -e $replace $template_dist_dir/operations-conductor.template"
    sed -i '' -e $replace $template_dist_dir/operations-conductor.template
    replace="s/%%VERSION%%/$3/g"
    echo "sed -i '' -e $replace $template_dist_dir/operations-conductor.template"
    sed -i '' -e $replace $template_dist_dir/operations-conductor.template
else
    # Other linux
    echo "Updating code source bucket in template with $1"
    replace="s/%%BUCKET_NAME%%/$1/g"
    echo "sed -i -e $replace $template_dist_dir/operations-conductor.template"
    sed -i -e $replace $template_dist_dir/operations-conductor.template
    replace="s/%%SOLUTION_NAME%%/$2/g"
    echo "sed -i -e $replace $template_dist_dir/operations-conductor.template"
    sed -i -e $replace $template_dist_dir/operations-conductor.template
    replace="s/%%VERSION%%/$3/g"
    echo "sed -i -e $replace $template_dist_dir/operations-conductor.template"
    sed -i -e $replace $template_dist_dir/operations-conductor.template
fi

echo "------------------------------------------------------------------------------"
echo "[Rebuild] Console"
echo "------------------------------------------------------------------------------"
cd $source_dir/console
INLINE_RUNTIME_CHUNK=false npm run build
mkdir $build_dist_dir/console
cd $source_dir/console/build
cp -r ./ $build_dist_dir/console/

echo "------------------------------------------------------------------------------"
echo "[Create] Console manifest"
echo "------------------------------------------------------------------------------"
echo "Creating console manifest file"
cd $source_dir/console/build
manifest=(`find * -type f ! -iname "aws_exports.js" ! -iname ".DS_Store"`)
manifest_json=$(IFS=,;printf "%s" "${manifest[*]}")
echo "{\"files\":[\"$manifest_json\"]}" | sed 's/,/","/g' >> $build_dist_dir/console/site-manifest.json

echo "------------------------------------------------------------------------------"
echo "[Rebuild] Services"
echo "------------------------------------------------------------------------------"
cd $source_dir/services/
npm run package
cp ./build/operations-conductor-services.zip $build_dist_dir/operations-conductor-services.zip

echo "------------------------------------------------------------------------------"
echo "[Copy] Lambda Edge"
echo "------------------------------------------------------------------------------"
cd $source_dir/services/
mkdir -p $source_dir/services/build/lambda-edge
npm run build:lambda-edge
cp ./build/lambda-edge/operations-conductor-lambda-edge.zip $build_dist_dir/operations-conductor-lambda-edge.zip