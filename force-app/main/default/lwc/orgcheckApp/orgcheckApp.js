/*global jsforce, fflate, lightningflowscanner*/

import { LightningElement, api } from 'lwc';
import OrgCheckStaticResource from '@salesforce/resourceUrl/OrgCheck_SR';
import LFSCoreStaticResource from '@salesforce/resourceUrl/LFS_Core';
import * as ocapi from './libs/orgcheck-api.js';
import * as ocui from './libs/orgcheck-ui.js';
// @ts-ignore
import { loadScript } from 'lightning/platformResourceLoader';
import { TableDefinitions } from './subs/tableDefinitions.js';

const MAX_ITEMS_IN_HARDCODED_URLS_LIST = 15;

/**
 * @description Application navigation in tabs and subtabs
 * @constant
 */
const APPLICATION_NAVIGATION = {
    HOME: { 
        key:   'home', 
        title: 'Home',
        tabs: { 
            WELCOME:       { key: 'welcome', title : '👋 Welcome!' },
            CACHE:         { key: 'metadata-cache', title: '🛠️ Metadata Cache' },
            HELP:          { key: 'help', title: '⁉️ Score explanation' }
        }
    },
    ORG: { 
        key:   'organization', 
        title: '🗺️ Salesforce Organization',
        tabs: { 
            INDEX0:        { key: 'summary-00', title: 'Summary' },
            GLOBAL_VIEW:   { key: 'global-view', title: '🏞️ Overview', recipe: ocapi.RecipeAliases.GLOBAL_VIEW },
            URL_VIEW:      { key: 'hard-coded-urls-view', title: '🏖️ Hard-coded URLs', recipe: ocapi.RecipeAliases.HARDCODED_URLS_VIEW },
        }
    },
    DATAMODEL: { 
        key:   'datamodel', 
        title: '⚽ Data model',
        tabs: { 
            INDEX1:        { key: 'summary-01', title: 'Summary' },
            SOBJ_DESC:     { key: 'object', title: '🎳 Object Documentation', recipe: ocapi.RecipeAliases.OBJECT },
            SOBJECTS:      { key: 'objects', title: '🏉 Objects', recipe: ocapi.RecipeAliases.OBJECTS },
            CUSTOM_FIELDS: { key: 'custom-fields', title: '🏈 Custom Fields', recipe: ocapi.RecipeAliases.CUSTOM_FIELDS },
            LAYOUTS:       { key: 'page-layouts', title: '🏓 Page Layouts', recipe: ocapi.RecipeAliases.PAGE_LAYOUTS },
            VRS:           { key: 'validation-rules', title: '🎾 Validation Rules', recipe: ocapi.RecipeAliases.VALIDATION_RULES },
            RTS:           { key: 'record-types', title: '🏏 Record Types', recipe: ocapi.RecipeAliases.RECORD_TYPES },
            WEB_LINKS:     { key: 'web-links', title: '🏑 Web Links', recipe: ocapi.RecipeAliases.WEBLINKS },
        }
    },
    SECURITY: { 
        key:   'security', 
        title: '👮 Security and Access',
        tabs: { 
            INDEX2:        { key: 'summary-02', title: 'Summary' },
            USERS:         { key: 'internal-active-users', title: '👥 Active Internal Users', recipe: ocapi.RecipeAliases.INTERNAL_ACTIVE_USERS },
            PROFILES:      { key: 'profiles', title: '🚓 Profiles', recipe: ocapi.RecipeAliases.PROFILES },
            PSETS:         { key: 'permission-sets', title: '🚔 Permission Sets', recipe: ocapi.RecipeAliases.PERMISSION_SETS },
            PSLS:          { key: 'permission-set-licenses', title: '🚔 Permission Set Licenses', recipe: ocapi.RecipeAliases.PERMISSION_SET_LICENSES },
            PROFILE_RSTRS: { key: 'profile-restrictions', title: '🚸 Profile Restrictions', recipe: ocapi.RecipeAliases.PROFILE_RESTRICTIONS },
            PROFILE_PWDS:  { key: 'profile-password-policies', title: '⛖ Profile Password Policies', recipe: ocapi.RecipeAliases.PROFILE_PWD_POLICIES },
            CRUDS:         { key: 'object-permissions', title: '🚦 Object Permissions', recipe: ocapi.RecipeAliases.OBJECT_PERMISSIONS },
            FLSS:          { key: 'field-permissions', title: '🚧 Field Level Securities', recipe: ocapi.RecipeAliases.FIELD_PERMISSIONS },
            APP_PERMS:     { key: 'app-permissions', title: '⛕ Application Permissions', recipe: ocapi.RecipeAliases.APP_PERMISSIONS },
            BROWSERS:      { key: 'browsers', title: '🌐 Browsers', recipe: ocapi.RecipeAliases.BROWSERS },
        }
    },
    BOXES: { 
        key:   'boxes', 
        title: '🐇 Boxes',
        tabs: { 
            INDEX3:        { key: 'summary-03', title: 'Summary' },
            ROLES_GRAPH:   { key: 'user-roles-hierarchy', title: '🐙 Internal Role Explorer' },
            ROLES:         { key: 'user-roles', title: '🦓 Internal Role Listing', recipe: ocapi.RecipeAliases.USER_ROLES },
            PGS:           { key: 'public-groups', title: '🐘 Public Groups', recipe: ocapi.RecipeAliases.PUBLIC_GROUPS },
            QUEUES:        { key: 'queues', title: '🦒 Queues', recipe: ocapi.RecipeAliases.QUEUES },
            CHT_GROUPS:    { key: 'collaboration-groups', title: '🦙 Chatter Groups', recipe: ocapi.RecipeAliases.COLLABORATION_GROUPS },
        }
    },
    AUTOMATION: { 
        key:   'automation', 
        title: '🤖 Automations',
        tabs: { 
            INDEX4:        { key: 'summary-04', title: 'Summary' },
            FLOWS:         { key: 'flows', title: '🏎️ Flows', recipe: ocapi.RecipeAliases.FLOWS },
            PBS:           { key: 'process-builders',  title: '🛺 Process Builders', recipe: ocapi.RecipeAliases.PROCESS_BUILDERS },
            WORKFLOWS:     { key: 'workflows', title: '🚗 Workflows', recipe: ocapi.RecipeAliases.WORKFLOWS },
        }
    },
    SETTING: { 
        key:   'setting', 
        title: '🎁 Setting',
        tabs: {
            INDEX5:        { key: 'summary-05', title: 'Summary' },
            LABELS:        { key: 'custom-labels', title: '🏷️ Custom Labels', recipe: ocapi.RecipeAliases.CUSTOM_LABELS },
            DOCUMENTS:     { key: 'documents', title: '🍱 Documents', recipe: ocapi.RecipeAliases.DOCUMENTS },
            EMAIL_TPLS:    { key: 'email-templates', title: '🌇 Email Templates', recipe: ocapi.RecipeAliases.EMAIL_TEMPLATES },
            ARTICLES:      { key: 'knowledge-articles', title: '📚 Knowledge Articles', recipe: ocapi.RecipeAliases.KNOWLEDGE_ARTICLES },
            SRS:           { key: 'static-resources', title: '🗿 Static Resources', recipe: ocapi.RecipeAliases.STATIC_RESOURCES },
        }
    },
    VISUAL: { 
        key:   'visual', 
        title: '🥐 User Interface',
        tabs: { 
            INDEX6:        { key: 'summary-06', title: 'Summary' },
            VFPS:          { key: 'visualforce-pages', title: '🥖 Visualforce Pages', recipe: ocapi.RecipeAliases.VISUALFORCE_PAGES },
            VFCS:          { key: 'visualforce-components', title: '🍞 Visualforce Components', recipe: ocapi.RecipeAliases.VISUALFORCE_COMPONENTS },
            LG_PAGES:      { key: 'lightning-pages', title: '🎂 Lightning Pages', recipe: ocapi.RecipeAliases.LIGHTNING_PAGES },
            AURAS:         { key: 'lightning-aura-components', title: '🧁 Lightning Aura Components', recipe: ocapi.RecipeAliases.LIGHTNING_AURA_COMPONENTS },
            LWCS:          { key: 'lightning-web-components', title: '🍰 Lightning Web Components', recipe: ocapi.RecipeAliases.LIGHTNING_WEB_COMPONENTS },
            HOME_PAGES:    { key: 'home-page-components', title: '🍩 Home Page Components', recipe: ocapi.RecipeAliases.HOME_PAGE_COMPONENTS },
            TABS:          { key: 'custom-tabs', title: '🥠 Custom Tabs', recipe: ocapi.RecipeAliases.CUSTOM_TABS },
        }
    },
    CODE: { 
        key:   'code', 
        title: '🔥 Programmatic',
        tabs: {
            INDEX7:        { key: 'summary-07', title: 'Summary' },
            CLASSES:       { key: 'apex-classes', title: '❤️‍🔥 Apex Classes', recipe: ocapi.RecipeAliases.APEX_CLASSES },
            UNCOMPILEDS:   { key: 'apex-uncompiled', title: '🌋 Apex Classes That Need Recompilation', recipe: ocapi.RecipeAliases.APEX_UNCOMPILED },
            TRIGGERS:      { key: 'apex-triggers', title: '🧨 Apex Triggers', recipe: ocapi.RecipeAliases.APEX_TRIGGERS },
            TESTS:         { key: 'apex-tests', title: '🚒 Apex Unit Tests', recipe: ocapi.RecipeAliases.APEX_TESTS },
        }
    },
    ANALYTICS: { 
        key:   'analytics', 
        title: '⛰️ Analytics',
        tabs: {
            INDEX8:        { key: 'summary-08', title: 'Summary' },
            REPORTS:       { key: 'reports', title: '🌳 Reports', recipe: ocapi.RecipeAliases.REPORTS }, 
            DASHBOARDS:    { key: 'dashboards', title: '🌲 Dashboards', recipe: ocapi.RecipeAliases.DASHBOARDS },
        }
    },
};
Object.freeze(APPLICATION_NAVIGATION);

