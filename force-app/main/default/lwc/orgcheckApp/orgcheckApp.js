import { OrgCheckAPI } from './api/orgcheck-api';
import { OrgCheckSalesforceMetadataTypes } from "./api/core/orgcheck-api-salesforce-metadatatypes";
import { LightningElement, api } from 'lwc';
import OrgCheckStaticRessource from "@salesforce/resourceUrl/OrgCheck_SR";
import { SFDC_Flow } from './api/data/orgcheck-api-data-flow';
import { SFDC_Field } from './api/data/orgcheck-api-data-field';
import { SFDC_CustomLabel } from './api/data/orgcheck-api-data-customlabel';
import { SFDC_LightningAuraComponent } from './api/data/orgcheck-api-data-lightningauracomponent';
import { SFDC_LightningPage } from './api/data/orgcheck-api-data-lightningpage';
import { SFDC_LightningWebComponent } from './api/data/orgcheck-api-data-lightningwebcomponent';
import { SFDC_PermissionSet } from './api/data/orgcheck-api-data-permissionset';
import { SFDC_Profile } from './api/data/orgcheck-api-data-profile';
import { SFDC_ProfileRestrictions } from './api/data/orgcheck-api-data-profilerestrictions';
import { SFDC_ProfilePasswordPolicy } from './api/data/orgcheck-api-data-profilepasswordpolicy';
import { SFDC_User } from './api/data/orgcheck-api-data-user';
import { SFDC_VisualForceComponent } from './api/data/orgcheck-api-data-visualforcecomponent';
import { SFDC_VisualForcePage } from './api/data/orgcheck-api-data-visualforcepage';
import { SFDC_ApexClass } from './api/data/orgcheck-api-data-apexclass';
import { SFDC_ApexTrigger } from './api/data/orgcheck-api-data-apextrigger';
import { SFDC_UserRole } from './api/data/orgcheck-api-data-userrole';
import { SFDC_Workflow } from './api/data/orgcheck-api-data-workflow';
import { SFDC_Group } from './api/data/orgcheck-api-data-group';
import { SFDC_Object } from './api/data/orgcheck-api-data-object';
// @ts-ignore
import { loadScript } from 'lightning/platformResourceLoader';

export default class OrgCheckApp extends LightningElement {

    /**
     * @description URL for the logo in the header
     * @type {string} 
     * @public
     */
    logoURL = OrgCheckStaticRessource + '/img/Logo.svg';

    /**
     * @description Current user has accepted the usage terms
     * @type {boolean} 
     * @public
     */
    useOrgCheckInThisOrgConfirmed = false;

    /**
     * @description We need the current user to accept the usage terms
     * @type {boolean} 
     * @public
     */
    useOrgCheckInThisOrgNeedConfirmation = false;

    /**
     * @description Org Check version
     * @type {string} 
     * @public
     */
    get orgCheckVersion() {
        return this._api?.version ?? '';
    }

    /**
     * @description Numerical representation of the Salesforce API Version we use in Org Check
     * @type {number}
     * @public
     */
    get salesforceApiVersion() {
        return this._api?.salesforceApiVersion ?? NaN;
    }

    /**
     * @description Org name
     * @type {string} 
     * @public
     */
    orgName;

    /**
     * @description Org type. Can be 'Production', 'Sandbox', 'Trial' or 'Developer Edition'
     * @type {string} 
     * @public
     */
    orgType;

    /**
     * @description Is the type of the org a production one?
     * @type {boolean} 
     * @public
     */
    isOrgProduction;

    /**
     * @description Depending on the type of the org, we can have different themes in the UI
     * @type {string} 
     * @public
     */
    themeForOrgType;

    /**
     * @description Org usage limit information
     * @type {string} 
     * @public
     */
    orgLimit;

    /**
     * @description Depending on the usage limit, we can have different themes in the UI
     * @type {string} 
     * @public
     */
    themeForOrgLimit;

    /**
     * @description Salesforce Id of the current user passed by Visual Force page
     *                 This value is decorated by "api" so it can be passed by the parent.
     *                 Indeed the value will be set by the parent (a Visual Force page) and will be used by the Org Check API
     * @type {string}
     */
    @api userId;

    /** 
     * @description Access Token of the current user
     *                 This value is decorated by "api" so it can be passed by the parent.
     *                 Indeed the value will be set by the parent (a Visual Force page) and will be used by the Org Check API
     * @type {string}
     */
    @api accessToken;

    /**
     * @description The OrgCheck api
     * @type {OrgCheckAPI}
     * @private
     */
    _api;

    /**
     * @description Flag to render only once the component
     * @type {boolean}
     * @private
     */
    _hasRenderOnce = false;

    /**
     * @description Spinner component
     * @type {any}
     * @private
     */
    _spinner;

    /**
     * @description Modal component
     * @type {any}
     * @private
     */
    _modal;

    /**
     * @description Global filter component
     * @type {any}
     * @private
     */
    _filters;

    /**
     * @description After the component is fully load let's init some elements and the api
     * @public
     * @async
     */
    async renderedCallback() {
        if (this._hasRenderOnce === false && this.accessToken) {
            this._hasRenderOnce = true;
            this._spinner = this.template.querySelector('c-orgcheck-spinner');
            this._modal = this.template.querySelector('c-orgcheck-modal');
            this._filters = this.template.querySelector('c-orgcheck-global-filters');
            await this._loadAPI();
            await this._loadBasicInformationIfAccepted();
        }
    }




    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Global filter: getter for selected values and (re)load values in list
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description Getter for the selected namespace from the global filter
     * @returns {string} Empty string ('') if 'no namespace' selected, Wildcard ('*') if 'any namespace' selected, otherwise the name of the seleted namespace.
     * @public
     */ 
    get selectedNamespace() {
        if (this._filters.isSelectedPackageAny === true) {
            return '*';
        }
        if (this._filters.isSelectedPackageNo === true) {
            return '';
        }
        return this._filters.selectedPackage;
    }

    /**
     * @description Getter for the selected sobject type from the global filter
     * @returns {string} Wildcard ('*') if 'any type' selected, otherwise the name of the seleted type.
     * @public
     */ 
    get selectedSObjectType() {
        if (this._filters.isSelectedSObjectTypeAny === true) {
            return '*';
        }
        return this._filters.selectedSObjectType;
    }

    /**
     * @description Getter for the selected sobject name from the global filter
     * @returns {string} Wildcard ('*') if 'any sobject' selected, otherwise the name of the seleted sobject.
     * @public
     */ 
    get selectedSObject() {
        if (this._filters.isSelectedSObjectApiNameAny === true) {
            return '*';
        }
        return this._filters.selectedSObjectApiName;
    }



    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Org Check API loading, calls and update limit info in the UI
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description Load the Org Check API (and it dependencies) only the first time
     * @param {any} logger
     * @private
     * @async
     */ 
    async _loadAPI(logger) {
        // Init of the Org Check api (only once!)
        if (this._api) return;

        // Load JS dependencies
        logger?.log('Loading JsForce and FFLate libraries...');
        await Promise.all([
            loadScript(this, OrgCheckStaticRessource + '/js/jsforce.js'),
            loadScript(this, OrgCheckStaticRessource + '/js/fflate.js')
        ]);

        // Create the Org Check API
        logger?.log('Loading Org Check library...')
        this._api = new OrgCheckAPI(
            // @ts-ignore
            jsforce, fflate,
            this.accessToken, this.userId,
            {
                begin: () => { this._spinner.open(); },
                sectionStarts: (s, m) => { this._spinner.sectionStarts(s, m); },
                sectionContinues: (s, m) => { this._spinner.sectionContinues(s, m); },
                sectionEnded: (s, m) => { this._spinner.sectionEnded(s, m); },
                sectionFailed: (s, e) => { this._spinner.sectionFailed(s, e); },
                end: (s, f) => { /*if (this._doNotCloseSpinnerYet) return; */ if (f === 0) this._spinner.close(); else this._spinner.canBeClosed(); }
            }
        );
    }

