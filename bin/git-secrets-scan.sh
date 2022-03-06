#!/bin/bash

set -euo pipefail

staged_flag=''

if [ $# -gt 0 ] && [ $1 ]; then
    staged_flag='true'
fi

if [ -z ${CODEBUILD_SRC_DIR_GitSecretsArtifact+x} ] ; then {
    echo 'Git-secrets artifact path not set. Using ./.tools'
    mkdir -p .tools && {
        if [[ ! -d .tools/git-secrets ]] ; then
            echo "======================================================================"
            echo "Downloading git-secrets"
            (cd .tools && git clone --depth 1 https://github.com/awslabs/git-secrets.git)
        fi
    }
    export GIT_SECRETS_DIR=./.tools/git-secrets
} else
    echo "Using ${CODEBUILD_SRC_DIR_GitSecretsArtifact} for git-secrets path."
    export GIT_SECRETS_DIR=${CODEBUILD_SRC_DIR_GitSecretsArtifact}
fi

# if the codebase isn't in git, create a git repo around it.
# git-secrets doesn't operate independently from git.
# this will be needed when running from a pipeline.
git rev-parse --git-dir > /dev/null 2>&1 || {
    git init --quiet
    git add -A .
}

export PATH=$PATH:${GIT_SECRETS_DIR}
${GIT_SECRETS_DIR}/git-secrets --register-aws

# Run git-secrets only on staged files
if [ $staged_flag ]; then
    echo "Running git-secrets-scan on staged files"
    ${GIT_SECRETS_DIR}/git-secrets --scan --cached
    if [ -d .tools/git-secrets ]; then
        rm -rf .tools/git-secrets && echo ".tools/git-secrets deleted !"
    fi
else
    ${GIT_SECRETS_DIR}/git-secrets --scan
fi
echo "git-secrets scan ok"

