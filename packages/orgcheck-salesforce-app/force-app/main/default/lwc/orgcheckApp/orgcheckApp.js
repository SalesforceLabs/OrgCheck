import { LightningElement, api, track } from 'lwc';
import OrgCheckStaticResource from '@salesforce/resourceUrl/OrgCheck_SR';
import { loadScript } from 'lightning/platformResourceLoader';

export default class OrgcheckApp extends LightningElement {

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
     *              tables and components of the UI.
     * @type {Object<string, any>}
     */
    @track data = { };

    /**
     * @description Table definitions received from the Org Check API
     * @type {Object<string, any>}
     */
    @track tableDefinitions = { };

    /**
     * @description list of items stored in org check cache
     * @type {Array<DataCacheItemIntf>}
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
     * @description Is something is loading?
     * @type {boolean}
     * @public
     */
    isLoading = false

    /**
     * @description List of items for the navigation menu on the left of the app, built from the APPLICATION_NAVIGATION constant
     * @type {Array<{ label: string, name: string, expanded: boolean, items: Array<{ label: string, name: string, metatext: string }> }>}
     * @public
     */
    navigationMenuItems = INITIAL_NAVIGATION_ITEMS;

    /**
     * @description Internal properties without LWC reactivity
     * @property {string} currentMenuItem - The currently selected menu item
     * @property {OrgCheckAPI} api - The Org Check API instance
     * @property {boolean} hasInitialized - This flag prevents double initialization of the API + UI flow
     * @property {boolean} childrenReady - This flag checks that the children components are ready
     * @property {any} spinner - Spinner component
     * @property {any} modal - Modal component
     * @property {any} filters - Global filter component
     */
    _private_properties = {
        currentMenuItem: '',
        api: undefined,
        hasInitialized: false,
        childrenReady: false,
        spinner: undefined,
        modal: undefined,
        filters: undefined
    };

