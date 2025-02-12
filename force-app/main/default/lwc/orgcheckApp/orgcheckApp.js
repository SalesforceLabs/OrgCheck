import { LightningElement, api } from 'lwc';
import OrgCheckStaticRessource from '@salesforce/resourceUrl/OrgCheck_SR';
import * as ocapi from './libs/orgcheck-api.js';
import * as ocui from './libs/orgcheck-ui.js';
// @ts-ignore
import { loadScript } from 'lightning/platformResourceLoader';

const PAGELAYOUT = ocapi.SalesforceMetadataTypes.PAGE_LAYOUT;
const APEXCLASS = ocapi.SalesforceMetadataTypes.APEX_CLASS;
const FLOWVERSION = ocapi.SalesforceMetadataTypes.FLOW_VERSION;
const TEXTENCODER = new TextEncoder();
const TEXTDECODER = new TextDecoder();

export default class OrgcheckApp extends LightningElement {

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
     * @description list of items stored in org check cache
     * @type {Array<ocapi.DataCacheItem>}
     * @public 
     */ 
    cacheManagerData;

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
     * @type {ocapi.API}
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
     * @description Current sub tab which is displayed
     * @type {string}
     * @private
     */
    _currentTab = 'welcome';

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
     * @private
     */ 
    get namespace() {
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
     * @private
     */ 
    get objectType() {
        if (this._filters.isSelectedSObjectTypeAny === true) {
            return '*';
        }
        return this._filters.selectedSObjectType;
    }

    /**
     * @description Getter for the selected sobject name from the global filter
     * @returns {string} Wildcard ('*') if 'any sobject' selected, otherwise the name of the seleted sobject.
     * @private
     */ 
    get object() {
        if (this._filters.isSelectedSObjectApiNameAny === true) {
            this.isObjectSpecified = false;
            return '*';
        }
        this.isObjectSpecified = true;
        return this._filters.selectedSObjectApiName;
    }





    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Some other getter for the UI
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description List of elements to put in the global view
     * @type {Array<{label: string, dataTable: Array<any>}>}
     */ 
    get globalViewItems() {
        return Object.keys(this._internalTransformers)
            .filter((/** @type {string} */ recipe) => this._internalTransformers[recipe].isGlobalView)
            .map((/** @type {string} */ recipe) => { 
                const transfomer = this._internalTransformers[recipe]; 
                return { label: transfomer.label, dataTable: this[transfomer.data] };
            });
    }

    /**
     * @description Do we show the "Apex Uncompiled" button in the Apex tab (depends on the size of apexUncompiledTableData)
     * @type {boolean}
     * @public
     */ 
    get isThereAnyApexUncompiled() {
        return this.apexUncompiledTableData?.length > 0 || false;
    }

    /**
     * @description Some tabs require object to be specified in the filter (like Object Description and Field Permissions)
     * @type {boolean}
     */ 
    isObjectSpecified;






    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Org Check API loading, calls and update limit info in the UI
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description Load the Org Check API (and it dependencies) only the first time
     * @param {any} [logger]
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
        // @ts-ignore
        this._api = new ocapi.API(
            // -----------------------
            // ACCESS TOKEN of the current user
            this.accessToken, 
            // -----------------------
            // JsForce instance
            // @ts-ignore
            jsforce, 
            // -----------------------
            // Local Storage methods
            // Note: LWC Security avoid passing localStorage methods direclty to a third party library :D
            {
                /**
                 * @description Set an item in the local storage
                 * @param {string} key
                 * @param {string} value 
                 */
                setItem: (key, value) => { localStorage.setItem(key, value); },
                /**
                 * @description Get an item from the local storage
                 * @param {string} key
                 * @returns {string}
                 */
                getItem: (key) => { return localStorage.getItem(key); },
                /**
                 * @description Removes an item from the local storage
                 * @param {string} key
                 */
                removeItem: (key) => { localStorage.removeItem(key); },
                /**
                 * @description Get the nth key in the storage, returns null if out of range
                 * @param {number} index
                 * @returns {string | null}
                 */
                key: (index) => { return localStorage.key(index); },
                /**
                 * @description Get the current length of the storage
                 * @returns {number}
                 */
                length: () => { return localStorage.length; }
            },
            // -----------------------
            // Encoding methods
            { 
                /** 
                 * @description Encoding method
                 * @param data {string}
                 * @returns {Uint8Array} 
                 */ 
                encode: (data) => { return TEXTENCODER.encode(data); }, 
                /** 
                 * @description Decoding method
                 * @param data {Uint8Array}
                 * @returns {string} 
                 */ 
                decode: (data) => { return TEXTDECODER.decode(data); }
            },            
            // -----------------------
            // Compression methods
            { 
                /** 
                 * @description Compress method
                 * @param data {Uint8Array}
                 * @returns {Uint8Array} 
                 */ 
                compress:   (data) => { 
                    // @ts-ignore
                    return fflate.zlibSync(data, { level: 9 }); 
                },
                /** 
                 * @description Decompress method
                 * @param data {Uint8Array}
                 * @returns {Uint8Array} 
                 */ 
                // @ts-ignore
                decompress: (data) => { 
                    // @ts-ignore
                    return fflate.unzlibSync(data); 
                }
            },
            // -----------------------
            // Log methods -- delegation to the UI spinner
            {
                /**
                 * @description Standard log method
                 * @param section {string}
                 * @param message {string}
                 */ 
                log: (section, message) => { this._spinner.sectionLog(section, message); },
                /**
                 * @description Log method when task is ended
                 * @param section {string}
                 * @param message {string}
                 */ 
                ended: (section, message) => { this._spinner.sectionEnded(section, message); },
                /**
                 * @description Log method when task has just failed
                 * @param section {string}
                 * @param error {string | Error}
                 */ 
                failed: (section, error) => { this._spinner.sectionFailed(section, error); }
            }
        );

        // Set the score rules for information
        this._internalAllScoreRulesDataMatrix = this._api.getAllScoreRulesAsDataMatrix();
    }

    /**
     * @description List of internal transformers to get data from the API
     * @private
     */
    _internalTransformers = {
        'active-users':              { label: '👥 Active Internal Users',     isGlobalView: true, data: 'usersTableData',                        remove: () => { this._api.removeAllActiveUsersFromCache(); },             getAlias: () => '',                                                       get: async () => { return this._api.getActiveUsers(); }},
        'apex-classes':              { label: '❤️‍🔥 Apex Classes',              isGlobalView: true, data: 'apexClassesTableData',                  remove: () => { this._api.removeAllApexClassesFromCache(); },             getAlias: () => `${this.namespace}`,                                     get: async () => { return this._api.getApexClasses(this.namespace); }},
        'apex-unit-tests':           { label: '🚒 Apex Unit Tests',           isGlobalView: true, data: 'apexTestsTableData',                    remove: () => { this._api.removeAllApexTestsFromCache(); },               getAlias: () => `${this.namespace}`,                                     get: async () => { return this._api.getApexTests(this.namespace); }},
        'apex-triggers':             { label: '🧨 Apex Triggers',             isGlobalView: true, data: 'apexTriggersTableData',                 remove: () => { this._api.removeAllApexTriggersFromCache(); },            getAlias: () => `${this.namespace}`,                                     get: async () => { return this._api.getApexTriggers(this.namespace); }},
        'apex-recompilation-needed': { label: '🌋 Apex Uncompiled',           isGlobalView: true, data: 'apexUncompiledTableData',               remove: () => { this._api.removeAllApexUncompiledFromCache(); },          getAlias: () => `${this.namespace}`,                                     get: async () => { return this._api.getApexUncompiled(this.namespace); }},
        'app-permissions':           { label: '⛕ Application Permissions',    isGlobalView: false, data: '_internalAppPermissionsDataMatrix',     remove: () => { this._api.removeAllAppPermissionsFromCache(); },          getAlias: () => `${this.namespace}`,                                     get: async () => { return this._api.getApplicationPermissionsPerParent(this.namespace); }},
        'custom-fields':             { label: '🏈 Custom Fields',             isGlobalView: true, data: 'customFieldsTableData',                 remove: () => { this._api.removeAllCustomFieldsFromCache(); },            getAlias: () => `${this.namespace}-${this.objectType}-${this.object}`,   get: async () => { return this._api.getCustomFields(this.namespace, this.objectType, this.object); }},
        'custom-labels':             { label: '🏷️ Custom Labels',             isGlobalView: true, data: 'customLabelsTableData',                 remove: () => { this._api.removeAllCustomLabelsFromCache(); },            getAlias: () => `${this.namespace}`,                                     get: async () => { return this._api.getCustomLabels(this.namespace); }},
        'field-permissions':         { label: '🚧 Field Level Securities',    isGlobalView: false, data: '_internalFieldPermissionsDataMatrix',   remove: () => { this._api.removeAllFieldPermissionsFromCache(); },        getAlias: () => `${this.object}-${this.namespace}`,                      get: async () => { return this._api.getFieldPermissions(this.object, this.namespace); }},
        'flows':                     { label: '🏎️ Flows',                     isGlobalView: true, data: 'flowsTableData',                        remove: () => { this._api.removeAllFlowsFromCache(); },                   getAlias: () => '',                                                      get: async () => { return this._api.getFlows(); }},
        'lightning-aura-components': { label: '🧁 Lightning Aura Components', isGlobalView: true, data: 'auraComponentsTableData',               remove: () => { this._api.removeAllLightningAuraComponentsFromCache(); }, getAlias: () => `${this.namespace}`,                                     get: async () => { return this._api.getLightningAuraComponents(this.namespace); }},
        'lightning-pages':           { label: '🎂 Lightning Pages',           isGlobalView: true, data: 'flexiPagesTableData',                   remove: () => { this._api.removeAllLightningPagesFromCache(); },          getAlias: () => `${this.namespace}`,                                     get: async () => { return this._api.getLightningPages(this.namespace); }},
        'lightning-web-components':  { label: '🍰 Lightning Web Components',  isGlobalView: true, data: 'lightningWebComponentsTableData',       remove: () => { this._api.removeAllLightningWebComponentsFromCache(); },  getAlias: () => `${this.namespace}`,                                     get: async () => { return this._api.getLightningWebComponents(this.namespace); }},
        'object':                    { label: '🎳 Object Documentation',      isGlobalView: false, data: 'objectData',                            remove: () => { this._api.removeObjectFromCache(this.object); },          getAlias: () => `${this.object}`,                                        get: async () => { return this.object !== '*' ? this._api.getObject(this.object) : undefined; }},
        'object-permissions':        { label: '🚦 Object Permissions',        isGlobalView: false, data: '_internalObjectPermissionsDataMatrix',  remove: () => { this._api.removeAllObjectPermissionsFromCache(); },       getAlias: () => `${this.namespace}`,                                     get: async () => { return this._api.getObjectPermissionsPerParent(this.namespace); }},
        'objects':                   { label: '🏉 Org Wide Defaults',         isGlobalView: false, data: 'objectsTableData',                      remove: () => { this._api.removeAllObjectsFromCache(); },                 getAlias: () => `${this.namespace}-${this.objectType}`,                  get: async () => { return this._api.getObjects(this.namespace, this.objectType); }},
        'permission-sets':           { label: '🚔 Permission Sets',           isGlobalView: true, data: 'permissionSetsTableData',               remove: () => { this._api.removeAllPermSetsFromCache(); },                getAlias: () => `${this.namespace}`,                                     get: async () => { return this._api.getPermissionSets(this.namespace); }},
        'permission-set-licenses':   { label: '🚔 Permission Set Licenses',   isGlobalView: true, data: 'permissionSetLicensesTableData',        remove: () => { this._api.removeAllPermSetLicensesFromCache(); },         getAlias: () => '',                                                      get: async () => { return this._api.getPermissionSetLicenses(); }},
        'process-builders':          { label: '🛺 Process Builders',          isGlobalView: true, data: 'processBuildersTableData',              remove: () => { this._api.removeAllProcessBuildersFromCache(); },         getAlias: () => '',                                                      get: async () => { return this._api.getProcessBuilders(); }},
        'profile-password-policies': { label: '⛖ Profile Password Policies', isGlobalView: true, data: 'profilePasswordPoliciesTableData',       remove: () => { this._api.removeAllProfilePasswordPoliciesFromCache(); }, getAlias: () => '',                                                      get: async () => { return this._api.getProfilePasswordPolicies(); }},
        'profile-restrictions':      { label: '🚸 Profile Restrictions',      isGlobalView: true, data: 'profileRestrictionsTableData',          remove: () => { this._api.removeAllProfileRestrictionsFromCache(); },     getAlias: () => `${this.namespace}`,                                     get: async () => { return this._api.getProfileRestrictions(this.namespace); }},
        'profiles':                  { label: '🚓 Profiles',                  isGlobalView: true, data: 'profilesTableData',                     remove: () => { this._api.removeAllProfilesFromCache(); },                getAlias: () => `${this.namespace}`,                                     get: async () => { return this._api.getProfiles(this.namespace); }},
        'public-groups':             { label: '🐘 Public Groups',             isGlobalView: true, data: 'publicGroupsTableData',                 remove: () => { this._api.removeAllPublicGroupsFromCache(); },            getAlias: () => '',                                                      get: async () => { return this._api.getPublicGroups(); }},
        'queues':                    { label: '🦒 Queues',                    isGlobalView: true, data: 'queuesTableData',                       remove: () => { this._api.removeAllQueuesFromCache(); },                  getAlias: () => '',                                                      get: async () => { return this._api.getQueues(); }},
        'roles-listing':             { label: '🦓 Role Listing',              isGlobalView: true, data: 'rolesTableData',                        remove: () => { this._api.removeAllRolesFromCache(); },                   getAlias: () => '',                                                      get: async () => { return this._api.getRoles(); }},
        'roles-explorer':            { label: '🐙 Role Explorer',             isGlobalView: false, data: 'rolesTree',                             remove: () => { this._api.removeAllRolesFromCache(); },                   getAlias: () => '',                                                      get: async () => { return this._api.getRolesTree(); }},
        'validation-rules':          { label: '🎾 Validation Rules',          isGlobalView: true, data: 'validationRulesTableData',              remove: () => { this._api.removeAllValidationRulesFromCache(); },         getAlias: () => '',                                                      get: async () => { return this._api.getValidationRules(); }},
        'visual-force-components':   { label: '🍞 Visual Force Components',   isGlobalView: true, data: 'visualForceComponentsTableData',        remove: () => { this._api.removeAllVisualForceComponentsFromCache(); },   getAlias: () => `${this.namespace}`,                                     get: async () => { return this._api.getVisualForceComponents(this.namespace); }},
        'visual-force-pages':        { label: '🥖 Visual Force Pages',        isGlobalView: true, data: 'visualForcePagesTableData',             remove: () => { this._api.removeAllVisualForcePagesFromCache(); },        getAlias: () => `${this.namespace}`,                                     get: async () => { return this._api.getVisualForcePages(this.namespace); }},
        'workflows':                 { label: '🚗 Workflows',                 isGlobalView: true, data: 'workflowsTableData',                    remove: () => { this._api.removeAllWorkflowsFromCache(); },               getAlias: () => '',                                                      get: async () => { return this._api.getWorkflows(); }}
    }

