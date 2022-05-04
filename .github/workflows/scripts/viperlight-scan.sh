#!/usr/bin/env bash

set -euo pipefail

echo 'Cloning viperlight scan in ./.tools'
mkdir -p .tools && {
    if [[ ! -d .tools/viperlight ]] ; then
        echo "======================================================================"
        echo "Downloading viperlight"
        (wget -v "https://s3.amazonaws.com/viperlight-scanner/latest/.viperlightrc" &&
        cd .tools && wget -v "https://s3.amazonaws.com/viperlight-scanner/latest/viperlight.zip" &&
        unzip -q viperlight.zip -d ./viperlight &&
        rm -r ./viperlight.zip
        echo "Content scanning utility installation complete `date`"
        )
    fi
}

echo "Starting content scanning `date` in `pwd`"
.tools/viperlight/bin/viperlight scan
echo "Completed scanning `date`"%
if [ -d .tools/viperlight ] && [ -f .viperlightrc ]; then
    rm -rf .tools/viperlight .viperlightrc* && echo ".tools/viperlight and .viperlightrc deleted !"
fi