import { LightningElement, api } from 'lwc';

export default class OrgCheckApp extends LightningElement {

    @api accessToken;
    @api userId;
    data;

    /**
     * Event called when the user changed a value in the global filter.
     * The idea here is not to apply the new values of the filters in the tabs.
     * Here, it is more about synchronizing values and options all together within 
     * the global filter.
     */
    filterChanged(event) {
        if (event.detail.what === 'package' || event.detail.what === 'sobjectType') {
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
                // TODO
                console.error(e);
            }).finally(() => {
            });
        }
    }

    /**
     * After changing the filters value, a button appears on the UI.
     * Event called when the user click on this new button.
     * The idea here is to populate the appropriate data on the current tab
     */
    filtersValidated() {
        this._updateCurrentTab();
    }

    currentTab;

    /**
     * Event called when user selects a tab
     */
    tabHandleActivation(event) {
        this.currentTab = event.target.value;
        this._updateCurrentTab();
    }

    _updateCurrentTab() {
        const spinner = this.template.querySelector('c-orgcheck-spinner');
        spinner.open();
        Promise.all([
            new Promise((resolve, reject) => {
                spinner.setMessage('currentTab', 'Updating content of Tab '+this.currentTab+'...', 'started');
                try {
                    switch (this.currentTab) {
                        case 'objects': 
                            this.populateObjects();
                            break;
                        case 'customFields': 
                            this.populateCustomFields();
                            break;
                        default:
                    }
                } catch (e) {
                    spinner.setMessage('currentTab', 'Current Tab '+this.currentTab+' was not updated because of an error!', 'error');
                    reject(e);
                }
                spinner.setMessage('currentTab', 'Current Tab '+this.currentTab+' was updated.', 'done');
                resolve();
            })
        ]).then(() => {
            spinner.close();
        }).catch((e) => {
            // TODO
            console.error(e);
        }).finally(() => {
        });
    }

    /** 
     * Is the OrgCheck API is currently loading?
     */
    #isApiLoading;

    /**
     * Method called when the Org Check API component has loaded successfuly.
     * The Org Check API component is a child of this component.
     */
    apiLoaded() {
        this.#isApiLoading = true;
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
            // TODO
            console.error(e);
        }).finally(() => {
            this.#isApiLoading = false;
        });
    }

    /**
     * Method called when the Org Check API component has failed miserably.
     * The Org Check API component is a child of this component.
     */
    apiFailed(event) {
        // TODO
        console.error(event.detail.from, event.detail.error);
    }

    /**
     * Populate the options for the filter "Packages"
     * This method needs to be called once the Org Check API has been fully loaded.
     */
    async populateFilterPackages() {
        const orgcheckApi = this.template.querySelector('c-orgcheck-api');
        const filters = this.template.querySelector('c-orgcheck-global-filters');
        const packages = await orgcheckApi.packages();
        filters.packageOptions = packages.map(p => { 
            return {
                label: p.name + ' (api=' + p.namespace + ', type=' + p.type + ')',
                value: p.namespace
            }
        });
    }

    /**
     * Populate the options for the filter "Object Types"
     * This method needs to be called once the Org Check API has been fully loaded.
     */
    populateFilterTypes() {
        const orgcheckApi = this.template.querySelector('c-orgcheck-api');
        const filters = this.template.querySelector('c-orgcheck-global-filters');
        const types = orgcheckApi.types();
        filters.sobjectTypeOptions = types.map(t => {
            return {
                label: t.label, 
                value: t.id 
            }
        });
    }

    /**
     * Populate the options for the filter "Object Names"
     * This method needs to be called once the Org Check API has been fully loaded.
     */
    async populateFilterObjects() {
        const orgcheckApi = this.template.querySelector('c-orgcheck-api');
        const filters = this.template.querySelector('c-orgcheck-global-filters');
        const objects = await orgcheckApi.objects(filters.package, filters.sobjectType);
        filters.sobjectApiNameOptions = objects.map(o => {
            return {
                label: o.label + ' (api=' + o.developerName + (o.package===''?'':(', package=' + o.package)) + ')',
                value: o.developerName
            }
        });
    }

    /**
     * Populate the object documentation panel
     * This method needs to be called once the Org Check API has been fully loaded.
     */
    async populateObjects() {

        // Getting components references
        //const orgcheckApi = this.template.querySelector('c-orgcheck-api');
        const filters = this.template.querySelector('c-orgcheck-global-filters');
        const objectsPanel = this.template.querySelector('c-orgcheck-tab-objects');
        if (!objectsPanel) return; // panel may not be loaded yet

        // Calling API
        //const objectInformation = await orgcheckApi.object(filters.package, filters.sobjectApiName);

        // Mapping
        objectsPanel.package = filters.package;
        objectsPanel.sobjectApiName = filters.sobjectApiName;
        objectsPanel.isSObjectSpecified = (filters.isAnySObjectApiName === false);
    }

    /**
     * Populate the custom fields panel
     * This method needs to be called once the Org Check API has been fully loaded.
     */
    async populateCustomFields() {

        // Getting components references
        const orgcheckApi = this.template.querySelector('c-orgcheck-api');
        const filters = this.template.querySelector('c-orgcheck-global-filters');
        const customFieldsPanel = this.template.querySelector('c-orgcheck-tab-customfields');
        if (!customFieldsPanel) return; // panel may not be loaded yet

        // Calling API
        const fields = await orgcheckApi.customFields(filters.package, filters.sobjectType, filters.sobjectApiName);

        // Mapping
        customFieldsPanel.tableKeyField = 'index';
        customFieldsPanel.tableColumns = [
            { fieldName: 'index', label: '#' },
            { fieldName: 'sobjectURL', label: 'Object', type: 'url', typeAttributes: { label: { fieldName: 'sobjectName' }} },
            { fieldName: 'type', label: 'Type' },
            { fieldName: 'fieldURL', label: 'Field', type: 'url', typeAttributes: { label: { fieldName: 'fieldName' }} },
            { fieldName: 'namespace', label: 'Package' },
            { fieldName: 'developerName', label: 'Full API Name' },
            { fieldName: 'using', label: 'Using' }
        ];
        customFieldsPanel.tableData = fields.map(f => { 
            return {
                index: f.id,
                sobjectName: f.objectDeveloperName,
                sobjectURL: '/'+f.objectDeveloperName,
                type: 'xxx',
                fieldName: f.fieldName,
                fieldURL: '/'+f.fieldName,
                namespace: f.package,
                developerName: f.developerName,
                using: 'xxx'
            }
        });
    }






    
    /* ********** */
    /* DATATABLES */
    /* ********** */;

    usersData = [];
    usersColumns = [
        { label: '#', fieldName: 'index' },
        { label: 'Score', fieldName: 'score', type: 'number' },
        { label: 'User Name', fieldName: 'name' },
        { label: 'LastLogin', fieldName: 'lastLogin', type: 'datatime' }
    ];

}