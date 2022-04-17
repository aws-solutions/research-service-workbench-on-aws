#!/bin/bash

# set -euo pipefail
return_code=0

echo 'Git-secrets artifact path not set. Using ./.tools'
mkdir -p .tools && {
    if [[ ! -d .tools/git-secrets ]] ; then
        echo "======================================================================"
        echo "Downloading git-secrets"
        cd .tools && git clone https://github.com/awslabs/git-secrets.git
        cd git-secrets && make install
    fi
}

git secrets --register-aws --global
# Prevent leakage of internal tools
git secrets --add '[aA]pollo|[bB]razil|[cC]oral|[oO]din' --global
git secrets --add 'tt\.amazon\.com|issues\.amazon\.com|cr\.amazon\.com' --global
# Prevent leakage of aws-iso
git secrets --add 'ic\.gov|sgov\.gov' --global
git secrets --add 'us-iso|aws-iso' --global
git secrets --add 'smil\.mil' --global

# Run git-secrets only on staged files
git secrets --scan
return_code=$?
echo "RETURN_CODE=$return_code"

if [ -d .tools/git-secrets ]; then
    rm -rf .tools && echo ".tools/git-secrets deleted !"
fi

if [[ $return_code -ne 0 ]]; then
    echo "git secrets scan detected secrets"
    exit 1
else
    echo "git secrets scan ok !"
fi