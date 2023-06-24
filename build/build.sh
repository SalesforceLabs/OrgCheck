#/bin/bash


### --------------------------------------------------------------------------------------------
### Dependency and other checkings
### --------------------------------------------------------------------------------------------
which uglifyjs 1>/dev/null; if [ $? -ne 0 ]; then 
    echo 'Uglifyjs is not installed. You can install it via $ npm install uglify-js -g'; 
    exit 1; 
fi
which tidy 1>/dev/null; if [ $? -ne 0 ]; then 
    echo 'Tidy is not installed. You can install it via $ brew tidy'; 
    exit 1; 
fi
if [ $(sfdx force:auth:list --json | wc -l) -le 4 ]; then 
    echo "There is no Salesforce Org authentified with sfdx yet. Please register one with (for example) $ sfdx force:auth:web:login"; 
    exit 2; 
fi
if [ $(sfdx config:get defaultusername --json | grep 'value' | wc -l) -eq 0 ]; then 
    echo "There is no Salesforce Default Username defined with sfdx yet. Please register one with $ sfdx config:set defaultusername=<username>"; 
    exit 3; 
fi



### --------------------------------------------------------------------------------------------
### Argument for this script checkings
### --------------------------------------------------------------------------------------------

UGLIFY_MODE="$1"
UGLIFY_MODE_ON="on"
UGLIFY_MODE_OFF="off"
if [ "X${UGLIFY_MODE}" == "X${UGLIFY_MODE_OFF}" ]; then
    echo "Uglify Mode is off"
    UGLIFY_MODE="${UGLIFY_MODE_OFF}"
else
    echo "Uglify Mode is on"
    UGLIFY_MODE="${UGLIFY_MODE_ON}"
fi
echo ""



### --------------------------------------------------------------------------------------------
### Javascript and static resource build
### --------------------------------------------------------------------------------------------

echo "Javascript build..."
for f in build/src/javascript/orgcheck/OrgCheck.*.js build/src/javascript/orgcheck/OrgCheck.js; do
    echo " - $f"
    if [ "${UGLIFY_MODE}" == "${UGLIFY_MODE_ON}" ]; then
        uglifyjs --ie --webkit --v8 "${f}" -o /tmp/$(basename $f);
    else
        cat "${f}" > /tmp/$(basename $f);
    fi
done

rm -Rf build/tmp/*
rm -Rf build/bin/*
mkdir build/tmp/js
mkdir build/tmp/img

echo " >> into one unique js file"
(
    for f in build/src/javascript/orgcheck/OrgCheck.js build/src/javascript/orgcheck/OrgCheck.*.js; do
        cat /tmp/$(basename $f)
    done
) > build/tmp/js/orgcheck.js
echo ""

echo "Launch the scan for Org Check javascript"
sfdx scanner:run --target 'build/src/javascript/orgcheck/*.js,force-app/**/*.js' --format html > build/reports/report-javascript.html
sfdx scanner:run --target 'build/src/javascript/orgcheck/*.js,force-app/**/*.js' --format csv > build/reports/report-javascript.csv

cp build/src/javascript/d3/d3.js build/tmp/js/d3.js
cp build/src/javascript/jsforce/jsforce.js build/tmp/js/jsforce.js
cp build/src/logos/Logo.svg build/tmp/img
cp build/src/logos/Mascot.svg build/tmp/img
cp build/src/logos/Mascot+Animated.svg build/tmp/img

echo "Making a unique zip file"
(
    cd build/tmp
    zip -9 ../bin/OrgCheck_SR.zip -r ./*
)
echo ""

echo "Transfering the zip into the Salesforce App project"
cp build/bin/OrgCheck_SR.zip force-app/main/default/staticresources/OrgCheck_SR.resource
echo ""


### --------------------------------------------------------------------------------------------
### Custom Labels and Translations build
### --------------------------------------------------------------------------------------------

echo "Custom labels and translations..."

echo " - transfering custom labels (in English) into the Salesforce App project"
cat build/src/labels/CustomLabels-copyandpasted.txt \
    | sed -e 's/""/"/g' -e 's/^"//' -e 's/"$//' \
    > force-app/main/default/labels/CustomLabels.labels-meta.xml

echo " - transfering French translations into the Salesforce App project"
cat build/src/labels/Translation-FR-copyandpasted.txt \
    | sed -e 's/""/"/g' -e 's/^"//' -e 's/"$//' \
    > force-app/main/default/translations/fr.translation-meta.xml

echo " - transfering Japanese translations into the Salesforce App project"
cat build/src/labels/Translation-JP-copyandpasted.txt \
    | sed -e 's/""/"/g' -e 's/^"//' -e 's/"$//' \
    > force-app/main/default/translations/ja.translation-meta.xml

echo ""

echo "Checking if custom labels and translation are correct (the syntax!)"
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
) > /tmp/testAll.html
tidy /tmp/testAll.html 2>/tmp/testAll.err 1>/dev/null 
cat /tmp/testAll.err | grep -e ' - Warning: ' | grep -v 'character code' | sort -t' ' -k2,2n > /tmp/testWarnings.err
rm /tmp/testAll.html
rm /tmp/testAll.err
if [ $(cat /tmp/testWarnings.err | wc -l | tr -d ' ') -ne 0 ]; then
    echo "WARNINGS:"
    cat /tmp/testWarnings.err
    rm /tmp/testWarnings.err
    exit 100;
fi
rm /tmp/testWarnings.err
echo "OK"
echo ""

### --------------------------------------------------------------------------------------------
### If everything is OK push the resulting built items into dev org
### --------------------------------------------------------------------------------------------
echo "Deploying to default org (username=$(sfdx config:get defaultusername --json | grep value | cut -d'"' -f4))"
sfdx project deploy start --metadata StaticResource CustomLabels Translations  1>/dev/null

