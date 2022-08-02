#/bin/bash

### -----------------------
### JAVASCRIPT PART
### -----------------------

## npm install uglify-js -g
## npm install tsc

for f in build/src/javascript/*_*; do
    uglifyjs --ie --webkit --v8 "${f}" -o /tmp/$(basename $f)
    ## cat "${f}" > /tmp/$(basename $f)
done
for f in build/src/javascript/OrgCheck.js; do
    uglifyjs --ie --webkit --v8 "${f}" -o /tmp/$(basename $f)
    ## cat "${f}" > /tmp/$(basename $f)
done

(
    for f in build/src/javascript/OrgCheck.js; do
        cat /tmp/$(basename $f)
    done
    for f in build/src/javascript/*_*; do
        cat /tmp/$(basename $f)
    done
) > force-app/main/default/staticresources/OrgCheck_OrgCheck_SR.resource

## https://codeinthehole.com/tips/tips-for-using-a-git-pre-commit-hook/
## ln -s ../../pre-commit.sh .git/hooks/pre-commit

##### ln -s ./javascript/build/build-js.sh .git/hooks/pre-commit 



### -----------------------
### LABELS PART
### -----------------------

cat build/src/labels/CustomLabels-copyandpasted.txt \
    | sed -e 's/""/"/g' -e 's/^"//' -e 's/"$//' \
    > force-app/main/default/labels/CustomLabels.labels-meta.xml



### -----------------------
### TRANSLATIONS PART
### -----------------------

cat build/src/labels/Translation-FR-copyandpasted.txt \
    | sed -e 's/""/"/g' -e 's/^"//' -e 's/"$//' \
    > force-app/main/default/translations/fr.translation-meta.xml

cat build/src/labels/Translation-JP-copyandpasted.txt \
    | sed -e 's/""/"/g' -e 's/^"//' -e 's/"$//' \
    > force-app/main/default/translations/ja.translation-meta.xml





### -----------------------
### Generate the TEST page
### -----------------------
(
    echo '<!DOCTYPE html>';
    echo '<html>';
    echo '  <head>';
    echo '  <title>Test Page</title>';
    echo '  </head>';
    echo '  <body>';
    echo '    <h1>Custom Labels</h1>';
    echo '    <p>List all custom labels in a table so that you can check if they are correct.</p>';
    echo '    <table border="1" summary="Custom labels">';
    echo '      <thead><tr><th>Label</th><th>Value</th></tr></thead>';
    echo '      <tbody>';
    cat force-app/main/default/labels/CustomLabels.labels-meta.xml \
        | grep '<labels>' \
        | sed -e 's#^.*<fullName>\([^<]*\)</fullName>.*<value>\([^<]*\)</value>.*$#        <tr><td>\1</td><td>\2</td></tr>#' \
              -e 's@&lt;@<@g' \
              -e 's@&gt;@>@g' \
              -e 's@&#x2F;@/@g' \
              -e 's@&#x3D;@=@g' \
              -e 's@&quot;@"@g'
    echo '      </tbody>';
    echo '    </table>';
    for translation in force-app/main/default/translations/*.translation-meta.xml; do
        language=$(basename ${translation} | cut -d. -f1);
        echo '    <h1>Translation for <code>'${language}'</code></h1>';
        echo '    <p>List all <code>'${language}'</code> translations of custom labels in a table so that you can check if they are correct.</p>';
        echo '    <table border="1" summary="Translations for '${language}'">';
        echo '      <thead><tr><th>Label</th><th>Translation in <code>'${language}'</code></th></tr></thead>';
        echo '      <tbody>';
        cat ${translation} \
            | grep '<customLabels>' \
            | sed -e 's#^.*<name>\([^<]*\)</name>.*<label>\([^<]*\)</label>.*$#        <tr><td>\1</td><td>\2</td></tr>#' \
                -e 's@&lt;@<@g' \
                -e 's@&gt;@>@g' \
                -e 's@&#x2F;@/@g' \
                -e 's@&#x3D;@=@g' \
                -e 's@&quot;@"@g'
        echo '      </tbody>';
        echo '    </table>';
    done
    echo '  </body>';
    echo '</html>';
) > /tmp/testAll.txt
tidy /tmp/testAll.txt 2>&1 | grep 'Warning' | grep -v 'character code' | sort -t' ' -k2,2n > /tmp/testWarnings
if [ $(cat /tmp/testWarnings | wc -l | tr -d ' ') -ne 0 ]; then
    echo "WARNINGS:"
    cat /tmp/testWarnings
fi


### -----------------------
### PUSH INTO DEV ORG
### -----------------------
sfdx force:source:deploy -m StaticResource:OrgCheck_OrgCheck_SR,CustomLabels,Translations  1>/dev/null
