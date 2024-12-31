import { OrgCheckAPI } from './api/orgcheck-api';
import { OrgCheckSalesforceMetadataTypes } from "./api/core/orgcheck-api-salesforce-metadatatypes";
import { LightningElement, api } from 'lwc';
import OrgCheckStaticRessource from "@salesforce/resourceUrl/OrgCheck_SR";
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
    orgCheckVersion;

    /**
     * @description Numerical representation of the Salesforce API Version we use in Org Check
     * @type {number}
     * @public
     */
    salesforceApiVersion;

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
     * @description The name of the curent selected tab. This property is private
     * @type {string}
     * @private
     */
    _currentTab = 'welcome';

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
            await this._load();
        }
    }

    /**
     * @description After changing the filters value, a button appears on the UI.
     *              Event called when the user click on this new button. 
     *              The idea here is to populate the appropriate data on the current tab
     *              This method is async because it awaits for the internal _updateCurrentTab method.
     * @public
     * @async
     */
    async handleFiltersValidated() {
        await this._updateCurrentTab();
    }

    /**
     * @description Handle when the userclick on the acceptance use button
     * @param {Event} event 
     * @public
     * @async
     */
    async handleClickUsageAcceptance(event) {
        if (event.target['checked'] === true) {
            this._api.acceptUsageTerms();
            await this._load();
        }
    }

    /**
     * @description Event called when user selects a main tab
     *              This updates the internal private property called "_currentTab" that represents the name of the tab currently opened/visible.
     *              This method is async because it awaits for the internal _updateCurrentTab method.
     * @param {Event} event triggered when a user is selecting a main tab, thus the current tab will be the current selected sub tab within this main tab.
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
     *              This updates the internal private property called "_currentTab" that represents the name of the tab currently opened/visible.
     *              This method is async because it awaits for the internal _updateCurrentTab method.
     * @param {Event} event triggered when a user is selecting a sub tab, thus its target is actually the current tab.
     * @public
     * @async
     */
    async handleSubTabActivation(event) {
        await this._updateCurrentTab(event.target['value']);
    }

    /**
     * @description Event called when the content of a sub tab is fully loaded
     *              This method is async because it awaits for the internal _updateCurrentTab method.
     * @public
     * @async
     */
    async handleSubTabContentLoaded() {
        await this._updateCurrentTab();
    }

    /**
     * @description Method called when the user ask to remove an item or all the cache in the UI
     * @param {Event} event should contain "allItems" (boolean) and optinally "itemName" (string), if allItems=true 
     *                      all items should be removed, if not, the "itemName" gives us the name if the cache entry
     *                      to be removed.
     * @public
     * @async
     */
    async handleRemoveCache(event) {
        if (event['detail'].allItems === true) {
            this._api.removeAllFromCache();
        } else {
            this._api.removeFromCache(event['detail'].itemName);
        }
        this._updateCurrentTab();
    }

    /**
     * @description Event called when the user clicks on the "View Score" button
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
     * @description Event called when the user clicks on the "Run All Tests" button
     * @async
     * @public
     */ 
    async handleClickRunAllTests() {
        this._spinner.open();
        this._spinner.sectionStarts('run-all-tests', 'Launching...');
        const asyncApexJobId = await this._api.runAllTestsAsync();
        this._spinner.sectionEnded('run-all-tests', 'Done!');
        this._spinner.close();
        let htmlContent = 'We asked Salesforce to run all the test classes in your org.<br /><br />';
        htmlContent += 'For more information about the success of these tests, you can:<br /><ul>';
        htmlContent += '<li>Go <a href="/lightning/setup/ApexTestQueue/home" target="_blank" rel="external noopener noreferrer">here</a> to see the results of these tests.</li>';
        htmlContent += `<li>Check with Tooling API the status of the following record: /tooling/sobjects/AsyncApexJob/${asyncApexJobId}</li><ul>`;
        this._modal.open('Asynchronous Run All Test Asked', htmlContent);
    }

    /**
     * @description Event called when the user clicks on the "Refresh" button
     * @param {Event} event 
     * @async
     * @public
     */ 
    async handleClickRefresh(event) {
        const dataTabs = event.target['getAttribute']('data-tabs');
        if (dataTabs) {
            dataTabs.split(',').forEach((/** @type {string} */ tab) => {
                switch (tab) {
                    case 'object-information': {
                        const sobject = this._filters.isSelectedSObjectApiNameAny === true ? '*' : this._filters.selectedSObjectApiName;
                        if (sobject !== '*') {
                            this._api.removeObjectFromCache(sobject); 
                        }
                        break;
                    }
                    case 'object-permissions':         this._api.removeAllObjectPermissionsFromCache(); break;
                    case 'objects-owd':                this._api.removeAllPackagesTypesAndObjectsFromCache(); break;
                    case 'app-permissions':            this._api.removeAllAppPermissionsFromCache(); break;
                    case 'custom-fields':              this._api.removeAllCustomFieldsFromCache(); break;
                    case 'users':                      this._api.removeAllActiveUsersFromCache(); break;
                    case 'profiles':                   this._api.removeAllProfilesFromCache(); break;
                    case 'permission-sets':            this._api.removeAllPermSetsFromCache(); break;
                    case 'profile-restrictions':       this._api.removeAllProfileRestrictionsFromCache(); break;
                    case 'profile-password-policies':  this._api.removeAllProfilePasswordPoliciesFromCache(); break;
                    case 'roles-listing':
                    case 'roles-explorer':             this._api.removeAllRolesFromCache(); break;
                    case 'public-groups':
                    case 'queues':                     this._api.removeAllGroupsFromCache(); break;
                    case 'flows':                      this._api.removeAllFlowsFromCache(); break;
                    case 'process-builders':           this._api.removeAllProcessBuildersFromCache(); break;
                    case 'workflows':                  this._api.removeAllWorkflowsFromCache(); break;
                    case 'custom-labels':              this._api.removeAllCustomLabelsFromCache(); break;
                    case 'visual-force-pages':         this._api.removeAllVisualForcePagesFromCache(); break;
                    case 'visual-force-components':    this._api.removeAllVisualForceComponentsFromCache(); break;
                    case 'lightning-pages':            this._api.removeAllLightningPagesFromCache(); break;
                    case 'lightning-aura-components':  this._api.removeAllLightningAuraComponentsFromCache(); break;
                    case 'lightning-web-components':   this._api.removeAllLightningWebComponentsFromCache(); break;
                    case 'apex-classes':
                    case 'apex-unit-tests':
                    case 'apex-recompilation-needed':  this._api.removeAllApexClassesFromCache(); break; 
                    case 'apex-triggers':              this._api.removeAllApexTriggersFromCache(); break;
                    default:
                }
            });
            this._updateCurrentTab();
        }
    }

    async handleClickRecompile() {
        this._spinner.open();
        const classes = new Map();
        this._spinner.sectionStarts('request-to-recompile', 'Processing...');
        this.apexUncompiledTableData.forEach(c => {
            this._spinner.sectionStarts(`request-to-recompile-${c.id}`, `Asking to recompile class: ${c.name}`);
            classes.set(c.id, c);
        });
        const responses = await this._api.compileClasses(this.apexUncompiledTableData);
        this._spinner.sectionContinues('request-to-recompile', 'Done');
        responses.forEach(r => r.compositeResponse?.filter(cr => cr.referenceId?.startsWith('01p')).forEach(cr => {
            const c = classes.get(cr.referenceId);
            if (cr.body.success === true) {
                this._spinner.sectionEnded(`request-to-recompile-${c.id}`, `Recompilation requested for class: ${c.name}`);
            } else {
                let reasons = [];
                if (cr.body && Array.isArray(cr.body)) {
                    reasons = cr.body;
                } else if (cr.errors && Array.isArray(cr.errors)) {
                    reasons = cr.errors;
                }
                this._spinner.sectionFailed(`request-to-recompile-${c.id}`, `Errors for class ${c.name}: ${reasons.map(e => JSON.stringify(e)).join(', ')}`);
            }
        }));
        this._spinner.sectionEnded('request-to-recompile', 'Please hit the Refresh button (in Org Check) to get the latest data from your Org.  By the way, in the future, if you need to recompile ALL the classes, go to "Setup > Custom Code > Apex Classes" and click on the link "Compile all classes".');
        this._spinner.canBeClosed();
    }

    /**
     * Internal method to load and set the Org Check API
     */ 
    async _load() {

        const LOG_SECTION = 'LOAD API';
        this._spinner.open();
        this._spinner.sectionStarts(LOG_SECTION, "C'est parti !");
        let doNotCloseYet = true;

        try {

            // Init of the Org Check api (only once!)
            if (!this._api) {

                // Load JS dependencies
                this._spinner.sectionContinues(LOG_SECTION, 'Loading JsForce and FFLate libraries...')
                await Promise.all([
                    loadScript(this, OrgCheckStaticRessource + '/js/jsforce.js'),
                    loadScript(this, OrgCheckStaticRessource + '/js/fflate.js')
                ]);

                // Create the Org Check API
                this._spinner.sectionContinues(LOG_SECTION, 'Loading Org Check library...')
                this._api = new OrgCheckAPI(
                    // @ts-ignore
                    jsforce,
                    // @ts-ignore
                    fflate,
                    this.accessToken,
                    this.userId,
                    {
                        begin: () => { this._spinner.open(); },
                        sectionStarts: (s, m) => { this._spinner.sectionStarts(s, m); },
                        sectionContinues: (s, m) => { this._spinner.sectionContinues(s, m); },
                        sectionEnded: (s, m) => { this._spinner.sectionEnded(s, m); },
                        sectionFailed: (s, e) => { this._spinner.sectionFailed(s, e); },
                        end: (s, f) => { if (doNotCloseYet) return; if (f === 0) this._spinner.close(); else this._spinner.canBeClosed(); }
                    }
                );

                // Set the version in the app
                this.orgCheckVersion = this._api.version;
                this.salesforceApiVersion = this._api.salesforceApiVersion;
            }

            // Check if we can use this org
            this._spinner.sectionContinues(LOG_SECTION, 'Checking if we can use the org according to the terms...')
            if (await this._api.checkUsageTerms()) {
                this.useOrgCheckInThisOrgNeedConfirmation = false;
                this.useOrgCheckInThisOrgConfirmed = true;
            } else {
                this.useOrgCheckInThisOrgNeedConfirmation = true;
                this.useOrgCheckInThisOrgConfirmed = false;
            }

            // Information about the org
            this._spinner.sectionContinues(LOG_SECTION, 'Information about the org...');
            const orgInfo = await this._api.getOrganizationInformation();
            this.orgName = orgInfo.name + ' (' + orgInfo.id + ')';
            this.orgType = orgInfo.type;
            this.isOrgProduction = orgInfo.isProduction;
            if (orgInfo.isProduction === true) this.themeForOrgType = 'slds-theme_error';
            else if (orgInfo.isSandbox === true) this.themeForOrgType = 'slds-theme_warning';
            else this.themeForOrgType = 'slds-theme_success';

            if (this.useOrgCheckInThisOrgConfirmed === true) {

                // Check basic permission
                this._spinner.sectionContinues(LOG_SECTION, 'Checking if current user has enough permission...')
                await this._api.checkCurrentUserPermissions();
                
                // Data for the filters
                this._spinner.sectionContinues(LOG_SECTION, 'Data for the filters...');
                const filtersData = await this._api.getPackagesTypesAndObjects('*', '*');
                this._filters.updateSObjectTypeOptions(filtersData.types);
                this._filters.updatePackageOptions(filtersData.packages);
                this._filters.updateSObjectApiNameOptions(filtersData.objects);
                this._filters.show();

                this._updateCurrentTab();
            }

            // FINALLY!
            doNotCloseYet = false;
            this._spinner.sectionEnded(LOG_SECTION, 'All set!');
            this._spinner.close();
    
        } catch(error) {
            this._spinner.canBeClosed();
            this._spinner.sectionFailed(LOG_SECTION, error);
        }
    }

    _updateDailyAPIUsage() {
        const dailyApiInformation = this._api.dailyApiRequestLimitInformation;
        if (dailyApiInformation.isGreenZone === true) this.themeForOrgLimit = 'slds-theme_success';
        else if (dailyApiInformation.isYellowZone === true) this.themeForOrgLimit = 'slds-theme_warning';
        else /* if (dailyApiInformation.isRedZone === true) */ this.themeForOrgLimit = 'slds-theme_error';
        this.orgLimit = `Daily API Request Limit: ${dailyApiInformation.currentUsagePercentage}%`;
    }

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

        // If for some reason the api is not yet loaded, we stop there
        if (!this._api) return;

        // If the next current tab is the same as the current one, we stop here
        if (nextCurrentTab && nextCurrentTab === this._currentTab) return;

        // If the next current tab is specified, we use it to reset the current tab property
        if (nextCurrentTab) this._currentTab = nextCurrentTab;

        // Get the global filter parameters
        const namespace = this._filters.isSelectedPackageAny === true ? '*' : (this._filters.isSelectedPackageNo === true ? '' : this._filters.selectedPackage);
        const sobjectType = this._filters.isSelectedSObjectTypeAny === true ? '*' : this._filters.selectedSObjectType;
        const sobject = this._filters.isSelectedSObjectApiNameAny === true ? '*' : this._filters.selectedSObjectApiName;
        
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
            switch (this._currentTab) {
                case 'object-information': {
                    if (sobject !== '*') {
                        this.objectInformationData = await this._api.getObject(sobject); 
                    } else {
                        this.objectInformationData = undefined; 
                    }
                    break;
                }
                case 'object-permissions':
                case 'app-permissions': {
                    const dataMatrix = 
                        (this._currentTab === 'object-permissions') ? 
                        (await this._api.getObjectPermissionsPerParent(namespace)) :
                        (await this._api.getApplicationPermissionsPerParent(namespace)); // implicitly: this._currentTab === 'app-permissions')
                    const permissionRefs = dataMatrix.rowHeaderReferences;
                    const getProp = (/** @type {string} */ id, /** @type {string} */ property) => { 
                        return permissionRefs.has(id) ? permissionRefs.get(id)[property] : ''; 
                    };
                    /** @type { Array<{label: string, type: string, data: { ref: string, value: string|Function, url?: string|Function }, sorted?: string, orientation?: string}>} */
                    const columns = [
                        { label: 'Parent',  type: 'id',       data: { ref: 'headerId', value: (/** @type {string} */ i) => getProp(i, 'name'), url: (/** @type {string} */ i) => getProp(i, 'url') }, sorted: 'asc' },
                        { label: 'Package', type: 'text',     data: { ref: 'headerId', value: (/** @type {string} */ i) => getProp(i, 'package') }},
                        { label: 'Type',    type: 'text',     data: { ref: 'headerId', value: (/** @type {string} */ i) => getProp(i, 'type') }},
                        { label: 'Custom',  type: 'boolean',  data: { ref: 'headerId', value: (/** @type {string} */ i) => getProp(i, 'isCustom') }}
                    ];
                    dataMatrix.columnHeaderIds.forEach(h => columns.push({ label: h, type: 'text', data: { ref: 'data', value: h }, orientation: 'vertical' }));
                    if (this._currentTab === 'object-permissions') {
                        this.objectPermissionsTableColumns = columns;
                        this.objectPermissionsTableData = dataMatrix.rows;
                    } else { // implicitly: this._currentTab === 'app-permissions')
                        this.appPermissionsTableColumns = columns;
                        this.appPermissionsTableData = dataMatrix.rows;
                    }
                    break;
                }
                case 'objects-owd':                        this.objectsOWDTableData = (await this._api.getPackagesTypesAndObjects(namespace, sobjectType)).objects; break;
                case 'custom-fields':                      this.customFieldsTableData = await this._api.getCustomFields(namespace, sobjectType, sobject); break;
                case 'users':                              this.usersTableData = await this._api.getActiveUsers(); break;
                case 'profiles':                           this.profilesTableData = await this._api.getProfiles(namespace); break;
                case 'permission-sets':                    this.permissionSetsTableData = await this._api.getPermissionSets(namespace); break;
                case 'profile-restrictions':               this.profileRestrictionsTableData = await this._api.getProfileRestrictions(namespace); break;
                case 'profile-password-policies':          this.profilePasswordPoliciesTableData = await this._api.getProfilePasswordPolicies(); break;
                case 'roles-listing':                      this.rolesTableData = await this._api.getRoles(); break;
                case 'roles-explorer':                     this.rolesTree = await this._api.getRolesTree(); break;
                case 'public-groups':                      this.publicGroupsTableData = (await this._api.getGroups()).filter((r) => r.isPublicGroup === true); break;
                case 'queues':                             this.queuesTableData = (await this._api.getGroups()).filter((r) => r.isQueue === true); break;
                case 'flows':                              this.flowsTableData = await this._api.getFlows(); break;
                case 'process-builders':                   this.processBuildersTableData = await this._api.getProcessBuilders(); break;
                case 'workflows':                          this.workflowsTableData = await this._api.getWorkflows(); break;
                case 'custom-labels':                      this.customLabelsTableData = await this._api.getCustomLabels(namespace); break;
                case 'visual-force-pages':                 this.visualForcePagesTableData = await this._api.getVisualForcePages(namespace); break;
                case 'visual-force-components':            this.visualForceComponentsTableData = await this._api.getVisualForceComponents(namespace); break;
                case 'lightning-pages':                    this.lightningPagesTableData = await this._api.getLightningPages(namespace); break;
                case 'lightning-aura-components':          this.auraComponentsTableData = await this._api.getLightningAuraComponents(namespace); break;
                case 'lightning-web-components':           this.lightningWebComponentsTableData = await this._api.getLightningWebComponents(namespace); break;
                case 'apex-classes':                       this.apexClassesTableData = (await this._api.getApexClasses(namespace)).filter((r) => r.isTest === false && r.needsRecompilation === false); break;
                case 'apex-unit-tests':                    this.apexTestsTableData = (await this._api.getApexClasses(namespace)).filter((r) => r.isTest === true); break;
                case 'apex-recompilation-needed':          this.apexUncompiledTableData = (await this._api.getApexClasses(namespace)).filter((r) => r.needsRecompilation === true); break; 
                case 'apex-triggers':                      this.apexTriggersTableData = await this._api.getApexTriggers(namespace); break;
                case 'welcome':                            this.cacheManagerData = await this._api.getCacheInformation(); break;
                default:
            }
            this._updateDailyAPIUsage();
            this._spinner.sectionEnded(section, 'Done');
            this._spinner.close();

        } catch (error) {
            this._spinner.sectionFailed(section, error);
            console.error(error);
        }
    }

    fieldSetsColumns = [
        { label: 'Label',       type: 'id',       data: { value: 'label', url: 'url' }},
        { label: 'Description', type: 'text',     data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    layoutsColumns = [
        { label: 'Label', type: 'id',       data: { value: 'name', url: 'url' }},
        { label: 'Type',  type: 'text',     data: { value: 'type' }},
    ];

    limitsColumns = [
        { label: 'Score',     type: 'score',      data: { id: 'id', name: 'label' }, sorted: 'desc' },
        { label: 'Label',     type: 'text',       data: { value: 'label' }},
        { label: 'Type',      type: 'text',       data: { value: 'type' }},
        { label: 'Max',       type: 'numeric',    data: { value: 'max' }},
        { label: 'Used',      type: 'numeric',    data: { value: 'used' }},
        { label: 'Used (%)',  type: 'percentage', data: { value: 'usedPercentage' }},
        { label: 'Remaining', type: 'numeric',    data: { value: 'remaining' }}
    ];

    validationRulesColumns = [
        { label: 'Score',            type: 'score',     data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',             type: 'id',        data: { value: 'name', url: 'url' }},
        { label: 'Is Active',        type: 'boolean',   data: { value: 'isActive' }},
        { label: 'Display On Field', type: 'text',      data: { value: 'errorDisplayField' }},
        { label: 'Error Message',    type: 'text',      data: { value: 'errorMessage' }},
        { label: 'Description',      type: 'text',      data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    webLinksColumns = [
        { label: 'Name', type: 'id',       data: { value: 'name' }},
    ];

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

    relationshipsColumns = [
        { label: 'Name',                 type: 'text',    data: { value: 'name' }},
        { label: 'Field Name',           type: 'text',    data: { value: 'fieldName' }},
        { label: 'Child Object',         type: 'text',    data: { value: 'childObject' }},
        { label: 'Is Cascade Delete',    type: 'boolean', data: { value: 'isCascadeDelete' }},
        { label: 'Is Restricive Delete', type: 'boolean', data: { value: 'isRestrictedDelete' }}
    ];
    
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
        { label: 'Referenced in',       type: 'numeric',          filter: 'dep', data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
        { label: 'Ref. in Layout?',     type: 'numeric',          filter: 'dep', data: { ref: 'dependencies.referencedByTypes', value: OrgCheckSalesforceMetadataTypes.PAGE_LAYOUT }},
        { label: 'Ref. in Apex Class?', type: 'numeric',          filter: 'dep', data: { ref: 'dependencies.referencedByTypes', value: OrgCheckSalesforceMetadataTypes.APEX_CLASS }},
        { label: 'Ref. in Flow?',       type: 'numeric',          filter: 'dep', data: { ref: 'dependencies.referencedByTypes', value: OrgCheckSalesforceMetadataTypes.FLOW_VERSION }},
        { label: 'Dependencies',        type: 'dependencyViewer', filter: 'dep', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',        type: 'dateTime',         filter: 'noc', data: { value: 'createdDate' }},
        { label: 'Modified date',       type: 'dateTime',         filter: 'noc', data: { value: 'lastModifiedDate' }},
        { label: 'Description',         type: 'text',             data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];
    customFieldsInObjectTableColumns = this.customFieldsTableColumns.filter(c =>
        c.filter === undefined || c.filter !== 'obj'
    );
    standardFieldsInObjectTableColumns = this.customFieldsTableColumns.filter(c => 
        c.filter === undefined
    );

    customFieldsTableData;

    customLabelsTableColumns = [
        { label: 'Score',               type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',                type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'Package',             type: 'text',             data: { value: 'package' }},
        { label: 'Label',               type: 'text',             data: { value: 'label' }},
        { label: 'Category',            type: 'text',             data: { value: 'category' }},
        { label: 'Language',            type: 'text',             data: { value: 'language' }},
        { label: 'Protected?',          type: 'boolean',          data: { value: 'isProtected' }},
        { label: 'Using',               type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in',       type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
        { label: 'Ref. in Layout?',     type: 'numeric',          data: { ref: 'dependencies.referencedByTypes', value: OrgCheckSalesforceMetadataTypes.PAGE_LAYOUT }},
        { label: 'Ref. in Apex Class?', type: 'numeric',          data: { ref: 'dependencies.referencedByTypes', value: OrgCheckSalesforceMetadataTypes.APEX_CLASS }},
        { label: 'Ref. in Flow?',       type: 'numeric',          data: { ref: 'dependencies.referencedByTypes', value: OrgCheckSalesforceMetadataTypes.FLOW_VERSION }},
        { label: 'Dependencies',        type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',        type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date',       type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Value',               type: 'text',             data: { value: 'value'}, modifier: { maximumLength: 45 }}
    ];

    customLabelsTableData;

    auraComponentsTableColumns = [
        { label: 'Score',         type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',          type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',   type: 'numeric',          data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Package',       type: 'text',             data: { value: 'package' }},
        { label: 'Using',         type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in', type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
        { label: 'Dependencies',  type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',  type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date', type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Description',   type: 'text',             data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    auraComponentsTableData;

    lightningPagesTableColumns = [
        { label: 'Score',         type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',          type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'Package',       type: 'text',             data: { value: 'package' }},
        { label: 'Using',         type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in', type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
        { label: 'Dependencies',  type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',  type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date', type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Description',   type: 'text',             data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    lightningPagesTableData;

    lightningWebComponentsTableColumns = [
        { label: 'Score',         type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',          type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',   type: 'numeric',          data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Package',       type: 'text',             data: { value: 'package' }},
        { label: 'Using',         type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in', type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
        { label: 'Dependencies',  type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',  type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date', type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Description',   type: 'text',             data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ]

    lightningWebComponentsTableData;

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

    permissionSetsTableData;

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

    profilesTableData;

    profileRestrictionsTableColumns = [
        { label: 'Score',           type: 'score',    data: { ref: 'profileRef', id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',            type: 'id',       data: { ref: 'profileRef', value: 'name', url: 'url' }},
        { label: 'Custom',          type: 'boolean',  data: { ref: 'profileRef', value: 'isCustom' }},
        { label: 'Package',         type: 'text',     data: { ref: 'profileRef', value: 'package' }},
        { label: 'Ip Ranges',       type: 'objects',  data: { ref: 'ipRanges' }, modifier: { template: '{description}: from {startAddress} to {endAddress} --> {difference:numeric} address(es)' }},
        { label: 'Login Hours',     type: 'objects',  data: { ref: 'loginHours' }, modifier: { template: '{day} from {fromTime} to {toTime} --> {difference:numeric} minute(s)' }},
        { label: 'Description',     type: 'text',     data: { ref: 'profileRef', value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    profileRestrictionsTableData;

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
    
    profilePasswordPoliciesTableData;

    publicGroupsTableColumns = [
        { label: 'Score',                  type: 'score',     data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',                   type: 'id',        data: { value: 'name', url: 'url' }},
        { label: 'Developer Name',         type: 'text',      data: { value: 'developerName' }},
        { label: 'With bosses?',           type: 'boolean',   data: { value: 'includeBosses' }},
        { label: '#Explicit members',      type: 'numeric',   data: { value: 'nbDirectMembers' }},
        { label: 'Explicit groups',        type: 'ids',       data: { ref: 'directGroupRefs', value: (g) => `${g.name} (${g.type}${g.includeBosses?' with bosses ':''}${g.includeSubordinates?' with subordinates':''})`, url: 'url' }},
        { label: 'Explicit users',         type: 'ids',       data: { ref: 'directUserRefs', value: 'name', url: 'url' }}
    ];

    publicGroupsTableData;

    queuesTableColumns = [
        { label: 'Score',                  type: 'score',     data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',                   type: 'id',        data: { value: 'name', url: 'url' }},
        { label: 'Developer Name',         type: 'text',      data: { value: 'developerName' }},
        { label: 'With bosses?',           type: 'boolean',   data: { value: 'includeBosses' }},
        { label: '#Explicit members',      type: 'numeric',   data: { value: 'nbDirectMembers' }},
        { label: 'Explicit groups',        type: 'ids',       data: { ref: 'directGroupRefs', value: (g) => `${g.name} (${g.type}${g.includeBosses?' with bosses ':''}${g.includeSubordinates?' with subordinates':''})`, url: 'url' }},
        { label: 'Explicit users',         type: 'ids',       data: { ref: 'directUserRefs', value: 'name', url: 'url' }}
    ];

    queuesTableData;

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
    usersTableData;

    visualForceComponentsTableColumns = [
        { label: 'Score',         type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',          type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',   type: 'numeric',          data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Package',       type: 'text',             data: { value: 'package' }},
        { label: 'Using',         type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in', type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
        { label: 'Dependencies',  type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',  type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date', type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Description',   type: 'text',             data: { value: 'description'}, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    visualForceComponentsTableData;

    visualForcePagesTableColumns = [
        { label: 'Score',         type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',          type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',   type: 'numeric',          data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Mobile',        type: 'boolean',          data: { value: 'isMobileReady' }},
        { label: 'Package',       type: 'text',             data: { value: 'package' }},
        { label: 'Using',         type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in', type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
        { label: 'Dependencies',  type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',  type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date', type: 'dateTime',         data: { value: 'lastModifiedDate' }},
        { label: 'Description',   type: 'text',             data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    visualForcePagesTableData;

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
        { label: 'Referenced in',   type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
        { label: 'Dependencies',    type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',    type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date',   type: 'dateTime',         data: { value: 'lastModifiedDate' }}
    ];

    apexClassesTableData;
    
    apexUncompiledTableColumns = [
        { label: 'Score',           type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',            type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',     type: 'numeric',          data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Package',         type: 'text',             data: { value: 'package' }},
        { label: 'Size',            type: 'numeric',          data: { value: 'length' }},
        { label: 'Coverage (>75%)', type: 'percentage',       data: { value: 'coverage' }, modifier: { valueIfEmpty: 'No coverage!' }},
        { label: 'Related Tests',   type: 'ids',              data: { ref: 'relatedTestClassRefs', value: 'name', url: 'url' }},
        { label: 'Using',           type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Referenced in',   type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
        { label: 'Dependencies',    type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',    type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date',   type: 'dateTime',         data: { value: 'lastModifiedDate' }}
    ];

    apexUncompiledTableData;

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

    apexTriggersInObjectTableColumns = this.apexTriggersTableColumns.filter(c =>
        c.filter !== 'nob'
    );

    apexTriggersTableData;

    apexTestsTableColumns = [
        { label: 'Score',         type: 'score',            data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',          type: 'id',               data: { value: 'name', url: 'url' }},
        { label: 'API Version',   type: 'numeric',          data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Package',       type: 'text',             data: { value: 'package' }},
        { label: 'Size',          type: 'numeric',          data: { value: 'length' }},
        { label: 'Nb Asserts',    type: 'numeric',          data: { value: 'nbSystemAsserts' }, modifier: { valueIfEmpty: 'No direct usage of Assert.Xxx() or System.assertXxx().' }},
        { label: 'Methods',       type: 'numeric',          data: { value: 'methodsCount' }},
        { label: 'Inner Classes', type: 'numeric',          data: { value: 'innerClassesCount' }},
        { label: 'Sharing',       type: 'text',             data: { value: 'specifiedSharing' }, modifier: { valueIfEmpty: 'Not specified.' }},
        { label: 'Covering',      type: 'ids',              data: { ref: 'relatedClassRefs', value: 'name', url: 'url' }},
        { label: 'Using',         type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
        { label: 'Dependencies',  type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',  type: 'dateTime',         data: { value: 'createdDate' }},
        { label: 'Modified date', type: 'dateTime',         data: { value: 'lastModifiedDate' }}
    ];
    
    apexTestsTableData;

    objectsOWDTableColumns = [
        { label: 'Label',     type: 'text',  data: { value: 'label' }, sorted: 'asc'},
        { label: 'Name',      type: 'text',  data: { value: 'name' }},
        { label: 'Package',   type: 'text',  data: { value: 'package' }},
        { label: 'Internal',  type: 'text',  data: { value: 'internalSharingModel' }},
        { label: 'External',  type: 'text',  data: { value: 'externalSharingModel' }}
    ];

    objectsOWDTableData;

    objectPermissionsTableColumns;
    objectPermissionsTableData;

    appPermissionsTableColumns;
    appPermissionsTableData;

    rolesTableColumns = [
        { label: 'Score',                       type: 'score',    data: { id: 'id', name: 'name' }, sorted: 'desc' },
        { label: 'Name',                        type: 'id',       data: { value: 'name', url: 'url' }},
        { label: 'Developer Name',              type: 'text',     data: { value: 'apiname' }},
        { label: 'Number of active members',    type: 'numeric',  data: { value: 'activeMembersCount' }},
        { label: 'Number of inactive members',  type: 'numeric',  data: { value: 'inactiveMembersCount' }},
        { label: 'Parent',                      type: 'id',       data: { ref: 'parentRef', value: 'name', url: 'url' }}
    ];

    rolesTableData;

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

    rolesTree;

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
        { label: 'Referenced in',      type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length' }, modifier: { min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
        { label: 'Dependencies',       type: 'dependencyViewer', data: { value: 'dependencies', id: 'currentVersionId', name: 'name' }},
    ];

    flowsTableData;

    processBuildersTableColumns = this.flowsTableColumns;

    processBuildersTableData;
    
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
    
    workflowsTableData;

    cacheManagerData;

    objectInformationData;


    get objectInformationExportBasename() {
        return this.objectInformationData.apiname;
    }
    
    get objectInformationExportSource() {
        return [
            {
                header: 'General information',
                columns: [
                    { label: 'Label', field: 'label' },  
                    { label: 'Value', field: 'value' }
                ], 
                rows: [
                    { label: 'API Name', value: this.objectInformationData.apiname },
                    { label: 'Package', value: this.objectInformationData.package },
                    { label: 'Singular Label', value: this.objectInformationData.label },
                    { label: 'Plural Label', value: this.objectInformationData.labelPlural },
                    { label: 'Description', value: this.objectInformationData.description },
                    { label: 'Key Prefix', value: this.objectInformationData.keyPrefix },
                    { label: 'Record Count (including deleted ones)', value: this.objectInformationData.recordCount },
                    { label: 'Is Custom?', value: this.objectInformationData.isCustom },
                    { label: 'Feed Enable?', value: this.objectInformationData.isFeedEnabled },
                    { label: 'Most Recent Enabled?', value: this.objectInformationData.isMostRecentEnabled },
                    { label: 'Global Search Enabled?', value: this.objectInformationData.isSearchable },
                    { label: 'Internal Sharing', value: this.objectInformationData.internalSharingModel },
                    { label: 'External Sharing', value: this.objectInformationData.externalSharingModel }
                ]
            },
            {
                header: 'Standard Fields',
                columns: [
                    { label: 'Id', field: 'id' },  
                    { label: 'Name', field: 'name' },  
                    { label: 'Package', field: 'package' },
                    { label: 'Type', field: 'type' },
                    { label: 'Length', field: 'length' },
                    { label: 'Unique?', field: 'isUnique' },
                    { label: 'Encrypted?', field: 'isEncrypted' },
                    { label: 'External?', field: 'isExternalId' },
                    { label: 'Indexed?', field: 'isIndexed' },
                    { label: 'Tooltip', field: 'tooltip' },
                    { label: 'Formula', field: 'formula' },
                    { label: 'Default Value', field: 'defaultValue' },
                    { label: 'Created date', field: 'createdDate' },
                    { label: 'Modified date', field: 'lastModifiedDate' },
                    { label: 'Description', field: 'description'}
                ], 
                rows: this.objectInformationData.standardFields
            },
            {
                header: 'Custom Fields',
                columns: [
                    { label: 'Id', field: 'id' },  
                    { label: 'Name', field: 'name' },  
                    { label: 'Package', field: 'package' },
                    { label: 'Type', field: 'type' },
                    { label: 'Length', field: 'length' },
                    { label: 'Unique?', field: 'isUnique' },
                    { label: 'Encrypted?', field: 'isEncrypted' },
                    { label: 'External?', field: 'isExternalId' },
                    { label: 'Indexed?', field: 'isIndexed' },
                    { label: 'Tooltip', field: 'tooltip' },
                    { label: 'Formula', field: 'formula' },
                    { label: 'Default Value', field: 'defaultValue' },
                    { label: 'Created date', field: 'createdDate' },
                    { label: 'Modified date', field: 'lastModifiedDate' },
                    { label: 'Description', field: 'description'}
                ], 
                rows: this.objectInformationData.customFieldRefs
            },
            {
                header: 'Apex Triggers',
                columns: [
                    { label: 'Id', field: 'id' },  
                    { label: 'Name', field: 'name' },  
                ], 
                rows: this.objectInformationData.apexTriggers
            },
            {
                header: 'Field Sets',
                columns: [
                    { label: 'Id', field: 'id' },  
                    { label: 'Name', field: 'label' },  
                    { label: 'Description', field: 'description' }
                ], 
                rows: this.objectInformationData.fieldSets
            },
            {
                header: 'Page Layouts',
                columns: [
                    { label: 'Id', field: 'id' },  
                    { label: 'Name', field: 'name' },  
                    { label: 'Type', field: 'type' }
                ], 
                rows: this.objectInformationData.layouts
            },           
            {
                header: 'Limits',
                columns: [
                    { label: 'Name', field: 'label' },  
                    { label: 'Maximum', field: 'max' },  
                    { label: 'Used', field: 'used' },  
                    { label: 'Remaining', field: 'remaining' },  
                    { label: 'Type', field: 'type' }
                ], 
                rows: this.objectInformationData.limits
            },
            {
                header: 'Validation Rules',
                columns: [
                    { label: 'Id', field: 'id' },  
                    { label: 'Name', field: 'label' },  
                    { label: 'Is Active?', field: 'isActive' },  
                    { label: 'Error Display Field', field: 'errorDisplayField' },  
                    { label: 'Error Message', field: 'errorMessage' },  
                    { label: 'Description', field: 'description' }
                ], 
                rows: this.objectInformationData.validationRules
            },
            {
                header: 'Web Links',
                columns: [
                    { label: 'Id', field: 'id' },  
                    { label: 'Name', field: 'name' },  
                    { label: 'URL', field: 'url' }
                ], 
                rows: this.objectInformationData.webLinks
            },
            {
                header: 'Fields',
                columns: [
                    { label: 'Id', field: 'id' },  
                    { label: 'Name', field: 'name' },  
                    { label: 'Custom', field: 'isCustom' },  
                    { label: 'Tooltip', field: 'tooltip' },  
                    { label: 'Type', field: 'type' },  
                    { label: 'Length', field: 'length' },  
                    { label: 'Unique', field: 'isUnique' },  
                    { label: 'Encrypted', field: 'isEncrypted' },  
                    { label: 'External Id', field: 'isExternalId' },  
                    { label: 'Default', field: 'defaultValue' },  
                    { label: 'Formula', field: 'formula' },  
                    { label: 'Description', field: 'description' }
                ], 
                rows: this.objectInformationData.fields
            },
            {
                header: 'Record Types',
                columns: [
                    { label: 'Id', field: 'id' },  
                    { label: 'Name', field: 'name' },  
                    { label: 'Developer Name', field: 'ladeveloperNamebel' },  
                    { label: 'Master', field: 'isMaster' },  
                    { label: 'Is Active?', field: 'isActive' },  
                    { label: 'Is Available?', field: 'isAvailable' },  
                    { label: 'Default Mapping', field: 'isDefaultRecordTypeMapping' }
                ], 
                rows: this.objectInformationData.recordTypes
            },
            {
                header: 'Relationships',
                columns: [
                    { label: 'Name', field: 'name' },  
                    { label: 'Child Object', field: 'childObject' },  
                    { label: 'Field', field: 'fieldName' },  
                    { label: 'Cascade Delete?', field: 'isCascadeDelete' },  
                    { label: 'Restricted Delete?', field: 'isRestrictedDelete' }
                ], 
                rows: this.objectInformationData.relationships
            }
        ];
    }
}