/* global d3, jsforce, UserContext, DateUtil */

/**
 * OrgCheck main object
 */
 const OrgCheck = {

    /**
     * Org Check Version
     */
    version: 'Lithium [Li,3]',
   
    /**
     * External libraries
     * (include on top of the file near global comment for ESLint)
     */
    externalLibs: {
        'd3': d3,
        'jsforce': jsforce,
        'salesforce': { 
            'usercontext': UserContext,
            'dateutil': DateUtil
        }
    },

    /**
     * Org Check core
     * @param setup JSON configuration including:
     *              <ol>
     *                <li><code>sfApiVersion</code>: Salesforce API version to use</li>
     *                <li><code>sfLocalAccessToken</code>: Salesforce Access Token to access the local org</li> 
     *                <li><code>sfLocalCurrentUserId</code>: Salesforce UserId of the current user in the the local org</li>
     *                <li><code>htmlProgressBarTagId</code>: HTML Tag Id of the progress bar zone</li> 
     *                <li><code>htmlSpinnerTagId</code>: HTML Tag Id of the spinner zone</li> 
     *                <li><code>htmlSpinnerMessagesTagId</code>: HTML Tag Id of the message that goes along with the spinner</li>
     *                <li><code>htmlModalContentTagId</code>: HTML Tag Id of the content zone of the dialog box</li> 
     *                <li><code>htmlModalTagId</code>: HTML Tag Id of the dialog box zone</li> 
     *                <li><code>htmlModalTitleTagId</code>: HTML Tag Id of the title zone of the dialog box</li> 
     *                <li><code>htmlMainContentTagId</code>: HTML Tag Id of the main content zone of the page</li> 
     *                <li><code>htmlWarningMessagesTagId</code>: HTML Tag Id of the message</li>
     *                <li><code>formatDefaultDate</code>: Default date format (if not specified for the current user)</li> 
     *                <li><code>formatDefaultDatetime</code>: Default datetime format (if not specified for the current user)</li> 
     *                <li><code>formatDefaultLanguage</code>: Default language format (likely 'en')</li>
     *              </ol>
     */
    Core: function(setup) {

        // ======================================================
        // INITIALIZATION OF HANDLERS
        // ======================================================
        
        const CACHE_PREFIX = 'OrgCheck';
        const CACHE_SECTION_METADATA = 'Metadata';
        const CACHE_SECTION_PREFERENCE = 'Preference';
        const MAP_KEYSIZE = '__51Z3__';

        const METADATA_CACHE_HANDLER = new OrgCheck.Cache.Handler({
            isPersistant: true,
            cachePrefix: CACHE_PREFIX,
            section: CACHE_SECTION_METADATA
        });

        const PREFERENCE_CACHE_HANDLER = new OrgCheck.Cache.Handler({
            isPersistant: true,
            cachePrefix: CACHE_PREFIX,
            section: CACHE_SECTION_PREFERENCE
        });

        const MAP_HANDLER = new OrgCheck.DataTypes.Collection.MapHandler({
            keySize: MAP_KEYSIZE,
            keyExcludePrefix: '__'            
        });

        const ARRAY_HANDLER = new OrgCheck.DataTypes.Collection.ArrayHandler();

        const PROGRESSBAR_HANDLER = new OrgCheck.VisualComponents.ProgressBarHandler({
            spinnerDivId: setup.htmlSpinnerTagId,
            spinnerMessagesId: setup.htmlSpinnerMessagesTagId
        });
        
        const MSG_HANDLER = new OrgCheck.VisualComponents.MessageHandler({
            modalContentId: setup.htmlModalContentTagId,
            modalId: setup.htmlModalTagId,
            modalTitleId: setup.htmlModalTitleTagId,
            modalImageId: setup.htmlModalImageTagId,
            warningMessagesId: setup.htmlWarningMessagesTagId
        });

        const SALESFORCE_HANDLER = new OrgCheck.Salesforce.Handler({
            id: setup.sfLocalAccessToken.split('!')[0],
            version: setup.sfApiVersion,
            accessToken: setup.sfLocalAccessToken,
            userId: setup.sfLocalCurrentUserId,
            watchDogCallback: (d) => { 
                if (d.level === 'ERROR') {
                    let stopAndShowError = true;
                    if (d.type === 'OrgTypeProd' && PREFERENCE_CACHE_HANDLER.getItemProperty('Options', 'warning.ByPassUseInProduction', true) === false) {
                        stopAndShowError = false;
                    }
                    if (stopAndShowError === true) {
                        const error = new Error();
                        error.context = { 
                            when: 'We stopped here because of our Watch Dog Guard! Waouf!',
                            what: {
                                level: d.level,
                                message: d.message,
                                type: d.type,
                                data: d.data
                            }
                        };
                        MSG_HANDLER.showError(error, false, SALESFORCE_HANDLER, '/img/icon/profile32.png', 'WatchDog stopped you here... Waouf!');
                    }
                }
                switch (d.type) {
                    case 'OrgTypeProd': {
                        const elmt = document.getElementById('org-information');
                        elmt.innerHTML = '<center><small>'+d.data.orgId+'<br />'+d.data.orgType+'</small></center>';
                        switch (d.level) {
                            case 'ERROR': elmt.classList.add('slds-theme_error'); break;
                            case 'WARNING': elmt.classList.add('slds-theme_warning'); break;
                            default: elmt.classList.add('slds-theme_success'); break;
                        }
                        break;
                    }
                    case 'DailyApiRequests' : {
                        const elmt = document.getElementById('org-daily-api-requests');
                        elmt.innerHTML = '<center><small>Daily API Request Limit: <br />'+(d.data.rate*100).toFixed(3)+' %</small></center>';
                        switch (d.level) {
                            case 'ERROR': elmt.classList.add('slds-theme_error'); break;
                            case 'WARNING': elmt.classList.add('slds-theme_warning'); break;
                            default: elmt.classList.add('slds-badge_lightest'); break;
                        }
                        break;
                    }
                }
            }
        });

        const DATE_HANDLER = new OrgCheck.DataTypes.Date.Handler({ 
            defaultLanguage: setup.formatDefaultLanguage,
            defaultDateFormat: setup.formatDefaultDate,  
            defaultDatetimeFormat: setup.formatDefaultDatetime 
        });

        const STRING_HANDLER = new OrgCheck.DataTypes.String.Handler();

        const HTMLTAG_HANDLER = new OrgCheck.VisualComponents.HtmlTagHandler();

        const DATATABLE_HANDLER = new OrgCheck.VisualComponents.DatatableHandler({
            StringHandler: STRING_HANDLER,
            DateHandler: DATE_HANDLER,
            MessageHandler: MSG_HANDLER,
            HtmlTagHandler: HTMLTAG_HANDLER
        });

        const DATASETS_HANDLER = new OrgCheck.Datasets.Handler({
            SalesforceHandler: SALESFORCE_HANDLER,
            MetadataCacheHandler: METADATA_CACHE_HANDLER,
            PreferenceCacheHandler: PREFERENCE_CACHE_HANDLER,
            MapHandler:  MAP_HANDLER,
            ArrayHandler: ARRAY_HANDLER,
            DateHandler: DATE_HANDLER
        });

        // ======================================================
        // CONTROLLER LAYER 
        // ======================================================

        /**
         * The Org Check controller
         */
        this.getController = function() {
            return {
                /**
                * Main function of the controller
                * @param ctlSetup JSON configuration including:
                *              <ol>
                *                <li><code>datasets</code>: </li>
                *                <li><code>onRecords</code>: </li> 
                *                <li><code>dependencies</code>: </li> 
                *                <li><code>actions.clearCache</code>: </li> 
                *                <li><code>actions.exportTable</code>: </li> 
                *              </ol>
                */
                run: function(ctlSetup) {

                    // 0. Clean way to show errors
                    const showError = function(error) {
                        MSG_HANDLER.showError(error, true, SALESFORCE_HANDLER);
                        //PROGRESSBAR_HANDLER.reset();
                        //PROGRESSBAR_HANDLER.hide();
                        document.getElementById(setup.htmlMainContentTagId).style.display = 'none';
                    };

                    // 1. Check properties of ctlSetup
                    try {
                        if (!ctlSetup.datasets) throw '"datasets" property is undefined';
                        if (!Array.isArray(ctlSetup.datasets)) throw '"datasets" property is not an array';
                        ctlSetup.datasets.forEach(dataset => {
                            if (!dataset) throw '"datasets" property contains an undefined/null/empty value';
                            if (typeof dataset !== 'string') throw '"datasets" property should contain only string values';
                            if (DATASETS_HANDLER.hasDataset(dataset) === false) throw '"datasets" property should point to a known data retreiver (dataset causing the issue is '+dataset+')';
                        });
                        if (!ctlSetup.onRecords) throw '"onRecords" property is undefined';
                        if (typeof ctlSetup.onRecords !== 'function') throw '"onRecords" property is not a method';
                        if (!ctlSetup.dependencies) ctlSetup.dependencies = false;
                        if (typeof ctlSetup.dependencies !== 'boolean') throw '"dependencies" property is not a boolean'
                    } catch (error) {
                        showError(error);
                        return;
                    }

                    // 2. Set the progress bar to 'EMPTY'
                    PROGRESSBAR_HANDLER.reset();
                    ctlSetup.datasets.forEach(d => {
                        PROGRESSBAR_HANDLER.addSection('dataset-'+d, 'Dataset ['+d+']: initialize...', 'initialized');
                    });
                    PROGRESSBAR_HANDLER.addSection('mapping', 'Mapping: initialize...', 'initialized');
                    if (ctlSetup.dependencies) {
                        PROGRESSBAR_HANDLER.addSection('dependencies', 'Dependencies: initialize...', 'initialized');
                    }
                    PROGRESSBAR_HANDLER.addSection('records', 'Records: initialize...', 'initialized');
                    if (ctlSetup.actions) {
                        PROGRESSBAR_HANDLER.addSection('actions', 'Actions: initialize...', 'initialized');
                    }
                    PROGRESSBAR_HANDLER.show();
                    document.getElementById(setup.htmlMainContentTagId).style.display = 'none';

                    // 3. Buttons actions
                    const initActions = function() {
                        // 3.1 Set the clear cache button (if specified)
                        if (ctlSetup.actions && ctlSetup.actions.clearCache && ctlSetup.actions.clearCache.show === true) { 
                            const buttonClearCache = document.getElementById('button-clear-page-cache');
                            buttonClearCache.onclick = function() { 
                                ctlSetup.datasets.forEach(dataset => {
                                    METADATA_CACHE_HANDLER.clear(DATASETS_HANDLER.getDataset(dataset).getKeyCache());
                                });
                                document.location.reload(false);
                            };
                            buttonClearCache.parentNode.style.display = 'block';
                        }
                        // 3.2 Set the export as file button (if specified)
                        if (ctlSetup.actions && ctlSetup.actions.exportTable && Array.isArray(ctlSetup.actions.exportTable)) {
                            const buttonExport = document.getElementById('button-export');
                            buttonExport.onclick = function() { 
                                let isSomethingToExport = false;
                                ctlSetup.actions.exportTable.forEach(d => {
                                    if (d.visibleTab) {
                                        const tab = document.getElementById(d.visibleTab).parentNode;
                                        if (tab.classList.contains('slds-is-active') === false) {
                                            return;
                                        }
                                    }
                                    const tables = d.tables || [ d.table ];
                                    const data = [];
                                    tables.forEach(t => {
                                        const div = document.getElementById(t);
                                        const title = div.getAttribute('data-title');
                                        const rows = div.querySelectorAll('table tr');
                                        if (title) data.push('### ' + title + ' ###');
                                        for (let i=0; i<rows.length; i++) {
                                            const row = [];
                                            const cols = rows[i].querySelectorAll('td, th');
                                            for (let j=0; j<cols.length; j++) {
                                                let v = cols[j].attributes['aria-data']?.value || cols[j].innerText;
                                                v = v.trim() // trim will delete extra spaces (including &nbsp;)
                                                    .replaceAll('\n', ','); // we used innerText so that \n stays, which is not the case for textContext
                                                if (v && v.indexOf(',') != -1) {
                                                    // if v contains ',':
                                                    //   - escape any double quotes in 'v'
                                                    //   - add double quotes around 'v'
                                                    v = '"'+v.replaceAll('"','""')+'"'; 
                                                }
                                                row.push(v);
                                            }
                                            data.push(row.join(","));        
                                        }
                                        data.push('');
                                    });
                                    const link = document.createElement('a');
                                    link.style.visibility = 'none';
                                    document.body.appendChild(link);
                                    link.download = d.filename + '.csv';
                                    link.target = '_blank';
                                    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(data.join('\n'));
                                    link.click();
                                    document.body.removeChild(link);
                                    isSomethingToExport = true;
                                });
                                if (isSomethingToExport === false) {
                                    MSG_HANDLER.showModal('Export feature', 'Exporting data for this tab is not yet implemented!');
                                }
                            }
                            buttonExport.parentNode.style.display = 'block';
                        }
                    }

                    // 4. Method that calls the callback fonction and set the progress bar top 'FULL'
                    const onEnd = function(map) {
                        PROGRESSBAR_HANDLER.setSection('records', 'Records processing starting...', 'started');
                        ctlSetup.onRecords(map);
                        PROGRESSBAR_HANDLER.setSection('records', 'Records processing ended successfuly', 'ended');
                        PROGRESSBAR_HANDLER.setSection('actions', 'Action buttons starting...', 'started');
                        initActions();
                        PROGRESSBAR_HANDLER.setSection('actions', 'Action buttons ended successfuly', 'ended');
                        setTimeout(function() {
                            PROGRESSBAR_HANDLER.hide();
                            document.getElementById(setup.htmlMainContentTagId).style.display = 'block';
                        }, 1000);
                    }

                    // 5. Calling the dataset retreivers
                    DATASETS_HANDLER.runDatasets(
                        ctlSetup.datasets,
                        ctlSetup.dependencies,
                        {
                            startDatasetDecorator: (ds) => PROGRESSBAR_HANDLER.setSection('dataset-'+ds, 'Dataset ['+ds+']: starting...', 'started'),
                            successDatasetDecorator: (ds) => PROGRESSBAR_HANDLER.setSection('dataset-'+ds, 'Dataset ['+ds+']: ended successfuly', 'ended'), 
                            errorDatasetDecorator: (ds) => PROGRESSBAR_HANDLER.setSection('dataset-'+ds, 'Dataset ['+ds+']: ended with an error', 'failed'),
                            startMappingDecorator: () => PROGRESSBAR_HANDLER.setSection('mapping', 'Mapping process starting...', 'started'),
                            successMappingDecorator: () => PROGRESSBAR_HANDLER.setSection('mapping', 'Mapping process ended successfuly', 'ended'),
                            errorMappingDecorator: () => PROGRESSBAR_HANDLER.setSection('mapping', 'Mapping process ended with an error', 'failed'),
                            startDependenciesDecorator: () => PROGRESSBAR_HANDLER.setSection('dependencies', 'Dependencies process starting...', 'started'),
                            successDependenciesDecorator: () => PROGRESSBAR_HANDLER.setSection('dependencies', 'Dependencies process ended successfuly', 'ended'), 
                            errorDependenciesDecorator: () => PROGRESSBAR_HANDLER.setSection('dependencies', 'Dependencies process ended with an error', 'failed'),
                            successFinalDecorator: (data) => onEnd(data),
                            errorFinalDecorator: (error) => showError(error)
                        }
                    );
                }
            };
        }

        // ======================================================
        // HELPER LAYER
        // ======================================================

        /**
         * The Org Check helper
         */
        this.getHelper = function() {
            return {
                salesforce: {
                    cruds: function(permissionSets, success, error) {
                        const records = [];
                        SALESFORCE_HANDLER.query([{ 
                                string: 'SELECT ParentId, SobjectType, '+
                                            'PermissionsRead, PermissionsCreate, PermissionsEdit, PermissionsDelete, '+
                                            'PermissionsViewAllRecords, PermissionsModifyAllRecords '+
                                        'FROM ObjectPermissions '+
                                        'WHERE ParentId IN ('+SALESFORCE_HANDLER.secureSOQLBindingVariable(permissionSets)+')'
                            }])
                            .on('record', (r) => {
                                records.push({
                                    parentId: SALESFORCE_HANDLER.salesforceIdFormat(r.ParentId),
                                    objectType: r.SobjectType,
                                    isRead: r.PermissionsRead === true, 
                                    isCreate: r.PermissionsCreate === true, 
                                    isEdit: r.PermissionsEdit === true, 
                                    isDelete: r.PermissionsDelete === true, 
                                    isViewAll: r.PermissionsViewAllRecords === true, 
                                    isModifyAll: r.PermissionsModifyAllRecords === true
                                });
                            })
                            .on('error', (e) => { if (error) error(e); })
                            .on('end', () => success(records))
                            .run();
                    },
                    applicationVisibilities: function(profileNames, permissionSetNames, success, error) {
                        const metadatas = [];
                        if (profileNames && profileNames.length > 0) {
                            metadatas.push({ type: 'Profile', members: profileNames });
                        }
                        if (permissionSetNames && permissionSetNames.length > 0) {
                            metadatas.push({ type: 'PermissionSet', members: permissionSetNames });
                        }
                        if (metadatas.length === 0) return success();
                        SALESFORCE_HANDLER.readMetadata(metadatas)
                            .on('error', (err) => error(err))
                            .on('end', (response) => {
                                const records = [];
                                Object.keys(response).forEach(type => response[type].forEach(m => {
                                    const appVisibility = { 
                                        parentApiName: m.fullName,
                                        appVisibilities: []
                                    };
                                    if (m.applicationVisibilities) {
                                        const avs = m.applicationVisibilities;
                                        const avsArray = Array.isArray(avs) ? avs : [ avs ];
                                        avsArray.forEach(av => appVisibility.appVisibilities.push({ 
                                            app: av.application,
                                            default: av.default === 'true',
                                            visible: av.visible === 'true'
                                        }));
                                    }
                                    records.push(appVisibility);
                                }));
                                success(records);
                            })
                            .run();
                    },
                    describe: {
                        object: function(pckg, obj, success, error) {
                            SALESFORCE_HANDLER.describe(pckg, obj)
                                .on('error', (e) => { if (error) error(e); })
                                .on('end', (o) => { if (success) success(o); })
                                .run();
                        }
                    },
                    apex: {
                        runAllLocalTests: function() {
                            return SALESFORCE_HANDLER.httpCall(
                                    '/tooling/runTestsAsynchronous', 
                                    { 
                                        body: { testLevel: 'RunLocalTests', skipCodeCoverage: false }, 
                                        type: 'application/json' 
                                    }
                                )
                                .on('error', (e) => { MSG_HANDLER.showError(e, true, SALESFORCE_HANDLER); })
                                .run();
                        },
                        compileClasses: function(classIds) {
                            SALESFORCE_HANDLER.query([{
                                string: 'SELECT Id, Name, Body '+
                                        'FROM ApexClass '+
                                        'WHERE Id IN ('+SALESFORCE_HANDLER.secureSOQLBindingVariable(classIds)+') '+
                                        'LIMIT 25 ' // 25 is the limit of the composite api
                                }])
                                .on('error', (e) => { MSG_HANDLER.showError(e, true, SALESFORCE_HANDLER); })
                                .on('end', (classes) => { 
                                    const req = [];
                                    req.push({
                                        method: 'POST',
                                        url: '/services/data/v'+SALESFORCE_HANDLER.getApiVersion()+'.0/tooling/sobjects/MetadataContainer',
                                        referenceId: 'container',
                                        body: { Name : 'container'+Date.now() }
                                    });
                                    classes.forEach((c, i) => { 
                                        req.push({
                                            method: 'POST',
                                            url: '/services/data/v'+SALESFORCE_HANDLER.getApiVersion()+'.0/tooling/sobjects/ApexClassMember',
                                            referenceId: 'class'+i,
                                            body: { MetadataContainerId: '@{container.id}', ContentEntityId: c.Id, Body: c.Body }
                                        });
                                    });
                                    req.push({
                                        method: 'POST',
                                        url: '/services/data/v52.0/tooling/sobjects/ContainerAsyncRequest',
                                        referenceId: 'request',
                                        body: { MetadataContainerId: '@{container.id}', IsCheckOnly: true }
                                    });
                                    SALESFORCE_HANDLER.httpCall('/tooling/composite', { body: { allOrNone: true, compositeRequest: req }, type: 'application/json' })
                                        .on('error', (e) => { MSG_HANDLER.showError(e, true, SALESFORCE_HANDLER); })
                                        .on('end', (resp) => { 
                                            const lastResponse = resp.compositeResponse[resp.compositeResponse.length-1];
                                            if (lastResponse.httpStatusCode === 201) {
                                                MSG_HANDLER.showModal(
                                                    'Asynchronous Compilation Asked',
                                                    'We asked Salesforce to recompile the following Apex Classes (limit to the first 25):<br />'+
                                                    classes.map(c => '- <a href="/'+c.Id+'" target="_blank">'+c.Name+'</a>').join('<br />')+'<br />'+
                                                    '<br />'+
                                                    'For more information about the success of this compilation, you can check '+
                                                    'with Tooling API the status of the following record: <br />'+
                                                    '<code>'+lastResponse.httpHeaders.Location+'</code><br />'+
                                                    '<br />'+
                                                    'In case you need to recompile ALL the classes, go <a href="/01p" target="_blank" '+
                                                    'rel="external noopener noreferrer">here</a> and click on the link <b>"Compile all classes"</b>.');
                                            } else {
                                                MSG_HANDLER.showError(resp, true, SALESFORCE_HANDLER);
                                            }
                                        })
                                        .run();
                                })
                                .run();
                            return true;
                        }
                    },
                    version: {
                        isOld: SALESFORCE_HANDLER.isVersionOld
                    }
                },
                cache: {
                    metadata: {
                        clearAll: METADATA_CACHE_HANDLER.clearAll,
                        keys: METADATA_CACHE_HANDLER.keys,
                        sideValues: METADATA_CACHE_HANDLER.sideValues,
                        clear: METADATA_CACHE_HANDLER.clear
                    }
                },
                information: {
                    showMainContent: function() {
                        document.getElementById(setup.htmlMainContentTagId).style.display = 'block';
                    },
                    getOrgId: SALESFORCE_HANDLER.getOrgId,
                    getOrgType: SALESFORCE_HANDLER.getOrgType,
                    getCurrentlUserId: SALESFORCE_HANDLER.getCurrentUserId
                },
                preferences: {
                    get: function(key) {
                        return PREFERENCE_CACHE_HANDLER.getItemProperty('Options', key, true);
                    },
                    set: function(key, value) {
                        PREFERENCE_CACHE_HANDLER.setItemProperty('Options', key, value);
                    }
                },
                array: {
                    concat: ARRAY_HANDLER.concat
                },
                map: {
                    keys: MAP_HANDLER.keys,
                    index: function(map, compare_function, filter_function) {
                        let keys = MAP_HANDLER.keys(map);
                        if (filter_function) {
                            keys = keys.filter(k => filter_function(map[k]));
                        }
                        keys.sort(function compare(a, b) {
                            return compare_function(map[a], map[b]);
                        });
                        return keys;
                    },
                    iterate: function(map, indexes, for_each_item_function) {
                        for (let i=0; i<indexes.length; i++) {
                            const key = indexes[i];
                            const item = map[key];
                            for_each_item_function(item, i, indexes.length, key);
                        }
                    },
                    iterate2: function(map, for_each_item_function) {
                        const keys = MAP_HANDLER.keys(map);
                        for (let i=0; i<keys.length; i++) {
                            const key = keys[i];
                            const item = map[key];
                            for_each_item_function(item, i, keys.length, key);
                        }
                    },
                    setItem: function(map, key, value) {
                        MAP_HANDLER.setValue(map, key, value);
                    }
                },
                timestamp: {
                    to: {
                        datetime: DATE_HANDLER.datetimeFormat,
                        date: DATE_HANDLER.dateFormat
                    }
                },
                error: {
                    show: (e) => MSG_HANDLER.showError(e, true, SALESFORCE_HANDLER)
                },
                html: {
                    modal: {
                        show: MSG_HANDLER.showModal
                    },
                    message: {
                        show: MSG_HANDLER.showWarning,
                        hide: MSG_HANDLER.hideWarning
                    },
                    progress: {
                        show: PROGRESSBAR_HANDLER.show,
                        hide: PROGRESSBAR_HANDLER.hide,
                        resetSections: PROGRESSBAR_HANDLER.reset,
                        addSection: PROGRESSBAR_HANDLER.addSection,
                        setSection: PROGRESSBAR_HANDLER.setSection
                    },
                    datatable: {
                        create: function(config) {
                            if (!Array.isArray(config.data)) config.datakeys = MAP_HANDLER.keys(config.data);
                            DATATABLE_HANDLER.create(config);
                        },
                        clean: function(element) {
                            const dt = document.getElementById(element);
                            while (dt.firstChild) {
                                dt.removeChild(dt.lastChild);
                            }
                        }
                    },
                    tabs: {
                        initialize: function(itemClass, contentClass, buttonClass) {
                            const tabItems = document.getElementsByClassName(itemClass);
                            const tabContents = document.getElementsByClassName(contentClass);
                            const buttons = document.getElementsByClassName(buttonClass);
                            for (let i=0; i<tabItems.length; i++) {
                                tabItems[i].onclick = function(event) {
                                    const correspondingTabId = event.target.attributes['aria-controls'].value;
                                    const currentSetOfTabs = event.target.parentElement.parentElement;
                                    // Switch tabs and show content
                                    for (let j=0; j<tabItems.length; j++) {
                                        if (tabItems[j].parentElement === currentSetOfTabs) {
                                            if (tabItems[j] == event.target.parentElement) {
                                                tabItems[j].classList.add('slds-is-active');
                                                tabContents[j].classList.add('slds-show');
                                                tabContents[j].classList.remove('slds-hide');
                                            } else {
                                                tabItems[j].classList.remove('slds-is-active');
                                                tabContents[j].classList.remove('slds-show');
                                                tabContents[j].classList.add('slds-hide');
                                            }
                                        }
                                    }
                                    // Show buttons
                                    for (let j=0; j<buttons.length; j++) {
                                        const prop = buttons[j].attributes['aria-controlled-by'];
                                        if (prop && prop.value) {
                                            if ((',' + prop.value + ',').includes(',' + correspondingTabId + ',')) {
                                                buttons[j].parentNode.style.display = 'block';
                                            } else {
                                                buttons[j].parentNode.style.display = 'none';
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    picklist: {
                        addValue: function(l, value, label) {
                            const o = document.createElement('option');
                            o.value = value;
                            o.text = label;
                            l.add(o);
                        },
                        clear: function(l, length) {
                            const i = length-1;
                            while (l.options.length > i) { 
                                l.options[i] = null; 
                            }
                        }
                    },
                    element: {
                        show: function(el, visibility) {
                            if (typeof el === 'string') el = document.getElementById(el);
                            el.style.display = (visibility ? 'block' : 'none');
                        },
                        setText: function(el, value) {
                            if (typeof el === 'string') el = document.getElementById(el);
                            el.textContent = (value ? value : '');
                        },
                        enable: function(el, value) {
                            if (typeof el === 'string') el = document.getElementById(el);
                            if (value === true) {
                                el.removeAttribute('disabled');
                            } else if (value === false) {
                                el.setAttribute('disabled', 'disabled');
                            }
                        },
                        setAttribute: function(el, key, value) {
                            if (typeof el === 'string') el = document.getElementById(el);
                            el.setAttribute(key, value);
                        },
                        get: function(name) {
                            return document.getElementById(name);
                        },
                        removeAllChild: function(el) {
                            if (typeof el === 'string') el = document.getElementById(el);
                            while (el.firstChild) { el.removeChild(el.firstChild); }
                        },
                        create: function(type) {
                            return document.createElement(type);
                        },
                        appendChild: function(el, child) {
                            if (typeof el === 'string') el = document.getElementById(el);
                            el.appendChild(child);
                        },
                        addClass: function(el, classes) {
                            if (typeof el === 'string') el = document.getElementById(el);
                            el.classList.add(...classes);
                        }
                    },
                    render: {
                        format: STRING_HANDLER.format,
                        escape: STRING_HANDLER.htmlSecurise,
                        percentage: STRING_HANDLER.percentage,
                        shrinkText: STRING_HANDLER.shrink,
                        dependencies: function(id, name, data) {
                            const div = document.createElement('div');
                            div.innerHTML = '<a>Dependencies <img src="/img/chatter/lookupSearchHover.png" /></a>';
                            div.setAttribute('id', 'chart-container-' + id);
                            div.style.cursor = 'zoom-in';
                            div.onclick = function() {
                                const information = document.createElement('div');
                                information.appendChild(private_compute_dependencies_graph('dep'+id, name, data, '#5fc9f8', '#82949e'));
                                information.appendChild(private_compute_dependencies_tabular('dep2'+id, name, data));
                                MSG_HANDLER.showModal('Dependencies Graphical and Tabular Information', information); 
                            };
                            return div;
                        },
                        dependencyUsage: function(id, data, usedTypes) {
                            const usage = { 
                                usingAllCount: 0,
                                usedAllCount: 0
                            };
                            if (data?.using) MAP_HANDLER.keys(data.using).forEach(u => usage.usingAllCount += MAP_HANDLER.keys(data.using[u]).length);
                            if (data?.used) MAP_HANDLER.keys(data.used).forEach(u => {
                                const keys = MAP_HANDLER.keys(data.used[u]);
                                const count = keys.length;
                                let inactiveCount = 0;
                                usage.usedAllCount += count;
                                if (usedTypes?.indexOf(u) >= 0) {
                                    usage['used'+u+'Count'] = count;
                                    keys.forEach(k => { if (data.used[u][k].isActive !== true) inactiveCount++; })
                                    usage['used'+u+'InactiveCount'] = inactiveCount;
                                }
                            });
                            return usage;
                        },
                        checkbox: function(b) {
                            return HTMLTAG_HANDLER.checkbox(b);
                        },
                        link: function(uri, content) {
                            return HTMLTAG_HANDLER.link(SALESFORCE_HANDLER.getEndpointUrl(), uri, content);
                        },
                        icon: function(name) {
                            return HTMLTAG_HANDLER.icon(name);
                        },
                        color: function(label) {
                            return HTMLTAG_HANDLER.color(label);
                        }
                    }
                }
            };
        };

        /**
         * Compute the dependencies tabular view
         * @param tagId id of the entity
         * @param name of the entity we want to analyze the dependencies
         * @param data Returned by the doSalesforceDAPI method
         */
        function private_compute_dependencies_tabular(tagId, name, data) {
            const tabularView = [];
            ['used', 'using'].forEach(category => {
                const d = data[category];
                if (d) {
                    for (const type in d) {
                        d[type].forEach(ref => {
                            tabularView.push({ 
                                target: name, 
                                relation: category, 
                                refId: ref.id, 
                                refName: ref.name,
                                refType: type
                            })
                        });
                    }
                }
            });
            
            const div = document.createElement('div');
            div.id = tagId;
            
            DATATABLE_HANDLER.create({
                element: div,
                data: tabularView,
                columns: [
                    { name: 'TargetName', property: 'target' }, 
                    { name: 'Relation', formula:  (r) => { return (r.relation === 'used') ? 'is used by' : 'is using' ; }},
                    { name: 'Reference Type', property: 'refType' },
                    { name: 'Reference Name', property: 'refName' },
                    { name: 'Reference Id', property: 'refId' }
                ]
            });

            return div;
        }

        /**
         * Compute the dependencies graph as a SVG graph (with d3)
         * @param tagId id of the entity
         * @param name of the entity we want to analyze the dependencies
         * @param data Returned by the doSalesforceDAPI method
         * @param activeBoxColor Color of each box for Active items 
         * @param deactiveBoxColor Color of each box for Deactivated items
         */
        function private_compute_dependencies_graph(tagId, name, data, activeBoxColor, deactiveBoxColor) {

            // Some constants
            const BOX_PADDING = 3;
            const BOX_HEIGHT = 38;
            const BOX_WIDTH = 100;
            
            // Hierarchical view of the data
            const rootData = { 
                name: name, 
                children: [ 
                    { name: 'Where Is It Used?', id: 'used', children: [] }, 
                    { name: 'What Is It Using?', id: 'using', children: [] } 
                ]
            };
            rootData.children.forEach(e => {
                const d = data[e.id];
                if (d) for (const type in d) {
                    e.children.push({ name: type, children: d[type] });
                }
            });
            const root = OrgCheck.externalLibs.d3.hierarchy(rootData);

            // Set size
            let mdepth = 0;
            root.each(function(d) {
                if (mdepth < d.depth) mdepth = d.depth;
            });
            const width = BOX_WIDTH * (mdepth * 2 + 4);
            root.dx = BOX_HEIGHT + BOX_PADDING;
            root.dy = width / (root.height + 1);

            // Generate tree
            OrgCheck.externalLibs.d3.tree().nodeSize([root.dx, root.dy])(root);

            // Define x0 and x1
            let x0 = Infinity;
            let x1 = -x0;
            root.each(function(d) {
                if (d.x > x1) x1 = d.x;
                if (d.x < x0) x0 = d.x;
                if (mdepth < d.depth) mdepth = d.depth;
            });

            // Construction of graph
            const svg = OrgCheck.externalLibs.d3.create('svg')
                .attr('id', function(d, i) { return (tagId + 'svg' + i); })
                .attr('viewBox', [0, 0, width, x1 - x0 + root.dx * 2])
                .attr('xmlns', 'http://www.w3.org/2000/svg');
            
            const g = svg.append('g')
                .attr('id', function(d, i) { return (tagId + 'g' + i); })
                .attr('font-family', 'Salesforce Sans,Arial,sans-serif')
                .attr('font-size', '10')
                .attr('transform', `translate(${root.dy / 2},${root.dx - x0})`);
            
            g.append('g')
                .attr('id', function(d, i) { return (tagId + 'link' + i); })
                .attr('fill', 'none')
                .attr('stroke', '#555')
                .attr('stroke-opacity', 0.4)
                .attr('stroke-width', 1.5)
                .selectAll('path')
                .data(root.links())
                .join('path')
                .attr('d', OrgCheck.externalLibs.d3.linkHorizontal()
                    .x(function(d) { return d.y+BOX_WIDTH/2; } )
                    .y(function(d) { return d.x; } )
                );
            
            const node = g.append('g')
                .attr('id', function(d, i) { return (tagId + 'gnode' + i); })
                .attr('stroke-linejoin', 'round')
                .attr('stroke-width', 3)
                .selectAll('g')
                .data(root.descendants())
                .join('g')
                .attr('transform', function(d) { return `translate(${d.y},${d.x})`; });

            // --------------------------------
            // NODE ZONE
            // --------------------------------
            node.append('rect')
                .attr('id', function(d, i) { return (tagId + 'zone' + i); })
                .attr('fill', function(d) { return d.data.isActive === false ? deactiveBoxColor : activeBoxColor; })
                .attr('rx', 6)
                .attr('ry', 6)
                .attr('x', 0)
                .attr('y', - BOX_HEIGHT / 2)
                .attr('width', BOX_WIDTH)
                .attr('height', BOX_HEIGHT);

            // --------------------------------
            // NODE CONTENT
            // --------------------------------
            node.append('foreignObject')
                .attr('id', function(d, i) { return (tagId + 'content' + i); })
                .attr('x', BOX_PADDING)
                .attr('y', - BOX_HEIGHT / 2 + BOX_PADDING)
                .attr('width', BOX_WIDTH-2*BOX_PADDING)
                .attr('height', BOX_HEIGHT-2*BOX_PADDING)
                .append('xhtml').html(d => '<span class="slds-hyphenate" style="text-align: center;">' + STRING_HANDLER.htmlSecurise(d.data.name) + (d.data.isActive===false?' (not active)':'') + '</span>');

            return svg.node();
        }

    }
};/**
 * Cache module
 */
OrgCheck.Cache = {

    /**
     * Cache handler
     * @param configuration Object must contain 'isPersistant', 'cachePrefix', 'section', 'timestampKey', 'sizeKey' and 'versionKey'
     */
    Handler: function (configuration) {

        /**
        * Cache system to use. 
        *              If <code>isPersistant</code> is true, we use Local Storage, otherwise Session Storage.
        *              <b>Local storage</b> means data WILL NOT be erased after closing the browser. 
        *              <b>Session storage</b> means data WILL be erased after closing the browser. 
        *              See https://developer.mozilla.org/fr/docs/Web/API/Storage
        */
        const CACHE_SYSTEM = (configuration.isPersistant === true ? localStorage : sessionStorage);

        /**
         * Key for "timestamp" on every cache entry
         */
        const TIMESTAMP_KEY = configuration.timestampKey || "__TIMESTAMP__";
        
        /**
         * Key for "version" on every cache entry
         */
        const VERSION_KEY = configuration.versionKey || "__VERSION__";

        /**
         * Key for "size" on every cache entry
         */
        const SIZE_KEY = configuration.sizeKey || "__51Z3__";

        /**
         * Cache prefix
         */
        const PREFIX = configuration.cachePrefix;

        /**
         * Section
         */
        const SECTION = configuration.section;

        /**
        * Method to clear all Org Check cached items
        */
        this.clearAll = function () {
            let keys_to_remove = private_get_keys();
            for (let i = 0; i < keys_to_remove.length; i++) {
                private_delete_item(keys_to_remove[i]);
            }
        };

        /**
        * Method to clear one Org Check cached item
        * @param key in cache (without the prefix) to use
        * @return the previous value that has been deleted
        */
        this.clear = function (key) {
            const oldValue = private_delete_item(key);
            return oldValue;
        };

        /**
        * Method to get all keys of the WoldemOrg cache
        * @return All keys of the cache of the section.
        */
        this.keys = function () {
            const keys = private_get_keys();
            return keys;
        };

        /**
        * Method to get an item from the cache
        * @param key in cache (without the prefix) to use
        * @return the value in cache (undefined if not found)
        */
        this.getItem = function (key) {
            const value = private_get_item(key);
            return value;
        };

        /**
        * Method to get the timestamp and version of a specific cache item
        * @param key in cache (without the prefix) to use
        * @return the side values of the item in cache (undefined if not found)
        */
        this.sideValues = function (key) {
            const value = private_get_item(key);
            if (value) {
                return {
                    timestamp: value[TIMESTAMP_KEY],
                    version: value[VERSION_KEY],
                    size: value[SIZE_KEY]
                };
            }
            return;
        };

        /**
        * Method to set an item into the cache
        * @param key in cache (without the prefix) to use
        * @param value of the item to store in cache
        */
        this.setItem = function (key, value) {
            try {
                private_set_item(key, value);
            } catch (e) {
                private_log_error(e);
            }
        };

        /**
        * Method to cache error and clean other stuff in the page
        * @param key in cache (without the prefix) to use
        * @param retrieverCallback function that we call to get the value
        * @param finalCallback function to call after the value was got
        */
        this.cache = function (key, retrieverCallback, finalCallback) {
            // Query the cache first
            const value = private_get_item(key);
            // Is the cache available??
            if (value) {
                // Yes, the cache is available
                // Call the onEnd method with data coming from cache
                finalCallback(value, true);
            } else {
                // No, the cache is not available for this data
                retrieverCallback(function (newValue) {
                    // check if data is undefined
                    if (newValue) {
                        // Update the cache
                        try {
                            private_set_item(key, newValue);
                        } catch (e) {
                            private_log_error(e);
                        }
                    }
                    // Call the onEnd method with data not coming from cache
                    finalCallback(newValue, false);
                });
            }
        };

        /**
        * Method to get a property of an item from the cache
        * @param key in cache (without the prefix) to use
        * @param propertyKey the key of the property within the value in cache
        * @param defaultPropertyValue if the cache is not present or the property is not set, return that value
        * @return the value for this property
        */
         this.getItemProperty = function (key, propertyKey, defaultPropertyValue) {
            const value = private_get_item(key) || {};
            const propertyValue = value[propertyKey];
            if (propertyValue === undefined) return defaultPropertyValue;
            return propertyValue;
        };

        /**
        * Method to set a property of an item from the cache
        * @param key in cache (without the prefix) to use
        * @param propertyKey the key of the property within the value in cache
        * @param propertyValue the value for this property
        */
         this.setItemProperty = function (key, propertyKey, propertyValue) {
            const value = private_get_item(key) || {};
            value[propertyKey] = propertyValue;
            private_set_item(key, value);
        };

        /**
        * Log actions from the cache
        * @param e Error
        */
        function private_log_error(e) {
            console.error("[Org Check:Cache]", { error: e });
        }

        /**
        * Private method to generate the prefix used for keys in cache
        * @return Prefix generated from section name
        */
        function private_generate_prefix() {
            return PREFIX + '.' + SECTION + '.';
        }

        /**
        * Returns all the Org Check keys in cache
        * @return All the keys of the Org Check cache for the given section
        */
        function private_get_keys() {
            const prefix = private_generate_prefix();
            let keys_to_remove = [];
            for (let i = 0; i < CACHE_SYSTEM.length; i++) {
                const key = CACHE_SYSTEM.key(i);
                if (key && key.startsWith(prefix)) {
                    keys_to_remove.push(key.substr(prefix.length));
                }
            }
            return keys_to_remove;
        }

        /**
        * Private method to get an item from the cache
        * @param key in cache (without the prefix) to use
        * @return the value in cache (undefined if not found)
        */
        function private_get_item(key) {
            const k = private_generate_prefix() + key;
            const value = CACHE_SYSTEM.getItem(k);
            if (value) {
                let jsonValue = JSON.parse(value);
                if (jsonValue[VERSION_KEY] !== OrgCheck.version) {
                    CACHE_SYSTEM.removeItem(k);
                    return;
                }
                return jsonValue;
            }
            return;
        }

        /**
        * Private method to set an item into the cache
        * @param key in cache (without the prefix) to use
        * @param value of the item to store in cache
        */
        function private_set_item(key, value) {
            if (!value) return;
            try {
                value[TIMESTAMP_KEY] = Date.now();
                value[VERSION_KEY] = OrgCheck.version;
                CACHE_SYSTEM.setItem(
                    private_generate_prefix() + key,
                    JSON.stringify(value)
                );
            } catch (e) {
                throw Error("Failed to write in cache");
            } finally {
                // Make sure to delete the timestamp even after error
                delete value[TIMESTAMP_KEY];
                delete value[VERSION_KEY];
            }
        }

        /**
        * Private method to clear one Org Check cached item
        * @param key in cache (without the prefix) to use
        * @return the previous value that has been deleted
        */
        function private_delete_item(key) {
            return CACHE_SYSTEM.removeItem(private_generate_prefix() + key);
        }
    }
}/**
 * Data Types module
 */
 OrgCheck.DataTypes = {

    /**
     * String sub-module
     */
     String: {
        
        /**
        * String handler
        */
        Handler: function() {

            /**
             * Return an HTML-safer version of the given string value
             * @param unsafe String to be escaped (no change if null or not a string type)
             */
             this.htmlSecurise = (unsafe) => {
                if (unsafe === undefined || Number.isNaN(unsafe) || unsafe === null) return '';
                if (typeof(unsafe) !== 'string') return unsafe;
                return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            };

            this.format = (label, ...params) => {
                if (label) return label.replace(/{(\d+)}/g, (m, n) => { const v = params[n]; return (v || v === 0) ? v : m; });
                return '';
            };

            this.percentage = (v) => {
                if (v) {
                    const vv = Number.parseFloat(v);
                    if (!Number.isNaN(vv)) return (vv*100).toFixed(2) + ' %';
                }
                if (v === 0) return '0 %';
                return '';
            };

            this.shrink = (value, size=150, appendStr='...') => {
                if (value && value.length > size) {
                    return value.substr(0, size) + appendStr;
                }
                return value;
            };
        }
    },

    /**
     * Date and Datetime sub-module
     */
    Date: {

        /**
        * Date handler
        * @param configuration Object must contain 'defaultLanguage', 'defaultDateFormat' and 'defaultDatetimeFormat'
        */
        Handler: function(configuration) {

            /**
            * Returns the string representation of a given date using the user's preferences
            * @param value to format (number if a timestamp, string otherwise)
            */
            this.dateFormat = (value) => {
                return private_date_format(value, OrgCheck.externalLibs.salesforce.usercontext?.dateFormat,
                    configuration.defaultDateFormat
                );
            };

            /**
            * Returns the string representation of a given datetime using the user's preferences
            * @param value to format (number if a timestamp, string otherwise)
            */
            this.datetimeFormat = (value) => {
                return private_date_format(value, OrgCheck.externalLibs.salesforce.usercontext?.dateTimeFormat,
                    configuration.defaultDatetimeFormat
                );
            };

            /**
            * Private method to format data/time into a string representation
            * @param value to format (number if a timestamp, string otherwise)
            * @param format to use
            * @param formatIfNull to use if the previous parameter was null or empty
            */
            const private_date_format = (value, format, formatIfNull) => {
                if (value) {
                    const timestamp = typeof value === "number" ? value : Date.parse(value);
                    return OrgCheck.externalLibs.salesforce.dateutil?.formatDate(new Date(timestamp), format ? format : formatIfNull);
                }
                return '';
            }
        },

    },

    /**
     * Collection sub-module
     */
    Collection: {

        /**
         * Manage a "map" in this context which is an object containing
         * Salesforce IDs as properties plus an extra property called
         * "size" which is the number of Salesforce IDs contained in the
         * object.
         * @param configuration Object must contain 'keySize' and 'keyExcludePrefix'
         */
        MapHandler: function (configuration) {

            /**
             * @param key 
             * @return if that key is functional (not technical)
             */
            const private_is_safe_key = (key) => {
                return (key && key !== configuration.keySize 
                    && !key.startsWith(configuration.keyExcludePrefix));
            }

            /**
             * @param map
             * @return List all functional keys 
             */
            const private_get_safe_keys = (map) => {
                if (map) return Object.keys(map).filter(k => private_is_safe_key(k));
                return [];
            };

            /**
             * Creates a new Map
             * @return the new map instance
             */
            this.newMap = () => {
                const map = new Map();
                map[configuration.keySize] = 0;
                return map;
            }

            /**
             * @return the value for the key of the map (only if the key is safe)
             */
            this.getValue = (map, key) => {
                if (private_is_safe_key(key)) return map[key];
            };

            /**
             * Retrieve the value for the key of the map (only if the key is safe)
             * @param map
             * @param key 
             * @param value 
             */
             this.setValue = (map, key, value) => {
                if (private_is_safe_key(key)) {
                    if (Object.prototype.hasOwnProperty.call(map, key) === false) map[configuration.keySize]++;
                    map[key] = value;
                }
            };

            /**
             * Iterative function for each key of the given map
             * @param map
             * @param fn function to call for each key
             */
            this.forEach = (map, fn) => {
                private_get_safe_keys(map).forEach(k => fn(k));
            };

            /**
             * @param map
             * @return the size of the map
             */
            this.size = (map) => {
                return map[configuration.keySize];
            };

            /**
             * Returns the keys of the map (excluding the technical ones!)
             * @param map
             */
            this.keys = (map) => {
                return private_get_safe_keys(map);
            };
        },

        /**
        * Array handler
        */
        ArrayHandler: function () {
            /**
            * Concatenate two arrays
            * @param array1 First array (will not be modified)
            * @param array2 Second array (will not be modified)
            * @param prop Optionnal property to use in the arrays
            * @return A new array containing uniq items from array1 and array2
            */
            this.concat = (array1, array2, prop) => {
                if (prop) {
                    let new_array = [];
                    let array2_keys = [];
                    if (array2) for (let i = 0; i < array2.length; i++) {
                        const item2 = array2[i];
                        array2_keys.push(item2[prop]);
                        new_array.push(item2);
                    }
                    if (array1) for (let i = 0; i < array1.length; i++) {
                        const item1 = array1[i];
                        const key1 = item1[prop];
                        if (array2_keys.indexOf(key1) < 0) {
                            new_array.push(item1);
                        }
                    }
                    return new_array;
                } else {
                    let uniq_items_to_add;
                    if (array1) {
                        uniq_items_to_add = array1.filter((item) => array2.indexOf(item) < 0);
                    } else {
                        uniq_items_to_add = [];
                    }
                    if (array2) {
                        return array2.concat(uniq_items_to_add);
                    } else {
                        return uniq_items_to_add;
                    }
                }
            }
        }
    }
}/**
 * Datasets module
 */
OrgCheck.Datasets = {

    /**
     * Dataset representation
     * @param setup JSON configuration including:
     *              <ol>
     *                <li><code>name</code>: Technical name of this dataset (used in controller)</li>
     *                <li><code>keyCache</code>: Key used when caching the data in localStorage</li>
     *                <li><code>isCachable</code>: Should we cache the data or not?</li>
     *                <li><code>retriever</code>: Retreiver function with success and error callback methods</li>
     *              </ol>
     */
    Dataset: function(setup) {
        const THAT = this;
        this.getName = () => { return setup.name };
        this.getKeyCache = () => { return setup.keyCache };
        this.isCachable = () => { return setup.isCachable === true };
        this.getRetriever = () => { return (s, e) => { setup.retriever(THAT, s, e) } };
    },

    /**
     * Datasets collection representation
     */
    Collection: function() {

        /**
         * This is a collection of datasets
         */
        const private_datasets_collection = {};

        /**
         * Add a dataset in the internal list
         * @param dataset Object of type OrgCheck.Datasets.Dataset
         */
        this.addDataset = (dataset) => {
            private_datasets_collection[dataset.getName()] = dataset;
        };

        /**
         * Is this dataset name part of the list?
         * @param name of the dataset
         * @return true or false
         */
        this.hasDataset = (name) => {
            return Object.prototype.hasOwnProperty.call(private_datasets_collection, name);
        };

        /**
         * Return the dataset item
         * @param name of the dataset
         * @return the dataset item
         */
        this.getDataset = (name) => {
            return private_datasets_collection[name];
        };

    },

    /**
     * @param handlers Map of handlers to use inside this handler:
     *                 <ol>
     *                   <li><code>SalesforceHandler</code>: Salesforce Handler</li>
     *                   <li><code>MetadataCacheHandler</code>: Metadata Cache Handler</li>
     *                   <li><code>PreferenceCacheHandler</code>: Preference Cache Handler</li>
     *                   <li><code>MapHandler</code>: Map Handler</li>
     *                   <li><code>ArrayHandler</code>: Array Handler</li>
     *                   <li><code>DateHandler</code>: Date Handler</li>
     *                 </ol>
     */
    Handler: function(handlers) {

        /**
         * Salesforce handler that will let us do queries etc...
         */
         const SALESFORCE_HANDLER = handlers.SalesforceHandler;
        
        /**
         * Metadata Cache handler to use for perfomance
         */
        const METADATA_CACHE_HANDLER = handlers.MetadataCacheHandler;
    
        /**
         * Preference Cache handler to use for perfomance (unused)
         */
        //const PREFERENCE_CACHE_HANDLER = handlers.PreferenceCacheHandler;

         /**
         * Map handler for output data
         */
        const MAP_HANDLER = handlers.MapHandler;

        /**
         * Array handler
         */
        const ARRAY_HANDLER = handlers.ArrayHandler;

        /**
         * Date handler
         */
        const DATE_HANDLER = handlers.DateHandler;

         /**
         * collections of datasets
         */
        const private_datasets = new OrgCheck.Datasets.Collection();

        /**
         * Is the collection has a given dataset?
         * @param name of the dataset
         * @return true or false
         */
        this.hasDataset = (name) => {
            return private_datasets.hasDataset(name);
        };

        /**
         * Return the dataset item
         * @param name of the dataset
         * @return the dataset item
         */
        this.getDataset = (name) => {
            return private_datasets.getDataset(name);
        };

        /**
         * Run a list of datasets given their names
         * @param datasets Array of string representing the datasets you wan to run
         * @param dependencies Flag to say if you want us to calculate the dependencies for the ids retrieved from datasets
         * @param decorators List of decorators:
         *                 <ol>
         *                   <li><code>startDatasetDecorator</code>: Starting decorator for a given dataset name</li>
         *                   <li><code>successDatasetDecorator</code>: Success decorator for a given dataset name</li>
         *                   <li><code>errorDatasetDecorator</code>: Error decorator for a given dataset name</li>
         *                   <li><code>startMappingDecorator</code>: Starting decorator for the mapping phase</li>
         *                   <li><code>successMappingDecorator</code>: Success decorator for mapping phase</li>
         *                   <li><code>errorMappingDecorator</code>: Error decorator for mapping phase</li>
         *                   <li><code>startDependenciesDecorator</code>: Starting decorator for dependencies phase</li>
         *                   <li><code>successDependenciesDecorator</code>: Success decorator for dependencies phase</li>
         *                   <li><code>errorDependenciesDecorator</code>: Error decorator for dependencies phase</li>
         *                   <li><code>successFinalDecorator</code>: Final end decorator</li>
         *                   <li><code>errorFinalDecorator</code>: Final error decorator</li>
         *                 </ol>
         * @return a list of promises
         */
        this.runDatasets = (datasets, dependencies, decorators) => {
            const onLoadPromises = [];
            datasets.forEach(ds => {
                decorators.startDatasetDecorator(ds);
                const dataset = private_datasets.getDataset(ds);
                onLoadPromises.push(new Promise((s, e) => { 
                    try {
                        if (dataset.isCachable() === true) {
                            const data = METADATA_CACHE_HANDLER.getItem(dataset.getKeyCache());
                            if (data) { decorators.successDatasetDecorator(ds); s(data); return; }
                        }
                        dataset.getRetriever()(
                            (data) => { 
                                decorators.successDatasetDecorator(ds); 
                                if (dataset.isCachable() === true) {
                                    METADATA_CACHE_HANDLER.setItem(dataset.getKeyCache(), data);
                                }
                                s(data); 
                            }, 
                            (error) => { decorators.errorDatasetDecorator(ds, error); e(error); }
                        );
                    } catch (error) { decorators.errorDatasetDecorator(ds, error); e(error); } 
                }));
            });
            Promise.all(onLoadPromises)
                .then((results) => {
                    decorators.startMappingDecorator();
                    const map = MAP_HANDLER.newMap();
                    let keys = [];
                    results.forEach((result, index) => {
                        MAP_HANDLER.setValue(map, datasets[index], result);
                        keys = ARRAY_HANDLER.concat(keys, MAP_HANDLER.keys(result));
                    });
                    decorators.successMappingDecorator();
                    return { m: map, k: keys };
                })
                .catch((error) => {
                    decorators.errorMappingDecorator(error);
                    decorators.errorFinalDecorator(error);
                })
                .then((data) => {
                    if (data) {
                        if (dependencies === true) {
                            decorators.startDependenciesDecorator();
                            SALESFORCE_HANDLER.dependencyApi(
                                data.k,
                                (dep) => {
                                    decorators.successDependenciesDecorator();
                                    data.m['dependencies'] = dep || {};
                                    decorators.successFinalDecorator(data.m);
                                },
                                (error) => {
                                    decorators.errorDependenciesDecorator(error);
                                    decorators.errorFinalDecorator(error);
                                }
                            );
                        } else {
                            decorators.successFinalDecorator(data.m);
                        }
                    }
                })
                .catch((error) => { decorators.errorFinalDecorator(error); });
        }

        /**
         * ======================================================================
         * Add the Packages dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'packages', 
            isCachable: true, 
            keyCache: 'Packages', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        tooling: true,
                        string: 'SELECT Id, SubscriberPackage.NamespacePrefix, SubscriberPackage.Name '+
                                'FROM InstalledSubscriberPackage ' 
                    }, { 
                        string: 'SELECT NamespacePrefix '+
                                'FROM Organization '
                    }])
                    .on('record', (r, i) => {
                        const item = {};
                        switch (i) {
                            case 0: { // InstalledSubscriberPackage records
                                item.id = r.Id;
                                item.name = r.SubscriberPackage.Name;
                                item.namespace = r.SubscriberPackage.NamespacePrefix;
                                item.type = 'Installed';
                                break;
                            }
                            case 1: { // Organization record (it should be only one!)
                                item.id = r.NamespacePrefix;
                                item.name = r.NamespacePrefix;
                                item.namespace = r.NamespacePrefix;
                                item.type = 'Local';
                                break;
                            }
                        }
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add Objects dataset
         * ======================================================================
         */
        private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'objects', 
            isCachable: true, 
            keyCache: 'Objects', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.describeGlobal()
                    .on('record', (r) => {
                        if (!r.keyPrefix) return;
                        const item = {
                            id: r.name,
                            label: r.label,
                            developerName: r.name,
                            package: SALESFORCE_HANDLER.splitDeveloperName(r.name).package,
                            isStandardObject: (r.custom === false),
                            isCustomSetting: (r.customSetting === true),
                            isCustomObject: (r.name.endsWith('__c')),
                            isExternalObject: (r.name.endsWith('__x')),
                            isCustomMetadataType: (r.name.endsWith('__mdt')),
                            isPlatformEvent: (r.name.endsWith('__e')),
                            isBigObject: (r.name.endsWith('__b')),
                            isKnowledgeArticle: (r.name.endsWith('__ka'))
                        }
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('error', (error) => reject(error))
                    .on('end', () => resolve(records))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add Org Wide Defaults dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'orgWideDefaults', 
            isCachable: true, 
            keyCache: 'OrgWideDefaults', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                // We have some issue calling the Bulk API with jsforce
                // As EntityDefinition does not accept querMore, we will trick the system
                SALESFORCE_HANDLER.query([{ string: 'SELECT COUNT() FROM EntityDefinition'}])
                    .on('error', (error) => reject(error))
                    .on('size', (nbEntities) => {
                        const BATCH_SIZE = 200;
                        const NUM_LOOP = nbEntities/BATCH_SIZE;
                        const entityDefQueries = [];
                        for (let i=0; i<NUM_LOOP; i++) {
                            entityDefQueries.push({
                                string: 'SELECT DurableId, QualifiedApiName, MasterLabel, ExternalSharingModel, InternalSharingModel, '+
                                            'NamespacePrefix '+
                                        'FROM EntityDefinition '+
                                        'WHERE IsCustomSetting = false '+
                                        'AND IsApexTriggerable = true '+
                                        'AND IsCompactLayoutable = true '+
                                        'LIMIT ' + BATCH_SIZE + ' '+
                                        'OFFSET ' + (BATCH_SIZE*i)
                            });
                        }
                        SALESFORCE_HANDLER.query(entityDefQueries)
                            .on('record', (r) => {
                                const item = { 
                                    id: r.DurableId,
                                    name: r.QualifiedApiName,
                                    label: r.MasterLabel,
                                    package: r.NamespacePrefix,
                                    external: r.ExternalSharingModel,
                                    internal: r.InternalSharingModel
                                }
                                MAP_HANDLER.setValue(records, item.id, item);
                            })
                            .on('error', (error) => reject(error))
                            .on('end', () => resolve(records))
                            .run();
                    })
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Custom Fields dataset
         * ======================================================================
         */
        private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'customFields', 
            isCachable: true, 
            keyCache: 'CustomFields', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        string: 'SELECT Id, EntityDefinition.QualifiedApiName, EntityDefinitionId, '+
                                    'DeveloperName, NamespacePrefix, Description, CreatedDate, '+
                                    'LastModifiedDate '+
                                'FROM CustomField '+
                                'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') ', 
                        tooling: true 
                    }])
                    .on('record', (r) => {
                        if (!r.EntityDefinition) return;
                        const item = { 
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            objectId: SALESFORCE_HANDLER.salesforceIdFormat(r.EntityDefinitionId),
                            objectDeveloperName: r.EntityDefinition?.QualifiedApiName,
                            fieldName: r.DeveloperName,
                            developerName: r.DeveloperName,
                            package: r.NamespacePrefix,
                            fullName: r.DeveloperName,
                            description: r.Description,
                            createdDate: r.CreatedDate, 
                            lastModifiedDate: r.LastModifiedDate
                        };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Active Users dataset
         * ======================================================================
         */
        private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'users', 
            isCachable: true, 
            keyCache: 'Users', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        string: 'SELECT Id, Name, SmallPhotoUrl, Profile.Id, Profile.Name, '+
                                    'LastLoginDate, LastPasswordChangeDate, NumberOfFailedLogins, '+
                                    'UserPreferencesLightningExperiencePreferred, '+
                                    '(SELECT PermissionSet.Id, PermissionSet.Name, '+
                                        'PermissionSet.PermissionsApiEnabled, '+
                                        'PermissionSet.PermissionsViewSetup, '+
                                        'PermissionSet.PermissionsModifyAllData, '+
                                        'PermissionSet.PermissionsViewAllData, '+
                                        'PermissionSet.IsOwnedByProfile '+
                                        'FROM PermissionSetAssignments '+
                                        'ORDER BY PermissionSet.Name) '+
                                'FROM User '+
                                'WHERE Profile.Id != NULL ' + // we do not want the Automated Process users!
                                'AND IsActive = true ', // we only want active users
                    }])
                    .on('record', (r) => {
                        let item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            name: r.Name,
                            photourl: r.SmallPhotoUrl,
                            lastLogin: DATE_HANDLER.datetimeFormat(r.LastLoginDate),
                            neverLogged: (!r.LastLoginDate ? true : false),
                            numberFailedLogins: r.NumberOfFailedLogins,
                            lastPasswordChange: DATE_HANDLER.datetimeFormat(r.LastPasswordChangeDate),
                            onLightningExperience: r.UserPreferencesLightningExperiencePreferred,
                            profile: {
                                id: SALESFORCE_HANDLER.salesforceIdFormat(r.Profile.Id),
                                name: r.Profile.Name
                            },
                            permissionSets: [],
                            permissions: {
                                apiEnabled: false,
                                viewSetup: false,
                                modifyAllData: false,
                                viewAllData: false
                            }
                        };
                        if (r.PermissionSetAssignments && r.PermissionSetAssignments.records) {
                            for (let i=0; i<r.PermissionSetAssignments.records.length; i++) {
                                let assignment = r.PermissionSetAssignments.records[i];
                                if (assignment.PermissionSet.PermissionsApiEnabled === true) item.permissions.apiEnabled = true;
                                if (assignment.PermissionSet.PermissionsViewSetup === true) item.permissions.viewSetup = true;
                                if (assignment.PermissionSet.PermissionsModifyAllData === true) item.permissions.modifyAllData = true;
                                if (assignment.PermissionSet.PermissionsViewAllData === true) item.permissions.viewAllData = true;
                                if (assignment.PermissionSet.IsOwnedByProfile == false) {
                                    item.permissionSets.push({
                                        id: SALESFORCE_HANDLER.salesforceIdFormat(assignment.PermissionSet.Id),
                                        name: assignment.PermissionSet.Name
                                    });
                                }
                            }
                        }
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));
        
        /**
         * ======================================================================
         * Add the Profiles dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'profiles', 
            isCachable: true, 
            keyCache: 'Profiles', 
            retriever: (me, resolve, reject) => {
                const profileIds = [];
                const profiles = {};
                SALESFORCE_HANDLER.query([{
                        string: 'SELECT Id, ProfileId, Profile.UserType, NamespacePrefix, '+
                                    '(SELECT Id FROM Assignments WHERE Assignee.IsActive = TRUE LIMIT 51) '+
                                'FROM PermissionSet '+ // oh yes we are not mistaken!
                                'WHERE isOwnedByProfile = TRUE'
                    }])
                    .on('record', (r) => {
                        const profileId = SALESFORCE_HANDLER.salesforceIdFormat(r.ProfileId);
                        profileIds.push(profileId);
                        r.Id = SALESFORCE_HANDLER.salesforceIdFormat(r.Id);
                        profiles[profileId] = r;
                    })
                    .on('end', () => {
                        const records = MAP_HANDLER.newMap();
                        SALESFORCE_HANDLER.readMetadataAtScale('Profile', profileIds, [ 'UNKNOWN_EXCEPTION' ])
                            .on('record', (r) => {
                                const profileId = SALESFORCE_HANDLER.salesforceIdFormat(r.Id);
                                const profileSoql = profiles[profileId];
                                if (!profileSoql) return;
                                const memberCounts = (profileSoql.Assignments && profileSoql.Assignments.records) ? profileSoql.Assignments.records.length : 0;
                                const item = {
                                    id: profileId,
                                    name: r.Name,
                                    apiName: decodeURIComponent(r.FullName), // potentially URL encoded
                                    permissionSetId: profileSoql.Id,
                                    loginIpRanges: r.Metadata.loginIpRanges,
                                    description: r.Description,
                                    license: r.Metadata.userLicense,
                                    userType: profileSoql.Profile.UserType,
                                    isCustom: r.Metadata.custom,
                                    isUnusedCustom: r.Metadata.custom && memberCounts == 0,
                                    isUndescribedCustom: r.Metadata.custom && !r.Description,
                                    package: profileSoql.NamespacePrefix,
                                    membersCount: memberCounts,
                                    hasMembers: memberCounts > 0,
                                    createdDate: r.CreatedDate, 
                                    lastModifiedDate: r.LastModifiedDate
                                }
                                if (r.Metadata.loginHours) {
                                    const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
                                    days.forEach(d => {
                                        const c1 = r.Metadata.loginHours[d + 'Start'];
                                        const c2 = r.Metadata.loginHours[d + 'End'];
                                        if (!item.loginHours) item.loginHours = {};
                                        item.loginHours[d] = {
                                            from: (('0' + Math.floor(c1 / 60)).slice(-2) + ':' + ('0' + (c1 % 60)).slice(-2)),
                                            to:   (('0' + Math.floor(c2 / 60)).slice(-2) + ':' + ('0' + (c2 % 60)).slice(-2))
                                        };
                                    });
                                }
                                MAP_HANDLER.setValue(records, item.id, item);
                            })
                            .on('end', () => resolve(records))
                            .on('error', (error) => reject(error))
                            .run();
                    })
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Permission Sets dataset
         * ======================================================================
         */
        private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'permissionSets', 
            isCachable: true, 
            keyCache: 'PermissionSets', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                const psgByName1 = {};
                const psgByName2 = {};
                const pSetIds = [];
                SALESFORCE_HANDLER.query([{
                        string: 'SELECT Id, Name, Description, IsCustom, License.Name, NamespacePrefix, Type, '+
                                    'CreatedDate, LastModifiedDate, '+
                                    '(SELECT Id FROM Assignments WHERE Assignee.IsActive = TRUE LIMIT 1), '+ // just to see if used
                                    '(SELECT Id FROM FieldPerms LIMIT 51), '+
                                    '(SELECT Id FROM ObjectPerms LIMIT 51)'+
                                'FROM PermissionSet '+
                                'WHERE IsOwnedByProfile = FALSE' 
                    }, {
                        byPasses: [ 'INVALID_TYPE' ],
                        string: 'SELECT Id, DeveloperName, Description, NamespacePrefix, Status, '+
                                    'CreatedDate, LastModifiedDate '+
                                'FROM PermissionSetGroup ' 
                    }])
                    .on('record', (r, i) => {
                        switch (i) {
                            case 0: { // PermissionSet records
                                const hasMembers = (r.Assignments && r.Assignments.records) ? r.Assignments.records.length > 0 : false;
                                const item = {
                                    id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                                    name: r.Name,
                                    apiName: (r.NamespacePrefix ? (r.NamespacePrefix + '__') : '') + r.Name,
                                    description: r.Description,
                                    hasLicense: (r.License ? 'yes' : 'no'),
                                    license: (r.License ? r.License.Name : ''),
                                    isCustom: r.IsCustom,
                                    isUndescribedCustom: r.IsCustom && !r.Description,
                                    package: r.NamespacePrefix,
                                    isUnusedCustom: r.IsCustom && !hasMembers,
                                    hasMembers: hasMembers,
                                    isGroup: (r.Type === 'Group'),     // other values can be 'Regular', 'Standard', 'Session
                                    createdDate: r.CreatedDate, 
                                    lastModifiedDate: r.LastModifiedDate,
                                    nbFieldPermissions: r.FieldPerms?.records.length || 0,
                                    nbObjectPermissions: r.ObjectPerms?.records.length || 0
                                };
                                if (item.isGroup === true) psgByName1[item.package+'--'+item.name] = item;
                                pSetIds.push(item.id);
                                MAP_HANDLER.setValue(records, item.id, item);
                                break;
                            }
                            default: { // PermissionSetGroup records
                                const item = {
                                    id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                                    name: r.DeveloperName,
                                    description: r.Description,
                                    package: r.NamespacePrefix,
                                    createdDate: r.CreatedDate, 
                                    lastModifiedDate: r.LastModifiedDate
                                }
                                psgByName2[item.package+'--'+item.name] = item;
                                break;
                            }
                        }
                    })
                    .on('end', () => {
                        for (const [key, value] of Object.entries(psgByName1)) if (psgByName2[key]) {
                            value.groupId = psgByName2[key].id;
                            value.description = psgByName2[key].description;
                            value.isUndescribedCustom = value.isCustom && !value.description;
                            MAP_HANDLER.setValue(records, value.id, value);
                        }
                        resolve(records);
                    })
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Permission Set Assignments dataset
         * ======================================================================
         */
        private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'permissionSetAssignments', 
            isCachable: true, 
            keyCache: 'PermissionSetAssignments', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        string: 'SELECT Id, AssigneeId, Assignee.ProfileId, PermissionSetId '+
                                'FROM PermissionSetAssignment '+
                                'WHERE Assignee.IsActive = TRUE '+
                                'AND PermissionSet.IsOwnedByProfile = FALSE '
                    }])
                    .on('record', (r) => {
                        const item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            assigneeId: SALESFORCE_HANDLER.salesforceIdFormat(r.AssigneeId),
                            assigneeProfileId: SALESFORCE_HANDLER.salesforceIdFormat(r.Assignee.ProfileId),
                            permissionSetId: SALESFORCE_HANDLER.salesforceIdFormat(r.PermissionSetId)
                        };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Settings dataset
         * ======================================================================
         */
        private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'settings', 
            isCachable: true, 
            keyCache: 'Settings', 
            retriever: (me, resolve, reject) => {
                SALESFORCE_HANDLER.readMetadata([ { type: 'SecuritySettings', members: [ 'Security' ] } ])
                    .on('end', (response) => {
                        const securitySettings = response['SecuritySettings'];
                        const records = MAP_HANDLER.newMap();
                        if (securitySettings && securitySettings.length == 1) {
                            const security = securitySettings[0];
                            const spp = security.passwordPolicies;
                            // see https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_securitysettings.htm
                            switch (spp.complexity) {
                                case 'NoRestriction': spp.complexity = 0; break;
                                case 'AlphaNumeric': spp.complexity = 1; break;
                                case 'SpecialCharacters': spp.complexity = 2; break;
                                case 'UpperLowerCaseNumeric': spp.complexity = 3; break;
                                case 'UpperLowerCaseNumericSpecialCharacters': spp.complexity = 4; break;
                                case 'Any3UpperLowerCaseNumericSpecialCharacters': spp.complexity = 5; break;
                                default: spp.complexity = undefined;
                            }
                            switch (spp.expiration) {
                                case 'Never': spp.expiration = 0; break;
                                case 'ThirtyDays': spp.expiration = 30; break;
                                case 'SixtyDays': spp.expiration = 60; break;
                                case 'NinetyDays': spp.expiration = 90; break;
                                case 'SixMonths': spp.expiration = 180; break;
                                case 'OneYear': spp.expiration = 365; break;
                                default: spp.expiration = undefined;
                            }
                            switch (spp.lockoutInterval) {
                                case 'FifteenMinutes': spp.lockoutInterval = 15; break;
                                case 'ThirtyMinutes': spp.lockoutInterval = 30; break;
                                case 'SixtyMinutes': spp.lockoutInterval = 60; break;
                                case 'Forever': spp.lockoutInterval = 0; break;
                                default: spp.lockoutInterval = undefined;
                            }
                            switch (spp.maxLoginAttempts) {
                                case 'NoLimit': spp.maxLoginAttempts = 0; break;
                                case 'ThreeAttempts': spp.maxLoginAttempts = 3; break;
                                case 'FiveAttempts': spp.maxLoginAttempts = 5; break;
                                case 'TenAttempts': spp.maxLoginAttempts = 10; break;
                                default: spp.maxLoginAttempts = undefined;
                            }
                            switch (spp.questionRestriction) {
                                case 'None': spp.questionRestriction = 0; break;
                                case 'DoesNotContainPassword': spp.questionRestriction = 1; break;
                                default: spp.questionRestriction = undefined;
                            }
                            MAP_HANDLER.setValue(records, 'security', security);
                        }
                        resolve(records);
                    })
                    .on('error', (err) => reject(err))
                    .run();
            }
        }));
        
        /**
         * ======================================================================
         * Add the Profile Password Policy dataset
         * ======================================================================
         */
        private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'profilePasswordPolicies', 
            isCachable: true, 
            keyCache: 'ProfilePasswordPolicies', 
            retriever: (me, resolve, reject) => {
                SALESFORCE_HANDLER.readMetadata([ { type: 'ProfilePasswordPolicy', members: [ '*' ] } ])
                    .on('end', (response) => {
                        const policies = response['ProfilePasswordPolicy'];
                        const records = MAP_HANDLER.newMap();
                        if (policies) {
                            policies.forEach(r => {
                                if (typeof r.profile !== 'string') {
                                    // Metadata could return profile pwd policy for deleted profile
                                    // In this case, r.profile will be equal to { $: {xsi:nil: 'true'} }
                                    // And we expect r.profile to be the name of the profile so....
                                    return;
                                }
                                const item = {
                                    forgotPasswordRedirect: (r.forgotPasswordRedirect === 'true'),
                                    lockoutInterval: parseInt(r.lockoutInterval),
                                    maxLoginAttempts: parseInt(r.maxLoginAttempts),
                                    minimumPasswordLength: parseInt(r.minimumPasswordLength),
                                    minimumPasswordLifetime: (r.minimumPasswordLifetime === 'true'),
                                    obscure: (r.obscure === 'true'),
                                    passwordComplexity: parseInt(r.passwordComplexity),
                                    passwordExpiration: parseInt(r.passwordExpiration),
                                    passwordHistory: parseInt(r.passwordHistory),
                                    passwordQuestion: (r.passwordQuestion === 'true'),
                                    name: r.profile
                                }
                                MAP_HANDLER.setValue(records, item.name, item);
                            });
                        }
                        resolve(records);
                    })
                    .on('error', (err) => reject(err))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Role dataset
         * ======================================================================
         */
        private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'roles', 
            isCachable: true, 
            keyCache: 'Roles', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                const ROOT_ID = '###root###';
                SALESFORCE_HANDLER.query([{ 
                        string:  'SELECT Id, DeveloperName, Name, ParentRoleId, PortalType, '+
                                    '(SELECT Id, Name, Username, Email, Phone, '+
                                        'SmallPhotoUrl, IsActive FROM Users)'+
                                ' FROM UserRole '
                    }])
                    .on('record', (r) => {
                        const item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            name: r.Name,
                            developerName: r.DeveloperName,
                            parentId: r.ParentRoleId ? SALESFORCE_HANDLER.salesforceIdFormat(r.ParentRoleId) : ROOT_ID,
                            hasParent: r.ParentRoleId ? true : false,
                            activeMembersCount: 0,
                            activeMembers: [],
                            hasActiveMembers: false,
                            inactiveMembersCount: 0,
                            hasInactiveMembers: false,
                            isExternal: (r.PortalType !== 'None') ? true : false
                        };
                        if (r.Users && r.Users.records) for (let i=0; i<r.Users.records.length; i++) {
                            let user = r.Users.records[i];
                            if (user.IsActive) {
                                item.activeMembers.push({
                                    id: SALESFORCE_HANDLER.salesforceIdFormat(user.Id),
                                    name: user.Name,
                                    username: user.Username,
                                    email: user.Email,
                                    telephone: user.Phone,
                                    photourl: user.SmallPhotoUrl,
                                    isActive: user.IsActive
                                });
                            } else {
                                item.inactiveMembersCount++;
                            }
                        }
                        item.activeMembersCount = item.activeMembers.length;
                        item.hasActiveMembers = item.activeMembers.length > 0;
                        item.hasInactiveMembers = item.inactiveMembersCount > 0;
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => {
                        records[ROOT_ID] = {
                            id: ROOT_ID,
                            name: 'Role Hierarchy',
                            developerName: ROOT_ID,
                            parentId: null
                        };
                        resolve(records);
                    })
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Public Groups dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'publicGroups', 
            isCachable: true, 
            keyCache: 'PublicGroups', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        string: 'SELECT Id, Name, DeveloperName, DoesIncludeBosses, Type, RelatedId, Related.Name, '+
                                    '(SELECT UserOrGroupId From GroupMembers)'+
                                'FROM Group' 
                    }])
                    .on('record', (r) => {
                        const item = { id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id) };
                        switch (r.Type) {
                            case 'Regular':              item.type = 'publicGroup'; break;
                            case 'Role':                 item.type = 'role';        break;
                            case 'Queue':                item.type = 'queue';       break;
                            case 'RoleAndSubordinates':  item.type = 'roleAndSub';  break;
                            // case 'AllCustomerPortal':
                            // case 'Organization':
                            // case 'PRMOrganization':
                            default: item.type = 'technical';
                        }
                        if (item.type === 'role' || item.type === 'roleAndSub') {
                            item.relatedId = SALESFORCE_HANDLER.salesforceIdFormat(r.RelatedId);
                        } else {
                            item.developerName = r.DeveloperName;
                            item.name = r.Name;
                            item.includeBosses = r.DoesIncludeBosses;
                            item.directMembersCount = 0;
                            item.directUsers = [];
                            item.directGroups = [];                            
                        }
                        if (r.GroupMembers && r.GroupMembers.records) {
                            for (let i=0; i<r.GroupMembers.records.length; i++) {
                                item.directMembersCount++;
                                const member_id = SALESFORCE_HANDLER.salesforceIdFormat(r.GroupMembers.records[i].UserOrGroupId);
                                const member_is_a_user = member_id.startsWith('005');
                                (member_is_a_user === true ? item.directUsers : item.directGroups).push({ id: member_id });    
                            }
                        }
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Workflow Rules dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'workflows', 
            isCachable: true, 
            keyCache: 'Workflows', 
            retriever: (me, resolve, reject) => {
                const workflowRuleIds = [];
                SALESFORCE_HANDLER.query([{ 
                        string: 'SELECT Id FROM WorkflowRule', 
                        tooling: true 
                    }])
                    .on('record', (r) => workflowRuleIds.push(r.Id))
                    .on('end', () => {
                        const records = MAP_HANDLER.newMap();
                        SALESFORCE_HANDLER.readMetadataAtScale('WorkflowRule', workflowRuleIds, [ 'UNKNOWN_EXCEPTION' ])
                            .on('record', (r) => {
                                const item =  {
                                    id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                                    name: r.FullName,
                                    description: r.Metadata.description,
                                    actions: r.Metadata.actions,
                                    futureActions: r.Metadata.workflowTimeTriggers,
                                    isActive: r.Metadata.active,
                                    createdDate: r.CreatedDate,
                                    lastModifiedDate: r.LastModifiedDate,
                                    noAction: true
                                };
                                if (!item.actions) item.actions = [];
                                if (!item.futureActions) item.futureActions = [];
                                item.noAction = (item.actions.length == 0 && item.futureActions.length == 0);
                                MAP_HANDLER.setValue(records, item.id, item);
                            })
                            .on('end', () => resolve(records))
                            .on('error', (error) => reject(error))
                            .run();
                    })
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Flow dataset
         * ======================================================================
         */
        private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'flows', 
            isCachable: true, 
            keyCache: 'Flows', 
            retriever: (me, resolve, reject) => {
                const flowIds = [];
                SALESFORCE_HANDLER.query([{ 
                        string: 'SELECT Id FROM Flow', 
                        tooling: true 
                    }])
                    .on('record', (r) => flowIds.push(r.Id))
                    .on('end', () => {
                        const records = MAP_HANDLER.newMap();
                        SALESFORCE_HANDLER.readMetadataAtScale('Flow', flowIds, [ 'UNKNOWN_EXCEPTION' ])
                            .on('record', (r) => {
                                const item =  {
                                    id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                                    name: r.FullName,
                                    definitionId: SALESFORCE_HANDLER.salesforceIdFormat(r.DefinitionId),
                                    definitionName: r.MasterLabel,
                                    version: r.VersionNumber,
                                    apiVersion: r.ApiVersion,
                                    isApiVersionOld: SALESFORCE_HANDLER.isVersionOld({ apiVersion: r.ApiVersion }),
                                    dmlCreates: r.Metadata.recordCreates?.length || 0,
                                    dmlDeletes: r.Metadata.recordDeletes?.length || 0,
                                    dmlUpdates: r.Metadata.recordUpdates?.length || 0,
                                    isActive: r.Status === 'Active',
                                    description: r.Description,
                                    type: r.ProcessType,
                                    createdDate: r.CreatedDate,
                                    lastModifiedDate: r.LastModifiedDate
                                };
                                r.Metadata.processMetadataValues?.forEach(m => {
                                    if (m.name === 'ObjectType') item.sobject = m.value.stringValue;
                                    if (m.name === 'TriggerType') item.triggerType = m.value.stringValue;
                                });
                                MAP_HANDLER.setValue(records, item.id, item);
                            })
                            .on('end', () => resolve(records))
                            .on('error', (error) => reject(error))
                            .run();
                    })
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Custom Labels dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'customLabels', 
            isCachable: true, 
            keyCache: 'CustomLabels', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        string: 'SELECT Id, Name, NamespacePrefix, Category, IsProtected, Language, MasterLabel, Value '+
                                'FROM ExternalString '+
                                'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') ',
                        tooling: true
                    }])
                    .on('record', (r) => {
                        const item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            name: r.Name,
                            masterLabel: r.MasterLabel,
                            namespace: r.NamespacePrefix,
                            category: r.Category,
                            protected: r.IsProtected,
                            language: r.Language,
                            value: r.Value
                        };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Lightning Pages dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'auraPages', 
            isCachable: true, 
            keyCache: 'LightningPages', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        tooling: true, 
                        string: 'SELECT Id, MasterLabel, EntityDefinition.DeveloperName, '+
                                    'Type, NamespacePrefix, Description, ' +
                                    'CreatedDate, LastModifiedDate '+
                                'FROM FlexiPage '+
                                'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') '
                    }])
                    .on('record', (r) => {
                        const item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            name: r.MasterLabel,
                            entityName: r.EntityDefinition ? r.EntityDefinition.DeveloperName : '',
                            type: r.Type,
                            namespace: r.NamespacePrefix,
                            description: r.Description,
                            createdDate: r.CreatedDate,
                            lastModifiedDate: r.LastModifiedDate
                        };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Lightning Components dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'auraComponents', 
            isCachable: true, 
            keyCache: 'AuraComponents', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        tooling: true, 
                        string: 'SELECT Id, MasterLabel, ApiVersion, NamespacePrefix, Description, '+
                                    'CreatedDate, LastModifiedDate '+
                                'FROM AuraDefinitionBundle '+
                                'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') '
                    }])
                    .on('record', (r) => {
                        const item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            name: r.MasterLabel,
                            apiVersion: r.ApiVersion,
                            isApiVersionOld: SALESFORCE_HANDLER.isVersionOld({ apiVersion: r.ApiVersion }),
                            namespace: r.NamespacePrefix,
                            description: r.Description,
                            createdDate: r.CreatedDate,
                            lastModifiedDate: r.LastModifiedDate
                    };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Visual Force pages dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'vfPages', 
            isCachable: true, 
            keyCache: 'VisualforcePages', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        tooling: true, 
                        string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, IsAvailableInTouch, '+
                                    'CreatedDate, LastModifiedDate '+
                                'FROM ApexPage '+
                                'WHERE ManageableState = \'unmanaged\''
                    }])
                    .on('record', (r) => {
                        const item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            name: r.Name,
                            apiVersion: r.ApiVersion,
                            isApiVersionOld: SALESFORCE_HANDLER.isVersionOld({ apiVersion: r.ApiVersion }),
                            namespace: r.NamespacePrefix,
                            description: r.Description, 
                            mobile: r.IsAvailableInTouch,
                            createdDate: r.CreatedDate,
                            lastModifiedDate: r.LastModifiedDate
                    };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();                
            }
        }));

        /**
         * ======================================================================
         * Add the Visual Force components dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'vfComponents', 
            isCachable: true, 
            keyCache: 'VisualforceComponents', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        tooling: true, 
                        string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, '+
                                    'CreatedDate, LastModifiedDate '+
                                'FROM ApexComponent '+
                                'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') '
                    }])
                    .on('record', (r) => {
                        const item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            name: r.Name,
                            apiVersion: r.ApiVersion,
                            isApiVersionOld: SALESFORCE_HANDLER.isVersionOld({ apiVersion: r.ApiVersion }),
                            namespace: r.NamespacePrefix,
                            description: r.Description,
                            createdDate: r.CreatedDate,
                            lastModifiedDate: r.LastModifiedDate
                        };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();                
            }
        }));
        
        /**
         * ======================================================================
         * Add the Lightning Web Components dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'lwComponents', 
            isCachable: true, 
            keyCache: 'LightningWebComponents', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        tooling: true, 
                        string: 'SELECT Id, MasterLabel, ApiVersion, NamespacePrefix, Description, '+ 
                                    'CreatedDate, LastModifiedDate '+
                                'FROM LightningComponentBundle '+
                                'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') '
                    }])
                    .on('record', (r) => {
                        const item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            name: r.MasterLabel,
                            apiVersion: r.ApiVersion,
                            isApiVersionOld: SALESFORCE_HANDLER.isVersionOld({ apiVersion: r.ApiVersion }),
                            namespace: r.NamespacePrefix,
                            description: r.Description,
                            createdDate: r.CreatedDate,
                            lastModifiedDate: r.LastModifiedDate
                        };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();                
            }
        }));

        /**
         * ======================================================================
         * Add the Apex Classes dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'apexClasses', 
            isCachable: true, 
            keyCache: 'ApexClasses', 
            retriever: (me, resolve, reject) => {
                const relatedTestClassesMap = {};
                const classesCoverageMap = {};
                const classesMap = {};
                const schedulableMap = {};
                const REGEX_ISINTERFACE = new RegExp("(?:public|global)\\s+(?:interface)\\s+\\w+\\s*\\{", 'i');
                const REGEX_ISENUM = new RegExp("(?:public|global)\\s+(?:enum)\\s+\\w+\\s*\\{", 'i');
                const REGEX_ISTESTSEEALLDATA = new RegExp("@IsTest\\(.*SeeAllData=true.*\\)", 'i');
                const REGEX_TESTNBASSERTS = new RegExp("System.assert(?:Equals|NotEquals|)\\(", 'ig');
                SALESFORCE_HANDLER.query([{
                        string: 'SELECT ApexClassOrTriggerId, ApexTestClassId '+
                                'FROM ApexCodeCoverage',
                        tooling: true
                    }, {
                        string: 'SELECT ApexClassorTriggerId, NumLinesCovered, '+
                                    'NumLinesUncovered, Coverage '+
                                'FROM ApexCodeCoverageAggregate',
                        tooling: true
                    }, { 
                        string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, '+
                                    'Body, LengthWithoutComments, SymbolTable, '+
                                    'CreatedDate, LastModifiedDate '+
                                'FROM ApexClass '+
                                'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') ',
                        tooling: true
                    }, {
                        string: 'SELECT ApexClassId '+
                                'FROM AsyncApexJob '+
                                'WHERE JobType = \'ScheduledApex\' '
                    }])
                    .on('record', (r, i) => {
                        switch (i) {
                            case 0: { // ApexCodeCoverage records
                                const classId = SALESFORCE_HANDLER.salesforceIdFormat(r.ApexClassOrTriggerId);
                                const testClassId = SALESFORCE_HANDLER.salesforceIdFormat(r.ApexTestClassId);
                                const item = relatedTestClassesMap[classId] || new Set();
                                item.add(testClassId);
                                relatedTestClassesMap[classId] = item;
                                break;
                            }
                            case 1: { // ApexCodeCoverageAggregate records
                                const item =  {
                                    id: SALESFORCE_HANDLER.salesforceIdFormat(r.ApexClassOrTriggerId),
                                    covered: r.NumLinesCovered,
                                    uncovered: r.NumLinesUncovered,
                                    coverage: (r.NumLinesCovered / (r.NumLinesCovered + r.NumLinesUncovered))
                                };
                                classesCoverageMap[item.id] = item;
                                break; 
                            }
                            case 2: { // ApexClasses records
                                const item =  {
                                    id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                                    name: r.Name,
                                    apiVersion: r.ApiVersion,
                                    isApiVersionOld: SALESFORCE_HANDLER.isVersionOld({ apiVersion: r.ApiVersion }),
                                    namespace: r.NamespacePrefix,
                                    isTest: false,
                                    isAbstract: false,
                                    isClass: true,
                                    isEnum: false,
                                    isInterface: false,
                                    isSharingMissing: false,
                                    length: r.LengthWithoutComments,
                                    needsRecompilation: (!r.SymbolTable ? true : false),
                                    coverage: 0, // by default no coverage!
                                    createdDate: r.CreatedDate,
                                    lastModifiedDate: r.LastModifiedDate
                                };
                                if (r.Body) {
                                    item.isInterface = r.Body.match(REGEX_ISINTERFACE) !== null;
                                    item.isEnum = r.Body.match(REGEX_ISENUM) !== null;
                                    item.isClass = (item.isInterface === false && item.isEnum === false);
                                }
                                if (r.SymbolTable) {
                                    item.innerClassesCount = r.SymbolTable.innerClasses.length || 0;
                                    item.interfaces = r.SymbolTable.interfaces;
                                    item.methodsCount = r.SymbolTable.methods.length || 0;
                                    if (r.SymbolTable.tableDeclaration) {
                                        item.annotations = r.SymbolTable.tableDeclaration.annotations;
                                        if (r.SymbolTable.tableDeclaration.modifiers) {
                                            r.SymbolTable.tableDeclaration.modifiers.forEach(m => {
                                                switch (m) {
                                                    case 'with sharing':      item.specifiedSharing = 'with';      break;
                                                    case 'without sharing':   item.specifiedSharing = 'without';   break;
                                                    case 'inherited sharing': item.specifiedSharing = 'inherited'; break;
                                                    case 'public':            item.specifiedAccess  = 'public';    break;
                                                    case 'global':            item.specifiedAccess  = 'global';    break;
                                                    case 'abstract':          item.isAbstract       = true;        break;
                                                    case 'testMethod':        item.isTest           = true;        break;
                                                }
                                            });
                                        }
                                    }
                                }
                                if (item.isEnum === true || item.isInterface === true) item.specifiedSharing = 'n/a';
                                if (item.isTest === false && item.isClass === true && !item.specifiedSharing) {
                                    item.isSharingMissing = true;
                                }
                                if (item.isTest === true) {
                                    item.isTestSeeAllData = r.Body.match(REGEX_ISTESTSEEALLDATA) !== null;
                                    item.nbSystemAsserts = r.Body.match(REGEX_TESTNBASSERTS)?.length || 0;
                                }
                                classesMap[item.id] = item;
                                break;
                            }
                            default: { // AsyncApexJob records
                                schedulableMap[SALESFORCE_HANDLER.salesforceIdFormat(r.ApexClassId)] = true;
                            }
                        }
                    })
                    .on('end', () => {
                        const records = MAP_HANDLER.newMap();
                        for (const [key, value] of Object.entries(classesMap)) {
                            if (classesCoverageMap[key]) value.coverage = classesCoverageMap[key].coverage;
                            if (relatedTestClassesMap[key]) value.relatedTestClasses = Array.from(relatedTestClassesMap[key]);
                            if (schedulableMap[key]) value.isScheduled = true;
                            MAP_HANDLER.setValue(records, key, value);
                        }
                        resolve(records);
                    })
                    .on('error', (error) => reject(error))
                    .run();                
            }
        }));

        /**
         * ======================================================================
         * Add the Apex Triggers dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'apexTriggers', 
            isCachable: true, 
            keyCache: 'ApexTriggers', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        tooling: true, 
                        string: 'SELECT Id, Name, ApiVersion, Status, '+
                                    'NamespacePrefix, Body, '+
                                    'UsageBeforeInsert, UsageAfterInsert, '+
                                    'UsageBeforeUpdate, UsageAfterUpdate, '+
                                    'UsageBeforeDelete, UsageAfterDelete, '+
                                    'UsageAfterUndelete, UsageIsBulk, '+
                                    'LengthWithoutComments, '+
                                    'EntityDefinition.QualifiedApiName, '+
                                    'CreatedDate, LastModifiedDate '+
                                'FROM ApexTrigger '+
                                'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') '
                    }])
                    .on('record', (r) => {
                        if (r.EntityDefinition) {
                            const item = {
                                id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                                name: r.Name,
                                apiVersion: r.ApiVersion,
                                isApiVersionOld: SALESFORCE_HANDLER.isVersionOld({ apiVersion: r.ApiVersion }),
                                namespace: r.NamespacePrefix,
                                length: r.LengthWithoutComments,
                                isActive: (r.Status === 'Active' ? true : false),
                                beforeInsert: r.UsageBeforeInsert,
                                afterInsert: r.UsageAfterInsert,
                                beforeUpdate: r.UsageBeforeUpdate,
                                afterUpdate: r.UsageAfterUpdate,
                                beforeDelete: r.UsageBeforeDelete,
                                afterDelete: r.UsageAfterDelete,
                                afterUndelete: r.UsageAfterUndelete,
                                sobject: r.EntityDefinition.QualifiedApiName,
                                hasSOQL: false,
                                hasDML: false,
                                createdDate: r.CreatedDate,
                                lastModifiedDate: r.LastModifiedDate
                            };
                            if (r.Body) {
                                item.hasSOQL = r.Body.match("\\[\\s*(?:SELECT|FIND)") !== null; 
                                item.hasDML = r.Body.match("(?:insert|update|delete)\\s*(?:\\w+|\\(|\\[)") !== null; 
                            }
                            MAP_HANDLER.setValue(records, item.id, item);
                        }
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();                
            }
        }));

        /**
         * ======================================================================
         * Add the Reports dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'reports', 
            isCachable: true, 
            keyCache: 'Reports', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        string: 'SELECT Id, Name, NamespacePrefix, DeveloperName, FolderName, Format, Description '+
                                'FROM Report '
                    }])
                    .on('record', (r) => {
                        const item = { 
                            id: r.Id,
                            name: r.Name,
                            package: r.NamespacePrefix,
                            developerName: r.DeveloperName,
                            folder: { name: r.FolderName },
                            format: r.Format,
                            description: r.Description
                        };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();                
            }
        }));

        /**
         * ======================================================================
         * Add the Dashboards dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'dashboards', 
            isCachable: true, 
            keyCache: 'Dashboards', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        string: 'SELECT Id, Title, NamespacePrefix, DeveloperName, FolderId, FolderName, Description '+
                                'FROM Dashboard '
                    }])
                    .on('record', (r) => {
                        const item = { 
                            id: r.Id,
                            name: r.Title,
                            package: r.NamespacePrefix,
                            developerName: r.DeveloperName,
                            folder: { id: r.FolderId, name: r.FolderName },
                            description: r.Description
                        };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();                
            }
        }));

        /**
         * ======================================================================
         * Add the Batches dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'batches', 
            isCachable: true, 
            keyCache: 'Batches', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                let artificial_id = 0;
                SALESFORCE_HANDLER.query([{ 
                    string: 'SELECT JobType, ApexClass.Name, MethodName, Status, ExtendedStatus, COUNT(Id) ids, SUM(NumberOfErrors) errors '+
                            'FROM AsyncApexJob '+
                            'WHERE CreatedDate >= YESTERDAY '+
                            'AND ((Status = \'Completed\' AND ExtendedStatus <> NULL) '+
                            'OR Status = \'Failed\') '+
                            'GROUP BY JobType, ApexClass.Name, MethodName, Status, ExtendedStatus '+
                            'LIMIT 10000 '
                }, { 
                    string: 'SELECT CreatedById, CreatedDate, CronExpression, '+
                                'CronJobDetailId, CronJobDetail.JobType, CronJobDetail.Name, '+
                                'EndTime, Id, LastModifiedById, NextFireTime, OwnerId, '+
                                'PreviousFireTime, StartTime, State, TimesTriggered, '+
                                'TimeZoneSidKey '+
                            'FROM CronTrigger '+
                            'WHERE State <> \'COMPLETE\' ' +
                            'LIMIT 10000 '
                }])
                .on('record', (r, i) => {
                    const item = {};
                    switch (i) {
                        case 0: { // AsyncApexJob
                            item.id = 'APXJOBS-'+artificial_id++;
                            item.nature = 'AsyncApexJob';
                            item.type = r.JobType;
                            item.context = (r.ApexClass ? r.ApexClass.Name : 'anonymous')+(r.MethodName ? ('.'+r.MethodName) : '');
                            item.status = r.Status;
                            item.message = r.ExtendedStatus;
                            item.numIds = r.ids;
                            item.numErrors = r.errors;
                            break;
                        }
                        default: { // CronTrigger
                            let jobTypeLabel = '';
                            switch (r.CronJobDetail?.JobType) {
                                case '1': jobTypeLabel = 'Data Export'; break;
                                case '3': jobTypeLabel = 'Dashboard Refresh'; break;
                                case '4': jobTypeLabel = 'Reporting Snapshot'; break;
                                case '6': jobTypeLabel = 'Scheduled Flow'; break;
                                case '7': jobTypeLabel = 'Scheduled Apex'; break;
                                case '8': jobTypeLabel = 'Report Run'; break;
                                case '9': jobTypeLabel = 'Batch Job'; break;
                                case 'A': jobTypeLabel = 'Reporting Notification'; break;
                            }
                            item.id = 'SCHJOBS-'+artificial_id++;
                            item.name = r.CronJobDetail?.Name || '';
                            item.type = jobTypeLabel;
                            item.nature = 'ScheduledJob';
                            item.status = r.State;
                            item.userid = SALESFORCE_HANDLER.salesforceIdFormat(r.OwnerId);
                            item.start = r.StartTime; 
                            item.end = r.EndTime;
                            item.timezone = r.TimeZoneSidKey;
                            break;
                        }
                    }
                    MAP_HANDLER.setValue(records, item.id, item);
                })
                .on('end', () => resolve(records))
                .on('error', (error) => reject(error))
                .run();                
            }
        }));



     }
}/**
 * Salesforce module 
 */
