#!/bin/bash

# set -euo pipefail

ci_flag=''
return_code=0

if [ $# -gt 0 ] && [ $1 ]; then
    ci_flag='true'
fi

mkdir -p .tools && {
    if [[ ! -d .tools/git-secrets ]] ; then
        echo "======================================================================"
        echo "Downloading git-secrets"
        cd .tools 
        git clone https://github.com/awslabs/git-secrets.git && cd git-secrets
        make install
        git secrets --register-aws --global
        # Prevent leakage of internal tools
        git secrets --add '[aA]pollo|[bB]razil|[cC]oral|[oO]din' --global
        git secrets --add 'tt\.amazon\.com|issues\.amazon\.com|cr\.amazon\.com' --global
        # Prevent leakage of aws-iso
        git secrets --add 'ic\.gov|sgov\.gov' --global
        git secrets --add 'us-iso|aws-iso' --global
        git secrets --add 'smil\.mil' --global
    fi
}
export GIT_SECRETS_DIR=./.tools/git-secrets
export PATH=$PATH:${GIT_SECRETS_DIR}

# Run git-secrets only on staged files
echo "Running git-secrets-scan"
return_code=`${GIT_SECRETS_DIR}/git-secrets --scan`

if [ -d .tools/git-secrets ]; then
    rm -rf .tools/git-secrets && echo ".tools/git-secrets deleted !"
fi

if [ $return_code ];
then
    echo "git-secrets scan ok"
else
    echo "Secrets detected please check the logs"
    exit $return_code
fi
