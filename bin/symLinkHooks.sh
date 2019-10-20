#!/bin/bash
defaultHookPath=".git/hooks"
projectHookPath="bin/hooks"
if [ -d ${projectHookPath} -a -d ${defaultHookPath} ]
then
  echo "Hook directory exists"
  echo "Symlinking git hook"
  for file in `ls ${projectHookPath}`;
    do ln -sf "../../${projectHookPath}/${file}" "${defaultHookPath}/${file}";
    echo "Removing sample hooks"
    rm -f "${defaultHookPath}/${file}.sample";
  done;
  # git config core.hooksPath ${projectHookPath};
else
    echo "Hook directory not present"
fi
# // "preinstall": "node -e \"if(process.env.npm_execpath.indexOf('yarn') === -1) console.log(process.env.npm_execpath)throw new Error('You must use Yarn to install, not NPM')\"",
