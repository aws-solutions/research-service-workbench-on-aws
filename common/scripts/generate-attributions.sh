#!/bin/bash
npm install -g oss-attribution-generator
solutions=$(ls solutions)
workbenchCore=$(ls workbench-core)

for d in $solutions; do
    echo "$d"
    pushd solutions/$d
    if [ -f ./package.json ]; then
      generate-attribution
      mv oss-attribution/attribution.txt LICENSE-THIRD-PARTY
      rm -rf oss-attribution
    fi
    popd
done

for d in $workbenchCore; do
    echo "$d"
    pushd workbench-core/$d
    if [ -f ./package.json ]; then
      generate-attribution
      mv oss-attribution/attribution.txt LICENSE-THIRD-PARTY
      rm -rf oss-attribution
    fi
    popd
done

pushd workbench-core/repo-scripts/repo-toolbox
if [ -f ./package.json ]; then
  generate-attribution
  mv oss-attribution/attribution.txt LICENSE-THIRD-PARTY
  rm -rf oss-attribution
fi
popd