OrgCheck.Salesforce = {
    
    AbstractProcess: function(connection) {
        if (connection && connection.cache) { 
            // Org Check has its own cache
            connection.cache.clear(); 
        }
        const private_events = {
            'error': (error) => { console.error(error); }
        };
        const private_error_event = private_events.error;
        this.has = (name) => Object.prototype.hasOwnProperty.call(private_events, name);
        this.fire = (name, ...args) => { 
            if (Object.prototype.hasOwnProperty.call(private_events, name)) {
                private_events[name](...args); 
            }
        };
        this.on = (name, fn) => { private_events[name] = fn; return this; };
        this.run = () => { private_error_event('Run method should be implemented!')};
    },

    SoqlProcess: function(connection, queries, returnAsMap, casesafeid) {
        OrgCheck.Salesforce.AbstractProcess.call(this, connection);
        const that = this;
        this.run = () => {
            try {
                const promises = [];
                queries.forEach((query, index) => promises.push(new Promise((resolve, reject) => {
                    const api = (query.tooling === true ? connection.tooling : connection);
                    let data = [];
                    const recursive_query = (error, result) => {
                        if (error) { 
                            if (query.byPasses && query.byPasses.includes(error['errorCode'])) {
                                resolve();
                            } else {
                                error.context = { 
                                    when: 'While creating a promise to call a SOQL query.',
                                    what: {
                                        index: index,
                                        queryMore: query.queryMore,
                                        queryString: query.string,
                                        queryUseTooling: query.tooling
                                    }
                                };
                                reject(error);
                            }
                        } else {
                            data = data.concat(result.records);
                            if (result.done === true) {
                                resolve({ records: data, totalSize: result.totalSize, key: query.key });
                            } else {
                                api.queryMore(result.nextRecordsUrl, recursive_query);
                            }
                        }
                    }
                    api.query(query.string, recursive_query);
                })));
                Promise.all(promises)
                    .then((results) => {
                        let records = (returnAsMap === true ? new Map() : []); 
                        results.forEach((result, index) => {
                            if (result && result.records) {
                                if (that.has('record')) {
                                    result.records.forEach((r) => that.fire('record', r, index));
                                }
                                if (that.has('end')) {
                                    if (returnAsMap === true) {
                                        result.records.forEach((r) => records.set(casesafeid(r[result.key]), r));
                                    } else {
                                        result.records.forEach((r) => records.push(r));
                                    }
                                }
                            }
                            that.fire('size', result?.totalSize || 0, index);
                        });
                        that.fire('end', records);
                    })
                    .catch((error) => that.fire('error', error));
            } catch (error) {
                that.fire('error', error);
            }
        }
    },

    GlobalDescribeProcess: function(connection) {
        OrgCheck.Salesforce.AbstractProcess.call(this, connection);
        const that = this;
        this.run = () => {
            try {
                connection.describeGlobal((error, result) => {
                    if (error) {
                        error.context = { 
                            when: 'While calling a global describe.',
                            what: {}
                        };
                        that.fire('error', error)
                    } else {
                        result.sobjects.forEach(s => that.fire('record', s) );
                        that.fire('end', result.sobjects);
                    }
                });
            } catch (error) {
                that.fire('error', error);
            }
        }
    },

    DescribeProcess: function(connection, secureBindingVariable, casesafeid, dapi, sobjectPackage, sobjectDevName) {
        OrgCheck.Salesforce.AbstractProcess.call(this, connection);
        const that = this;
        const sobjectDevNameNoExt = sobjectDevName.split('__')[(sobjectPackage && sobjectPackage !== '') ? 1 : 0];
        this.run = () => {
            try {
                const promises = [];
                promises.push(new Promise((resolve, reject) => {
                    // describeSObject() method is not cached (compare to describe() method))
                    connection.describeSObject(sobjectDevName, function (e, o) {
                        if (e) {
                            e.context = { 
                                when: 'While calling an sobject describe.',
                                what: {
                                    devName: sobjectDevName
                                }
                            };
                            reject(e)
                        } else {
                            resolve(o);
                        }
                    });
                }));
                promises.push(new Promise((resolve, reject) => {
                    const query = 'SELECT DurableId, Description, NamespacePrefix, ExternalSharingModel, InternalSharingModel, '+
                                        '(SELECT Id, DurableId, QualifiedApiName, Description, BusinessOwner.Name, BusinessStatus, ComplianceGroup, SecurityClassification FROM Fields), '+
                                        '(SELECT Id, Name FROM ApexTriggers), '+
                                        '(SELECT Id, MasterLabel, Description FROM FieldSets), '+
                                        '(SELECT Id, Name, LayoutType FROM Layouts), '+
                                        '(SELECT DurableId, Label, Max, Remaining, Type FROM Limits), '+
                                        '(SELECT Id, Active, Description, ErrorDisplayField, ErrorMessage, '+
                                            'ValidationName FROM ValidationRules), '+
                                        '(SELECT Id, Name FROM WebLinks) '+
                                    'FROM EntityDefinition '+
                                    'WHERE DeveloperName = '+secureBindingVariable(sobjectDevNameNoExt)+' '+
                                    (sobjectPackage !== '' ? 'AND NamespacePrefix = '+secureBindingVariable(sobjectPackage)+' ' : 'AND PublisherId IN (\'System\', \'<local>\')');
                    connection.tooling.query(query, (e, r) => {
                        if (e) {
                            e.context = { 
                                when: 'While calling an sobject describe from tooling api.',
                                what: {
                                    soqlQuery: query,
                                    package: sobjectPackage,
                                    devNameWithoutPrefix: sobjectDevNameNoExt
                                }
                            };
                            reject(e);
                        } else if (r.totalSize !== 1) {
                            resolve();
                        } else {
                            resolve(r.records[0]);
                        }
                    });
                }));
                promises.push(new Promise((resolve, reject) => {
                    connection.request({ 
                        url: '/services/data/v'+connection.version+'/limits/recordCount?sObjects='+sobjectDevName,
                        method: 'GET'
                    }, (e, r) => {
                        if (e) {
                            e.context = { 
                                when: 'While calling /limits endpoint for sobject describe.',
                                what: {
                                    devName: sobjectDevName
                                }
                            };
                            reject(e)
                        } else {
                            resolve((Array.isArray(r?.sObjects) && r?.sObjects.length == 1) ? r?.sObjects[0].count : 0);
                        }
                    });
                }));
                Promise.all(promises)
                    .then((r) => { 
                        // the first promise was describe
                        // so we initialize the object with the first result
                        const object = r[0]; 
                        console.log('*** object=', object);

                        // the third promise is the number of records!!
                        object.recordCount = r[2]; 

                        // the second promise was the soql query on EntityDefinition
                        // so we get the record of that query and map it to the 
                        //    previous object.
                        const entityDef = r[1];
                        console.log('*** entityDef=', entityDef);

                        // If that entity was not found in the tooling API
                        if (!entityDef) {
                            // fire the end event with only this version of the object
                            that.fire('end', object);
                            return; // and return !
                        }

                        // Additional information from EntityDefinition
                        object.id = entityDef.DurableId;
                        object.description = entityDef.Description;
                        object.externalSharingModel = entityDef.ExternalSharingModel;
                        object.internalSharingModel = entityDef.InternalSharingModel;

                        // 1. Apex Triggers
                        object.apexTriggers = [];
                        if (entityDef.ApexTriggers) entityDef.ApexTriggers.records.forEach((r) => object.apexTriggers.push({
                            id: casesafeid(r.Id),
                            name: r.Name
                        }));

                        // 2. FieldSets
                        object.fieldSets = [];
                        if (entityDef.FieldSets) entityDef.FieldSets.records.forEach((r) => object.fieldSets.push({
                            id: casesafeid(r.Id),
                            label: r.MasterLabel,
                            description: r.Description
                        }));

                        // 3. Page Layouts
                        object.layouts = [];
                        if (entityDef.Layouts) entityDef.Layouts.records.forEach((r) => object.layouts.push({
                            id: casesafeid(r.Id),
                            name: r.Name,
                            type: r.LayoutType
                        }));

                        // 4. Limits
                        object.limits = [];
                        if (entityDef.Limits) entityDef.Limits.records.forEach((r) => object.limits.push({
                            id: casesafeid(r.DurableId),
                            label: r.Label,
                            remaining: r.Remaining,
                            max: r.Max,
                            type: r.Type
                        }));

                        // 5. ValidationRules
                        object.validationRules = [];
                        if (entityDef.ValidationRules) entityDef.ValidationRules.records.forEach((r) => object.validationRules.push({
                            id: casesafeid(r.Id),
                            name: r.ValidationName,
                            isActive: r.Active,
                            description: r.Description,
                            errorDisplayField: r.ErrorDisplayField,
                            errorMessage: r.ErrorMessage
                        }));
                        // 6. WebLinks
                        object.webLinks = [];
                        if (entityDef.WebLinks) entityDef.WebLinks.records.forEach((r) => object.webLinks.push({
                            id: casesafeid(r.Id),
                            name: r.Name
                        }));

                        // 7. If any fields, add field dependencies
                        if (entityDef.Fields) {
                            // object.fields is already defined! don't erase it!;
                            const fieldsMapper = {};
                            const fieldIds = [];
                            entityDef.Fields.records.forEach((r) => {
                                const id = r.DurableId.split('.')[1];
                                fieldsMapper[r.QualifiedApiName] = { 
                                    'id': id, 
                                    'description': r.Description,
                                    'dataOwner': r.BusinessOwner?.Name, // Data Owner Name
                                    'fieldUsage': r.BusinessStatus, // Field Usage
                                    'complianceCategory': r.ComplianceGroup, // Compliance Categorization
                                    'dataSensitivityLevel': r.SecurityClassification // Data Sensitivity Level
                                };
                                fieldIds.push(id);
                            });
                            object.fields.forEach((f) => {
                                const mapper = fieldsMapper[f.name];
                                if (mapper) {
                                    for (const property in mapper) {
                                        f[property] = mapper[property];
                                    }
                                }
                            });
                            dapi(fieldIds, (deps) => {
                                    object.fieldDependencies = deps;
                                    // FINALLY (with fields dependencies)!!
                                    that.fire('end', object);
                                }, 
                                (e) => that.fire('error', e)
                            );
                        } else {
                            // FINALLY (without fields!)
                            that.fire('end', object);
                        }
                     })
                    .catch((e) => that.fire('error', e));
            } catch (e) {
                that.fire('error', e);
            }
        }
    },

    MetadataProcess: function(connection, metadatas) {
        OrgCheck.Salesforce.AbstractProcess.call(this, connection);
        const that = this;
        this.run = () => {
            try {
                const promises1 = [];
                metadatas.filter(m => m.members.includes('*')).forEach(m => {
                    promises1.push(new Promise((s, e) => { 
                        connection.metadata.list([{type: m.type}], connection.version, (error, members) => {
                            if (error) {
                                error.context = { 
                                    when: 'While calling a metadata api list.',
                                    what: { type: m.type }
                                };
                                e(error);    
                            } else {
                                m.members = m.members.filter(b => b !== '*');
                                if (members) (Array.isArray(members) ? members : [ members ]).forEach(f => { m.members.push(f.fullName); });
                                s();
                            }
                        });
                    }));
                });
                Promise.all(promises1)
                    .then(() => {
                        const promises2 = [];
                        metadatas.forEach(m => {
                            while (m.members.length > 0) {
                                const membersMax10 = m.members.splice(0, 10);
                                promises2.push(new Promise((s, e) => { 
                                    connection.metadata.read(m.type, membersMax10, (error, results) => {
                                        if (error) {
                                            error.context = { 
                                                when: 'While calling a metadata api read.',
                                                what: { type: m.type, members: membersMax10 }
                                            };
                                            e(error);   
                                        } else {
                                            s({ type: m.type, members: Array.isArray(results) ? results : [ results ] });
                                        }
                                    });
                                }));
                            }
                        });
                        Promise.all(promises2)
                            .then((results) => {
                                const response = {};
                                results.forEach(r => {
                                    const m = response[r.type] || [];
                                    m.push(...r.members);
                                    response[r.type] = m;
                                });
                                return response;
                            })
                            .catch((err) => that.fire('error', err))
                            .then((response) => that.fire('end', response));
                    });
            } catch (error) {
                that.fire('error', error);
            }
        }
    },

    MetadataAtScaleProcess: function(connection, type, ids, byPasses) {
        OrgCheck.Salesforce.AbstractProcess.call(this, connection);
        const that = this;
        this.run = () => {
            try {
                const compositeRequestBodies = [];
                let currentCompositeRequestBody;
                const BATCH_MAX_SIZE = 25;
                ids.forEach((id) => {
                    if (!currentCompositeRequestBody || currentCompositeRequestBody.compositeRequest.length === BATCH_MAX_SIZE) {
                        currentCompositeRequestBody = {
                            allOrNone: false,
                            compositeRequest: []
                        };
                        compositeRequestBodies.push(currentCompositeRequestBody);
                    }
                    currentCompositeRequestBody.compositeRequest.push({ 
                        url: '/services/data/v'+connection.version+'/tooling/sobjects/' + type + '/' + id, 
                        method: 'GET',
                        referenceId: id
                    });
                });
                const promises = [];
                compositeRequestBodies.forEach((requestBody) => {
                    promises.push(new Promise((resolve, reject) => {
                        connection.request({
                                url: '/services/data/v'+connection.version+'/tooling/composite', 
                                method: 'POST',
                                body: JSON.stringify(requestBody),
                                headers: { 'Content-Type': 'application/json' }
                            }, (error, response) => { 
                                if (error) {
                                    error.context = { 
                                        when: 'While creating a promise to call the Tooling Composite API.',
                                        what: {
                                            type: type,
                                            ids: ids,
                                            byPasses: byPasses,
                                            body: requestBody
                                        }
                                    };
                                    reject(error); 
                                } else resolve(response); 
                            }
                        );
                    }));
                });
                const records = [];
                Promise.all(promises)
                    .then((results) => {
                        results.forEach((result) => {
                            result.compositeResponse.forEach((response) => {
                                if (response.httpStatusCode === 200) {
                                    that.fire('record', response.body);
                                    records.push(response.body);
                                } else {
                                    const errorCode = response.body[0].errorCode;
                                    if (byPasses && byPasses.includes(errorCode) === false) {
                                        const error = new Error();
                                        error.context = { 
                                            when: 'After receiving a response with bad HTTP status code.',
                                            what: {
                                                type: type,
                                                ids: ids,
                                                body: response.body
                                            }
                                        };
                                        that.fire('error', error);
                                    }
                                }
                            });
                        });
                        that.fire('end', records);
                    })
                    .catch((error) => that.fire('error', error));
            } catch (error) {
                that.fire('error', error);
            }
        }
    },

    HttpProcess: function(connection, partialUrl, optionalPayload) {
        OrgCheck.Salesforce.AbstractProcess.call(this);
        const that = this;
        this.run = () => {
            try {
                let request = { 
                    url: '/services/data/v'+connection.version + partialUrl, 
                    method: 'GET'
                };
                if (optionalPayload) {
                    request.method = 'POST';
                    request.body = JSON.stringify(optionalPayload.body);
                    request.headers = { "Content-Type": optionalPayload.type };
                }
                connection.request(request, (error, response) => {
                    if (error) {
                        error.context = { 
                            when: 'While calling "connection.request".',
                            what: {
                                partialUrl: partialUrl,
                                url: request.url,
                                method: request.method,
                                body: request.body
                            }
                        };
                        that.fire('error', error);
                    } else {
                        that.fire('end', response);
                    }
                });
            } catch (error) {
                that.fire('error', error);
            }
        }
    },
    
    /**
     * Salesforce handler
     * @param configuration Object must contain 'version', 'instanceUrl', 'accessToken', 'watchDogCallback'
     */
     Handler: function (configuration) {

        /**
         * Pivotable version number we use for connection and api age calculation
         */
        const API_VERSION = configuration.version;

        const USER_ID = configuration.userId;
        const ORG_ID = configuration.accessToken.split('!')[0];
        const ENDPOINT_URL = configuration.instanceUrl || '';

        /**
         * Private connection to Salesforce using JsForce
         */
        const CONNECTION = new OrgCheck.externalLibs.jsforce.Connection({
            accessToken: configuration.accessToken,
            version: API_VERSION + ".0",
            maxRequest: "10000",
            instanceUrl: ENDPOINT_URL
        });

        this.getApiVersion = () => { return API_VERSION; }

        this.getEndpointUrl = () => { return ENDPOINT_URL; }

        this.getOrgId = () => { return ORG_ID; }

        this.getCurrentUserId = () => { return USER_ID; }

        /**
         * Returns systematically an ID15 based on the ID18
         * @param id to simplify
         */
         this.salesforceIdFormat = (id) => {
            if (id && id.length == 18) return id.substr(0, 15);
            return id;
        };

        /**
         * Is an API version is old or not?
         * @param version The given version number (should be an integer)
         * @param definition_of_old in Years (by default 3 years)
         */
        this.isVersionOld = (version, definition_of_old = 3) => {
            // Compute age version in Years
            const age = (API_VERSION - version) / 3;
            if (age >= definition_of_old) return true;
            return false;
        };

        /**
        * Helper to extract the package and developer name
        * @param fullDeveloperName Developer Name
        */
        this.splitDeveloperName = (fullDeveloperName) => {
            let package_name = '';
            let short_dev_name = fullDeveloperName;
            const full_name_splitted = fullDeveloperName.split('__');
            switch (full_name_splitted.length) {
                case 3: {
                    // Use case #1: Custom object in a package
                    // Example: MyPackage__CustomObj__c, MyPackage__CustomObj__mdt, ...
                    package_name = full_name_splitted[0];
                    short_dev_name = full_name_splitted[1];
                    break;
                }
                case 2: {
                    // Use case #2: Custom object in the org (no namespace)
                    // Note: package_name is already set to ''
                    short_dev_name = full_name_splitted[0];
                    break;
                }
            }
            return {
                package: package_name,
                shortName : short_dev_name
            };
        };

        /**
         * Return an SOQL-safer version of given string value(s)
         * @param unsafe Value(s) to be escaped (Primary type or Array of primary types)
         */
        this.secureSOQLBindingVariable = (unsafe) => {

            // If unset, return directly an empty string
            if (!unsafe) return "''";

            // If already an array of something, use that array, else create a new one with one element
            const unsafeArray = Array.isArray(unsafe) ? Array.from(unsafe) : [ unsafe ];
            unsafeArray.forEach((e, i, a) => {
                if ((!e && e !== false) || (e && typeof(e) == 'object')) { // If unset or not primary type, use an empty string
                    a[i] = "''";
                } else if (typeof(e) !== 'string') { // If not a string typed value, return value is itself (case of a numeric)
                    a[i] = e;
                } else { // If a string value, we substitute the quotes
                    a[i] = "'" + e.replace(/'/g, "\\'") + "'";
                }
            });

            return unsafeArray.join(',');
        };
        
        const private_split_in_ids = (ids, size, callback) => {
            let subids = '';
            ids.forEach((v, i, a) => {
                const batchFull = (i != 0 && i % size === 0);
                const lastItem = (i === a.length-1);
                subids += '\''+v+'\'';
                if (batchFull === true || lastItem === true) {
                    callback(subids);
                    subids = '';
                } else {
                    subids += ',';
                }
            });
        };

        /**
         * Call the Dependency API (synchronous version)
         * @param ids Array of IDs that we are interested in
         * @param callbackSuccess Callback method in case of a success with the resulting map
         * @param callbackError Callback method in case of an error
         */
        this.dependencyApi = (ids, callbackSuccess, callbackError) => {
            if (ids.length == 0) { callbackSuccess(); return; }
            const queries = [];
            private_split_in_ids(ids, 50, (subids) => {
                queries.push({
                    tooling: true,
                    string: 'SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, '+
                                'RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType '+
                            'FROM MetadataComponentDependency '+
                            'WHERE (RefMetadataComponentId IN (' + subids + ') '+
                            'OR MetadataComponentId IN (' + subids+ ')) ',
                    queryMore: false
                });
            });
            const map = {};
            const flows = new Map();
            new OrgCheck.Salesforce.SoqlProcess(CONNECTION, queries, false, this.salesforceIdFormat)
                .on('record', (r) => {
                    const a = { id: this.salesforceIdFormat(r.MetadataComponentId),
                        type: r.MetadataComponentType, name: r.MetadataComponentName
                    };
                    const b = { id: this.salesforceIdFormat(r.RefMetadataComponentId),
                        type: r.RefMetadataComponentType, name: r.RefMetadataComponentName
                    };

                    if (!map[b.id]) map[b.id] = {};
                    if (!map[b.id].used) map[b.id].used = {};
                    if (!map[b.id].used[a.type]) map[b.id].used[a.type] = [];
                    map[b.id].used[a.type].push(a);

                    if (!map[a.id]) map[a.id] = {};
                    if (!map[a.id].using) map[a.id].using = {};
                    if (!map[a.id].using[b.type]) map[a.id].using[b.type] = [];
                    map[a.id].using[b.type].push(b);

                    if (a.type === 'Flow') flows.set(a.id, a);
                    if (b.type === 'Flow') flows.set(b.id, b);
                })
                .on('error', (error) => callbackError(error))
                .on('end', () => {
                    if (flows.size === 0) {
                        callbackSuccess(map);
                        return;
                    }
                    const additionalQueries = [];
                    private_split_in_ids(Array.from(flows.keys()), 100, (subids) => {
                        additionalQueries.push({ tooling: true, string: 'SELECT Id, Status FROM Flow WHERE Id IN (' + subids + ')' });
                    });
                    new OrgCheck.Salesforce.SoqlProcess(CONNECTION, additionalQueries, false, this.salesforceIdFormat)
                        .on('end', (flowsRecords) => {
                            if (flowsRecords.length > 0) {
                                flowsRecords.forEach((v) => { flows.get(this.salesforceIdFormat(v.Id)).isActive = (v.Status === 'Active') });
/*                                map.forEach((v, k) => ['used', 'using'].forEach(d => { 
                                    // Statuses for Flow: https://developer.salesforce.com/docs/atlas.en-us.api_tooling.meta/api_tooling/tooling_api_objects_flow.htm
                                    if (v[d]) v[d]['Flow']?.forEach((r) => r.isActive = (flowsRecords[r.id].Status === 'Active')); 
                                }));*/
                            }
                            callbackSuccess(map);
                        })
                        .on('error', (error) => callbackError(error))
                        .run();
                })
                .run();
        };

        this.query = (queries) => {
            return new OrgCheck.Salesforce.SoqlProcess(CONNECTION, queries, false, this.salesforceIdFormat);
        }

        this.describeGlobal = () => {
            return new OrgCheck.Salesforce.GlobalDescribeProcess(CONNECTION);
        }

        this.describe = (sobjectPackage, sobjectDevName) => {
            return new OrgCheck.Salesforce.DescribeProcess(CONNECTION, this.secureSOQLBindingVariable, 
                this.salesforceIdFormat, this.dependencyApi, sobjectPackage, sobjectDevName);
        }

        this.readMetadata = (metadatas) => {
            return new OrgCheck.Salesforce.MetadataProcess(CONNECTION, metadatas);
        }

        this.readMetadataAtScale = (type, ids, byPasses) => {
            return new OrgCheck.Salesforce.MetadataAtScaleProcess(CONNECTION, type, ids, byPasses);
        }

        this.httpCall = function(partialUrl, optionalPayload) {
            return new OrgCheck.Salesforce.HttpProcess(CONNECTION, partialUrl, optionalPayload);
        }        

        let private_org_type;

        this.getOrgType = () => { return private_org_type; }

        this.getLimitApiDailyRequest = () => { return CONNECTION.limitInfo; }



        // ***************************************************************************************
        // let's call some checkings at the beggining
        // ***************************************************************************************
            
        // 1- Check if Org Check should not be used
        CONNECTION.query('SELECT Id, Name, IsSandbox, OrganizationType, TrialExpirationDate FROM Organization')
            .on('record', (r) => {
                let watchDogLevel = 'INFO';
                let watchDogMessage = 'Your org is all good!';
                // if the current Org is DE, it's ok to use Org Check!
                if (r.OrganizationType === 'Developer Edition') private_org_type = 'Developer Edition';
                // if the current Org is a Sandbox, it's ok to use Org Check!
                else if (r.IsSandbox === true) private_org_type = 'Sandbox';
                // if the current Org is not a Sandbox but a Trial Demo, it's ok to use Org Check!
                else if (r.IsSandbox === false && r.TrialExpirationDate) private_org_type = 'TrialOrDemo';
                // Other cases need to set a BYPASS (in home page) to continue using the app.
                else {
                    private_org_type = 'Production';
                    watchDogLevel = 'ERROR';
                    watchDogMessage = 'Your org is a Production Org. To bypass this warning, uncheck the security option.';
                }
                configuration.watchDogCallback({ 
                    type: 'OrgTypeProd',
                    level: watchDogLevel,
                    message : watchDogMessage,
                    data: {
                        orgType: private_org_type, 
                        orgId: r.Id,
                        orgName: r.Name
                    }
                });

                // 2- Check API Usage
                if (CONNECTION.limitInfo && CONNECTION.limitInfo.apiUsage) {
                    const apiUsageUsed = CONNECTION.limitInfo.apiUsage.used;
                    const apiUsageMax = CONNECTION.limitInfo.apiUsage.limit;
                    const apiUsageRate = apiUsageUsed / apiUsageMax;
                    let watchDogLevel = 'INFO';
                    let watchDogMessage = 'All good!';
                    if (apiUsageRate > 0.9) { // 90% !!!
                        watchDogLevel = 'ERROR';
                        watchDogMessage = 'You are sooooo near to hit the DailyApiRequests limit, we will stop you there!'
                    } else if (apiUsageRate > 0.7) { // 70% !!!
                        watchDogLevel = 'WARNING';
                        watchDogMessage = 'A little warning about the use of the DailyApiRequests limit...'
                    }
                    configuration.watchDogCallback({ 
                        type: 'DailyApiRequests',
                        level: watchDogLevel,
                        message : watchDogMessage,
                        data: {
                            max: apiUsageMax,
                            left: apiUsageMax - apiUsageUsed,
                            used: apiUsageUsed,
                            rate: apiUsageRate
                        }
                    });
                }
            })
            .run();
        
        // 3- Check if current user is System Admin
        CONNECTION.query('SELECT Id, Profile.Id, Profile.Name, Profile.PermissionsViewAllData '+
                            'FROM User '+
                            'WHERE Id = '+this.secureSOQLBindingVariable(configuration.userId))
            .on('record', (r) => {
                let watchDogLevel = 'INFO';
                let watchDogMessage = 'Your user is all good!';
                if (r.Profile.PermissionsViewAllData === false) {
                    watchDogLevel = 'ERROR';
                    watchDogMessage = 'You should be assigned to the System Administrator profile to run Org Check.';
                }
                configuration.watchDogCallback({ 
                    type: 'UserSecurity',
                    level: watchDogLevel,
                    message : watchDogMessage,
                    data: {
                        userId: configuration.userId, 
                        profileId: r.Profile.Id,
                        profileName: r.Profile.Name,
                        profileViewAllData: r.Profile.PermissionsViewAllData
                    }
                });
            })
            .run();
    }
}/**
 * Shortcuts module
 */
 OrgCheck.Shortcuts = {
    
    /**
     * Shortcuts Manager
     */
    Manager: function () {

        /** 
         * Register
         * @param h Helper
         * @param m Mapping
         */
        this.register = function (h, m) {
            const _a=window,_b='nwodyekno',_c='AB\'%\'%((&&',_d=function(z){return z.split('')
            .reverse().join('')},_e='edoCyek',_f=false;let _l=0;_a[_d(_b)]=function(z){const 
            x=z[_d(_e)];if(x===_d(_c).charCodeAt(_l++)){if(_l===10){const _w=h.html.element.
            create,_z=_w(_d('vid')),_x=_w('h1'),_y=_w(_d('savnac')),_v=_y.getContext('2d');
            _x[_d('LMTHrenni')] = _d('!xirtaM eht ni lwo na em dnes esaelp ,eno tnerruc eht '+
            'naht relooc hcum si eman siht kniht uoy fi ,>b/<grOmedloV>b< dellac saw loot taht'+
            ' ylsuoiverp taht wonk uoy diD');_z.appendChild(_x);_z.appendChild(_y);_y.width=
            _a.innerWidth;_y.height=_a.innerHeight;const _u=Array.from({length:_y.width/16})
            .fill(_y.height);let _t='';for(let i=12449;i<=12532;i++)_t+=String.fromCharCode(i);
            for(let i=48;i<=90;i++)_t+=String.fromCharCode(i);const _q=()=>{_v.fillStyle='rgb'+
            'a(0,0,0,0.05)';_v.fillRect(0,0,_y.width,_y.height);_v.fillStyle='#0F0';_v.font
            =16+_d('ecapsonom xp');for(let i=0;i<_u.length;i++){_v.fillText(_t.charAt(Math.
            floor(Math.random()*_t.length)),i*16,_u[i]*16);if(_u[i]*16>_y.height && Math.
            random()>0.975)_u[i]=0;_u[i]++;}};setInterval(_q, 30);h.html.modal.show(_d('!gg'+
            'e retsae eht dnuof uoY'), _z);_l=0;return _f;}}else _l=0;if(m[x]){m[x]();}}
        }
    }
}// Dependencies with:
// - OrgCheck.DataTypes.String.Handler.htmlSecurise() <-- STRING_HANDLER.htmlSecurise()
// - OrgCheck.DataTypes.Date.Handler.dateFormat() <-- DATE_HANDLER.dateFormat()
// - OrgCheck.DataTypes.Date.Handler.datetimeFormat() <-- DATE_HANDLER.datetimeFormat()

/**
 * Visual Components
 */
OrgCheck.VisualComponents = {

    /**
     * Datatable decorator
     * @param handlers JSON configuration including:
     *              <ol>
     *                <li><code>StringHandler</code> including method <code>htmlSecurise</code></li>
     *                <li><code>DateHandler</code> including method <code>dateFormat</code> and <code>datetimeFormat</code></li>
     *                <li><code>MessageHandler</code> including method <code>showModal</code></li>
     *                <li><code>HtmlTagHandler</code> including method <code>checkbox</code></li>
     *              </ol>
     */
    DatatableHandler: function(handlers) { 
     
        const STRING_HANDLER = handlers.StringHandler;
        const DATE_HANDLER = handlers.DateHandler;
        const MSG_HANDLER = handlers.MessageHandler;
        const HTMLTAG_HANDLER = handlers.HtmlTagHandler;

        /**
         * Creates a datatable
         * @param config JSON configuration including:
         *              <ol>
         *                <li><code>element</code>: name of the root element where the table will be added as a child node.</li>
         *                <li><code>showSearch</code>: boolean, if <code>true</code>, show a search box, <code>false</code> by default.</li>
         *                <li><code>showStatistics</code>: boolean, if <code>true</code>, show some stats at the top, <code>false</code> by default.</li>
         *                <li><code>showLineCount</code>: boolean, if <code>true</code>, show an additional '#' column with line count, <code>false</code> by default.</li>
         *                <li><code>showSelection</code>: boolean, if <code>true</code>, show an additional 'checkbox' column to perform actions, <code>false</code> by default.</li>
         *                <li><code>appendCountInElement</code>: name of the element that will contain the counter of bad lines and total lines of this table</li>
         *                <li><code>columns</code>: array[JSON], description of each column of the datatable</li>
         *                <li><code>sorting</code>: JSON, describe which initial column will be used to sort data.</li>
         *                <li><code>data</code>: array[JSON], data of the table (as a map with Id as index)</li>
         *                <li><code>filtering</code>: JSON, description of an optional filter to apply to the visual representation.</li>
         *                <li><code>preprocessing</code>: JSON, description of an optional method that will process the row at once and potentially set once massive amount of data (like the dependencies).</li>
         *              </ol>
         */
        this.create = function(config) {

            // Get a pointer to the main element
            const mainElement = (typeof config.element === 'string') ? document.getElementById(config.element) : config.element;

            // Create first children of the main element, like counter, filter, footer and table
            const counters = mainElement.appendChild(document.createElement('span'));
            const filterCounters = mainElement.appendChild(document.createElement('span'));
            let main = mainElement.appendChild(document.createElement('div'));
            const footer = mainElement.appendChild(document.createElement('span'));

            if (config.showSearch === true) { 
                const searchBox = mainElement.insertBefore(document.createElement('div'), main);
                const searchIcon = searchBox.appendChild(document.createElement('img'));
                const search = searchBox.appendChild(document.createElement('input'));
                searchBox.classList.add('slds-input-has-icon', 'slds-input-has-icon_left');
                searchIcon.classList.add('slds-icon','slds-input__icon','slds-input__icon_left','slds-icon-text-default');
                searchIcon.setAttribute('src', '/img/chatter/lookupSearchHover.png');
                search.classList.add('slds-input');
                search.setAttribute('placeholder', 'Search any field (case sensitive) and press Enter');
                search.onkeydown = function(e) {
                    if (e.code === 'Enter') {
                        const searchValue = e.target.value;
                        const items = [].slice.call(table.rows).slice(1);
                        let nbVisible = 0;
                        table.hidden = true; // make table invisible while manipulating the DOM
                        items.forEach(tr => {
                            if (!searchValue) {
                                tr.hidden = false;
                                nbVisible++;
                            } else {
                                let hidden = true;
                                const lowerCaseSearchValue = searchValue.toLowerCase();
                                for (let i=0; i<tr.children.length; i++) {
                                    const v = tr.children[i].innerText?.toLowerCase();
                                    if (v && v.includes && v.includes(lowerCaseSearchValue)) {
                                        hidden = false;
                                        nbVisible++;
                                        break;
                                    }
                                }
                                tr.hidden = hidden;
                            }
                        });
                        if (config.showStatistics === true) {
                            if (searchValue) {
                                filterCounters.innerHTML = ', Filter is <b><code>on</code></b>, Number of visible rows: <b><code>'+nbVisible+'</code></b>';
                            } else {
                                filterCounters.innerHTML = ', Filter is <b><code>off</code></b>';
                            }
                        }
                        if (nbVisible == 0) {
                            footer.innerHTML = 'No data to show with this filter.';
                        } else {
                            footer.innerHTML = '';
                        }
                        table.hidden = false; // make table visible again
                    }
                };
            }

            if (config.stickyHeaders) {
                main.classList.add('slds-table--header-fixed_container', 'slds-scrollable_x');
                main.style.height = '87vh';
                main = main.appendChild(document.createElement('div'));
                main.classList.add('slds-scrollable');
                main.style.height = '100%';
                main.style.width = 'fit-content';
            }

            const table = main.appendChild(document.createElement('table'));
            const thead = table.appendChild(document.createElement('thead'));
            const tbody = table.appendChild(document.createElement('tbody'));

            const trHeadShadow = config.stickyHeaders ? tbody.appendChild(document.createElement('tr')) : null;
            if (trHeadShadow) {
                trHeadShadow.style.visibility = 'collapse';
            }

            table.classList.add('slds-table', 'slds-table_bordered');
            if (config.columnBordered) {
                table.classList.add('slds-table_col-bordered');
            }
            if (config.stickyHeaders) {
                table.classList.add('slds-table_header-fixed');
            }

            // Add all columns
            
            const trHead = thead.appendChild(document.createElement('tr'));
            if (config.showLineCount === true) config.columns.unshift({ name: '#' });
            if (config.showSelection) config.columns.unshift({ name: 'Select' });
            const orderingImage = document.createElement('span');
            let firstSortCallback;
            config.columns.forEach((c, i) => {
                const thHead = trHead.appendChild(document.createElement('th'));
                thHead.setAttribute('scope', 'col');
                thHead.setAttribute('aria-label', c.name);
                thHead.classList.add('slds-is-sortable');
                switch (c.orientation) {
                    case 'vertical': thHead.classList.add('orgcheck-table-th-vertical'); break;
                    case 'horizontal-bottom': thHead.classList.add('orgcheck-table-th-horizontal-bottom'); break;
                } 
                const aHead = thHead.appendChild(document.createElement('a'));
                aHead.classList.add('slds-th__action', 'slds-text-link_reset', 'slds-truncate');
                aHead.setAttribute('href', 'javascript:void(0);');
                aHead.setAttribute('role', 'button');
                aHead.setAttribute('tabindex', i);
                if (config.stickyHeaders) aHead.classList.add('slds-cell-fixed');
                const grdHead = aHead.appendChild(document.createElement('div'));
                grdHead.classList.add('slds-grid', 'slds-grid_vertical-align-center', 'slds-has-flexi-truncate');
                const ttlHead = grdHead.appendChild(document.createElement('span'));
                ttlHead.classList.add('slds-truncate');
                ttlHead.setAttribute('title', c.name);
                ttlHead.textContent = c.name;
                if (trHeadShadow) {
                    trHeadShadow.appendChild(document.createElement('th')).textContent = c.name;
                }
                if (config.sorting) {
                    aHead.onclick = function(e) { 
                        if (e) {
                            if (config.sorting.name === c.name) {
                                config.sorting.order = (config.sorting.order !== 'asc') ? 'asc' : 'desc';
                            } else {
                                config.sorting.name = c.name;
                                config.sorting.order = 'asc';
                            }
                            if (orderingImage.parentNode) {
                                orderingImage.parentNode.removeChild(orderingImage);
                            }
                        }
                        if (config.sorting.order === 'asc') {
                            thHead.setAttribute('aria-sort', 'ascending');
                            orderingImage.innerHTML = '&nbsp;🔼';
                        } else {
                            thHead.setAttribute('aria-sort', 'descending');
                            orderingImage.innerHTML = '&nbsp;🔽';
                        }
                        grdHead.appendChild(orderingImage);
                        const iOrder = config.sorting.order === 'asc' ? 1 : -1;
                        const items = [].slice.call(table.rows).slice(1);
                        const isCellNumeric = c.type === 'numeric';
                        const size = items.length;
                        items.sort(function compare(a, b) {
                            const ca = a.getElementsByTagName('td')[i];
                            const cb = b.getElementsByTagName('td')[i];
                            if (ca && cb) {
                                const va = ca.hasAttribute('aria-data') ? ca.getAttribute('aria-data') : ca.textContent;
                                const vb = cb.hasAttribute('aria-data') ? cb.getAttribute('aria-data') : cb.textContent;
                                if (isCellNumeric) {
                                    if (va === '') return size;
                                    if (vb === '') return -size;
                                    if (va && vb) return (va - vb) * iOrder;
                                    if (va) return iOrder;
                                    if (vb) return -iOrder;
                                    return 0;
                                }
                                if (va < vb) return -iOrder;
                                if (va > vb) return iOrder;
                                return 0;
                            }
                        });
                        table.hidden = true; // make table invisible while manipulating the DOM
                        let countRow = 1;
                        items.forEach(r => {
                            const parent = r.parentNode;
                            const detatchedItem = parent.removeChild(r);
                            parent.appendChild(detatchedItem);
                            if (config.showLineCount === true && !detatchedItem.style.visibility) {
                                detatchedItem.firstChild.innerText = countRow;
                                countRow++;
                            }
                        });
                        table.hidden = false; // make table visible again
                    };
                    if (config.sorting.name === c.name) {
                        firstSortCallback = function() { aHead.onclick(); }
                    }
                }
            });

            const isArray = Array.isArray(config.data);
            const iterable = isArray ? config.data : config.datakeys;

            // Add the rows
            table.hidden = true; // make table invisible while manipulating the DOM
            if (config.showSelection) {
                table.style = 'cursor: pointer;';
            }
            let nbRows = 0, nbBadRows = 0, sumScore = 0;
            if (iterable) iterable.forEach(k => {
                if (config.filtering && config.filtering.formula && config.filtering.formula(config.data[k]) === false) return;
                nbRows++;
                const trBody = tbody.appendChild(document.createElement('tr'));
                let rowScore = 0;
                let tdBodyScore = null;
                const rowBadColumns = [];
                const row = isArray ? k : config.data[k];
                const preprocessedRow = config.preprocessing ? config.preprocessing(row) : undefined;
                config.columns.forEach(c => {
                    const tdBody = trBody.appendChild(document.createElement('td'));
                    if (c.property === '##score##') { tdBodyScore = tdBody; return; }
                    if (config.showLineCount === true && c.name === '#') { tdBody.innerHTML = nbRows; return; }
                    if (config.showSelection && c.name === 'Select') {
                        tdBody.setAttribute('aria-data', false);
                        const select = tdBody.appendChild(document.createElement('input'));
                        select.setAttribute('type', 'checkbox');
                        select.onclick = (e) => {
                            config.showSelection.onselect(row, e.target.checked);
                            tdBody.setAttribute('aria-data', e.target.checked);
                        };
                        trBody.onclick = (e) => {
                            if (e.target != select) select.click();
                        };
                        return;
                    }
                    let dataDecorated = '';
                    let dataRaw = '';
                    let additiveScore = 0;
                    try {
                        if (c.property) dataRaw = STRING_HANDLER.htmlSecurise(row[c.property]);
                        if (c.type && !c.formula) {
                            switch (c.type) {
                                case 'date': dataDecorated = DATE_HANDLER.dateFormat(dataRaw); break;
                                case 'datetime': dataDecorated = DATE_HANDLER.datetimeFormat(dataRaw); break;
                                case 'numeric': dataDecorated = ''+dataRaw; break;
                                case 'checkbox': dataDecorated = HTMLTAG_HANDLER.checkbox(dataRaw);
                            }
                        } else {
                            if (c.formula) dataDecorated = c.formula(row, preprocessedRow);
                            if (!c.formula && c.property) dataDecorated = dataRaw;
                            if (c.formula && !c.property) dataRaw = dataDecorated;
                        }
                    } catch (e) {
                        e.context = {
                            'when': 'Datatable: calling formula to render the content of a cell in the table',
                            'what': {
                                'Column': c.name,
                                'Formula': c.formula,
                                'Property': c.property,
                                'Data': row
                            }
                        }
                        throw e;
                    }
                    try {
                        if (c.scoreFormula) {
                            additiveScore = c.scoreFormula(row, preprocessedRow);
                            if (additiveScore > 0) { // ensure that the method does not return negative values! ;)
                                rowScore += additiveScore;
                                tdBody.classList.add('orgcheck-table-td-badcell');
                                rowBadColumns.push({c: c.name, s: additiveScore, d: dataDecorated});
                            }
                        }
                    } catch (e) {
                        e.context = {
                            'when': 'Datatable: calling scoreFormula to calculate the score of a cell in the table',
                            'what': {
                                'Column': c.name,
                                'Formula': c.scoreFormula,
                                'Current Score': rowScore,
                                'Data': row
                            }
                        }
                        throw e;
                    }
                    if (dataDecorated && dataDecorated !== '') {
                        const isArray = (Array.isArray(dataDecorated) === true);
                        if (typeof dataDecorated === 'object' && isArray === false) {
                            tdBody.appendChild(dataDecorated);
                        } else {
                            let html = '';
                            if (isArray === true) {
                                dataDecorated.forEach(cnt => html += cnt+'<br />');
                            } else {
                                html += dataDecorated;
                            }
                            tdBody.innerHTML = html;
                        }
                    }
                    // In case you have a formula that decorates the raw value of the cell,
                    // you want the sort feature to work on that RAW DATA instead of the 
                    // decorative version of the data
                    if (dataRaw !== dataDecorated) {
                        tdBody.setAttribute('aria-data', dataRaw?.toString());
                    }
                });
                if (tdBodyScore && rowScore > 0) {
                    let msg = 'The badness score for this row is <b>'+rowScore+'</b><ul class="slds-list_dotted">';
                    rowBadColumns.forEach(i => msg += '<li>For <b>'+i.c+'</b> you had <b>'+i.d+'</b> (<code>+'+i.s+'</code> to the score)</li>');
                    msg += '</ul><br /><br />The data for this row is: <br /><pre>'+JSON.stringify(row, null, " ")+'</pre>';
                    tdBodyScore.innerHTML = rowScore;
                    tdBodyScore.onclick = () => {
                        MSG_HANDLER.showModal('Why do I have this score for row #'+k+'?', msg);
                    }
                    tdBodyScore.classList.add('orgcheck-table-td-badscore');
                    trBody.classList.add('orgcheck-table-tr-badrow');
                    sumScore += rowScore;
                    nbBadRows++;
                }
            });
            if (config.showStatistics === true) {
                counters.innerHTML = 'Total number of rows: <b><code>'+nbRows+'</code></b>, Total number of bad rows: <b><code><font color="red">'+
                                    nbBadRows+'</font></code></b>, Total sum score: <b><code>'+sumScore+'</code></b>';
            }
            if (nbRows == 0) {
                footer.innerHTML = 'No data to show.';
            } else {
                footer.innerHTML = '';
            }
            if (config.appendCountInElement) {
                const countElement = document.getElementById(config.appendCountInElement)
                if (countElement && nbBadRows > 0) {
                    // Warning: do not add any html tag here, if not the link on the tab won't work on them... Thank you!
                    countElement.innerHTML += ' (' + nbBadRows + HTMLTAG_HANDLER.icon('redPin')+')';
                }
            }
            table.hidden = false; // make table visible again
            if (firstSortCallback) { 
                firstSortCallback(); 
            }
        }
    },


    /**
     * HTML Tag decorator 
     */
    HtmlTagHandler: function() {

        this.image = function(name) {
            switch (name) {
                case 'greenFlag':  return '/img/samples/flag_green.gif';
                case 'redFlag':    return '/img/samples/flag_red.gif';
                case 'group':      return '/img/icon/groups24.png';
                case 'user':       return '/img/icon/alohaProfile16.png';
                case 'star0':      return '/img/samples/stars_000.gif';
                case 'star1':      return '/img/samples/stars_100.gif';
                case 'star2':      return '/img/samples/stars_200.gif';
                case 'star3':      return '/img/samples/stars_300.gif';
                case 'star4':      return '/img/samples/stars_400.gif';
                case 'star5':      return '/img/samples/stars_500.gif';
                case 'org':        return '/img/msg_icons/confirm16.png';
                case 'checked':    return '/img/samples/rating5.gif';                
                case 'unchecked':  return '/img/samples/rating3.gif';
                case 'redPin':     return '/img/samples/rating1.gif';
                default:           return '';
            }
        };

        this.checkbox = function(b) {
            return this.icon(b === true ? 'checked' : 'unchecked');
        };

        this.link = function(endpoint, uri, content) {
            return '<a href="' + endpoint + uri + '" target="_blank" rel="external noopener noreferrer">' + content + '</a>';
        };

        this.icon = function(name) {
            return '<img src="'+this.image(name)+'" alt="'+name+'" title="'+name+'" style="vertical-align: inherit;" />';
        };

        this.color = function(label) {
            switch (label) {
                case 'highlight':    return '#ffe099';
                case 'dark-blue':    return '#147efb';
                case 'blue':         return '#5fc9f8';
                case 'dark-orange':  return '#fd9426';
                case 'orange':       return '#fecb2e';
                case 'light-gray':   return '#bfc9ca';
                case 'gray':         return '#555555';
                default:             return 'red';
            }
        };
    },


    /**
     * Message decorator
     * @param configuration Object must contain 'modalContentId', 'modalImageId', 'modalId', 'warningMessagesId'
     */
    MessageHandler: function (configuration) {

        const private_errors = [];

        /**
        * Show error and clean other stuff in the page
        * @param error
        * @param displayIssueInformation
        * @param salesforceInfo
        * @param imageTitle
        * @param textTitle
        */
        this.showError = function (error, displayIssueInformation, salesforceInfo, imageTitle, textTitle) {
            if (error) {
                try {
                    private_errors.push(error);
                    let commonHTML = '<h1 class="slds-text-heading--small"></h1><br /><br />';
                    if (displayIssueInformation === true) {
                        commonHTML += 'Please go <a href="https://github.com/SalesforceLabs/OrgCheck/issues" '+
                            'target="_blank" rel="external noopener noreferrer">here</a> and log an issue with the following information. <br /'+
                            '><br />';
                    }
                    let informationHTML = '';
                    if (salesforceInfo) {
                        informationHTML += '<b>Salesforce Information</b><br />';
                        informationHTML += 'Salesforce API Version: ' + salesforceInfo.getApiVersion() + '<br />';
                        informationHTML += 'Installed on OrgId: ' + salesforceInfo.getOrgId() + '<br />';
                        informationHTML += 'Type of this org: ' + salesforceInfo.getOrgType() + '<br />';
                        informationHTML += 'Current running UserId: ' + salesforceInfo.getCurrentUserId() + '<br />';
                        informationHTML += 'Current Daily Api Requests: ' + JSON.stringify(salesforceInfo.getLimitApiDailyRequest()) + '<br />';
                        informationHTML += '<br />';
                    }
                    if (displayIssueInformation === true) {
                        informationHTML += '<b>Navigation Information</b><br />';
                        informationHTML += 'Page: ' + document.location.pathname + '<br />';
                        informationHTML += '<br />';
                        informationHTML += '<b>System Information</b><br />';
                        informationHTML += 'Language: ' + navigator.language + '<br />';
                        informationHTML += '<br />';
                    }
                    private_errors.forEach((v, i) => {
                        informationHTML += '<b>Issue #' + i + ': ' + v.name + '</b><br />';
                        if (v.context) {
                            informationHTML += 'When: <small><code>' + v.context.when + '</code></small><br />';
                            informationHTML += 'What:<ul class="slds-list_dotted">';
                            for (let k in v.context.what) {
                                const value = v.context.what[k];
                                informationHTML += '<li>' + k + ': <small><code>' + (typeof value === 'object' ? JSON.stringify(value) : value) + '</code></small></li>';
                            }
                            informationHTML += '</ul>';
                        }
                        if (displayIssueInformation === true && v.stack) {
                            informationHTML += 'Stack: <br/> <small><code>' + v.stack.replace(/ {2}at /g, '<br />&nbsp;&nbsp;&nbsp;at ') + '</code></small><br />';
                            console.error('Org Check - Error #' + i, v);
                        }
                        informationHTML += '<br />';
                    });
                    private_show_modal(
                        textTitle || 'Oh no, Org Check had an error!', 
                        commonHTML + informationHTML.replace(/https:\/\/[^/]*/g, ''),
                        imageTitle || '/img/msg_icons/error32.png'
                    );
                } catch (e) {
                    // Just in case we have an error during the showError!!
                    console.error(e);
                }
            }
        };

        /**
        * Show dialog box with a title and content
        * @param title String title
        * @param content String html or NodeElement representing the content of the box
        * @param image the icon or image to show on this modal (optional)
        */
        this.showModal = function (title, element, image) {
            private_show_modal(title, element, image);
        };

        /**
        * Show warning message
        * @param message String or Array<String> the message(s)
        */
        this.showWarning = function (message) {
            const messages = (Array.isArray(message) ? message : [ message ]); 
            //const nbMessages = messages.length;
            const warningsDiv = document.getElementById(configuration.warningMessagesId);
            messages.forEach((msg, idx) => {
                let warningDiv = warningsDiv.children[0];
                if (idx > 0) {
                    warningDiv = warningsDiv.appendChild(warningDiv.cloneNode(true));
                    warningDiv.style['border-top-style'] = 'dotted';
                }
                warningDiv.children[1].innerHTML = '<p>'+msg+'</p>';
            });
            warningsDiv.style.display = 'block';
        };

        /**
        * Hide warning banner and empty the message
        */
        this.hideWarning = function () {
            const warningsDiv = document.getElementById(configuration.warningMessagesId);
            warningsDiv.style.display = 'none';
            // remove previous additional messages (keep the first one only)
            for (let i=1; i<warningsDiv.childElementCount; i++) {
                warningsDiv.removeChild(warningsDiv.lastChild);
            }
        };

        /**
        * Show the modal dialog box
        * @param title
        * @param element Html element to show in the modal box
        * @param image Optional image to show in the modal box on the left
        */
        function private_show_modal(title, element, image) {
            const header = document.getElementById(configuration.modalTitleId);
            const content = document.getElementById(configuration.modalContentId);
            header.textContent = title;
            if (content.firstElementChild) {
                content.removeChild(content.firstElementChild);
            }
            if (typeof element == 'string') {
                const span = document.createElement('span');
                span.innerHTML = element;
                content.appendChild(span);
            } else {
                content.appendChild(element);
            }
            if (image) {
                const imagediv = document.getElementById(configuration.modalImageId);
                if (imagediv.firstElementChild) {
                    imagediv.removeChild(imagediv.firstElementChild);
                }
                if (typeof image == 'string') {
                    const img = document.createElement('img');
                    img.src = image;
                    imagediv.appendChild(img);
                } else {
                    imagediv.appendChild(image);
                }
            }
            document.getElementById(configuration.modalId).style.display = 'block';
        }
    },


    /**
     * Progress bar decorator
     * @param configuration Object must contain 'spinnerDivId' and 'spinnerMessagesId'
     */
    ProgressBarHandler: function (configuration) {

        const SPINNER_DIV = document.getElementById(configuration.spinnerDivId);
        const SPINNER_MSG_DIV = document.getElementById(configuration.spinnerMessagesId);

        /**
        * Reset the progress bar with current value at zero and an empty message
        */
        this.reset = function () {
            SPINNER_MSG_DIV.innerHTML = '';
        };

        this.addSection = function(sectionName, message) {
            SPINNER_MSG_DIV.innerHTML += 
                '<li class="slds-progress__item" id="spinner-section-'+sectionName+'">'+
                    '<div class="slds-progress__marker"></div>'+
                    '<div class="slds-progress__item_content slds-grid slds-grid_align-spread" id="spinner-section-msg-'+sectionName+'">'+message+'</div>'+
                '</li>';
        };

        /**
        * Set the progress message with a given value
        * @param message message to display
        * @param status 'initialized', 'started', 'failed', 'ended'
        * @param section optional section name
        */
        this.setSection = function (sectionName, message, status) {
            const li = document.getElementById('spinner-section-'+sectionName);
            if (li) {
                li.classList.remove('slds-has-error','slds-is-completed','slds-is-active');
                switch (status) {
                    case 'started': 
                        li.classList.add('slds-is-completed');
                        li.children[0].style['border-color'] = '';
                        li.children[0].style['background-image'] = 'url(/img/loading.gif)';
                        li.children[0].style['background-size'] = '8px';
                        break;
                    case 'ended': 
                        li.classList.add('slds-is-completed'); 
                        li.children[0].style['border-color'] = 'green';
                        li.children[0].style['background-image'] = 'url(/img/func_icons/util/checkmark16.gif)';
                        li.children[0].style['background-size'] = '8px';
                        break;
                    case 'failed': 
                        li.classList.add('slds-has-error'); 
                        li.children[0].style['border-color'] = '';
                        li.children[0].style['background-image'] = 'url(/img/func_icons/remove12_on.gif)';
                        li.children[0].style['background-size'] = '8px';
                        break;
                }
            }
            const msg = document.getElementById('spinner-section-msg-'+sectionName);
            if (msg) {
                msg.innerText = message;
            }
        };

        /**
        * Hide the spinner and toast
        */
        this.hide = function () {
            SPINNER_DIV.style.display = 'none';
        };

        /**
        * Show the spinner and toast
        */
        this.show = function () {
            SPINNER_DIV.style.display = 'block';
        };
    }
}
