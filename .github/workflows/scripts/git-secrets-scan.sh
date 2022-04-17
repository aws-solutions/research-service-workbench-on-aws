#!/bin/bash

# set -euo pipefail

staged_flag=''

if [ $# -gt 0 ] && [ $1 ]; then
    staged_flag='true'
fi

echo 'Git-secrets artifact path not set. Using ./.tools'
mkdir -p .tools && {
    if [[ ! -d .tools/git-secrets ]] ; then
        echo "======================================================================"
        echo "Downloading git-secrets"
        (cd .tools && git clone --depth 1 https://github.com/awslabs/git-secrets.git)
    fi
}
export GIT_SECRETS_DIR=./.tools/git-secrets

export PATH=$PATH:${GIT_SECRETS_DIR}
${GIT_SECRETS_DIR}/git-secrets --register-aws

# Run git-secrets only on staged files
if [ $staged_flag ]; then
    echo "Running git-secrets-scan on staged files"
    ${GIT_SECRETS_DIR}/git-secrets --scan --cached
else
    return_code=`${GIT_SECRETS_DIR}/git-secrets --scan`
fi

if [ -d .tools/git-secrets ]; then
    rm -rf .tools/git-secrets && echo ".tools/git-secrets deleted !"
fi

if [[ $return_code ]]; then
    echo "git-secrets scan detected secrets"
    exit 1
else
    echo "git-secrets scan ok !"
fi