sf package version create -p lightning-flow-scanner -d force-app -k Llinkie3 -b main -w 20

sf package version list --target-dev-hub pbo

rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps

pm install --save-dev eslint @salesforce/eslint-config-lwc @lwc/eslint-plugin-lwc --legacy-peer-deps


sf package version create --package "lightning-flow-scanner" --definition-file config/project-scratch-def.json --code-coverage --installation-key Llinkie3 --target-dev-hub partnerorg --wait 10

sf package version promote --package "lightning-flow-scanner@1.0.0-1" --target-dev-hub partnerorg
