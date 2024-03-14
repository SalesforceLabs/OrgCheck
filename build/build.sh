#/bin/bash

Black='\033[0;30m'
DarkGray='\033[1;30m'
LightGray='\033[0;37m'
Red='\033[0;31m'
LightRed='\033[1;31m'
Green='\033[0;32m'
LightGreen='\033[1;32m'
Orange='\033[0;33m'
Yellow='\033[1;33m'
Blue='\033[0;34m'
LightBlue='\033[1;34m'
Purple='\033[0;35m'
LightPurple='\033[1;35m'
Cyan='\033[0;36m'
LightCyan='\033[1;36m'
White='\033[1;37m'
NoColor='\033[0m'

### --------------------------------------------------------------------------------------------
### Dependency and other checkings
### --------------------------------------------------------------------------------------------
which uglifyjs 1>/dev/null; if [ $? -ne 0 ]; then 
    echo -e "${Red}Uglifyjs is not installed.${NoColor}"
    echo -e "${LightRed}For example, you could install it via $ npm install uglify-js -g${NoColor}"; 
    exit 1; 
fi
which tidy 1>/dev/null; if [ $? -ne 0 ]; then 
    echo -e "${Red}Tidy is not installed.${NoColor}"
    echo -e "${LightRed}For example, you could install it via $ brew tidy${NoColor}"; 
    exit 1; 
fi
if [ $(sfdx force:auth:list --json | wc -l) -le 4 ]; then 
    echo -e "${Red}There is no Salesforce Org authentified with sfdx yet.${NoColor}"
    echo -e "${LightRed}Please register one with (for example) $ sfdx force:auth:web:login${NoColor}"; 
    exit 2; 
fi
if [ $(sfdx config:get defaultusername --json | grep 'value' | wc -l) -eq 0 ]; then 
    echo -e "${Red}There is no Salesforce Default Username defined with sfdx yet.${NoColor}"
    echo -e "${LightRed}Please register one with $ sfdx config:set defaultusername=<username>${NoColor}"; 
    exit 3; 
fi




### --------------------------------------------------------------------------------------------
### Javascript and static resource build
### --------------------------------------------------------------------------------------------
TYPE_ORIGINAL=orginal
TYPE_UGLIFIED=uglified

echo "Javascript build..."
for f in build/src/javascript/orgcheck/OrgCheck.*.js build/src/javascript/orgcheck/OrgCheck.js; do
    echo " - $f"
    uglifyjs --ie --webkit --v8 "${f}" -o /tmp/${TYPE_UGLIFIED}-$(basename $f);
    cat "${f}" > /tmp/${TYPE_ORIGINAL}-$(basename $f);
done

rm -Rf build/tmp/*
rm -Rf build/bin/*
mkdir build/tmp/js
mkdir build/tmp/img

echo " >> into one unique js file"
for type in ${TYPE_ORIGINAL} ${TYPE_UGLIFIED}; do
    (
        for f in build/src/javascript/orgcheck/${type}-OrgCheck.js build/src/javascript/orgcheck/${type}-OrgCheck.*.js; do
            cat /tmp/$(basename $f)
        done
    ) > build/tmp/js/${type}-orgcheck.js
done
echo ""

## echo "Launch the scan for Org Check javascript"
## REPORT_FILE=build/reports/report-javascript
## for type in html csv; do
##     sfdx scanner:run --target "build/tmp/js/${TYPE_ORIGINAL}-orgcheck.js" --format ${type} > ${REPORT_FILE}.${type} 2> /dev/null
## done;
## if [ $(grep 'No rule violations found' ${REPORT_FILE}.csv | wc -l) -eq 1 ]; then
##     echo -e "${LightGreen}Congratulations! No syntax issues.${NoColor}";
## else
##     echo -e "${Red}You have $(( $(grep -v '^$' ${REPORT_FILE}.csv | wc -l) - 1 )) issue(s) you need to check.${NoColor}"
##     echo -e "${LightRed}Open the file ${REPORT_FILE}.html in your browser.${NoColor}";
## fi
## echo ""

mv build/tmp/js/${TYPE_UGLIFIED}-orgcheck.js build/tmp/js/orgcheck.js
cp build/src/javascript/orgcheck/orgcheck-api.js build/tmp/js/orgcheck-api.js
cp build/src/javascript/d3/d3.js build/tmp/js/d3.js
cp build/src/javascript/jsforce/jsforce.js build/tmp/js/jsforce.js
cp build/src/javascript/sheetjs/xlsx.js build/tmp/js/xlsx.js
cp build/src/logos/Logo.svg build/tmp/img
cp build/src/logos/Mascot.svg build/tmp/img
cp build/src/logos/Mascot+Animated.svg build/tmp/img

echo "Making a unique zip file"
(
    cd build/tmp
    zip -9 ../bin/OrgCheck_SR.zip -r ./* -x ./build/tmp/js/${TYPE_ORIGINAL}-orgcheck.js
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
    echo -e "${Red}WARNINGS:"
    cat /tmp/testWarnings.err
    echo -e "${NoColor}"
    rm /tmp/testWarnings.err
    exit 100;
fi
rm /tmp/testWarnings.err
echo -e "${LightGreen}OK${NoColor}"
echo ""

### --------------------------------------------------------------------------------------------
### If everything is OK push the resulting built items into dev org
### --------------------------------------------------------------------------------------------
echo "Deploying to default org (username=$(sfdx config:get target-org --json | grep value | cut -d'"' -f4))"
sfdx project deploy start --metadata StaticResource CustomLabels Translations  1>/dev/null