    _internalTransformers = {
        'active-users':              { data: 'usersTableData',                   remove: () => { this._api.removeAllActiveUsersFromCache(); },             get: async () => { return this._api.getActiveUsers(); }},
        'apex-classes':              { data: 'apexClassesTableData',             remove: () => { this._api.removeAllApexClassesFromCache(); },             get: async () => { return this._api.getApexClasses(this.selectedNamespace); }},
        'apex-tests':                { data: 'apexTestsTableData',               remove: () => { this._api.removeAllApexTestsFromCache(); },               get: async () => { return this._api.getApexTests(this.selectedNamespace); }},
        'apex-triggers':             { data: 'apexTriggersTableData',            remove: () => { this._api.removeAllApexTriggersFromCache(); },            get: async () => { return this._api.getApexTriggers(this.selectedNamespace); }},
        'apex-uncompiled':           { data: 'apexUncompiledTableData',          remove: () => { this._api.removeAllApexUncompiledFromCache(); },          get: async () => { return this._api.getApexUncompiled(this.selectedNamespace); }},
        'app-permissions':           { data: 'appPermissionsData',               remove: () => { this._api.removeAllAppPermissionsFromCache(); },          get: async () => { return this._api.getApplicationPermissionsPerParent(this.selectedNamespace); }},
        'custom-fields':             { data: 'customFieldsTableData',            remove: () => { this._api.removeAllCustomFieldsFromCache(); },            get: async () => { return this._api.getCustomFields(this.selectedNamespace, this.selectedSObjectType, this.selectedSObject); }},
        'custom-labels':             { data: 'customLabelsTableData',            remove: () => { this._api.removeAllCustomLabelsFromCache(); },            get: async () => { return this._api.getCustomLabels(this.selectedNamespace); }},
        'flows':                     { data: 'flowsTableData',                   remove: () => { this._api.removeAllFlowsFromCache(); },                   get: async () => { return this._api.getFlows(); }},
        'lightning-aura-components': { data: 'auraComponentsTableData',          remove: () => { this._api.removeAllLightningAuraComponentsFromCache(); }, get: async () => { return this._api.getLightningAuraComponents(this.selectedNamespace); }},
        'lightning-pages':           { data: 'flexiPagesTableData',              remove: () => { this._api.removeAllLightningPagesFromCache(); },          get: async () => { return this._api.getLightningPages(this.selectedNamespace); }},
        'lightning-web-components':  { data: 'lightningWebComponentsTableData',  remove: () => { this._api.removeAllLightningWebComponentsFromCache(); },  get: async () => { return this._api.getLightningWebComponents(this.selectedNamespace); }},
        'object':                    { data: 'objectData',                       remove: () => { this._api.removeObjectFromCache(this.selectedSObject); }, get: async () => { return this.selectedSObject !== '*' ? this._api.getObject(this.selectedSObject) : undefined; }},
        'object-permissions':        { data: 'objectPermissionsData',            remove: () => { this._api.removeAllObjectPermissionsFromCache(); },       get: async () => { return this._api.getObjectPermissionsPerParent(this.selectedNamespace); }},
        'objects':                   { data: 'objectsTableData',                 remove: () => { this._api.removeAllObjectsFromCache(); },                 get: async () => { return this._api.getObjects(this.selectedNamespace, this.selectedSObjectType); }},
        'permission-sets':           { data: 'permissionSetsTableData',          remove: () => { this._api.removeAllPermSetsFromCache(); },                get: async () => { return this._api.getPermissionSets(this.selectedNamespace); }},
        'process-builders':          { data: 'processBuildersTableData',         remove: () => { this._api.removeAllProcessBuildersFromCache(); },         get: async () => { return this._api.getProcessBuilders(); }},
        'profile-password-policies': { data: 'profilePasswordPoliciesTableData', remove: () => { this._api.removeAllProfilePasswordPoliciesFromCache(); }, get: async () => { return this._api.getProfilePasswordPolicies(); }},
        'profile-restrictions':      { data: 'profileRestrictionsTableData',     remove: () => { this._api.removeAllProfileRestrictionsFromCache(); },     get: async () => { return this._api.getProfileRestrictions(this.selectedNamespace); }},
        'profiles':                  { data: 'profilesTableData',                remove: () => { this._api.removeAllProfilesFromCache(); },                get: async () => { return this._api.getProfiles(this.selectedNamespace); }},
        'public-groups':             { data: 'publicGroupsTableData',            remove: () => { this._api.removeAllPublicGroupsFromCache(); },            get: async () => { return this._api.getPublicGroups(); }},
        'queues':                    { data: 'queuesTableData',                  remove: () => { this._api.removeAllQueuesFromCache(); },                  get: async () => { return this._api.getQueues(); }},
        'roles':                     { data: 'rolesTableData',                   remove: () => { this._api.removeAllRolesFromCache(); },                   get: async () => { return this._api.getRoles(); }},
        'visual-force-components':   { data: 'visualForceComponentsTableData',   remove: () => { this._api.removeAllVisualForceComponentsFromCache(); },   get: async () => { return this._api.getVisualForceComponents(this.selectedNamespace); }},
        'visual-force-pages':        { data: 'visualForcePagesTableData',        remove: () => { this._api.removeAllVisualForcePagesFromCache(); },        get: async () => { return this._api.getVisualForcePages(this.selectedNamespace); }},
        'workflows':                 { data: 'workflowsTableData',               remove: () => { this._api.removeAllWorkflowsFromCache(); },               get: async () => { return this._api.getWorkflows(); }}
    }

    /**
     * @description Call a specific Recipe from the API given a recipe name (does not have to be the internal name, up to the UI)
     * @param {string} recipe 
     * @private
     * @async
     */ 
    async _updateData(recipe, forceRefresh=false) {
        const transformer = this._internalTransformers[recipe]; 
        console.error('transformer:', transformer, 'recipe:', recipe);
        if (transformer) {
            if (forceRefresh === true) {
                console.error('called remove');
                transformer.remove();
            }
            if (this[transformer.data] === undefined) {
                this[transformer.data] = await transformer.get();
            }    
        }
    }

    /**
     * @description Update the Daily APU Request Limit information in the UI from the API
     * @private
     */ 
    _updateLimits() {
        const dailyApiInformation = this._api.dailyApiRequestLimitInformation;
        if (dailyApiInformation.isGreenZone === true) this.themeForOrgLimit = 'slds-theme_success';
        else if (dailyApiInformation.isYellowZone === true) this.themeForOrgLimit = 'slds-theme_warning';
        else /* if (dailyApiInformation.isRedZone === true) */ this.themeForOrgLimit = 'slds-theme_error';
        this.orgLimit = `Daily API Request Limit: ${dailyApiInformation.currentUsagePercentage}%`;
    }

    /**
     * @description Check if the terms are accepted and thus we can continue to use this org
     * @private
     * @async
     */ 
    async _checkTermsAcceptance() {
        if (await this._api.checkUsageTerms()) {
            this.useOrgCheckInThisOrgNeedConfirmation = false;
            this.useOrgCheckInThisOrgConfirmed = true;
        } else {
            this.useOrgCheckInThisOrgNeedConfirmation = true;
            this.useOrgCheckInThisOrgConfirmed = false;
        }
    }

    /**
     * @description Load basic information to use the app (including the filters)
     * @param {any} logger 
     * @throws {Error} If the current user has not enough permissions to run the app (please display the error it has information about missing permissions)
     * @private
     * @async
     */ 
    async _loadBasicInformationIfAccepted(logger) {
        // Check for acceptance
        await this._checkTermsAcceptance();
        if (this.useOrgCheckInThisOrgConfirmed === false) return;

        // Check basic permission for the current user
        logger?.log('Checking if current user has enough permission...')
        await this._api.checkCurrentUserPermissions(); // if no perm this throws an error

        // Information about the org
        logger?.log('Information about the org...');
        const orgInfo = await this._api.getOrganizationInformation();
        this.orgName = orgInfo.name + ' (' + orgInfo.id + ')';
        this.orgType = orgInfo.type;
        this.isOrgProduction = orgInfo.isProduction;
        if (orgInfo.isProduction === true) this.themeForOrgType = 'slds-theme_error';
        else if (orgInfo.isSandbox === true) this.themeForOrgType = 'slds-theme_warning';
        else this.themeForOrgType = 'slds-theme_success';
        
        // Data for the filters
        await this._loadFilters();
    }

    /**
     * @description Load the list of values for the filter
     * @param {any} logger 
     * @private
     * @async
     */ 
    async _loadFilters(logger) {
        logger?.log('Hide the filter panel...');
        this._filters.hide();

        logger?.log('Clean data from cache (if any)...');
        this._api.removeAllObjectsFromCache();
        this._api.removeAllPackagesFromCache();

        logger?.log('Get packages, types and objects from the org...');
        const filtersData = await Promise.all([
            this._api.getPackages(),
            this._api.getObjectTypes(),
            this._api.getObjects(this.selectedNamespace, this.selectedSObjectType)
        ])

        logger?.log('Loading data in the drop boxes...');
        this._filters.updatePackageOptions(filtersData[0]);
        this._filters.updateSObjectTypeOptions(filtersData[1]);
        this._filters.updateSObjectApiNameOptions(filtersData[2]);

        logger?.log('Showing the filter panel...');
        this._filters.show();
    }





    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // User Experience Handlers
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description New filters were "applied" in the global filters, therefore the current screen needs to be updated
     * @public
     * @async
     */
    async handleFiltersValidated() {
        await this._updateCurrentTab();
    }

