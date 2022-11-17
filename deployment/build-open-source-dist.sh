#!/bin/bash
#
# This assumes all of the OS-level configuration has been completed and git repo has already been cloned
#
# This script should be run from the repo's deployment directory
# cd deployment
# ./build-open-source-dist.sh solution-name
#
# Parameters:
#  - solution-name: name of the solution for consistency

# Check to see if input has been provided:
if [ -z "$1" ]; then
    echo "Please provide the trademark approved solution name for the open source package."
    echo "For example: ./build-open-source-dist trademarked-solution-name"
    exit 1
fi

# Get reference for all important folders
source_template_dir="$PWD"
dist_dir="$source_template_dir/open-source"
dist_template_dir="$dist_dir/deployment"
source_dir="$source_template_dir/../../source"

echo "------------------------------------------------------------------------------"
echo "[Init] Clean old open-source folder"
echo "------------------------------------------------------------------------------"
echo "rm -rf $dist_dir"
rm -rf $dist_dir
echo "mkdir -p $dist_dir"
mkdir -p $dist_dir
echo "mkdir -p $dist_template_dir"
mkdir -p $dist_template_dir
echo "mkdir -p $source_dir"
mkdir -p $source_dir

echo "------------------------------------------------------------------------------"
echo "[Packing] Templates"
echo "------------------------------------------------------------------------------"
echo "cp $source_template_dir/cdk.out/swb-testEnv-va.template.json $dist_template_dir/swb-testEnv-va.template"
cp $source_template_dir/cdk.out/swb-testEnv-va.template.json $dist_template_dir/swb-testEnv-va.template

echo "------------------------------------------------------------------------------"
echo "[Packing] Source Folder"
echo "------------------------------------------------------------------------------"
echo "cp -r $source_dir $dist_dir"
cp -r $source_dir $dist_dir
echo "cp $source_template_dir/../../LICENSE $dist_dir"
cp $source_template_dir/../../LICENSE $dist_dir/LICENSE.txt
echo "cp $source_template_dir/../../NOTICE $dist_dir"
cp $source_template_dir/../../NOTICE $dist_dir/NOTICE.txt
echo "cp $source_template_dir/../../README.md $dist_dir"
cp $source_template_dir/../../README.md $dist_dir
echo "cp $source_template_dir/../../CODE_OF_CONDUCT.md $dist_dir"
cp $source_template_dir/../../CODE_OF_CONDUCT.md $dist_dir
echo "cp $source_template_dir/../../CONTRIBUTING.md $dist_dir"
cp $source_template_dir/../../CONTRIBUTING.md $dist_dir
echo "cp $source_template_dir/../../CHANGELOG.md $dist_dir"
cp $source_template_dir/../../CHANGELOG.md $dist_dir
echo "cp $source_template_dir/../../.gitignore $dist_dir"
cp $source_template_dir/../../.gitignore $dist_dir

echo "ls $dist_dir"
ls $dist_dir

echo "------------------------------------------------------------------------------"
echo "[Packing] Clean up the open-source distributable"
echo "------------------------------------------------------------------------------"
# General cleanup of node_modules and package-lock.json files
echo "find $dist_dir -iname "node_modules" -type d -exec rm -rf "{}" \; 2> /dev/null"
find $dist_dir -iname "node_modules" -type d -exec rm -rf "{}" \; 2> /dev/null
echo "find $dist_dir -iname ".venv" -type d -exec rm -rf "{}" \; 2> /dev/null"
find $dist_dir -iname ".venv" -type d -exec rm -rf "{}" \; 2> /dev/null
echo "find $dist_dir -iname "pytest_cache" -type d -exec rm -rf "{}" \; 2> /dev/null"
find $dist_dir -iname "pytest_cache" -type d -exec rm -rf "{}" \; 2> /dev/null
echo "find $dist_dir -iname ".mypy_cache" -type d -exec rm -rf "{}" \; 2> /dev/null"
find $dist_dir -iname ".mypy_cache" -type d -exec rm -rf "{}" \; 2> /dev/null
echo "find $dist_dir -iname ".viperlightignore" -type d -exec rm -rf "{}" \; 2> /dev/null"
find $dist_dir -iname ".viperlightignore" -type d -exec rm -rf "{}" \; 2> /dev/null
echo "find $dist_dir -iname "cdk.out" -type d -exec rm -rf "{}" \; 2> /dev/null"
find $dist_dir -iname "cdk.out" -type d -exec rm -rf "{}" \; 2> /dev/null
echo "find $dist_dir -iname "dist" -type d -exec rm -rf "{}" \; 2> /dev/null"
find $dist_dir -iname "dist" -type d -exec rm -rf "{}" \; 2> /dev/null

echo "------------------------------------------------------------------------------"
echo "[Packing] Create GitHub (open-source) zip file"
echo "------------------------------------------------------------------------------"
echo "cd $dist_dir"
cd $dist_dir
echo "zip -q -r9 ../$1.zip *"
zip -q -r9 ../$1.zip *
echo "Clean up open-source folder"
echo "rm -rf *"
rm -rf *
echo "mv ../$1.zip ."
mv ../$1.zip .
echo "Completed building $1.zip dist"