/**
 * @description Keys of the main tabs in the application
 * @type {Array<string>}
 * @constant
 */
const MAIN_TABS_VALUES = Object.values(APPLICATION_NAVIGATION).map(tab => tab.key);
Object.freeze(MAIN_TABS_VALUES);

/**
 * @description Sub tabs by key
 * @type {Map<string, {tab: {key: string, title: string}, mainTabKey: string}>}
 * @constant
 */
const SUB_TABS = new Map();

/**
 * @description Sub tab keys by main tab key
 * @type {Map<string, Array<string>>}
 * @constant
 */
const SUB_TABS_BY_MAIN_TAB_KEY = new Map();

/**
 * @description Sub tab keys by their corresponding recipe
 * @type {Map<string, string>}
 * @constant
 */
const RECIPE_TO_SUB_TAB = new Map();

Object.values(APPLICATION_NAVIGATION).forEach(mTab => Object.values(mTab.tabs).forEach(sTab => {
    SUB_TABS.set(sTab.key, { tab: { key: sTab.key, title: sTab.title }, mainTabKey: mTab.key });
    if (SUB_TABS_BY_MAIN_TAB_KEY.has(mTab.key) === false) SUB_TABS_BY_MAIN_TAB_KEY.set(mTab.key, []);
    SUB_TABS_BY_MAIN_TAB_KEY.get(mTab.key).push(sTab.key);
    if (sTab.recipe) {
        RECIPE_TO_SUB_TAB.set(sTab.recipe, sTab.key);
    }
}));
Object.freeze(SUB_TABS);
Object.freeze(SUB_TABS_BY_MAIN_TAB_KEY);
Object.freeze(RECIPE_TO_SUB_TAB);

/**
 * @description Sanitize and validate main tab input
 * @param {string} input - The input main tab value
 * @returns {string} The sanitized main tab value
 * @throws {Error} If the input is not a valid main tab value
 */
