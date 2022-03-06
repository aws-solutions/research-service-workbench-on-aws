#! /usr/bin/env bash
url=$2
add=$3
jsonFile="rush.json";

node > out_${jsonFile} << EOF
  const data = require('./${jsonFile}');

  data.repository.url = "${url}";

  console.log(JSON.stringify(data, null, '  '));
EOF

mv out_${jsonFile} ${jsonFile}

git status

if [ ! -z "$add" ]; then
  echo "git add <updated rush.json>" && git add ${jsonFile} && ( echo "git add ${jsonFile} successful !" || (echo "git add ${jsonFile} failed" && exit $?))
fi
