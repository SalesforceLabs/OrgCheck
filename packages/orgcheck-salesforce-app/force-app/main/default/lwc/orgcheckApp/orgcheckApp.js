import { LightningElement, api, track } from 'lwc';
import OrgCheckStaticResource from '@salesforce/resourceUrl/OrgCheck_SR';
import { loadScript } from 'lightning/platformResourceLoader';

export default class OrgcheckApp extends LightningElement {

    /** 
     * @deprecated
     */
    @api textEncoder;

    /** 
     * @deprecated
     */
    @api textDecoder;

    /** 
     * @deprecated
     */
    @api userId;

    /**
     * @description Verbose mode for the logs (false by default) -- if true, we copy all the logs (and debugà in the console of the borwser
     * @type {boolean}
     */
    @api verbose = false;

    /**
     * @description Local storage
     * @type {Storage}
     * @public
     */ 
    @api localStorage;

    /** 
     * @description Access Token of the current user
     *                 This value is decorated by "api" so it can be passed by the parent.
     *                 Indeed the value will be set by the parent (a Visual Force page) and will be used by the Org Check API
     * @type {string}
     */
    @api accessToken;

    /**
     * @description We want the jokes of the day to be available in the app as well!
     * @type {{ question: string, answer: string }[]}
     */
    @api jokes;

    /**
     * @description URL for the logo in the header
     * @type {string} 
     * @public
     */
    logoURL = OrgCheckStaticResource + '/img/Logo.svg';

    /**
     * @description Current user has accepted the usage terms
     * @type {{ accepted: boolean, needConfirmation: boolean, manuallyAccepted: boolean }}
     * @public
     */
    @track useOrgCheck = {
        // Current user has accepted the usage terms
        accepted: false,
        // We need the current user to accept explicitely the usage terms
        needConfirmation: false,
        // If we need a confirmation, we store here the explicit validation of the user
        manuallyAccepted: false
    };

    /**
     * @description Org Check version -- will be updated when the Org Check API is loaded
     * @type {string} 
     * @public
     */
    orgCheckVersion;

    /**
     * @description Numerical representation of the Salesforce API Version we use in Org 
     *              Check -- will be updated when the Org Check API is loaded
     * @type {number}
     * @public
     */
    salesforceApiVersion;

    /**
     * @description Information about the salesforce organization we are connected to -- will 
     *              be updated when the Org Check API is loaded and terms are accepted
     * @type {{ name: string, type: string, theme: string }}
     * @public
     */
    @track orgInformation = {
        // Org Id
        id: '',
        // Org name
        name: '',
        // Org type. Can be 'Production', 'Sandbox', 'Trial' or 'Developer Edition' 
        type: '',
        // Depending on the type of the org, we can have different themes in the UI
        theme: ''
    }

    /**
     * @description Information about the current limit we have for the salesforce -- will 
     *              be updated when the Org Check API is loaded, terms are accepted and
     *              everytime org check api is reaching Salesforce servers
     * @type {{ hasInformation: boolean, usage: string, theme: string }}
     * @public
     */
    @track orgLimit = {
        // Do we have yet any information about the org limits (will be false until we 
        // get the first information from the API)
        hasInformation: false,
        // Org usage limit information
        usage: '',
        // Depending on the limits, we can have different themes in the UI
        theme: ''
    }

    /**
     * @description Data received from the Org Check API and used in the different 
     *              components of the UI.
     * @type {Object<string, Data | Data[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]>}
     */
    @track data = { };

    /**
     * @description Data received from the Org Check API and used in the different 
     *              tables and components of the UI.
     * @type {Object<string, Table | SfdcObjectAsTable | Table[]>}
     */
    @track tableData = { };

    /**
     * @description Exports data
     * @type {Object<string, ExportedTable | ExportedTable[]>}
     */
    @track exports = { };

    /**
     * @description Is something is loading?
     * @type {boolean}
     * @public
     */
    isLoading = false

    /**
     * @description List of items for the navigation menu on the left of the app
     * @type {{ label: string, name: string, expanded: boolean, items: Array<{ label: string, name: string, metatext: string }> }[]}
     * @public
     */
    @track navigationMenuItems;

    /**
     * @description Selected item in the navigation tree
     * @type {string}
     * @public
     */
    navigationMenuSelected;

    /**
     * @description Current content pane title
     * @type {string}
     * @public
     */
    currentContentTitle;

    /**
     * @description Should we show the refresh button for the current content pane (depends on the navigation item definition)
     * @type {boolean}
     * @public
     */
    showRefreshButton;

    /**
     * @description Internal properties without LWC reactivity
     * @property {OrgCheckAPI} api - The Org Check API instance
     * @property {boolean} hasInitialized - This flag prevents double initialization of the API + UI flow
     * @property {boolean} childrenReady - This flag checks that the children components are ready
     * @property {any} spinner - Spinner component
     * @property {any} modal - Modal component
     * @property {any} filters - Global filter component
     * @property {any} initialNavigationMenuItems - Initial navigation menu items
     */
    _private_properties = {
        api: undefined,
        hasInitialized: false,
        childrenReady: false,
        spinner: undefined,
        modal: undefined,
        filters: undefined,
        tree: undefined,
        appNavigation: undefined,
        initialNavigationMenuItems: undefined,
        appNavItemsByKey: undefined
    };

