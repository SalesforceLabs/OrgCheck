import { LightningElement, api } from 'lwc';

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
     * This method is async because it awaits for the api to return the list of items for the filters.
     */
    async handleApiLoaded() {
        this.#apiState = API_STATE_LOADED;

        const filters = this.template.querySelector('c-orgcheck-global-filters');
        const orgcheckApi = this.template.querySelector('c-orgcheck-api');

        try {
            const data = await orgcheckApi.getPackagesTypesAndObjects('*', '*');
            if (data) {
                filters.updateSObjectTypeOptions(data.types);
                filters.updatePackageOptions(data.packages);
                filters.updateSObjectApiNameOptions(data.objects);
            }    
        } catch (error) {
            const spinner = this.template.querySelector('c-orgcheck-spinner');
            spinner.open();
            spinner.sectionFailed('Error while loading the API', error);
            spinner.canBeClosed();
        }
    }

    /**
     * Method called when api needs to log a progress in the UI
     * Detail of the message should contain a 'status', a 'section' and a 'message'
     */
    handleApiLog(event) {
        const spinner = this.template.querySelector('c-orgcheck-spinner');
        if (event.detail.status === 'begin') {
            spinner.open();
        } else if (event.detail.status === 'end') {
            if (event.detail.nbFailures === 0) {
                spinner.close(500);
            } else {
                spinner.canBeClosed();
            }
        } else {
            const s = event.detail.section;
            const m = event.detail.message;
            const e = event.detail.error;
            switch(event.detail.status) {
                case 'section-starts': spinner.sectionStarts(s, m); break;
                case 'section-in-progress': spinner.sectionContinues(s, m); break;
                case 'section-ended': spinner.sectionEnded(s, m); break;
                case 'section-failed': default: spinner.sectionFailed(s, e); break;
            }        
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
        spinner.sectionFailed('Loading API', event.detail.error);
        spinner.canBeClosed();
    }

    /**
     * Method called when the user ask to remove an item or all the cache in the UI
     * 
     * @param {Event} event should contain "allItems" (boolean) and optinally "itemName" (string), if allItems=true 
     *                      all items should be removed, if not, the "itemName" gives us the name if the cache entry
     *                      to be removed.
     */
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

        // Get the global filter parameters
        const filters = this.template.querySelector('c-orgcheck-global-filters');
        const namespace = filters.isSelectedPackageAny === true ? '*' : (filters.isSelectedPackageNo === true ? '' : filters.selectedPackage);
        const sobjectType = filters.isSelectedSObjectTypeAny === true ? '*' : filters.selectedSObjectType;
        const sobject = filters.isSelectedSObjectApiNameAny === true ? '*' : filters.selectedSObjectApiName;

        // Call the API depending on the current tab
        // If not supported we stop there
        const orgcheckApi = this.template.querySelector('c-orgcheck-api');
        let data;
        try {
            switch (this.#currentTab) {
                case 'object-information':                 data = await orgcheckApi.getObject(sobject); break;
                case 'objects-owd':                        console.error('TODO'); break;
                case 'custom-fields':                      data = await orgcheckApi.getCustomFields(namespace, sobjectType, sobject); break;
                case 'users':                              data = await orgcheckApi.getActiveUsers(); break;
                case 'profiles':                           data = await orgcheckApi.getProfiles(namespace); break;
                case 'permission-sets':                    data = await orgcheckApi.getPermissionSets(namespace); break;
                case 'roles':                              console.error('TODO'); break;
                case 'public-groups':                      data = await orgcheckApi.getPublicGroups(); break;
                case 'queues':                             data = await orgcheckApi.getQueues(); break;
                case 'flows"':                             console.error('TODO'); break;
                case 'process-builders':                   console.error('TODO'); break;
                case 'workflows':                          console.error('TODO'); break;
                case 'custom-labels':                      data = await orgcheckApi.getCustomLabels(namespace); break;
                case 'visual-force-pages':                 data = await orgcheckApi.getVisualForcePages(namespace); break;
                case 'visual-force-components':            data = await orgcheckApi.getVisualForceComponents(namespace); break;
                case 'lightning-pages':                    data = await orgcheckApi.getLightningPages(namespace); break;
                case 'lightning-aura-components':          data = await orgcheckApi.getLightningAuraComponents(namespace); break;
                case 'lightning-web-components':           data = await orgcheckApi.getLightningWebComponents(namespace); break;
                case 'apex-classes':                       console.error('TODO'); break;
                case 'apex-recompilation-needed':          console.error('TODO'); break;
                case 'apex-triggers':                      console.error('TODO'); break;
                case 'apex-unit-tests':                    console.error('TODO'); break;
                case 'dashboards':                         console.error('TODO'); break;
                case 'reports" label="Reports':            console.error('TODO'); break;
                case 'schedulable-classes-not-scheduled':  console.error('TODO'); break;
                case 'apex-jobs':                          console.error('TODO'); break;
                case 'scheduled-jobs':                     console.error('TODO'); break;
                case 'cache-manager':                      data = await orgcheckApi.getCacheInformation(); break;
                default:                                   return;
            }
        } catch (error) {
            const spinner = this.template.querySelector('c-orgcheck-spinner');
            spinner.open();
            spinner.sectionFailed(`Error while updating current tab called '${nextCurrentTab}'`, error);
            spinner.canBeClosed();
        }
            
        // Send data back to the component
        if (data) content.setComponentData(data);
    }
}