    /**
     * @description After the component is fully load let's init some elements and the api
     * @public
     */
    renderedCallback() { 
        // Wire child refs if not wired 
        if (!this._private_properties.spinner) this._private_properties.spinner = this.template.querySelector('c-orgcheck-spinner'); 
        if (!this._private_properties.modal) this._private_properties.modal = this.template.querySelector('c-orgcheck-modal'); 
        if (!this._private_properties.filters) this._private_properties.filters = this.template.querySelector('c-orgcheck-global-filters');
        // Set children ready flag
        if (this._private_properties.spinner && this._private_properties.modal && this._private_properties.filters && !this._private_properties.childrenReady) this._private_properties.childrenReady = true;
        // Kick off initial flow once when both accessToken & localStorage is present and children are ready. 
        if (!this._private_properties.hasInitialized && this._private_properties.childrenReady && this.accessToken && this.localStorage) {
            this._private_properties.hasInitialized = true; 
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
                this._private_properties.api = instantiateOrgCheckAPI({
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
                        isConsoleFallback: () => { return true; }, // log in console please!
                        log: (section, message) => { this._private_properties.spinner?.sectionLog(section, message); },
                        ended: (section, message) => { this._private_properties.spinner?.sectionEnded(section, message); },
                        failed: (section, error) => { this._private_properties.spinner?.sectionFailed(section, error); }
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
                // Update the cache information when we are finish loading everything
                this._private_properties.spinner?.sectionLog(SECTION_04, `Update the cache information when we are finish loading everything...`);
                this._updateCacheInformation();
                // Load basic information if the user has already accepted the terms
                this._spinner?.sectionLog(SECTION_04, `Load basic information if the user has already accepted the terms...`);
                await this._loadBasicInformationIfAccepted();
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
        return this.tabs.selectedSubTab === APPLICATION_NAVIGATION.CODE.items.UNCOMPILEDS.key && this.apexUncompiledTableData?.length > 0 || false;
    }







    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Wrapper part between the Org Check API and the UI
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    _showCurrentContentPanel() {
        const mainContentZone = this.template.querySelector('[data-key="orgcheck-content"]');       
        for (let i = 0; i < mainContentZone.children.length; i++) {
            const contentPanel = mainContentZone.children[i];
            if (contentPanel.getAttribute('data-key') === this._private_properties.currentMenuItem) {
                contentPanel.classList.remove('slds-hide');
            } else {
                contentPanel.classList.add('slds-hide');
            }
        }
    }

    /**
     * @description Call a specific method of the API given a tab name
     * @param {string} key - The name of the panel to update
     * @param {boolean} [forceRefresh] - Do we force the refresh or not (false by default)
     * @private
     * @async
     */ 
    async _updateCurrentData(forceRefresh) {
        const subItem = ALL_NAVIGATION_SUBITEMS_BY_KEY[this._private_properties.currentMenuItem]; 
        if (subItem && this._private_properties.api) {
            // --------------------------------------------------------------------------------
            // Potentially we need to refresh the data 
            // --------------------------------------------------------------------------------
            // if forceRefresh = true and the subItem has a 'clear' property, we want to refresh the data from the API 
            if (forceRefresh === true && subItem.clear) {
                // get the reference of the corresponding 'clear' method in the API
                const clearMethod = this._private_properties.api[subItem.clear];
                // check if the method exists in the API
                if (clearMethod) {
                    // call the method from the API that will clear the cache for this data
                    this._private_properties.api[subItem.clear]();
                } else {
                    // Just in case...
                    console.warn(`Trying to clear cache for key ${key} but method ${subItem.clear} does not exist in the API`);
                }
            }
            // --------------------------------------------------------------------------------
            // Alias is useful to check if the data has potentially changed
            // Each data may have a dependency with global filters, so if one of the filter 
            // changed and the value has dependecy with it, ot's more likely that the data 
            // needs top be updated
            // --------------------------------------------------------------------------------
            // get the current alias depending on the dependency with global filter values
            let alias;
            switch (subItem.alias) {
                case ALIASES.PACKAGE:       alias = `${this.namespace}`; break;
                case ALIASES.ALL:             alias = `${this.namespace}-${this.objectType}-${this.object}`; break;
                case ALIASES.OBJECTNAMESPACE: alias = `${this.object}-${this.namespace}`; break;
                case ALIASES.OBJECT:          alias = `${this.object}`; break;
                case ALIASES.NONE: default:   alias = '-'; break; // don't put empty string -- it's confusing
            }
            if (subItem.get && (forceRefresh === true || subItem.lastAlias !== alias)) {
                // update the last alias value with this alias
                subItem.lastAlias = alias;
                // shall we proceed getting the data for this item? It depends if there is a getOnlyIf condition or not, and if yes if it is validated or not
                if (subItem.getOnlyIf ? subItem.getOnlyIf(this) === true : true) {
                    // get the reference of the corresponding 'get' method in the API
                    const getMethod = this._private_properties.api[subItem.get];
                    // check if the method exists in the API
                    if (getMethod) {
                        // Wee need potentially to pass some parameters to the get method, depending on the definition of the item
                        // Important: keep the order of the parameters as defined
                        const parameters = subItem.getParameters ? subItem.getParameters.map((p) => {
                            switch (p) {
                                case PARAMETERS.NAMESPACE: return this.namespace;
                                case PARAMETERS.OBJECT: return this.object;
                                case PARAMETERS.TYPE: return this.objectType;
                            }
                        }) : [];
                        // call the method from the API that will get the data
                        let data = await this._private_properties.api[subItem.get](...parameters);
                        // If the data is a DataMatrix, the data needs to be extract in a special property
                        // Else just a data then save it
                        this.data[lowercaseFirstLetter(subItem.data)] = subItem.isDataMatrix ? (data?.rows ?? []) : data;
                        // Optional parameters for the tableDefinition(s) (if any)
                        if (subItem.tableDefinitions || subItem.tableDefinition) {
                            // if dataMatrix we pass the entire data
                            // if object we pass false because we don't want to have object-related columns
                            // else we pass undefined because there is no specific parameter to pass
                            const param = subItem.isDataMatrix ? data : undefined;
                            (subItem.tableDefinitions ?? [ subItem.tableDefinition ]).forEach((tableDef) => {
                                this.tableDefinitions[lowercaseFirstLetter(tableDef)] = instantiateOrgCheckTableDefinition(tableDef, param);
                            });
                        }
                    } else {
                        // Just in case...
                        console.warn(`Trying to get data for key ${key} but method ${subItem.get} does not exist in the API`);
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
     * @description Update the api cache information in the UI from the API
     * @private
     */ 
    _updateCacheInformation() {
        this.cacheManagerData = this._private_properties.api?.getCacheInformation();
    }

    /**
     * @description Check if the terms are accepted and thus we can continue to use this org
     * @private
     * @async
     */ 
    async _checkTermsAcceptance() {
        if (await this._private_properties.api?.checkUsageTerms()) {
            this.useOrgCheck.needConfirmation = false;
            this.useOrgCheck.accepted = true;
        } else {
            this.useOrgCheck.needConfirmation = true;
            this.useOrgCheck.accepted = false;
        }
        this.useOrgCheck.manuallyAccepted = this._private_properties.api?.wereUsageTermsAcceptedManually();
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
        if (this.useOrgCheck.accepted === false) {
            console?.log('The use of Org Check in this org was not confirmed. Stopping...');
            return;
        }
        console?.log('The use of Org Check in this org was confirmed. Continuing...');

        // Check basic permission for the current user
        console?.log('Checking if current user has enough permission...')
        await this._private_properties.api?.checkCurrentUserPermissions(); // if no perm this throws an error

        // Information about the org
        console?.log('Information about the org...');
        const orgInfo = await this._private_properties.api?.getOrganizationInformation();
        this.orgInformation.name = orgInfo.name + ' (' + orgInfo.id + ')';
        this.orgInformation.type = orgInfo.type;
        this.orgInformation.theme = orgInfo.isProduction === true ? 'slds-theme_error' : (orgInfo.isSandbox === true ? 'slds-theme_warning' : 'slds-theme_success');
        
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
        this._private_properties.filters?.hide();

        if (forceRefresh === true) {
            console?.log('Clean data from cache (if any)...');
            this._private_properties.api?.removeAllObjectsFromCache();
            this._private_properties.api?.removeAllPackagesFromCache();
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
        const searchTerm = event?.target?.value?.toLowerCase() || '';
        if (searchTerm) {
            this.navigationMenuItems = INITIAL_NAVIGATION_ITEMS.map((mainItem) => {
                const itemsMatching = mainItem.items.filter((subItem) => subItem.label.toLowerCase().includes(searchTerm));
                const isItemsMatching = itemsMatching.length > 0;
                const isItemMatching = mainItem.label.toLowerCase().includes(searchTerm);
                return {
                    label: mainItem.label,
                    name: mainItem.name,
                    expanded: isItemsMatching || isItemMatching,
                    items: isItemMatching ? mainItem.items : (isItemsMatching ? itemsMatching : [] )
                }
            }).filter((mainItem) => mainItem.items.length > 0);
        } else {
            this.navigationMenuItems = INITIAL_NAVIGATION_ITEMS;
        }
    }

    /**
     * @description Event called when the user select an item in the navigation menu on the left. We just log it for now 
     *              but we could do some specific action depending on the item selected in the future.
     * @param {Event | any} event - The event information
     */
    async handleNavigationMenuSelect(event) {
        const item = event?.detail?.name;
        if (item && item.length === 2) {
            this._private_properties.currentMenuItem = item;
            await this._updateCurrentData();
            this._showCurrentContentPanel();
        }
    }

    /**
     * @description New filters were applied (or reset) in the global filters, therefore the current screen needs to be updated
     * @public
     * @async
     */
    async handleFiltersValidated() {
        this.isObjectSpecified = this._private_properties.filters?.isSelectedSObjectApiNameAny === false;
        await this._updateCurrentData();
    }

    /**
     * @description The "refresh" button in the global filters was pushed, therefore the filters needs to be reloaded
     * @public
     * @async
     */
    async handleFiltersRefreshed() {
        await this._loadFilters(true);
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
                this._private_properties.api?.acceptUsageTermsManually();
                await this._loadBasicInformationIfAccepted();
            }
            // do nothing if it is not checked.
        } catch(e) {
            this._showError('Error while handleClickUsageAcceptance', e);
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
            this._private_properties.api?.removeAllFromCache(); // may throw an error
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
        const cacheData = this._private_properties.api?.getCacheData(itemName);
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
                this._openModal('Asynchronous Run All Test Asked', htmlContent);

            } catch (error) {
                this._private_properties.spinner?.sectionFailed(LOG_SECTION, error);
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
            await Promise.all(recipes?.map(async (/** @type {string} */ recipe) => { await this._updateCurrentData(recipe, true); } ));
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
            this._private_properties.spinner?.open();
            const LOG_SECTION = 'RECOMPILE'
            /** @type {Map<string, string>} */;
            const apexClassNamesById = new Map();
            this._private_properties.spinner?.sectionLog(LOG_SECTION, 'Processing...');
            this.apexUncompiledTableData.slice(0, 25).forEach(c => {
                const classId = c.id.substring(0, 15);
                const className = c.name;
                this._private_properties.spinner?.sectionLog(`${LOG_SECTION}-${classId}`, `Asking to recompile class: ${className}`);
                apexClassNamesById.set(classId, className);
            });
            /** @type {Map<string, {isSuccess: boolean, reasons?: Array<string>}>} */
            const responses = await this._private_properties.api?.compileClasses(Array.from(apexClassNamesById.keys()), );
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
                this._openModal('Recompilation Requested Successfully',
                    'Please hit the Refresh button (in Org Check) to get the latest data '+
                    'from your Org.  By the way, in the future, if you need to '+
                    'recompile ALL the classes, go to "Setup > Custom '+
                    'Code > Apex Classes" and click on the link "Compile all classes".'
                );
            } else {
                this._private_properties.spinner?.sectionFailed(LOG_SECTION, 'Done but with errors');
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
        this.tabs.selectedMainTab = mainTab;
        this.tabs.selectedSubTab = subTab;
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




    /**
     * @description Table definition for object permissions
     */
    //get objectPermissionsTableDefinition() { return getTableDefinitions()?.ObjectPermissions(this._internalObjectPermissionsDataMatrix); }
 
    /**
     * @description Table definition for application permissions
     */
    //get appPermissionsTableDefinition() { return getTableDefinitions()?.AppPermissions(this._internalAppPermissionsDataMatrix); }
    
    /**
     * @description Table definition for field permissions
     */
    //get fieldPermissionsTableDefinition() { return getTableDefinitions()?.FieldPermissions(this._internalFieldPermissionsDataMatrix); }

    /**
     * @description Table definition for score rules
     */
    //get scoreRulesTableDefinition() { return getTableDefinitions()?.ScoreRules(this.data._internalAllScoreRulesDataMatrix); }
    
    /**
     * @description Table definition for hard coded urls view
     */
    //get hardCodedURLsViewTableDefinition() { return getTableDefinitions()?.HardCodedURLsView(MAX_ITEMS_IN_HARDCODED_URLS_LIST); }


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
     */
    get objectInformationExportSource() { 
        const sheets = [];
        sheets.push({ 
            header: 'General information',
            columns: [ 'Label', 'Value' ],
            rows: [
                [ 'API Name', `${this.objectData.apinam ?? ''}` ],
                [ 'Package', `${this.objectData.package ?? ''}` ],
                [ 'Singular Label', `${this.objectData.label ?? ''}` ],
                [ 'Plural Label', `${this.objectData.labelPlural ?? ''}` ],
                [ 'Description', `${this.objectData.description ?? ''}` ],
                [ 'Key Prefix', `${this.objectData.keyPrefix ?? ''}` ],
                [ 'Record Count (including deleted ones)', `${this.objectData.recordCount}` ],
                [ 'Is Custom?', `${this.objectData.isCustom?'true':'false'}` ],
                [ 'Feed Enable?', `${this.objectData.isFeedEnabled?'true':'false'}` ],
                [ 'Most Recent Enabled?', `${this.objectData.isMostRecentEnabled?'true':'false'}` ],
                [ 'Global Search Enabled?', `${this.objectData.isSearchable?'true':'false'}` ],
                [ 'Internal Sharing', `${this.objectData.internalSharingModel ?? ''}` ],
                [ 'External Sharing', `${this.objectData.externalSharingModel ?? ''}` ]
            ]
        });
        sheets.push(ocui.RowsFactory.createAndExport(this.standardFieldsInObjectTableDefinition, this.objectData.standardFields, 'Standard Fields', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.customFieldsInObjectTableDefinition, this.objectData.customFieldRefs, 'Custom Fields', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.apexTriggersInObjectTableDefinition, this.objectData.apexTriggerRefs, 'Apex Triggers', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.fieldSetsTableDefinition, this.objectData.fieldSets, 'Field Sets', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.layoutsTableDefinition, this.objectData.layouts, 'Page Layouts', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.flexiPagesInObjectTableDefinition, this.objectData.flexiPages, 'Lightning Pages', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.limitsTableDefinition, this.objectData.limits, 'Limits', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.validationRulesInObjectTableDefinition, this.objectData.validationRules, 'Validation Rules', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.webLinksInObjectTableDefinition, this.objectData.webLinks, 'Web Links', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.recordTypesInObjectTableDefinition, this.objectData.recordTypes, 'Record Types', ocapi.SecretSauce.GetScoreRuleDescription));
        sheets.push(ocui.RowsFactory.createAndExport(this.relationshipsTableDefinition, this.objectData.relationships, 'Relationships', ocapi.SecretSauce.GetScoreRuleDescription));
        return sheets;
    }

    /**
     * @description Representation of an export for the global view data
     */
    globalViewItemsExport;

    /**
     * @description Representation of an export for hardcoded URLs view data
     */ 
    hardCodedURLsViewItemsExport;

    /**
     * @description Global View data from API
     * @param {Map} data - The data from the API
     */ 
    set _internalGlobalViewDataFromAPI(data) {
        if (data) {
            const globalViewData = [];
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
            const detailsSheets = [];
            data?.forEach((item, recipe) => {
                const tabValue = RECIPEALIAS_TO_SUB_TAB.get(recipe);
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
                detailsSheets.push({
                    countBad: item?.countBad,
                    exportedTable: ocui.RowsFactory.createAndExport(definitionTable, item?.data, itemName, ocapi.SecretSauce.GetScoreRuleDescription)
                });
            });
            const sheets = [];
            sheets.push({ 
                header: 'Statistics (Good and Bad)', 
                columns: [ 'Type of items', 'Count of good items', 'Count of bad items' ], 
                rows: goodAndBadRows.sort((a, b) => (a[2] < b[2] ? 1 : -1)) // Index=2 sorted by Bad count
                                    .map(r => ([r[0], `${r[1]}`, `${r[2]}`]) ) // converting numbers to strings
            });
            sheets.push({ 
                header: 'Statistics (Reasons)', 
                columns: [ 'Type of items', 'Why are they considered bad?', 'Count of bad items' ], 
                rows: rulesRows.sort((a, b) => (a[2] < b[2] ? 1 : -1)) // Index=2 sorted by Bad count
                               .map(r => ([r[0], `${r[1]}`, `${r[2]}`]) ) // converting numbers to strings
            });
            // Sorting the details sheets by count of bad items descending (bad items on top)
            detailsSheets.sort((a, b) => (a.countBad < b.countBad ? 1 : -1)).forEach(s => sheets.push(s.exportedTable));
            // Sorting the global view data by count of bad items descending (bad items on top)
            this.globalViewData = globalViewData.sort((a, b) => (a.countBad < b.countBad ? 1 : -1));
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
                /** @type {ocui.TableColumn} */
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
     * @description Data table for object permissions
     * @type {Array}
     */ 
    get objectPermissionsTableData() {
        return this._internalObjectPermissionsDataMatrix?.rows || [];
    }

    /**
     * @description Data table for application permissions
     * @type {Array}
     */ 
    get appPermissionsTableData() {
        return this._internalAppPermissionsDataMatrix?.rows || [];
    }

    /**
     * @description Data table for field permissions
     * @type {Array}
     */ 
    get fieldPermissionsTableData() {
        return this._internalFieldPermissionsDataMatrix?.rows || [];
    }

    /** 
     * @description Data table for all score rules
     * @type {Array}
     */
    get allScoreRulesTableData() {
        return this.data.allScoreRulesDataMatrix?.rows || [];
    }
}



const MAX_ITEMS_IN_HARDCODED_URLS_LIST = 15;

const getOrgCheck = () => {
    return (typeof window !== 'undefined' ? window?.orgcheck : globalThis?.orgcheck ?? null)
}

const instantiateOrgCheckAPI = (setup) => {
    const apiConstructor = getOrgCheck()?.API;
    if (apiConstructor) return new apiConstructor(setup);
    return undefined;
}

const instantiateOrgCheckTableDefinition = (name, data) => {
    const tableDefConstructor = getOrgCheck()?.ui.table.definitions[name];
    if (tableDefConstructor) return new tableDefConstructor(data);
    return undefined;
}

const ALIASES = {
    NONE: 'none',
    ALL: 'all',
    PACKAGE: 'namespace',
    OBJECT: 'object',
    OBJ_PCK: 'object-namespace',
    PCK_TYP: 'namespace-type'
}

const PARAMETERS = {
    OBJECT: 'object',
    NAMESPACE: 'namespace',
    TYPE: 'objectType'
}

const ANY = '*';
const EMPTY = '';

const lowercaseFirstLetter = (string) => {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

/**
 * @description Application navigation in two levels
 * @constant
 */
const APPLICATION_NAVIGATION = {
    HOME: { 
        key:   'A', 
        title: 'Home',
        items: { 
            WELCOME:       { key: '01', title: '👋 Welcome!' },
            CACHE:         { key: '02', title: '🛠️ Metadata Cache' },
            HELP:          { key: '03', title: '⁉️ Score explanation', data: 'scoreRules', alias: ALIASES.NONE, get: 'getAllScoreRulesAsDataMatrix', tableDefinition: 'ScoreRules', isDataMatrix: true }
        }
    },
    ORG: { 
        key:   'B', 
        title: '🗺️ Salesforce Organization',
        items: { 
            GLOBAL_VIEW:   { key: '04', title: '🏞️ Overview',        recipe: 'global-view',    data: '_internalGlobalViewDataFromAPI',        clear: 'removeGlobalViewFromCache',    alias: ALIASES.NONE, get: 'getGlobalView',        tableDefinition: 'GlobalViewItems' },
            URL_VIEW:      { key: '05', title: '🏖️ Hard-coded URLs', recipe: 'hardcoded-urls', data: '_internalHardCodedURLsViewDataFromAPI', clear: 'removeHardcodedURLsFromCache', alias: ALIASES.NONE, get: 'getHardcodedURLsView', tableDefinition: 'HardCodedURLs' },
        }
    },
    DATAMODEL: { 
        key:   'C', 
        title: '⚽ Data model',
        items: { 
            SOBJ_DESC:     { key: '06', title: '🎳 Object Documentation', recipe: 'object',           data: 'objectData',      clear: 'removeObjectFromCache',             alias: ALIASES.OBJECT,    get: 'getObject',          getOnlyIf: (that) => (that.isObjectSpecified), tableDefinitions: [ 'ApexTriggersInObject', 'CustomFieldsInObject', 'FieldSets', 'FlexiPagesInObject', 
                                                                                                                                                                                                                                                                                     'PageLayouts', 'Limits', 'RecordTypesInObject', 'Relationships', 'StandardFields', 
                                                                                                                                                                                                                                                                                     'ValidationRulesInObject', 'WebLinksInObject', 'Workflows' ], getParameters: [ PARAMETERS.OBJECT ] },
            SOBJECTS:      { key: '07', title: '🏉 Objects',              recipe: 'objects',          data: 'objects',         clear: 'removeAllObjectsFromCache',         alias: ALIASES.PCK_TYP,   get: 'getObjects',         tableDefinition: 'Objects',                    getParameters: [ PARAMETERS.NAMESPACE, PARAMETERS.TYPE ] },
            CUSTOM_FIELDS: { key: '08', title: '🏈 Custom Fields',        recipe: 'custom-fields',    data: 'customFields',    clear: 'removeAllCustomFieldsFromCache',    alias: ALIASES.ALL,       get: 'getCustomFields',    tableDefinition: 'CustomFields',               getParameters: [ PARAMETERS.NAMESPACE, PARAMETERS.TYPE, PARAMETERS.OBJECT ] },
            LAYOUTS:       { key: '09', title: '🏓 Page Layouts',         recipe: 'page-layouts',     data: 'pageLayouts',     clear: 'removeAllPageLayoutsFromCache',     alias: ALIASES.ALL,       get: 'getPageLayouts',     tableDefinition: 'PageLayouts',                getParameters: [ PARAMETERS.NAMESPACE, PARAMETERS.TYPE, PARAMETERS.OBJECT ] },
            VRS:           { key: '0A', title: '🎾 Validation Rules',     recipe: 'validation-rules', data: 'validationRules', clear: 'removeAllValidationRulesFromCache', alias: ALIASES.ALL,       get: 'getValidationRules', tableDefinition: 'ValidationRules',            getParameters: [ PARAMETERS.NAMESPACE, PARAMETERS.TYPE, PARAMETERS.OBJECT ] },
            RTS:           { key: '0B', title: '🏏 Record Types',         recipe: 'record-types',     data: 'recordTypes',     clear: 'removeAllRecordTypesFromCache',     alias: ALIASES.ALL,       get: 'getRecordTypes',     tableDefinition: 'RecordTypes',                getParameters: [ PARAMETERS.NAMESPACE, PARAMETERS.TYPE, PARAMETERS.OBJECT ] },
            WEB_LINKS:     { key: '0C', title: '🏑 Web Links',            recipe: 'web-links',        data: 'webLinks',        clear: 'removeAllWeblinksFromCache',        alias: ALIASES.ALL,       get: 'getWeblinks',        tableDefinition: 'WebLinks',                   getParameters: [ PARAMETERS.NAMESPACE, PARAMETERS.TYPE, PARAMETERS.OBJECT ] },
        }
    },
    SECURITY: { 
        key:   'D', 
        title: '👮 Security and Access',
        items: { 
            USERS:         { key: '0D', title: '👥 Active Internal Users',     recipe: 'internal-active-users',    data: 'users',                    clear: 'removeAllActiveUsersFromCache',            alias: ALIASES.NONE,     get: 'getActiveUsers',                     tableDefinition: 'Users' },
            PROFILES:      { key: '0E', title: '🚓 Profiles',                  recipe: 'profiles',                 data: 'profiles',                 clear: 'removeAllProfilesFromCache',               alias: ALIASES.PACKAGE,  get: 'getProfiles',                        tableDefinition: 'Profiles',                getParameters: [ PARAMETERS.NAMESPACE ] },
            PSETS:         { key: '0F', title: '🚔 Permission Sets',           recipe: 'permission-sets',          data: 'permissionSets',           clear: 'removeAllPermSetsFromCache',               alias: ALIASES.PACKAGE,  get: 'getPermissionSets',                  tableDefinition: 'PermissionSets',          getParameters: [ PARAMETERS.NAMESPACE ] },
            PSLS:          { key: '10', title: '🚔 Permission Set Licenses',   recipe: 'permission-set-licenses',  data: 'permissionSetLicenses',    clear: 'removeAllPermSetLicensesFromCache',        alias: ALIASES.PACKAGE,  get: 'getPermissionSetLicenses',           tableDefinition: 'PermissionSetLicenses',   getParameters: [ PARAMETERS.NAMESPACE ] },
            PROFILE_RSTRS: { key: '11', title: '🚸 Profile Restrictions',      recipe: 'profile-restrictions',     data: 'profileRestrictions',      clear: 'removeAllProfileRestrictionsFromCache',    alias: ALIASES.PACKAGE,  get: 'getProfileRestrictions',             tableDefinition: 'ProfileRestrictions',     getParameters: [ PARAMETERS.NAMESPACE ] },
            PROFILE_PWDS:  { key: '12', title: '⛖ Profile Password Policies', recipe: 'profile-password-policies', data: 'profilePasswordPolicies', clear: 'removeAllProfilePasswordPoliciesFromCache', alias: ALIASES.NONE,     get: 'getProfilePasswordPolicies',         tableDefinition: 'ProfilePasswordPolicies' },
            CRUDS:         { key: '13', title: '🚦 Object Permissions',        recipe: 'object-permissions',       data: 'objectPermissions',       clear: 'removeAllObjectPermissionsFromCache',       alias: ALIASES.PACKAGE,  get: 'getObjectPermissionsPerParent',      tableDefinition: 'ObjectPermissions',       getParameters: [ PARAMETERS.NAMESPACE ],                    isDataMatrix: true },
            FLSS:          { key: '14', title: '🚧 Field Level Securities',    recipe: 'field-permissions',        data: 'fieldPermissions',        clear: 'removeAllFieldPermissionsFromCache',        alias: ALIASES.OBJ_PCK,  get: 'getFieldPermissionsPerParent',       tableDefinition: 'FieldPermissions',        getParameters: [ PARAMETERS.OBJECT, PARAMETERS.NAMESPACE ], isDataMatrix: true },
            APP_PERMS:     { key: '15', title: '⛕ Application Permissions',   recipe: 'app-permissions',          data: 'appPermissions',           clear: 'removeAllAppPermissionsFromCache',          alias: ALIASES.PACKAGE,  get: 'getApplicationPermissionsPerParent', tableDefinition: 'AppPermissions',          getParameters: [ PARAMETERS.NAMESPACE ],                    isDataMatrix: true },
            BROWSERS:      { key: '16', title: '🌐 Browsers',                  recipe: 'browsers',                 data: 'browsers',                 clear: 'removeAllBrowsersFromCache',               alias: ALIASES.NONE,     get: 'getBrowsers',                         tableDefinition: 'Browsers' },
        }
    },
    BOXES: { 
        key:   'E', 
        title: '🐇 Boxes',
        items: { 
            ROLES_GRAPH:   { key: '17', title: '🐙 Internal Role Explorer', recipe: 'user-roles',           data: 'rolesTree',     clear: 'removeAllRolesFromCache',         alias: ALIASES.NONE, get: 'getRolesTree' },
            ROLES:         { key: '18', title: '🦓 Internal Role Listing',  recipe: 'user-roles',           data: 'roles',         clear: 'removeAllRolesFromCache',         alias: ALIASES.NONE, get: 'getRoles',         tableDefinition: 'Roles' },
            PGS:           { key: '19', title: '🐘 Public Groups',          recipe: 'public-groups',        data: 'publicGroups',  clear: 'removeAllPublicGroupsFromCache',  alias: ALIASES.NONE, get: 'getPublicGroups',  tableDefinition: 'PublicGroups' },
            QUEUES:        { key: '1A', title: '🦒 Queues',                 recipe: 'queues',               data: 'queues',        clear: 'removeAllQueuesFromCache',        alias: ALIASES.NONE, get: 'getQueues',        tableDefinition: 'Queues' },
            CHT_GROUPS:    { key: '1B', title: '🦙 Chatter Groups',         recipe: 'collaboration-groups', data: 'chatterGroups', clear: 'removeAllChatterGroupsFromCache', alias: ALIASES.NONE, get: 'getChatterGroups', tableDefinition: 'ChatterGroups' },
        }
    },
    AUTOMATION: { 
        key:   'F', 
        title: '🤖 Automations',
        items: { 
            FLOWS:         { key: '1C', title: '🏎️ Flows',            recipe: 'flows',            data: 'flows',           clear: 'removeAllFlowsFromCache',           alias: ALIASES.NONE, get: 'getFlows',           tableDefinition: 'Flows' },
            PBS:           { key: '1D', title: '🛺 Process Builders', recipe: 'process-builders', data: 'processBuilders', clear: 'removeAllProcessBuildersFromCache', alias: ALIASES.NONE, get: 'getProcessBuilders', tableDefinition: 'ProcessBuilders' },
            WORKFLOWS:     { key: '1E', title: '🚗 Workflows',        recipe: 'workflows',        data: 'workflows',       clear: 'removeAllWorkflowsFromCache',       alias: ALIASES.NONE, get: 'getWorkflows',       tableDefinition: 'Workflows' },
        }
    },
    SETTING: { 
        key:   'G', 
        title: '🎁 Setting',
        items: {
            LABELS:        { key: '1F', title: '🏷️ Custom Labels',      recipe: 'custom-labels',      data: 'customLabels',      clear: 'removeAllCustomLabelsFromCache',      alias: ALIASES.PACKAGE, get: 'getCustomLabels',      tableDefinition: 'CustomLabels',     getParameters: [ PARAMETERS.NAMESPACE ] },
            DOCUMENTS:     { key: '20', title: '🍱 Documents',          recipe: 'documents',          data: 'documents',         clear: 'removeAllDocumentsFromCache',         alias: ALIASES.PACKAGE, get: 'getDocuments',         tableDefinition: 'Documents',        getParameters: [ PARAMETERS.NAMESPACE ] },
            EMAIL_TPLS:    { key: '21', title: '🌇 Email Templates',    recipe: 'email-templates',    data: 'emailTemplates',    clear: 'removeAllEmailTemplatesFromCache',    alias: ALIASES.PACKAGE, get: 'getEmailTemplates',    tableDefinition: 'EmailTemplates',   getParameters: [ PARAMETERS.NAMESPACE ] },
            ARTICLES:      { key: '22', title: '📚 Knowledge Articles', recipe: 'knowledge-articles', data: 'knowledgeArticles', clear: 'removeAllKnowledgeArticlesFromCache', alias: ALIASES.NONE,    get: 'getKnowledgeArticles', tableDefinition: 'KnowledgeArticles' },
            SRS:           { key: '23', title: '🗿 Static Resources',   recipe: 'static-resources',   data: 'staticResources',   clear: 'removeAllStaticResourcesFromCache',   alias: ALIASES.PACKAGE, get: 'getStaticResources',   tableDefinition: 'StaticResources',  getParameters: [ PARAMETERS.NAMESPACE ] },
        }
    },
    VISUAL: { 
        key:   'H', 
        title: '🥐 User Interface',
        items: {
            VFPS:          { key: '24', title: '🥖 Visualforce Pages',         recipe: 'visualforce-pages',         data: 'visualForcePages',       clear: 'removeAllVisualForcePagesFromCache',        alias: ALIASES.PACKAGE, get: 'getVisualForcePages',        tableDefinition: 'VisualForcePages',       getParameters: [ PARAMETERS.NAMESPACE ]},
            VFCS:          { key: '25', title: '🍞 Visualforce Components',    recipe: 'visualforce-components',    data: 'visualForceComponents',  clear: 'removeAllVisualForceComponentsFromCache',   alias: ALIASES.PACKAGE, get: 'getVisualForceComponents',   tableDefinition: 'VisualForceComponents',  getParameters: [ PARAMETERS.NAMESPACE ] },
            LG_PAGES:      { key: '26', title: '🎂 Lightning Pages',           recipe: 'lightning-pages',           data: 'flexiPages',             clear: 'removeAllLightningPagesFromCache',          alias: ALIASES.PACKAGE, get: 'getLightningPages',          tableDefinition: 'FlexiPages',             getParameters: [ PARAMETERS.NAMESPACE ] },
            AURAS:         { key: '27', title: '🧁 Lightning Aura Components', recipe: 'lightning-aura-components', data: 'auraComponents',         clear: 'removeAllLightningAuraComponentsFromCache', alias: ALIASES.PACKAGE, get: 'getLightningAuraComponents', tableDefinition: 'AuraComponents',         getParameters: [ PARAMETERS.NAMESPACE ] },
            LWCS:          { key: '28', title: '🍰 Lightning Web Components',  recipe: 'lightning-web-components',  data: 'lightningWebComponents', clear: 'removeAllLightningWebComponentsFromCache',  alias: ALIASES.PACKAGE, get: 'getLightningWebComponents',  tableDefinition: 'LightningWebComponents', getParameters: [ PARAMETERS.NAMESPACE ] },
            HOME_PAGES:    { key: '29', title: '🍩 Home Page Components',      recipe: 'home-page-components',      data: 'homePageComponents',     clear: 'removeAllHomePageComponentsFromCache',      alias: ALIASES.NONE,    get: 'getHomePageComponents',      tableDefinition: 'HomePageComponents' },
            TABS:          { key: '2A', title: '🥠 Custom Tabs',               recipe: 'custom-tabs',               data: 'customTabs',             clear: 'removeAllCustomTabsFromCache',              alias: ALIASES.PACKAGE, get: 'getCustomTabs',              tableDefinition: 'CustomTabs',             getParameters: [ PARAMETERS.NAMESPACE ] },
        }
    },
    CODE: { 
        key:   'I', 
        title: '🔥 Programmatic',
        items: {
            CLASSES:       { key: '2B', title: '❤️‍🔥 Apex Classes',                         recipe: 'apex-classes',    data: 'apexClasses',    clear: 'removeAllApexClassesFromCache',    alias: ALIASES.PACKAGE, get: 'getApexClasses',    tableDefinition: 'ApexClasses',    getParameters: [ PARAMETERS.NAMESPACE ] },
            UNCOMPILEDS:   { key: '2C', title: '🌋 Apex Classes That Need Recompilation', recipe: 'apex-uncompiled', data: 'apexUncompiled', clear: 'removeAllApexUncompiledFromCache', alias: ALIASES.PACKAGE, get: 'getApexUncompiled', tableDefinition: 'ApexUncompiled', getParameters: [ PARAMETERS.NAMESPACE ] },
            TRIGGERS:      { key: '2D', title: '🧨 Apex Triggers',                        recipe: 'apex-triggers',   data: 'apexTriggers',   clear: 'removeAllApexTriggersFromCache',   alias: ALIASES.PACKAGE, get: 'getApexTriggers',   tableDefinition: 'ApexTriggers',   getParameters: [ PARAMETERS.NAMESPACE ] },
            TESTS:         { key: '2E', title: '🚒 Apex Unit Tests',                      recipe: 'apex-tests',      data: 'apexTests',      clear: 'removeAllApexTestsFromCache',      alias: ALIASES.PACKAGE, get: 'getApexTests',      tableDefinition: 'ApexTests',      getParameters: [ PARAMETERS.NAMESPACE ] },
        }
    },
    ANALYTICS: { 
        key:   'J', 
        title: '⛰️ Analytics',
        items: {
            REPORTS:       { key: '2F', title: '🌳 Reports',    recipe: 'reports',    data: 'reports',    clear: 'removeAllReportsFromCache',    alias: ALIASES.NONE, get: 'getReports',    tableDefinition: 'Reports' },
            DASHBOARDS:    { key: '30', title: '🌲 Dashboards', recipe: 'dashboards', data: 'dashboards', clear: 'removeAllDashboardsFromCache', alias: ALIASES.NONE, get: 'getDashboards', tableDefinition: 'Dashboards' },
        }
    },
};

const ALL_NAVIGATION_SUBITEMS_BY_KEY = {};
const INITIAL_NAVIGATION_ITEMS = Object.keys(APPLICATION_NAVIGATION).map((key) => { 
    const item = APPLICATION_NAVIGATION[key];
    return {
        label: item.title,
        name: item.key,
        expanded: item.key === APPLICATION_NAVIGATION.HOME.key, // let's expand the "Home" section by default
        items: Object.keys(item.items).map((k) => {
            const subItem = item.items[k];
            ALL_NAVIGATION_SUBITEMS_BY_KEY[subItem.key] = subItem;
            return { label: subItem.title, name: subItem.key }
        })
    }
});

/**
 * @description Keys of the main tabs in the application
 * @type {Array<string>}
 * @constant
 */
const MAIN_TABS_VALUES = Object.values(APPLICATION_NAVIGATION).map(tab => tab.key);

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
 * @description Sub tab keys by their corresponding recipe alias
 * @type {Map<string, string>}
 * @constant
 */
const RECIPE_TO_SUB_TAB = new Map();

Object.values(APPLICATION_NAVIGATION).forEach(mTab => Object.values(mTab.items).forEach(sTab => {
    SUB_TABS.set(sTab.key, { tab: { key: sTab.key, title: sTab.title }, mainTabKey: mTab.key });
    if (SUB_TABS_BY_MAIN_TAB_KEY.has(mTab.key) === false) SUB_TABS_BY_MAIN_TAB_KEY.set(mTab.key, []);
    SUB_TABS_BY_MAIN_TAB_KEY.get(mTab.key).push(sTab.key);
    if (sTab.recipe) {
        RECIPE_TO_SUB_TAB.set(sTab.recipe, sTab.key);
    }
}));

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