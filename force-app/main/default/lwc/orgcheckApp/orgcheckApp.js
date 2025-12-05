/*global jsforce, fflate*/

import { LightningElement, api } from 'lwc';
import OrgCheckStaticResource from '@salesforce/resourceUrl/OrgCheck_SR';
import * as ocapi from './libs/orgcheck-api.js';
import * as ocui from './libs/orgcheck-ui.js';
// @ts-ignore
import { loadScript } from 'lightning/platformResourceLoader';

const PAGELAYOUT = ocapi.SalesforceMetadataTypes.PAGE_LAYOUT;
const APEXCLASS = ocapi.SalesforceMetadataTypes.APEX_CLASS;
const FLOWVERSION = ocapi.SalesforceMetadataTypes.FLOW_VERSION;
const MAX_ITEMS_IN_HARDCODED_URLS_LIST = 15;
const MAIN_TABS = {
    AUTOMATION: 'automation',
    ANALYTICS: 'analytics',
    BOXES: 'boxes',
    CODE: 'code',
    DATAMODEL: 'datamodel',
    HOME: 'home',
    ORG: 'organization',
    OTHERS: 'others',
    SECURITY: 'security',
    SETTING: 'setting',
    VISUAL: 'visual'
};
Object.freeze(MAIN_TABS);
const MAIN_TABS_VALUES = Object.values(MAIN_TABS);
Object.freeze(MAIN_TABS_VALUES);
const SANITIZE_MAIN_TAB_INPUT = (/** @type {string} */ input) => { 
    if (input === undefined || input === null) throw new Error('Input is undefined or null');
    if (typeof input !== 'string') throw new Error('Input is not a string'); 
    const normalized = input.trim().toLowerCase(); 
    if (MAIN_TABS_VALUES.includes(normalized) === false) { 
        throw new Error(`Input <${input}> is not a valid main tab value`);
    } 
    return normalized;
};

export default class OrgcheckApp extends LightningElement {

    /**
     * @description Text encoder
     * @type {TextEncoder}
     * @public
     */ 
    @api textEncoder;

    /**
     * @description Text decoder
     * @type {TextDecoder}
     * @public
     */ 
    @api textDecoder;

    /**
     * @description Local storage
     * @type {Storage}
     * @public
     */ 
    @api localStorage;

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
     * @description True if the current accepted manually the terms (mostly for Production orgs)
     * @type {boolean} 
     * @public
     */
    useOrgCheckManuallyAccepted = false;

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
     * @description Is the export button for Hard-coded URLs View is shown or not
     * @type {boolean}
     * @public
     */
    showhardCodedURLsViewExportButton = false;

    /**
     * @description Current activated tab in the main tab set
     * @type {string}
     * @public
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
     * @description This flag prevents double initialization of the API + UI flow
     * @type {boolean}
     * @private
     */
    _hasInitialized = false;

    /**
     * @description This flag checks that the children components are ready
     * @type {boolean}
     * @private
     */
    _childrenReady = false;

    /**
     * @description This flag checks that the third party libraries were loaded correctly
     * @type {boolean}
     * @private
     */
    _thirdPartyLibsReady = false;

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
     * @description Connected callback - initial setup
     * @public
     */
    connectedCallback() { 
        // Set initial state and safe defaults 
        this.tabLoading = false; 
        this.useOrgCheckInThisOrgConfirmed = false; 
        this.useOrgCheckInThisOrgNeedConfirmation = false; 
        this.useOrgCheckManuallyAccepted = false;
        // If you need to precreate the API object shell without DOM, you can, but do not call spinner/modal here. 
        // Leave real API instantiation to a dedicated method invoked once both preconditions are true. 
    }

    /**
     * @description After the component is fully load let's init some elements and the api
     * @public
     */
    renderedCallback() { 
        // Wire child refs if not wired 
        if (!this._spinner) this._spinner = this.template.querySelector('c-orgcheck-spinner'); 
        if (!this._modal) this._modal = this.template.querySelector('c-orgcheck-modal'); 
        if (!this._filters) this._filters = this.template.querySelector('c-orgcheck-global-filters');
        // Set children ready flag
        if (this._spinner && this._modal && this._filters && !this._childrenReady) this._childrenReady = true;
        // Kick off initial flow once when both accessToken is present and children are ready. 
        if (!this._hasInitialized && this._childrenReady && this.accessToken) {
            this._hasInitialized = true; 
            // Defer heavy work to a microtask to avoid re-entrancy in rendering
            Promise.resolve().then(() => this._initApi()); 
        }
    }

