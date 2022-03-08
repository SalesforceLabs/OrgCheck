#/bin/bash

## npm install uglify-js -g

## uglifyjs javascript/src/OrgCheck.js -o force-app/main/default/staticresources/OrgCheck_OrgCheck_SR.resource
uglifyjs javascript/src/OrgCheck.js -o force-app/main/default/staticresources/OrgCheck_OrgCheck_SR.resource

## https://codeinthehole.com/tips/tips-for-using-a-git-pre-commit-hook/
## ln -s ../../pre-commit.sh .git/hooks/pre-commit

##### ln -s ./javascript/build/build-js.sh .git/hooks/pre-commit 