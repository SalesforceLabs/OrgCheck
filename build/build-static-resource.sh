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

echo "${Green}Making sure you have a Salesforce org set up with sfdx locally${NoColor}"
if [ $(sfdx force:auth:list --json | wc -l) -le 4 ]; then 
    echo -e "${Red}There is no Salesforce Org authentified with sfdx yet.${NoColor}"
    echo -e "${LightRed}Please register one with (for example) $ sfdx force:auth:web:login${NoColor}"; 
    exit 2; 
fi
echo ""

echo "${Green}Making sure one of them are the default one${NoColor}"
if [ $(sfdx config:get defaultusername --json | grep 'value' | wc -l) -eq 0 ]; then 
    echo -e "${Red}There is no Salesforce Default Username defined with sfdx yet.${NoColor}"
    echo -e "${LightRed}Please register one with $ sfdx config:set defaultusername=<username>${NoColor}"; 
    exit 3; 
fi
echo ""

### --------------------------------------------------------------------------------------------
### Javascript and static resource build
### --------------------------------------------------------------------------------------------

tmp_dir=$(mktemp -d -t "OrgCheckStaticResource")
echo "${Green}Gathering all files in a temporary folder (${tmp_dir})${NoColor}"
(
    mkdir "${tmp_dir}/js"
    cp build/libs/d3/d3.js "${tmp_dir}/js/d3.js"
    cp build/libs/fflate/fflate.js "${tmp_dir}/js/fflate.js"
    cp build/libs/jsforce/jsforce.js "${tmp_dir}/js/jsforce.js"
    cp build/libs/sheetjs/xlsx.js "${tmp_dir}/js/xlsx.js"
    mkdir "${tmp_dir}/img"
    cp build/src/img/Logo.svg "${tmp_dir}/img/Logo.svg"
    cp build/src/img/Mascot.svg "${tmp_dir}/img/Mascot.svg"
    cp build/src/img/Mascot+Animated.svg "${tmp_dir}/img/Mascot+Animated.svg"
)
echo ""

tmp_dir2=$(mktemp -d -t "OrgCheckSRZip")
tmp_zipfile="${tmp_dir2}/OrgCheckSR.zip"
echo "${Green}Making a unique zip file (${tmp_zipfile})${NoColor}"
(
    cd ${tmp_dir}
    zip -9 "${tmp_zipfile}" -r ./*
)
echo ""

echo "${Green}Transfering the zip into the Salesforce App project${NoColor}"
cp "${tmp_zipfile}" force-app/main/default/staticresources/OrgCheck_SR.resource
echo ""

### --------------------------------------------------------------------------------------------
### If everything is OK push the resulting built items into dev org
### --------------------------------------------------------------------------------------------
echo "${Green}Deploying StaticResource to default org (username=$(sfdx config:get target-org --json | grep value | cut -d'"' -f4))${NoColor}"
sf project deploy start --metadata StaticResource --ignore-conflicts  1>/dev/null

### --------------------------------------------------------------------------------------------
### Update the LWC component that have a dependency with Org Check libraries
### --------------------------------------------------------------------------------------------
echo "${Green}Deploying LWC with Org Check libraries to default org (username=$(sfdx config:get target-org --json | grep value | cut -d'"' -f4))${NoColor}"
sf project deploy start --metadata LightningComponentBundle --ignore-conflicts  1>/dev/null
