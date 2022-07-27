#!/bin/bash

solutions=("swb-ui/infrastructure ")
solutions+=$(ls solutions)
workbenchCore=("repo-scripts/repo-toolbox example/express example/infrastructure ")
workbenchCore+=$(ls workbench-core)

for d in $solutions; do
    echo "$d"
    for f in $(find . -type f -path "*/solutions/$d/src/*.ts*"); do
        if ! grep -q "Copyright Amazon.com, Inc." $f
        then
            cat common/license.txt | cat - $f > temp && mv temp $f
        fi
    done
done

for d in $workbenchCore; do
    echo "$d"
    for f in $(find . -type f -path "*/workbench-core/$d/src/*.ts*"); do
        if ! grep -q "Copyright Amazon.com, Inc." $f
        then
            cat common/license.txt | cat - $f > temp && mv temp $f
        fi
    done
done
