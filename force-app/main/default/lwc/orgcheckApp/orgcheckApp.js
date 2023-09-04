import { LightningElement, api } from 'lwc';
import { METHOD_TYPES, METHOD_PACKAGES, METHOD_OBJECTS,
    METHOD_CUSTOM_FIELD, METHOD_OBJECT_DESCRIBE, 
    METHOD_PERMISSION_SETS, METHOD_PROFILES, METHOD_USERS,
    METHOD_CACHE_MANAGER } from 'c/orgcheckApi';
import { SECTION_STATUS_STARTED, SECTION_STATUS_IN_PROGRESS,
    SECTION_STATUS_ENDED, SECTION_STATUS_FAILED } from 'c/orgcheckSpinner';

const API_STATE_NOT_LOADED = 'Not Loaded';
const API_STATE_LOADED = 'Loaded';
const API_STATE_FAILED = 'Failed';

export default class OrgCheckApp extends LightningElement {

    /** 
     * {String} accessToken Access Token of the current user
     *                      This value is decorated by "api" so it can be passed by the parent.
     *                      Indeed the value will be set by the parent (a Visual Force page) and will be used by the Org Check API
     */
    @api accessToken;

    /**
     * {String} userId Salesforce Id of the current user passed by Visual Force page
     *                 This value is decorated by "api" so it can be passed by the parent.
     *                 Indeed the value will be set by the parent (a Visual Force page) and will be used by the Org Check API
     */
    @api userId;

    /** 
     * {String} #apiState State of the Org Check API
     *                    This property is private
     *                    Can be one of the three values: 'Not Loaded' (default), 'Loaded' or 'Failed'
     */
    #apiState = API_STATE_NOT_LOADED;

    /**
     * {String} #currentTab The name of the currently selected tab
     *                      This property is private
     */
    #currentTab;

    /**
     * After changing the filters value, a button appears on the UI.
     * Event called when the user click on this new button.
     * The idea here is to populate the appropriate data on the current tab
     * This method is async because it awaits for the internal _updateCurrentTab method.
     */
    async handleFiltersValidated() {
        await this._updateCurrentTab();
    }

    /**
     * Event called when user selects a main tab
     * This updates the internal private property called "#currentTab" that represents the name of the tab currently opened/visible.
     * This method is async because it awaits for the internal _updateCurrentTab method.
     * 
     * @param {Event} event triggered when a user is selecting a main tab, thus the current tab will be the current selected sub tab within this main tab.
     */
    async handleTabActivation(event) {
        if (event.target.children.length > 0) {
            await this._updateCurrentTab(event.target.children[0].activeTabValue);
        }
    }

    /**
     * Event called when user selects a sub tab (within a main tab)
     * This updates the internal private property called "#currentTab" that represents the name of the tab currently opened/visible.
     * This method is async because it awaits for the internal _updateCurrentTab method.
     * 
     * @param {Event} event triggered when a user is selecting a sub tab, thus its target is actually the current tab.
     */
    async handleSubTabActivation(event) {
        await this._updateCurrentTab(event.target.value);
    }

    /**
     * Event called when the content of a sub tab is fully loaded
     * This method is async because it awaits for the internal _updateCurrentTab method.
     */
    async handleSubTabContentLoaded() {
        await this._updateCurrentTab();
    }

    /**
     * Method called when the Org Check API component has loaded successfuly.
     * The Org Check API component is a child of this component.
     * This method is async because it awaits for the internal _loadFilters method.
     */
    async handleApiLoaded() {
        this.#apiState = API_STATE_LOADED;
        await this._loadFilters(true, true, true);
    }

    /**
     * Method called when the Org Check API component has failed miserably.
     * The Org Check API component is a child of this component.
     * 
     * @param {Event} event triggered when the Org Check API has failed, thus its detail information contains the origin and the error message
     */
    handleApiFailed(event) {
        this.#apiState = API_STATE_FAILED;
        const spinner = this.template.querySelector('c-orgcheck-spinner');
        spinner.open();
        spinner.setSection('Loading API', `Failed with error: ${event.detail.error.message}`, SECTION_STATUS_FAILED);
        console.error(event.detail.error.stack);
    }