    /**
     * @description List of transformer keys that will be included in the global view tab
     * @private
     */
    _globalViewTransformersKeys = Object.keys(this._internalTransformers).filter((/** @type {string} */ recipe) => this._internalTransformers[recipe].isGlobalView === true)

    /**
     * @description Call a specific Recipe from the API given a recipe name (does not have to be the internal name, up to the UI)
     * @param {string} recipe 
     * @param {boolean} [forceRefresh=false] 
     * @param {boolean} [lazyRefresh=true] 
     * @private
     * @async
     */ 
    async _updateData(recipe, forceRefresh=false, lazyRefresh=true) {
        const transformer = this._internalTransformers[recipe]; 
        if (transformer) {
            if (forceRefresh === true) {
                // Call the remove cache from the API for this recipe
                transformer.remove();
            }
            // IF we set the lazy refresh to TRUE THEN
            //     Only update the data if the current tab ("this._currentTab") is the one we are looking for ("recipe")
            // ELSE
            //     Update the data whatever the current tab is.
            // The IF statement could be like: 
            //     (lazyRefresh === true && recipe === this._currentTab) || lazyRefresh === false
            // Let's do some Bool logic!!
            // The previous IF statement is equivalent to:
            //     NOT(  NOT( (lazyRefresh === true && recipe === this._currentTab)     ||  lazyRefresh === false )  )
            //     NOT(  NOT(lazyRefresh === true && recipe === this._currentTab)       &&  NOT(lazyRefresh === false)  )
            //     NOT(  NOT(lazyRefresh === true && recipe === this._currentTab)       &&  lazyRefresh === true  )
            //     NOT( (NOT(lazyRefresh === true) || NOT(recipe === this._currentTab)) &&  lazyRefresh === true  )
            //     NOT( (    lazyRefresh === false ||     recipe !== this._currentTab ) &&  lazyRefresh === true  )
            //     NOT( (lazyRefresh === false &&  lazyRefresh === true ) || (recipe !== this._currentTab &&  lazyRefresh === true ) )
            //     NOT( (                    false                      ) || (recipe !== this._currentTab &&  lazyRefresh === true ) )
            //     NOT( (recipe !== this._currentTab && lazyRefresh === true )
            // This is magic! ;)
            if (!(recipe !== this._currentTab && lazyRefresh === true)) {
                // "Alias" means the filter combinaison used to gather the data (obviously if the alias changed, the data will change as well)
                const alias = transformer.getAlias();
                // If you forced the refresh the data should be retrieved even if the alias is the same
                // OR
                // If the alias has changed (like the combinaison of filters value which will pontentially change the returned value from the API
                if (forceRefresh === true || transformer.lastAlias !== alias) {
                    transformer.lastAlias = alias;
                    this[transformer.data] = await transformer.get();
                }
            }
        }
    }

    /**
     * @description Update the Daily API Request Limit information in the UI from the API
     * @private
     */ 
    _updateLimits() {
        if (this._api) {
            const dailyApiInformation = this._api.dailyApiRequestLimitInformation;
            if (dailyApiInformation && dailyApiInformation.currentUsagePercentage) {
                if (dailyApiInformation.isGreenZone === true) this.themeForOrgLimit = 'slds-theme_success';
                else if (dailyApiInformation.isYellowZone === true) this.themeForOrgLimit = 'slds-theme_warning';
                else /* if (dailyApiInformation.isRedZone === true) */ this.themeForOrgLimit = 'slds-theme_error';
                this.orgLimit = `Daily API Request Limit: ${dailyApiInformation.currentUsagePercentage}%`;    
            } else {
                this.orgLimit = undefined;
            }
        }
    }

    /**
     * @description Update the api cache information in the UI from the API
     * @private
     */ 
    _updateCacheInformation() {
        this.cacheManagerData = this._api.getCacheInformation();
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
     * @param {any} [logger]
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
        logger?.log('Load filters...');
        await this._loadFilters();

        // Update daily API limit information
        logger?.log('Update the daily API limit informations...');
        this._updateLimits();
    }

    /**
     * @description Load the list of values for the filter
     * @param {boolean} [forceRefresh=false] 
     * @param {any} [logger]
     * @private
     * @async
     */ 
    async _loadFilters(forceRefresh=false, logger) {
        logger?.log('Hide the filter panel...');
        this._filters.hide();

        if (forceRefresh === true) {
            logger?.log('Clean data from cache (if any)...');
            this._api.removeAllObjectsFromCache();
            this._api.removeAllPackagesFromCache();
        }

        logger?.log('Get packages, types and objects from the org...');
        const filtersData = await Promise.all([
            this._api.getPackages(),
            this._api.getObjectTypes(),
            this._api.getObjects(this.namespace, this.objectType)
        ])

        logger?.log('Loading data in the drop boxes...');
        this._filters.updatePackageOptions(filtersData[0]);
        this._filters.updateSObjectTypeOptions(filtersData[1]);
        this._filters.updateSObjectApiNameOptions(filtersData[2]);

        logger?.log('Showing the filter panel...');
        this._filters.show();

        logger?.log('Update the daily API limit informations...');
        this._updateLimits();
    }

    /**
     * @description Unique method to launch the update of all data and update the screen accordingly
     * @private
     * @async
     */
    async _updateGlobalView() {
        await Promise.all(this._globalViewTransformersKeys.map((/** @type {string} */ recipe) => { this._updateData(recipe, false, false); } ));
    }

    /**
     * @description Unique method to propagate a change to be done in the current tab.
     * @private
     * @async
     */
    async _updateCurrentTab() {

        if (this._hasRenderOnce === false) return;
        
        switch (this._currentTab) {
            case 'welcome': {
                this._updateCacheInformation();
                break;
            }
            case 'global-view': {
                await this._updateGlobalView();
                break;
            }
            default: {
                const TAB_SECTION = `TAB ${this._currentTab}`;
                try {
                    this._spinner.open();
                    this._spinner.sectionLog(TAB_SECTION, `C'est parti!`);
                    await this._updateData(this._currentTab);
                    this._spinner.sectionEnded(TAB_SECTION, `Done.`);
                    this._spinner.close(0);
                } catch (error) {
                    this._spinner.sectionFailed(TAB_SECTION, error);
                    this._spinner.canBeClosed();
                }
            }
        }
        this._updateLimits();
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
        return this._updateCurrentTab();
    }

