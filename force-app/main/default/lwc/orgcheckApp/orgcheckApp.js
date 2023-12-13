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
                const dataAsJson = JSON.parse(data);
                filters.updateSObjectTypeOptions(dataAsJson.types);
                filters.updatePackageOptions(dataAsJson.packages);
                filters.updateSObjectApiNameOptions(dataAsJson.objects);
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

        // Get the global filter parameters
        const filters = this.template.querySelector('c-orgcheck-global-filters');
        const namespace = filters.isSelectedPackageAny === true ? '*' : (filters.isSelectedPackageNo === true ? '' : filters.selectedPackage);
        const sobjectType = filters.isSelectedSObjectTypeAny === true ? '*' : filters.selectedSObjectType;
        const sobject = filters.isSelectedSObjectApiNameAny === true ? '*' : filters.selectedSObjectApiName;

        // Call the API depending on the current tab
        // If not supported we stop there
        // Finally send the data to the content component.
        // All is surrounded by a try catch that will show error modal if any.
        const orgcheckApi = this.template.querySelector('c-orgcheck-api');
        const spinner = this.template.querySelector('c-orgcheck-spinner');
        const section = `TAB ${this.#currentTab}`;
        try {
            spinner.open();
            spinner.sectionStarts(section, 'Call the corresponding Org Check API');
            switch (this.#currentTab) {
                case 'object-information':                 if (sobject !== '*') this.objectInformationData = await orgcheckApi.getObject(sobject); else this.objectInformationData = null; break;
                case 'objects-owd':                        this.objectsOWDTableData = await orgcheckApi.getObjectsOWDs(); break;
                case 'custom-fields':                      this.customFieldsTableData = await orgcheckApi.getCustomFields(namespace, sobjectType, sobject); break;
                case 'users':                              this.usersTableData = await orgcheckApi.getActiveUsers(); break;
                case 'profiles':                           this.profilesTableData = await orgcheckApi.getProfiles(namespace); break;
                case 'permission-sets':                    this.permissionSetsTableData = await orgcheckApi.getPermissionSets(namespace); break;
                case 'roles':                              this.rolesTableData = await orgcheckApi.getRoles(); break;
                case 'public-groups':                      this.publicGroupsTableData = await orgcheckApi.getPublicGroups(); break;
                case 'queues':                             this.queuesTableData = await orgcheckApi.getQueues(); break;
                case 'flows':                              this.flowsTableData = await orgcheckApi.getFlows(); break;
                case 'process-builders':                   this.processBuildersTableData = await orgcheckApi.getProcessBuilders(); break;
                case 'workflows':                          this.workflowsTableData = await orgcheckApi.getWorkflows(); break;
                case 'custom-labels':                      this.customLabelsTableData = await orgcheckApi.getCustomLabels(namespace); break;
                case 'visual-force-pages':                 this.visualForcePagesTableData = await orgcheckApi.getVisualForcePages(namespace); break;
                case 'visual-force-components':            this.visualForceComponentsTableData = await orgcheckApi.getVisualForceComponents(namespace); break;
                case 'lightning-pages':                    this.lightningPagesTableData = await orgcheckApi.getLightningPages(namespace); break;
                case 'lightning-aura-components':          this.auraComponentsTableData = await orgcheckApi.getLightningAuraComponents(namespace); break;
                case 'lightning-web-components':           this.lightningWebComponentsTableData = await orgcheckApi.getLightningWebComponents(namespace); break;
                case 'apex-classes':                       
                case 'apex-recompilation-needed':          
                case 'apex-triggers':                      
                case 'schedulable-classes-not-scheduled':  
                case 'apex-jobs':                          
                case 'apex-unit-tests':                    this.apexClassesTableData = await orgcheckApi.getApexClasses(namespace); break;
                case 'dashboards':                         this.dashboardsTableData = await orgcheckApi.getDashboards(); break;
                case 'reports':                            this.reportsTableData = await orgcheckApi.getReports(); break;
                case 'cache-manager':                      this.cacheManagerData = await orgcheckApi.getCacheInformation(); break;
                default:
            }
            spinner.sectionEnded(section, 'Done');
            spinner.close();

        } catch (error) {
            spinner.open();
            spinner.sectionFailed(section, error);
            spinner.canBeClosed();
        }
    }

    customFieldsTableColumns = [
        { label: 'Object',              type: 'id',               data: { ref: 'objectRef', value: 'label', url: 'url' }},
        { label: 'Object Type',         type: 'text',             data: { ref: 'objectRef.typeRef', value: 'label' }},
        { label: 'Field',               type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'Package',             type: 'text',             data: { value: 'package' }},
        { label: 'Using',               type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in',       type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length', min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
        { label: 'Ref. in Layout?',     type: 'numeric',          data: { ref: 'dependencies.referencedByTypes', value: 'Layout' }},
        { label: 'Ref. in Apex Class?', type: 'numeric',          data: { ref: 'dependencies.referencedByTypes', value: 'Class' }},
        { label: 'Ref. in Flow?',       type: 'numeric',          data: { ref: 'dependencies.referencedByTypes', value: 'Flow' }},
        { label: 'Dependencies',        type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',        type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date',       type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Description',         type: 'text',             data: { value: 'description', maximumLength: 30, valueIfEmpty: 'No description.' }}
    ];

    customFieldsTableData;

    customLabelsTableColumns = [
        { label: 'Name',                type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'Package',             type: 'text',             data: { value: 'package' }},
        { label: 'Label',               type: 'text',             data: { value: 'label' }},
        { label: 'Category',            type: 'text',             data: { value: 'category' }},
        { label: 'Language',            type: 'text',             data: { value: 'language' }},
        { label: 'Protected?',          type: 'boolean',          data: { value: 'isProtected' }},
        { label: 'Using',               type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in',       type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length', min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
        { label: 'Ref. in Layout?',     type: 'numeric',          data: { ref: 'dependencies.referencedByTypes', value: 'Layout' }},
        { label: 'Ref. in Apex Class?', type: 'numeric',          data: { ref: 'dependencies.referencedByTypes', value: 'Class' }},
        { label: 'Ref. in Flow?',       type: 'numeric',          data: { ref: 'dependencies.referencedByTypes', value: 'Flow' }},
        { label: 'Dependencies',        type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',        type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date',       type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Value',               type: 'text',             data: { value: 'value', maximumLength: 30 }}
    ];

    customLabelsTableData;

    auraComponentsTableColumns = [
        { label: 'Name',                type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',         type: 'numeric',          data: { value: 'apiVersion' }},
        { label: 'Package',             type: 'text',             data: { value: 'package' }},
        { label: 'Using',               type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in',       type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length', min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
        { label: 'Dependencies',        type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',        type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date',       type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Description',         type: 'text',             data: { value: 'description', maximumLength: 30, valueIfEmpty: 'No description.' }}
    ];

    auraComponentsTableData;

    lightningPagesTableColumns = [
        { label: 'Name',                type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'Package',             type: 'text',             data: { value: 'package' }},
        { label: 'Using',               type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in',       type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length', min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
        { label: 'Dependencies',        type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',        type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date',       type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Description',         type: 'text',             data: { value: 'description', maximumLength: 30, valueIfEmpty: 'No description.' }}
    ];

    lightningPagesTableData;

    lightningWebComponentsTableColumns = [
        { label: 'Name',                type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',         type: 'numeric',          data: { value: 'apiVersion' }},
        { label: 'Package',             type: 'text',             data: { value: 'package' }},
        { label: 'Using',               type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in',       type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length', min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
        { label: 'Dependencies',        type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',        type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date',       type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Description',         type: 'text',             data: { value: 'description', maximumLength: 30, valueIfEmpty: 'No description.' }}
    ]

    lightningWebComponentsTableData;

    permissionSetsTableColumns = [
        { label: 'Name',             type: 'id',       data: { value: 'name', url: 'url' }},
        { label: 'Is Group?',        type: 'boolean',  data: { value: 'isGroup' }},
        { label: 'Custom',           type: 'boolean',  data: { value: 'isCustom' }},
        { label: '#FLSs',            type: 'numeric',  data: { value: 'nbFieldPermissions', max: 50, valueAfterMax: '50+' }},
        { label: '#Object CRUDs',    type: 'numeric',  data: { value: 'nbObjectPermissions', max: 50, valueAfterMax: '50+' }},            
        { label: 'License',          type: 'text',     data: { value: 'license' }},
        { label: 'Package',          type: 'text',     data: { value: 'package' }},
        { label: '#Active users',    type: 'numeric',  data: { value: 'memberCounts', max: 50, valueAfterMax: '50+', min: 1, valueBeforeMin: 'No active user on this permission set!' }},
        { label: 'Users\' profiles', type: 'ids',      data: { ref: 'profileRefs', value: 'name', url: 'url' }},
        { label: 'Created date',     type: 'dateTime', data: { value: 'createdDate' }},
        { label: 'Modified date',    type: 'dateTime', data: { value: 'lastModifiedDate' }},
        { label: 'Description',      type: 'text',     data: { value: 'description', maximumLength: 30, valueIfEmpty: 'No description.' }}
    ];

    permissionSetsTableData;

    profilesTableColumns = [
        { label: 'Name',            type: 'id',       data: { value: 'name', url: 'url' }},
        { label: 'Custom',          type: 'boolean',  data: { value: 'isCustom' }},
        { label: '#FLSs',           type: 'numeric',  data: { value: 'nbFieldPermissions', max: 50, valueAfterMax: '50+' }},
        { label: '#Object CRUDs',   type: 'numeric',  data: { value: 'nbObjectPermissions', max: 50, valueAfterMax: '50+' }},            
        { label: 'License',         type: 'text',     data: { value: 'license' }},
        { label: 'Package',         type: 'text',     data: { value: 'package' }},
        { label: '#Active users',   type: 'numeric',  data: { value: 'memberCounts', max: 50, valueAfterMax: '50+', min: 1, valueBeforeMin: 'No active user on this profile!' }},
        { label: 'Created date',    type: 'dateTime', data: { value: 'createdDate' }},
        { label: 'Modified date',   type: 'dateTime', data: { value: 'lastModifiedDate' }},
        { label: 'Description',     type: 'text',     data: { value: 'description', maximumLength: 30, valueIfEmpty: 'No description.' }}
    ];

    profilesTableData;

    publicGroupsTableColumns = [
        { label: 'Name',             type: 'id',       data: { value: 'name', url: 'url' }},
        { label: 'Developer Name',   type: 'text',     data: { value: 'developerName' }},
        { label: 'With bosses?',     type: 'boolean',  data: { value: 'includeBosses' }},
        { label: 'Included groups',  type: 'ids',      data: { ref: 'directGroups', value: 'id', url: 'url' }},
        { label: 'Included users',   type: 'ids',      data: { ref: 'directUsers', value: 'id', url: 'url' }},
        { label: 'All active users', type: 'ids',      data: { ref: 'indirectUsers', value: 'id', url: 'url' }},
    ];

    publicGroupsTableData;

    queuesTableColumns = [
        { label: 'Name',             type: 'id',       data: { value: 'name', url: 'url' }},
        { label: 'Developer Name',   type: 'text',     data: { value: 'developerName' }},
        { label: 'With bosses?',     type: 'boolean',  data: { value: 'includeBosses' }},
        { label: 'Included groups',  type: 'ids',      data: { ref: 'directGroups', value: 'id' }},
        { label: 'Included users',   type: 'ids',      data: { ref: 'directUsers', value: 'id' }},
        { label: 'All active users', type: 'ids',      data: { ref: 'indirectUsers', value: 'id' }},
    ];

    queuesTableData;

    usersTableColumns = [
        { label: 'User Name',       type: 'id',       data: { value: 'name', url: 'url' }},
        { label: 'Under LEX?',      type: 'boolean',  data: { value: 'onLightningExperience' }},
        { label: 'Last login',      type: 'dateTime', data: { value: 'lastLogin', valueIfEmpty: 'Never logged!' }},
        { label: 'Failed logins',   type: 'numeric',  data: { value: 'numberFailedLogins' }},
        { label: 'Password change', type: 'dateTime', data: { value: 'lastPasswordChange' }},
        { label: 'Key permissions', type: 'texts',    data: { ref: 'importantPermissions' }},
        { label: 'Profile',         type: 'id',       data: { ref: 'profileRef', url: 'url', value: 'name' }},
        { label: 'Permission Sets', type: 'ids',      data: { ref: 'permissionSetRefs', url: 'url', value: 'name' }}
    ];

    usersTableData;

    visualForceComponentsTableColumns = [
        { label: 'Name',                type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',         type: 'numeric',          data: { value: 'apiVersion' }},
        { label: 'Package',             type: 'text',             data: { value: 'package' }},
        { label: 'Using',               type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in',       type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length', min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
        { label: 'Dependencies',        type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',        type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date',       type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Description',         type: 'text',             data: { value: 'description', maximumLength: 30, valueIfEmpty: 'No description.' }}
    ];

    visualForceComponentsTableData;

    visualForcePagesTableColumns = [
        { label: 'Name',                type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',         type: 'numeric',          data: { value: 'apiVersion' }},
        { label: 'Mobile',              type: 'boolean',          data: { value: 'isMobileReady' }},
        { label: 'Package',             type: 'text',             data: { value: 'package' }},
        { label: 'Using',               type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in',       type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length', min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
        { label: 'Dependencies',        type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',        type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date',       type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Description',         type: 'text',             data: { value: 'description', maximumLength: 30, valueIfEmpty: 'No description.' }}
    ];

    visualForcePagesTableData;

    apexClassesTableColumns;
    apexClassesTableData;
    apexTriggersTableColumns;
    apexTriggersTableData;
    apexTestsTableColumns;
    apexTestsTableData;
    
    dashboardsTableData;
    reportsTableData;
    objectsOWDTableData;
    rolesTableData;
    flowsTableData;
    processBuildersTableData;
    workflowsTableData;

    cacheManagerData;

    objectInformationData;
}