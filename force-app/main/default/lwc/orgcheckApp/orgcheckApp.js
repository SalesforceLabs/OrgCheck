import { LightningElement, api } from 'lwc';

export default class OrgCheckApp extends LightningElement {

    @api accessToken;
    @api userId;

    filterChanged(event) {
        if (this.#isLoading === true) return;
        switch (event.detail.what) {
            case 'package':
            case 'sobjectType': {
                const spinner = this.template.querySelector('c-orgcheck-spinner');
                spinner.open();
                Promise.all([
                    new Promise((resolve, reject) => {
                        spinner.setMessage('objects', 'Updating sobjects...', 'started');
                        try {
                            this.populateFilterObjects();
                        } catch (e) {
                            spinner.setMessage('objects', 'SObjects were not updated to global filter because of an error!', 'error');
                            reject(e);
                        }
                        spinner.setMessage('objects', 'SObjects updated.', 'done');
                        resolve();
                    })
                ]).then(() => {
                    spinner.close();
                }).catch((e) => {
                    console.error(e);
                }).finally(() => {
                });
                break;
            }
            case 'sobjectApiName':
            case 'showExternalRoles':
            case 'useInProductionConfirmation':
            default:
                // Do nothing
        }
    }

    #isLoading;
    apiLoaded() {
        this.#isLoading = true;
        const spinner = this.template.querySelector('c-orgcheck-spinner');
        spinner.open();
        Promise.all([
            new Promise((resolve, reject) => {
                spinner.setMessage('types', 'Loading types...', 'started');
                try {
                    this.populateFilterTypes();
                } catch (e) {
                    spinner.setMessage('types', 'Types were not loaded to global filter because of an error!', 'error');
                    reject(e);
                }
                spinner.setMessage('types', 'Types loaded.', 'done');
                resolve();
            }),
            new Promise((resolve, reject) => {
                spinner.setMessage('packages', 'Loading packages...', 'started');
                try {
                    this.populateFilterPackages();
                } catch (e) {
                    spinner.setMessage('packages', 'Packages were not loaded to global filter because of an error!', 'error');
                    reject(e);
                }
                spinner.setMessage('packages', 'Packages loaded.', 'done');
                resolve();
            }),
            new Promise((resolve, reject) => {
                spinner.setMessage('objects', 'Loading sobjects...', 'started');
                try {
                    this.populateFilterObjects();
                } catch (e) {
                    spinner.setMessage('objects', 'SObjects were not loaded to global filter because of an error!', 'error');
                    reject(e);
                }
                spinner.setMessage('objects', 'SObjects loaded.', 'done');
                resolve();
            })
        ]).then(() => {
            spinner.close();
        }).catch((e) => {
            console.error(e);
        }).finally(() => {
            this.#isLoading = false;
        });
    }

    apiFailed(event) {
        console.error(event.detail.from, event.detail.error);
    }

    async populateFilterPackages() {
        const orgcheckApi = this.template.querySelector('c-orgcheck-api');
        const filters = this.template.querySelector('c-orgcheck-global-filters');
        const packages = await orgcheckApi.packages();
        const data = [ 
            { label: 'All packages', value: '*' },
            { label: 'No package', value: '' }
        ];
        packages.forEach(p => {
            data.push({
                label: p.name + ' (api=' + p.namespace + ', type=' + p.type + ')',
                value: p.namespace
            });
        });
        filters.packageOptions = data;
        filters.package = '*';
    }

    populateFilterTypes() {
        const data = [ { label: 'All types', value: '*' } ];
        const orgcheckApi = this.template.querySelector('c-orgcheck-api');
        orgcheckApi.types().forEach(t => data.push({ label: t.label, value: t.id }));
        const filters = this.template.querySelector('c-orgcheck-global-filters');
        filters.sobjectTypeOptions = data;
        filters.sobjectType = '*';
    }

    async populateFilterObjects() {
        const orgcheckApi = this.template.querySelector('c-orgcheck-api');
        const filters = this.template.querySelector('c-orgcheck-global-filters');
        const objects = await orgcheckApi.objects(
            (this.#isLoading === true ? '*' : filters.package), 
            (this.#isLoading === true ? '*' : filters.sobjectType)
        );
        const data = [ { label: 'All objects', value: '*' } ];
        objects.forEach(o => {
            data.push({
                label: o.label + ' (api=' + o.developerName + (o.package===''?'':(', package=' + o.package)) + ')',
                value: o.developerName
            });
        });
        filters.sobjectApiNameOptions = data;
        filters.sobjectApiName = '*';
    }

    /* ******** */
    /* ORG INFO */
    /* ******** */

    isCurrentOrgAProduction;

    /* ********** */
    /* DATATABLES */
    /* ********** */

    customFieldsData;
    customFieldsColumns = [
        { label: '#', fieldName: 'index' },
        { label: 'Object', fieldName: 'sobjectURL', type: 'url', typeAttributes: { label: { fieldName: 'sobjectName' }} },
        { label: 'Type', fieldName: 'type' },
        { label: 'Field', fieldName: 'fieldURL', type: 'url', typeAttributes: { label: { fieldName: 'fieldName' }} },
        { label: 'Package', fieldName: 'namespace' },
        { label: 'Full API Name', fieldName: 'developerName' },
        { label: 'Using', fieldName: 'using' }
    ];

    usersData = [];
    usersColumns = [
        { label: '#', fieldName: 'index' },
        { label: 'Score', fieldName: 'score', type: 'number' },
        { label: 'User Name', fieldName: 'name' },
        { label: 'LastLogin', fieldName: 'lastLogin', type: 'datatime' }
    ];

    /* ****** */
    /* EVENTS */
    /* ****** */

    tabHandleActivation() {
    }



    populateCustomFieldData() {
    /*    this.#orgCheckAPI.getCustomFields(this.settingFilterSObject).then((fields) => {
            const data = [];
            fields.forEach(o => {
                data.push({
                    index: o.id,
                    sobjectName: o.objectDeveloperName,
                    sobjectURL: '/'+o.objectDeveloperName,
                    type: 'xxx',
                    fieldName: o.fieldName,
                    fieldURL: '/'+o.fieldName,
                    namespace: o.package,
                    developerName: o.developerName,
                    using: 'xxx'
                });
            });
            this.customFieldsData = data;
        }).catch((e) => this.globalCatchError(e));*/
    }

    /* ****** */
    /* Spinner */
    /* ****** */

    globalCatchError(error) {
        this.hideSpinner();
        console.error(error);
    }

}