    /**
     * @description After the component is fully load let's init some elements and the api
     * @public
     */
    renderedCallback() { 
        // Wire child refs if not wired 
        if (!this._private_properties.spinner) this._private_properties.spinner = this.template.querySelector('c-orgcheck-spinner'); 
        if (!this._private_properties.tree) this._private_properties.tree = this.template.querySelector('lightning-tree');
        if (!this._private_properties.modal) this._private_properties.modal = this.template.querySelector('c-orgcheck-modal'); 
        if (!this._private_properties.filters) this._private_properties.filters = this.template.querySelector('c-orgcheck-global-filters');
        if (this._private_properties.spinner && this._private_properties.tree && this._private_properties.modal && this._private_properties.filters && !this._private_properties.childrenReady) this._private_properties.childrenReady = true;
        // Kick off initial flow once when both accessToken & localStorage is present and children are ready. 
        if (!this._private_properties.hasInitialized && this._private_properties.childrenReady && this.accessToken && this.localStorage) {
            this._private_properties.hasInitialized = true; 
            // Defer heavy work to a microtask to avoid re-entrancy in rendering
            Promise.resolve().then(() => this.initApi()).catch((error) => {
                this.isLoading = false;
                console.error('Uncaught error from initApi:', error);
            });
        }
    }