    /**
     * @description The "refresh" button in the global filters was pushed, therefore the filters needs to be reloaded
     * @public
     * @async
     */
    async handleFiltersRefreshed() {
        return this._loadFilters(true);
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
            return this._loadBasicInformationIfAccepted();
        }
    }

    /**
     * @description Event called when user selects a main tab
     * @param {Event} event
     * @public
     * @async
     */
    async handleMainTabActivation(event) {
        // The source of the event is the main tab
        const mainTab = event.target;
        // In each main tab there is an inner tabset that we want to get
        const subTabset = mainTab['querySelector']('lightning-tabset');
        // do nothing if we did not find any tabset (example the welcome tab does not have any!)
        if (!subTabset) return;
        // That subTabSet contains the last active tab
        const currentActivatedSubTab = subTabset.activeTabValue;
        // In case the current activated subTab is undefined we also do nothing
        if (!currentActivatedSubTab) return;
        // And that value is the next current tab we want to store
        this._currentTab = currentActivatedSubTab;
        // Ask to update the current data
        return this._updateCurrentTab();
    }

    /**
     * @description Event called when user selects a sub tab (within a main tab)
     * @param {Event} event 
     * @public
     * @async
     */
    async handleSubTabActivation(event) {
        // The source of the event is a sub tab
        const subTab = event.target;
        // That subTab's name will be the next currentTab
        this._currentTab = subTab['value'];
        // Ask to update the current data
        return this._updateCurrentTab();
    }

    /**
     * @description Event called when the content of a sub tab is fully loaded
     * @public
     * @async
     */
    handleSubTabContentLoaded() {
        this._updateCacheInformation();
    }

    /**
     * @description Method called when the user ask to remove all the cache in the UI
     * @public
     * @async
     */
    async handleRemoveAllCache() {
        if (this._api) {
            this._api.removeAllFromCache();
            window.location.reload();
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
            const reason = this._api.getScoreRule(id);
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
        this._spinner.sectionLog(LOG_SECTION, 'Launching...');
        try {
            const asyncApexJobId = await this._api.runAllTestsAsync();
            this._spinner.sectionEnded(LOG_SECTION, 'Done!');
            this._spinner.close(0);

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
     * @description Event called when the user clicks on the "Refresh" button from the current tab
     * @param {Event} event 
     * @async
     * @public
     */ 
    async handleClickRefreshCurrentTab(event) {
        const recipes = event.target['getAttribute']('data-recipes')?.split(',');
        return Promise.all(recipes.map((/** @type {string} */ recipe) => { this._updateData(recipe, true); } ));
    }

    /**
     * @description When you activate the global view tab it should automatically retrieve all recipes
     * @async
     * @public
     */ 
    async handleGlobalViewTabActivation() {
        return this._updateGlobalView();
    }

    /**
     * @description Event called when the user clicks on the "Recompile" button
     * @async
     * @public
     */ 
    async handleClickRecompile() {
        this._spinner.open();
        const LOG_SECTION = 'RECOMPILE';
        const classes = new Map();
        this._spinner.sectionLog(LOG_SECTION, 'Processing...');
        this.apexUncompiledTableData.forEach(c => {
            this._spinner.sectionLog(`${LOG_SECTION}-${c.id}`, `Asking to recompile class: ${c.name}`);
            classes.set(c.id, c);
        });
        const responses = await this._api.compileClasses(this.apexUncompiledTableData);
        this._spinner.sectionLog(LOG_SECTION, 'Done');
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




    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Column header definition for all data tables in the app
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description Table for field sets (specific to the current selected object)
     * @type {ocui.TableWithOrdering}
     */ 
    fieldSetsTableColumns = {
        columns: [
            { label: 'Label',       type: ocui.Type.URL, data: { value: 'url', label: 'label' }},
            { label: 'Description', type: ocui.Type.TXT, data: { value: 'description' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No description.' }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.ASC
    };

    /**
     * @description Table for page layouts (specific to the current selected object)
     * @type {ocui.TableWithOrdering}
     */
    layoutsTableColumns = {
        columns: [
            { label: 'Label', type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'Type',  type: ocui.Type.TXT, data: { value: 'type' }},
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.ASC
    };

    /**
     * @description Table for object limits (specific to the current selected object)
     * @type {ocui.TableWithOrdering}
     */
    limitsTableColumns = {
        columns: [
            { label: 'Score',     type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Label',     type: ocui.Type.TXT, data: { value: 'label' }},
            { label: 'Type',      type: ocui.Type.TXT, data: { value: 'type' }},
            { label: 'Max',       type: ocui.Type.NUM, data: { value: 'max' }},
            { label: 'Used',      type: ocui.Type.NUM, data: { value: 'used' }},
            { label: 'Used (%)',  type: ocui.Type.PRC, data: { value: 'usedPercentage' }},
            { label: 'Remaining', type: ocui.Type.NUM, data: { value: 'remaining' }}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for validation rules
     * @type {ocui.TableWithOrdering}
     */
    validationRulesTableColumns = {
        columns: [
            { label: 'Score',            type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',             type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'In this object',   type: ocui.Type.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }}, 
            { label: 'Object Type',      type: ocui.Type.TXT, data: { value: 'objectRef.typeRef.label' }},
            { label: 'ObjectID',         type: ocui.Type.TXT, data: { value: 'objectId' }},
            { label: 'Is Active',        type: ocui.Type.CHK, data: { value: 'isActive' }},
            { label: 'Display On Field', type: ocui.Type.TXT, data: { value: 'errorDisplayField' }},
            { label: 'Error Message',    type: ocui.Type.TXT, data: { value: 'errorMessage' }},
            { label: 'Description',      type: ocui.Type.TXT, data: { value: 'description' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No description.' }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for validation rules (specific to the current selected object)
     * @type {ocui.TableWithOrdering}
     */
    validationRulesInObjectTableColumns = {
        columns: [
            { label: 'Score',            type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',             type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'Is Active',        type: ocui.Type.CHK, data: { value: 'isActive' }},
            { label: 'Display On Field', type: ocui.Type.TXT, data: { value: 'errorDisplayField' }},
            { label: 'Error Message',    type: ocui.Type.TXT, data: { value: 'errorMessage' }},
            { label: 'Description',      type: ocui.Type.TXT, data: { value: 'description' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No description.' }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for web links (specific to the current selected object)
     * @type {ocui.TableWithOrdering}
     */
    webLinksTableColumns = {
        columns: [
            { label: 'Name', type: ocui.Type.URL, data: { value: 'url', label: 'name' }}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.ASC
    };
    
    /**
     * @description Table for record types (specific to the current selected object)
     * @type {ocui.TableWithOrdering}
     */
    recordTypesTableColumns = {
        columns: [
            { label: 'Score',          type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',           type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'Developer Name', type: ocui.Type.TXT, data: { value: 'developerName' }},
            { label: 'Is Active',      type: ocui.Type.CHK, data: { value: 'isActive' }},
            { label: 'Is Available',   type: ocui.Type.CHK, data: { value: 'isAvailable' }},
            { label: 'Is Default',     type: ocui.Type.CHK, data: { value: 'isDefaultRecordTypeMapping' }},
            { label: 'Is Master',      type: ocui.Type.CHK, data: { value: 'isMaster' }},
            { label: 'Description',    type: ocui.Type.TXT, data: { value: 'description' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No description.' }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for sobject relationships (specific to the current selected object)
     * @type {ocui.TableWithOrdering}
     */
    relationshipsTableColumns = {
        columns: [
            { label: 'Name',                 type: ocui.Type.TXT, data: { value: 'name' }},
            { label: 'Field Name',           type: ocui.Type.TXT, data: { value: 'fieldName' }},
            { label: 'Child Object',         type: ocui.Type.TXT, data: { value: 'childObject' }},
            { label: 'Is Cascade Delete',    type: ocui.Type.CHK, data: { value: 'isCascadeDelete' }},
            { label: 'Is Restricive Delete', type: ocui.Type.CHK, data: { value: 'isRestrictedDelete' }}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.ASC
    };

    /**
     * @description Table for custom fields
     * @type {ocui.TableWithOrdering}
     */
    customFieldsTableColumns = {
        columns: [
            { label: 'Score',               type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }}, //filter: 'sco',
            { label: 'Field',               type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'Label',               type: ocui.Type.TXT, data: { value: 'label' }},
            { label: 'In this object',      type: ocui.Type.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }},  //filter: 'obj', 
            { label: 'Object Type',         type: ocui.Type.TXT, data: { value: 'objectRef.typeRef.label' }}, //filter: 'obj', 
            { label: 'Package',             type: ocui.Type.TXT, data: { value: 'package' }}, // filter: 'cus',
            { label: 'Type',                type: ocui.Type.TXT, data: { value: 'type' }},
            { label: 'Length',              type: ocui.Type.TXT, data: { value: 'length' }},
            { label: 'Unique?',             type: ocui.Type.CHK, data: { value: 'isUnique' }},
            { label: 'Encrypted?',          type: ocui.Type.CHK, data: { value: 'isEncrypted' }},
            { label: 'External?',           type: ocui.Type.CHK, data: { value: 'isExternalId' }},
            { label: 'Indexed?',            type: ocui.Type.CHK, data: { value: 'isIndexed' }},
            { label: 'Restricted?',         type: ocui.Type.CHK, data: { value: 'isRestrictedPicklist' }},
            { label: 'Tooltip',             type: ocui.Type.TXT, data: { value: 'tooltip' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No tooltip.' }]},
            { label: 'Formula',             type: ocui.Type.TXT, data: { value: 'formula' }, modifiers: [{ maximumLength: 100 }, { preformatted: true }]},
            { label: 'Default Value',       type: ocui.Type.TXT, data: { value: 'defaultValue' }},
            { label: 'Using',               type: ocui.Type.NUM, data: { value: 'dependencies.using.length' }}, // filter: 'dep', 
            { label: 'Referenced in',       type: ocui.Type.NUM, data: { value: 'dependencies.referenced.length' }, modifiers: [{ minimum: 1, valueBeforeMin: 'Not referenced anywhere.' }, { valueIfEmpty: 'N/A' }]}, // filter: 'dep', 
            { label: 'Ref. in Layout?',     type: ocui.Type.NUM, data: { value: `dependencies.referencedByTypes.${PAGELAYOUT}` }}, // filter: 'dep', 
            { label: 'Ref. in Apex Class?', type: ocui.Type.NUM, data: { value: `dependencies.referencedByTypes.${APEXCLASS}` }}, // filter: 'dep', 
            { label: 'Ref. in Flow?',       type: ocui.Type.NUM, data: { value: `dependencies.referencedByTypes.${FLOWVERSION}` }}, // filter: 'dep', 
            { label: 'Dependencies',        type: ocui.Type.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},// filter: 'dep', 
            { label: 'Created date',        type: ocui.Type.DTM, data: { value: 'createdDate' }},// filter: 'noc', 
            { label: 'Modified date',       type: ocui.Type.DTM, data: { value: 'lastModifiedDate' }},// filter: 'noc', 
            { label: 'Description',         type: ocui.Type.TXT, data: { value: 'description' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No description.' }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for custom fields (specific to the current selected object)
     * @type {ocui.TableWithOrdering}
     */
    customFieldsInObjectTableColumns = {
        columns: [
            { label: 'Score',               type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }}, //filter: 'sco',
            { label: 'Field',               type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'Label',               type: ocui.Type.TXT, data: { value: 'label' }},
            { label: 'Package',             type: ocui.Type.TXT, data: { value: 'package' }}, // filter: 'cus',
            { label: 'Type',                type: ocui.Type.TXT, data: { value: 'type' }},
            { label: 'Length',              type: ocui.Type.TXT, data: { value: 'length' }},
            { label: 'Unique?',             type: ocui.Type.CHK, data: { value: 'isUnique' }},
            { label: 'Encrypted?',          type: ocui.Type.CHK, data: { value: 'isEncrypted' }},
            { label: 'External?',           type: ocui.Type.CHK, data: { value: 'isExternalId' }},
            { label: 'Indexed?',            type: ocui.Type.CHK, data: { value: 'isIndexed' }},
            { label: 'Restricted?',         type: ocui.Type.CHK, data: { value: 'isRestrictedPicklist' }},
            { label: 'Tooltip',             type: ocui.Type.TXT, data: { value: 'tooltip' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No tooltip.' }]},
            { label: 'Formula',             type: ocui.Type.TXT, data: { value: 'formula' }, modifiers: [{ maximumLength: 100 }, { preformatted: true }]},
            { label: 'Default Value',       type: ocui.Type.TXT, data: { value: 'defaultValue' }},
            { label: 'Using',               type: ocui.Type.NUM, data: { value: 'dependencies.using.length' }}, // filter: 'dep', 
            { label: 'Referenced in',       type: ocui.Type.NUM, data: { value: 'dependencies.referenced.length' }, modifiers: [{ minimum: 1, valueBeforeMin: 'Not referenced anywhere.' }, { valueIfEmpty: 'N/A' }]}, // filter: 'dep', 
            { label: 'Ref. in Layout?',     type: ocui.Type.NUM, data: { value: `dependencies.referencedByTypes.${PAGELAYOUT}` }}, // filter: 'dep', 
            { label: 'Ref. in Apex Class?', type: ocui.Type.NUM, data: { value: `dependencies.referencedByTypes.${APEXCLASS}` }}, // filter: 'dep', 
            { label: 'Ref. in Flow?',       type: ocui.Type.NUM, data: { value: `dependencies.referencedByTypes.${FLOWVERSION}` }}, // filter: 'dep', 
            { label: 'Dependencies',        type: ocui.Type.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},// filter: 'dep', 
            { label: 'Created date',        type: ocui.Type.DTM, data: { value: 'createdDate' }},// filter: 'noc', 
            { label: 'Modified date',       type: ocui.Type.DTM, data: { value: 'lastModifiedDate' }},// filter: 'noc', 
            { label: 'Description',         type: ocui.Type.TXT, data: { value: 'description' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No description.' }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for standard fields (specific to the current selected object)
     * @type {ocui.TableWithOrdering}
     */
    standardFieldsInObjectTableColumns = {
        columns: [
            { label: 'Score',               type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }}, //filter: 'sco',
            { label: 'Field',               type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'Label',               type: ocui.Type.TXT, data: { value: 'label' }},
            { label: 'Type',                type: ocui.Type.TXT, data: { value: 'type' }},
            { label: 'Length',              type: ocui.Type.TXT, data: { value: 'length' }},
            { label: 'Unique?',             type: ocui.Type.CHK, data: { value: 'isUnique' }},
            { label: 'Encrypted?',          type: ocui.Type.CHK, data: { value: 'isEncrypted' }},
            { label: 'External?',           type: ocui.Type.CHK, data: { value: 'isExternalId' }},
            { label: 'Indexed?',            type: ocui.Type.CHK, data: { value: 'isIndexed' }},
            { label: 'Restricted?',         type: ocui.Type.CHK, data: { value: 'isRestrictedPicklist' }},
            { label: 'Tooltip',             type: ocui.Type.TXT, data: { value: 'tooltip' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No tooltip.' }]},
            { label: 'Formula',             type: ocui.Type.TXT, data: { value: 'formula' }, modifiers: [{ maximumLength: 100 }, { preformatted: true }]},
            { label: 'Default Value',       type: ocui.Type.TXT, data: { value: 'defaultValue' }},
            { label: 'Created date',        type: ocui.Type.DTM, data: { value: 'createdDate' }},// filter: 'noc', 
            { label: 'Modified date',       type: ocui.Type.DTM, data: { value: 'lastModifiedDate' }},// filter: 'noc', 
            { label: 'Description',         type: ocui.Type.TXT, data: { value: 'description' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No description.' }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for custom labels
     * @type {ocui.TableWithOrdering}
     */
    customLabelsTableColumns = {
        columns: [
            { label: 'Score',               type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',                type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',             type: ocui.Type.TXT, data: { value: 'package' }},
            { label: 'Label',               type: ocui.Type.TXT, data: { value: 'label' }},
            { label: 'Category',            type: ocui.Type.TXT, data: { value: 'category' }},
            { label: 'Language',            type: ocui.Type.TXT, data: { value: 'language' }},
            { label: 'Protected?',          type: ocui.Type.CHK, data: { value: 'isProtected' }},
            { label: 'Using',               type: ocui.Type.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',       type: ocui.Type.NUM, data: { value: 'dependencies.referenced.length' }, modifiers: [{ minimum: 1, valueBeforeMin: 'Not referenced anywhere.' }, { valueIfEmpty: 'N/A' }]},
            { label: 'Ref. in Layout?',     type: ocui.Type.NUM, data: { value: `dependencies.referencedByTypes.${PAGELAYOUT}`}},
            { label: 'Ref. in Apex Class?', type: ocui.Type.NUM, data: { value: `dependencies.referencedByTypes.${APEXCLASS}`}},
            { label: 'Ref. in Flow?',       type: ocui.Type.NUM, data: { value: `dependencies.referencedByTypes.${FLOWVERSION}`}},
            { label: 'Dependencies',        type: ocui.Type.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',        type: ocui.Type.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',       type: ocui.Type.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Value',               type: ocui.Type.TXT, data: { value: 'value'}, modifiers: [{ maximumLength: 45 }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for lightning aura components
     * @type {ocui.TableWithOrdering}
     */
    auraComponentsTableColumns = {
        columns: [
            { label: 'Score',         type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',          type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',   type: ocui.Type.NUM, data: { value: 'apiVersion' }, modifiers: [{ valueIfEmpty: 'No version.' }]},
            { label: 'Package',       type: ocui.Type.TXT, data: { value: 'package' }},
            { label: 'Using',         type: ocui.Type.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in', type: ocui.Type.NUM, data: { value: 'dependencies.referenced.length' }, modifiers: [{ minimum: 1, valueBeforeMin: 'Not referenced anywhere.' }, { valueIfEmpty: 'N/A' }]},
            { label: 'Dependencies',  type: ocui.Type.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ocui.Type.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ocui.Type.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',   type: ocui.Type.TXT, data: { value: 'description' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No description.' }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for lightning pages
     * @type {ocui.TableWithOrdering}
     */
    flexiPagesTableColumns = {
        columns: [
            { label: 'Score',         type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',          type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'Type',          type: ocui.Type.TXT, data: { value: 'type' }},
            { label: 'Package',       type: ocui.Type.TXT, data: { value: 'package' }},
            { label: 'Object',        type: ocui.Type.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }, modifiers: [{ valueIfEmpty: 'Not related to an object.' }]}, // filter: 'obj',
            { label: 'Using',         type: ocui.Type.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in', type: ocui.Type.NUM, data: { value: 'dependencies.referenced.length' }, modifiers: [{ minimum: 1, valueBeforeMin: 'Not referenced anywhere.' }, { valueIfEmpty: 'N/A' }]},
            { label: 'Dependencies',  type: ocui.Type.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ocui.Type.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ocui.Type.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',   type: ocui.Type.TXT, data: { value: 'description' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No description.' }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for lightning pages within an SObject
     * @type {ocui.TableWithOrdering}
     */
    flexiPagesInObjectTableColumns = {
        columns: [
            { label: 'Score',         type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',          type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'Type',          type: ocui.Type.TXT, data: { value: 'type' }},
            { label: 'Package',       type: ocui.Type.TXT, data: { value: 'package' }},
            { label: 'Using',         type: ocui.Type.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in', type: ocui.Type.NUM, data: { value: 'dependencies.referenced.length' }, modifiers: [{ minimum: 1, valueBeforeMin: 'Not referenced anywhere.' }, { valueIfEmpty: 'N/A' }]},
            { label: 'Dependencies',  type: ocui.Type.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ocui.Type.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ocui.Type.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',   type: ocui.Type.TXT, data: { value: 'description' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No description.' }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for lightning web components
     * @type {ocui.TableWithOrdering}
     */
    lightningWebComponentsTableColumns = {
        columns: [
            { label: 'Score',         type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',          type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',   type: ocui.Type.NUM, data: { value: 'apiVersion' }, modifiers: [{ valueIfEmpty: 'No version.' }]}, 
            { label: 'Package',       type: ocui.Type.TXT, data: { value: 'package' }},
            { label: 'Using',         type: ocui.Type.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in', type: ocui.Type.NUM, data: { value: 'dependencies.referenced.length' }, modifiers: [{ minimum: 1, valueBeforeMin: 'Not referenced anywhere.' }, { valueIfEmpty: 'N/A' }]},
            { label: 'Dependencies',  type: ocui.Type.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ocui.Type.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ocui.Type.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',   type: ocui.Type.TXT, data: { value: 'description' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No description.' }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for permission sets
     * @type {ocui.TableWithOrdering}
     */
    permissionSetsTableColumns = {
        columns: [
            { label: 'Score',            type: ocui.Type.SCR,  data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',             type: ocui.Type.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Is Group?',        type: ocui.Type.CHK,  data: { value: 'isGroup' }},
            { label: 'Custom',           type: ocui.Type.CHK,  data: { value: 'isCustom' }},
            { label: '#FLSs',            type: ocui.Type.NUM,  data: { value: 'nbFieldPermissions' }, modifiers: [{ maximum: 50, valueAfterMax: '50+' }]},
            { label: '#Object CRUDs',    type: ocui.Type.NUM,  data: { value: 'nbObjectPermissions' }, modifiers: [{ maximum: 50, valueAfterMax: '50+' }]},
            { label: 'Api Enabled',      type: ocui.Type.CHK,  data: { value: 'importantPermissions.apiEnabled' }},
            { label: 'View Setup',       type: ocui.Type.CHK,  data: { value: 'importantPermissions.viewSetup' }},
            { label: 'Modify All Data',  type: ocui.Type.CHK,  data: { value: 'importantPermissions.modifyAllData' }},
            { label: 'View All Data',    type: ocui.Type.CHK,  data: { value: 'importantPermissions.viewAllData' }},
            { label: 'License',          type: ocui.Type.TXT,  data: { value: 'license' }},
            { label: 'Package',          type: ocui.Type.TXT,  data: { value: 'package' }},
            { label: '#Active users',    type: ocui.Type.NUM,  data: { value: 'memberCounts' }, modifiers: [{ minimum: 1, valueBeforeMin: 'No active user!' }]},
            { label: 'Users\' profiles', type: ocui.Type.URLS, data: { values: 'assigneeProfileRefs', value: 'url', label: 'name' }},
            { label: 'Created date',     type: ocui.Type.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',    type: ocui.Type.DTM,  data: { value: 'lastModifiedDate' }},
            { label: 'Description',      type: ocui.Type.TXT,  data: { value: 'description'}, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No description.' }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for permission set licenses
     * @type {ocui.TableWithOrdering}
     */
    permissionSetLicensesTableColumns = {
        columns: [
            { label: 'Score',                 type: ocui.Type.SCR,  data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',                  type: ocui.Type.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Total',                 type: ocui.Type.NUM,  data: { value: 'totalCount' }},
            { label: 'Used',                  type: ocui.Type.NUM,  data: { value: 'usedCount' }},
            { label: 'Used (%)',              type: ocui.Type.PRC,  data: { value: 'usedPercentage' }},
            { label: 'Remaining',             type: ocui.Type.NUM,  data: { value: 'remainingCount' }},
            { label: 'Users Really Assigned', type: ocui.Type.NUM,  data: { value: 'distinctActiveAssigneeCount' }},
            { label: 'Permission Sets',       type: ocui.Type.URLS, data: { values: 'permissionSetRefs', value: 'url', label: 'name' }},
            { label: 'Status',                type: ocui.Type.TXT,  data: { value: 'status' }},
            { label: 'Expiration Date',       type: ocui.Type.DTM,  data: { value: 'expirationDate' }},
            { label: 'For Integration?',      type: ocui.Type.CHK,  data: { value: 'isAvailableForIntegrations' }},
            { label: 'Created date',          type: ocui.Type.DTM,  data: { value: 'createDate' }},
            { label: 'Modified date',         type: ocui.Type.DTM,  data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for profiles
     * @type {ocui.TableWithOrdering}
     */
    profilesTableColumns = {
        columns: [
            { label: 'Score',           type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',            type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'Custom',          type: ocui.Type.CHK, data: { value: 'isCustom' }},
            { label: '#FLSs',           type: ocui.Type.NUM, data: { value: 'nbFieldPermissions' }, modifiers: [{ maximum: 50, valueAfterMax: '50+' }]},
            { label: '#Object CRUDs',   type: ocui.Type.NUM, data: { value: 'nbObjectPermissions' }, modifiers: [{ maximum: 50, valueAfterMax: '50+' }]},           
            { label: 'Api Enabled',     type: ocui.Type.CHK, data: { value: 'importantPermissions.apiEnabled' }},
            { label: 'View Setup',      type: ocui.Type.CHK, data: { value: 'importantPermissions.viewSetup' }},
            { label: 'Modify All Data', type: ocui.Type.CHK, data: { value: 'importantPermissions.modifyAllData' }},
            { label: 'View All Data',   type: ocui.Type.CHK, data: { value: 'importantPermissions.viewAllData' }},
            { label: 'License',         type: ocui.Type.TXT, data: { value: 'license' }},
            { label: 'Package',         type: ocui.Type.TXT, data: { value: 'package' }},
            { label: '#Active users',   type: ocui.Type.NUM, data: { value: 'memberCounts' }, modifiers: [{ minimum: 1, valueBeforeMin: 'No active user!' }, { maximum: 50, valueAfterMax: '50+' }]},
            { label: 'Created date',    type: ocui.Type.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ocui.Type.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',     type: ocui.Type.TXT, data: { value: 'description' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No description.' }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for profile restrictions
     * @type {ocui.TableWithOrdering}
     */
    profileRestrictionsTableColumns = {
        columns: [
            { label: 'Score',           type: ocui.Type.SCR,  data: { value: 'score', id: 'profileRef.id', name: 'profileRef.name' }},
            { label: 'Name',            type: ocui.Type.URL,  data: { value: 'profileRef.url', label: 'profileRef.name' }},
            { label: 'Custom',          type: ocui.Type.CHK,  data: { value: 'profileRef.isCustom' }},
            { label: 'Package',         type: ocui.Type.TXT,  data: { value: 'profileRef.package' }},
            { label: 'Ip Ranges',       type: ocui.Type.OBJS, data: { values: 'ipRanges', value: '{description}: from {startAddress} to {endAddress} --> {difference:numeric} address(es)' }},
            { label: 'Login Hours',     type: ocui.Type.OBJS, data: { values: 'loginHours', value: '{day} from {fromTime} to {toTime} --> {difference:numeric} minute(s)' }},
            { label: 'Description',     type: ocui.Type.TXT,  data: { value: 'profileRef.description' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No description.' }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for profiles password policies
     * @type {ocui.TableWithOrdering}
     */
    profilePasswordPoliciesTableColumns = {
        columns: [
            { label: 'Score',                                     type: ocui.Type.SCR, data: { value: 'score', id: 'profileName', name: 'profileName' }},
            { label: 'Name',                                      type: ocui.Type.TXT, data: { value: 'profileName' }},
            { label: 'User password expires in',                  type: ocui.Type.NUM, data: { value: 'passwordExpiration' }},
            { label: 'Enforce password history',                  type: ocui.Type.NUM, data: { value: 'passwordHistory' }},
            { label: 'Minimum password length',                   type: ocui.Type.NUM, data: { value: 'minimumPasswordLength' }},
            { label: 'Level of complexity (/5)',                  type: ocui.Type.NUM, data: { value: 'passwordComplexity' }},
            { label: 'Question can contain password',             type: ocui.Type.CHK, data: { value: 'passwordQuestion' }},
            { label: 'Maximum Login Attempts',                    type: ocui.Type.NUM, data: { value: 'maxLoginAttempts' }},
            { label: 'Lockout period',                            type: ocui.Type.NUM, data: { value: 'lockoutInterval' }},
            { label: 'Require minimum one day password lifetime', type: ocui.Type.CHK, data: { value: 'minimumPasswordLifetime' }},
            { label: 'Security Question Hidden',                  type: ocui.Type.CHK, data: { value: 'obscure' }},
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for public groups
     * @type {ocui.TableWithOrdering}
     */
    publicGroupsTableColumns = {
        columns: [
            { label: 'Score',                  type: ocui.Type.SCR,  data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',                   type: ocui.Type.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Developer Name',         type: ocui.Type.TXT,  data: { value: 'developerName' }},
            { label: 'With bosses?',           type: ocui.Type.CHK,  data: { value: 'includeBosses' }},
            { label: '#Explicit members',      type: ocui.Type.NUM,  data: { value: 'nbDirectMembers' }},
            { label: 'Explicit groups',        type: ocui.Type.URLS, data: { values: 'directGroupRefs', value: 'url', label: 'name' }}, //label: (g) => `${g.name} (${g.type}${g.includeBosses?' with bosses ':''}${g.includeSubordinates?' with subordinates':''})` }},
            { label: 'Explicit users',         type: ocui.Type.URLS, data: { values: 'directUserRefs', value: 'url', label: 'name' }}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for queues
     * @type {ocui.TableWithOrdering}
     */
    queuesTableColumns = {
        columns: [
            { label: 'Score',                  type: ocui.Type.SCR,  data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',                   type: ocui.Type.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Developer Name',         type: ocui.Type.TXT,  data: { value: 'developerName' }},
            { label: 'With bosses?',           type: ocui.Type.CHK,  data: { value: 'includeBosses' }},
            { label: '#Explicit members',      type: ocui.Type.NUM,  data: { value: 'nbDirectMembers' }},
            { label: 'Explicit groups',        type: ocui.Type.URLS, data: { values: 'directGroupRefs', value: 'url', label: 'name' }}, //label: (g) => `${g.name} (${g.type}${g.includeBosses?' with bosses ':''}${g.includeSubordinates?' with subordinates':''})` }},
            { label: 'Explicit users',         type: ocui.Type.URLS, data: { values: 'directUserRefs', value: 'url', label: 'name' }}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for active internal users
     * @type {ocui.TableWithOrdering}
     */
    usersTableColumns = {
        columns: [
            { label: 'Score',                        type: ocui.Type.SCR,  data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'User Name',                    type: ocui.Type.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Under LEX?',                   type: ocui.Type.CHK,  data: { value: 'onLightningExperience' }},
            { label: 'Last login',                   type: ocui.Type.DTM,  data: { value: 'lastLogin' }, modifiers: [{ valueIfEmpty: 'Never logged!' }]},
            { label: 'Failed logins',                type: ocui.Type.NUM,  data: { value: 'numberFailedLogins' }},
            { label: 'Password change',              type: ocui.Type.DTM,  data: { value: 'lastPasswordChange' }},
            { label: 'Api Enabled',                  type: ocui.Type.CHK,  data: { value: 'apiEnabled' }},
            { label: 'Api Enabled granted from',     type: ocui.Type.URLS, data: { values: 'aggregateImportantPermissions.apiEnabled', value: 'url', label: 'name' }},
            { label: 'View Setup',                   type: ocui.Type.CHK,  data: { value: 'viewSetup' }},
            { label: 'View Setup granted from',      type: ocui.Type.URLS, data: { values: 'aggregateImportantPermissions.viewSetup', value: 'url', label: 'name' }},
            { label: 'Modify All Data',              type: ocui.Type.CHK,  data: { value: 'modifyAllData' }},
            { label: 'Modify All Data granted from', type: ocui.Type.URLS, data: { values: 'aggregateImportantPermissions.modifyAllData', value: 'url', label: 'name' }},
            { label: 'View All Data',                type: ocui.Type.CHK,  data: { value: 'viewAllData' }},
            { label: 'View All Data granted from',   type: ocui.Type.URLS, data: { values: 'aggregateImportantPermissions.viewAllData', value: 'url', label: 'name' }},
            { label: 'Profile',                      type: ocui.Type.URL,  data: { value: 'profileRef.url', label: 'profileRef.name' }},
            { label: 'Permission Sets',              type: ocui.Type.URLS, data: { values: 'permissionSetRefs', value: 'url', label: 'name' }}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for visualforce components
     * @type {ocui.TableWithOrdering}
     */
    visualForceComponentsTableColumns = {
        columns: [
            { label: 'Score',         type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',          type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',   type: ocui.Type.NUM, data: { value: 'apiVersion' }, modifiers: [{ valueIfEmpty: 'No version.' }]},
            { label: 'Package',       type: ocui.Type.TXT, data: { value: 'package' }},
            { label: 'Using',         type: ocui.Type.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in', type: ocui.Type.NUM, data: { value: 'dependencies.referenced.length' }, modifiers: [{ minimum: 1, valueBeforeMin: 'Not referenced anywhere.' }, { valueIfEmpty: 'N/A' }]},
            { label: 'Dependencies',  type: ocui.Type.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ocui.Type.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ocui.Type.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',   type: ocui.Type.TXT, data: { value: 'description'}, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No description.' }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for visualforce pages
     * @type {ocui.TableWithOrdering}
     */
    visualForcePagesTableColumns = {
        columns: [
            { label: 'Score',         type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',          type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',   type: ocui.Type.NUM, data: { value: 'apiVersion' }, modifiers: [{ valueIfEmpty: 'No version.' }]},
            { label: 'Mobile',        type: ocui.Type.CHK, data: { value: 'isMobileReady' }},
            { label: 'Package',       type: ocui.Type.TXT, data: { value: 'package' }},
            { label: 'Using',         type: ocui.Type.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in', type: ocui.Type.NUM, data: { value: 'dependencies.referenced.length' }, modifiers: [{ minimum: 1, valueBeforeMin: 'Not referenced anywhere.' }, { valueIfEmpty: 'N/A' }]},
            { label: 'Dependencies',  type: ocui.Type.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ocui.Type.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ocui.Type.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',   type: ocui.Type.TXT, data: { value: 'description' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No description.' }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for apex classes (compiled and not tests)
     * @type {ocui.TableWithOrdering}
     */
    apexClassesTableColumns = {
        columns: [
            { label: 'Score',           type: ocui.Type.SCR,  data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',            type: ocui.Type.URL,  data: { value: 'url', label: 'name' }},
            { label: 'API Version',     type: ocui.Type.NUM,  data: { value: 'apiVersion' }, modifiers: [{ valueIfEmpty: 'No version.' }]},
            { label: 'Package',         type: ocui.Type.TXT,  data: { value: 'package' }},
            { label: 'Class',           type: ocui.Type.CHK,  data: { value: 'isClass' }},
            { label: 'Abst.',           type: ocui.Type.CHK,  data: { value: 'isAbstract' }},
            { label: 'Intf.',           type: ocui.Type.CHK,  data: { value: 'isInterface' }},
            { label: 'Enum',            type: ocui.Type.CHK,  data: { value: 'isEnum' }},
            { label: 'Schdl.',          type: ocui.Type.CHK,  data: { value: 'isSchedulable' }},
            { label: 'Access',          type: ocui.Type.TXT,  data: { value: 'specifiedAccess' }},
            { label: 'Implements',      type: ocui.Type.TXTS, data: { values: 'interfaces' }},
            { label: 'Extends',         type: ocui.Type.TXT,  data: { value: 'extends' }},
            { label: 'Size',            type: ocui.Type.NUM,  data: { value: 'length' }},
            { label: 'Methods',         type: ocui.Type.NUM,  data: { value: 'methodsCount' }},
            { label: 'Inner Classes',   type: ocui.Type.NUM,  data: { value: 'innerClassesCount' }},
            { label: 'Annotations',     type: ocui.Type.TXTS, data: { values: 'annotations.name' }},
            { label: 'Sharing',         type: ocui.Type.TXT,  data: { value: 'specifiedSharing' }, modifiers: [{ valueIfEmpty: 'Not specified.' }]},
            { label: 'Scheduled',       type: ocui.Type.CHK,  data: { value: 'isScheduled' }},
            { label: 'Coverage (>75%)', type: ocui.Type.PRC,  data: { value: 'coverage' }, modifiers: [{ valueIfEmpty: 'No coverage!' }]},
            { label: 'Related Tests',   type: ocui.Type.URLS, data: { values: 'relatedTestClassRefs', value: 'url', label: 'name' }},
            { label: 'Using',           type: ocui.Type.NUM,  data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',   type: ocui.Type.NUM,  data: { value: 'dependencies.referenced.length' }, modifiers: [{ minimum: 1, valueBeforeMin: 'Not referenced anywhere.' }, { valueIfEmpty: 'N/A' }]},
            { label: 'Dependencies',    type: ocui.Type.DEP,  data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',    type: ocui.Type.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ocui.Type.DTM,  data: { value: 'lastModifiedDate' }}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for uncompiled apex classes
     * @type {ocui.TableWithOrdering}
     */    
    apexUncompiledTableColumns = {
        columns: [
            { label: 'Score',           type: ocui.Type.SCR,  data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',            type: ocui.Type.URL,  data: { value: 'url', label: 'name' }},
            { label: 'API Version',     type: ocui.Type.NUM,  data: { value: 'apiVersion' }, modifiers: [{ valueIfEmpty: 'No version.' }]},
            { label: 'Package',         type: ocui.Type.TXT,  data: { value: 'package' }},
            { label: 'Size',            type: ocui.Type.NUM,  data: { value: 'length' }},
            { label: 'Coverage (>75%)', type: ocui.Type.PRC,  data: { value: 'coverage' }, modifiers: [{ valueIfEmpty: 'No coverage!' }]},
            { label: 'Related Tests',   type: ocui.Type.URLS, data: { values: 'relatedTestClassRefs', value: 'url', label: 'name' }},
            { label: 'Using',           type: ocui.Type.NUM,  data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',   type: ocui.Type.NUM,  data: { value: 'dependencies.referenced.length' }, modifiers: [{ minimum: 1, valueBeforeMin: 'Not referenced anywhere.' }, { valueIfEmpty: 'N/A' }]},
            { label: 'Dependencies',    type: ocui.Type.DEP,  data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',    type: ocui.Type.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ocui.Type.DTM,  data: { value: 'lastModifiedDate' }}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for apex triggers
     * @type {ocui.TableWithOrdering}
     */
    apexTriggersTableColumns = {
        columns: [
            { label: 'Score',         type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',          type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',   type: ocui.Type.NUM, data: { value: 'apiVersion' }, modifiers: [{ valueIfEmpty: 'No version.' }]},
            { label: 'Package',       type: ocui.Type.TXT, data: { value: 'package' }},
            { label: 'Size',          type: ocui.Type.NUM, data: { value: 'length' }},
            { label: 'Object',        type: ocui.Type.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }}, // filter: 'nob'
            { label: 'Active?',       type: ocui.Type.CHK, data: { value: 'isActive' }},
            { label: 'Has SOQL?',     type: ocui.Type.CHK, data: { value: 'hasSOQL' }},
            { label: 'Has DML?',      type: ocui.Type.CHK, data: { value: 'hasDML' }},
            { label: '*Insert',       type: ocui.Type.CHK, data: { value: 'beforeInsert' }},
            { label: 'Insert*',       type: ocui.Type.CHK, data: { value: 'afterInsert' }},
            { label: '*Update',       type: ocui.Type.CHK, data: { value: 'beforeUpdate' }},
            { label: 'Update*',       type: ocui.Type.CHK, data: { value: 'afterUpdate' }},
            { label: '*Delete',       type: ocui.Type.CHK, data: { value: 'beforeDelete' }},
            { label: 'Delete*',       type: ocui.Type.CHK, data: { value: 'afterDelete' }},
            { label: 'Undelete',      type: ocui.Type.CHK, data: { value: 'afterUndelete' }},
            { label: 'Using',         type: ocui.Type.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Dependencies',  type: ocui.Type.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ocui.Type.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ocui.Type.DTM, data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for apex triggers within SObject
     * @type {ocui.TableWithOrdering}
     */
    apexTriggersInObjectTableColumns =  {
        columns: [
            { label: 'Score',         type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',          type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',   type: ocui.Type.NUM, data: { value: 'apiVersion' }, modifiers: [{ valueIfEmpty: 'No version.' }]},
            { label: 'Package',       type: ocui.Type.TXT, data: { value: 'package' }},
            { label: 'Size',          type: ocui.Type.NUM, data: { value: 'length' }},
            { label: 'Active?',       type: ocui.Type.CHK, data: { value: 'isActive' }},
            { label: 'Has SOQL?',     type: ocui.Type.CHK, data: { value: 'hasSOQL' }},
            { label: 'Has DML?',      type: ocui.Type.CHK, data: { value: 'hasDML' }},
            { label: '*Insert',       type: ocui.Type.CHK, data: { value: 'beforeInsert' }},
            { label: 'Insert*',       type: ocui.Type.CHK, data: { value: 'afterInsert' }},
            { label: '*Update',       type: ocui.Type.CHK, data: { value: 'beforeUpdate' }},
            { label: 'Update*',       type: ocui.Type.CHK, data: { value: 'afterUpdate' }},
            { label: '*Delete',       type: ocui.Type.CHK, data: { value: 'beforeDelete' }},
            { label: 'Delete*',       type: ocui.Type.CHK, data: { value: 'afterDelete' }},
            { label: 'Undelete',      type: ocui.Type.CHK, data: { value: 'afterUndelete' }},
            { label: 'Using',         type: ocui.Type.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Dependencies',  type: ocui.Type.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ocui.Type.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ocui.Type.DTM, data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for apex classes that are tests
     * @type {ocui.TableWithOrdering}
     */
    apexTestsTableColumns = {
        columns: [
            { label: 'Score',           type: ocui.Type.SCR,  data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',            type: ocui.Type.URL,  data: { value: 'url', label: 'name' }},
            { label: 'API Version',     type: ocui.Type.NUM,  data: { value: 'apiVersion' }, modifiers: [{ valueIfEmpty: 'No version.' }]},
            { label: 'Package',         type: ocui.Type.TXT,  data: { value: 'package' }},
            { label: 'Size',            type: ocui.Type.NUM,  data: { value: 'length' }},
            { label: 'Nb Asserts',      type: ocui.Type.NUM,  data: { value: 'nbSystemAsserts' }, modifiers: [{ valueIfEmpty: 'No direct usage of Assert.Xxx() or System.assertXxx().'}]},
            { label: 'Methods',         type: ocui.Type.NUM,  data: { value: 'methodsCount' }},
            { label: 'Latest Run Date', type: ocui.Type.DTM,  data: { value: 'lastTestRunDate' }},
            { label: 'Runtime',         type: ocui.Type.NUM,  data: { value: 'testMethodsRunTime' }},
            { label: 'Passed methods',  type: ocui.Type.OBJS, data: { values: 'testPassedMethods', value: '{methodName} ({runtime} ms)' }},
            { label: 'Failed methods',  type: ocui.Type.OBJS, data: { values: 'testFailedMethods', value: '{methodName} ({stacktrace})' }},
            { label: 'Inner Classes',   type: ocui.Type.NUM,  data: { value: 'innerClassesCount' }},
            { label: 'Sharing',         type: ocui.Type.TXT,  data: { value: 'specifiedSharing' }, modifiers: [{ valueIfEmpty: 'Not specified.'}]},
            { label: 'Covering',        type: ocui.Type.URLS, data: { values: 'relatedClassRefs', value: 'url', label: 'name' }},
            { label: 'Using',           type: ocui.Type.NUM,  data: { value: 'dependencies.using.length' }},
            { label: 'Dependencies',    type: ocui.Type.DEP,  data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',    type: ocui.Type.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ocui.Type.DTM,  data: { value: 'lastModifiedDate' }}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for SObject Org Wide Default
     * @type {ocui.TableWithOrdering}
     */
    owdTableColumns = {
        columns: [
            { label: 'Label',     type: ocui.Type.TXT, data: { value: 'label' }},
            { label: 'Name',      type: ocui.Type.TXT, data: { value: 'name' }},
            { label: 'Package',   type: ocui.Type.TXT, data: { value: 'package' }},
            { label: 'Internal',  type: ocui.Type.TXT, data: { value: 'internalSharingModel' }},
            { label: 'External',  type: ocui.Type.TXT, data: { value: 'externalSharingModel' }}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.ASC
    };

    /**
     * @description Table for flows
     * @type {ocui.TableWithOrdering}
     */
    flowsTableColumns = {
        columns: [
            { label: 'Score',              type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',               type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',        type: ocui.Type.NUM, data: { value: 'apiVersion' }, modifiers: [{ valueIfEmpty: 'No version.' }]},
            { label: 'Type',               type: ocui.Type.TXT, data: { value: 'type' }},
            { label: 'Created date',       type: ocui.Type.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',      type: ocui.Type.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',        type: ocui.Type.TXT, data: { value: 'description' }, modifiers: [{ maximumLength: 45, valueIfEmpty: 'No description.' }]},
            { label: 'Number of versions', type: ocui.Type.NUM, data: { value: 'versionsCount' }},
            { label: 'Current Version',    type: ocui.Type.URL, data: { value: 'currentVersionRef.url', label: 'currentVersionRef.name' }},
            { label: 'Is it Active?',      type: ocui.Type.CHK, data: { value: 'isVersionActive' }},
            { label: 'Is it the Latest?',  type: ocui.Type.CHK, data: { value: 'isLatestCurrentVersion' }},
            { label: 'Its Running Mode',   type: ocui.Type.TXT, data: { value: 'currentVersionRef.runningMode' }, modifiers: [{ valueIfEmpty: 'No mode specified.' }]},
            { label: 'Its API Version',    type: ocui.Type.NUM, data: { value: 'currentVersionRef.apiVersion' }, modifiers: [{ valueIfEmpty: 'No version.' }]},
            { label: '# Nodes',            type: ocui.Type.NUM, data: { value: 'currentVersionRef.totalNodeCount' }},
            { label: '# DML Create Nodes', type: ocui.Type.NUM, data: { value: 'currentVersionRef.dmlCreateNodeCount' }},
            { label: '# DML Delete Nodes', type: ocui.Type.NUM, data: { value: 'currentVersionRef.dmlDeleteNodeCount' }},
            { label: '# DML Update Nodes', type: ocui.Type.NUM, data: { value: 'currentVersionRef.dmlUpdateNodeCount' }},
            { label: '# Screen Nodes',     type: ocui.Type.NUM, data: { value: 'currentVersionRef.screenNodeCount' }},
            { label: 'Its Created date',   type: ocui.Type.DTM, data: { value: 'currentVersionRef.createdDate' }},
            { label: 'Its Modified date',  type: ocui.Type.DTM, data: { value: 'currentVersionRef.lastModifiedDate' }},
            { label: 'Its Description',    type: ocui.Type.TXT, data: { value: 'currentVersionRef.description' }, modifiers: [{ maximumLength: 45, valueIfEmpty: 'No description.' }]},
            { label: 'Using',              type: ocui.Type.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',      type: ocui.Type.NUM, data: { value: 'dependencies.referenced.length' }, modifiers: [{ minimum: 1, valueBeforeMin: 'Not referenced anywhere.' }, { valueIfEmpty: 'N/A' }]},
            { label: 'Dependencies',       type: ocui.Type.DEP, data: { value: 'dependencies', id: 'currentVersionId', name: 'name' }}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for process builders
     * @type {ocui.TableWithOrdering}
     */
    processBuildersTableColumns = this.flowsTableColumns;
    
    /**
     * @description Table for workflows
     * @type {ocui.TableWithOrdering}
     */
    workflowsTableColumns = {
        columns: [
            { label: 'Score',             type: ocui.Type.SCR,  data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',              type: ocui.Type.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Is Active',         type: ocui.Type.CHK,  data: { value: 'isActive' }},
            { label: 'Has Actions',       type: ocui.Type.CHK,  data: { value: 'hasAction' }},
            { label: 'Direct Actions',    type: ocui.Type.OBJS, data: { values: 'actions', value: '{name} ({type})' }},
            { label: 'Empty Timetrigger', type: ocui.Type.OBJS, data: { values: 'emptyTimeTriggers', value: '{field} after {delay}' }},
            { label: 'Future Actions',    type: ocui.Type.OBJS, data: { values: 'futureActions', value: '{field} after {delay}: {name} ({type})' }},
            { label: 'Created date',      type: ocui.Type.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',     type: ocui.Type.DTM,  data: { value: 'lastModifiedDate' }},
            { label: 'Description',       type: ocui.Type.TXT,  data: { value: 'description' }, modifiers: [{ maximumLength: 45 }, { valueIfEmpty: 'No description.' }]}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for roles
     * @type {ocui.TableWithOrdering}
     */
    rolesTableColumns = {
        columns: [
            { label: 'Score',                       type: ocui.Type.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Name',                        type: ocui.Type.URL, data: { value: 'url', label: 'name' }},
            { label: 'Developer Name',              type: ocui.Type.TXT, data: { value: 'apiname' }},
            { label: 'Number of active members',    type: ocui.Type.NUM, data: { value: 'activeMembersCount' }},
            { label: 'Number of inactive members',  type: ocui.Type.NUM, data: { value: 'inactiveMembersCount' }},
            { label: 'Parent',                      type: ocui.Type.URL, data: { value: 'parentRef.url', label: 'parentRef.name' }}
        ],
        orderIndex: 0,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for object permissions
     * @type {ocui.Table}
     */
    get objectPermissionsTableColumns() {
        /** @type {ocui.TableWithOrdering} */
        const table = {
            columns: [
                { label: 'Parent',  type: ocui.Type.URL, data: { value: 'header.url', label: 'header.name' }},
                { label: 'Package', type: ocui.Type.TXT, data: { value: 'header.package' }},
                { label: 'Type',    type: ocui.Type.TXT, data: { value: 'header.type' }},
                { label: 'Custom',  type: ocui.Type.CHK, data: { value: 'header.isCustom' }}
            ],
            orderIndex: 0,
            orderSort: ocui.SortOrder.ASC
        };
        if (this._internalObjectPermissionsDataMatrix) {
            this._internalObjectPermissionsDataMatrix.columnHeaders // returns an array of string representing Object Api names
                .sort()
                .forEach((/** @type {string} */ objectApiName) => {
                    table.columns.push({ label: objectApiName, type: ocui.Type.TXT, data: { value: `data.${objectApiName}` }, orientation: ocui.Orientation.VERTICAL });
                });
        }
        return table;
    }

    /**
     * @description Table for application permissions
     * @type {ocui.Table}
     */
    get appPermissionsTableColumns() {
        /** @type {ocui.TableWithOrdering} */
        const table = {
            columns: [
                { label: 'Parent',  type: ocui.Type.URL, data: { value: 'header.url', label: 'header.name' }},
                { label: 'Package', type: ocui.Type.TXT, data: { value: 'header.package' }},
                { label: 'Type',    type: ocui.Type.TXT, data: { value: 'header.type' }},
                { label: 'Custom',  type: ocui.Type.CHK, data: { value: 'header.isCustom' }}
            ],
            orderIndex: 0,
            orderSort: ocui.SortOrder.ASC
        };
        if (this._internalAppPermissionsDataMatrix) {
            this._internalAppPermissionsDataMatrix.columnHeaders // returns an array of Object like {id: string, label: string} representing an Application
                .sort((/** @type {{id: string, label: string}} */ a, /** @type {{id: string, label: string}} */b) => { 
                    return a.label < b.label ? -1: 1; 
                })
                .forEach((/** @type {{id: string, label: string}} */ app) => {
                    table.columns.push({ label: app.label, type: ocui.Type.TXT, data: { value: `data.${app.id}` }, orientation: ocui.Orientation.VERTICAL });
                });
        }
        return table;
    }
    
    /**
     * @description Table for field permissions
     * @type {ocui.Table}
     */
    get fieldPermissionsTableColumns() {
        /** @type {ocui.TableWithOrdering} */
        const table = {
            columns: [
                { label: 'Parent',  type: ocui.Type.URL, data: { value: 'header.url', label: 'header.name' }},
                { label: 'Package', type: ocui.Type.TXT, data: { value: 'header.package' }},
                { label: 'Type',    type: ocui.Type.TXT, data: { value: 'header.type' }},
                { label: 'Custom',  type: ocui.Type.CHK, data: { value: 'header.isCustom' }}
            ],
            orderIndex: 0,
            orderSort: ocui.SortOrder.ASC
        };
        if (this._internalFieldPermissionsDataMatrix) {
            this._internalFieldPermissionsDataMatrix.columnHeaders // returns an array of string representing Field Api names
                .sort()
                .forEach((/** @type {string} */ fieldApiName) => {
                    table.columns.push({ label: fieldApiName, type: ocui.Type.TXT, data: { value: `data.${fieldApiName}` }, orientation: ocui.Orientation.VERTICAL });
                });
        }
        return table;
    }

    /**
     * @description Table for score rules
     * @type {ocui.Table}
     */
    get scoreRulesTableColumns() {
        /** @type {ocui.Table} */
        const table = {
            columns: [
                { label: '#',    type: ocui.Type.NUM, data: { value: 'header.id' }},
                { label: 'Name', type: ocui.Type.TXT, data: { value: 'header.description' }} 
            ]
        };
        if (this._internalAllScoreRulesDataMatrix) {
            this._internalAllScoreRulesDataMatrix.columnHeaders // returns an array of string representing the static 'label' of the org check class
                .sort()
                .forEach((/** @type {string} */ classLabel) => {
                    table.columns.push({ label: classLabel, type: ocui.Type.CHK, data: { value: `data.${classLabel}` }, orientation: ocui.Orientation.VERTICAL });
                });
        }
        return table;
    };
    

    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Decoration for Role Hierarchy graphic view
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /** 
     * @description Legend for the role hierarchy graphic view
     * @type {Array<{color: string, name: string}>}
     * @public
     */
    roleBoxColorsLegend = [
        { color: '#2f89a8', name: 'Root' },
        { color: '#fdc223', name: 'Empty role (no active user)' },
        { color: '#5fc9f8', name: 'Role with active members' }
    ];

    /** 
     * @description Color decorator for the role hierarchy graphic view.
     * @param {number} depth The depth of the current role in the hierarchy
     * @param {any} data The data of the current role
     * @returns {number} The index of the color in the legend
     * @public
     */
    roleBoxColorsDecorator = (depth, data) => {
        if (depth === 0) return 0; // root
        if (data.record.hasActiveMembers === false) return 1; // empty role
        return 2; // role with active members
    };

    /**
     * @description Inner HTML decorator for the role hierarchy graphic view
     * @param {number} depth The depth of the current role in the hierarchy
     * @param {any} data The data of the current role
     * @returns {string} The inner HTML to display in the role box
     * @public
     */
    roleBoxInnerHtmlDecorator = (depth, data) => {
        if (depth === 0) return `<center><b>Role Hierarchy</b></center>`;
        return `<center><b>${data.record.name}</b><br />${data.record.apiname}</center>`;
    }

    /** 
     * @description Decorator for the Pop-Up dialog when clikcing in a role box
     * @param {number} depth The depth of the current role in the hierarchy
     * @param {any} data The data of the current role
     * @returns {string} The inner HTML to display in the pop-up box
     * @public
     */ 
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





    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Decoration for Global View 
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    pieCategoriesDecorator = (data) => {
        if (data) {
            const all = data.length;
            const badOnes = data.filter((d) => d?.score > 0).length;
            const goodOnes = all - badOnes;
            return [ 
                { name: 'Bad',  value: badOnes,  color: 'red' }, 
                { name: 'Good', value: goodOnes, color: 'green' } 
            ];
        };
    }

    _colors = ['#2f89a8', '#fdc223', '#5fc9f8', '#f8b195', '#f67280', '#c06c84', '#6c5b7b', '#355c7d', '#b56576', '#f8b195', '#f67280', '#c06c84', '#6c5b7b', '#355c7d', '#b56576'];

    pieCategoriesDecorator2 = (data) => {
        if (data) {
            const series = new Map();
            data.forEach((d) => { 
                d.badReasonIds.forEach(id => {
                    series.set(id, series.has(id) ? (series.get(id) + 1) : 1);
                });
            });
            return Array.from(series.keys()).map((id, index) => { return { 
                name: this._api.getScoreRule(id).description, value: series.get(id), 'color': this._colors[index]
            }});
        };
    }





    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Export structure for objects (which is needed because multiple tables) and global view
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description Representation of an export for SObject Description data
     * @type {Array<{header: string, tableDefinition: ocui.Table, rows: Array<{label: string, value: any}>}>}
     */
    get objectInformationExportSource() {
        return [
            { 
                header: 'General information',
                tableDefinition: {
                    columns: [
                        { label: 'Label', type: ocui.Type.TXT, data: { value: 'label' }},  
                        { label: 'Value', type: ocui.Type.TXT, data: { value: 'value' }}
                    ]
                }, 
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
                ] },
            { header: 'Standard Fields',  tableDefinition: this.standardFieldsInObjectTableColumns,  rows: this.objectData.standardFields },
            { header: 'Custom Fields',    tableDefinition: this.customFieldsInObjectTableColumns,    rows: this.objectData.customFieldRefs },
            { header: 'Apex Triggers',    tableDefinition: this.apexTriggersTableColumns,            rows: this.objectData.apexTriggerRefs },
            { header: 'Field Sets',       tableDefinition: this.fieldSetsTableColumns,               rows: this.objectData.fieldSets },
            { header: 'Page Layouts',     tableDefinition: this.layoutsTableColumns,                 rows: this.objectData.layouts },
            { header: 'Lightning Pages',  tableDefinition: this.flexiPagesInObjectTableColumns,      rows: this.objectData.flexiPages },
            { header: 'Limits',           tableDefinition: this.limitsTableColumns,                  rows: this.objectData.limits },
            { header: 'Validation Rules', tableDefinition: this.validationRulesInObjectTableColumns, rows: this.objectData.validationRules },
            { header: 'Web Links',        tableDefinition: this.webLinksTableColumns,                rows: this.objectData.webLinks },
            { header: 'Record Types',     tableDefinition: this.recordTypesTableColumns,             rows: this.objectData.recordTypes },
            { header: 'Relationships',    tableDefinition: this.relationshipsTableColumns,           rows: this.objectData.relationships }
        ];
    }

    get globalViewItemsExport() {
        try {
            return Object.keys(this._internalTransformers)
                .filter((/** @type {string} */ recipe) => this._internalTransformers[recipe].isGlobalView)
                .map((/** @type {string} */ recipe) => { 
                    const transfomer = this._internalTransformers[recipe]; 
                    return { 
                        header: transfomer.label, 
                        tableDefinition: this[transfomer.data.replace(/Data$/, 'Columns')].map((c) => { 
                            return { 
                                label: c.label, 
                                ref: c.data.ref, // if any
                                type: c.type,
                                field: c.data.value 
                            };
                        }),
                        rows: this[transfomer.data]
                    };
            });
        } catch (error) {
            return [];
        }
    }
    







    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // All tables in the app
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /** 
     * @description Data table for Org Wide default in the org 
     * @type {Array<ocapi.SFDC_Object>}
     */
    objectsTableData;

    /** 
     * @description Data table for Org Wide default in the org 
     * @type {ocapi.SFDC_Object}
     */
    objectData;

    /** 
     * @description Data table for custom fields 
     * @type {Array<ocapi.SFDC_Field>}
     */
    customFieldsTableData;

    /** 
     * @description Data table for custom labels 
     * @type {Array<ocapi.SFDC_CustomLabel>}
     */
    customLabelsTableData;

    /** 
     * @description Data table for lightning aura components 
     * @type {Array<ocapi.SFDC_LightningAuraComponent>}
     */
    auraComponentsTableData;

    /** 
     * @description Data table for lightning pages 
     * @type {Array<ocapi.SFDC_LightningPage>}
     */
    flexiPagesTableData;

    /** 
     * @description Data table for lightning web components 
     * @type {Array<ocapi.SFDC_LightningWebComponent>}
     */
    lightningWebComponentsTableData;

    /** 
     * @description Data table for permission sets
     * @type {Array<ocapi.SFDC_PermissionSet>}
     */
    permissionSetsTableData;

    /** 
     * @description Data table for permission set licenses
     * @type {Array<ocapi.SFDC_PermissionSetLicense>}
     */
    permissionSetLicensesTableData;

    /** 
     * @description Data table for profiles
     * @type {Array<ocapi.SFDC_Profile>}
     */
    profilesTableData;

    /** 
     * @description Data table for profile restrictions 
     * @type {Array<ocapi.SFDC_ProfileRestrictions>}
     */
    profileRestrictionsTableData;

    /** 
     * @description Data table for profile password policies 
     * @type {Array<ocapi.SFDC_ProfilePasswordPolicy>}
     */
    profilePasswordPoliciesTableData;

    /** 
     * @description Data table for process builders 
     * @type {Array<ocapi.SFDC_Group>}
     */
    publicGroupsTableData;

    /** 
     * @description Data table for queues
     * @type {Array<ocapi.SFDC_Group>}
     */
    queuesTableData;

    /** 
     * @description Data table for active users 
     * @type {Array<ocapi.SFDC_User>}
     */
    usersTableData;

    /**
     * @description Data table for validation rules
     * @type {Array<ocapi.SFDC_ValidationRule>}
     */ 
    validationRulesTableData;

    /** 
     * @description Data table for visualforce components 
     * @type {Array<ocapi.SFDC_VisualForceComponent>}
     */
    visualForceComponentsTableData;

    /** 
     * @description Data table for visualforce pages
     * @type {Array<ocapi.SFDC_VisualForcePage>}
     */
    visualForcePagesTableData;

    /** 
     * @description Data table for apex classes (compiled and not unit test)
     * @type {Array<ocapi.SFDC_ApexClass>}
     */
    apexClassesTableData;

    /** 
     * @description Data table for uncompiled apex classes
     * @type {Array<ocapi.SFDC_ApexClass>}
     */
    apexUncompiledTableData;

    /** 
     * @description Data table for apex triggers
     * @type {Array<ocapi.SFDC_ApexTrigger>}
     */
    apexTriggersTableData;

    /** 
     * @description Data table for apex classes that are unit tests 
     * @type {Array<ocapi.SFDC_ApexClass>}
     */
    apexTestsTableData;

    /** 
     * @description Data table for internal user roles 
     * @type {Array<ocapi.SFDC_UserRole>}
     */
    rolesTableData;

    /** 
     * @description Top level user role tree, where each record may have children.
     * @type {ocapi.SFDC_UserRole}
     */
    rolesTree;

    /** 
     * @description Data table for flows 
     * @type {Array<ocapi.SFDC_Flow>}
     */
    flowsTableData;

    /** 
     * @description Data table for process builders 
     * @type {Array<ocapi.SFDC_Flow>}
     */
    processBuildersTableData;

    /** 
     * @description Data table for workflows 
     * @type {Array<ocapi.SFDC_Workflow>}
     */
    workflowsTableData;

    /**
     * @description Data matrix for object permissions
     * @type {ocapi.DataMatrix}
     */ 
    _internalObjectPermissionsDataMatrix;

    /**
     * @description Data table for object permissions
     * @type {Array}
     */ 
    get objectPermissionsTableData() {
        return this._internalObjectPermissionsDataMatrix?.rows || [];
    }

    /**
     * @description Data matrix for application permissions
     * @type {ocapi.DataMatrix}
     */ 
    _internalAppPermissionsDataMatrix;

    /**
     * @description Data table for application permissions
     * @type {Array}
     */ 
    get appPermissionsTableData() {
        return this._internalAppPermissionsDataMatrix?.rows || [];
    }

    /**
     * @description Data matrix for field permissions
     * @type {ocapi.DataMatrix}
     */ 
    _internalFieldPermissionsDataMatrix;

    /**
     * @description Data table for field permissions
     * @type {Array}
     */ 
    get fieldPermissionsTableData() {
        return this._internalFieldPermissionsDataMatrix?.rows || [];
    }

    /**
     * @description Data matrix for all score rules
     * @type {ocapi.DataMatrix}
     */ 
    _internalAllScoreRulesDataMatrix;

    /** 
     * @description Data table for all score rules
     * @type {Array}
     */
    get allScoreRulesTableData() {
        return this._internalAllScoreRulesDataMatrix?.rows || [];
    }
}