const SANITIZE_MAIN_TAB_INPUT = (input) => { 
    if (input === undefined || input === null) throw new Error('Input is undefined or null');
    if (typeof input !== 'string') throw new Error('Input is not a string'); 
    const sanitizedInput = input.trim().toLowerCase();
    if (MAIN_TABS_VALUES.includes(sanitizedInput) === false) { 
        throw new Error(`Input <${input}> is not a valid main tab value`);
    } 
    return sanitizedInput;
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
        const SECTION_01 = 'Initialize the Org Check API';
        const SECTION_02 = 'Third party librairies';
        const SECTION_03 = 'Load Org Check API'; 
        const SECTION_04 = 'Additional steps';
        try {
            // Show spinner
            this._spinner?.open();
            this._spinner?.sectionLog(SECTION_01, `C'est parti...`);

            // Load the third party scripts
            this._spinner?.sectionLog(SECTION_02, `Start loading...`);
            try {
                await Promise.all([
                    loadScript(this, OrgCheckStaticResource + '/js/jsforce.js'),
                    loadScript(this, OrgCheckStaticResource + '/js/fflate.js'),
                    loadScript(this, LFSCoreStaticResource)
                ]);
                this._spinner?.sectionEnded(SECTION_02, `Done.`);
            } catch (error) {
                this._spinner?.sectionFailed(SECTION_02, error);
                throw new Error(`Error while loading third party libraries`);
            }

            // Load the Org Check API
            this._spinner?.sectionLog(SECTION_03, `Start loading...`);
            try {
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
                this._spinner?.sectionEnded(SECTION_03, `Done.`);
            } catch (error) {
                this._spinner?.sectionFailed(SECTION_03, error);
                throw new Error(`Error while loading Org Check api`);
            }

            // Some other stuff to do
            this._spinner?.sectionLog(SECTION_04, `Starting...`);
            try {
                // Get the score rules matrix once here
                this._spinner?.sectionLog(SECTION_04, `Get the score rules matrix...`);
                this._internalAllScoreRulesDataMatrix = this._api?.getAllScoreRulesAsDataMatrix();
                // Update the cache information when we are finish loading everything
                this._spinner?.sectionLog(SECTION_04, `Update the cache information when we are finish loading everything...`);
                this._updateCacheInformation();
                // Load basic information if the user has already accepted the terms
                this._spinner?.sectionLog(SECTION_04, `Load basic information if the user has already accepted the terms...`);
                await this._loadBasicInformationIfAccepted();
                this._spinner?.sectionEnded(SECTION_04, `Done.`);
            } catch (error) {
                this._spinner?.sectionFailed(SECTION_04, error);
                throw new Error(`Error while processing additional steps`);
            }

            this._spinner?.sectionEnded(SECTION_01, 'Done');

        } catch (error) {
            this._spinner?.sectionFailed(SECTION_01, error);
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
        return this.selectedSubTab === APPLICATION_NAVIGATION.CODE.tabs.UNCOMPILEDS.key && this.apexUncompiledTableData?.length > 0 || false;
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
     * @type {Map<string, {data: string, remove: Function, getAlias: Function, get: Function, lastAlias?: string}>}
     * @private
     */
    _internalTransformers = new Map([
        [ APPLICATION_NAVIGATION.ANALYTICS.tabs.DASHBOARDS.key,      { data: 'dashboardsTableData',                   remove: () => { this._api?.removeAllDashboardsFromCache(); },               getAlias: this._aliasNone,          get: async () => { return this._api?.getDashboards(); }} ],
        [ APPLICATION_NAVIGATION.ANALYTICS.tabs.REPORTS.key,         { data: 'reportsTableData',                      remove: () => { this._api?.removeAllReportsFromCache(); },                  getAlias: this._aliasNone,          get: async () => { return this._api?.getReports(); }} ],
        [ APPLICATION_NAVIGATION.AUTOMATION.tabs.FLOWS.key,          { data: 'flowsTableData',                        remove: () => { this._api?.removeAllFlowsFromCache(); },                    getAlias: this._aliasNone,          get: async () => { return this._api?.getFlows(); }} ],
        [ APPLICATION_NAVIGATION.AUTOMATION.tabs.PBS.key,            { data: 'processBuildersTableData',              remove: () => { this._api?.removeAllProcessBuildersFromCache(); },          getAlias: this._aliasNone,          get: async () => { return this._api?.getProcessBuilders(); }} ],
        [ APPLICATION_NAVIGATION.AUTOMATION.tabs.WORKFLOWS.key,      { data: 'workflowsTableData',                    remove: () => { this._api?.removeAllWorkflowsFromCache(); },                getAlias: this._aliasNone,          get: async () => { return this._api?.getWorkflows(); }} ],
        [ APPLICATION_NAVIGATION.BOXES.tabs.CHT_GROUPS.key,          { data: 'chatterGroupsTableData',                remove: () => { this._api?.removeAllChatterGroupsFromCache(); },            getAlias: this._aliasNone,          get: async () => { return this._api?.getChatterGroups(); }} ],
        [ APPLICATION_NAVIGATION.BOXES.tabs.PGS.key,                 { data: 'publicGroupsTableData',                 remove: () => { this._api?.removeAllPublicGroupsFromCache(); },             getAlias: this._aliasNone,          get: async () => { return this._api?.getPublicGroups(); }} ],
        [ APPLICATION_NAVIGATION.BOXES.tabs.QUEUES.key,              { data: 'queuesTableData',                       remove: () => { this._api?.removeAllQueuesFromCache(); },                   getAlias: this._aliasNone,          get: async () => { return this._api?.getQueues(); }} ],
        [ APPLICATION_NAVIGATION.BOXES.tabs.ROLES.key,               { data: 'rolesTableData',                        remove: () => { this._api?.removeAllRolesFromCache(); },                    getAlias: this._aliasNone,          get: async () => { return this._api?.getRoles(); }} ],
        [ APPLICATION_NAVIGATION.BOXES.tabs.ROLES_GRAPH.key,         { data: 'rolesTree',                             remove: () => { this._api?.removeAllRolesFromCache(); },                    getAlias: this._aliasNone,          get: async () => { return this._api?.getRolesTree(); }} ],
        [ APPLICATION_NAVIGATION.CODE.tabs.CLASSES.key,              { data: 'apexClassesTableData',                  remove: () => { this._api?.removeAllApexClassesFromCache(); },              getAlias: this._aliasNamespace,     get: async () => { return this._api?.getApexClasses(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.CODE.tabs.TESTS.key,                { data: 'apexTestsTableData',                    remove: () => { this._api?.removeAllApexTestsFromCache(); },                getAlias: this._aliasNamespace,     get: async () => { return this._api?.getApexTests(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.CODE.tabs.TRIGGERS.key,             { data: 'apexTriggersTableData',                 remove: () => { this._api?.removeAllApexTriggersFromCache(); },             getAlias: this._aliasNamespace,     get: async () => { return this._api?.getApexTriggers(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.CODE.tabs.UNCOMPILEDS.key,          { data: 'apexUncompiledTableData',               remove: () => { this._api?.removeAllApexUncompiledFromCache(); },           getAlias: this._aliasNamespace,     get: async () => { return this._api?.getApexUncompiled(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.DATAMODEL.tabs.CUSTOM_FIELDS.key,   { data: 'customFieldsTableData',                 remove: () => { this._api?.removeAllCustomFieldsFromCache(); },             getAlias: this._aliasAll,           get: async () => { return this._api?.getCustomFields(this.namespace, this.objectType, this.object); }} ],
        [ APPLICATION_NAVIGATION.DATAMODEL.tabs.LAYOUTS.key,         { data: 'pageLayoutsTableData',                  remove: () => { this._api?.removeAllPageLayoutsFromCache(); },              getAlias: this._aliasAll,           get: async () => { return this._api?.getPageLayouts(this.namespace, this.objectType, this.object); }} ],
        [ APPLICATION_NAVIGATION.DATAMODEL.tabs.RTS.key,             { data: 'recordTypesTableData',                  remove: () => { this._api?.removeAllRecordTypesFromCache(); },              getAlias: this._aliasAll,           get: async () => { return this._api?.getRecordTypes(this.namespace, this.objectType, this.object); }} ],
        [ APPLICATION_NAVIGATION.DATAMODEL.tabs.SOBJ_DESC.key,       { data: 'objectData',                            remove: () => { this._api?.removeObjectFromCache(this.object); },           getAlias: this._aliasObject,        get: async () => { return this.object !== '*' ? this._api?.getObject(this.object) : undefined; }} ],
        [ APPLICATION_NAVIGATION.DATAMODEL.tabs.SOBJECTS.key,        { data: 'objectsTableData',                      remove: () => { this._api?.removeAllObjectsFromCache(); },                  getAlias: this._aliasTypeNamespace, get: async () => { return this._api?.getObjects(this.namespace, this.objectType); }} ],
        [ APPLICATION_NAVIGATION.DATAMODEL.tabs.VRS.key,             { data: 'validationRulesTableData',              remove: () => { this._api?.removeAllValidationRulesFromCache(); },          getAlias: this._aliasAll,           get: async () => { return this._api?.getValidationRules(this.namespace, this.objectType, this.object); }} ],
        [ APPLICATION_NAVIGATION.DATAMODEL.tabs.WEB_LINKS.key,       { data: 'webLinksTableData',                     remove: () => { this._api?.removeAllWeblinksFromCache(); },                 getAlias: this._aliasAll,           get: async () => { return this._api?.getWeblinks(this.namespace, this.objectType, this.object); }} ],
        [ APPLICATION_NAVIGATION.ORG.tabs.GLOBAL_VIEW.key,           { data: '_internalGlobalViewDataFromAPI',        remove: () => { this._api?.removeGlobalViewFromCache(); },                  getAlias: this._aliasNone,          get: async () => { return this._api?.getGlobalView(); }} ],
        [ APPLICATION_NAVIGATION.ORG.tabs.URL_VIEW.key,              { data: '_internalHardCodedURLsViewDataFromAPI', remove: () => { this._api?.removeHardcodedURLsFromCache(); },               getAlias: this._aliasNone,          get: async () => { return this._api?.getHardcodedURLsView(); }} ],
        [ APPLICATION_NAVIGATION.SECURITY.tabs.APP_PERMS.key,        { data: '_internalAppPermissionsDataMatrix',     remove: () => { this._api?.removeAllAppPermissionsFromCache(); },           getAlias: this._aliasNamespace,     get: async () => { return this._api?.getApplicationPermissionsPerParent(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.SECURITY.tabs.BROWSERS.key,         { data: 'browsersTableData',                     remove: () => { this._api?.removeAllBrowsersFromCache(); },                 getAlias: this._aliasNone,          get: async () => { return this._api?.getBrowsers(); }} ],
        [ APPLICATION_NAVIGATION.SECURITY.tabs.CRUDS.key,            { data: '_internalObjectPermissionsDataMatrix',  remove: () => { this._api?.removeAllObjectPermissionsFromCache(); },        getAlias: this._aliasNamespace,     get: async () => { return this._api?.getObjectPermissionsPerParent(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.SECURITY.tabs.FLSS.key,             { data: '_internalFieldPermissionsDataMatrix',   remove: () => { this._api?.removeAllFieldPermissionsFromCache(); },         getAlias: this._aliasObjNamespace,  get: async () => { return this._api?.getFieldPermissionsPerParent(this.object, this.namespace); }} ],
        [ APPLICATION_NAVIGATION.SECURITY.tabs.PROFILE_PWDS.key,     { data: 'profilePasswordPoliciesTableData',      remove: () => { this._api?.removeAllProfilePasswordPoliciesFromCache(); },  getAlias: this._aliasNone,          get: async () => { return this._api?.getProfilePasswordPolicies(); }} ],
        [ APPLICATION_NAVIGATION.SECURITY.tabs.PROFILE_RSTRS.key,    { data: 'profileRestrictionsTableData',          remove: () => { this._api?.removeAllProfileRestrictionsFromCache(); },      getAlias: this._aliasNamespace,     get: async () => { return this._api?.getProfileRestrictions(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.SECURITY.tabs.PROFILES.key,         { data: 'profilesTableData',                     remove: () => { this._api?.removeAllProfilesFromCache(); },                 getAlias: this._aliasNamespace,     get: async () => { return this._api?.getProfiles(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.SECURITY.tabs.PSETS.key,            { data: 'permissionSetsTableData',               remove: () => { this._api?.removeAllPermSetsFromCache(); },                 getAlias: this._aliasNamespace,     get: async () => { return this._api?.getPermissionSets(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.SECURITY.tabs.PSLS.key,             { data: 'permissionSetLicensesTableData',        remove: () => { this._api?.removeAllPermSetLicensesFromCache(); },          getAlias: this._aliasNone,          get: async () => { return this._api?.getPermissionSetLicenses(); }} ],
        [ APPLICATION_NAVIGATION.SECURITY.tabs.USERS.key,            { data: 'usersTableData',                        remove: () => { this._api?.removeAllActiveUsersFromCache(); },              getAlias: this._aliasNone,          get: async () => { return this._api?.getActiveUsers(); }} ],
        [ APPLICATION_NAVIGATION.SETTING.tabs.ARTICLES.key,          { data: 'knowledgeArticlesTableData',            remove: () => { this._api?.removeAllKnowledgeArticlesFromCache(); },        getAlias: this._aliasNone,          get: async () => { return this._api?.getKnowledgeArticles(); }} ],
        [ APPLICATION_NAVIGATION.SETTING.tabs.DOCUMENTS.key,         { data: 'documentsTableData',                    remove: () => { this._api?.removeAllDocumentsFromCache(); },                getAlias: this._aliasNamespace,     get: async () => { return this._api?.getDocuments(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.SETTING.tabs.EMAIL_TPLS.key,        { data: 'emailTemplatesTableData',               remove: () => { this._api?.removeAllEmailTemplatesFromCache(); },           getAlias: this._aliasNamespace,     get: async () => { return this._api?.getEmailTemplates(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.SETTING.tabs.LABELS.key,            { data: 'customLabelsTableData',                 remove: () => { this._api?.removeAllCustomLabelsFromCache(); },             getAlias: this._aliasNamespace,     get: async () => { return this._api?.getCustomLabels(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.SETTING.tabs.SRS.key,               { data: 'staticResourcesTableData',              remove: () => { this._api?.removeAllStaticResourcesFromCache(); },          getAlias: this._aliasNamespace,     get: async () => { return this._api?.getStaticResources(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.VISUAL.tabs.AURAS.key,              { data: 'auraComponentsTableData',               remove: () => { this._api?.removeAllLightningAuraComponentsFromCache(); },  getAlias: this._aliasNamespace,     get: async () => { return this._api?.getLightningAuraComponents(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.VISUAL.tabs.HOME_PAGES.key,         { data: 'homePageComponentsTableData',           remove: () => { this._api?.removeAllHomePageComponentsFromCache(); },       getAlias: this._aliasNone,          get: async () => { return this._api?.getHomePageComponents(); }} ],
        [ APPLICATION_NAVIGATION.VISUAL.tabs.LG_PAGES.key,           { data: 'flexiPagesTableData',                   remove: () => { this._api?.removeAllLightningPagesFromCache(); },           getAlias: this._aliasNamespace,     get: async () => { return this._api?.getLightningPages(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.VISUAL.tabs.LWCS.key,               { data: 'lightningWebComponentsTableData',       remove: () => { this._api?.removeAllLightningWebComponentsFromCache(); },   getAlias: this._aliasNamespace,     get: async () => { return this._api?.getLightningWebComponents(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.VISUAL.tabs.TABS.key,               { data: 'customTabsTableData',                   remove: () => { this._api?.removeAllCustomTabsFromCache(); },               getAlias: this._aliasNamespace,     get: async () => { return this._api?.getCustomTabs(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.VISUAL.tabs.VFCS.key,               { data: 'visualForceComponentsTableData',        remove: () => { this._api?.removeAllVisualForceComponentsFromCache(); },    getAlias: this._aliasNamespace,     get: async () => { return this._api?.getVisualForceComponents(this.namespace); }} ],
        [ APPLICATION_NAVIGATION.VISUAL.tabs.VFPS.key,               { data: 'visualForcePagesTableData',             remove: () => { this._api?.removeAllVisualForcePagesFromCache(); },         getAlias: this._aliasNamespace,     get: async () => { return this._api?.getVisualForcePages(this.namespace); }} ],
    ]);


    /**
     * @description Call a specific method of the API given a tab name
     * @param {string} tabValue - The value of the tab to use
     * @param {boolean} [forceRefresh] - Do we force the refresh or not (false by default)
     * @param {boolean} [lazyRefresh] - Is it a lazy refresh or not (true by default)
     * @private
     * @async
     */ 
    async _updateData(tabValue, forceRefresh=false, lazyRefresh=true) {
        const transformer = this._internalTransformers.get(tabValue); 
        if (transformer) {
            if (forceRefresh === true) {
                // Call the remove cache from the API for this tabValue
                transformer.remove();
            }
            // IF we set the lazy refresh to TRUE THEN
            //     Only update the data if the current tab ("this.selectedSubTab") is the one we are looking for ("tabValue")
            // ELSE
            //     Update the data whatever the current tab is.
            // The IF statement could be like: 
            //     (lazyRefresh === true && tabValue === this.selectedSubTab) || lazyRefresh === false
            // Let's do some Bool logic!!
            // The previous IF statement is equivalent to:
            //     NOT(  NOT( (lazyRefresh === true && tabValue === this.selectedSubTab)     ||  lazyRefresh === false )  )
            //     NOT(  NOT(lazyRefresh === true && tabValue === this.selectedSubTab)       &&  NOT(lazyRefresh === false)  )
            //     NOT(  NOT(lazyRefresh === true && tabValue === this.selectedSubTab)       &&  lazyRefresh === true  )
            //     NOT( (NOT(lazyRefresh === true) || NOT(tabValue === this.selectedSubTab)) &&  lazyRefresh === true  )
            //     NOT( (    lazyRefresh === false ||     tabValue !== this.selectedSubTab ) &&  lazyRefresh === true  )
            //     NOT( (lazyRefresh === false &&  lazyRefresh === true ) || (tabValue !== this.selectedSubTab &&  lazyRefresh === true ) )
            //     NOT( (                    false                      ) || (tabValue !== this.selectedSubTab &&  lazyRefresh === true ) )
            //     NOT( (tabValue !== this.selectedSubTab && lazyRefresh === true )
            // This is magic! ;)
            if (!(tabValue !== this.selectedSubTab && lazyRefresh === true)) {
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
     * @throws {Error} If the current user has not enough permissions to run the app (please display the error it has information about missing permissions)
     * @private
     * @async
     */ 
    async _loadBasicInformationIfAccepted() {
        // Check for acceptance
        console?.log('Checking if the terms are accepted...')
        await this._checkTermsAcceptance();
        if (this.useOrgCheckInThisOrgConfirmed === false) {
            console?.log('The use of Org Check in this org was not confirmed. Stopping...');
            return;
        }
        console?.log('The use of Org Check in this org was confirmed. Continuing...');

        // Check basic permission for the current user
        console?.log('Checking if current user has enough permission...')
        await this._api?.checkCurrentUserPermissions(); // if no perm this throws an error

        // Information about the org
        console?.log('Information about the org...');
        const orgInfo = await this._api?.getOrganizationInformation();
        this.orgName = orgInfo.name + ' (' + orgInfo.id + ')';
        this.orgType = orgInfo.type;
        this.isOrgProduction = orgInfo.isProduction;
        if (orgInfo.isProduction === true) this.themeForOrgType = 'slds-theme_error';
        else if (orgInfo.isSandbox === true) this.themeForOrgType = 'slds-theme_warning';
        else this.themeForOrgType = 'slds-theme_success';
        
        // Data for the filters
        console?.log('Load filters...');
        await this._loadFilters();

        // Update daily API limit information
        console?.log('Update the daily API limit informations...');
        this._updateLimits();
    }

    /**
     * @description Load the list of values for the filter
     * @param {boolean} [forceRefresh] - Do we force the refresh or not (false by default)
     * @private
     * @async
     */ 
    async _loadFilters(forceRefresh=false) {
        console?.log('Hide the filter panel...');
        this._filters?.hide();

        if (forceRefresh === true) {
            console?.log('Clean data from cache (if any)...');
            this._api?.removeAllObjectsFromCache();
            this._api?.removeAllPackagesFromCache();
        }

        console?.log('Get packages, types and objects from the org...');
        const filtersData = await Promise.all([
            this._api?.getPackages(),
            this._api?.getObjectTypes(),
            this._api?.getObjects(this.namespace, this.objectType)
        ])

        console?.log('Loading data in the drop boxes...');
        this._filters?.updatePackageOptions(filtersData[0]);
        this._filters?.updateSObjectTypeOptions(filtersData[1]);
        this._filters?.updateSObjectApiNameOptions(filtersData[2]);

        console?.log('Showing the filter panel...');
        this._filters?.show();

        console?.log('Update the daily API limit informations...');
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
            // Get the list of subtabs' name for the main tab selected
            const subTabsAvailable = SUB_TABS_BY_MAIN_TAB_KEY.get(this.selectedMainTab); 

            if (subTabSet && subTabsAvailable.includes(this.selectedSubTab)) {
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
            cacheData.forEach((value, index) => {
                htmlContent += `<li><b>INDEX:</b> ${index}, <b>VALUE:</b> ${JSON.stringify(value)}</li>`;
            });
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
            const LOG_SECTION = 'RECOMPILE'
            /** @type {Map<string, string>} */;
            const apexClassNamesById = new Map();
            this._spinner?.sectionLog(LOG_SECTION, 'Processing...');
            this.apexUncompiledTableData.slice(0, 25).forEach(c => {
                const classId = c.id.substring(0, 15);
                const className = c.name;
                this._spinner?.sectionLog(`${LOG_SECTION}-${classId}`, `Asking to recompile class: ${className}`);
                apexClassNamesById.set(classId, className);
            });
            /** @type {Map<string, {isSuccess: boolean, reasons?: Array<string>}>} */
            const responses = await this._api?.compileClasses(Array.from(apexClassNamesById.keys()), );
            this._spinner?.sectionLog(LOG_SECTION, 'We got the response from the server...');
            let noError = true;
            responses.forEach((result, id) => {
                const name = apexClassNamesById.get(id.substring(0, 15));
                if (result.isSuccess === true) {
                    this._spinner?.sectionEnded(`${LOG_SECTION}-${id}`, `Recompilation requested for class: ${name} (${id})`);
                } else {
                    this._spinner?.sectionFailed(`${LOG_SECTION}-${id}`, `Errors for class ${name} (${id}): ${result.reasons.join(', ')}`);
                    noError = false;
                }
            });
            if (noError === true) {
                this._spinner?.sectionEnded(LOG_SECTION, 'Done!');
                this._openModal('Recompilation Requested Successfully',
                    'Please hit the Refresh button (in Org Check) to get the latest data '+
                    'from your Org.  By the way, in the future, if you need to '+
                    'recompile ALL the classes, go to "Setup > Custom '+
                    'Code > Apex Classes" and click on the link "Compile all classes".'
                );
            } else {
                this._spinner?.sectionFailed(LOG_SECTION, 'Done but with errors');
            }
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
                            `Please review our <a href="http://sfdc.co/OrgCheck-FAQ" target="_blank" rel="external noopener noreferrer">Org Check FAQ</a> and try to resolve this issue in your Org based on our community's feedback. <br /><br /> `+
                            `If the FAQ is not helping, consider creating an issue on <a href="http://sfdc.co/OrgCheck-Backlog" target="_blank" rel="external noopener noreferrer">Org Check Issues tracker</a> `+
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
    fieldSetsTableDefinition = TableDefinitions.FieldSets;

    /**
     * @description Table definition for page layouts (specific to the current selected object)
     * @type {ocui.Table}
     */
    layoutsTableDefinition = TableDefinitions.Layouts;

    /**
     * @description Table definition for object limits (specific to the current selected object)
     * @type {ocui.Table}
     */
    limitsTableDefinition = TableDefinitions.Limits;

    /**
     * @description Table definition for validation rules
     * @type {ocui.Table}
     */
    validationRulesTableDefinition = TableDefinitions.ValidationRules;

    /**
     * @description Table definition for validation rules (specific to the current selected object)
     * @type {ocui.Table}
     */
    validationRulesInObjectTableDefinition = TableDefinitions.ValidationRulesInObject;

    /**
     * @description Table definition for web links (specific to the current selected object)
     * @type {ocui.Table}
     */
    webLinksInObjectTableDefinition = TableDefinitions.WebLinksInObject;
    
    /**
     * @description Table definition for web links (for all objects)
     * @type {ocui.Table}
     */
    webLinksTableDefinition = TableDefinitions.WebLinks;

    /**
     * @description Table definition for static resources
     * @type {ocui.Table}
     */
    staticResourcesTableDefinition = TableDefinitions.StaticResources;

    /**
     * @description Table definition for record types (specific to the current selected object)
     * @type {ocui.Table}
     */
    recordTypesInObjectTableDefinition = TableDefinitions.RecordTypesInObject;

    /**
     * @description Table definition for record types for all objects
     * @type {ocui.Table}
     */
    recordTypesTableDefinition = TableDefinitions.RecordTypes;

    /**
     * @description Table definition for sobject relationships (specific to the current selected object)
     * @type {ocui.Table}
     */
    relationshipsTableDefinition = TableDefinitions.Relationships

    /**
     * @description Table definition for chatter groups
     * @type {ocui.Table}
     */
    chatterGroupsTableDefinition = TableDefinitions.ChatterGroups;

    /**
     * @description Data definition for browsers
     * @type {ocui.Table}
     */
    browsersTableDefinition = TableDefinitions.Browsers;

    /**
     * @description Table definition for custom fields
     * @type {ocui.Table}
     */
    customFieldsTableDefinition = TableDefinitions.CustomFields;

    /**
     * @description Table definition for custom fields (specific to the current selected object)
     * @type {ocui.Table}
     */
    customFieldsInObjectTableDefinition = TableDefinitions.CustomFieldsInObject;

    /**
     * @description Table definition for standard fields (specific to the current selected object)
     * @type {ocui.Table}
     */
    standardFieldsInObjectTableDefinition = TableDefinitions.StandardFieldsInObject;
    /**
     * @description Table definition for custom labels
     * @type {ocui.Table}
     */
    customLabelsTableDefinition = TableDefinitions.CustomLabels;

    /**
     * @description Table definition for custom tabs
     * @type {ocui.Table}
     */
    customTabsTableDefinition = TableDefinitions.CustomTabs;

    /**
     * @description Table definition for documents
     * @type {ocui.Table}
     */
    documentsTableDefinition = TableDefinitions.Documents;

    /**
     * @description Table definition for dashboards
     * @type {ocui.Table}
     */
    dashboardsTableDefinition = TableDefinitions.Dashboards;

    /**
     * @description Table definition for reports
     * @type {ocui.Table}
     */
    reportsTableDefinition = TableDefinitions.Reports;

    /**
     * @description Table definition for lightning aura components
     * @type {ocui.Table}
     */
    auraComponentsTableDefinition = TableDefinitions.AuraComponents;

    /**
     * @description Table definition for lightning pages
     * @type {ocui.Table}
     */
    flexiPagesTableDefinition = TableDefinitions.FlexiPages;

    /**
     * @description Table definition for lightning pages within an SObject
     * @type {ocui.Table}
     */
    flexiPagesInObjectTableDefinition = TableDefinitions.FlexiPagesInObject;
    
    /**
     * @description Table definition for knowledge articles
     * @type {ocui.Table}
     */ 
    knowledgeArticlesTableDefinition = TableDefinitions.KnowledgeArticles;

    /**
     * @description Table definition for lightning web components
     * @type {ocui.Table}
     */
    lightningWebComponentsTableDefinition = TableDefinitions.LightningWebComponents;


    /**
     * @description Table definition for page layouts
     * @type {ocui.Table}
     */
    pageLayoutsTableDefinition = TableDefinitions.PageLayouts;

    /**
     * @description Table definition for permission sets
     * @type {ocui.Table}
     */
    permissionSetsTableDefinition = TableDefinitions.PermissionSets;

    /**
     * @description Table definition for permission set licenses
     * @type {ocui.Table}
     */
    permissionSetLicensesTableDefinition = TableDefinitions.PermissionSetLicenses;

    /**
     * @description Table definition for profiles
     * @type {ocui.Table}
     */
    profilesTableDefinition = TableDefinitions.Profiles;

    /**
     * @description Table definition for profile restrictions
     * @type {ocui.Table}
     */
    profileRestrictionsTableDefinition = TableDefinitions.ProfileRestrictions;

    /**
     * @description Table definition for profiles password policies
     * @type {ocui.Table}
     */
    profilePasswordPoliciesTableDefinition = TableDefinitions.ProfilePasswordPolicies;

    /**
     * @description Table definition for public groups
     * @type {ocui.Table}
     */
    publicGroupsTableDefinition = TableDefinitions.PublicGroups;

    /**
     * @description Table definition for queues
     * @type {ocui.Table}
     */
    queuesTableDefinition = TableDefinitions.Queues;

    /**
     * @description Table definition for active internal users
     * @type {ocui.Table}
     */
    usersTableDefinition = TableDefinitions.Users;

    /**
     * @description Table definition for visualforce components
     * @type {ocui.Table}
     */
    visualForceComponentsTableDefinition = TableDefinitions.VisualForceComponents;

    /**
     * @description Table definition for visualforce pages
     * @type {ocui.Table}
     */
    visualForcePagesTableDefinition = TableDefinitions.VisualForcePages;

    /**
     * @description Table definition for apex classes (compiled and not tests)
     * @type {ocui.Table}
     */
    apexClassesTableDefinition = TableDefinitions.ApexClasses;

    /**
     * @description Table definition for uncompiled apex classes
     * @type {ocui.Table}
     */    
    apexUncompiledTableDefinition = TableDefinitions.ApexUncompiledClasses;

    /**
     * @description Table definition for apex triggers
     * @type {ocui.Table}
     */
    apexTriggersTableDefinition = TableDefinitions.ApexTriggers;

    /**
     * @description Table definition for apex triggers within SObject
     * @type {ocui.Table}
     */
    apexTriggersInObjectTableDefinition = TableDefinitions.ApexTriggersInObject;

    /**
     * @description Table definition for apex classes that are tests
     * @type {ocui.Table}
     */
    apexTestsTableDefinition = TableDefinitions.ApexTests;

    /**
     * @description Table definition for SObjects
     * @type {ocui.Table}
     */
    objectsTableDefinition = TableDefinitions.Objects;

    /**
     * @description Table definition for flows
     * @type {ocui.Table}
     */
    flowsTableDefinition = TableDefinitions.Flows;

    /**
     * @description Table definition for email templates
     * @type {ocui.Table}
     */ 
    emailTemplatesTableDefinition = TableDefinitions.EmailTemplates;

    /**
     * @description Table definition for home page components
     * @type {ocui.Table}
     */ 
    homePageComponentsTableDefinition = TableDefinitions.HomePageComponents;

    /**
     * @description Table definition for process builders
     * @type {ocui.Table}
     */
    processBuildersTableDefinition = TableDefinitions.ProcessBuilders;
    
    /**
     * @description Table definition for workflows
     * @type {ocui.Table}
     */
    workflowsTableDefinition = TableDefinitions.Workflows;

    /**
     * @description Table definition for workflows in an object
     * @type {ocui.Table}
     */
    workflowsInObjectTableDefinition = TableDefinitions.WorkflowsInObject;

    /**
     * @description Table definition for roles
     * @type {ocui.Table}
     */
    rolesTableDefinition = TableDefinitions.Roles;

    /**
     * @description Table definition for object permissions
     * @type {ocui.Table}
     */
    get objectPermissionsTableDefinition() { return TableDefinitions.ObjectPermissions(this._internalObjectPermissionsDataMatrix); }
 
    /**
     * @description Table definition for application permissions
     * @type {ocui.Table}
     */
    get appPermissionsTableDefinition() { return TableDefinitions.AppPermissions(this._internalAppPermissionsDataMatrix); }
    
    /**
     * @description Table definition for field permissions
     * @type {ocui.Table}
     */
    get fieldPermissionsTableDefinition() { return TableDefinitions.FieldPermissions(this._internalFieldPermissionsDataMatrix); }

    /**
     * @description Table definition for score rules
     * @type {ocui.Table}
     */
    get scoreRulesTableDefinition() { return TableDefinitions.ScoreRules(this._internalAllScoreRulesDataMatrix); }
    
    /**
     * @description Table definition for hard coded urls view
     */
    hardCodedURLsViewTableDefinition = TableDefinitions.HardCodedURLsView(MAX_ITEMS_IN_HARDCODED_URLS_LIST);


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
        sheets.push(ocui.RowsFactory.createAndExport(TableDefinitions.StandardFieldsInObject, this.objectData.standardFields, 'Standard Fields', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(TableDefinitions.CustomFieldsInObject, this.objectData.customFieldRefs, 'Custom Fields', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(TableDefinitions.ApexTriggersInObject, this.objectData.apexTriggerRefs, 'Apex Triggers', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(TableDefinitions.FieldSets, this.objectData.fieldSets, 'Field Sets', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(TableDefinitions.Layouts, this.objectData.layouts, 'Page Layouts', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(TableDefinitions.FlexiPagesInObject, this.objectData.flexiPages, 'Lightning Pages', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(TableDefinitions.Limits, this.objectData.limits, 'Limits', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(TableDefinitions.ValidationRulesInObject, this.objectData.validationRules, 'Validation Rules', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(TableDefinitions.WebLinksInObject, this.objectData.webLinks, 'Web Links', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(TableDefinitions.RecordTypesInObject, this.objectData.recordTypes, 'Record Types', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(TableDefinitions.Relationships, this.objectData.relationships, 'Relationships', ocapi.SecretSauce.GetScoreRuleDescription));
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
     * @param {Map} data - The data from the API
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
            data?.forEach((item, recipe) => {
                const tabValue = RECIPE_TO_SUB_TAB.get(recipe);
                const transfomer = this._internalTransformers.get(tabValue);
                const itemName = SUB_TABS.get(tabValue)?.tab?.title ?? tabValue;
                const definitionName = transfomer.data.replace(/Data$/, 'Definition');
                const definitionTable = this[definitionName];
                globalViewData.push({
                    countBad: item?.countBad,
                    label: itemName,
                    hadError: item?.hadError,
                    class: `slds-box viewCard ${item?.hadError === true ? 'viewCard-error' : (item?.countBad === 0 ? 'viewCard-no-bad-data' : 'viewCard-some-bad-data')}`,
                    tab: SUB_TABS.get(tabValue).mainTabKey,
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
     * @param {Map} data - The data from the API
     */ 
    set _internalHardCodedURLsViewDataFromAPI(data) {
        if (data) {
            const hardCodedURLsViewData = [];
            const sheets = [];
            data?.forEach((item, recipe) => {
                const tabValue = RECIPE_TO_SUB_TAB.get(recipe);
                const transfomer = this._internalTransformers.get(tabValue);
                const itemName = SUB_TABS.get(tabValue)?.tab?.title ?? tabValue;
                const definitionName = transfomer.data.replace(/Data$/, 'Definition');
                /** @type {ocui.Table} */
                const definitionTable = this[definitionName];
                /** @type {ocui.TableColumnWithData} */
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
                if (item?.data?.length > 0) {
                    sheets.push(ocui.RowsFactory.createAndExport(definitionTable, item?.data, itemName, ocapi.SecretSauce.GetScoreRuleDescription));
                }
            });
            this.hardCodedURLsViewData = hardCodedURLsViewData; // no need to sort
            this.hardCodedURLsViewItemsExport = sheets.sort((a, b) => { return (a?.rows?.length ?? 0) < (b?.rows?.length ?? 0) ? 1 : -1; }); // sorted by Nb Rows
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