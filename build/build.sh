#/bin/bash

### -----------------------
### JAVASCRIPT PART
### -----------------------

## npm install uglify-js -g

## uglifyjs javascript/src/OrgCheck.js -o force-app/main/default/staticresources/OrgCheck_OrgCheck_SR.resource
uglifyjs --ie --webkit --v8 build/src/javascript/OrgCheck.js -o force-app/main/default/staticresources/OrgCheck_OrgCheck_SR.resource

## https://codeinthehole.com/tips/tips-for-using-a-git-pre-commit-hook/
## ln -s ../../pre-commit.sh .git/hooks/pre-commit

##### ln -s ./javascript/build/build-js.sh .git/hooks/pre-commit 



### -----------------------
### LABELS AND TN18 PART
### -----------------------

cat build/src/labels/CustomLabels-copyandpasted.txt \
    | sed -e 's/""/"/g' -e 's/^"//' -e 's/"$//' \
    > force-app/main/default/labels/CustomLabels.labels-meta.xml

cat build/src/labels/Translation-FR-copyandpasted.txt \
    | sed -e 's/""/"/g' -e 's/^"//' -e 's/"$//' \
    > force-app/main/default/translations/fr.translation-meta.xml

cat build/src/labels/Translation-JP-copyandpasted.txt \
    | sed -e 's/""/"/g' -e 's/^"//' -e 's/"$//' \
    > force-app/main/default/translations/ja.translation-meta.xml