    /**
     * Event called when the user changed a value in the global filter.
     * The idea here is not to apply the new values of the filters in the tabs.
     * Here, it is more about synchronizing values and options all together within 
     * the global filter.
     * This method is async because it awaits for the internal _loadFilters method.
     * 
     * @param {Event} event triggered when a filter is changed, thus detail information contains the name of the filter that changed
     */
    async handleFilterChanged(event) {
        if (event.detail.what === 'package' || event.detail.what === 'sobjectType') {
            await this._loadFilters(false, false, true);
        }
    }

    async handleRemoveCache(event) {
        const orgcheckApi = this.template.querySelector('c-orgcheck-api');
        if (event.detail.allItems === true) {
            orgcheckApi.removeAllCache();
        } else {
            orgcheckApi.removeCache(event.detail.itemName);
        }
        this._updateCurrentTab();
    }

    /**
     * Unique method to propagate a change to be done in the current tab.
     * If the given input value is specified, this must be different from the current tab property, otherwise this method does nothing.
     * If the given input value is undefined, the method will use the current tab.
     * This can be because end user selected another tab
     * This can be also becasue a filter was validated and needs to be propagated into the current tab
     * This can be also if the current tab is finally loaded
     * Usage: as this method is async, you should await when calling it!
     * 
     * @param {String} nextCurrentTab Next current tab that will be activated/selected.
     */
    async _updateCurrentTab(nextCurrentTab) {

        // If for some reason the api is not yet loaded, we stop there
        if (this.#apiState !== API_STATE_LOADED) return;

        // If the next current tab is the same as the current one, we stop here
        if (nextCurrentTab && nextCurrentTab === this.#currentTab) return;

        // If the next current tab is specified, we use it to reset the current tab property
        if (nextCurrentTab) this.#currentTab = nextCurrentTab;

        // The tab name (in lightning-tab value property) will match the name of the component
        const content = this.template.querySelector(`c-orgcheck-${this.#currentTab}`);

        // If we receive null, the content is not existing or not yet loaded
        // OR
        // If the content is not implementing the 'setComponentData' method (must be api decorated)
        // In these cases, we stop here
        if (!content || !content.setComponentData) return;

        const spinner = this.template.querySelector('c-orgcheck-spinner');
        const orgcheckApi = this.template.querySelector('c-orgcheck-api');

        // If components are not yet loaded, we stop there
        if (!spinner || !orgcheckApi) return;

        try {
            // Starting message in the spinner
            spinner.open();
            spinner.setSection(this.#currentTab, 'Update current sub tab...', SECTION_STATUS_STARTED);

            // Set the API method to call depending on th current tab
            // If not supported we stop there
            let method;
            switch (this.#currentTab) {
                case 'object-information': method = METHOD_OBJECT_DESCRIBE; break;
                case 'custom-fields':      method = METHOD_CUSTOM_FIELD;    break;
                case 'users':              method = METHOD_USERS;           break;
                case 'profiles':           method = METHOD_PROFILES;        break;
                case 'permission-sets':    method = METHOD_PERMISSION_SETS; break;
                case 'cache-manager':      method = METHOD_CACHE_MANAGER; break;
                default:                   return;
            }

            // Calling the API
            spinner.setSection(this.#currentTab, 'Calling API...', 'started');
            const data = await orgcheckApi.callingApi(method, this._generateArgumentsToCallAPI());
                
            // Send data back to the component
            spinner.setSection(this.#currentTab, 'Send back the data to the component...', SECTION_STATUS_IN_PROGRESS);
            content.setComponentData(data);

            // Ending message in the spinner
            spinner.setSection(this.#currentTab, 'Bravo, the current sub tab was updated!', SECTION_STATUS_ENDED);
            spinner.close();

        } catch (e) {
            // Error message in the spinner
            spinner.setSection(this.#currentTab, `We had an error: ${e?.message}`, SECTION_STATUS_FAILED);
            console.error(e.stack);
        }
    }

    _generateArgumentsToCallAPI() {
        const filters = this.template.querySelector('c-orgcheck-global-filters');
        const args = {};
        if (filters.isSelectedPackageAny === true) {
            args.package = '*';
        } else {
            if (filters.isSelectedPackageNo === true) {
                args.package = '';
            } else {
                args.package = filters.selectedPackage;
            }
        }
        if (filters.isSelectedSObjectTypeAny === true) {
            args.sobjectType = '*';
        } else {
            args.sobjectType = filters.selectedSObjectType;
        }
        if (filters.isSelectedSObjectApiNameAny === true) {
            args.sobject = '*';
        } else {
            args.sobject = filters.selectedSObjectApiName;
        }
        return args;
    }

    /**
     * Unique method to load or reload filter options and reset selected values accordingly
     * Usage: as this method is async, you should await when calling it!
     * 
     * @param {Boolean} loadTypes true if types need to be loaded/reloaded
     * @param {Boolean} loadPackages true if packages need to be loaded/reloaded
     * @param {Boolean} loadObjects true if objects need to be loaded/reloaded
     */
    async _loadFilters(loadTypes, loadPackages, loadObjects) {
        const spinner = this.template.querySelector('c-orgcheck-spinner');
        const orgcheckApi = this.template.querySelector('c-orgcheck-api');
        const filters = this.template.querySelector('c-orgcheck-global-filters');
        spinner.open();
        let success = true;
        if (loadTypes === true) {
            try {
                spinner.setSection('types', 'Loading types from API...', SECTION_STATUS_STARTED);
                const data = await orgcheckApi.callingApi(METHOD_TYPES);
                spinner.setSection('types', `Received ${data?.length} type(s).`, SECTION_STATUS_IN_PROGRESS);
                filters.updateSObjectTypeOptions(data);
                spinner.setSection('types', 'Types loaded in global filters.', SECTION_STATUS_ENDED);
            } catch (e) {
                spinner.setSection('types', `We had an error: ${e?.message}`, SECTION_STATUS_FAILED);
                console.error(e.stack);
                success = false;
            }
        }
        if (loadPackages === true) {
            try {
                spinner.setSection('packages', 'Loading packages from API...', SECTION_STATUS_STARTED);
                const data = await orgcheckApi.callingApi(METHOD_PACKAGES);
                spinner.setSection('packages', `Received ${data?.length} package(s).`, SECTION_STATUS_IN_PROGRESS);
                filters.updatePackageOptions(data);
                spinner.setSection('packages', 'Packages loaded in global filters.', SECTION_STATUS_ENDED);
            } catch (e) {
                spinner.setSection('packages', `We had an error: ${e?.message}`, SECTION_STATUS_FAILED);
                console.error(e.stack);
                success = false;
            }
        }
        if (loadObjects === true) {
            try {
                spinner.setSection('objects', 'Loading SObjects from API for selected package and selected type...', SECTION_STATUS_STARTED);
                const data = await orgcheckApi.callingApi(METHOD_OBJECTS, this._generateArgumentsToCallAPI());
                spinner.setSection('objects', `Received ${data?.length} object(s).`, SECTION_STATUS_IN_PROGRESS);
                filters.updateSObjectApiNameOptions(data);
                spinner.setSection('objects', 'SObjects loaded in global filters.', SECTION_STATUS_ENDED);
            } catch (e) {
                spinner.setSection('objects', `We had an error: ${e?.message}`, SECTION_STATUS_FAILED);
                console.error(e.stack);
                success = false;
            }
        }
        if (success === true) {
            spinner.close();
        }
    }
}