    /**
     * @description Initialize the Org Check API mostly
     * @private
     * @async
     */
    async _initApi() {

        // Load the third party scripts
        await Promise.all([
            loadScript(this, OrgCheckStaticResource + '/js/jsforce.js'),
            loadScript(this, OrgCheckStaticResource + '/js/fflate.js')
        ]);

        // Load the Org Check API
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
                 * @param {string} key - The key to set
                 * @param {string} value - The value to set
                 */
                setItem: (key, value) => { this.localStorage.setItem(key, value); },
                /**
                 * @description Get an item from the local storage
                 * @param {string} key - The key to set
                 * @returns {string} The stored value for the given key
                 */
                getItem: (key) => { return this.localStorage.getItem(key); },
                /**
                 * @description Removes an item from the local storage
                 * @param {string} key - The key to remove
                 */
                removeItem: (key) => { this.localStorage.removeItem(key); },
                /**
                 * @description Get all the keys in the storage
                 * @returns {Array<string>} List of keys
                 */
                keys: () => {  
                    const keys = []; 
                    for (let i = 0; i < this.localStorage.length; i++) {
                        keys.push(this.localStorage.key(i)); 
                    }
                    return keys; }
            },
            // -----------------------
            // Encoding methods
            { 
                /** 
                 * @description Encoding method
                 * @param {string} data - Input data
                 * @returns {Uint8Array} Output data
                 */ 
                encode: (data) => { return this.textEncoder.encode(data); }, 
                /** 
                 * @description Decoding method
                 * @param {Uint8Array} data - Input data
                 * @returns {string} Output data
                 */ 
                decode: (data) => { return this.textDecoder.decode(data); }
            },            
            // -----------------------
            // Compression methods
            { 
                /** 
                 * @description Compress method
                 * @param {Uint8Array} data - Input data
                 * @returns {Uint8Array} Output data
                 */ 
                compress:   (data) => { 
                    // @ts-ignore
                    return fflate.zlibSync(data, { level: 9 }); 
                },
                /** 
                 * @description Decompress method
                 * @param {Uint8Array} data - Input data
                 * @returns {Uint8Array} Output data
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
                 * @returns {boolean} true if this logger is a console fallback logger, false otherwise
                 */
                isConsoleFallback: () => { return true; },
                /**
                 * @description Standard log method
                 * @param {string} section - The section name
                 * @param {string} message - The message to log
                 */ 
                log: (section, message) => { this._spinner?.sectionLog(section, message); },
                /**
                 * @description Log method when task is ended
                 * @param {string} section - The section name
                 * @param {string} message - The message to log
                 */ 
                ended: (section, message) => { this._spinner?.sectionEnded(section, message); },
                /**
                 * @description Log method when task has just failed
                 * @param {string} section - The section name
                 * @param {string | Error} error - The error to log
                 */ 
                failed: (section, error) => { this._spinner?.sectionFailed(section, error); }
            }
        );
 
        // Get the score rules matrix once here
        this._internalAllScoreRulesDataMatrix = this._api?.getAllScoreRulesAsDataMatrix();

        // Update the cache information when we are finish loading everything
        this._updateCacheInformation();

        // Load basic information if the user has already accepted the terms
        await this._loadBasicInformationIfAccepted();
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
        if (this._filters?.isSelectedPackageAny === true) {
            return '*';
        }
        if (this._filters?.isSelectedPackageNo === true) {
            return '';
        }
        return this._filters?.selectedPackage;
    }

    /**
     * @description Getter for the selected sobject type from the global filter
     * @returns {string} Wildcard ('*') if 'any type' selected, otherwise the name of the seleted type.
     * @private
     */ 
    get objectType() {
        if (this._filters?.isSelectedSObjectTypeAny === true) {
            return '*';
        }
        return this._filters?.selectedSObjectType;
    }

    /**
     * @description Getter for the selected sobject name from the global filter
     * @returns {string} Wildcard ('*') if 'any sobject' selected, otherwise the name of the seleted sobject.
     * @private
     */ 
    get object() {
        if (this._filters?.isSelectedSObjectApiNameAny === true) {
            this.isObjectSpecified = false;
            return '*';
        }
        this.isObjectSpecified = true;
        return this._filters?.selectedSObjectApiName;
    }





    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Some other getter for the UI
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description Do we show the "Apex Uncompiled" button in the Apex tab (depends on the size of apexUncompiledTableData)
     * @type {boolean}
     * @public
     */ 
    get isThereAnyApexUncompiled() {
        return this.selectedSubTab === 'apex-uncompiled' && this.apexUncompiledTableData?.length > 0 || false;
    }

    /**
     * @description Some tabs require object to be specified in the filter (like Object Description and Field Permissions)
     * @type {boolean}
     */ 
    isObjectSpecified;






    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Wrapper part between the Org Check API and the UI
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    _aliasNone = () => '';
    _aliasNamespace = () => `${this.namespace}`;
    _aliasAll = () => `${this.namespace}-${this.objectType}-${this.object}`;
    _aliasObjNamespace = () => `${this.object}-${this.namespace}`;
    _aliasObject = () => `${this.object}`;
    _aliasTypeNamespace = () => `${this.namespace}-${this.objectType}`;

    /**
     * @description List of internal transformers to get data from the API
     * @type {any}
     * @private
     */
    _internalTransformers = Object.freeze({
        'apex-classes':              { label: '❤️‍🔥 Apex Classes',               tab: MAIN_TABS.CODE,            data: 'apexClassesTableData',                  remove: () => { this._api?.removeAllApexClassesFromCache(); },              getAlias: this._aliasNamespace,     get: async () => { return this._api?.getApexClasses(this.namespace); }},
        'apex-tests':                { label: '🚒 Apex Unit Tests',            tab: MAIN_TABS.CODE,            data: 'apexTestsTableData',                    remove: () => { this._api?.removeAllApexTestsFromCache(); },                getAlias: this._aliasNamespace,     get: async () => { return this._api?.getApexTests(this.namespace); }},
        'apex-triggers':             { label: '🧨 Apex Triggers',              tab: MAIN_TABS.CODE,            data: 'apexTriggersTableData',                 remove: () => { this._api?.removeAllApexTriggersFromCache(); },             getAlias: this._aliasNamespace,     get: async () => { return this._api?.getApexTriggers(this.namespace); }},
        'apex-uncompiled':           { label: '🌋 Apex Uncompiled',            tab: MAIN_TABS.CODE,            data: 'apexUncompiledTableData',               remove: () => { this._api?.removeAllApexUncompiledFromCache(); },           getAlias: this._aliasNamespace,     get: async () => { return this._api?.getApexUncompiled(this.namespace); }},
        'app-permissions':           { label: '⛕ Application Permissions',    tab: MAIN_TABS.SECURITY,        data: '_internalAppPermissionsDataMatrix',     remove: () => { this._api?.removeAllAppPermissionsFromCache(); },           getAlias: this._aliasNamespace,      get: async () => { return this._api?.getApplicationPermissionsPerParent(this.namespace); }},
        'browsers':                  { label: '🌐 Browsers Used in Org',       tab: MAIN_TABS.SECURITY,        data: 'browsersTableData',                     remove: () => { this._api?.removeAllBrowsersFromCache(); },                 getAlias: this._aliasNone,          get: async () => { return this._api?.getBrowsers(); }},
        'collaboration-groups':      { label: '🦙 Chatter Groups',             tab: MAIN_TABS.BOXES,           data: 'chatterGroupsTableData',                remove: () => { this._api?.removeAllChatterGroupsFromCache(); },            getAlias: this._aliasNone,          get: async () => { return this._api?.getChatterGroups(); }},
        'custom-fields':             { label: '🏈 Custom Fields',              tab: MAIN_TABS.DATAMODEL,       data: 'customFieldsTableData',                 remove: () => { this._api?.removeAllCustomFieldsFromCache(); },             getAlias: this._aliasAll,           get: async () => { return this._api?.getCustomFields(this.namespace, this.objectType, this.object); }},
        'custom-labels':             { label: '🏷️ Custom Labels',              tab: MAIN_TABS.SETTING,         data: 'customLabelsTableData',                 remove: () => { this._api?.removeAllCustomLabelsFromCache(); },             getAlias: this._aliasNamespace,     get: async () => { return this._api?.getCustomLabels(this.namespace); }},
        'custom-tabs':               { label: '🥠 Custom Tabs',                tab: MAIN_TABS.VISUAL,          data: 'customTabsTableData',                   remove: () => { this._api?.removeAllCustomTabsFromCache(); },               getAlias: this._aliasNamespace,     get: async () => { return this._api?.getCustomTabs(this.namespace); }},
        'documents':                 { label: '🚧 Documents',                  tab: MAIN_TABS.SETTING,         data: 'documentsTableData',                    remove: () => { this._api?.removeAllDocumentsFromCache(); },                getAlias: this._aliasNamespace,     get: async () => { return this._api?.getDocuments(this.namespace); }},
        'dashboards':                { label: '🌲 Dashboards',                 tab: MAIN_TABS.ANALYTICS,       data: 'dashboardsTableData',                   remove: () => { this._api?.removeAllDashboardsFromCache(); },               getAlias: this._aliasNone,          get: async () => { return this._api?.getDashboards(); }},
        'email-templates':           { label: '🌇 Email Templates',            tab: MAIN_TABS.SETTING,         data: 'emailTemplatesTableData',               remove: () => { this._api?.removeAllEmailTemplatesFromCache(); },           getAlias: this._aliasNamespace,     get: async () => { return this._api?.getEmailTemplates(this.namespace); }},
        'field-permissions':         { label: '🚧 Field Level Securities',     tab: MAIN_TABS.SECURITY,        data: '_internalFieldPermissionsDataMatrix',   remove: () => { this._api?.removeAllFieldPermissionsFromCache(); },         getAlias: this._aliasObjNamespace,  get: async () => { return this._api?.getFieldPermissionsPerParent(this.object, this.namespace); }},
        'flows':                     { label: '🏎️ Flows',                      tab: MAIN_TABS.AUTOMATION,      data: 'flowsTableData',                        remove: () => { this._api?.removeAllFlowsFromCache(); },                    getAlias: this._aliasNone,          get: async () => { return this._api?.getFlows(); }},
        'global-view':               { label: '🏞️ Overview',                   tab: MAIN_TABS.ORG,             data: '_internalGlobalViewDataFromAPI',        remove: () => { this._api?.removeGlobalViewFromCache(); },                  getAlias: this._aliasNone,          get: async () => { return this._api?.getGlobalView(); }},
        'hard-coded-urls-view':      { label: '🏖️ Hard-coded URLs',            tab: MAIN_TABS.ORG,             data: '_internalHardCodedURLsViewDataFromAPI', remove: () => { this._api?.removeHardcodedURLsFromCache(); },               getAlias: this._aliasNone,          get: async () => { return this._api?.getHardcodedURLsView(); }},
        'home-page-components':      { label: '🍩 Home Page Components',       tab: MAIN_TABS.VISUAL,          data: 'homePageComponentsTableData',           remove: () => { this._api?.removeAllHomePageComponentsFromCache(); },       getAlias: this._aliasNone,          get: async () => { return this._api?.getHomePageComponents(); }},
        'internal-active-users':     { label: '👥 Active Internal Users',      tab: MAIN_TABS.SECURITY,        data: 'usersTableData',                        remove: () => { this._api?.removeAllActiveUsersFromCache(); },              getAlias: this._aliasNone,          get: async () => { return this._api?.getActiveUsers(); }},
        'knowledge-articles':        { label: '📚 Knowledge Articles',         tab: MAIN_TABS.SETTING,         data: 'knowledgeArticlesTableData',            remove: () => { this._api?.removeAllKnowledgeArticlesFromCache(); },        getAlias: this._aliasNone,          get: async () => { return this._api?.getKnowledgeArticles(); }},
        'lightning-aura-components': { label: '🧁 Lightning Aura Components',  tab: MAIN_TABS.VISUAL,          data: 'auraComponentsTableData',               remove: () => { this._api?.removeAllLightningAuraComponentsFromCache(); },  getAlias: this._aliasNamespace,     get: async () => { return this._api?.getLightningAuraComponents(this.namespace); }},
        'lightning-pages':           { label: '🎂 Lightning Pages',            tab: MAIN_TABS.VISUAL,          data: 'flexiPagesTableData',                   remove: () => { this._api?.removeAllLightningPagesFromCache(); },           getAlias: this._aliasNamespace,     get: async () => { return this._api?.getLightningPages(this.namespace); }},
        'lightning-web-components':  { label: '🍰 Lightning Web Components',   tab: MAIN_TABS.VISUAL,          data: 'lightningWebComponentsTableData',       remove: () => { this._api?.removeAllLightningWebComponentsFromCache(); },   getAlias: this._aliasNamespace,     get: async () => { return this._api?.getLightningWebComponents(this.namespace); }},
        'object':                    { label: '🎳 Object Documentation',       tab: MAIN_TABS.DATAMODEL,       data: 'objectData',                            remove: () => { this._api?.removeObjectFromCache(this.object); },           getAlias: this._aliasObject,        get: async () => { return this.object !== '*' ? this._api?.getObject(this.object) : undefined; }},
        'object-permissions':        { label: '🚦 Object Permissions',         tab: MAIN_TABS.SECURITY,        data: '_internalObjectPermissionsDataMatrix',  remove: () => { this._api?.removeAllObjectPermissionsFromCache(); },        getAlias: this._aliasNamespace,     get: async () => { return this._api?.getObjectPermissionsPerParent(this.namespace); }},
        'objects':                   { label: '🏉 Objects',                    tab: MAIN_TABS.DATAMODEL,       data: 'objectsTableData',                      remove: () => { this._api?.removeAllObjectsFromCache(); },                  getAlias: this._aliasTypeNamespace, get: async () => { return this._api?.getObjects(this.namespace, this.objectType); }},
        'page-layouts':              { label: '🏓 Page Layouts',               tab: MAIN_TABS.SECURITY,        data: 'pageLayoutsTableData',                  remove: () => { this._api?.removeAllPageLayoutsFromCache(); },              getAlias: this._aliasAll,           get: async () => { return this._api?.getPageLayouts(this.namespace, this.objectType, this.object); }},
        'permission-sets':           { label: '🚔 Permission Sets',            tab: MAIN_TABS.SECURITY,        data: 'permissionSetsTableData',               remove: () => { this._api?.removeAllPermSetsFromCache(); },                 getAlias: this._aliasNamespace,     get: async () => { return this._api?.getPermissionSets(this.namespace); }},
        'permission-set-licenses':   { label: '🚔 Permission Set Licenses',    tab: MAIN_TABS.SECURITY,        data: 'permissionSetLicensesTableData',        remove: () => { this._api?.removeAllPermSetLicensesFromCache(); },          getAlias: this._aliasNone,          get: async () => { return this._api?.getPermissionSetLicenses(); }},
        'process-builders':          { label: '🛺 Process Builders',           tab: MAIN_TABS.AUTOMATION,      data: 'processBuildersTableData',              remove: () => { this._api?.removeAllProcessBuildersFromCache(); },          getAlias: this._aliasNone,          get: async () => { return this._api?.getProcessBuilders(); }},
        'profile-password-policies': { label: '⛖ Profile Password Policies',  tab: MAIN_TABS.SECURITY,        data: 'profilePasswordPoliciesTableData',      remove: () => { this._api?.removeAllProfilePasswordPoliciesFromCache(); },  getAlias: this._aliasNone,          get: async () => { return this._api?.getProfilePasswordPolicies(); }},
        'profile-restrictions':      { label: '🚸 Profile Restrictions',       tab: MAIN_TABS.SECURITY,        data: 'profileRestrictionsTableData',          remove: () => { this._api?.removeAllProfileRestrictionsFromCache(); },      getAlias: this._aliasNamespace,     get: async () => { return this._api?.getProfileRestrictions(this.namespace); }},
        'profiles':                  { label: '🚓 Profiles',                   tab: MAIN_TABS.SECURITY,        data: 'profilesTableData',                     remove: () => { this._api?.removeAllProfilesFromCache(); },                 getAlias: this._aliasNamespace,     get: async () => { return this._api?.getProfiles(this.namespace); }},
        'public-groups':             { label: '🐘 Public Groups',              tab: MAIN_TABS.BOXES,           data: 'publicGroupsTableData',                 remove: () => { this._api?.removeAllPublicGroupsFromCache(); },             getAlias: this._aliasNone,          get: async () => { return this._api?.getPublicGroups(); }},
        'queues':                    { label: '🦒 Queues',                     tab: MAIN_TABS.BOXES,           data: 'queuesTableData',                       remove: () => { this._api?.removeAllQueuesFromCache(); },                   getAlias: this._aliasNone,          get: async () => { return this._api?.getQueues(); }},
        'record-types':              { label: '🏏 Record Types',               tab: MAIN_TABS.DATAMODEL,       data: 'recordTypesTableData',                  remove: () => { this._api?.removeAllRecordTypesFromCache(); },              getAlias: this._aliasAll,           get: async () => { return this._api?.getRecordTypes(this.namespace, this.objectType, this.object); }},
        'reports':                   { label: '🌳 Reports',                    tab: MAIN_TABS.ANALYTICS,       data: 'reportsTableData',                      remove: () => { this._api?.removeAllReportsFromCache(); },                 getAlias: this._aliasNone,          get: async () => { return this._api?.getReports(); }},
        'static-resources':          { label: '🗿 Static Resources',           tab: MAIN_TABS.SETTING,         data: 'staticResourcesTableData',              remove: () => { this._api?.removeAllStaticResourcesFromCache(); },          getAlias: this._aliasNamespace,     get: async () => { return this._api?.getStaticResources(this.namespace); }},
        'user-roles':                { label: '🦓 Internal Role Listing',      tab: MAIN_TABS.BOXES,           data: 'rolesTableData',                        remove: () => { this._api?.removeAllRolesFromCache(); },                    getAlias: this._aliasNone,          get: async () => { return this._api?.getRoles(); }},
        'user-roles-hierarchy':      { label: '🐙 Internal Role Explorer',     tab: MAIN_TABS.BOXES,           data: 'rolesTree',                             remove: () => { this._api?.removeAllRolesFromCache(); },                    getAlias: this._aliasNone,          get: async () => { return this._api?.getRolesTree(); }},
        'validation-rules':          { label: '🎾 Validation Rules',           tab: MAIN_TABS.DATAMODEL,       data: 'validationRulesTableData',              remove: () => { this._api?.removeAllValidationRulesFromCache(); },          getAlias: this._aliasAll,           get: async () => { return this._api?.getValidationRules(this.namespace, this.objectType, this.object); }},
        'visualforce-components':    { label: '🍞 Visualforce Components',     tab: MAIN_TABS.VISUAL,          data: 'visualForceComponentsTableData',        remove: () => { this._api?.removeAllVisualForceComponentsFromCache(); },    getAlias: this._aliasNamespace,     get: async () => { return this._api?.getVisualForceComponents(this.namespace); }},
        'visualforce-pages':         { label: '🥖 Visualforce Pages',          tab: MAIN_TABS.VISUAL,          data: 'visualForcePagesTableData',             remove: () => { this._api?.removeAllVisualForcePagesFromCache(); },         getAlias: this._aliasNamespace,     get: async () => { return this._api?.getVisualForcePages(this.namespace); }},
        'web-links':                 { label: '🏑 Web Links',                  tab: MAIN_TABS.DATAMODEL,       data: 'webLinksTableData',                     remove: () => { this._api?.removeAllWeblinksFromCache(); },                 getAlias: this._aliasAll,           get: async () => { return this._api?.getWeblinks(this.namespace, this.objectType, this.object); }},
        'workflows':                 { label: '🚗 Workflows',                  tab: MAIN_TABS.AUTOMATION,      data: 'workflowsTableData',                    remove: () => { this._api?.removeAllWorkflowsFromCache(); },                getAlias: this._aliasNone,          get: async () => { return this._api?.getWorkflows(); }}
    });

    /**
     * @description List of expected sub tab values (from the UI)
     * @type {ReadonlyArray<string>}
     * @private
     */
    _subTabsValidValues = Object.freeze(Object.keys(this._internalTransformers));

    /**
     * @description Call a specific Recipe from the API given a recipe name (does not have to be the internal name, up to the UI)
     * @param {string} recipe - The alias of the alias to use
     * @param {boolean} [forceRefresh] - Do we force the refresh or not (false by default)
     * @param {boolean} [lazyRefresh] - Is it a lazy refresh or not (true by default)
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
        const dailyApiInformation = this._api?.dailyApiRequestLimitInformation;
        if (dailyApiInformation && dailyApiInformation.currentUsagePercentage) {
            if (dailyApiInformation.isGreenZone === true) this.themeForOrgLimit = 'slds-theme_success';
            else if (dailyApiInformation.isYellowZone === true) this.themeForOrgLimit = 'slds-theme_warning';
            else /* if (dailyApiInformation.isRedZone === true) */ this.themeForOrgLimit = 'slds-theme_error';
            this.orgLimit = `Daily API Request Limit: ${dailyApiInformation.currentUsagePercentage}%`;    
        } else {
            this.orgLimit = undefined;
        }
    }

    /**
     * @description Update the api cache information in the UI from the API
     * @private
     */ 
    _updateCacheInformation() {
        this.cacheManagerData = this._api?.getCacheInformation();
    }

    /**
     * @description Check if the terms are accepted and thus we can continue to use this org
     * @private
     * @async
     */ 
    async _checkTermsAcceptance() {
        if (await this._api?.checkUsageTerms()) {
            this.useOrgCheckInThisOrgNeedConfirmation = false;
            this.useOrgCheckInThisOrgConfirmed = true;
        } else {
            this.useOrgCheckInThisOrgNeedConfirmation = true;
            this.useOrgCheckInThisOrgConfirmed = false;
        }
        this.useOrgCheckManuallyAccepted = this._api?.wereUsageTermsAcceptedManually();
    }

    /**
     * @description Load basic information to use the app (including the filters)
     * @param {ocapi.LoggerIntf} [logger] - The logger
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
        await this._api?.checkCurrentUserPermissions(); // if no perm this throws an error

        // Information about the org
        logger?.log('Information about the org...');
        const orgInfo = await this._api?.getOrganizationInformation();
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
     * @param {boolean} [forceRefresh] - Do we force the refresh or not (false by default)
     * @param {ocapi.LoggerIntf} [logger] - The logger
     * @private
     * @async
     */ 
    async _loadFilters(forceRefresh=false, logger) {
        logger?.log('Hide the filter panel...');
        this._filters?.hide();

        if (forceRefresh === true) {
            logger?.log('Clean data from cache (if any)...');
            this._api?.removeAllObjectsFromCache();
            this._api?.removeAllPackagesFromCache();
        }

        logger?.log('Get packages, types and objects from the org...');
        const filtersData = await Promise.all([
            this._api?.getPackages(),
            this._api?.getObjectTypes(),
            this._api?.getObjects(this.namespace, this.objectType)
        ])

        logger?.log('Loading data in the drop boxes...');
        this._filters?.updatePackageOptions(filtersData[0]);
        this._filters?.updateSObjectTypeOptions(filtersData[1]);
        this._filters?.updateSObjectApiNameOptions(filtersData[2]);

        logger?.log('Showing the filter panel...');
        this._filters?.show();

        logger?.log('Update the daily API limit informations...');
        this._updateLimits();
    }

    /**
     * @description Unique method to propagate a change to be done in the current tab. DOES NOT THROW any error
     * @private
     * @async
     */
    async _updateCurrentTab() {
        const TAB_SECTION = `Tab "${this.selectedSubTab}"`;
        this.tabLoading = true;
        try {
            this._spinner?.open();
            this._spinner?.sectionLog(TAB_SECTION, `C'est parti!`);
            switch (this.selectedSubTab) {
                case 'welcome': this._updateCacheInformation(); break;
                default:        await this._updateData(this.selectedSubTab);
            }
            this._spinner?.sectionEnded(TAB_SECTION, `Done.`);
            this._spinner?.close(0);
        } catch (error) {
            this._spinner?.sectionFailed(TAB_SECTION, error);
        } finally {
            this._updateLimits();
            this.tabLoading = false;
        }
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
        await this._updateCurrentTab(); // this method does not throw any error so it is safe to just call it
    }

    /**
     * @description The "refresh" button in the global filters was pushed, therefore the filters needs to be reloaded
     * @public
     * @async
     */
    async handleFiltersRefreshed() {
        try {
            await this._loadFilters(true);
        } catch(e) {
            this._showError('Error while handleFiltersRefreshed', e);
        }
    }

    /**
     * @description When the org is a production, we show a message and a checkbox. This event is triggered when the user clicks on this checkbox.
     *              This should activate the usage of the Salesforce API from Org Check API.
     * @param {Event | any} event - The event information
     * @public
     * @async
     */
    async handleClickUsageAcceptance(event) {
        // The source of the event is the acceptance checkbox
        const checkbox = event?.target;
        // do nothing if we did not find the checkbox (weird!!)
        if (!checkbox) return;
        try {
            // is it checked?
            // @ts-ignore
            if (checkbox.checked === true) {
                // yes it is!
                this._api?.acceptUsageTermsManually();
                await this._loadBasicInformationIfAccepted();
            }
            // do nothing if it is not checked.
        } catch(e) {
            this._showError('Error while handleClickUsageAcceptance', e);
        }
    }

    /**
     * @description Event called when user selects a main tab
     * @param {Event | any} event - The event information
     * @public
     * @async
     */
    async handleMainTabActivation(event) {
        try {
            // The source of the event is the main tab
            const mainTab = event.target;
            // @ts-ignore
            this.selectedMainTab = SANITIZE_MAIN_TAB_INPUT(mainTab?.value);
            // In each main tab there is an inner tabset with tabs (called SubTabs here)
            // Get a reference of the sub tabset (undefined if not found)
            // @ts-ignore
            const subTabSet = mainTab.querySelector('lightning-tabset');
            // Get the active tab value of this sub tab set (it should be the last activated sub tab)
            // NOTE: the previous value could be the one from the previous tab opened ONLY IF the next tab was not yet rendered
            const subTabActivated = subTabSet?.activeTabValue;
            // Get the list of sub tabs
            // @ts-ignore
            const subTabs = mainTab.querySelectorAll('lightning-tab');
            // Get the list of tabs' name
            const subTabsAvailable = Array.from(subTabs)?.map(t => t.value).filter(v => this._subTabsValidValues.includes(v));

            if (subTabsAvailable.includes(this.selectedSubTab)) {
                // If the sub tab was specifically set align it with the sub tab
                subTabSet.activeTabValue = this.selectedSubTab;
            } else if (subTabsAvailable.includes(subTabActivated)) {
                // Now if the subTabActivated is part of the list subTabsAvailable we select it
                this.selectedSubTab = subTabActivated;
            } else {
                // if not the tab was not yet rendered, so we are going to select the first tab in the list
                this.selectedSubTab = subTabsAvailable[0];
            }
        } catch (e) {
            this._showError('Error while handleMainTabActivation', e);
        }
    }

    /**
     * @description Event called when user selects a sub tab (within a main tab)
     * @param {Event | any} event - The event information
     * @public
     * @async
     */
    async handleSubTabActivation(event) {
        try {
            // The source of the event is a sub tab
            const subTab = event?.target; // not throwing any error
            // That subTab's name will be the next currentTab
            // @ts-ignore
            const nextCurrentSubTab = subTab.value; // not throwing any error
            // Store the curret sub tab
            this.selectedSubTab = nextCurrentSubTab;
            // Ask to update the current data
            await this._updateCurrentTab(); // not throwing any error here!
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
        try {
            // try to call the corresponding API method
            this._api?.removeAllFromCache(); // may throw an error
            // and reload
            window.location.reload();
        } catch (e) {
            this._showError('Error while handleRemoveAllCache', e);
        }
    }

    /**
     * @description Method called when the user ask to log a specific cache item in the console
     * @param {Event | any} event - The event information
     * @public
     */ 
    handleLogCacheItem(event) {
        // Get attribute data-item-name
        const itemName = event?.target?.getAttribute('data-item-name');
        // Get the data from cache
        const cacheData = this._api?.getCacheData(itemName);
        // Dump the cache in the dialogBox
        let htmlContent = '';
        if (cacheData === null || cacheData === undefined) {
            htmlContent += 'There is no data in the cache for this item.';
        } else if (cacheData instanceof Map) {
            htmlContent += `<b>Type:</b> Map<br /><br /><b>Size:</b> ${cacheData.size}<br /><br /><b>Content:</b><ul>`;
            Array.from(cacheData.entries()).forEach((entry, index) => {
                htmlContent += `<li><b>INDEX:</b> ${index}, <b>KEY:</b> ${entry[0]}, <b>VALUE:</b> ${JSON.stringify(entry[1])}</li>`;
            });
            htmlContent += '</ul>';
        } else if (Array.isArray(cacheData)) {
            htmlContent += `<b>Type:</b> Array<br /><br /><b>Size:</b> ${cacheData.length}<br /><br /><b>Content:</b><ul>`;
            cacheData.forEach((value, index) => console.error(`<li><b>INDEX:</b> ${index}, <b>VALUE:</b> ${JSON.stringify(value)}</li>`))
            htmlContent += '</ul>';
        } else {
            htmlContent += `<b>Type:</b> ${typeof cacheData}<br /><br /><b>Content:</b><br />`;
            htmlContent += JSON.stringify(cacheData);
        }
        // show the modal
        this._openModal(`Dump of the browser cache for item: ${itemName}`, htmlContent);
    }

    /**
     * @description Event called when the user clicks on the "View Score" button on a data table
     * @param {Event | any} event - The event information
     * @public
     */ 
    handleViewScore(event) {
        // The event should contain a detail property
        // @ts-ignore
        const detail = event?.detail;
        if (detail) {
            try {
                // prepare the modal content
                let htmlContent = `The component <code><b>${detail.whatName}</b></code> (<code>${detail.whatId}</code>) has a `+
                                `score of <b><code>${detail.score}</code></b> because of the following reasons:<br /><ul>`;
                detail.reasonIds?.forEach((/** @type {number} */ id) => {
                    const reason = ocapi.SecretSauce.GetScoreRule(id); // may throw an error
                    if (reason) {
                        htmlContent += `<li><b>${reason.description}</b>: <i>${reason.errorMessage}</i></li>`;
                    }
                });
                htmlContent += '</ul>';
                // show the modal
                this._openModal(`Understand the Score of "${detail.whatName}" (${detail.whatId})`, htmlContent);
            } catch (e) {
                // in case ocapi.SecretSauce.GetScoreRule threw an error!
                this._showError('Error while handleViewScore', e);
           }
        }
    }

    /**
     * @description Event called when the user clicks on the "Run All Tests" button in the Apex tab
     * @async
     * @public
     */ 
    async handleClickRunAllTests() {
        try {
            const LOG_SECTION = 'RUN ALL TESTS';
            this._spinner?.open();
            this._spinner?.sectionLog(LOG_SECTION, 'Launching...');
            try {
                const asyncApexJobId = await this._api?.runAllTestsAsync();
                this._spinner?.sectionEnded(LOG_SECTION, 'Done!');
                this._spinner?.close(0);

                let htmlContent = 'We asked Salesforce to run all the test classes in your org.<br /><br />';
                htmlContent += 'For more information about the success of these tests, you can:<br /><ul>';
                htmlContent += '<li>Go <a href="/lightning/setup/ApexTestQueue/home" target="_blank" rel="external noopener noreferrer">here</a> to see the results of these tests.</li>';
                htmlContent += `<li>Check with Tooling API the status of the following record: /tooling/sobjects/AsyncApexJob/${asyncApexJobId}</li><ul>`;
                this._openModal('Asynchronous Run All Test Asked', htmlContent);

            } catch (error) {
                this._spinner?.sectionFailed(LOG_SECTION, error);
            }
        } catch (e) {
            this._showError('Error while handleClickRunAllTests', e);
        }
    }

    /**
     * @description Event called when the user clicks on the "Refresh" button from the current tab
     * @param {Event | any} event - The event information
     * @async
     * @public
     */ 
    async handleClickRefreshCurrentTab(event) {
        try {
            // @ts-ignore
            const recipes = event.target.getAttribute('data-recipes')?.split(',');
            await Promise.all(recipes?.map(async (/** @type {string} */ recipe) => { await this._updateData(recipe, true); } ));
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
        try {
            this._spinner?.open();
            const LOG_SECTION = 'RECOMPILE';
            const apexClassNamesById = new Map();
            this._spinner?.sectionLog(LOG_SECTION, 'Processing...');
            this.apexUncompiledTableData.slice(0, 25).forEach(c => {
                this._spinner?.sectionLog(`${LOG_SECTION}-${c.id}`, `Asking to recompile class: ${c.name}`);
                apexClassNamesById.set(c.id, c.name);
            });
            const responses = await this._api?.compileClasses(Array.from(apexClassNamesById.keys()));
            this._spinner?.sectionLog(LOG_SECTION, 'Done');
            responses.forEach(r => r.compositeResponse?.filter(cr => cr.referenceId?.startsWith('01p')).forEach(cr => {
                const classId = cr.referenceId.substring(0, 15);
                const className = apexClassNamesById.get(cr.referenceId);
                if (cr.body.success === true) {
                    this._spinner?.sectionEnded(`${LOG_SECTION}-${classId}`, `Recompilation requested for class: ${className}`);
                } else {
                    let reasons = [];
                    if (cr.body && Array.isArray(cr.body)) {
                        reasons = cr.body;
                    } else if (cr.errors && Array.isArray(cr.errors)) {
                        reasons = cr.errors;
                    }
                    this._spinner?.sectionFailed(`${LOG_SECTION}-${classId}`, `Errors for class ${className}: ${reasons?.map(e => JSON.stringify(e)).join(', ')}`);
                }
            }));
            this._spinner?.sectionEnded(LOG_SECTION, 'Please hit the Refresh button (in Org Check) to get the latest data from your Org.  By the way, in the future, if you need to recompile ALL the classes, go to "Setup > Custom Code > Apex Classes" and click on the link "Compile all classes".');
        } catch (e) {
            this._showError('Error while handleClickRecompile', e);
        }
    }

    /**
     * @description Event called when the user clicks on a button to open a sub tab
     * @param {Event | any} event - The event information
     * @public
     */
    handleOpenSubTab(event) {
        try {
            // The source of the event is a button with a specific attribute
            const button = event?.target; // not throwing any error
            // The button should have an attribute called data-tab 
            // @ts-ignore
            const tab = button.getAttribute('data-tab');
            // Split the tab value into two elements one for the main tab and the other for the sub tab
            const elements = tab.split(':');
            // call the navigation method
            this._navigateToTab( elements[0], elements[1] );
        } catch (e) {
            this._showError('Error while handleOpenSubTab', e);
        }
    }




    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Navigation and Showing modals methods
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    
    /**
     * @description Navigate to a specific tab and sub tab
     * @param {string} mainTab - The main tab to navigate to
     * @param {string} subTab - The sub tab to navigate to
     * @private
     */
    _navigateToTab(mainTab, subTab) {
        this.selectedMainTab = mainTab;
        this.selectedSubTab = subTab;
    }

    /**
     * @description Open a modal with specific title and HTML content
     * @param {string} title Title of the modal
     * @param {string} htmlContent HTML content of the modal
     */
    _openModal(title, htmlContent) {
        this._modal?.open(title, htmlContent);
    }

    /**
     * @description Show the error in a modal (that can be closed)
     * @param {string} title - The title of the modal
     * @param {Error} error - The error to show in the error modal
     * @private
     */ 
    _showError(title, error) {
        const htmlContent = `<font color="red">Sorry! An error occurred while processing... <br /><br />`+
                            `Please create an issue on <a href="https://github.com/SalesforceLabs/OrgCheck/issues" target="_blank" rel="external noopener noreferrer">Org Check Issues tracker</a> `+
                            `along with the context, a screenshot and the following error. <br /><br /> `+
                            `<ul><li>Message: <code>${error?.message}</code></li><li>Stack: <code>${error?.stack}</code></li><li>Error as JSON: <code>${JSON.stringify(error)}</code></li></ul></font>`                                
        this._openModal(title, htmlContent);
        console.error(title, error);
    }




    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Column header definition for all data tables in the app
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description Table definition for field sets (specific to the current selected object)
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
     * @description Table definition for page layouts (specific to the current selected object)
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
     * @description Table definition for object limits (specific to the current selected object)
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
     * @description Table definition for validation rules
     * @type {ocui.Table}
     */
    validationRulesTableDefinition = {
        columns: [
            { label: '#',                type: ocui.ColumnType.IDX },
            { label: 'Score',            type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',             type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',          type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Object API Name',  type: ocui.ColumnType.TXT, data: { value: 'objectId' }}, 
            { label: 'Object Name',      type: ocui.ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }, modifier: { valueIfEmpty: 'N/A' }}, 
            { label: 'Object Type',      type: ocui.ColumnType.TXT, data: { value: 'objectRef.typeRef.label' }, modifier: { valueIfEmpty: 'N/A' }},
            { label: 'Is Active',        type: ocui.ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Display On Field', type: ocui.ColumnType.TXT, data: { value: 'errorDisplayField' }},
            { label: 'Error Message',    type: ocui.ColumnType.TXT, data: { value: 'errorMessage' }},
            { label: 'Description',      type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Created date',     type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',    type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for validation rules (specific to the current selected object)
     * @type {ocui.Table}
     */
    validationRulesInObjectTableDefinition = {
        columns: [
            { label: '#',                type: ocui.ColumnType.IDX },
            { label: 'Score',            type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',             type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',          type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Is Active',        type: ocui.ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Display On Field', type: ocui.ColumnType.TXT, data: { value: 'errorDisplayField' }},
            { label: 'Error Message',    type: ocui.ColumnType.TXT, data: { value: 'errorMessage' }},
            { label: 'Description',      type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Created date',     type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',    type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for web links (specific to the current selected object)
     * @type {ocui.Table}
     */
    webLinksInObjectTableDefinition = {
        columns: [
            { label: '#',              type: ocui.ColumnType.IDX },
            { label: 'Score',          type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',           type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',        type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Hardcoded URLs', type: ocui.ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',  type: ocui.ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Type',           type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Behavior',       type: ocui.ColumnType.TXT, data: { value: 'behavior' }},
            { label: 'Created date',   type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',  type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',    type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };
    
    /**
     * @description Table definition for web links (for all objects)
     * @type {ocui.Table}
     */
    webLinksTableDefinition = {
        columns: [
            { label: '#',               type: ocui.ColumnType.IDX },
            { label: 'Score',           type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',         type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'In this object',  type: ocui.ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }}, 
            { label: 'Object Type',     type: ocui.ColumnType.TXT, data: { value: 'objectRef.typeRef.label' }},
            { label: 'Hardcoded URLs',  type: ocui.ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',   type: ocui.ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Type',            type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Behavior',        type: ocui.ColumnType.TXT, data: { value: 'behavior' }},
            { label: 'Created date',    type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Using',           type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',   type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }}, 
            { label: 'Ref. in Layout?', type: ocui.ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${PAGELAYOUT}` }},
            { label: 'Dependencies',    type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Description',     type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for static resources
     * @type {ocui.Table}
     */
    staticResourcesTableDefinition = {
        columns: [
            { label: '#',               type: ocui.ColumnType.IDX },
            { label: 'Score',           type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',         type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Content Type',    type: ocui.ColumnType.TXT, data: { value: 'contentType' }},
            { label: 'Created date',    type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Using',           type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',   type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }}, 
            { label: 'Dependencies',    type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Description',     type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for record types (specific to the current selected object)
     * @type {ocui.Table}
     */
    recordTypesInObjectTableDefinition = {
        columns: [
            { label: '#',              type: ocui.ColumnType.IDX },
            { label: 'Score',          type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',           type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Developer Name', type: ocui.ColumnType.TXT, data: { value: 'developerName' }},
            { label: 'Is Active',      type: ocui.ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Is Available',   type: ocui.ColumnType.CHK, data: { value: 'isAvailable' }},
            { label: 'Is Default',     type: ocui.ColumnType.CHK, data: { value: 'isDefault' }},
            { label: 'Is Master',      type: ocui.ColumnType.CHK, data: { value: 'isMaster' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for record types for all objects
     * @type {ocui.Table}
     */
    recordTypesTableDefinition = {
        columns: [
            { label: '#',              type: ocui.ColumnType.IDX },
            { label: 'Score',          type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',           type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Developer Name', type: ocui.ColumnType.TXT, data: { value: 'developerName' }},
            { label: 'Package',        type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'In this object', type: ocui.ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }}, 
            { label: 'Object Type',    type: ocui.ColumnType.TXT, data: { value: 'objectRef.typeRef.label' }},
            { label: 'Is Active',      type: ocui.ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Is Available',   type: ocui.ColumnType.CHK, data: { value: 'isAvailable' }},
            { label: 'Is Default',     type: ocui.ColumnType.CHK, data: { value: 'isDefault' }},
            { label: 'Is Master',      type: ocui.ColumnType.CHK, data: { value: 'isMaster' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    }

    /**
     * @description Table definition for sobject relationships (specific to the current selected object)
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
     * @description Table definition for chatter groups
     * @type {ocui.Table}
     */
    chatterGroupsTableDefinition = {
        columns: [
            { label: '#',                   type: ocui.ColumnType.IDX },
            { label: 'Score',               type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Group',               type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Description',         type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Hardcoded URLs',      type: ocui.ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',       type: ocui.ColumnType.TXTS, data: { values: 'hardCodedIDs' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    }

    /**
     * @description Data definition for browsers
     * @type {ocui.Table}
     */
    browsersTableDefinition = {
        columns: [
            { label: '#',                   type: ocui.ColumnType.IDX },
            { label: 'Score',               type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Full name',           type: ocui.ColumnType.TXT, data: { value: 'fullName' }},
            { label: 'Name',                type: ocui.ColumnType.TXT, data: { value: 'name' }},
            { label: 'Version',             type: ocui.ColumnType.NUM, data: { value: 'version' }},
            { label: '#Application Logins', type: ocui.ColumnType.NUM, data: { value: 'nbApplicationLogin' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for custom fields
     * @type {ocui.Table}
     */
    customFieldsTableDefinition = {
        columns: [
            { label: '#',                   type: ocui.ColumnType.IDX },
            { label: 'Score',               type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Field',               type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Label',               type: ocui.ColumnType.TXT, data: { value: 'label' }},
            { label: 'Object API Name',     type: ocui.ColumnType.TXT, data: { value: 'objectId' }}, 
            { label: 'Object Name',         type: ocui.ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }, modifier: { valueIfEmpty: 'N/A' }}, 
            { label: 'Object Type',         type: ocui.ColumnType.TXT, data: { value: 'objectRef.typeRef.label' }, modifier: { valueIfEmpty: 'N/A' }},
            { label: 'Package',             type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Type',                type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Length',              type: ocui.ColumnType.TXT, data: { value: 'length' }},
            { label: 'Unique?',             type: ocui.ColumnType.CHK, data: { value: 'isUnique' }},
            { label: 'Encrypted?',          type: ocui.ColumnType.CHK, data: { value: 'isEncrypted' }},
            { label: 'External?',           type: ocui.ColumnType.CHK, data: { value: 'isExternalId' }},
            { label: 'Indexed?',            type: ocui.ColumnType.CHK, data: { value: 'isIndexed' }},
            { label: 'Restricted?',         type: ocui.ColumnType.CHK, data: { value: 'isRestrictedPicklist' }},
            { label: 'Tooltip',             type: ocui.ColumnType.TXT, data: { value: 'tooltip' }, modifier: { maximumLength: 45, valueIfEmpty: 'No tooltip.' }},
            { label: 'Formula',             type: ocui.ColumnType.TXT, data: { value: 'formula' }, modifier: { maximumLength: 100 , preformatted: true }},
            { label: 'Hardcoded URLs',      type: ocui.ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',       type: ocui.ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Default Value',       type: ocui.ColumnType.TXT, data: { value: 'defaultValue' }},
            { label: 'Using',               type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',       type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }}, 
            { label: 'Ref. in Layout?',     type: ocui.ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${PAGELAYOUT}` }},
            { label: 'Ref. in Apex Class?', type: ocui.ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${APEXCLASS}` }},
            { label: 'Ref. in Flow?',       type: ocui.ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${FLOWVERSION}` }},
            { label: 'Dependencies',        type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',        type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',       type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',         type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for custom fields (specific to the current selected object)
     * @type {ocui.Table}
     */
    customFieldsInObjectTableDefinition = {
        columns: [
            { label: '#',                   type: ocui.ColumnType.IDX },
            { label: 'Score',               type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Field',               type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Label',               type: ocui.ColumnType.TXT, data: { value: 'label' }},
            { label: 'Package',             type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Type',                type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Length',              type: ocui.ColumnType.TXT, data: { value: 'length' }},
            { label: 'Unique?',             type: ocui.ColumnType.CHK, data: { value: 'isUnique' }},
            { label: 'Encrypted?',          type: ocui.ColumnType.CHK, data: { value: 'isEncrypted' }},
            { label: 'External?',           type: ocui.ColumnType.CHK, data: { value: 'isExternalId' }},
            { label: 'Indexed?',            type: ocui.ColumnType.CHK, data: { value: 'isIndexed' }},
            { label: 'Restricted?',         type: ocui.ColumnType.CHK, data: { value: 'isRestrictedPicklist' }},
            { label: 'Tooltip',             type: ocui.ColumnType.TXT, data: { value: 'tooltip' }, modifier: { maximumLength: 45, valueIfEmpty: 'No tooltip.' }},
            { label: 'Formula',             type: ocui.ColumnType.TXT, data: { value: 'formula' }, modifier: { maximumLength: 100 , preformatted: true }},
            { label: 'Hardcoded URLs',      type: ocui.ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',       type: ocui.ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Default Value',       type: ocui.ColumnType.TXT, data: { value: 'defaultValue' }},
            { label: 'Using',               type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',       type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Ref. in Layout?',     type: ocui.ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${PAGELAYOUT}` }}, 
            { label: 'Ref. in Apex Class?', type: ocui.ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${APEXCLASS}` }}, 
            { label: 'Ref. in Flow?',       type: ocui.ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${FLOWVERSION}` }}, 
            { label: 'Dependencies',        type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',        type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',       type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',         type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for standard fields (specific to the current selected object)
     * @type {ocui.Table}
     */
    standardFieldsInObjectTableDefinition = {
        columns: [
            { label: '#',                   type: ocui.ColumnType.IDX },
            { label: 'Score',               type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }}, 
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
            { label: 'Created date',        type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',       type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',         type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for custom labels
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
     * @description Table definition for custom tabs
     * @type {ocui.Table}
     */
    customTabsTableDefinition = {
        columns: [
            { label: '#',               type: ocui.ColumnType.IDX },
            { label: 'Score',           type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',         type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Type',            type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Hardcoded URLs',  type: ocui.ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',   type: ocui.ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Created date',    type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Using',           type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',   type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }}, 
            { label: 'Dependencies',    type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Description',     type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for documents
     * @type {ocui.Table}
     */
    documentsTableDefinition = {
        columns: [
            { label: '#',                   type: ocui.ColumnType.IDX },
            { label: 'Score',               type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',             type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Folder',              type: ocui.ColumnType.TXT, data: { value: 'folderName' }},
            { label: 'Document URL',        type: ocui.ColumnType.TXT, data: { value: 'documentUrl' }},
            { label: 'Size (bytes)',        type: ocui.ColumnType.NUM, data: { value: 'size' }},
            { label: 'Type',                type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Created date',        type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',       type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',         type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for dashboards
     * @type {ocui.Table}
     */
    dashboardsTableDefinition = {
        columns: [
            { label: '#',               type: ocui.ColumnType.IDX },
            { label: 'Score',           type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'title' }},
            { label: 'Title',           type: ocui.ColumnType.URL, data: { value: 'url', label: 'title' }},
            { label: 'Developer Name',  type: ocui.ColumnType.TXT, data: { value: 'developerName' }},
            { label: 'Package',         type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Type',            type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Last viewed',     type: ocui.ColumnType.DTM, data: { value: 'lastViewedDate' }},
            { label: 'Last referenced', type: ocui.ColumnType.DTM, data: { value: 'lastReferencedDate' }},
            { label: 'Refreshed',       type: ocui.ColumnType.DTM, data: { value: 'resultRefreshedDate' }},
            { label: 'Created date',    type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',     type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Folder',          type: ocui.ColumnType.TXT, data: { value: 'folderName' }},
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    }

    /**
     * @description Table definition for reports
     * @type {ocui.Table}
     */
    reportsTableDefinition = {
        columns: [
            { label: '#',               type: ocui.ColumnType.IDX },
            { label: 'Score',           type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Developer Name',  type: ocui.ColumnType.TXT, data: { value: 'developerName' }},
            { label: 'Package',         type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Format',          type: ocui.ColumnType.TXT, data: { value: 'format' }},
            { label: 'Last run',        type: ocui.ColumnType.DTM, data: { value: 'lastRunDate' }},
            { label: 'Last viewed',     type: ocui.ColumnType.DTM, data: { value: 'lastViewedDate' }},
            { label: 'Last referenced', type: ocui.ColumnType.DTM, data: { value: 'lastReferencedDate' }},
            { label: 'Created date',    type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',     type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Folder',          type: ocui.ColumnType.TXT, data: { value: 'folderName' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    }

    /**
     * @description Table definition for lightning aura components
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
     * @description Table definition for lightning pages
     * @type {ocui.Table}
     */
    flexiPagesTableDefinition = {
        columns: [
            { label: '#',                  type: ocui.ColumnType.IDX },
            { label: 'Score',              type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',               type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Type',               type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Package',            type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Object',             type: ocui.ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }, modifier: { valueIfEmpty: 'Not related to an object.' }},
            { label: '#Components',        type: ocui.ColumnType.NUM, data: { value: 'nbComponents' }},
            { label: '#Fields',            type: ocui.ColumnType.NUM, data: { value: 'nbFields' }},
            { label: '#Related Lists',     type: ocui.ColumnType.NUM, data: { value: 'nbRelatedLists' }},
            { label: 'Attachment List?',   type: ocui.ColumnType.CHK, data: { value: 'isAttachmentRelatedListIncluded' }},
            { label: 'Lists from Layout?', type: ocui.ColumnType.CHK, data: { value: 'isRelatedListFromPageLayoutIncluded' }},
            { label: 'Using',              type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',      type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',       type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',       type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',      type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',        type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for lightning pages within an SObject
     * @type {ocui.Table}
     */
    flexiPagesInObjectTableDefinition = {
        columns: [
            { label: '#',                  type: ocui.ColumnType.IDX },
            { label: 'Score',              type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',               type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Type',               type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Package',            type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: '#Components',        type: ocui.ColumnType.NUM, data: { value: 'nbComponents' }},
            { label: '#Fields',            type: ocui.ColumnType.NUM, data: { value: 'nbFields' }},
            { label: '#Related Lists',     type: ocui.ColumnType.NUM, data: { value: 'nbRelatedLists' }},
            { label: 'Attachment List?',   type: ocui.ColumnType.CHK, data: { value: 'isAttachmentRelatedListIncluded' }},
            { label: 'Lists from Layout?', type: ocui.ColumnType.CHK, data: { value: 'isRelatedListFromPageLayoutIncluded' }},
            { label: 'Using',              type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',      type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',       type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',       type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',      type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',        type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };
    
    /**
     * @description Table definition for knowledge articles
     * @type {ocui.Table}
     */ 
    knowledgeArticlesTableDefinition = {
        columns: [
            { label: '#',              type: ocui.ColumnType.IDX },
            { label: 'Score',          type: ocui.ColumnType.SCR, data: { value: 'score', id: 'versionId', name: 'number' }},
            { label: 'Name',           type: ocui.ColumnType.URL, data: { value: 'url', label: 'number' }},
            { label: 'Title',          type: ocui.ColumnType.TXT, data: { value: 'title' }},
            { label: 'Status',         type: ocui.ColumnType.TXT, data: { value: 'status' }},
            { label: 'Url Name',       type: ocui.ColumnType.TXT, data: { value: 'urlName' }},
            { label: 'Hardcoded URL?', type: ocui.ColumnType.CHK, data: { value: 'isHardCodedURL' }},
            { label: 'Created date',   type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',  type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    }

    /**
     * @description Table definition for lightning web components
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
     * @description Table definition for page layouts
     * @type {ocui.Table}
     */
    pageLayoutsTableDefinition = {
        columns: [
            { label: '#',                type: ocui.ColumnType.IDX },
            { label: 'Score',            type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',             type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',          type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Type',             type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Object',           type: ocui.ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }, modifier: { valueIfEmpty: 'Not related to an object.' }},
            { label: 'Assignment Count', type: ocui.ColumnType.NUM, data: { value: 'profileAssignmentCount' }},
            { label: '#Fields',          type: ocui.ColumnType.NUM, data: { value: 'nbFields' }},
            { label: '#Related Lists',   type: ocui.ColumnType.NUM, data: { value: 'nbRelatedLists' }},
            { label: 'Attachment List?', type: ocui.ColumnType.CHK, data: { value: 'isAttachmentRelatedListIncluded' }},
            { label: 'Created date',     type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',    type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Using',            type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',    type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }}, 
            { label: 'Dependencies',     type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    }

    /**
     * @description Table definition for permission sets
     * @type {ocui.Table}
     */
    permissionSetsTableDefinition = {
        columns: [
            { label: '#',                      type: ocui.ColumnType.IDX },
            { label: 'Score',                  type: ocui.ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                   type: ocui.ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Is Group?',              type: ocui.ColumnType.CHK,  data: { value: 'isGroup' }},
            { label: 'Custom',                 type: ocui.ColumnType.CHK,  data: { value: 'isCustom' }},
            { label: '#FLSs',                  type: ocui.ColumnType.NUM,  data: { value: 'nbFieldPermissions' }},
            { label: '#Object CRUDs',          type: ocui.ColumnType.NUM,  data: { value: 'nbObjectPermissions' }},
            { label: 'Is Admin-like?',         type: ocui.ColumnType.CHK,  data: { value: 'isAdminLike' }},
            { label: 'Api Enabled',            type: ocui.ColumnType.CHK,  data: { value: 'importantPermissions.apiEnabled' }},
            { label: 'View Setup',             type: ocui.ColumnType.CHK,  data: { value: 'importantPermissions.viewSetup' }},
            { label: 'Modify All Data',        type: ocui.ColumnType.CHK,  data: { value: 'importantPermissions.modifyAllData' }},
            { label: 'View All Data',          type: ocui.ColumnType.CHK,  data: { value: 'importantPermissions.viewAllData' }},
            { label: 'Manage Users',           type: ocui.ColumnType.CHK,  data: { value: 'importantPermissions.manageUsers' }},
            { label: 'Customize Application',  type: ocui.ColumnType.CHK,  data: { value: 'importantPermissions.customizeApplication' }},
            { label: 'License',                type: ocui.ColumnType.TXT,  data: { value: 'license' }},
            { label: 'Package',                type: ocui.ColumnType.TXT,  data: { value: 'package' }},
            { label: '#Active users',          type: ocui.ColumnType.NUM,  data: { value: 'memberCounts' }, modifier: { minimum: 1, valueBeforeMin: 'No active user', valueIfEmpty: '' }},
            { label: 'Contains',               type: ocui.ColumnType.URLS, data: { values: 'permissionSetRefs', value: 'url', label: 'name' }},
            { label: 'Included in',            type: ocui.ColumnType.URLS, data: { values: 'permissionSetGroupRefs', value: 'url', label: 'name' }},
            { label: 'All groups are empty?',  type: ocui.ColumnType.CHK,  data: { value: 'allIncludingGroupsAreEmpty' }},
            { label: 'Created date',           type: ocui.ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',          type: ocui.ColumnType.DTM,  data: { value: 'lastModifiedDate' }},
            { label: 'Description',            type: ocui.ColumnType.TXT,  data: { value: 'description'}, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for permission set licenses
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
            { label: 'Status',                type: ocui.ColumnType.TXT,  data: { value: 'status' }},
            { label: 'Expiration Date',       type: ocui.ColumnType.DTM,  data: { value: 'expirationDate' }},
            { label: 'For Integration?',      type: ocui.ColumnType.CHK,  data: { value: 'isAvailableForIntegrations' }},
            { label: 'Created date',          type: ocui.ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',         type: ocui.ColumnType.DTM,  data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for profiles
     * @type {ocui.Table}
     */
    profilesTableDefinition = {
        columns: [
            { label: '#',                      type: ocui.ColumnType.IDX },
            { label: 'Score',                  type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                   type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Custom',                 type: ocui.ColumnType.CHK, data: { value: 'isCustom' }},
            { label: '#FLSs',                  type: ocui.ColumnType.NUM, data: { value: 'nbFieldPermissions' }},
            { label: '#Object CRUDs',          type: ocui.ColumnType.NUM, data: { value: 'nbObjectPermissions' }},
            { label: 'Is Admin-like?',         type: ocui.ColumnType.CHK, data: { value: 'isAdminLike' }},
            { label: 'Api Enabled',            type: ocui.ColumnType.CHK, data: { value: 'importantPermissions.apiEnabled' }},
            { label: 'View Setup',             type: ocui.ColumnType.CHK, data: { value: 'importantPermissions.viewSetup' }},
            { label: 'Modify All Data',        type: ocui.ColumnType.CHK, data: { value: 'importantPermissions.modifyAllData' }},
            { label: 'View All Data',          type: ocui.ColumnType.CHK, data: { value: 'importantPermissions.viewAllData' }},
            { label: 'Manage Users',           type: ocui.ColumnType.CHK, data: { value: 'importantPermissions.manageUsers' }},
            { label: 'Customize Application',  type: ocui.ColumnType.CHK, data: { value: 'importantPermissions.customizeApplication' }},
            { label: 'License',                type: ocui.ColumnType.TXT, data: { value: 'license' }},
            { label: 'Package',                type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: '#Active users',          type: ocui.ColumnType.NUM, data: { value: 'memberCounts' }, modifier: { minimum: 1, valueBeforeMin: 'No active user!', valueIfEmpty: '' }},
            { label: 'Created date',           type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',          type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',            type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for profile restrictions
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
     * @description Table definition for profiles password policies
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
     * @description Table definition for public groups
     * @type {ocui.Table}
     */
    publicGroupsTableDefinition = {
        columns: [
            { label: '#',                       type: ocui.ColumnType.IDX },
            { label: 'Score',                   type: ocui.ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                    type: ocui.ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Developer Name',          type: ocui.ColumnType.TXT,  data: { value: 'developerName' }},
            { label: 'With bosses?',            type: ocui.ColumnType.CHK,  data: { value: 'includeBosses' }},
            { label: '#Explicit members',       type: ocui.ColumnType.NUM,  data: { value: 'nbDirectMembers' }},
            { label: 'Explicit groups (links)', type: ocui.ColumnType.URLS, data: { values: 'directGroupRefs', value: 'url', label: 'name' }},
            { label: 'Explicit groups (info)',  type: ocui.ColumnType.OBJS, data: { values: 'directGroupRefs', template: (g) => `${g.name} (${g.type}${g.includeBosses?' with bosses':''}${g.includeSubordinates?' with subordinates':''})` }},
            { label: 'Explicit users',          type: ocui.ColumnType.URLS, data: { values: 'directUserRefs', value: 'url', label: 'name' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for queues
     * @type {ocui.Table}
     */
    queuesTableDefinition = this.publicGroupsTableDefinition;

    /**
     * @description Table definition for active internal users
     * @type {ocui.Table}
     */
    usersTableDefinition = {
        columns: [
            { label: '#',                      type: ocui.ColumnType.IDX },
            { label: 'Score',                  type: ocui.ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'User Name',              type: ocui.ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'Under LEX?',             type: ocui.ColumnType.CHK,  data: { value: 'onLightningExperience' }},
            { label: 'Last login',             type: ocui.ColumnType.DTM,  data: { value: 'lastLogin' }, modifier: { valueIfEmpty: 'Never logged!' }},
            { label: 'Failed logins',          type: ocui.ColumnType.NUM,  data: { value: 'numberFailedLogins' }},
            { label: 'Has MFA by-pass?',       type: ocui.ColumnType.CHK,  data: { value: 'hasMfaByPass' }},
            { label: 'Has Debug mode?',        type: ocui.ColumnType.CHK,  data: { value: 'hasDebugMode' }},
            { label: '#SF Logins w/o MFA',     type: ocui.ColumnType.NUM,  data: { value: 'nbDirectLoginWithoutMFA' }},
            { label: '#SF Logins w/ MFA',      type: ocui.ColumnType.NUM,  data: { value: 'nbDirectLoginWithMFA' }},
            { label: '#SSO Logins',            type: ocui.ColumnType.NUM,  data: { value: 'nbSSOLogin' }},
            { label: 'Password change',        type: ocui.ColumnType.DTM,  data: { value: 'lastPasswordChange' }},
            { label: 'Is Admin-like?',         type: ocui.ColumnType.CHK,  data: { value: 'isAdminLike' }},
            { label: 'Api Enabled',            type: ocui.ColumnType.CHK,  data: { value: 'aggregateImportantPermissions.apiEnabled' }},
            { label: 'Api Enabled from',       type: ocui.ColumnType.URLS, data: { values: 'aggregateImportantPermissions.apiEnabled', value: 'url', label: 'name' }},
            { label: 'View Setup',             type: ocui.ColumnType.CHK,  data: { value: 'aggregateImportantPermissions.viewSetup' }},
            { label: 'View Setup from',        type: ocui.ColumnType.URLS, data: { values: 'aggregateImportantPermissions.viewSetup', value: 'url', label: 'name' }},
            { label: 'Modify All Data',        type: ocui.ColumnType.CHK,  data: { value: 'aggregateImportantPermissions.modifyAllData' }},
            { label: 'Modify All Data from',   type: ocui.ColumnType.URLS, data: { values: 'aggregateImportantPermissions.modifyAllData', value: 'url', label: 'name' }},
            { label: 'View All Data',          type: ocui.ColumnType.CHK,  data: { value: 'aggregateImportantPermissions.viewAllData' }},
            { label: 'View All Data from',     type: ocui.ColumnType.URLS, data: { values: 'aggregateImportantPermissions.viewAllData', value: 'url', label: 'name' }},
            { label: 'Manage Users',           type: ocui.ColumnType.CHK,  data: { value: 'aggregateImportantPermissions.manageUsers' }},
            { label: 'Manage Users from',      type: ocui.ColumnType.URLS, data: { values: 'aggregateImportantPermissions.manageUsers', value: 'url', label: 'name' }},
            { label: 'Customize App.',         type: ocui.ColumnType.CHK,  data: { value: 'aggregateImportantPermissions.manageUsers' }},
            { label: 'Customize App. from',    type: ocui.ColumnType.URLS, data: { values: 'aggregateImportantPermissions.manageUsers', value: 'url', label: 'name' }},
            { label: 'Profile',                type: ocui.ColumnType.URL,  data: { value: 'profileRef.url', label: 'profileRef.name' }},
            { label: 'Permission Sets',        type: ocui.ColumnType.URLS, data: { values: 'permissionSetRefs', value: 'url', label: 'name' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for visualforce components
     * @type {ocui.Table}
     */
    visualForceComponentsTableDefinition = {
        columns: [
            { label: '#',              type: ocui.ColumnType.IDX },
            { label: 'Score',          type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',           type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',    type: ocui.ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',        type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Hardcoded URLs', type: ocui.ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',  type: ocui.ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Using',          type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',  type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',   type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',   type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',  type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',    type: ocui.ColumnType.TXT, data: { value: 'description'}, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for visualforce pages
     * @type {ocui.Table}
     */
    visualForcePagesTableDefinition = {
        columns: [
            { label: '#',              type: ocui.ColumnType.IDX },
            { label: 'Score',          type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',           type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',    type: ocui.ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Mobile',         type: ocui.ColumnType.CHK, data: { value: 'isMobileReady' }},
            { label: 'Package',        type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Hardcoded URLs', type: ocui.ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',  type: ocui.ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Using',          type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',  type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',   type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',   type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',  type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',    type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for apex classes (compiled and not tests)
     * @type {ocui.Table}
     */
    apexClassesTableDefinition = {
        columns: [
            { label: '#',                      type: ocui.ColumnType.IDX },
            { label: 'Score',                  type: ocui.ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                   type: ocui.ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'API Version',            type: ocui.ColumnType.NUM,  data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',                type: ocui.ColumnType.TXT,  data: { value: 'package' }},
            { label: 'Class',                  type: ocui.ColumnType.CHK,  data: { value: 'isClass' }},
            { label: 'Abst.',                  type: ocui.ColumnType.CHK,  data: { value: 'isAbstract' }},
            { label: 'Intf.',                  type: ocui.ColumnType.CHK,  data: { value: 'isInterface' }},
            { label: 'Enum',                   type: ocui.ColumnType.CHK,  data: { value: 'isEnum' }},
            { label: 'Schdl.',                 type: ocui.ColumnType.CHK,  data: { value: 'isSchedulable' }},
            { label: 'Access',                 type: ocui.ColumnType.TXT,  data: { value: 'specifiedAccess' }},
            { label: 'Implements',             type: ocui.ColumnType.TXTS, data: { values: 'interfaces' }},
            { label: 'Extends',                type: ocui.ColumnType.TXT,  data: { value: 'extends' }},
            { label: 'Size',                   type: ocui.ColumnType.NUM,  data: { value: 'length' }},
            { label: 'Hardcoded URLs',         type: ocui.ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',          type: ocui.ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Methods',                type: ocui.ColumnType.NUM,  data: { value: 'methodsCount' }},
            { label: 'Inner Classes',          type: ocui.ColumnType.NUM,  data: { value: 'innerClassesCount' }},
            { label: 'Annotations',            type: ocui.ColumnType.TXTS, data: { values: 'annotations' }},
            { label: 'Sharing',                type: ocui.ColumnType.TXT,  data: { value: 'specifiedSharing' }, modifier: { valueIfEmpty: 'Not specified.' }},
            { label: 'Scheduled',              type: ocui.ColumnType.CHK,  data: { value: 'isScheduled' }},
            { label: 'Coverage (>75%)',        type: ocui.ColumnType.PRC,  data: { value: 'coverage' }, modifier: { valueIfEmpty: 'No coverage!' }},
            { label: 'Editable Related Tests', type: ocui.ColumnType.URLS, data: { values: 'relatedTestClassRefs', value: 'url', label: 'name' }},
            { label: 'Using',                  type: ocui.ColumnType.NUM,  data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',          type: ocui.ColumnType.NUM,  data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',           type: ocui.ColumnType.DEP,  data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',           type: ocui.ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',          type: ocui.ColumnType.DTM,  data: { value: 'lastModifiedDate' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for uncompiled apex classes
     * @type {ocui.Table}
     */    
    apexUncompiledTableDefinition = {
        columns: [
            { label: '#',                      type: ocui.ColumnType.IDX },
            { label: 'Score',                  type: ocui.ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                   type: ocui.ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'API Version',            type: ocui.ColumnType.NUM,  data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',                type: ocui.ColumnType.TXT,  data: { value: 'package' }},
            { label: 'Size',                   type: ocui.ColumnType.NUM,  data: { value: 'length' }},
            { label: 'Coverage (>75%)',        type: ocui.ColumnType.PRC,  data: { value: 'coverage' }, modifier: { valueIfEmpty: 'No coverage!' }},
            { label: 'Editable Related Tests', type: ocui.ColumnType.URLS, data: { values: 'relatedTestClassRefs', value: 'url', label: 'name' }},
            { label: 'Using',                  type: ocui.ColumnType.NUM,  data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',          type: ocui.ColumnType.NUM,  data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',           type: ocui.ColumnType.DEP,  data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',           type: ocui.ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',          type: ocui.ColumnType.DTM,  data: { value: 'lastModifiedDate' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for apex triggers
     * @type {ocui.Table}
     */
    apexTriggersTableDefinition = {
        columns: [
            { label: '#',               type: ocui.ColumnType.IDX },
            { label: 'Score',           type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',     type: ocui.ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',         type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Size',            type: ocui.ColumnType.NUM, data: { value: 'length' }},
            { label: 'Hardcoded URLs',  type: ocui.ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',   type: ocui.ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Object API Name', type: ocui.ColumnType.TXT, data: { value: 'objectId' }}, 
            { label: 'Object Name',     type: ocui.ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }, modifier: { valueIfEmpty: 'N/A' }}, 
            { label: 'Active?',         type: ocui.ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Has SOQL?',       type: ocui.ColumnType.CHK, data: { value: 'hasSOQL' }},
            { label: 'Has DML?',        type: ocui.ColumnType.CHK, data: { value: 'hasDML' }},
            { label: '*Insert',         type: ocui.ColumnType.CHK, data: { value: 'beforeInsert' }},
            { label: 'Insert*',         type: ocui.ColumnType.CHK, data: { value: 'afterInsert' }},
            { label: '*Update',         type: ocui.ColumnType.CHK, data: { value: 'beforeUpdate' }},
            { label: 'Update*',         type: ocui.ColumnType.CHK, data: { value: 'afterUpdate' }},
            { label: '*Delete',         type: ocui.ColumnType.CHK, data: { value: 'beforeDelete' }},
            { label: 'Delete*',         type: ocui.ColumnType.CHK, data: { value: 'afterDelete' }},
            { label: 'Undelete',        type: ocui.ColumnType.CHK, data: { value: 'afterUndelete' }},
            { label: 'Using',           type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Dependencies',    type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',    type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for apex triggers within SObject
     * @type {ocui.Table}
     */
    apexTriggersInObjectTableDefinition =  {
        columns: [
            { label: '#',              type: ocui.ColumnType.IDX },
            { label: 'Score',          type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',           type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',    type: ocui.ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',        type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Size',           type: ocui.ColumnType.NUM, data: { value: 'length' }},
            { label: 'Hardcoded URLs', type: ocui.ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',  type: ocui.ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Active?',        type: ocui.ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Has SOQL?',      type: ocui.ColumnType.CHK, data: { value: 'hasSOQL' }},
            { label: 'Has DML?',       type: ocui.ColumnType.CHK, data: { value: 'hasDML' }},
            { label: '*Insert',        type: ocui.ColumnType.CHK, data: { value: 'beforeInsert' }},
            { label: 'Insert*',        type: ocui.ColumnType.CHK, data: { value: 'afterInsert' }},
            { label: '*Update',        type: ocui.ColumnType.CHK, data: { value: 'beforeUpdate' }},
            { label: 'Update*',        type: ocui.ColumnType.CHK, data: { value: 'afterUpdate' }},
            { label: '*Delete',        type: ocui.ColumnType.CHK, data: { value: 'beforeDelete' }},
            { label: 'Delete*',        type: ocui.ColumnType.CHK, data: { value: 'afterDelete' }},
            { label: 'Undelete',       type: ocui.ColumnType.CHK, data: { value: 'afterUndelete' }},
            { label: 'Using',          type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Dependencies',   type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',   type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',  type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for apex classes that are tests
     * @type {ocui.Table}
     */
    apexTestsTableDefinition = {
        columns: [
            { label: '#',                           type: ocui.ColumnType.IDX },
            { label: 'Score',                       type: ocui.ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                        type: ocui.ColumnType.URL,  data: { value: 'url', label: 'name' }},
            { label: 'API Version',                 type: ocui.ColumnType.NUM,  data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',                     type: ocui.ColumnType.TXT,  data: { value: 'package' }},
            { label: 'Size',                        type: ocui.ColumnType.NUM,  data: { value: 'length' }},
            { label: 'Hardcoded URLs',              type: ocui.ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',               type: ocui.ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'See All Data',                type: ocui.ColumnType.CHK,  data: { value: 'isTestSeeAllData' }},
            { label: 'Nb Asserts',                  type: ocui.ColumnType.NUM,  data: { value: 'nbSystemAsserts' }, modifier: { valueIfEmpty: 'No direct usage of Assert.Xxx() or System.assertXxx().' }},
            { label: 'Methods',                     type: ocui.ColumnType.NUM,  data: { value: 'methodsCount' }},
            { label: 'Latest Run Date',             type: ocui.ColumnType.DTM,  data: { value: 'lastTestRunDate' }},
            { label: 'Runtime',                     type: ocui.ColumnType.NUM,  data: { value: 'testMethodsRunTime' }},
            { label: 'Passed (but long) methods',   type: ocui.ColumnType.OBJS, data: { values: 'testPassedButLongMethods', template: (r) => 
                `${r.methodName} (Runtime: ${r.runtime*1} ms`+
                // see https://developer.salesforce.com/docs/atlas.en-us.api_tooling.meta/api_tooling/tooling_api_objects_apextestresultlimits.htm
                (r.cpuConsumption > 0 ? `, CPU: ${r.cpuConsumption*1} ms`: '') +  // The amount of CPU used during the test run, in milliseconds.
                (r.asyncCallsConsumption > 0 ? `, Async Calls: ${r.asyncCallsConsumption}`: '') + // The number of asynchronous calls made during the test run.
                (r.soslConsumption > 0 ? `, SOSL: ${r.soslConsumption}`: '') + // The number of SOSL queries made during the test run.
                (r.soqlConsumption > 0 ? `, SOQL: ${r.soqlConsumption}`: '') + // The number of SOQL queries made during the test run.
                (r.queryRowsConsumption > 0 ? `, Query Rows: ${r.queryRowsConsumption}`: '') + // The number of rows queried during the test run.
                (r.dmlRowsConsumption > 0 ? `, Dml Rows: ${r.dmlRowsConsumption}`: '') + // The number of rows accessed by DML statements during the test run.
                (r.dmlConsumption > 0 ? `, Dml: ${r.dmlConsumption}`:'') + // The number of DML statements made during the test run.
            ')' }},
            { label: 'Failed methods',              type: ocui.ColumnType.OBJS, data: { values: 'testFailedMethods', template: (r) => `${r.methodName} (${r.stacktrace})` }},
            { label: 'Inner Classes',               type: ocui.ColumnType.NUM,  data: { value: 'innerClassesCount' }},
            { label: 'Sharing',                     type: ocui.ColumnType.TXT,  data: { value: 'specifiedSharing' }, modifier: { valueIfEmpty: 'Not specified.' }},
            { label: 'Covering (editable classes)', type: ocui.ColumnType.URLS, data: { values: 'relatedClassRefs', value: 'url', label: 'name' }},
            { label: 'Using',                       type: ocui.ColumnType.NUM,  data: { value: 'dependencies.using.length' }},
            { label: 'Dependencies',                type: ocui.ColumnType.DEP,  data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',                type: ocui.ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',               type: ocui.ColumnType.DTM,  data: { value: 'lastModifiedDate' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for SObjects
     * @type {ocui.Table}
     */
    objectsTableDefinition = {
        columns: [
            { label: '#',                type: ocui.ColumnType.IDX },
            { label: 'Score',            type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Label',            type: ocui.ColumnType.URL, data: { value: 'url', label: 'label' }},
            { label: 'Name',             type: ocui.ColumnType.TXT, data: { value: 'name' }},
            { label: 'Package',          type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Custom fields',    type: ocui.ColumnType.NUM, data: { value: 'nbCustomFields' }},
            { label: 'Page layouts',     type: ocui.ColumnType.NUM, data: { value: 'nbPageLayouts' }},
            { label: 'Record types',     type: ocui.ColumnType.NUM, data: { value: 'nbRecordTypes' }},
            { label: 'Workflows',        type: ocui.ColumnType.NUM, data: { value: 'nbWorkflowRules' }},
            { label: 'Apex Triggers',    type: ocui.ColumnType.NUM, data: { value: 'nbApexTriggers' }},
            { label: 'Validation Rules', type: ocui.ColumnType.NUM, data: { value: 'nbValidationRules' }},
            { label: 'Internal OWD',     type: ocui.ColumnType.TXT, data: { value: 'internalSharingModel' }},
            { label: 'External OWD',     type: ocui.ColumnType.TXT, data: { value: 'externalSharingModel' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for flows
     * @type {ocui.Table}
     */
    flowsTableDefinition = {
        columns: [
            { label: '#',                                                 type: ocui.ColumnType.IDX },
            { label: 'Score',                                             type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                                              type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',                                       type: ocui.ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Type',                                              type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Number of versions',                                type: ocui.ColumnType.NUM, data: { value: 'versionsCount' }},
            { label: 'Current Version (called `it` in the next columns)', type: ocui.ColumnType.URL, data: { value: 'currentVersionRef.url', label: 'currentVersionRef.name' }},
            { label: 'Is it Active?',                                     type: ocui.ColumnType.CHK, data: { value: 'isVersionActive' }},
            { label: 'Is it the Latest?',                                 type: ocui.ColumnType.CHK, data: { value: 'isLatestCurrentVersion' }},
            { label: 'Its SObject',                                       type: ocui.ColumnType.TXT, data: { value: 'currentVersionRef.sobject' }},
            { label: 'Its trigger type',                                  type: ocui.ColumnType.TXT, data: { value: 'currentVersionRef.triggerType' }},
            { label: 'Its record trigger type',                           type: ocui.ColumnType.TXT, data: { value: 'currentVersionRef.recordTriggerType' }},
            { label: 'Its Running Mode',                                  type: ocui.ColumnType.TXT, data: { value: 'currentVersionRef.runningMode' }, modifier: { valueIfEmpty: 'No mode specified.' }},
            { label: 'Its API Version',                                   type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: '# Nodes',                                           type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.totalNodeCount' }},
            { label: '# DML Create Nodes',                                type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.dmlCreateNodeCount' }},
            { label: '# DML Delete Nodes',                                type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.dmlDeleteNodeCount' }},
            { label: '# DML Update Nodes',                                type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.dmlUpdateNodeCount' }},
            { label: '# Screen Nodes',                                    type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.screenNodeCount' }},
            { label: 'Its created date',                                  type: ocui.ColumnType.DTM, data: { value: 'currentVersionRef.createdDate' }},
            { label: 'Its modified date',                                 type: ocui.ColumnType.DTM, data: { value: 'currentVersionRef.lastModifiedDate' }},
            { label: 'Its description',                                   type: ocui.ColumnType.TXT, data: { value: 'currentVersionRef.description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Flow created date',                                 type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Flow modified date',                                type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Flow description',                                  type: ocui.ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Using',                                             type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',                                     type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',                                      type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'currentVersionId', name: 'name' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for email templates
     * @type {ocui.Table}
     */ 
    emailTemplatesTableDefinition = {
        columns: [
            { label: '#',               type: ocui.ColumnType.IDX },
            { label: 'Score',           type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',     type: ocui.ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',         type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'UI Type',         type: ocui.ColumnType.TXT, data: { value: 'uiType' }},
            { label: 'Type',            type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Folder',          type: ocui.ColumnType.TXT, data: { value: 'folderName' }},
            { label: 'Is Active',       type: ocui.ColumnType.CHK,  data: { value: 'isActive' }},
            { label: 'Last Used',       type: ocui.ColumnType.DTM,  data: { value: 'lastUsedDate' }, modifier: { valueIfEmpty: 'Never used!' }},
            { label: 'Used',            type: ocui.ColumnType.NUM,  data: { value: 'timesUsed' }},
            { label: 'Hardcoded URLs',  type: ocui.ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',   type: ocui.ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Created date',    type: ocui.ColumnType.DTM,  data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ocui.ColumnType.DTM,  data: { value: 'lastModifiedDate' }},
            { label: 'Description',     type: ocui.ColumnType.TXT,  data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    }

    /**
     * @description Table definition for home page components
     * @type {ocui.Table}
     */ 
    homePageComponentsTableDefinition = {
        columns: [
            { label: '#',               type: ocui.ColumnType.IDX },
            { label: 'Score',           type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',         type: ocui.ColumnType.TXT, data: { value: 'package' }},
            { label: 'Is Body Empty?',  type: ocui.ColumnType.CHK, data: { value: 'isBodyEmpty' }},
            { label: 'Hardcoded URLs',  type: ocui.ColumnType.TXTS, data: { values: 'hardCodedURLs' }},
            { label: 'Hardcoded IDs',   type: ocui.ColumnType.TXTS, data: { values: 'hardCodedIDs' }},
            { label: 'Created date',    type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Using',           type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',   type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }}, 
            { label: 'Dependencies',    type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for process builders
     * @type {ocui.Table}
     */
    processBuildersTableDefinition = {
        columns: [
            { label: '#',                                                 type: ocui.ColumnType.IDX },
            { label: 'Score',                                             type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                                              type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',                                       type: ocui.ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Number of versions',                                type: ocui.ColumnType.NUM, data: { value: 'versionsCount' }},
            { label: 'Current Version (called `it` in the next columns)', type: ocui.ColumnType.URL, data: { value: 'currentVersionRef.url', label: 'currentVersionRef.name' }},
            { label: 'Is it Active?',                                     type: ocui.ColumnType.CHK, data: { value: 'isVersionActive' }},
            { label: 'Is it the Latest?',                                 type: ocui.ColumnType.CHK, data: { value: 'isLatestCurrentVersion' }},
            { label: 'Its SObject',                                       type: ocui.ColumnType.TXT, data: { value: 'currentVersionRef.sobject' }},
            { label: 'Its trigger type',                                  type: ocui.ColumnType.TXT, data: { value: 'currentVersionRef.triggerType' }},
            { label: 'Its Running Mode',                                  type: ocui.ColumnType.TXT, data: { value: 'currentVersionRef.runningMode' }, modifier: { valueIfEmpty: 'No mode specified.' }},
            { label: 'Its API Version',                                   type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: '# Nodes',                                           type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.totalNodeCount' }},
            { label: '# DML Create Nodes',                                type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.dmlCreateNodeCount' }},
            { label: '# DML Delete Nodes',                                type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.dmlDeleteNodeCount' }},
            { label: '# DML Update Nodes',                                type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.dmlUpdateNodeCount' }},
            { label: '# Screen Nodes',                                    type: ocui.ColumnType.NUM, data: { value: 'currentVersionRef.screenNodeCount' }},
            { label: 'Its created date',                                  type: ocui.ColumnType.DTM, data: { value: 'currentVersionRef.createdDate' }},
            { label: 'Its modified date',                                 type: ocui.ColumnType.DTM, data: { value: 'currentVersionRef.lastModifiedDate' }},
            { label: 'Its description',                                   type: ocui.ColumnType.TXT, data: { value: 'currentVersionRef.description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Process created date',                              type: ocui.ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Process modified date',                             type: ocui.ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Using',                                             type: ocui.ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',                                     type: ocui.ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',                                      type: ocui.ColumnType.DEP, data: { value: 'dependencies', id: 'currentVersionId', name: 'name' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };
    
    /**
     * @description Table definition for workflows
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
     * @description Table definition for workflows in an object
     * @type {ocui.Table}
     */
    workflowsInObjectTableDefinition = {
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
     * @description Table definition for roles
     * @type {ocui.Table}
     */
    rolesTableDefinition = {
        columns: [
            { label: '#',                           type: ocui.ColumnType.IDX },
            { label: 'Score',                       type: ocui.ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',                        type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Developer Name',              type: ocui.ColumnType.TXT, data: { value: 'apiname' }},
            { label: 'Number of active members',    type: ocui.ColumnType.NUM, data: { value: 'activeMembersCount' }},
            { label: 'Level',                       type: ocui.ColumnType.NUM, data: { value: 'level' }},
            { label: 'Parent',                      type: ocui.ColumnType.URL, data: { value: 'parentRef.url', label: 'parentRef.name' }}
        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.DESC
    };

    /**
     * @description Table definition for object permissions
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
     * @description Table definition for application permissions
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
     * @description Table definition for field permissions
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
     * @description Table definition for score rules
     * @type {ocui.Table}
     */
    get scoreRulesTableDefinition() {
        /** @type {ocui.Table} */
        const table = {
            columns: [
                { label: 'Rules (or reason why metadata is bad)', type: ocui.ColumnType.TXT, data: { value: 'header.description' }}
            ],
            orderIndex: 0,
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
     * @param {number} depth - The depth of the current role in the hierarchy
     * @param {any} data - The data of the current role
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
     * @param {number} depth - The depth of the current role in the hierarchy
     * @param {any} data - The data of the current role
     * @returns {string} The inner HTML to display in the role box
     * @public
     */
    roleBoxInnerHtmlDecorator = (depth, data) => {
        if (depth === 0) return `<center><b>Role Hierarchy</b></center>`;
        return `<center><b>${data.record.name}</b><br />${data.record.apiname}</center>`;
    }

    /** 
     * @description OnClick handler when clikcing in a role box
     * @param {number} depth - The depth of the current role in the hierarchy
     * @param {any} data - The data of the current role
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
        if (data.record.parentRef) {
            htmlContent += `Parent Role Name: <b>${data.record.parentRef.name}</b><br />`;
            htmlContent += `Parent Salesforce Id: <b>${data.record.parentRef.id}</b><br />`;
            htmlContent += `Parent Developer Name: <b>${data.record.parentRef.apiname}</b><br />`;
        } else {
            htmlContent += 'No parent';
        }
        this._openModal(`Details for role ${data.record.name}`, htmlContent);
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
        /** @type {Array<ocui.ExportedTable>} */
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
                [ 'Record Count (including deleted ones)', `${this.objectData.recordCount}` ],
                [ 'Is Custom?', `${this.objectData.isCustom?'true':'false'}` ],
                [ 'Feed Enable?', `${this.objectData.isFeedEnabled?'true':'false'}` ],
                [ 'Most Recent Enabled?', `${this.objectData.isMostRecentEnabled?'true':'false'}` ],
                [ 'Global Search Enabled?', `${this.objectData.isSearchable?'true':'false'}` ],
                [ 'Internal Sharing', this.objectData.internalSharingModel ],
                [ 'External Sharing', this.objectData.externalSharingModel ]
            ]
        });
        sheets.push(ocui.RowsFactory.createAndExport(this.standardFieldsInObjectTableDefinition, this.objectData.standardFields, 'Standard Fields', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.customFieldsInObjectTableDefinition, this.objectData.customFieldRefs, 'Custom Fields', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.apexTriggersTableDefinition, this.objectData.apexTriggerRefs, 'Apex Triggers', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.fieldSetsTableDefinition, this.objectData.fieldSets, 'Field Sets', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.layoutsTableDefinition, this.objectData.layouts, 'Page Layouts', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.flexiPagesInObjectTableDefinition, this.objectData.flexiPages, 'Lightning Pages', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.limitsTableDefinition, this.objectData.limits, 'Limits', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.validationRulesInObjectTableDefinition, this.objectData.validationRules, 'Validation Rules', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.webLinksTableDefinition, this.objectData.webLinks, 'Web Links', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.recordTypesTableDefinition, this.objectData.recordTypes, 'Record Types', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.relationshipsTableDefinition, this.objectData.relationships, 'Relationships', ocapi.SecretSauce.GetScoreRuleDescription));
        return sheets;
    }

    /**
     * @description Representation of an export for the global view data
     * @type {Array<ocui.ExportedTable>}
     */
    globalViewItemsExport;

    /**
     * @description Representation of an export for hardcoded URLs view data
     * @type {Array<ocui.ExportedTable>}
     */ 
    hardCodedURLsViewItemsExport;



    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // All tables in the app
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /** 
     * @description Data table for all objects in the org 
     * @type {Array<ocapi.SFDC_Object>}
     */
    objectsTableData;

    /** 
     * @description Data table for one object in the org 
     * @type {ocapi.SFDC_Object}
     */
    objectData;

    /**
     * @description Data table for chatter groups in the org
     * @type {Array<ocapi.SFDC_CollaborationGroup>}
     * @public
     */ 
    chatterGroupsTableData;

    /**
     * @description Data table for browsers in the org
     * @type {Array<ocapi.SFDC_Browser>}
     * @public
     */
    browsersTableData;

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
     * @description Data table for custom tabs 
     * @type {Array<ocapi.SFDC_CustomTab>}
     */
    customTabsTableData;

    /**
     * @description Data table for documents
     * @type {Array<ocapi.SFDC_Document>}
     */
    documentsTableData;

    /**
     * @description Data table for dashboards
     * @type {Array<ocapi.SFDC_Dashboard>}
     */
    dashboardsTableData;

    /**
     * @description Data table for reports
     * @type {Array<ocapi.SFDC_Report>}
     */
    reportsTableData;

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
     * @description Data table for knowledge articles
     * @type {Array<ocapi.SFDC_KnowledgeArticle>}
     */ 
    knowledgeArticlesTableData;

    /** 
     * @description Data table for lightning web components 
     * @type {Array<ocapi.SFDC_LightningWebComponent>}
     */
    lightningWebComponentsTableData;

    /** 
     * @description Data table for page layouts
     * @type {Array<ocapi.SFDC_PageLayout>}
     */
    pageLayoutsTableData;

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
     * @description Data table for public groups and queues 
     * @type {Array<ocapi.SFDC_Group>}
     */
    publicGroupsAndQueuesTableData;

    /** 
     * @description Data table for active users 
     * @type {Array<ocapi.SFDC_User>}
     */
    usersTableData;

    /**
     * @description Global View data from API
     * @type {Map}
     */ 
    set _internalGlobalViewDataFromAPI(data) {
        if (data) {
            const globalViewData = [];
            const sheets = [];
            sheets.push({ header: 'Statistics (Good and Bad)', columns: [ 'Type of items', 'Count of good items', 'Count of bad items' ], rows: [] });
            sheets.push({ header: 'Statistics (Reasons)', columns: [ 'Type of items', 'Why are they considered bad?', 'Count of bad items' ], rows: [] });
            const goodAndBadRows = [];
            const rulesRows = [];
            const ruleTableDefinition = {
                columns: [
                    { label: 'Items', type: ocui.ColumnType.NUM, data: { value: 'value' }},
                    { label: 'What is the issue?', type: ocui.ColumnType.TXT, data: { value: 'name' }}
                ],
                orderIndex: 0,
                orderSort: ocui.SortOrder.DESC
            }
            data?.forEach((item, alias) => {
                const transfomer = this._internalTransformers[alias];
                const itemName = transfomer.label ?? `[${alias}]`;
                const definitionName = transfomer.data.replace(/Data$/, 'Definition');
                const definitionTable = this[definitionName];
                globalViewData.push({
                    countBad: item?.countBad,
                    label: itemName,
                    hadError: item?.hadError,
                    class: `slds-box viewCard ${item?.hadError === true ? 'viewCard-error' : (item?.countBad === 0 ? 'viewCard-no-bad-data' : 'viewCard-some-bad-data')}`,
                    tab: `${transfomer.tab}:${alias}`,
                    tableDefinition: ruleTableDefinition,
                    tableData: item?.countBadByRule?.map((c) => { return { name: `${c.ruleName}`,  value: c.count }}) ?? []
                });
                goodAndBadRows.push([ itemName, item.countGood, item.countBad ]); 
                item?.countBadByRule?.forEach((c) => {
                    rulesRows.push([ itemName, c.ruleName, c.count ]);
                });
                sheets.push(ocui.RowsFactory.createAndExport(definitionTable, item?.data, itemName, ocapi.SecretSauce.GetScoreRuleDescription));
            });
            sheets[0].rows = goodAndBadRows.sort((a, b) => { return a[2] < b[2] ? 1 : -1 }) // Index=2 sorted by Bad count
            sheets[1].rows = rulesRows.sort((a, b) => { return a[2] < b[2] ? 1 : -1 }) // Index=2 sorted by Bad count
            this.globalViewData = globalViewData.sort((a, b) => { return a.countBad < b. countBad ? 1 : -1 });
            this.globalViewItemsExport = sheets;
            this.showGlobalViewExportButton = true;
        } else {
            this.globalViewData = [];
            this.globalViewItemsExport = [];
            this.showGlobalViewExportButton = false;
        }
    }

    /**
     * @description Hard-coded URLS View data from API
     * @type {Map}
     */ 
    set _internalHardCodedURLsViewDataFromAPI(data) {
        if (data) {
            const hardCodedURLsViewData = [];
            const sheets = [];
            data?.forEach((item, alias) => {
                const transfomer = this._internalTransformers[alias];
                const itemName = transfomer.label ?? `[${alias}]`;
                const definitionName = transfomer.data.replace(/Data$/, 'Definition');
                const definitionTable = this[definitionName];
                const firstUrlColumn = definitionTable.columns.filter(c => c.type === ocui.ColumnType.URL)[0];
                hardCodedURLsViewData.push({
                    type: itemName,
                    hadError: item?.hadError,
                    countAll: item?.countAll,
                    countBad: item?.countBad,
                    items: item?.data?.filter((d, i) => i < MAX_ITEMS_IN_HARDCODED_URLS_LIST).map(d => {
                        return {
                            url: d?.[firstUrlColumn.data.value],
                            name: d?.[firstUrlColumn.data.label]
                        };
                    })
                });
                sheets.push(ocui.RowsFactory.createAndExport(definitionTable, item?.data.filter(d => d?.length > 0 || false), itemName, ocapi.SecretSauce.GetScoreRuleDescription));
            });
            this.hardCodedURLsViewData = hardCodedURLsViewData; // no need to sort as the data will be shown in an extendetible table (which will be sorted by countBad desc by default)
            this.hardCodedURLsViewItemsExport = sheets;
            this.showhardCodedURLsViewExportButton = true;
        } else {
            this.hardCodedURLsViewData = [];
            this.hardCodedURLsViewItemsExport = [];
            this.showhardCodedURLsViewExportButton = false;
        }
    }

    /** 
     * @description Data for the global view
     * @type {Array}
     */
    globalViewData;

    /** 
     * @description Data for the hard coded urls view
     * @type {Array}
     */
    hardCodedURLsViewData;

    hardCodedURLsViewTableDefinition = {
        columns: [
            { label: 'Type',      type: ocui.ColumnType.TXT, data: { value: 'type' }},
            { label: 'Had Issue', type: ocui.ColumnType.CHK, data: { value: 'hadError' }},
            { label: 'Bad',       type: ocui.ColumnType.NUM, data: { value: 'countBad' }},
            { label: 'Total',     type: ocui.ColumnType.NUM, data: { value: 'countAll' }},
            { label: `First ${MAX_ITEMS_IN_HARDCODED_URLS_LIST} items...`, type: ocui.ColumnType.URLS, data: { values: 'items', value: 'url', label: 'name' }}
        ],
        orderIndex: 2,
        orderSort: ocui.SortOrder.DESC
    }

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
     * @description Data table for email templates
     * @type {Array<ocapi.SFDC_EmailTemplate>}
     */
    emailTemplatesTableData;

    /**
     * @description Data table for home page components
     * @type {Array<ocapi.SFDC_HomePageComponent>}
     */
    homePageComponentsTableData;

    /** 
     * @description Data table for process builders 
     * @type {Array<ocapi.SFDC_Flow>}
     */
    processBuildersTableData;

    /** 
     * @description Data table for weblinks
     * @type {Array<ocapi.SFDC_WebLink>}
     */
    webLinksTableData;

    /**
     * @description Data table for static resources
     * @type {Array<ocapi.SFDC_StaticResource>}
     */ 
    staticResourcesTableData;

    /** 
     * @description Data table for workflows 
     * @type {Array<ocapi.SFDC_Workflow>}
     */
    workflowsTableData;

    /** 
     * @description Table data for record types 
     * @type {Array<ocapi.SFDC_RecordType>}
     */
    recordTypesTableData;

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