    /**
     * @description The "refresh" button in the global filters was pushed, therefore the filters needs to be reloaded
     * @public
     * @async
     */
    async handleFiltersRefreshed() {
        await this._loadFilters();
    }

    /**
     * @description When the org is a production, we show a message and a checkbox. This event is triggered when the user clicks on this checkbox.
     *              This should activate the usage of the Salesforce API from Org Check API.
     * @param {Event} event 
     * @public
     * @async
     */
    async handleClickUsageAcceptance(event) {
        if (event.target['checked'] === true) {
            this._api.acceptUsageTerms();
            await this._loadBasicInformationIfAccepted();
        }
    }

    /**
     * @description Event called when user selects a main tab
     * @param {Event} event
     * @public
     * @async
     */
    async handleTabActivation(event) {
        const firstTabset = event.target['querySelector']('lightning-tabset');
        if (firstTabset) {
            await this._updateCurrentTab(firstTabset.activeTabValue);
        }
    }

    /**
     * @description Event called when user selects a sub tab (within a main tab)
     * @param {Event} event 
     * @public
     * @async
     */
    async handleSubTabActivation(event) {
        // the value of the selected tab is used to guess what needs to be gathered
        await this._updateCurrentTab(event.target['value']);
    }

    /**
     * @description Event called when the content of a sub tab is fully loaded
     * @public
     * @async
     */
    async handleSubTabContentLoaded() {
        await this._updateCurrentTab();
    }

    /**
     * @description Method called when the user ask to remove an item or all the cache in the UI
     * @param {Event} event should contain a detail property with two properties: "allItems" (boolean) 
     *                      and optinally "itemName" (string), if allItems=true, all items should be removed, 
     *                      if not, the "itemName" gives us the name if the cache entry to be removed.
     * @public
     * @async
     */
    async handleRemoveCache(event) {
        if (event['detail'].allItems === true) {
            this._api.removeAllFromCache();
            window.location.reload();
        } else {
            this._api.removeFromCache(event['detail'].itemName);
            await this._updateCurrentTab();
        }
    }

    /**
     * @description Event called when the user clicks on the "View Score" button on a data table
     * @param {Event} event 
     * @async
     * @public
     */ 
    async handleViewScore(event) {
        const whatid = event['detail'].whatId;
        const whatname = event['detail'].whatName;
        const score = event['detail'].score;
        const reasonIds = event['detail'].reasonIds;
        let htmlContent = `The component <code><b>${whatname}</b></code> (<code>${whatid}</code>) has a score of <b><code>${score}</code></b> because of the following reasons:<br /><ul>`;
        reasonIds.forEach((/** @type {number} */ id) => {
            const reason = this._api.getValidationRule(id);
            htmlContent += `<li><b>${reason.description}</b>: <i>${reason.errorMessage}</i></li>`;
        });
        htmlContent += '</ul>';
        this._modal.open(`Understand the Score of "${whatname}" (${whatid})`, htmlContent);
    }

    /**
     * @description Event called when the user clicks on the "Run All Tests" button in the Apex tab
     * @async
     * @public
     */ 
    async handleClickRunAllTests() {
        const LOG_SECTION = 'RUN ALL TESTS';
        this._spinner.open();
        this._spinner.sectionStarts(LOG_SECTION, 'Launching...');
        try {
            const asyncApexJobId = await this._api.runAllTestsAsync();
            this._spinner.sectionEnded(LOG_SECTION, 'Done!');
            this._spinner.close();

            let htmlContent = 'We asked Salesforce to run all the test classes in your org.<br /><br />';
            htmlContent += 'For more information about the success of these tests, you can:<br /><ul>';
            htmlContent += '<li>Go <a href="/lightning/setup/ApexTestQueue/home" target="_blank" rel="external noopener noreferrer">here</a> to see the results of these tests.</li>';
            htmlContent += `<li>Check with Tooling API the status of the following record: /tooling/sobjects/AsyncApexJob/${asyncApexJobId}</li><ul>`;
            this._modal.open('Asynchronous Run All Test Asked', htmlContent);

        } catch (error) {
            this._spinner.canBeClosed();
            this._spinner.sectionFailed(LOG_SECTION, error);
        }
    }

    /**
     * @description Event called when the user clicks on the "Refresh" button
     * @param {Event} event 
     * @async
     * @public
     */ 
    async handleClickRefresh(event) {
        //const recipes = event.target['getAttribute']('data-recipes')?.split(',');
        //await Promise.all(recipes.map((/** @type {string} */ recipe) => {
        //    this._callApiRemoveFromCache(recipe);
        //    return this._callApiGetData(recipe);
        //}));
    }

    /**
     * @description Event called when the user clicks on the "Recompile" button
     * @async
     * @public
     */ 
    async handleClickRecompile() {
        const LOG_SECTION = 'RECOMPILE';
        this._spinner.open();
        const classes = new Map();
        this._spinner.sectionStarts(LOG_SECTION, 'Processing...');
        this.apexUncompiledTableData.forEach(c => {
            this._spinner.sectionStarts(`${LOG_SECTION}-${c.id}`, `Asking to recompile class: ${c.name}`);
            classes.set(c.id, c);
        });
        const responses = await this._api.compileClasses(this.apexUncompiledTableData);
        this._spinner.sectionContinues(LOG_SECTION, 'Done');
        responses.forEach(r => r.compositeResponse?.filter(cr => cr.referenceId?.startsWith('01p')).forEach(cr => {
            const c = classes.get(cr.referenceId);
            if (cr.body.success === true) {
                this._spinner.sectionEnded(`${LOG_SECTION}-${c.id}`, `Recompilation requested for class: ${c.name}`);
            } else {
                let reasons = [];
                if (cr.body && Array.isArray(cr.body)) {
                    reasons = cr.body;
                } else if (cr.errors && Array.isArray(cr.errors)) {
                    reasons = cr.errors;
                }
                this._spinner.sectionFailed(`${LOG_SECTION}-${c.id}`, `Errors for class ${c.name}: ${reasons.map(e => JSON.stringify(e)).join(', ')}`);
            }
        }));
        this._spinner.sectionEnded(LOG_SECTION, 'Please hit the Refresh button (in Org Check) to get the latest data from your Org.  By the way, in the future, if you need to recompile ALL the classes, go to "Setup > Custom Code > Apex Classes" and click on the link "Compile all classes".');
        this._spinner.canBeClosed();
    }



    _currentTab;


