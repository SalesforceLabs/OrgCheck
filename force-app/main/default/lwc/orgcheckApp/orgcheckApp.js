import { LightningElement, api } from 'lwc';
import { METHOD_TYPES_PACKAGES_OBJECTS,
    METHOD_CUSTOM_FIELD, METHOD_OBJECT_DESCRIBE, 
    METHOD_PERMISSION_SETS, METHOD_PROFILES, METHOD_USERS,
    METHOD_CACHE_MANAGER } from 'c/orgcheckApi';

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
        await this._loadFilters();
    }

    handleApiLog(event) {
        const spinner = this.template.querySelector('c-orgcheck-spinner');
        const s = event.detail.section;
        const m = event.detail.message;
        switch(event.detail.status) {
            case 'begin': spinner.open(); break;
            case 'section-starts': spinner.sectionStarts(s, m); break;
            case 'section-in-progress': spinner.sectionContinues(s, m); break;
            case 'section-ended': spinner.sectionEnded(s, m); break;
            case 'section-failed': spinner.sectionFailed(s, m); break;
            default: spinner.close(1000);
        }
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
        spinner.sectionFailed('Loading API', `Failed with error: ${event.detail.error.message}`);
        console.error(event.detail.error.stack);
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
        const data = await this._callingAPI(method);
            
        // Send data back to the component
        if (data) content.setComponentData(data);
    }

    async _callingAPI(method) {
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
        const orgcheckApi = this.template.querySelector('c-orgcheck-api');
        const data = await orgcheckApi.callingApi(method, args);
        return data;
    }

    /**
     * Unique method to load or reload filter options and reset selected values accordingly
     * Usage: as this method is async, you should await when calling it!
     */
    async _loadFilters() {
        const filters = this.template.querySelector('c-orgcheck-global-filters');
        const data = await this._callingAPI(METHOD_TYPES_PACKAGES_OBJECTS);
        if (data) {
            filters.updateSObjectTypeOptions(data.types);
            filters.updatePackageOptions(data.packages);
            filters.updateSObjectApiNameOptions(data.objects);
        }
    }
}