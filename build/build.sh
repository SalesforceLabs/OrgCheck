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

rm -Rf build/tmp/*
rm -Rf build/bin/*
mkdir build/tmp/js
mkdir build/tmp/img

cp build/src/javascript/d3/d3.js build/tmp/js/d3.js
cp build/src/javascript/jsforce/jsforce.js build/tmp/js/jsforce.js
cp build/src/javascript/sheetjs/xlsx.js build/tmp/js/xlsx.js
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
### If everything is OK push the resulting built items into dev org
### --------------------------------------------------------------------------------------------
echo "Deploying to default org (username=$(sfdx config:get target-org --json | grep value | cut -d'"' -f4))"
sfdx project deploy start --metadata StaticResource  1>/dev/null

