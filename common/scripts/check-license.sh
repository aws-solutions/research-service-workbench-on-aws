#!/bin/bash
npm install -g license-checker

solutions=$(ls solutions)
workbenchCore=$(ls workbench-core)

for d in $solutions; do
    echo "$d"
    pushd solutions/$d
    if [ -f ./package.json ]; then
      echo "checking licenses in solutions/$d"
      license-checker --production --exclude MIT,Apache-2.0,BSD-2-Clause,BSD-3-Clause,ISC
    fi
    popd
done

for d in $workbenchCore; do
    echo "$d"
    pushd workbench-core/$d
    if [ -f ./package.json ]; then
      echo "checking licenses in workbench-core/$d"
      license-checker --production --exclude MIT,Apache-2.0,BSD-2-Clause,BSD-3-Clause,ISC
    fi
    popd
done

pushd workbench-core/repo-scripts/repo-toolbox
if [ -f ./package.json ]; then
  echo "checking licenses in workbench-core/repo-script/repo-toolbox"
  license-checker --production --exclude MIT,Apache-2.0,BSD-2-Clause,BSD-3-Clause,ISC
fi
popd

pushd workbench-core/example/express
if [ -f ./package.json ]; then
  echo "checking licenses in workbench-core/example/express"
  license-checker --production --exclude MIT,Apache-2.0,BSD-2-Clause,BSD-3-Clause,ISC
fi
popd

pushd workbench-core/example/infrastructure
if [ -f ./package.json ]; then
  echo "checking licenses in workbench-core/example/infrastructure"
  license-checker --production --exclude MIT,Apache-2.0,BSD-2-Clause,BSD-3-Clause,ISC
fi
popd

pushd solutions/swb-ui/infrastructure
if [ -f ./package.json ]; then
  echo "checking licenses in solutions/swb-ui/infrastructure"
  license-checker --production --exclude MIT,Apache-2.0,BSD-2-Clause,BSD-3-Clause,ISC
fi
popd