    /**
     * @description Unique method to propagate a change to be done in the current tab.
     *              If the given input value is specified, this must be different from the current tab property, otherwise this method does nothing.
     *              If the given input value is undefined, the method will use the current tab.
     *              This can be because end user selected another tab
     *              This can be also because a filter was validated and needs to be propagated into the current tab
     *              This can be also if the current tab is finally loaded
     *              Usage: as this method is async, you should await when calling it!
     * @param {string} [nextCurrentTab] Next current tab that will be activated/selected.
     */
    async _updateCurrentTab(nextCurrentTab) {

        console.error(`_updateCurrentTab, currentTab=${this._currentTab}, nextCurrentTab=${nextCurrentTab}`);

        this._updateLimits();
        
        // If the next current tab is the same as the current one, we stop here
        if (nextCurrentTab && nextCurrentTab === this._currentTab) return;

        // If the next current tab is specified, we use it to reset the current tab property
        if (nextCurrentTab) this._currentTab = nextCurrentTab;

        await this._updateData(this._currentTab);

    /*
        // If for some reason the api is not yet loaded, we stop there
        if (!this._api) return;


        // Call the API depending on the current tab
        // If not supported we stop there
        // Finally send the data to the content component.
        // All is surrounded by a try catch that will show error modal if any.
        const section = `TAB ${this._currentTab}`;
        try {
            this._spinner.open();

            // Continue calling the api...
            this._spinner.sectionStarts(section, 'Call the corresponding Org Check API');
            this._updateDailyAPIUsage();
///
            switch (this._currentTab) {
                case 'object-information': {
                    if (sobject !== '*') {
                        this.objectData = await this._api.getObject(sobject); 
                    } else {
                        this.objectData = undefined; 
                    }
                    break;
                }
                case 'object-permissions':
                case 'app-permissions': {
                    const dataMatrix = 
                        (this._currentTab === 'object-permissions') ? 
                        (await this._api.getObjectPermissionsPerParent(namespace)) :
                        (await this._api.getApplicationPermissionsPerParent(namespace)); // implicitly: this._currentTab === 'app-permissions')
                    const getProp = (** @type {Map} * refs, ** @type {string} * id, ** @type {string} * property) => { 
                        try {
                            return refs.get(id)[property] ?? id;
                        } catch (e) {
                            return id;
                        }
                    };
                    const getRowHeaderProp = (** @type {string} * id, ** @type {string} * property) => {
                        return getProp(dataMatrix.rowHeaderReferences, id, property);
                    };
                    const getColumnHeaderProp = (** @type {string} * id, ** @type {string} * property) => {
                        return getProp(dataMatrix.columnHeaderReferences, id, property);
                    };
                    ** @type { Array<{label: string, type: string, data: { ref: string, value: string|Function, url?: string|Function }, sorted?: string, orientation?: string}>} *
                    const columns = [
                        { label: 'Parent',  type: 'id',       data: { ref: 'headerId', value: (** @type {string} * i) => getRowHeaderProp(i, 'name'), url: (** @type {string} * i) => getRowHeaderProp(i, 'url') }, sorted: 'asc' },
                        { label: 'Package', type: 'text',     data: { ref: 'headerId', value: (** @type {string} * i) => getRowHeaderProp(i, 'package') }},
                        { label: 'Type',    type: 'text',     data: { ref: 'headerId', value: (** @type {string} * i) => getRowHeaderProp(i, 'type') }},
                        { label: 'Custom',  type: 'boolean',  data: { ref: 'headerId', value: (** @type {string} * i) => getRowHeaderProp(i, 'isCustom') }}
                    ];
                    if (this._currentTab === 'object-permissions') {
                        dataMatrix.columnHeaderIds
                            .sort()
                            .forEach(c => columns.push({ label: c, type: 'text', data: { ref: 'data', value: c }, orientation: 'vertical' }));
                        this.objectPermissionsTableColumns = columns;
                        this.objectPermissionsTableData = dataMatrix.rows;
                    } else { // implicitly: this._currentTab === 'app-permissions')
                        dataMatrix.columnHeaderIds
                            .map(c => { return { label: getColumnHeaderProp(c, 'label'), id: c }; })
                            .sort((a, b) => { return a.label < b.label ? -1: 1; })
                            .forEach(c => columns.push({ label: c.label, type: 'text', data: { ref: 'data', value: c.id }, orientation: 'vertical' }));
                        this.appPermissionsTableColumns = columns;
                        this.appPermissionsTableData = dataMatrix.rows;
                    }
                    break;
                }

                default:
            }
            this._updateDailyAPIUsage();
            this._spinner.sectionEnded(section, 'Done');
            this._spinner.close();

        } catch (error) {
            this._spinner.sectionFailed(section, error);
            console.error(error);
        }

        */
    }





    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Column header definition for all data tables in the app
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description Columns descriptions for the data table about field sets
     */
    fieldSetsColumns = [
        { label: 'Label',       type: 'id',       data: { value: 'label', url: 'url' }},
        { label: 'Description', type: 'text',     data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    /**
     * @description Columns descriptions for the data table about page layouts
     */
    layoutsColumns = [
        { label: 'Label', type: 'id',       data: { value: 'name', url: 'url' }},
        { label: 'Type',  type: 'text',     data: { value: 'type' }},
    ];

    /**
     * @description Columns descriptions for the data table about object limits
     */
    limitsColumns = [
        { label: 'Score',     type: 'score',      data: { id: 'id', name: 'label' }, sorted: 'desc' },
        { label: 'Label',     type: 'text',       data: { value: 'label' }},
        { label: 'Type',      type: 'text',       data: { value: 'type' }},
        { label: 'Max',       type: 'numeric',    data: { value: 'max' }},
        { label: 'Used',      type: 'numeric',    data: { value: 'used' }},
        { label: 'Used (%)',  type: 'percentage', data: { value: 'usedPercentage' }},
        { label: 'Remaining', type: 'numeric',    data: { value: 'remaining' }}
    ];

    /**
     * @description Columns descriptions for the data table about validation rules
     */
    validationRulesColumns = [
        { label: 'Score',            type: 'score',     data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',             type: 'id',        data: { value: 'name', url: 'url' }},
        { label: 'Is Active',        type: 'boolean',   data: { value: 'isActive' }},
        { label: 'Display On Field', type: 'text',      data: { value: 'errorDisplayField' }},
        { label: 'Error Message',    type: 'text',      data: { value: 'errorMessage' }},
        { label: 'Description',      type: 'text',      data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    /**
     * @description Columns descriptions for the data table about web links
     */
    webLinksColumns = [
        { label: 'Name', type: 'id', data: { value: 'name' }},
    ];

    /**
     * @description Columns descriptions for the data table about record types
     */
    recordTypesColumns = [
        { label: 'Score',          type: 'score',    data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',           type: 'id',       data: { value: 'name', url: 'url' }},
        { label: 'Developer Name', type: 'text',     data: { value: 'developerName' }},
        { label: 'Is Active',      type: 'boolean',  data: { value: 'isActive' }},
        { label: 'Is Available',   type: 'boolean',  data: { value: 'isAvailable' }},
        { label: 'Is Default',     type: 'boolean',  data: { value: 'isDefaultRecordTypeMapping' }},
        { label: 'Is Master',      type: 'boolean',  data: { value: 'isMaster' }},
        { label: 'Description',    type: 'text',     data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    /**
     * @description Columns descriptions for the data table about sobject relationships
     */
    relationshipsColumns = [
        { label: 'Name',                 type: 'text',    data: { value: 'name' }},
        { label: 'Field Name',           type: 'text',    data: { value: 'fieldName' }},
        { label: 'Child Object',         type: 'text',    data: { value: 'childObject' }},
        { label: 'Is Cascade Delete',    type: 'boolean', data: { value: 'isCascadeDelete' }},
        { label: 'Is Restricive Delete', type: 'boolean', data: { value: 'isRestrictedDelete' }}
    ];
    
    /**
     * @description Columns descriptions for the data table about custom fields
     */
    customFieldsTableColumns = [
        { label: 'Score',               type: 'score',            filter: 'sco', data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Field',               type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'Label',               type: 'text',             data: { value: 'label' }},
        { label: 'In this object',      type: 'id',               filter: 'obj', data: { ref: 'objectRef', value: 'name', url: 'url' }},
        { label: 'Object Type',         type: 'text',             filter: 'obj', data: { ref: 'objectRef.typeRef', value: 'label' }},
        { label: 'Package',             type: 'text',             filter: 'cus', data: { value: 'package' }},
        { label: 'Type',                type: 'text',             data: { value: 'type' }},
        { label: 'Length',              type: 'text',             data: { value: 'length' }},
        { label: 'Unique?',             type: 'boolean',          data: { value: 'isUnique' }},
        { label: 'Encrypted?',          type: 'boolean',          data: { value: 'isEncrypted' }},
        { label: 'External?',           type: 'boolean',          data: { value: 'isExternalId' }},
        { label: 'Indexed?',            type: 'boolean',          data: { value: 'isIndexed' }},
        { label: 'Tooltip',             type: 'text',             data: { value: 'tooltip' }, modifier: { maximumLength: 45, valueIfEmpty: 'No tooltip.' }},
        { label: 'Formula',             type: 'text',             data: { value: 'formula' }, modifier: { maximumLength: 100, preformatted: true }},
        { label: 'Default Value',       type: 'text',             data: { value: 'defaultValue' }},
        { label: 'Using',               type: 'numeric',          filter: 'dep', data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in',       type: 'numeric',          filter: 'dep', data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
        { label: 'Ref. in Layout?',     type: 'numeric',          filter: 'dep', data: { ref: 'dependencies.referencedByTypes', value: OrgCheckSalesforceMetadataTypes.PAGE_LAYOUT }},
        { label: 'Ref. in Apex Class?', type: 'numeric',          filter: 'dep', data: { ref: 'dependencies.referencedByTypes', value: OrgCheckSalesforceMetadataTypes.APEX_CLASS }},
        { label: 'Ref. in Flow?',       type: 'numeric',          filter: 'dep', data: { ref: 'dependencies.referencedByTypes', value: OrgCheckSalesforceMetadataTypes.FLOW_VERSION }},
        { label: 'Dependencies',        type: 'dependencyViewer', filter: 'dep', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',        type: 'dateTime',         filter: 'noc', data: { value: 'createdDate' }},
        { label: 'Modified date',       type: 'dateTime',         filter: 'noc', data: { value: 'lastModifiedDate' }},
        { label: 'Description',         type: 'text',             data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    /**
     * @description Columns descriptions for the data table about custom fields within an SObject
     */
    customFieldsInObjectTableColumns = this.customFieldsTableColumns.filter(c =>
        c.filter === undefined || c.filter !== 'obj'
    );

    /**
     * @description Columns descriptions for the data table about standard fields within an SObject
     */
    standardFieldsInObjectTableColumns = this.customFieldsTableColumns.filter(c => 
        c.filter === undefined
    );

    /**
     * @description Columns descriptions for the data table about custom labels
     */
    customLabelsTableColumns = [
        { label: 'Score',               type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',                type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'Package',             type: 'text',             data: { value: 'package' }},
        { label: 'Label',               type: 'text',             data: { value: 'label' }},
        { label: 'Category',            type: 'text',             data: { value: 'category' }},
        { label: 'Language',            type: 'text',             data: { value: 'language' }},
        { label: 'Protected?',          type: 'boolean',          data: { value: 'isProtected' }},
        { label: 'Using',               type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in',       type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
        { label: 'Ref. in Layout?',     type: 'numeric',          data: { ref: 'dependencies.referencedByTypes', value: OrgCheckSalesforceMetadataTypes.PAGE_LAYOUT }},
        { label: 'Ref. in Apex Class?', type: 'numeric',          data: { ref: 'dependencies.referencedByTypes', value: OrgCheckSalesforceMetadataTypes.APEX_CLASS }},
        { label: 'Ref. in Flow?',       type: 'numeric',          data: { ref: 'dependencies.referencedByTypes', value: OrgCheckSalesforceMetadataTypes.FLOW_VERSION }},
        { label: 'Dependencies',        type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',        type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date',       type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Value',               type: 'text',             data: { value: 'value'}, modifier: { maximumLength: 45 }}
    ];

    /**
     * @description Columns descriptions for the data table about lightning aura components
     */
    auraComponentsTableColumns = [
        { label: 'Score',         type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',          type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',   type: 'numeric',          data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Package',       type: 'text',             data: { value: 'package' }},
        { label: 'Using',         type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in', type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
        { label: 'Dependencies',  type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',  type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date', type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Description',   type: 'text',             data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    /**
     * @description Columns descriptions for the data table about lightning pages
     */
    flexiPagesTableColumns = [
        { label: 'Score',         type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',          type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'Type',          type: 'text',             data: { value: 'type' }},
        { label: 'Package',       type: 'text',             data: { value: 'package' }},
        { label: 'Object',        type: 'id',               filter: 'obj', data: { ref: 'objectRef', value: 'name', url: 'url' }, modifier: { valueIfEmpty: 'Not related to an object.'}},
        { label: 'Using',         type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in', type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
        { label: 'Dependencies',  type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',  type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date', type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Description',   type: 'text',             data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    /**
     * @description Columns descriptions for the data table about lightning pages within an SObject
     */
    flexiPagesInObjectTableColumns = this.flexiPagesTableColumns.filter(c =>
        c.filter === undefined || c.filter !== 'obj'
    );

    /**
     * @description Columns descriptions for the data table about lightning web components
     */
    lightningWebComponentsTableColumns = [
        { label: 'Score',         type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',          type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',   type: 'numeric',          data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Package',       type: 'text',             data: { value: 'package' }},
        { label: 'Using',         type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in', type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
        { label: 'Dependencies',  type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',  type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date', type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Description',   type: 'text',             data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ]

    /**
     * @description Columns descriptions for the data table about permission sets
     */
    permissionSetsTableColumns = [
        { label: 'Score',            type: 'score',     data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',             type: 'id',        data: { value: 'name', url: 'url' }},
        { label: 'Is Group?',        type: 'boolean',   data: { value: 'isGroup' }},
        { label: 'Custom',           type: 'boolean',   data: { value: 'isCustom' }},
        { label: '#FLSs',            type: 'numeric',   data: { value: 'nbFieldPermissions' }, modifier: { max: 50, valueAfterMax: '50+' }},
        { label: '#Object CRUDs',    type: 'numeric',   data: { value: 'nbObjectPermissions' }, modifier: { max: 50, valueAfterMax: '50+' }},            
        { label: 'Api Enabled',      type: 'boolean',   data: { ref: 'importantPermissions', value: 'apiEnabled' }},
        { label: 'View Setup',       type: 'boolean',   data: { ref: 'importantPermissions', value: 'viewSetup' }},
        { label: 'Modify All Data',  type: 'boolean',   data: { ref: 'importantPermissions', value: 'modifyAllData' }},
        { label: 'View All Data',    type: 'boolean',   data: { ref: 'importantPermissions', value: 'viewAllData' }},
        { label: 'License',          type: 'text',      data: { value: 'license' }},
        { label: 'Package',          type: 'text',      data: { value: 'package' }},
        { label: '#Active users',    type: 'numeric',   data: { value: 'memberCounts' }, modifier: { min: 1, valueBeforeMin: 'No active user!' }},
        { label: 'Users\' profiles', type: 'ids',       data: { ref: 'assigneeProfileRefs', value: 'name', url: 'url' }},
        { label: 'Created date',     type: 'dateTime',  data: { value: 'createdDate' }},
        { label: 'Modified date',    type: 'dateTime',  data: { value: 'lastModifiedDate' }},
        { label: 'Description',      type: 'text',      data: { value: 'description'}, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    /**
     * @description Columns descriptions for the data table about profiles
     */
    profilesTableColumns = [
        { label: 'Score',           type: 'score',    data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',            type: 'id',       data: { value: 'name', url: 'url' }},
        { label: 'Custom',          type: 'boolean',  data: { value: 'isCustom' }},
        { label: '#FLSs',           type: 'numeric',  data: { value: 'nbFieldPermissions' }, modifier: { max: 50, valueAfterMax: '50+' }},
        { label: '#Object CRUDs',   type: 'numeric',  data: { value: 'nbObjectPermissions' }, modifier: { max: 50, valueAfterMax: '50+' }},            
        { label: 'Api Enabled',     type: 'boolean',  data: { ref: 'importantPermissions', value: 'apiEnabled' }},
        { label: 'View Setup',      type: 'boolean',  data: { ref: 'importantPermissions', value: 'viewSetup' }},
        { label: 'Modify All Data', type: 'boolean',  data: { ref: 'importantPermissions', value: 'modifyAllData' }},
        { label: 'View All Data',   type: 'boolean',  data: { ref: 'importantPermissions', value: 'viewAllData' }},
        { label: 'License',         type: 'text',     data: { value: 'license' }},
        { label: 'Package',         type: 'text',     data: { value: 'package' }},
        { label: '#Active users',   type: 'numeric',  data: { value: 'memberCounts' }, modifier: { min: 1, valueBeforeMin: 'No active user!', max: 50, valueAfterMax: '50+' }},
        { label: 'Created date',    type: 'dateTime', data: { value: 'createdDate' }},
        { label: 'Modified date',   type: 'dateTime', data: { value: 'lastModifiedDate' }},
        { label: 'Description',     type: 'text',     data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    /**
     * @description Columns descriptions for the data table about profile restrictions
     */
    profileRestrictionsTableColumns = [
        { label: 'Score',           type: 'score',    data: { ref: 'profileRef', id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',            type: 'id',       data: { ref: 'profileRef', value: 'name', url: 'url' }},
        { label: 'Custom',          type: 'boolean',  data: { ref: 'profileRef', value: 'isCustom' }},
        { label: 'Package',         type: 'text',     data: { ref: 'profileRef', value: 'package' }},
        { label: 'Ip Ranges',       type: 'objects',  data: { ref: 'ipRanges' }, modifier: { template: '{description}: from {startAddress} to {endAddress} --> {difference:numeric} address(es)' }},
        { label: 'Login Hours',     type: 'objects',  data: { ref: 'loginHours' }, modifier: { template: '{day} from {fromTime} to {toTime} --> {difference:numeric} minute(s)' }},
        { label: 'Description',     type: 'text',     data: { ref: 'profileRef', value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    /**
     * @description Columns descriptions for the data table about profiles password policies
     */
    profilePasswordPoliciesTableColumns = [
        { label: 'Score',                                     type: 'score',   data: { id: 'profileName', name: 'profileName' }, sorted: 'desc' },
        { label: 'Name',                                      type: 'text',    data: { value: 'profileName' }},
        { label: 'User password expires in',                  type: 'numeric', data: { value: 'passwordExpiration' }},
        { label: 'Enforce password history',                  type: 'numeric', data: { value: 'passwordHistory' }},
        { label: 'Minimum password length',                   type: 'numeric', data: { value: 'minimumPasswordLength' }},
        { label: 'Level of complexity (/5)',                  type: 'numeric', data: { value: 'passwordComplexity' }},
        { label: 'Question can contain password',             type: 'boolean', data: { value: 'passwordQuestion' }},
        { label: 'Maximum Login Attempts',                    type: 'numeric', data: { value: 'maxLoginAttempts' }},
        { label: 'Lockout period',                            type: 'numeric', data: { value: 'lockoutInterval' }},
        { label: 'Require minimum one day password lifetime', type: 'boolean', data: { value: 'minimumPasswordLifetime' }},
        { label: 'Security Question Hidden',                  type: 'boolean', data: { value: 'obscure' }},
    ];
    
    /**
     * @description Columns descriptions for the data table about public groups
     */
    publicGroupsTableColumns = [
        { label: 'Score',                  type: 'score',     data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',                   type: 'id',        data: { value: 'name', url: 'url' }},
        { label: 'Developer Name',         type: 'text',      data: { value: 'developerName' }},
        { label: 'With bosses?',           type: 'boolean',   data: { value: 'includeBosses' }},
        { label: '#Explicit members',      type: 'numeric',   data: { value: 'nbDirectMembers' }},
        { label: 'Explicit groups',        type: 'ids',       data: { ref: 'directGroupRefs', value: (g) => `${g.name} (${g.type}${g.includeBosses?' with bosses ':''}${g.includeSubordinates?' with subordinates':''})`, url: 'url' }},
        { label: 'Explicit users',         type: 'ids',       data: { ref: 'directUserRefs', value: 'name', url: 'url' }}
    ];

    /**
     * @description Columns descriptions for the data table about queues
     */
    queuesTableColumns = [
        { label: 'Score',                  type: 'score',     data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',                   type: 'id',        data: { value: 'name', url: 'url' }},
        { label: 'Developer Name',         type: 'text',      data: { value: 'developerName' }},
        { label: 'With bosses?',           type: 'boolean',   data: { value: 'includeBosses' }},
        { label: '#Explicit members',      type: 'numeric',   data: { value: 'nbDirectMembers' }},
        { label: 'Explicit groups',        type: 'ids',       data: { ref: 'directGroupRefs', value: (g) => `${g.name} (${g.type}${g.includeBosses?' with bosses ':''}${g.includeSubordinates?' with subordinates':''})`, url: 'url' }},
        { label: 'Explicit users',         type: 'ids',       data: { ref: 'directUserRefs', value: 'name', url: 'url' }}
    ];

    /**
     * @description Columns descriptions for the data table about active internal users
     */
    usersTableColumns = [
        { label: 'Score',                        type: 'score',     data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'User Name',                    type: 'id',        data: { value: 'name', url: 'url' }},
        { label: 'Under LEX?',                   type: 'boolean',   data: { value: 'onLightningExperience' }},
        { label: 'Last login',                   type: 'dateTime',  data: { value: 'lastLogin' }, modifier: { valueIfEmpty: 'Never logged!' }},
        { label: 'Failed logins',                type: 'numeric',   data: { value: 'numberFailedLogins' }},
        { label: 'Password change',              type: 'dateTime',  data: { value: 'lastPasswordChange' }},
        { label: 'Api Enabled',                  type: 'boolean',   data: { ref: 'aggregateImportantPermissions.apiEnabled', value: 'length' }},
        { label: 'Api Enabled granted from',     type: 'ids',       data: { ref: 'aggregateImportantPermissions.apiEnabled', value: 'name', url: 'url' }},
        { label: 'View Setup',                   type: 'boolean',   data: { ref: 'aggregateImportantPermissions.viewSetup', value: 'length' }},
        { label: 'View Setup granted from',      type: 'ids',       data: { ref: 'aggregateImportantPermissions.viewSetup', value: 'name', url: 'url' }},
        { label: 'Modify All Data',              type: 'boolean',   data: { ref: 'aggregateImportantPermissions.modifyAllData', value: 'length', url: 'url' }},
        { label: 'Modify All Data granted from', type: 'ids',       data: { ref: 'aggregateImportantPermissions.modifyAllData', value: 'name', url: 'url' }},
        { label: 'View All Data',                type: 'boolean',   data: { ref: 'aggregateImportantPermissions.viewAllData', value: 'length', url: 'url' }},
        { label: 'View All Data granted from',   type: 'ids',       data: { ref: 'aggregateImportantPermissions.viewAllData', value: 'name', url: 'url' }},
        { label: 'Profile',                      type: 'id',        data: { ref: 'profileRef', value: 'name', url: 'url' }},
        { label: 'Permission Sets',              type: 'ids',       data: { ref: 'permissionSetRefs', value: 'name', url: 'url' }}
    ];

    /**
     * @description Columns descriptions for the data table about visualforce components
     */
    visualForceComponentsTableColumns = [
        { label: 'Score',         type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',          type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',   type: 'numeric',          data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Package',       type: 'text',             data: { value: 'package' }},
        { label: 'Using',         type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in', type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
        { label: 'Dependencies',  type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',  type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date', type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Description',   type: 'text',             data: { value: 'description'}, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    /**
     * @description Columns descriptions for the data table about visualforce pages
     */
    visualForcePagesTableColumns = [
        { label: 'Score',         type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',          type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',   type: 'numeric',          data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Mobile',        type: 'boolean',          data: { value: 'isMobileReady' }},
        { label: 'Package',       type: 'text',             data: { value: 'package' }},
        { label: 'Using',         type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in', type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
        { label: 'Dependencies',  type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',  type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date', type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Description',   type: 'text',             data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    /**
     * @description Columns descriptions for the data table about apex classes (compiled and not tests)
     */
    apexClassesTableColumns = [
        { label: 'Score',           type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',            type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',     type: 'numeric',          data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Package',         type: 'text',             data: { value: 'package' }},
        { label: 'Class',           type: 'boolean',          data: { value: 'isClass' }},
        { label: 'Abst.',           type: 'boolean',          data: { value: 'isAbstract' }},
        { label: 'Intf.',           type: 'boolean',          data: { value: 'isInterface' }},
        { label: 'Enum',            type: 'boolean',          data: { value: 'isEnum' }},
        { label: 'Schdl.',          type: 'boolean',          data: { value: 'isSchedulable' }},
        { label: 'Access',          type: 'text',             data: { value: 'specifiedAccess' }},
        { label: 'Implements',      type: 'texts',            data: { ref: 'interfaces' }},
        { label: 'Extends',         type: 'text',             data: { value: 'extends' }},
        { label: 'Size',            type: 'numeric',          data: { value: 'length' }},
        { label: 'Methods',         type: 'numeric',          data: { value: 'methodsCount' }},
        { label: 'Inner Classes',   type: 'numeric',          data: { value: 'innerClassesCount' }},
        { label: 'Annotations',     type: 'texts',            data: { ref: 'annotations', value: 'name' }},
        { label: 'Sharing',         type: 'text',             data: { value: 'specifiedSharing' }, modifier: { valueIfEmpty: 'Not specified.' }},
        { label: 'Scheduled',       type: 'boolean',          data: { value: 'isScheduled' }},
        { label: 'Coverage (>75%)', type: 'percentage',       data: { value: 'coverage' }, modifier: { valueIfEmpty: 'No coverage!' }},
        { label: 'Related Tests',   type: 'ids',              data: { ref: 'relatedTestClassRefs', value: 'name', url: 'url' }},
        { label: 'Using',           type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in',   type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
        { label: 'Dependencies',    type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',    type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date',   type: 'dateTime',         data: { value: 'lastModifiedDate' }}
    ];

    /**
     * @description Columns descriptions for the data table about uncompiled apex classes
     */    
    apexUncompiledTableColumns = [
        { label: 'Score',           type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',            type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',     type: 'numeric',          data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Package',         type: 'text',             data: { value: 'package' }},
        { label: 'Size',            type: 'numeric',          data: { value: 'length' }},
        { label: 'Coverage (>75%)', type: 'percentage',       data: { value: 'coverage' }, modifier: { valueIfEmpty: 'No coverage!' }},
        { label: 'Related Tests',   type: 'ids',              data: { ref: 'relatedTestClassRefs', value: 'name', url: 'url' }},
        { label: 'Using',           type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in',   type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
        { label: 'Dependencies',    type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',    type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date',   type: 'dateTime',         data: { value: 'lastModifiedDate' }}
    ];

    /**
     * @description Columns descriptions for the data table about apex triggers
     */
    apexTriggersTableColumns = [
        { label: 'Score',         type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',          type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',   type: 'numeric',          data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Package',       type: 'text',             data: { value: 'package' }},
        { label: 'Size',          type: 'numeric',          data: { value: 'length' }},
        { label: 'Object',        type: 'id',               filter: 'nob', data: { ref: 'objectRef', value: 'name', url: 'url' }},
        { label: 'Active?',       type: 'boolean',          data: { value: 'isActive' }},
        { label: 'Has SOQL?',     type: 'boolean',          data: { value: 'hasSOQL' }},
        { label: 'Has DML?',      type: 'boolean',          data: { value: 'hasDML' }},
        { label: '*Insert',       type: 'boolean',          data: { value: 'beforeInsert' }},
        { label: 'Insert*',       type: 'boolean',          data: { value: 'afterInsert' }},
        { label: '*Update',       type: 'boolean',          data: { value: 'beforeUpdate' }},
        { label: 'Update*',       type: 'boolean',          data: { value: 'afterUpdate' }},
        { label: '*Delete',       type: 'boolean',          data: { value: 'beforeDelete' }},
        { label: 'Delete*',       type: 'boolean',          data: { value: 'afterDelete' }},
        { label: 'Undelete',      type: 'boolean',          data: { value: 'afterUndelete' }},
        { label: 'Using',         type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Dependencies',  type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',  type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date', type: 'dateTime',         data: { value: 'lastModifiedDate' }}
    ];

    /**
     * @description Columns descriptions for the data table about apex triggers within SObject
     */
    apexTriggersInObjectTableColumns = this.apexTriggersTableColumns.filter(c =>
        c.filter !== 'nob'
    );

    /**
     * @description Columns descriptions for the data table about apex classes that are tests
     */
    apexTestsTableColumns = [
        { label: 'Score',           type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',            type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',     type: 'numeric',          data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Package',         type: 'text',             data: { value: 'package' }},
        { label: 'Size',            type: 'numeric',          data: { value: 'length' }},
        { label: 'Nb Asserts',      type: 'numeric',          data: { value: 'nbSystemAsserts' }, modifier: { valueIfEmpty: 'No direct usage of Assert.Xxx() or System.assertXxx().' }},
        { label: 'Methods',         type: 'numeric',          data: { value: 'methodsCount' }},
        { label: 'Latest Run Date', type: 'dateTime',         data: { value: 'lastTestRunDate' }},
        { label: 'Runtime',         type: 'numeric',          data: { value: 'testMethodsRunTime' }},
        { label: 'Passed methods',  type: 'objects',          data: { ref: 'testPassedMethods' }, modifier: { template: '{methodName} ({runtime} ms)' }},
        { label: 'Failed methods',  type: 'objects',          data: { ref: 'testFailedMethods' }, modifier: { template: '{methodName} ({stacktrace})' }},
        { label: 'Inner Classes',   type: 'numeric',          data: { value: 'innerClassesCount' }},
        { label: 'Sharing',         type: 'text',             data: { value: 'specifiedSharing' }, modifier: { valueIfEmpty: 'Not specified.' }},
        { label: 'Covering',        type: 'ids',              data: { ref: 'relatedClassRefs', value: 'name', url: 'url' }},
        { label: 'Using',           type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Dependencies',    type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',    type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date',   type: 'dateTime',         data: { value: 'lastModifiedDate' }}
    ];
    
    /**
     * @description Columns descriptions for the data table about SObject Org Wide Default
     */
    owdTableColumns = [
        { label: 'Label',     type: 'text',  data: { value: 'label' }, sorted: 'asc'},
        { label: 'Name',      type: 'text',  data: { value: 'name' }},
        { label: 'Package',   type: 'text',  data: { value: 'package' }},
        { label: 'Internal',  type: 'text',  data: { value: 'internalSharingModel' }},
        { label: 'External',  type: 'text',  data: { value: 'externalSharingModel' }}
    ];

    /**
     * @description Columns descriptions for the data table about flows
     */
    flowsTableColumns = [
        { label: 'Score',              type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',               type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',        type: 'numeric',          data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Type',               type: 'text',             data: { value: 'type' }},
        { label: 'Created date',       type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date',      type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Description',        type: 'text',             data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
        { label: 'Number of versions', type: 'numeric',          data: { value: 'versionsCount' }},
        { label: 'Current Version',    type: 'id',               data: { ref: 'currentVersionRef', value: 'name', url: 'url' }},
        { label: 'Is it Active?',      type: 'boolean',          data: { value: 'isVersionActive' }},
        { label: 'Is it the Latest?',  type: 'boolean',          data: { value: 'isLatestCurrentVersion' }},
        { label: 'Its Running Mode',   type: 'text',             data: { ref: 'currentVersionRef', value: 'runningMode' }, modifier: { valueIfEmpty: 'No mode specified.' }},
        { label: 'Its API Version',    type: 'numeric',          data: { ref: 'currentVersionRef', value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: '# Nodes',            type: 'numeric',          data: { ref: 'currentVersionRef', value: 'totalNodeCount' }},
        { label: '# DML Create Nodes', type: 'numeric',          data: { ref: 'currentVersionRef', value: 'dmlCreateNodeCount' }},
        { label: '# DML Delete Nodes', type: 'numeric',          data: { ref: 'currentVersionRef', value: 'dmlDeleteNodeCount' }},
        { label: '# DML Update Nodes', type: 'numeric',          data: { ref: 'currentVersionRef', value: 'dmlUpdateNodeCount' }},
        { label: '# Screen Nodes',     type: 'numeric',          data: { ref: 'currentVersionRef', value: 'screenNodeCount' }},
        { label: 'Its Created date',   type: 'dateTime',         data: { ref: 'currentVersionRef', value: 'createdDate' }},
        { label: 'Its Modified date',  type: 'dateTime',         data: { ref: 'currentVersionRef', value: 'lastModifiedDate' }},
        { label: 'Its Description',    type: 'text',             data: { ref: 'currentVersionRef', value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
        { label: 'Using',              type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in',      type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
        { label: 'Dependencies',       type: 'dependencyViewer', data: { value: 'dependencies', id: 'currentVersionId', name: 'name' }},
    ];

    /**
     * @description Columns descriptions for the data table about process builders
     */
    processBuildersTableColumns = this.flowsTableColumns;
    
    workflowsTableColumns = [
        { label: 'Score',             type: 'score',    data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',              type: 'id',       data: { value: 'name', url: 'url' }},
        { label: 'Is Active',         type: 'boolean',  data: { value: 'isActive' }},
        { label: 'Has Actions',       type: 'boolean',  data: { value: 'hasAction' }},
        { label: 'Direct Actions',    type: 'objects',  data: { ref: 'actions' }, modifier: { template: '{name} ({type})' }},
        { label: 'Empty Timetrigger', type: 'objects',  data: { ref: 'emptyTimeTriggers' }, modifier: { template: '{field} after {delay}' }},
        { label: 'Future Actions',    type: 'objects',  data: { ref: 'futureActions' }, modifier: { template: '{field} after {delay}: {name} ({type})' }},
        { label: 'Created date',      type: 'dateTime', data: { value: 'createdDate' }},
        { label: 'Modified date',     type: 'dateTime', data: { value: 'lastModifiedDate' }},
        { label: 'Description',       type: 'text',     data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    /**
     * @description Columns descriptions for the data table about roles
     */
    rolesTableColumns = [
        { label: 'Score',                       type: 'score',    data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',                        type: 'id',       data: { value: 'name', url: 'url' }},
        { label: 'Developer Name',              type: 'text',     data: { value: 'apiname' }},
        { label: 'Number of active members',    type: 'numeric',  data: { value: 'activeMembersCount' }},
        { label: 'Number of inactive members',  type: 'numeric',  data: { value: 'inactiveMembersCount' }},
        { label: 'Parent',                      type: 'id',       data: { ref: 'parentRef', value: 'name', url: 'url' }}
    ];





   /* objectPermissionsTableColumns; // TODO
    get objectPermissionsTableData() {
        return (async() => { try { return await this._api.getObjectPermissionsPerParent(); } catch (error) { console.error('objectPermissionsTableData', error); return []; }})();
    }

    appPermissionsTableColumns; // TODO
    get appPermissionsTableData() {
        return (async() => { try { return await this._api.getApplicationPermissionsPerParent(); } catch (error) { console.error('appPermissionsTableData', error); return []; }})();
    }*/










    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Decoration for Role Hierarchy graphic view
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    roleBoxColorsDecorator = (depth, data) => {
        if (depth === 0) return '#2f89a8';
        if (data.record.hasActiveMembers === false) return '#fdc223';
        return '#5fc9f8';
    };

    roleBoxInnerHtmlDecorator = (depth, data) => {
        if (depth === 0) return `<center><b>Role Hierarchy</b></center>`;
        return `<center><b>${data.record.name}</b><br />${data.record.apiname}</center>`;
    }

    roleBoxOnClickDecorator = (depth, data) => {
        if (depth === 0) return;
        let htmlContent = `Role Name: <b>${data.record.name}</b><br />`;
        htmlContent += `Salesforce Id: <b>${data.record.id}</b><br />`;
        htmlContent += `Developer Name: <b>${data.record.apiname}</b><br />`;
        htmlContent += '<br />';
        htmlContent += `Level in hierarchy: <b>${depth}</b><br />`;
        htmlContent += '<br />';
        htmlContent += `This role has ${data.record.activeMembersCount} active user(s)<br /><ul>`;
        data.record.activeMemberRefs?.forEach(activeMember => { htmlContent += `<li>${activeMember.name}</li>`; });
        htmlContent += '</ul><br />';
        htmlContent += `This role has ${data.record.inactiveMembersCount} inactive user(s)<br />`;
        htmlContent += '<br />';
        if (data.record.parentRef) {
            htmlContent += `Parent Role Name: <b>${data.record.parentRef.name}</b><br />`;
            htmlContent += `Parent Salesforce Id: <b>${data.record.parentRef.id}</b><br />`;
            htmlContent += `Parent Developer Name: <b>${data.record.parentRef.apiname}</b><br />`;
        } else {
            htmlContent += 'No parent';
        }
        this._modal.open(`Details for role ${data.record.name}`, htmlContent);
    }

    




    cacheManagerData;

    scorePieCategoriesAggregateDecorator = (data) => {
        const all = data.length;
        const badOnes = data.filter((d) => d?.score > 0).length;
        const goodOnes = all - badOnes;
        return {
            values: [ badOnes, goodOnes ],
            colors: [ 'red', 'green' ]
        };
    }

    



    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Export structure for objects (which is needed because multiple tables)
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description Representation of an export for SObject Description data
     * @type {Array<{header: string, columns: Array<{label: string, field: string}>, rows: Array<{label: string, value: any}>}>}
     */
    get objectInformationExportSource() {
        return [
            {
                header: 'General information',
                columns: [
                    { label: 'Label', field: 'label' },  
                    { label: 'Value', field: 'value' }
                ], 
                rows: [
                    { label: 'API Name', value: this.objectData.apiname },
                    { label: 'Package', value: this.objectData.package },
                    { label: 'Singular Label', value: this.objectData.label },
                    { label: 'Plural Label', value: this.objectData.labelPlural },
                    { label: 'Description', value: this.objectData.description },
                    { label: 'Key Prefix', value: this.objectData.keyPrefix },
                    { label: 'Record Count (including deleted ones)', value: this.objectData.recordCount },
                    { label: 'Is Custom?', value: this.objectData.isCustom },
                    { label: 'Feed Enable?', value: this.objectData.isFeedEnabled },
                    { label: 'Most Recent Enabled?', value: this.objectData.isMostRecentEnabled },
                    { label: 'Global Search Enabled?', value: this.objectData.isSearchable },
                    { label: 'Internal Sharing', value: this.objectData.internalSharingModel },
                    { label: 'External Sharing', value: this.objectData.externalSharingModel }
                ]
            },
            {
                header: 'Standard Fields',
                columns: this.standardFieldsInObjectTableColumns.filter((c) => !c.ref).map((c) => { return { label: c.label, field: c.data.value } }),
                rows: this.objectData.standardFields
            },
            {
                header: 'Custom Fields',
                columns: this.customFieldsInObjectTableColumns.filter((c) => !c.ref).map((c) => { return { label: c.label, field: c.data.value } }),
                rows: this.objectData.customFieldRefs
            },
            {
                header: 'Apex Triggers',
                columns: this.apexTriggersTableColumns.filter((c) => !c.ref).map((c) => { return { label: c.label, field: c.data.value } }),
                rows: this.objectData.apexTriggerRefs
            },
            {
                header: 'Field Sets',
                columns: this.fieldSetsColumns.filter((c) => !c.ref).map((c) => { return { label: c.label, field: c.data.value } }),
                rows: this.objectData.fieldSets
            },
            {
                header: 'Page Layouts',
                columns: this.layoutsColumns.filter((c) => !c.ref).map((c) => { return { label: c.label, field: c.data.value } }),
                rows: this.objectData.layouts
            },
            {
                header: 'Lightning Pages',
                columns: this.flexiPagesInObjectTableColumns.filter((c) => !c.ref).map((c) => { return { label: c.label, field: c.data.value } }),
                rows: this.objectData.flexiPages
            },
            {
                header: 'Limits',
                columns: this.limitsColumns.filter((c) => !c.ref).map((c) => { return { label: c.label, field: c.data.value } }),
                rows: this.objectData.limits
            },
            {
                header: 'Validation Rules',
                columns: this.validationRulesColumns.filter((c) => !c.ref).map((c) => { return { label: c.label, field: c.data.value } }),
                rows: this.objectData.validationRules
            },
            {
                header: 'Web Links',
                columns: this.webLinksColumns.filter((c) => !c.ref).map((c) => { return { label: c.label, field: c.data.value } }),
                rows: this.objectData.webLinks
            },
            {
                header: 'Record Types',
                columns: this.recordTypesColumns.filter((c) => !c.ref).map((c) => { return { label: c.label, field: c.data.value } }),
                rows: this.objectData.recordTypes
            },
            {
                header: 'Relationships',
                columns: this.relationshipsColumns.filter((c) => !c.ref).map((c) => { return { label: c.label, field: c.data.value } }),
                rows: this.objectData.relationships
            }
        ];
    }








    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // All tables in the app
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /** 
     * @description Data table for Org Wide default in the org 
     * @type {Array<SFDC_Object>}
     */
    objectsTableData;

    /** 
     * @description Data table for Org Wide default in the org 
     * @type {SFDC_Object}
     */
    objectData;

    /** 
     * @description Data table for custom fields 
     * @type {Array<SFDC_Field>}
     */
    customFieldsTableData;

    /** 
     * @description Data table for custom labels 
     * @type {Array<SFDC_CustomLabel>}
     */
    customLabelsTableData;

    /** 
     * @description Data table for lightning aura components 
     * @type {Array<SFDC_LightningAuraComponent>}
     */
    auraComponentsTableData;

    /** 
     * @description Data table for lightning pages 
     * @type {Array<SFDC_LightningPage>}
     */
    flexiPagesTableData;

    /** 
     * @description Data table for lightning web components 
     * @type {Array<SFDC_LightningWebComponent>}
     */
    lightningWebComponentsTableData;

    /** 
     * @description Data table for permission sets
     * @type {Array<SFDC_PermissionSet>}
     */
    permissionSetsTableData;

    /** 
     * @description Data table for profiles
     * @type {Array<SFDC_Profile>}
     */
    profilesTableData;

    /** 
     * @description Data table for profile restrictions 
     * @type {Array<SFDC_ProfileRestrictions>}
     */
    profileRestrictionsTableData;

    /** 
     * @description Data table for profile password policies 
     * @type {Array<SFDC_ProfilePasswordPolicy>}
     */
    profilePasswordPoliciesTableData;

    /** 
     * @description Data table for process builders 
     * @type {Array<SFDC_Group>}
     */
    publicGroupsTableData;

    /** 
     * @description Data table for queues
     * @type {Array<SFDC_Group>}
     */
    queuesTableData;

    /** 
     * @description Data table for active users 
     * @type {Array<SFDC_User>}
     */
    usersTableData;

    /** 
     * @description Data table for visualforce components 
     * @type {Array<SFDC_VisualForceComponent>}
     */
    visualForceComponentsTableData;

    /** 
     * @description Data table for visualforce pages
     * @type {Array<SFDC_VisualForcePage>}
     */
    visualForcePagesTableData;

    /** 
     * @description Data table for apex classes (compiled and not unit test)
     * @type {Array<SFDC_ApexClass>}
     */
    apexClassesTableData;

    /** 
     * @description Data table for uncompiled apex classes
     * @type {Array<SFDC_ApexClass>}
     */
    apexUncompiledTableData;

    /** 
     * @description Data table for apex triggers
     * @type {Array<SFDC_ApexTrigger>}
     */
    apexTriggersTableData;

    /** 
     * @description Data table for apex classes that are unit tests 
     * @type {Array<SFDC_ApexClass>}
     */
    apexTestsTableData;

    /** 
     * @description Data table for internal user roles 
     * @type {Array<SFDC_UserRole>}
     */
    rolesTableData;

    /** 
     * @description Top level user role tree, where each record may have children.
     * @type {SFDC_UserRole}
     */
    rolesTree;

    /** 
     * @description Data table for flows 
     * @type {Array<SFDC_Flow>}
     */
    flowsTableData;

    /** 
     * @description Data table for process builders 
     * @type {Array<SFDC_Flow>}
     */
    processBuildersTableData;

    /** 
     * @description Data table for workflows 
     * @type {Array<SFDC_Workflow>}
     */
    workflowsTableData;
}