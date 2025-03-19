import { LightningElement, api } from 'lwc';
import OrgCheckStaticResource from '@salesforce/resourceUrl/OrgCheck_SR';
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
    logoURL = OrgCheckStaticResource + '/img/Logo.svg';

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
     * @description True if the content of the next tab is being loaded
     * @type {boolean}
     * @public
     */
    tabLoading = false;

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
    cacheManagerData = [];

    /**
     * @description Is the export button for Global View is shown or not
     * @type {boolean}
     * @public
     */
    showGlobalViewExportButton = false;

    /**
     * @description Current activated tab in the main tab set
     * @type {string}
     * @oublic
     */
    selectedMainTab;

    /**
     * @description Current activated tab in one of the sub tab sets
     * @type {string}
     * @public
     */
    selectedSubTab;

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
     * @type {Array<{label: string, dataTable: Array<any>, tab: string}>}
     */ 
    get globalViewItems() {
        return Object.keys(this._internalTransformers)
            .filter((/** @type {string} */ recipe) => this._internalTransformers[recipe].isGlobalView)
            .map((/** @type {string} */ recipe) => { 
                const transfomer = this._internalTransformers[recipe]; 
                return { label: transfomer.label, dataTable: this[transfomer.data], tab: `${transfomer.tab}:${recipe}` };
            });
    }

    /**
     * @description Do we show the "Apex Uncompiled" button in the Apex tab (depends on the size of apexUncompiledTableData)
     * @type {boolean}
     * @public
     */ 
    get isThereAnyApexUncompiled() {
        return this.selectedSubTab === 'apex-recompilation-needed' && this.apexUncompiledTableData?.length > 0 || false;
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
        // SHOULD CATCH ERROR with specific error message

        // Init of the Org Check api (only once!)
        if (this._api) return;

        try {                
            // Load JS dependencies
            logger?.log('Loading JsForce and FFLate libraries...');
            await Promise.all([
                loadScript(this, OrgCheckStaticResource + '/js/jsforce.js'),
                loadScript(this, OrgCheckStaticResource + '/js/fflate.js')
            ]);
        } catch(e) {
            this._showError('Error while loading third party scripts in <code>_loadAPI</code>', e);
            return;
        }

        try {                
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
                     * @description Get all the keys in the storage
                     * @returns {Array<string>}
                     */
                    keys: () => {  
                        const keys = []; 
                        for (let i = 0; i < localStorage.length; i++) {
                            keys.push(localStorage.key(i)); 
                        }
                        return keys; },
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

            // Set the initial cache just after loading the api ;)
            this._updateCacheInformation();

        } catch(e) {
            this._showError('Error while loading Org Check library in <code>_loadAPI</code>', e);
        }
    }

    /**
     * @description Show the error in a modal (that can be closed)
     * @param {string} title
     * @param {Error} error
     * @private
     */ 
    _showError(title, error) {
        const htmlContent = `<font color="red">Sorry! An error occured while processing... <br /><br />`+
                            `Please create an issue on <a href="https://github.com/SalesforceLabs/OrgCheck/issues" target="_blank" rel="external noopener noreferrer">Org Check Issues tracker</a> `+
                            `along with the context, a screenshot and the following error. <br /><br /> `+
                            `<ul><li>Message: <code>${error?.message}</code></li><li>Stack: <code>${error?.stack}</code></li><li>Error as JSON: <code>${JSON.stringify(error)}</code></li></ul></font>`                                
        this._modal?.open(title, htmlContent);
        console.error(title, error);
    }

    _nt = () => '';
    _nm = () => `${this.namespace}`;
    _al = () => `${this.namespace}-${this.objectType}-${this.object}`;
    _on = () => `${this.object}-${this.namespace}`;
    _ob = () => `${this.object}`;
    _no = () => `${this.namespace}-${this.objectType}`;

    /**
     * @description List of internal transformers to get data from the API
     * @private
     */
    _internalTransformers = {
        'active-users':              { label: '👥 Active Internal Users',      tab: 'security',    isGlobalView: true,      data: 'usersTableData',                        remove: () => { this._api?.removeAllActiveUsersFromCache(); },              getAlias: this._nt,   get: async () => { return this._api?.getActiveUsers(); }},
        'apex-classes':              { label: '❤️‍🔥 Apex Classes',               tab: 'code',        isGlobalView: true,      data: 'apexClassesTableData',                  remove: () => { this._api?.removeAllApexClassesFromCache(); },              getAlias: this._nm,   get: async () => { return this._api?.getApexClasses(this.namespace); }},
        'apex-unit-tests':           { label: '🚒 Apex Unit Tests',            tab: 'code',        isGlobalView: true,      data: 'apexTestsTableData',                    remove: () => { this._api?.removeAllApexTestsFromCache(); },                getAlias: this._nm,   get: async () => { return this._api?.getApexTests(this.namespace); }},
        'apex-triggers':             { label: '🧨 Apex Triggers',              tab: 'code',        isGlobalView: true,      data: 'apexTriggersTableData',                 remove: () => { this._api?.removeAllApexTriggersFromCache(); },             getAlias: this._nm,   get: async () => { return this._api?.getApexTriggers(this.namespace); }},
        'apex-recompilation-needed': { label: '🌋 Apex Uncompiled',            tab: 'code',        isGlobalView: true,      data: 'apexUncompiledTableData',               remove: () => { this._api?.removeAllApexUncompiledFromCache(); },           getAlias: this._nm,   get: async () => { return this._api?.getApexUncompiled(this.namespace); }},
        'app-permissions':           { label: '⛕ Application Permissions',     tab: 'security',    isGlobalView: false,     data: '_internalAppPermissionsDataMatrix',     remove: () => { this._api?.removeAllAppPermissionsFromCache(); },           getAlias: this._nm,   get: async () => { return this._api?.getApplicationPermissionsPerParent(this.namespace); }},
        'custom-fields':             { label: '🏈 Custom Fields',              tab: 'data-model',  isGlobalView: true,      data: 'customFieldsTableData',                 remove: () => { this._api?.removeAllCustomFieldsFromCache(); },             getAlias: this._al,   get: async () => { return this._api?.getCustomFields(this.namespace, this.objectType, this.object); }},
        'custom-labels':             { label: '🏷️ Custom Labels',              tab: 'setting',     isGlobalView: true,      data: 'customLabelsTableData',                 remove: () => { this._api?.removeAllCustomLabelsFromCache(); },             getAlias: this._nm,   get: async () => { return this._api?.getCustomLabels(this.namespace); }},
        'field-permissions':         { label: '🚧 Field Level Securities',     tab: 'security',    isGlobalView: false,     data: '_internalFieldPermissionsDataMatrix',   remove: () => { this._api?.removeAllFieldPermissionsFromCache(); },         getAlias: this._on,   get: async () => { return this._api?.getFieldPermissionsPerParent(this.object, this.namespace); }},
        'flows':                     { label: '🏎️ Flows',                      tab: 'automation',  isGlobalView: true,      data: 'flowsTableData',                        remove: () => { this._api?.removeAllFlowsFromCache(); },                    getAlias: this._nt,   get: async () => { return this._api?.getFlows(); }},
        'lightning-aura-components': { label: '🧁 Lightning Aura Components',  tab: 'visual',      isGlobalView: true,      data: 'auraComponentsTableData',               remove: () => { this._api?.removeAllLightningAuraComponentsFromCache(); },  getAlias: this._nm,   get: async () => { return this._api?.getLightningAuraComponents(this.namespace); }},
        'lightning-pages':           { label: '🎂 Lightning Pages',            tab: 'visual',      isGlobalView: true,      data: 'flexiPagesTableData',                   remove: () => { this._api?.removeAllLightningPagesFromCache(); },           getAlias: this._nm,   get: async () => { return this._api?.getLightningPages(this.namespace); }},
        'lightning-web-components':  { label: '🍰 Lightning Web Components',   tab: 'visual',      isGlobalView: true,      data: 'lightningWebComponentsTableData',       remove: () => { this._api?.removeAllLightningWebComponentsFromCache(); },   getAlias: this._nm,   get: async () => { return this._api?.getLightningWebComponents(this.namespace); }},
        'object':                    { label: '🎳 Object Documentation',       tab: 'data-model',  isGlobalView: false,     data: 'objectData',                            remove: () => { this._api?.removeObjectFromCache(this.object); },           getAlias: this._ob,   get: async () => { return this.object !== '*' ? this._api?.getObject(this.object) : undefined; }},
        'object-permissions':        { label: '🚦 Object Permissions',         tab: 'security',    isGlobalView: false,     data: '_internalObjectPermissionsDataMatrix',  remove: () => { this._api?.removeAllObjectPermissionsFromCache(); },        getAlias: this._nm,   get: async () => { return this._api?.getObjectPermissionsPerParent(this.namespace); }},
        'objects':                   { label: '🏉 Org Wide Defaults',          tab: 'data-model',  isGlobalView: false,     data: 'objectsTableData',                      remove: () => { this._api?.removeAllObjectsFromCache(); },                  getAlias: this._no,   get: async () => { return this._api?.getObjects(this.namespace, this.objectType); }},
        'permission-sets':           { label: '🚔 Permission Sets',            tab: 'security',    isGlobalView: true,      data: 'permissionSetsTableData',               remove: () => { this._api?.removeAllPermSetsFromCache(); },                 getAlias: this._nm,   get: async () => { return this._api?.getPermissionSets(this.namespace); }},
        'permission-set-licenses':   { label: '🚔 Permission Set Licenses',    tab: 'security',    isGlobalView: true,      data: 'permissionSetLicensesTableData',        remove: () => { this._api?.removeAllPermSetLicensesFromCache(); },          getAlias: this._nt,   get: async () => { return this._api?.getPermissionSetLicenses(); }},
        'process-builders':          { label: '🛺 Process Builders',           tab: 'automation',  isGlobalView: true,      data: 'processBuildersTableData',              remove: () => { this._api?.removeAllProcessBuildersFromCache(); },          getAlias: this._nt,   get: async () => { return this._api?.getProcessBuilders(); }},
        'profile-password-policies': { label: '⛖ Profile Password Policies',  tab: 'security',     isGlobalView: true,     data: 'profilePasswordPoliciesTableData',      remove: () => { this._api?.removeAllProfilePasswordPoliciesFromCache(); },  getAlias: this._nt,   get: async () => { return this._api?.getProfilePasswordPolicies(); }},
        'profile-restrictions':      { label: '🚸 Profile Restrictions',       tab: 'security',    isGlobalView: true,      data: 'profileRestrictionsTableData',          remove: () => { this._api?.removeAllProfileRestrictionsFromCache(); },      getAlias: this._nm,   get: async () => { return this._api?.getProfileRestrictions(this.namespace); }},
        'profiles':                  { label: '🚓 Profiles',                   tab: 'security',    isGlobalView: true,      data: 'profilesTableData',                     remove: () => { this._api?.removeAllProfilesFromCache(); },                 getAlias: this._nm,   get: async () => { return this._api?.getProfiles(this.namespace); }},
        'public-groups':             { label: '🐘 Public Groups',              tab: 'boxes',       isGlobalView: true,      data: 'publicGroupsTableData',                 remove: () => { this._api?.removeAllPublicGroupsFromCache(); },             getAlias: this._nt,   get: async () => { return this._api?.getPublicGroups(); }},
        'queues':                    { label: '🦒 Queues',                     tab: 'boxes',       isGlobalView: true,      data: 'queuesTableData',                       remove: () => { this._api?.removeAllQueuesFromCache(); },                   getAlias: this._nt,   get: async () => { return this._api?.getQueues(); }},
        'roles-listing':             { label: '🦓 Role Listing',               tab: 'boxes',       isGlobalView: true,      data: 'rolesTableData',                        remove: () => { this._api?.removeAllRolesFromCache(); },                    getAlias: this._nt,   get: async () => { return this._api?.getRoles(); }},
        'roles-explorer':            { label: '🐙 Role Explorer',              tab: 'boxes',       isGlobalView: false,     data: 'rolesTree',                             remove: () => { this._api?.removeAllRolesFromCache(); },                    getAlias: this._nt,   get: async () => { return this._api?.getRolesTree(); }},
        'validation-rules':          { label: '🎾 Validation Rules',           tab: 'data-model',  isGlobalView: true,      data: 'validationRulesTableData',              remove: () => { this._api?.removeAllValidationRulesFromCache(); },          getAlias: this._nt,   get: async () => { return this._api?.getValidationRules(); }},
        'visual-force-components':   { label: '🍞 Visual Force Components',    tab: 'visual',      isGlobalView: true,      data: 'visualForceComponentsTableData',        remove: () => { this._api?.removeAllVisualForceComponentsFromCache(); },    getAlias: this._nm,   get: async () => { return this._api?.getVisualForceComponents(this.namespace); }},
        'visual-force-pages':        { label: '🥖 Visual Force Pages',         tab: 'visual',      isGlobalView: true,      data: 'visualForcePagesTableData',             remove: () => { this._api?.removeAllVisualForcePagesFromCache(); },         getAlias: this._nm,   get: async () => { return this._api?.getVisualForcePages(this.namespace); }},
        'workflows':                 { label: '🚗 Workflows',                  tab: 'automation',  isGlobalView: true,      data: 'workflowsTableData',                    remove: () => { this._api?.removeAllWorkflowsFromCache(); },                getAlias: this._nt,   get: async () => { return this._api?.getWorkflows(); }}
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
        // SHOULD NOT CATCH ERROR, this will be catched by the caller
        const transformer = this._internalTransformers[recipe]; 
        if (transformer) {
            if (forceRefresh === true) {
                // Call the remove cache from the API for this recipe
                transformer.remove();
            }
            // IF we set the lazy refresh to TRUE THEN
            //     Only update the data if the current tab ("this.selectedSubTab") is the one we are looking for ("recipe")
            // ELSE
            //     Update the data whatever the current tab is.
            // The IF statement could be like: 
            //     (lazyRefresh === true && recipe === this.selectedSubTab) || lazyRefresh === false
            // Let's do some Bool logic!!
            // The previous IF statement is equivalent to:
            //     NOT(  NOT( (lazyRefresh === true && recipe === this.selectedSubTab)     ||  lazyRefresh === false )  )
            //     NOT(  NOT(lazyRefresh === true && recipe === this.selectedSubTab)       &&  NOT(lazyRefresh === false)  )
            //     NOT(  NOT(lazyRefresh === true && recipe === this.selectedSubTab)       &&  lazyRefresh === true  )
            //     NOT( (NOT(lazyRefresh === true) || NOT(recipe === this.selectedSubTab)) &&  lazyRefresh === true  )
            //     NOT( (    lazyRefresh === false ||     recipe !== this.selectedSubTab ) &&  lazyRefresh === true  )
            //     NOT( (lazyRefresh === false &&  lazyRefresh === true ) || (recipe !== this.selectedSubTab &&  lazyRefresh === true ) )
            //     NOT( (                    false                      ) || (recipe !== this.selectedSubTab &&  lazyRefresh === true ) )
            //     NOT( (recipe !== this.selectedSubTab && lazyRefresh === true )
            // This is magic! ;)
            if (!(recipe !== this.selectedSubTab && lazyRefresh === true)) {
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
        // SHOULD NOT CATCH ERROR, this will be catched by the caller
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
        // SHOULD NOT CATCH ERROR, this will be catched by the caller
        this.cacheManagerData = this._api.getCacheInformation();
    }

    /**
     * @description Check if the terms are accepted and thus we can continue to use this org
     * @private
     * @async
     */ 
    async _checkTermsAcceptance() {
        // SHOULD NOT CATCH ERROR, this will be catched by the caller
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
        // SHOULD NOT CATCH ERROR, this will be catched by the caller
        if (this._api === undefined) return;

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
        // SHOULD NOT CATCH ERROR, this will be catched by the caller

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
        // SHOULD NOT CATCH ERROR, this will be catched by the caller
        this.showGlobalViewExportButton = false;
        await Promise.all(this._globalViewTransformersKeys.map(async (/** @type {string} */ recipe) => { await this._updateData(recipe, false, false); } ));
        this.showGlobalViewExportButton = true;
    }

    /**
     * @description Unique method to propagate a change to be done in the current tab. DOES NOT THROW any error
     * @private
     * @async
     */
    async _updateCurrentTab() {
        if (this._hasRenderOnce === false) return;
        const TAB_SECTION = `TAB ${this.selectedSubTab}`;
        this.tabLoading = true;
        setTimeout(async () => {
            try {
                this._spinner.open();
                this._spinner.sectionLog(TAB_SECTION, `C'est parti!`);
                switch (this.selectedSubTab) {
                    case 'welcome':     this._updateCacheInformation(); break;
                    case 'global-view': await this._updateGlobalView(); break;
                    default:            await this._updateData(this.selectedSubTab);
                }
                this._spinner.sectionEnded(TAB_SECTION, `Done.`);
                this._spinner.close(0);
            } catch (error) {
                this._spinner.sectionFailed(TAB_SECTION, error);
            } finally {
                this._updateLimits();
                this.tabLoading = false;
            }
        }, 1);
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
        // HANDLERS SHOULD CATCH ERROR and show them in the error modal
        return this._updateCurrentTab(); // this method does not throw any error so it is safe to just call it
    }

    /**
     * @description The "refresh" button in the global filters was pushed, therefore the filters needs to be reloaded
     * @public
     * @async
     */
    async handleFiltersRefreshed() {
        // HANDLERS SHOULD CATCH ERROR and show them in the error modal
        try {
            return this._loadFilters(true);
        } catch(e) {
            this._showError('Error while handleFiltersRefreshed', e);
        }
    }

    /**
     * @description When the org is a production, we show a message and a checkbox. This event is triggered when the user clicks on this checkbox.
     *              This should activate the usage of the Salesforce API from Org Check API.
     * @param {Event} event 
     * @public
     * @async
     */
    async handleClickUsageAcceptance(event) {
        // HANDLERS SHOULD CATCH ERROR and show them in the error modal
        // The source of the event is the acceptance checkbox
        const checkbox = event?.target;
        // do nothing if we did not find the checkbox (weird!!)
        if (!checkbox) return;
        try {
            // is it checked?
            if (checkbox['checked'] === true) {
                // yes it is!
                this._api.acceptUsageTerms();
                return this._loadBasicInformationIfAccepted();
            }
            // do nothing if it is not checked.
        } catch(e) {
            this._showError('Error while handleClickUsageAcceptance', e);
        }
    }

    /**
     * @description Event called when user selects a main tab
     * @param {Event} event
     * @public
     * @async
     */
    async handleMainTabActivation(event) {
        // HANDLERS SHOULD CATCH ERROR and show them in the error modal
        try {
            // The source of the event is the main tab
            const mainTab = event.target;
            // Store the current main tab
            this.selectedMainTab = mainTab['value'];
            // In each main tab there is an inner tabset with tabs (called SubTabs here)
            // Get a reference of the sub tabset (undefined if not found)
            const subTabSet = mainTab['querySelector']('lightning-tabset');
            // Get the active tab value of this sub tab set (it should be the last activated sub tab)
            // NOTE: the previous value could be the one from the previous tab opened ONLY IF the next tab was not yet rendered
            const subTabActivated = subTabSet?.activeTabValue;
            // Get the list of sub tabs
            const subTabs = mainTab['querySelectorAll']('lightning-tab');
            // Get the list of tabs' name
            const subTabsAvailable = Array.from(subTabs).map(t => t.value);
            if (subTabsAvailable.includes(subTabActivated)) {
                // Now if the subTabActivated is part of the list subTabsAvailable we select it
                this.selectedSubTab = subTabActivated;
            } else {
                // if not the tab was not yet rendered, so we are going to select the first tab in the list
                this.selectedSubTab = subTabsAvailable[0];
            }
            // Ask to update the current data
            return this._updateCurrentTab(); // it's not going to throw any error here...
        } catch (e) {
            this._showError('Error while handleMainTabActivation', e);
        }
    }

    /**
     * @description Event called when user selects a sub tab (within a main tab)
     * @param {Event} event 
     * @public
     * @async
     */
    async handleSubTabActivation(event) {
        // HANDLERS SHOULD CATCH ERROR and show them in the error modal
        try {
            // The source of the event is a sub tab
            const subTab = event?.target; // not throwing any error
            // That subTab's name will be the next currentTab
            const nextCurrentSubTab = subTab['value']; // not throwing any error
            // Store the curret sub tab
            this.selectedSubTab = nextCurrentSubTab;
            // Ask to update the current data
            return this._updateCurrentTab(); // not throwing any error here!
        } catch (e) {
            this._showError('Error while handleSubTabActivation', e);
        }
    }

    /**
     * @description Method called when the user ask to remove all the cache in the UI
     * @public
     * @async
     */
    async handleRemoveAllCache() {
        // HANDLERS SHOULD CATCH ERROR and show them in the error modal
        // if the api is not loaded yet ignore that call
        if (!this._api) return;
        try {
            // try to call the corresponding API method
            this._api.removeAllFromCache(); // may throw an error
            // and reload
            window.location.reload();
        } catch (e) {
            this._showError('Error while handleRemoveAllCache', e);
        }
    }

    /**
     * @description Event called when the user clicks on the "View Score" button on a data table
     * @param {Event} event 
     * @async
     * @public
     */ 
    async handleViewScore(event) {
        // HANDLERS SHOULD CATCH ERROR and show them in the error modal
        // if the api is not loaded yet ignore that call
        if (!this._api) return;
        // if event is undefined ignore that call
        if (!event) return;
        // The event should contain a detail property
        const detail = event['detail']; // not throwing any error
        // if detail is undefined ignore that call
        if (!detail) return;
        try {
            // prepare the modal content
            let htmlContent = `The component <code><b>${detail.whatName}</b></code> (<code>${detail.whatId}</code>) has a `+
                              `score of <b><code>${detail.score}</code></b> because of the following reasons:<br /><ul>`;
            detail.reasonIds?.forEach((/** @type {number} */ id) => {
                const reason = this._api.getScoreRule(id); // may throw an error
                if (reason) {
                    htmlContent += `<li><b>${reason.description}</b>: <i>${reason.errorMessage}</i></li>`;
                }
            });
            htmlContent += '</ul>';
            // show the modal
            this._modal.open(`Understand the Score of "${detail.whatName}" (${detail.whatId})`, htmlContent);
        } catch (e) {
            // in case this._api.getScoreRule threw an error!
            this._showError('Error while handleViewScore', e);
        }
    }

    /**
     * @description Event called when the user clicks on the "Run All Tests" button in the Apex tab
     * @async
     * @public
     */ 
    async handleClickRunAllTests() {
        // HANDLERS SHOULD CATCH ERROR and show them in the error modal
        try {
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
                this._spinner.sectionFailed(LOG_SECTION, error);
            }
        } catch (e) {
            this._showError('Error while handleClickRunAllTests', e);
        }
    }

    /**
     * @description Event called when the user clicks on the "Refresh" button from the current tab
     * @param {Event} event 
     * @async
     * @public
     */ 
    async handleClickRefreshCurrentTab(event) {
        // HANDLERS SHOULD CATCH ERROR and show them in the error modal
        try {
            const recipes = event.target['getAttribute']('data-recipes')?.split(',');
            return Promise.all(recipes.map(async (/** @type {string} */ recipe) => { await this._updateData(recipe, true); } ));
        } catch (e) {
            this._showError('Error while handleClickRefreshCurrentTab', e);
        }
    }

    /**
     * @description Event called when the user clicks on the "Recompile" button
     * @async
     * @public
     */ 
    async handleClickRecompile() {
        // HANDLERS SHOULD CATCH ERROR and show them in the error modal
        try {
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
        } catch (e) {
            this._showError('Error while handleClickRecompile', e);
        }
    }

    async handleOpenSubTab(event) {
        // HANDLERS SHOULD CATCH ERROR and show them in the error modal
        try {
            // The source of the event is a button with a specific attribute
            const button = event?.target; // not throwing any error
            // The button should have an attribute called data-tab 
            const tab = button['getAttribute']('data-tab');
            // Split the tab value into two elements one for the main tab and the other for the sub tab
            const elements = tab.split(':');
            this.selectedMainTab = elements[0];
            this.selectedSubTab = elements[1];
        } catch (e) {
            this._showError('Error while handleClickRecompile', e);
        }
    }




    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Column header definition for all data tables in the app
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description Table for field sets (specific to the current selected object)
     * @type {ocui.Table}
     */ 
    fieldSetsTableDefinition = {
        columns: [
            { label: '#',           type: ocui.ColumnType.IDX },
            { label: 'Label',       type: ocui.ColumnType.URL, data: { value: 'url', label: 'label' }},
            { label: 'Description', type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.ASC
    };

    /**
     * @description Table for page layouts (specific to the current selected object)
     * @type {ocui.Table}
     */
    layoutsTableDefinition = {
        columns: [
            { label: '#',     type: ocui.ColumnType.IDX },
            { label: 'Label', type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Type',  type: ocui.ColumnType.TXT, data: { value: 'type' }},
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.ASC
    };

    /**
     * @description Table for object limits (specific to the current selected object)
     * @type {ocui.Table}
     */
    limitsTableDefinition = {
        columns: [
            { label: '#',         type: ocui.ColumnType.IDX },
            { label: 'Score',     type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'label' }},
            { label: 'Label',     type: ocui.ColumnType.TXT, data: { value: 'label' }},
            { label: 'Type',      type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Max',       type: ocui.ColumnType.NUM, data: { value: 'max' }},
            { label: 'Used',      type: ocui.ColumnType.NUM, data: { value: 'used' }},
            { label: 'Used (%)',  type: ocui.ColumnType.PRC, data: { value: 'usedPercentage' }},
            { label: 'Remaining', type: ocui.ColumnType.NUM, data: { value: 'remaining' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for validation rules
     * @type {ocui.Table}
     */
    validationRulesTableDefinition = {
        columns: [
            { label: '#',                type: ocui.ColumnType.IDX },
            { label: 'Score',            type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',             type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'In this object',   type: ocui.ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }}, 
            { label: 'Object Type',      type: ocui.ColumnType.TXT, data: { value: 'objectRef.typeRef.label' }},
            { label: 'ObjectID',         type: ocui.ColumnType.TXT, data: { value: 'objectId' }},
            { label: 'Is Active',        type: ocui.ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Display On Field', type: ocui.ColumnType.TXT, data: { value: 'errorDisplayField' }},
            { label: 'Error Message',    type: ocui.ColumnType.TXT, data: { value: 'errorMessage' }},
            { label: 'Description',      type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for validation rules (specific to the current selected object)
     * @type {ocui.Table}
     */
    validationRulesInObjectTableDefinition = {
        columns: [
            { label: '#',                type: ocui.ColumnType.IDX },
            { label: 'Score',            type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',             type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Is Active',        type: ocui.ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Display On Field', type: ocui.ColumnType.TXT, data: { value: 'errorDisplayField' }},
            { label: 'Error Message',    type: ocui.ColumnType.TXT, data: { value: 'errorMessage' }},
            { label: 'Description',      type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for web links (specific to the current selected object)
     * @type {ocui.Table}
     */
    webLinksTableDefinition = {
        columns: [
            { label: '#',    type: ocui.ColumnType.IDX },
            { label: 'Name', type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'URLs', type: ocui.ColumnType.NUM, data: { value: 'nbHardCodedURLs' }},
            { label: 'IDs',  type: ocui.ColumnType.NUM, data: { value: 'nbHardCodedIDs' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.ASC
    };
    
    /**
     * @description Table for record types (specific to the current selected object)
     * @type {ocui.Table}
     */
    recordTypesTableDefinition = {
        columns: [
            { label: '#',              type: ocui.ColumnType.IDX },
            { label: 'Score',          type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',           type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Developer Name', type: ocui.ColumnType.TXT, data: { value: 'developerName' }},
            { label: 'Is Active',      type: ocui.ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Is Available',   type: ocui.ColumnType.CHK, data: { value: 'isAvailable' }},
            { label: 'Is Default',     type: ocui.ColumnType.CHK, data: { value: 'isDefaultRecordTypeMapping' }},
            { label: 'Is Master',      type: ocui.ColumnType.CHK, data: { value: 'isMaster' }},
            { label: 'Description',    type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for sobject relationships (specific to the current selected object)
     * @type {ocui.Table}
     */
    relationshipsTableDefinition = {
        columns: [
            { label: '#',                    type: ocui.ColumnType.IDX },
            { label: 'Name',                 type: ocui.ColumnType.TXT, data: { value: 'name' }},
            { label: 'Field Name',           type: ocui.ColumnType.TXT, data: { value: 'fieldName' }},
            { label: 'Child Object',         type: ocui.ColumnType.TXT, data: { value: 'childObject' }},
            { label: 'Is Cascade Delete',    type: ocui.ColumnType.CHK, data: { value: 'isCascadeDelete' }},
            { label: 'Is Restricted Delete', type: ocui.ColumnType.CHK, data: { value: 'isRestrictedDelete' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.ASC
    };

    /**
     * @description Table for custom fields
     * @type {ocui.Table}
     */
    customFieldsTableDefinition = {
        columns: [
            { label: '#',                   type: ocui.ColumnType.IDX },
            { label: 'Score',               type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }}, //filter: 'sco',
            { label: 'Field',               type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Label',               type: ocui.ColumnType.TXT, data: { value: 'label' }},
            { label: 'In this object',      type: ocui.ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }},  //filter: 'obj', 
            { label: 'Object Type',         type: ocui.ColumnType.TXT, data: { value: 'objectRef.typeRef.label' }}, //filter: 'obj', 
            { label: 'Package',             type: ocui.ColumnType.TXT, data: { value: 'package' }}, // filter: 'cus',
            { label: 'Type',                type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Length',              type: ocui.ColumnType.TXT, data: { value: 'length' }},
            { label: 'Unique?',             type: ocui.ColumnType.CHK, data: { value: 'isUnique' }},
            { label: 'Encrypted?',          type: ocui.ColumnType.CHK, data: { value: 'isEncrypted' }},
            { label: 'External?',           type: ocui.ColumnType.CHK, data: { value: 'isExternalId' }},
            { label: 'Indexed?',            type: ocui.ColumnType.CHK, data: { value: 'isIndexed' }},
            { label: 'Restricted?',         type: ocui.ColumnType.CHK, data: { value: 'isRestrictedPicklist' }},
            { label: 'Tooltip',             type: ocui.ColumnType.TXT, data: { value: 'tooltip' }, modifier: { maximumLength: 45, valueIfEmpty: 'No tooltip.' }},
            { label: 'Formula',             type: ocui.ColumnType.TXT, data: { value: 'formula' }, modifier: { maximumLength: 100 , preformatted: true }},
            { label: 'URLs',                type: ocui.ColumnType.NUM, data: { value: 'nbHardCodedURLs' }},
            { label: 'IDs',                 type: ocui.ColumnType.NUM, data: { value: 'nbHardCodedIDs' }},
            { label: 'Default Value',       type: ocui.ColumnType.TXT, data: { value: 'defaultValue' }},
            { label: 'Using',               type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }}, // filter: 'dep', 
            { label: 'Referenced in',       type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }}, // filter: 'dep', 
            { label: 'Ref. in Layout?',     type: ocui.ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${PAGELAYOUT}` }}, // filter: 'dep', 
            { label: 'Ref. in Apex Class?', type: ocui.ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${APEXCLASS}` }}, // filter: 'dep', 
            { label: 'Ref. in Flow?',       type: ocui.ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${FLOWVERSION}` }}, // filter: 'dep', 
            { label: 'Dependencies',        type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},// filter: 'dep', 
            { label: 'Created date',        type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},// filter: 'noc', 
            { label: 'Modified date',       type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},// filter: 'noc', 
            { label: 'Description',         type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for custom fields (specific to the current selected object)
     * @type {ocui.Table}
     */
    customFieldsInObjectTableDefinition = {
        columns: [
            { label: '#',                   type: ocui.ColumnType.IDX },
            { label: 'Score',               type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }}, //filter: 'sco',
            { label: 'Field',               type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Label',               type: ocui.ColumnType.TXT, data: { value: 'label' }},
            { label: 'Package',             type: ocui.ColumnType.TXT, data: { value: 'package' }}, // filter: 'cus',
            { label: 'Type',                type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Length',              type: ocui.ColumnType.TXT, data: { value: 'length' }},
            { label: 'Unique?',             type: ocui.ColumnType.CHK, data: { value: 'isUnique' }},
            { label: 'Encrypted?',          type: ocui.ColumnType.CHK, data: { value: 'isEncrypted' }},
            { label: 'External?',           type: ocui.ColumnType.CHK, data: { value: 'isExternalId' }},
            { label: 'Indexed?',            type: ocui.ColumnType.CHK, data: { value: 'isIndexed' }},
            { label: 'Restricted?',         type: ocui.ColumnType.CHK, data: { value: 'isRestrictedPicklist' }},
            { label: 'Tooltip',             type: ocui.ColumnType.TXT, data: { value: 'tooltip' }, modifier: { maximumLength: 45, valueIfEmpty: 'No tooltip.' }},
            { label: 'Formula',             type: ocui.ColumnType.TXT, data: { value: 'formula' }, modifier: { maximumLength: 100 , preformatted: true }},
            { label: 'URLs',                type: ocui.ColumnType.NUM, data: { value: 'nbHardCodedURLs' }},
            { label: 'IDs',                 type: ocui.ColumnType.NUM, data: { value: 'nbHardCodedIDs' }},
            { label: 'Default Value',       type: ocui.ColumnType.TXT, data: { value: 'defaultValue' }},
            { label: 'Using',               type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }}, // filter: 'dep', 
            { label: 'Referenced in',       type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }}, // filter: 'dep', 
            { label: 'Ref. in Layout?',     type: ocui.ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${PAGELAYOUT}` }}, // filter: 'dep', 
            { label: 'Ref. in Apex Class?', type: ocui.ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${APEXCLASS}` }}, // filter: 'dep', 
            { label: 'Ref. in Flow?',       type: ocui.ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${FLOWVERSION}` }}, // filter: 'dep', 
            { label: 'Dependencies',        type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},// filter: 'dep', 
            { label: 'Created date',        type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},// filter: 'noc', 
            { label: 'Modified date',       type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},// filter: 'noc', 
            { label: 'Description',         type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for standard fields (specific to the current selected object)
     * @type {ocui.Table}
     */
    standardFieldsInObjectTableDefinition = {
        columns: [
            { label: '#',                   type: ocui.ColumnType.IDX },
            { label: 'Score',               type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }}, //filter: 'sco',
            { label: 'Field',               type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Label',               type: ocui.ColumnType.TXT, data: { value: 'label' }},
            { label: 'Type',                type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Length',              type: ocui.ColumnType.TXT, data: { value: 'length' }},
            { label: 'Unique?',             type: ocui.ColumnType.CHK, data: { value: 'isUnique' }},
            { label: 'Encrypted?',          type: ocui.ColumnType.CHK, data: { value: 'isEncrypted' }},
            { label: 'External?',           type: ocui.ColumnType.CHK, data: { value: 'isExternalId' }},
            { label: 'Indexed?',            type: ocui.ColumnType.CHK, data: { value: 'isIndexed' }},
            { label: 'Restricted?',         type: ocui.ColumnType.CHK, data: { value: 'isRestrictedPicklist' }},
            { label: 'Tooltip',             type: ocui.ColumnType.TXT, data: { value: 'tooltip' }, modifier: { maximumLength: 45, valueIfEmpty: 'No tooltip.' }},
            { label: 'Formula',             type: ocui.ColumnType.TXT, data: { value: 'formula' }, modifier: { maximumLength: 100 , preformatted: true }},
            { label: 'Default Value',       type: ocui.ColumnType.TXT, data: { value: 'defaultValue' }},
            { label: 'Created date',        type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},// filter: 'noc', 
            { label: 'Modified date',       type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},// filter: 'noc', 
            { label: 'Description',         type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for custom labels
     * @type {ocui.Table}
     */
    customLabelsTableDefinition = {
        columns: [
            { label: '#',                   type: ocui.ColumnType.IDX },
            { label: 'Score',               type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',             type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Label',               type: ocui.ColumnType.TXT, data: { value: 'label' }},
            { label: 'Category',            type: ocui.ColumnType.TXT, data: { value: 'category' }},
            { label: 'Language',            type: ocui.ColumnType.TXT, data: { value: 'language' }},
            { label: 'Protected?',          type: ocui.ColumnType.CHK, data: { value: 'isProtected' }},
            { label: 'Using',               type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',       type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Ref. in Layout?',     type: ocui.ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${PAGELAYOUT}`}},
            { label: 'Ref. in Apex Class?', type: ocui.ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${APEXCLASS}`}},
            { label: 'Ref. in Flow?',       type: ocui.ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${FLOWVERSION}`}},
            { label: 'Dependencies',        type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',        type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',       type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Value',               type: ocui.ColumnType.TXT, data: { value: 'value'}, modifier: { maximumLength: 45, preformatted: true }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for lightning aura components
     * @type {ocui.Table}
     */
    auraComponentsTableDefinition = {
        columns: [
            { label: '#',             type: ocui.ColumnType.IDX },
            { label: 'Score',         type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',          type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',   type: ocui.ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',       type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Using',         type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in', type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',  type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',   type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for lightning pages
     * @type {ocui.Table}
     */
    flexiPagesTableDefinition = {
        columns: [
            { label: '#',             type: ocui.ColumnType.IDX },
            { label: 'Score',         type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',          type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Type',          type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Package',       type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Object',        type: ocui.ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }, modifier: { valueIfEmpty: 'Not related to an object.' }}, // filter: 'obj',
            { label: 'Using',         type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in', type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',  type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',   type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for lightning pages within an SObject
     * @type {ocui.Table}
     */
    flexiPagesInObjectTableDefinition = {
        columns: [
            { label: '#',             type: ocui.ColumnType.IDX },
            { label: 'Score',         type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',          type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Type',          type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Package',       type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Using',         type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in', type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',  type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',   type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for lightning web components
     * @type {ocui.Table}
     */
    lightningWebComponentsTableDefinition = {
        columns: [
            { label: '#',             type: ocui.ColumnType.IDX },
            { label: 'Score',         type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',          type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',   type: ocui.ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }}, 
            { label: 'Package',       type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Using',         type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in', type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',  type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',   type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for permission sets
     * @type {ocui.Table}
     */
    permissionSetsTableDefinition = {
        columns: [
            { label: '#',                type: ocui.ColumnType.IDX },
            { label: 'Score',            type: ocui.ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',             type: ocui.ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Is Group?',        type: ocui.ColumnType.CHK,  data: { value: 'isGroup' }},
            { label: 'Custom',           type: ocui.ColumnType.CHK,  data: { value: 'isCustom' }},
            { label: '#FLSs',            type: ocui.ColumnType.NUM,  data: { value: 'nbFieldPermissions' }},
            { label: '#Object CRUDs',    type: ocui.ColumnType.NUM,  data: { value: 'nbObjectPermissions' }},
            { label: 'Api Enabled',      type: ocui.ColumnType.CHK,  data: { value: 'importantPermissions.apiEnabled' }},
            { label: 'View Setup',       type: ocui.ColumnType.CHK,  data: { value: 'importantPermissions.viewSetup' }},
            { label: 'Modify All Data',  type: ocui.ColumnType.CHK,  data: { value: 'importantPermissions.modifyAllData' }},
            { label: 'View All Data',    type: ocui.ColumnType.CHK,  data: { value: 'importantPermissions.viewAllData' }},
            { label: 'License',          type: ocui.ColumnType.TXT,  data: { value: 'license' }},
            { label: 'Package',          type: ocui.ColumnType.TXT,  data: { value: 'package' }},
            { label: '#Active users',    type: ocui.ColumnType.NUM,  data: { value: 'memberCounts' }, modifier: { minimum: 1, valueBeforeMin: 'No active user!', valueIfEmpty: '' }},
            { label: 'Created date',     type: ocui.ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',    type: ocui.ColumnType.DTM,  data: { value: 'lastModifiedDate' }},
            { label: 'Description',      type: ocui.ColumnType.TXT,  data: { value: 'description'}, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for permission set licenses
     * @type {ocui.Table}
     */
    permissionSetLicensesTableDefinition = {
        columns: [
            { label: '#',                     type: ocui.ColumnType.IDX },
            { label: 'Score',                 type: ocui.ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                  type: ocui.ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Total',                 type: ocui.ColumnType.NUM,  data: { value: 'totalCount' }},
            { label: 'Used',                  type: ocui.ColumnType.NUM,  data: { value: 'usedCount' }},
            { label: 'Used (%)',              type: ocui.ColumnType.PRC,  data: { value: 'usedPercentage' }},
            { label: 'Remaining',             type: ocui.ColumnType.NUM,  data: { value: 'remainingCount' }},
            { label: 'Users Really Assigned', type: ocui.ColumnType.NUM,  data: { value: 'distinctActiveAssigneeCount' }},
            { label: 'Permission Sets',       type: ocui.ColumnType.URLS, data: { values: 'permissionSetRefs', value: 'url', label: 'name' }},
            { label: 'Permission Sets (ids)', type: ocui.ColumnType.TXTS, data: { values: 'permissionSetIds' }},
            { label: 'Status',                type: ocui.ColumnType.TXT,  data: { value: 'status' }},
            { label: 'Expiration Date',       type: ocui.ColumnType.DTM,  data: { value: 'expirationDate' }},
            { label: 'For Integration?',      type: ocui.ColumnType.CHK,  data: { value: 'isAvailableForIntegrations' }},
            { label: 'Created date',          type: ocui.ColumnType.DTM,  data: { value: 'createDate' }},
            { label: 'Modified date',         type: ocui.ColumnType.DTM,  data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for profiles
     * @type {ocui.Table}
     */
    profilesTableDefinition = {
        columns: [
            { label: '#',               type: ocui.ColumnType.IDX },
            { label: 'Score',           type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Custom',          type: ocui.ColumnType.CHK, data: { value: 'isCustom' }},
            { label: '#FLSs',           type: ocui.ColumnType.NUM, data: { value: 'nbFieldPermissions' }},
            { label: '#Object CRUDs',   type: ocui.ColumnType.NUM, data: { value: 'nbObjectPermissions' }},
            { label: 'Api Enabled',     type: ocui.ColumnType.CHK, data: { value: 'importantPermissions.apiEnabled' }},
            { label: 'View Setup',      type: ocui.ColumnType.CHK, data: { value: 'importantPermissions.viewSetup' }},
            { label: 'Modify All Data', type: ocui.ColumnType.CHK, data: { value: 'importantPermissions.modifyAllData' }},
            { label: 'View All Data',   type: ocui.ColumnType.CHK, data: { value: 'importantPermissions.viewAllData' }},
            { label: 'License',         type: ocui.ColumnType.TXT, data: { value: 'license' }},
            { label: 'Package',         type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: '#Active users',   type: ocui.ColumnType.NUM, data: { value: 'memberCounts' }, modifier: { minimum: 1, valueBeforeMin: 'No active user!', valueIfEmpty: '' }},
            { label: 'Created date',    type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',     type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for profile restrictions
     * @type {ocui.Table}
     */
    profileRestrictionsTableDefinition = {
        columns: [
            { label: '#',               type: ocui.ColumnType.IDX },
            { label: 'Score',           type: ocui.ColumnType.SCR,  data: { value: 'score', id: 'profileRef.id', name: 'profileRef.name' }},
            { label: 'Name',            type: ocui.ColumnType.URL,  data: { value: 'profileRef.url', label: 'profileRef.name' }},
            { label: 'Custom',          type: ocui.ColumnType.CHK,  data: { value: 'profileRef.isCustom' }},
            { label: 'Package',         type: ocui.ColumnType.TXT,  data: { value: 'profileRef.package' }},
            { label: 'Ip Ranges',       type: ocui.ColumnType.OBJS, data: { values: 'ipRanges', template: (r) => `${r.description}: from ${r.startAddress} to ${r.endAddress} --> ${r.difference*1} address(es)` }},
            { label: 'Login Hours',     type: ocui.ColumnType.OBJS, data: { values: 'loginHours', template: (r) => `${r.day} from ${r.fromTime} to ${r.toTime} --> ${r.difference*1} minute(s)` }},
            { label: 'Description',     type: ocui.ColumnType.TXT,  data: { value: 'profileRef.description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for profiles password policies
     * @type {ocui.Table}
     */
    profilePasswordPoliciesTableDefinition = {
        columns: [
            { label: '#',                                         type: ocui.ColumnType.IDX },
            { label: 'Score',                                     type: ocui.ColumnType.SCR, data: { value: 'score', id: 'profileName', name: 'profileName' }},
            { label: 'Name',                                      type: ocui.ColumnType.TXT, data: { value: 'profileName' }},
            { label: 'User password expires in',                  type: ocui.ColumnType.NUM, data: { value: 'passwordExpiration' }},
            { label: 'Enforce password history',                  type: ocui.ColumnType.NUM, data: { value: 'passwordHistory' }},
            { label: 'Minimum password length',                   type: ocui.ColumnType.NUM, data: { value: 'minimumPasswordLength' }},
            { label: 'Level of complexity (/5)',                  type: ocui.ColumnType.NUM, data: { value: 'passwordComplexity' }},
            { label: 'Question can contain password',             type: ocui.ColumnType.CHK, data: { value: 'passwordQuestion' }},
            { label: 'Maximum Login Attempts',                    type: ocui.ColumnType.NUM, data: { value: 'maxLoginAttempts' }},
            { label: 'Lockout period',                            type: ocui.ColumnType.NUM, data: { value: 'lockoutInterval' }},
            { label: 'Require minimum one day password lifetime', type: ocui.ColumnType.CHK, data: { value: 'minimumPasswordLifetime' }},
            { label: 'Security Question Hidden',                  type: ocui.ColumnType.CHK, data: { value: 'obscure' }},
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for public groups
     * @type {ocui.Table}
     */
    publicGroupsTableDefinition = {
        columns: [
            { label: '#',                      type: ocui.ColumnType.IDX },
            { label: 'Score',                  type: ocui.ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                   type: ocui.ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Developer Name',         type: ocui.ColumnType.TXT,  data: { value: 'developerName' }},
            { label: 'With bosses?',           type: ocui.ColumnType.CHK,  data: { value: 'includeBosses' }},
            { label: '#Explicit members',      type: ocui.ColumnType.NUM,  data: { value: 'nbDirectMembers' }},
            { label: 'Explicit groups',        type: ocui.ColumnType.URLS, data: { values: 'directGroupRefs', value: 'url', label: 'name' }}, //label: (g) => `${g.name} (${g.type}${g.includeBosses?' with bosses ':''}${g.includeSubordinates?' with subordinates':''})` }},
            { label: 'Explicit users',         type: ocui.ColumnType.URLS, data: { values: 'directUserRefs', value: 'url', label: 'name' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for queues
     * @type {ocui.Table}
     */
    queuesTableDefinition = {
        columns: [
            { label: '#',                      type: ocui.ColumnType.IDX },
            { label: 'Score',                  type: ocui.ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                   type: ocui.ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Developer Name',         type: ocui.ColumnType.TXT,  data: { value: 'developerName' }},
            { label: 'With bosses?',           type: ocui.ColumnType.CHK,  data: { value: 'includeBosses' }},
            { label: '#Explicit members',      type: ocui.ColumnType.NUM,  data: { value: 'nbDirectMembers' }},
            { label: 'Explicit groups',        type: ocui.ColumnType.URLS, data: { values: 'directGroupRefs', value: 'url', label: 'name' }}, //label: (g) => `${g.name} (${g.type}${g.includeBosses?' with bosses ':''}${g.includeSubordinates?' with subordinates':''})` }},
            { label: 'Explicit users',         type: ocui.ColumnType.URLS, data: { values: 'directUserRefs', value: 'url', label: 'name' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for active internal users
     * @type {ocui.Table}
     */
    usersTableDefinition = {
        columns: [
            { label: '#',                            type: ocui.ColumnType.IDX },
            { label: 'Score',                        type: ocui.ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'User Name',                    type: ocui.ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Under LEX?',                   type: ocui.ColumnType.CHK,  data: { value: 'onLightningExperience' }},
            { label: 'Last login',                   type: ocui.ColumnType.DTM,  data: { value: 'lastLogin' }, modifier: { valueIfEmpty: 'Never logged!' }},
            { label: 'Failed logins',                type: ocui.ColumnType.NUM,  data: { value: 'numberFailedLogins' }},
            { label: 'Password change',              type: ocui.ColumnType.DTM,  data: { value: 'lastPasswordChange' }},
            { label: 'Api Enabled',                  type: ocui.ColumnType.CHK,  data: { value: 'apiEnabled' }},
            { label: 'Api Enabled granted from',     type: ocui.ColumnType.URLS, data: { values: 'aggregateImportantPermissions.apiEnabled', value: 'url', label: 'name' }},
            { label: 'View Setup',                   type: ocui.ColumnType.CHK,  data: { value: 'viewSetup' }},
            { label: 'View Setup granted from',      type: ocui.ColumnType.URLS, data: { values: 'aggregateImportantPermissions.viewSetup', value: 'url', label: 'name' }},
            { label: 'Modify All Data',              type: ocui.ColumnType.CHK,  data: { value: 'modifyAllData' }},
            { label: 'Modify All Data granted from', type: ocui.ColumnType.URLS, data: { values: 'aggregateImportantPermissions.modifyAllData', value: 'url', label: 'name' }},
            { label: 'View All Data',                type: ocui.ColumnType.CHK,  data: { value: 'viewAllData' }},
            { label: 'View All Data granted from',   type: ocui.ColumnType.URLS, data: { values: 'aggregateImportantPermissions.viewAllData', value: 'url', label: 'name' }},
            { label: 'Profile',                      type: ocui.ColumnType.URL,  data: { value: 'profileRef.url', label: 'profileRef.name' }},
            { label: 'Permission Sets',              type: ocui.ColumnType.URLS, data: { values: 'permissionSetRefs', value: 'url', label: 'name' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for visualforce components
     * @type {ocui.Table}
     */
    visualForceComponentsTableDefinition = {
        columns: [
            { label: '#',             type: ocui.ColumnType.IDX },
            { label: 'Score',         type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',          type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',   type: ocui.ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',       type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'URLs',          type: ocui.ColumnType.NUM, data: { value: 'nbHardCodedURLs' }},
            { label: 'IDs',           type: ocui.ColumnType.NUM, data: { value: 'nbHardCodedIDs' }},
            { label: 'Using',         type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in', type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',  type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',   type: ocui.ColumnType.TXT, data: { value: 'description'}, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for visualforce pages
     * @type {ocui.Table}
     */
    visualForcePagesTableDefinition = {
        columns: [
            { label: '#',             type: ocui.ColumnType.IDX },
            { label: 'Score',         type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',          type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',   type: ocui.ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Mobile',        type: ocui.ColumnType.CHK, data: { value: 'isMobileReady' }},
            { label: 'Package',       type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'URLs',          type: ocui.ColumnType.NUM, data: { value: 'nbHardCodedURLs' }},
            { label: 'IDs',           type: ocui.ColumnType.NUM, data: { value: 'nbHardCodedIDs' }},
            { label: 'Using',         type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in', type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',  type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',   type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for apex classes (compiled and not tests)
     * @type {ocui.Table}
     */
    apexClassesTableDefinition = {
        columns: [
            { label: '#',               type: ocui.ColumnType.IDX },
            { label: 'Score',           type: ocui.ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ocui.ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'API Version',     type: ocui.ColumnType.NUM,  data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',         type: ocui.ColumnType.TXT,  data: { value: 'package' }},
            { label: 'Class',           type: ocui.ColumnType.CHK,  data: { value: 'isClass' }},
            { label: 'Abst.',           type: ocui.ColumnType.CHK,  data: { value: 'isAbstract' }},
            { label: 'Intf.',           type: ocui.ColumnType.CHK,  data: { value: 'isInterface' }},
            { label: 'Enum',            type: ocui.ColumnType.CHK,  data: { value: 'isEnum' }},
            { label: 'Schdl.',          type: ocui.ColumnType.CHK,  data: { value: 'isSchedulable' }},
            { label: 'Access',          type: ocui.ColumnType.TXT,  data: { value: 'specifiedAccess' }},
            { label: 'Implements',      type: ocui.ColumnType.TXTS, data: { values: 'interfaces' }},
            { label: 'Extends',         type: ocui.ColumnType.TXT,  data: { value: 'extends' }},
            { label: 'Size',            type: ocui.ColumnType.NUM,  data: { value: 'length' }},
            { label: 'URLs',            type: ocui.ColumnType.NUM,  data: { value: 'nbHardCodedURLs' }},
            { label: 'IDs',             type: ocui.ColumnType.NUM,  data: { value: 'nbHardCodedIDs' }},
            { label: 'Methods',         type: ocui.ColumnType.NUM,  data: { value: 'methodsCount' }},
            { label: 'Inner Classes',   type: ocui.ColumnType.NUM,  data: { value: 'innerClassesCount' }},
            { label: 'Annotations',     type: ocui.ColumnType.TXTS, data: { values: 'annotations' }},
            { label: 'Sharing',         type: ocui.ColumnType.TXT,  data: { value: 'specifiedSharing' }, modifier: { valueIfEmpty: 'Not specified.' }},
            { label: 'Scheduled',       type: ocui.ColumnType.CHK,  data: { value: 'isScheduled' }},
            { label: 'Coverage (>75%)', type: ocui.ColumnType.PRC,  data: { value: 'coverage' }, modifier: { valueIfEmpty: 'No coverage!' }},
            { label: 'Related Tests',   type: ocui.ColumnType.URLS, data: { values: 'relatedTestClassRefs', value: 'url', label: 'name' }},
            { label: 'Using',           type: ocui.ColumnType.NUM,  data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',   type: ocui.ColumnType.NUM,  data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',    type: ocui.ColumnType.DEP,  data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',    type: ocui.ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ocui.ColumnType.DTM,  data: { value: 'lastModifiedDate' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for uncompiled apex classes
     * @type {ocui.Table}
     */    
    apexUncompiledTableDefinition = {
        columns: [
            { label: '#',               type: ocui.ColumnType.IDX },
            { label: 'Score',           type: ocui.ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ocui.ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'API Version',     type: ocui.ColumnType.NUM,  data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',         type: ocui.ColumnType.TXT,  data: { value: 'package' }},
            { label: 'Size',            type: ocui.ColumnType.NUM,  data: { value: 'length' }},
            { label: 'Coverage (>75%)', type: ocui.ColumnType.PRC,  data: { value: 'coverage' }, modifier: { valueIfEmpty: 'No coverage!' }},
            { label: 'Related Tests',   type: ocui.ColumnType.URLS, data: { values: 'relatedTestClassRefs', value: 'url', label: 'name' }},
            { label: 'Using',           type: ocui.ColumnType.NUM,  data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',   type: ocui.ColumnType.NUM,  data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',    type: ocui.ColumnType.DEP,  data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',    type: ocui.ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ocui.ColumnType.DTM,  data: { value: 'lastModifiedDate' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for apex triggers
     * @type {ocui.Table}
     */
    apexTriggersTableDefinition = {
        columns: [
            { label: '#',             type: ocui.ColumnType.IDX },
            { label: 'Score',         type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',          type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',   type: ocui.ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',       type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Size',          type: ocui.ColumnType.NUM, data: { value: 'length' }},
            { label: 'URLs',          type: ocui.ColumnType.NUM, data: { value: 'nbHardCodedURLs' }},
            { label: 'IDs',           type: ocui.ColumnType.NUM, data: { value: 'nbHardCodedIDs' }},
            { label: 'Object',        type: ocui.ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }}, // filter: 'nob'
            { label: 'Active?',       type: ocui.ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Has SOQL?',     type: ocui.ColumnType.CHK, data: { value: 'hasSOQL' }},
            { label: 'Has DML?',      type: ocui.ColumnType.CHK, data: { value: 'hasDML' }},
            { label: '*Insert',       type: ocui.ColumnType.CHK, data: { value: 'beforeInsert' }},
            { label: 'Insert*',       type: ocui.ColumnType.CHK, data: { value: 'afterInsert' }},
            { label: '*Update',       type: ocui.ColumnType.CHK, data: { value: 'beforeUpdate' }},
            { label: 'Update*',       type: ocui.ColumnType.CHK, data: { value: 'afterUpdate' }},
            { label: '*Delete',       type: ocui.ColumnType.CHK, data: { value: 'beforeDelete' }},
            { label: 'Delete*',       type: ocui.ColumnType.CHK, data: { value: 'afterDelete' }},
            { label: 'Undelete',      type: ocui.ColumnType.CHK, data: { value: 'afterUndelete' }},
            { label: 'Using',         type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Dependencies',  type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for apex triggers within SObject
     * @type {ocui.Table}
     */
    apexTriggersInObjectTableDefinition =  {
        columns: [
            { label: '#',             type: ocui.ColumnType.IDX },
            { label: 'Score',         type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',          type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',   type: ocui.ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',       type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Size',          type: ocui.ColumnType.NUM, data: { value: 'length' }},
            { label: 'URLs',          type: ocui.ColumnType.NUM, data: { value: 'nbHardCodedURLs' }},
            { label: 'IDs',           type: ocui.ColumnType.NUM, data: { value: 'nbHardCodedIDs' }},
            { label: 'Active?',       type: ocui.ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Has SOQL?',     type: ocui.ColumnType.CHK, data: { value: 'hasSOQL' }},
            { label: 'Has DML?',      type: ocui.ColumnType.CHK, data: { value: 'hasDML' }},
            { label: '*Insert',       type: ocui.ColumnType.CHK, data: { value: 'beforeInsert' }},
            { label: 'Insert*',       type: ocui.ColumnType.CHK, data: { value: 'afterInsert' }},
            { label: '*Update',       type: ocui.ColumnType.CHK, data: { value: 'beforeUpdate' }},
            { label: 'Update*',       type: ocui.ColumnType.CHK, data: { value: 'afterUpdate' }},
            { label: '*Delete',       type: ocui.ColumnType.CHK, data: { value: 'beforeDelete' }},
            { label: 'Delete*',       type: ocui.ColumnType.CHK, data: { value: 'afterDelete' }},
            { label: 'Undelete',      type: ocui.ColumnType.CHK, data: { value: 'afterUndelete' }},
            { label: 'Using',         type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Dependencies',  type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',  type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date', type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for apex classes that are tests
     * @type {ocui.Table}
     */
    apexTestsTableDefinition = {
        columns: [
            { label: '#',               type: ocui.ColumnType.IDX },
            { label: 'Score',           type: ocui.ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ocui.ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'API Version',     type: ocui.ColumnType.NUM,  data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',         type: ocui.ColumnType.TXT,  data: { value: 'package' }},
            { label: 'Size',            type: ocui.ColumnType.NUM,  data: { value: 'length' }},
            { label: 'URLs',            type: ocui.ColumnType.NUM,  data: { value: 'nbHardCodedURLs' }},
            { label: 'IDs',             type: ocui.ColumnType.NUM,  data: { value: 'nbHardCodedIDs' }},
            { label: 'Nb Asserts',      type: ocui.ColumnType.NUM,  data: { value: 'nbSystemAsserts' }, modifier: { valueIfEmpty: 'No direct usage of Assert.Xxx() or System.assertXxx().' }},
            { label: 'Methods',         type: ocui.ColumnType.NUM,  data: { value: 'methodsCount' }},
            { label: 'Latest Run Date', type: ocui.ColumnType.DTM,  data: { value: 'lastTestRunDate' }},
            { label: 'Runtime',         type: ocui.ColumnType.NUM,  data: { value: 'testMethodsRunTime' }},
            { label: 'Passed methods',  type: ocui.ColumnType.OBJS, data: { values: 'testPassedMethods', template: (r) => `${r.methodName} (${r.runtime*1} ms)` }},
            { label: 'Failed methods',  type: ocui.ColumnType.OBJS, data: { values: 'testFailedMethods', template: (r) => `${r.methodName} (${r.stacktrace})` }},
            { label: 'Inner Classes',   type: ocui.ColumnType.NUM,  data: { value: 'innerClassesCount' }},
            { label: 'Sharing',         type: ocui.ColumnType.TXT,  data: { value: 'specifiedSharing' }, modifier: { valueIfEmpty: 'Not specified.' }},
            { label: 'Covering',        type: ocui.ColumnType.URLS, data: { values: 'relatedClassRefs', value: 'url', label: 'name' }},
            { label: 'Using',           type: ocui.ColumnType.NUM,  data: { value: 'dependencies.using.length' }},
            { label: 'Dependencies',    type: ocui.ColumnType.DEP,  data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',    type: ocui.ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ocui.ColumnType.DTM,  data: { value: 'lastModifiedDate' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for SObject Org Wide Default
     * @type {ocui.Table}
     */
    owdTableDefinition = {
        columns: [
            { label: '#',         type: ocui.ColumnType.IDX },
            { label: 'Label',     type: ocui.ColumnType.TXT, data: { value: 'label' }},
            { label: 'Name',      type: ocui.ColumnType.TXT, data: { value: 'name' }},
            { label: 'Package',   type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Internal',  type: ocui.ColumnType.TXT, data: { value: 'internalSharingModel' }},
            { label: 'External',  type: ocui.ColumnType.TXT, data: { value: 'externalSharingModel' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.ASC
    };

    /**
     * @description Table for flows
     * @type {ocui.Table}
     */
    flowsTableDefinition = {
        columns: [
            { label: '#',                  type: ocui.ColumnType.IDX },
            { label: 'Score',              type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',               type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',        type: ocui.ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Type',               type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Created date',       type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',      type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',        type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Number of versions', type: ocui.ColumnType.NUM, data: { value: 'versionsCount' }},
            { label: 'Current Version',    type: ocui.ColumnType.URL, data: { value: 'currentVersionRef.url', label: 'currentVersionRef.name' }},
            { label: 'Is it Active?',      type: ocui.ColumnType.CHK, data: { value: 'isVersionActive' }},
            { label: 'Is it the Latest?',  type: ocui.ColumnType.CHK, data: { value: 'isLatestCurrentVersion' }},
            { label: 'Its Running Mode',   type: ocui.ColumnType.TXT, data: { value: 'currentVersionRef.runningMode' }, modifier: { valueIfEmpty: 'No mode specified.' }},
            { label: 'Its API Version',    type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: '# Nodes',            type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.totalNodeCount' }},
            { label: '# DML Create Nodes', type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.dmlCreateNodeCount' }},
            { label: '# DML Delete Nodes', type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.dmlDeleteNodeCount' }},
            { label: '# DML Update Nodes', type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.dmlUpdateNodeCount' }},
            { label: '# Screen Nodes',     type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.screenNodeCount' }},
            { label: 'Its Created date',   type: ocui.ColumnType.DTM, data: { value: 'currentVersionRef.createdDate' }},
            { label: 'Its Modified date',  type: ocui.ColumnType.DTM, data: { value: 'currentVersionRef.lastModifiedDate' }},
            { label: 'Its Description',    type: ocui.ColumnType.TXT, data: { value: 'currentVersionRef.description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Using',              type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',      type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',       type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'currentVersionId', name: 'name' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for process builders
     * @type {ocui.Table}
     */
    processBuildersTableDefinition = this.flowsTableDefinition;
    
    /**
     * @description Table for workflows
     * @type {ocui.Table}
     */
    workflowsTableDefinition = {
        columns: [
            { label: '#',                 type: ocui.ColumnType.IDX },
            { label: 'Score',             type: ocui.ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',              type: ocui.ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Is Active',         type: ocui.ColumnType.CHK,  data: { value: 'isActive' }},
            { label: 'Has Actions',       type: ocui.ColumnType.CHK,  data: { value: 'hasAction' }},
            { label: 'Direct Actions',    type: ocui.ColumnType.OBJS, data: { values: 'actions', template: (r) => `${r.name} (${r.type})` }},
            { label: 'Empty Timetrigger', type: ocui.ColumnType.OBJS, data: { values: 'emptyTimeTriggers', template: (r) => `${r.field} after ${r.delay*1}` }},
            { label: 'Future Actions',    type: ocui.ColumnType.OBJS, data: { values: 'futureActions', template: (r) => `${r.field} after ${r.delay*1}: ${r.name} (${r.type})` }},
            { label: 'Created date',      type: ocui.ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',     type: ocui.ColumnType.DTM,  data: { value: 'lastModifiedDate' }},
            { label: 'Description',       type: ocui.ColumnType.TXT,  data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for roles
     * @type {ocui.Table}
     */
    rolesTableDefinition = {
        columns: [
            { label: '#',                           type: ocui.ColumnType.IDX },
            { label: 'Score',                       type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                        type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Developer Name',              type: ocui.ColumnType.TXT, data: { value: 'apiname' }},
            { label: 'Number of active members',    type: ocui.ColumnType.NUM, data: { value: 'activeMembersCount' }},
            { label: 'Number of inactive members',  type: ocui.ColumnType.NUM, data: { value: 'inactiveMembersCount' }},
            { label: 'Level',                       type: ocui.ColumnType.NUM, data: { value: 'level' }},
            { label: 'Parent',                      type: ocui.ColumnType.URL, data: { value: 'parentRef.url', label: 'parentRef.name' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table for object permissions
     * @type {ocui.Table}
     */
    get objectPermissionsTableDefinition() {
        /** @type {ocui.Table} */
        const table = {
            columns: [
                { label: 'Parent',  type: ocui.ColumnType.URL, data: { value: 'header.url', label: 'header.name' }},
                { label: 'Package', type: ocui.ColumnType.TXT, data: { value: 'header.package' }},
                { label: 'Type',    type: ocui.ColumnType.TXT, data: { value: 'header.type' }},
                { label: 'Custom',  type: ocui.ColumnType.CHK, data: { value: 'header.isCustom' }}
            ],
            orderIndex: 1,
            orderSort: ocui.SortOrder.ASC
        };
        if (this._internalObjectPermissionsDataMatrix) {
            this._internalObjectPermissionsDataMatrix.columnHeaders // returns an array of string representing Object Api names
                .sort()
                .forEach((/** @type {string} */ objectApiName) => {
                    table.columns.push({ label: objectApiName, type: ocui.ColumnType.TXT, data: { value: `data.${objectApiName}` }, orientation: ocui.Orientation.VERTICAL });
                });
        }
        return table;
    }

    /**
     * @description Table for application permissions
     * @type {ocui.Table}
     */
    get appPermissionsTableDefinition() {
        /** @type {ocui.Table} */
        const table = {
            columns: [
                { label: 'Parent',  type: ocui.ColumnType.URL, data: { value: 'header.url', label: 'header.name' }},
                { label: 'Package', type: ocui.ColumnType.TXT, data: { value: 'header.package' }},
                { label: 'Type',    type: ocui.ColumnType.TXT, data: { value: 'header.type' }},
                { label: 'Custom',  type: ocui.ColumnType.CHK, data: { value: 'header.isCustom' }}
            ],
            orderIndex: 1,
            orderSort: ocui.SortOrder.ASC
        };
        if (this._internalAppPermissionsDataMatrix) {
            this._internalAppPermissionsDataMatrix.columnHeaders // returns an array of Object like {id: string, label: string} representing an Application
                .sort((/** @type {{id: string, label: string}} */ a, /** @type {{id: string, label: string}} */b) => { 
                    return a.label < b.label ? -1: 1; 
                })
                .forEach((/** @type {{id: string, label: string}} */ app) => {
                    table.columns.push({ label: app.label, type: ocui.ColumnType.TXT, data: { value: `data.${app.id}` }, orientation: ocui.Orientation.VERTICAL });
                });
        }
        return table;
    }
    
    /**
     * @description Table for field permissions
     * @type {ocui.Table}
     */
    get fieldPermissionsTableDefinition() {
        /** @type {ocui.Table} */
        const table = {
            columns: [
                { label: 'Parent',  type: ocui.ColumnType.URL, data: { value: 'header.url', label: 'header.name' }},
                { label: 'Package', type: ocui.ColumnType.TXT, data: { value: 'header.package' }},
                { label: 'Type',    type: ocui.ColumnType.TXT, data: { value: 'header.type' }},
                { label: 'Custom',  type: ocui.ColumnType.CHK, data: { value: 'header.isCustom' }}
            ],
            orderIndex: 1,
            orderSort: ocui.SortOrder.ASC
        };
        if (this._internalFieldPermissionsDataMatrix) {
            this._internalFieldPermissionsDataMatrix.columnHeaders // returns an array of string representing Field Api names
                .sort()
                .forEach((/** @type {string} */ fieldApiName) => {
                    table.columns.push({ label: fieldApiName, type: ocui.ColumnType.TXT, data: { value: `data.${fieldApiName}` }, orientation: ocui.Orientation.VERTICAL });
                });
        }
        return table;
    }

    /**
     * @description Table for score rules
     * @type {ocui.Table}
     */
    get scoreRulesTableDefinition() {
        /** @type {ocui.Table} */
        const table = {
            columns: [
                { label: 'ID',   type: ocui.ColumnType.NUM, data: { value: 'header.id' }},
                { label: 'Name', type: ocui.ColumnType.TXT, data: { value: 'header.description' }} 
            ],
            orderIndex: 1,
            orderSort: ocui.SortOrder.ASC
        };
        if (this._internalAllScoreRulesDataMatrix) {
            this._internalAllScoreRulesDataMatrix.columnHeaders // returns an array of string representing the static 'label' of the org check class
                .sort()
                .forEach((/** @type {string} */ classLabel) => {
                    table.columns.push({ label: classLabel, type: ocui.ColumnType.CHK, data: { value: `data.${classLabel}` }, orientation: ocui.Orientation.VERTICAL });
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
     * @type {Array<ocui.ExportedTable>}
     */
    get objectInformationExportSource() {
        const sheets = [];
        sheets.push({ 
            header: 'General information',
            columns: [ 'Label', 'Value' ],
            rows: [
                [ 'API Name', this.objectData.apiname ],
                [ 'Package', this.objectData.package ],
                [ 'Singular Label', this.objectData.label ],
                [ 'Plural Label', this.objectData.labelPlural ],
                [ 'Description', this.objectData.description ],
                [ 'Key Prefix', this.objectData.keyPrefix ],
                [ 'Record Count (including deleted ones)', this.objectData.recordCount ],
                [ 'Is Custom?', this.objectData.isCustom ],
                [ 'Feed Enable?', this.objectData.isFeedEnabled ],
                [ 'Most Recent Enabled?', this.objectData.isMostRecentEnabled ],
                [ 'Global Search Enabled?', this.objectData.isSearchable ],
                [ 'Internal Sharing', this.objectData.internalSharingModel ],
                [ 'External Sharing', this.objectData.externalSharingModel ]
            ]
        });
        sheets.push(... ocui.RowsFactory.createAndExport(this.standardFieldsInObjectTableDefinition, this.objectData.standardFields, 'Standard Fields', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(... ocui.RowsFactory.createAndExport(this.customFieldsInObjectTableDefinition, this.objectData.customFieldRefs, 'Custom Fields', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(... ocui.RowsFactory.createAndExport(this.apexTriggersTableDefinition, this.objectData.apexTriggerRefs, 'Apex Triggers', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(... ocui.RowsFactory.createAndExport(this.fieldSetsTableDefinition, this.objectData.fieldSets, 'Field Sets', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(... ocui.RowsFactory.createAndExport(this.layoutsTableDefinition, this.objectData.layouts, 'Page Layouts', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(... ocui.RowsFactory.createAndExport(this.flexiPagesInObjectTableDefinition, this.objectData.flexiPages, 'Lightning Pages', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(... ocui.RowsFactory.createAndExport(this.limitsTableDefinition, this.objectData.limits, 'Limits', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(... ocui.RowsFactory.createAndExport(this.validationRulesInObjectTableDefinition, this.objectData.validationRules, 'Validation Rules', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(... ocui.RowsFactory.createAndExport(this.webLinksTableDefinition, this.objectData.webLinks, 'Web Links', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(... ocui.RowsFactory.createAndExport(this.recordTypesTableDefinition, this.objectData.recordTypes, 'Record Types', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(... ocui.RowsFactory.createAndExport(this.relationshipsTableDefinition, this.objectData.relationships, 'Relationships', ocapi.SecretSauce.GetScoreRuleDescription));
        return sheets;
    }

    /**
     * @description Representation of an export for the global view data
     * @type {Array<ocui.ExportedTable>}
     */
    get globalViewItemsExport() {
        try {
            const sheets = [];
            this._globalViewTransformersKeys.forEach((/** @type {string} */ recipe) => { 
                const transfomer = this._internalTransformers[recipe]; 
                const columnDef = this[transfomer.data.replace(/Data$/, 'Definition')];
                sheets.push(... ocui.RowsFactory.createAndExport(columnDef, this[transfomer.data], transfomer.label, ocapi.SecretSauce.GetScoreRuleDescription));
            });
            return sheets;
        } catch (error) {
            this._showError('Error while exporting global view items:', error);
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