    /**
     * @description Initialize the Org Check API mostly
     * @async
     */
    async initApi() {
        
        const SECTION_01 = 'Initialize the Org Check API and its dependencies';
        const SECTION_02 = 'Load libraries from static resource';
        const SECTION_03 = 'Initiate the Org Check API'; 
        const SECTION_04 = 'Additional steps';
        try {
            // Show spinner
            this.isLoading = true;
            this._private_properties.spinner?.open();
            this._private_properties.spinner?.sectionLog(SECTION_01, `C'est parti...`);

            // Load the javascript scripts (including orgcheck) from the static resource
            this._private_properties.spinner?.sectionLog(SECTION_02, `Start loading...`);
            try {
                await Promise.all([
                    loadScript(this, OrgCheckStaticResource + '/js/jsforce.js'),
                    loadScript(this, OrgCheckStaticResource + '/js/fflate.js'),
                    loadScript(this, OrgCheckStaticResource + '/js/lfs.js'),
                    loadScript(this, OrgCheckStaticResource + '/js/orgcheck.js'),
                ]);
                this._private_properties.spinner?.sectionEnded(SECTION_02, `Done.`);
            } catch (error) {
                this._private_properties.spinner?.sectionFailed(SECTION_02, error);
                throw new Error(`Error while loading libraries from static resource`);
            }

            // Create an Org Check API
            this._private_properties.spinner?.sectionLog(SECTION_03, `Start initiating...`);
            try {
                this._private_properties.api = __orgcheck__Get()?.ApiFactory?.create({
                    salesforce: {
                        authenticationOptions: {
                            accessToken: this.accessToken
                        }
                    },
                    // Storage methods -- delegation to the local storage (which is the one of the browser)
                    storage: {
                        setItem: (key, value) => this.localStorage.setItem(key, value),
                        getItem: (key) => this.localStorage.getItem(key),
                        removeItem: (key) => this.localStorage.removeItem(key),
                        key: (n) => this.localStorage.key(n),
                        length: () => this.localStorage.length
                    },
                    // Log methods -- delegation to the UI spinner
                    logSettings: {
                        started: (section) => {
                            if (this.verbose) {
                                console.log(`Org Check [${section}] BEGIN`); 
                            }
                        },
                        messageLogged: (section, message) => { 
                            this._private_properties.spinner?.sectionLog(section, message); 
                            if (this.verbose) {
                                console.log(`Org Check [${section}] LOG: ${message}`); 
                            }
                        },
                        endedWithError: (section, error) => { 
                            this._private_properties.spinner?.sectionFailed(section, error); 
                            if (this.verbose) {
                                console.error(`Org Check [${section}] ERROR: ${error?.message}`, error); 
                            }
                        },
                        endedSuccessfully: (section, message) => { 
                            this._private_properties.spinner?.sectionEnded(section, message); 
                            if (this.verbose) {
                                console.log(`Org Check [${section}] SUCCESS: ${message}`); 
                            }
                        },
                        messageSilentlyLogged: (section, message) => { 
                            if (this.verbose) {
                                console.debug(`Org Check [${section}] DEBUG: ${message}`); 
                            }
                        },
                        stopped: (section) => {
                            if (this.verbose) {
                                console.log(`Org Check [${section}] END`); 
                            }
                        }
                    }
                });
                this._private_properties.spinner?.sectionEnded(SECTION_03, `Done.`);
            } catch (error) {
                this._private_properties.spinner?.sectionFailed(SECTION_03, error);
                throw new Error(`Error while initiating Org Check API`);
            }

            // Some other stuff to do
            this._private_properties.spinner?.sectionLog(SECTION_04, `Starting...`);
            try {
                // Get the version of Org Check because we want to display it in the headers
                this._private_properties.spinner?.sectionLog(SECTION_04, `Get the version of Org Check...`);
                this.orgCheckVersion = this._private_properties.api?.version;
                // Get the Salesforce API version we are using because we want to display it in the headers
                this._private_properties.spinner?.sectionLog(SECTION_04, `Get the Salesforce API version used that Org Check is using...`);
                this.salesforceApiVersion = this._private_properties.api?.salesforceApiVersion;
                // Create the initial navigation tree
                this._private_properties.appNavigation = this._initApplicationNavigationItems();
                const allTitles = this._private_properties.api?.titlesForAllData();
                this._private_properties.appNavItemsByKey = new Map();
                this.navigationMenuItems = this._private_properties.initialNavigationMenuItems = Object.keys(this._private_properties.appNavigation).map((sectionKey) => { 
                    const section = this._private_properties.appNavigation[sectionKey];
                    return {
                        label: section.title,
                        name: section.key,
                        expanded: false,
                        items: Object.keys(section.items).map((itemKey) => {
                            const item = section.items[itemKey];
                            const itemTitle = item.recipe ? allTitles.get(item.recipe) ?? item.title : item.title;
                            this._private_properties.appNavItemsByKey.set(item.key, { 
                                title: itemTitle, 
                                lastAlias: '', 
                                data: item.data, 
                                action: item.action,
                                recipe: item.recipe,
                                refreshButtonVisible: item.refreshButtonVisible, 
                                onlyIf: item.onlyIf 
                            });
                            return { label: itemTitle, name: item.key }
                        })
                    }
                });
                // Load basic information if the user has already accepted the terms
                this._private_properties.spinner?.sectionLog(SECTION_04, `Load basic information if the user has already accepted the terms...`);
                await this._async_loadBasicInformationIfAccepted();
                this._private_properties.spinner?.sectionEnded(SECTION_04, `Done.`);
            } catch (error) {
                this._private_properties.spinner?.sectionFailed(SECTION_04, error);
                throw new Error(`Error while processing additional steps`);
            }

            this._private_properties.spinner?.sectionEnded(SECTION_01, 'Done');
        } catch (error) {
            this._private_properties.spinner?.sectionFailed(SECTION_01, error);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * @description Initialize the navigation menu items with the corresponding keys, titles and action names (to link with the API)
     */
    _initApplicationNavigationItems() {
        const Recipes = __orgcheck__Get()?.Recipes;
        return {
            HOME: { 
                key: 'A', 
                title: 'Home',
                items: { 
                    WELCOME:       { key: '01', refreshButtonVisible: false, title: '👋​ Welcome!' },
                    CACHE:         { key: '02', refreshButtonVisible: false, data: 'cacheitems', action: (api) => api.listCacheItems(), title: '🧹 Cache' },
                    HELP:          { key: '03', refreshButtonVisible: false, data: 'scorerules', recipe: Recipes.SCORE_RULES }
                }
            },
            ORG: { 
                key: 'B', 
                title: '🗺️ Salesforce Organization',
                items: {   
                    GLOBAL_VIEW:   { key: '04', data: 'globalview', recipe: Recipes.GLOBAL_VIEW },
                    URL_VIEW:      { key: '05', data: 'hardcodedurls', recipe: Recipes.HARDCODED_URLS_VIEW },
                }
            },
            DATAMODEL: { 
                key: 'C', 
                title: '⚽ Data model',
                items: { 
                    SOBJ_DESC:     { key: '06', data: 'object', recipe: Recipes.OBJECT, /* get the data only if the object is specified */ onlyIf: (that) => (that.isObjectSpecified)  },
                    SOBJECTS:      { key: '07', data: 'objects', recipe: Recipes.OBJECTS },
                    CUSTOM_FIELDS: { key: '08', data: 'customfields', recipe: Recipes.CUSTOM_FIELDS },
                    LAYOUTS:       { key: '09', data: 'pagelayouts', recipe: Recipes.PAGE_LAYOUTS },
                    VRS:           { key: '0A', data: 'validationrules', recipe: Recipes.VALIDATION_RULES },
                    RTS:           { key: '0B', data: 'recordtypes', recipe: Recipes.RECORD_TYPES },
                    WEB_LINKS:     { key: '0C', data: 'weblinks', recipe: Recipes.WEBLINKS },
                    SHARING_RULES: { key: '32', data: 'sharingrules', recipe: Recipes.SHARING_RULES },
                }
            },
            SECURITY: { 
                key: 'D', 
                title: '👮 Security and Access',
                items: { 
                    USERS:          { key: '0D', data: 'internalactiveusers', recipe: Recipes.INTERNAL_ACTIVE_USERS },
                    PROFILES:       { key: '0E', data: 'profiles', recipe: Recipes.PROFILES },
                    PSETS:          { key: '0F', data: 'permissionsets', recipe: Recipes.PERMISSION_SETS },
                    PSLS:           { key: '10', data: 'permissionsetlicenses', recipe: Recipes.PERMISSION_SET_LICENSES },
                    PROFILE_RSTRS:  { key: '11', data: 'profilerestrictions', recipe: Recipes.PROFILE_RESTRICTIONS },
                    PROFILE_PWDS:   { key: '12', data: 'profilepasswordpolicies', recipe: Recipes.PROFILE_PASSWORD_POLICIES },
                    CRUDS:          { key: '13', data: 'objectpermissions', recipe: Recipes.OBJECT_PERMISSIONS },
                    FLSS:           { key: '14', data: 'fieldpermissions', recipe: Recipes.FIELD_PERMISSIONS, /* get the data only if the object is specified */ onlyIf: (that) => (that.isObjectSpecified) },
                    APP_PERMS:      { key: '15', data: 'apppermissions', recipe: Recipes.APP_PERMISSIONS },
                    BROWSERS:       { key: '16', data: 'browsers', recipe: Recipes.BROWSERS },
                    RELEASEUPDATES: { key: '31', data: 'releaseupdates', recipe: Recipes.RELEASE_UPDATES },
                }
            },
            BOXES: { 
                key: 'E', 
                title: '🐇 Boxes',
                items: { 
                    ROLES_GRAPH:   { key: '17', data: 'userrolestree', action: async (api) => await api.getRolesAsTree(), title: '🐙 Internal Role Explorer' },
                    ROLES:         { key: '18', data: 'userroles', recipe: Recipes.USER_ROLES },
                    PGS:           { key: '19', data: 'publicgroups', recipe: Recipes.PUBLIC_GROUPS },
                    QUEUES:        { key: '1A', data: 'queues', recipe: Recipes.QUEUES },
                    CHT_GROUPS:    { key: '1B', data: 'chatterroups', recipe: Recipes.COLLABORATION_GROUPS },
                }
            },
            AUTOMATION: { 
                key: 'F', 
                title: '🤖 Automations',
                items: { 
                    FLOWS:         { key: '1C', data: 'flows', recipe: Recipes.FLOWS },
                    PBS:           { key: '1D', data: 'processbuilders', recipe: Recipes.PROCESS_BUILDERS },
                    WORKFLOWS:     { key: '1E', data: 'workflows', recipe: Recipes.WORKFLOWS },
                }
            },
            SETTING: { 
                key: 'G', 
                title: '🎁 Setting',
                items: {
                    LABELS:        { key: '1F', data: 'customlabels', recipe: Recipes.CUSTOM_LABELS },
                    DOCUMENTS:     { key: '20', data: 'documents', recipe: Recipes.DOCUMENTS },
                    EMAIL_TPLS:    { key: '21', data: 'emailtemplates', recipe: Recipes.EMAIL_TEMPLATES },
                    ARTICLES:      { key: '22', data: 'knowledgearticles', recipe: Recipes.KNOWLEDGE_ARTICLES },
                    SRS:           { key: '23', data: 'staticresources', recipe: Recipes.STATIC_RESOURCES },
                }
            },
            VISUAL: { 
                key: 'H', 
                title: '🥐 User Interface',
                items: {
                    VFPS:          { key: '24', data: 'visualforcepages', recipe: Recipes.VISUALFORCE_PAGES },
                    VFCS:          { key: '25', data: 'visualforcecomponents', recipe: Recipes.VISUALFORCE_COMPONENTS },
                    LG_PAGES:      { key: '26', data: 'lightningpages', recipe: Recipes.LIGHTNING_PAGES },
                    AURAS:         { key: '27', data: 'lightningauracomponents', recipe: Recipes.LIGHTNING_AURA_COMPONENTS },
                    LWCS:          { key: '28', data: 'lightningwebcomponents', recipe: Recipes.LIGHTNING_WEB_COMPONENTS },
                    HOME_PAGES:    { key: '29', data: 'homepages', recipe: Recipes.HOME_PAGES },
                    TABS:          { key: '2A', data: 'customtabs', recipe: Recipes.CUSTOM_TABS },
                }
            },
            CODE: { 
                key: 'I', 
                title: '🔥 Programmatic',
                items: {
                    CLASSES:       { key: '2B', data: 'apexclasses', recipe: Recipes.APEX_CLASSES },
                    UNCOMPILEDS:   { key: '2C', data: 'apexuncompiled', recipe: Recipes.APEX_UNCOMPILED, storeData: true },
                    TRIGGERS:      { key: '2D', data: 'apextriggers', recipe: Recipes.APEX_TRIGGERS },
                    TESTS:         { key: '2E', data: 'apextests', recipe: Recipes.APEX_TESTS },
                }
            },
            ANALYTICS: { 
                key: 'J', 
                title: '⛰️ Analytics',
                items: {
                    REPORTS:       { key: '2F', data: 'reports', recipe: Recipes.REPORTS },
                    DASHBOARDS:    { key: '30', data: 'dashboards', recipe: Recipes.DASHBOARDS },
                }
            }
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
     */ 
    get namespace() {
        if (this._private_properties.filters?.isSelectedPackageAny === true) {
            return ANY;
        }
        if (this._private_properties.filters?.isSelectedPackageNo === true) {
            return EMPTY;
        }
        return this._private_properties.filters?.selectedPackage;
    }

    /**
     * @description Getter for the selected sobject type from the global filter
     * @returns {string} Wildcard ('*') if 'any type' selected, otherwise the name of the seleted type.
     */ 
    get objectType() {
        if (this._private_properties.filters?.isSelectedSObjectTypeAny === true) {
            return ANY;
        }
        return this._private_properties.filters?.selectedSObjectType;
    }

    /**
     * @description Getter for the selected sobject name from the global filter
     * @returns {string} Wildcard ('*') if 'any sobject' selected, otherwise the name of the seleted sobject.
     */ 
    get object() {
        if (this._private_properties.filters?.isSelectedSObjectApiNameAny === true) {
            return ANY;
        }
        return this._private_properties.filters?.selectedSObjectApiName;
    }

    /**
     * @description Some tabs require object to be specified in the filter (like Object Description and Field Permissions)
     * @type {boolean}
     */ 
    isObjectSpecified;

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
        return this.tabs.selectedSubTab === this._private_properties.appNavigation.CODE.items.UNCOMPILEDS.key && this.apexUncompiledTableData?.length > 0 || false;
    }

    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Internal methods that will be used by the handlers later
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description Please go to a page/content given its key in the navigation tree
     * @param {string} keyPage - The key of the page to go to
     * @private
     * @async
     */
    async _async_goToPage(keyPage) {
        if (this._private_properties.appNavItemsByKey.has(keyPage)) {
            try {
                this.isLoading = true;
                if (this.useOrgCheck.accepted === false) {
                    // force to go to main page if terms not accepted
                    this.navigationMenuSelected = this._private_properties.appNavigation.HOME.items.WELCOME.key;
                } else {
                    // else you go where you want!
                    this.navigationMenuSelected = keyPage;
                    await this._async_updateCurrentData();
                    this._updateLimits();
                }
                this._showCurrentContentPanel();
            } finally {
                this.isLoading = false;
            }
        }
    }

    /**
     * @description Show the current panel (and hide the others)
     * @private
     */
    _showCurrentContentPanel() {
        const mainContentZone = this.template.querySelector('[data-key="orgcheck-content"]');    
        if (mainContentZone) {
            let panelFound = false;
            for (let i = 0; i < mainContentZone.children.length; i++) {
                const contentPanel = mainContentZone.children[i];
                const key = contentPanel.getAttribute('data-key');
                if (key === this.navigationMenuSelected) {
                    panelFound = true;
                    this.currentContentTitle = this._private_properties.appNavItemsByKey.get(this.navigationMenuSelected)?.title ?? '<unknown';
                    contentPanel.classList.remove('slds-hide');
                } else {
                    contentPanel.classList.add('slds-hide');
                }
            }
            if (panelFound === false) {
                console.warn(`Can't find the content panel with property "data-key" = '${this.navigationMenuSelected}'`);
            }
        } else {
            console.warn(`Can't find the component with property "data-key" = 'orgcheck-content'`);
        }
    }

    /**
     * @description Call a specific method of the API given a tab name
     * @param {boolean} [forceRefresh] - Do we force the refresh or not (false by default)
     * @private
     * @async
     */ 
    async _async_updateCurrentData(forceRefresh) {

        const appNavItem = this._private_properties.appNavItemsByKey.get(this.navigationMenuSelected); 
        if (appNavItem && this._private_properties.api) {

            // by default the refresh button is visible unless it is precised in the navigation definition that it should not be
            this.showRefreshButton = appNavItem.refreshButtonVisible !== false; 

            if (appNavItem.action) {
                this.tableData[appNavItem.data] = await appNavItem.action(this._private_properties.api);
            }

            if (appNavItem.recipe) {
                // --------------------------------------------------------------------------------
                // Potentially we need to refresh the data 
                // --------------------------------------------------------------------------------
                // if forceRefresh = true, we want to refresh the data from the API 
                if (forceRefresh === true) {
                    this._private_properties.api.cleanData(appNavItem.recipe, this.namespace, this.objectType, this.object);
                }
                
                // --------------------------------------------------------------------------------
                // Alias is useful to check if the data has potentially changed
                // Each data may have a dependency with global filters, so if one of the filter 
                // changed and the value has dependency with it, it's more likely that the data 
                // needs top be updated
                // --------------------------------------------------------------------------------
                // get the current alias depending on the dependency with global filter values
                let alias = this._private_properties.api.cachestampData(appNavItem.recipe, this.namespace, this.objectType, this.object);
                if (alias === '-') forceRefresh = true;

                if (forceRefresh === true || appNavItem.lastAlias !== alias) {
                    // update the last alias value with this alias
                    appNavItem.lastAlias = alias;
                    // shall we proceed getting the data for this item? It depends if there is a onlyIf condition or not, and if yes if it is validated or not
                    if (appNavItem.onlyIf ? appNavItem.onlyIf(this) === true : true) {
                        // If yes we prepare the data
                        const mixture = await this._private_properties.api.prepareData(appNavItem.recipe, this.namespace, this.objectType, this.object);
                        // serve the data
                        /** @type Table | SfdcObjectAsTable | Table[] */
                        const plate = await this._private_properties.api.serveData(appNavItem.recipe, mixture);
                        // and then export the data
                        /** @type ExportedTable | ExportedTable[] */
                        const doggyBag = await this._private_properties.api.exportData(appNavItem.recipe, plate);
                        // Save the mixture, the plate and doggybag
                        if (appNavItem.storeData === true) {
                            this.data[appNavItem.data] = mixture;
                        }
                        this.tableData[appNavItem.data] = plate;
                        this.exports[appNavItem.data] = doggyBag;
                    }                
                }
            }
        }
    }

    /**
     * @description Update the Daily API Request Limit information in the UI from the API
     * @private
     */ 
    _updateLimits() {
        const darli = this._private_properties.api?.dailyApiRequestLimitInformation;
        if (darli && darli.currentUsagePercentage) {
            this.orgLimit.hasInformation = true;
            this.orgLimit.theme = darli.isGreenZone === true ? 'slds-theme_success' : (darli.isYellowZone === true ? 'slds-theme_warning' : 'slds-theme_error');
            this.orgLimit.usage = `Daily API Request Limit: ${darli.currentUsagePercentage}%`;    
        } else {
            this.orgLimit.hasInformation = false;
        }
    }

    /**
     * @description Check if the terms are accepted and thus we can continue to use this org
     * @private
     * @async
     */ 
    async _async_checkTermsAcceptance() {
        try {
            console?.log('Calling checkUsageTerms from API...')
            if (await this._private_properties.api?.checkUsageTerms()) {
                console?.log('Got TRUE!')
                this.useOrgCheck.needConfirmation = false;
                this.useOrgCheck.accepted = true;
            } else {
                console?.log('Got FALSE!')
                this.useOrgCheck.needConfirmation = true;
                this.useOrgCheck.accepted = false;
            }
            console?.log('Calling wereUsageTermsAcceptedManually from API...')
            this.useOrgCheck.manuallyAccepted = this._private_properties.api?.wereUsageTermsAcceptedManually();
            console?.log('Done!')
        } catch (error) {
            console?.error('Error occurred while checking terms acceptance:', error);
        }
    }

    /**
     * @description Load basic information to use the app (including the filters)
     * @throws {Error} If the current user has not enough permissions to run the app (please display the error it has information about missing permissions)
     * @private
     * @async
     */ 
    async _async_loadBasicInformationIfAccepted() {
        // Check for acceptance
        console?.log('Checking if the terms are accepted...')
        await this._async_checkTermsAcceptance();
        if (this.useOrgCheck.accepted === true) {
            console?.log('The use of Org Check in this org was confirmed.');

            // Show the main panel to start using the app!
            console?.log('Show the main panel');
            const mainPanel = this.template.querySelector('[data-key="orgcheck-main"]');    
            if (mainPanel) {
                mainPanel.classList.remove('slds-hide');
            }
            
            // Check basic permission for the current user
            console?.log('Checking if current user has enough permission...')
            await this._private_properties.api?.checkCurrentUserPermissions(); // if no perm this throws an error

            // Information about the org
            console?.log('Information about the org...');
            const orgInfo = await this._private_properties.api?.getOrganizationInformation();
            this.orgInformation.id = orgInfo.id;
            this.orgInformation.name = orgInfo.name + ' (' + orgInfo.id + ')';
            this.orgInformation.type = orgInfo.type;
            this.orgInformation.theme = orgInfo.isProduction === true ? 'slds-theme_error' : (orgInfo.isSandbox === true ? 'slds-theme_warning' : 'slds-theme_success');
            
            // Data for the filters
            console?.log('Load filters...');
            await this._async_loadFilters();

            // We want to go to the HOME/WELCOME page
            await this._async_goToPage(this._private_properties.appNavigation.HOME.items.WELCOME.key);

        } else {
            console?.log('The use of Org Check in this org was not confirmed. The user has to accept them.');
        }
    }

    /**
     * @description Load the list of values for the filter
     * @param {boolean} [forceRefresh] - Do we force the refresh or not (false by default)
     * @private
     * @async
     */ 
    async _async_loadFilters(forceRefresh=false) {

        console?.log('Hide the filter panel...');
        this._private_properties.filters?.hide();

        if (forceRefresh === true) {
            console?.log('Clean data from cache (if any)...');
            this._private_properties.api?.clearObjects();
            this._private_properties.api?.clearPackages();
        }

        console?.log('Get packages, types and objects from the org...');
        const filtersData = await Promise.all([
            this._private_properties.api?.getPackages(),
            this._private_properties.api?.getObjectTypes(),
            this._private_properties.api?.getObjects(this.namespace, this.objectType)
        ])

        console?.log('Loading data in the drop boxes...');
        this._private_properties.filters?.updatePackageOptions(filtersData[0]);
        this._private_properties.filters?.updateSObjectTypeOptions(filtersData[1]);
        this._private_properties.filters?.updateSObjectApiNameOptions(filtersData[2]);
        this.isObjectSpecified = false;

        console?.log('Showing the filter panel...');
        this._private_properties.filters?.show();

        console?.log('Update the daily API limit informations...');
        this._updateLimits();
    }

    /**
     * @description Show the error in a modal (that can be closed)
     * @param {string} methodName - The name of the method where we had the error
     * @param {Error} error - The error to show in the error modal
     * @private
     */ 
    _showError(methodName, error) {
        const chain = [];
        for (let e = error; e !== undefined; e = e.cause) {
            chain.push(e);
        }
        const htmlContent = `
            👉 Please review our <a href="http://sfdc.co/OrgCheck-FAQ" target="_blank" rel="external noopener 
                noreferrer">Org Check FAQ</a> and try to resolve this issue in your Org based on our 
                community's feedback. <br />
            <br />
            👉 If the FAQ is not helping, consider creating an issue on <a href="http://sfdc.co/OrgCheck-Backlog" 
                target="_blank" rel="external noopener noreferrer">Org Check Issues tracker</a> along with 
                the context and the following information. <br />
            <br />
            <ul>
                <li>Organization Id: <b>${this.orgInformation.id}</b></li>
                <li>Method: <b>${methodName}</b></li>
                <li>
                    List of errors
                    <ol>
                        <li>${chain.map((error) => `<b>${error.message}</b> <pre style="margin-top: 3px; background-color: #240808; color: #e9baba; font-size: xx-small;">${JSON.stringify(error)}</pre>`).join("</li>\n<li>")}</li>
                    </ol>
                </li>
            </ul>`;
        this._private_properties.modal?.open(`An error occurred while processing ${methodName}...`, htmlContent);
        console.error(methodName, error);
    }

    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // User Experience Handlers
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description Event called when the user search something in the navigation menu on the left. We filter the 
     *              menu with the search term entered.
     * @param {Event | any} event - The event information
     */
    handleNavigationMenuSearch(event) {
        try {
            const searchTerm = event?.target?.value?.toLowerCase() || '';
            if (searchTerm) {
                this.navigationMenuItems = this._private_properties.initialNavigationMenuItems.map((section) => {
                    const itemsMatching = section?.items?.filter((item) => item?.label?.toLowerCase().includes(searchTerm)) ?? []
                    const isItemsMatching = itemsMatching.length > 0;
                    const isItemMatching = section?.label?.toLowerCase().includes(searchTerm);
                    return {
                        label: section.label,
                        name: section.name,
                        expanded: isItemsMatching || isItemMatching,
                        items: isItemMatching ? section.items : (isItemsMatching ? itemsMatching : [] )
                    }
                }).filter((section) => section?.items?.length > 0);
            } else {
                this.navigationMenuItems = this._private_properties.initialNavigationMenuItems;
            }
        } catch (error) {
            this._showError('handleNavigationMenuSearch', error);
        }
    }

    /**
     * @description Event called when the user select an item in the navigation menu on the left. We just log it for now 
     *              but we could do some specific action depending on the item selected in the future.
     * @param {Event | any} event - The event information
     */
    async handleNavigationMenuSelect(event) {
        try {
            const item = event?.detail?.name;
            if (item?.length === 2) {
                // When item length is 2, it means that it's a sub-item (and not a section)
                // In this case, we just open the corresponding page
                await this._async_goToPage(item);
            } else if (item?.length === 1) {
                // When item length is 1, it means that it's a section (and not a sub-item)
                // Toggle the expanded state of the clicked section
                const indexSection = this.navigationMenuItems.findIndex((section) => section.name === item);
                if (indexSection !== -1) {
                    const itemSection = this._private_properties.tree.items[indexSection];
                    if (itemSection) {
                        itemSection.expanded = !itemSection.expanded;
                    }
                }
            }
        } catch (error) {
            this._showError('handleNavigationMenuSelect', error);
        }
    }

    /**
     * @description New filters were applied (or reset) in the global filters, therefore the current screen needs to be updated
     * @public
     * @async
     */
    async handleFiltersValidated() {
        try {
            this.isObjectSpecified = this._private_properties.filters?.isSelectedSObjectApiNameAny === false;
            await this._async_updateCurrentData();
        } catch (error) {
            this._showError('handleFiltersValidated', error);
        }
    }

    /**
     * @description The "refresh" button in the global filters was pushed, therefore the filters needs to be reloaded
     * @public
     * @async
     */
    async handleFiltersRefreshed() {
        try {
            await this._async_loadFilters(true);
        } catch (error) {
            this._showError('handleFiltersRefreshed', error);
        }
    }

    /**
     * @description When the org is a production, we show a message. This event is when the user accept the terms by click on "yes" button
     * @public
     * @async
     */
    async handleClickUsageAcceptance() {
        try {
            this._private_properties.api?.acceptUsageTermsManually();
            await this._async_loadBasicInformationIfAccepted();
        } catch(error) {
            this._showError('handleClickUsageAcceptance', error);
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
            this._private_properties.api?.clearCache(); // may throw an error
            // and reload
            window.location.reload();
        } catch (error) {
            this._showError('handleRemoveAllCache', error);
        }
    }

    /**
     * @description Method called when you want to remove the current cache
     * @public
     * @async
     */
    async handleRefreshCurrentData() {
        try {
            await this._async_updateCurrentData(true);
        } catch (error) {
            this._showError('handleRefreshCurrentData', error);
        }
    }

    /**
     * @description Method called when the user ask to log a specific cache item in the console
     * @param {Event | any} event - The event information
     * @public
     */ 
    handleLogCacheItem(event) {
        try {
            // Get attribute data-item-name
            const itemName = event?.target?.getAttribute('data-item-name');
            // Get the data from cache
            const cacheData = this._private_properties.api?.getCacheItem(itemName);
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
                htmlContent += `<b>Type:</b> br /><br /><b>Size:</b> ${cacheData.length}<br /><br /><b>Content:</b><ul[]`;
                cacheData.forEach((value, index) => {
                    htmlContent += `<li><b>INDEX:</b> ${index}, <b>VALUE:</b> ${JSON.stringify(value)}</li>`;
                });
                htmlContent += '</ul>';
            } else {
                htmlContent += `<b>Type:</b> ${typeof cacheData}<br /><br /><b>Content:</b><br />`;
                htmlContent += JSON.stringify(cacheData);
            }
            // show the modal
            this._private_properties.modal?.open(`Dump of the browser cache for item: ${itemName}`, htmlContent);
        } catch (error) {
            this._showError('handleLogCacheItem', error);
        }
    }

    /**
     * @description Event called when the user clicks on the "View Score" button on a data table
     * @param {Event | any} event - The event information
     * @public
     */ 
    handleViewScore(event) {
        try {
            // The event should contain a detail property
            const detail = event?.detail;
            if (detail) {
                // prepare the modal content
                let htmlContent = `The component <code><b>${detail.whatName}</b></code> (<code>${detail.whatId}</code>) has a `+
                                    `score of <b><code>${detail.score}</code></b> because of the following reasons:<br /><ul>`;
                detail.reasonIds?.forEach((/** @type {number} */ id) => {
                    const reason = getRuleById(id);
                    if (reason) {
                        htmlContent += `<li><b>${reason.description}</b>: <i>${reason.errorMessage}</i></li>`;
                    }
                });
                htmlContent += '</ul>';
                // show the modal
                this._private_properties.modal?.open(`Understand the Score of "${detail.whatName}" (${detail.whatId})`, htmlContent);
            }
        } catch (error) {
            this._showError('handleViewScore', error);
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
            this._private_properties.spinner?.open();
            this._private_properties.spinner?.sectionLog(LOG_SECTION, 'Launching...');
            try {
                const asyncApexJobId = await this._private_properties.api?.runAllTestsAsync();
                this._private_properties.spinner?.sectionEnded(LOG_SECTION, 'Done!');
                this._private_properties.spinner?.close(0);

                let htmlContent = 'We asked Salesforce to run all the test classes in your org.<br /><br />';
                htmlContent += 'For more information about the success of these tests, you can:<br /><ul>';
                htmlContent += '<li>Go <a href="/lightning/setup/ApexTestQueue/home" target="_blank" rel="external noopener noreferrer">here</a> to see the results of these tests.</li>';
                htmlContent += `<li>Check with Tooling API the status of the following record: /tooling/sobjects/AsyncApexJob/${asyncApexJobId}</li><ul>`;
                this._private_properties.modal?.open('Asynchronous Run All Test Asked', htmlContent);

            } catch (error) {
                this._private_properties.spinner?.sectionFailed(LOG_SECTION, error);
            }
        } catch (error) {
            this._showError('handleClickRunAllTests', error);
        }
    }

    /**
     * @description Event called when the user clicks on the "Recompile" button
     * @async
     * @public
     */ 
    async handleClickRecompile() {
        try {
            this._private_properties.spinner?.open();
            const LOG_SECTION = 'RECOMPILE'
            /** @type {Map<string, string>} */;
            const apexClassNamesById = new Map();
            this._private_properties.spinner?.sectionLog(LOG_SECTION, 'Processing...');
            this.data?.apexuncompiled?.slice(0, 25).forEach(c => {
                const classId = c.id.substring(0, 15);
                const className = c.name;
                this._private_properties.spinner?.sectionLog(`${LOG_SECTION}-${classId}`, `Asking to recompile class: ${className}`);
                apexClassNamesById.set(classId, className);
            });
            /** @type {Map<string, {isSuccess: boolean, reasons?: string>}[]} */
            const responses = await this._private_properties.api?.compileClasses(Array.from(apexClassNamesById.keys()));
            this._private_properties.spinner?.sectionLog(LOG_SECTION, 'We got the response from the server...');
            let noError = true;
            responses.forEach((result, id) => {
                const name = apexClassNamesById.get(id.substring(0, 15));
                if (result.isSuccess === true) {
                    this._private_properties.spinner?.sectionEnded(`${LOG_SECTION}-${id}`, `Recompilation requested for class: ${name} (${id})`);
                } else {
                    this._private_properties.spinner?.sectionFailed(`${LOG_SECTION}-${id}`, `Errors for class ${name} (${id}): ${result.reasons.join(', ')}`);
                    noError = false;
                }
            });
            if (noError === true) {
                this._private_properties.spinner?.sectionEnded(LOG_SECTION, 'Done!');
                this._private_properties.modal?.open('Recompilation Requested Successfully',
                    'Please hit the Refresh button (in Org Check) to get the latest data '+
                    'from your Org.  By the way, in the future, if you need to '+
                    'recompile ALL the classes, go to "Setup > Custom '+
                    'Code > Apex Classes" and click on the link "Compile all classes".'
                );
            } else {
                this._private_properties.spinner?.sectionFailed(LOG_SECTION, 'Done but with errors');
            }
        } catch (error) {
            this._showError('handleClickRecompile', error);
        }
    }

    /**
     * @description Method called when the user click on one of the cards in the global view
     * @param {Event | any} event - The event information
     * @public
     */ 
    async handleOpenPage(event) {
        try {
            // Get attribute data-key-page
            const keyPage = event?.target?.getAttribute('data-key-page');
            // And open the page
            await this._async_goToPage(keyPage);
        } catch (error) {
            this._showError('handleOpenPage', error);
        }
    }

    /**
     * @description Method in case we want to explicitely see the showError message dialog box
     * @param {Event | any} event - The event information
     * @public
     */ 
    handleTestThrowException(event) {
        try {
            // Get attribute data-type-error-chain
            const errorChainString = event?.target?.getAttribute('data-type-error-chain');
            // Loop over the chain
            let lastError = undefined;
            errorChainString.split(',').reverse().forEach((m) => {
                const error = new TypeError(m, lastError ? { cause: lastError } : {});
                switch (m) {
                    case 'RecipeManagerError': error.recipe = 'BliBlaBloo'; error.message = 'This is a test'; break;
                    case 'DatasetManagerError': error.dataset = 'bim-boo'; error.message = 'This is a test'; break;
                    case 'SalesforceError': error.code = 'OBLADI-OBLADA'; error.contextInformation = { fruit: 'banana', car: 'ferarri' }; break;
                }
                lastError = error;
            });
            // Throw the error
            throw lastError;
        } catch (error) {
            this._showError('handleTestThrowException', error);
        }
    }

    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Decoration for Role Hierarchy graphic view
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /** 
     * @description Legend for the role hierarchy graphic view
     * @type {{color: string, name: string}[]}
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
        this._private_properties.modal?.open(`Details for role ${data.record.name}`, htmlContent);
    }
}

const __orgcheck__Get = () => {
    return (typeof window !== 'undefined' ? window?.orgcheck : globalThis?.orgcheck ?? null)
}

const getRuleById = (id) => {
    const method = __orgcheck__Get()?.Rules?.get;
    if (method) return method(id);
    return undefined;
}


const ANY = '*';
const EMPTY = '';
