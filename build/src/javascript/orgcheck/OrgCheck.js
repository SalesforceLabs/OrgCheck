/**
 * OrgCheck main object
 */
 const OrgCheck = {

    /**
     * Org Check Version
     */
    version: 'Lithium [Li,3]',
   
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
                    if (d.type === 'OrgTypeProd' && PREFERENCE_CACHE_HANDLER.getItemProperty('Options', 'warning.ByPassUseInProduction', true) === true) {
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
                        MSG_HANDLER.showError(error, false);
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

        const DATATABLE_HANDLER = new OrgCheck.VisualComponents.DatatableHandler({
            StringHandler: STRING_HANDLER,
            DateHandler: DATE_HANDLER,
            MessageHandler: MSG_HANDLER
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

                    // 3. Buttons actions based on the map (from datasets)
                    const initActions = function(map) {
                        // 3.1 Set the clear cache button (if specified)
                        if (ctlSetup.actions && ctlSetup.actions.clearCache && ctlSetup.actions.clearCache.show === true) { 
                            const buttonClearCache = document.getElementById('button-clear-page-cache');
                            buttonClearCache.onclick = function(e) { 
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
                            buttonExport.onclick = function(e) { 
                                let isSomethingToExport = false;
                                let reasonNoExport = '';
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
                                                if (v && v.indexOf(',')  != -1) v = '"'+v+'"';
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
                        initActions(map);
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
                            errorDatasetDecorator: (ds, error) => PROGRESSBAR_HANDLER.setSection('dataset-'+ds, 'Dataset ['+ds+']: ended with an error', 'failed'),
                            startMappingDecorator: () => PROGRESSBAR_HANDLER.setSection('mapping', 'Mapping process starting...', 'started'),
                            successMappingDecorator: () => PROGRESSBAR_HANDLER.setSection('mapping', 'Mapping process ended successfuly', 'ended'),
                            errorMappingDecorator: (error) => PROGRESSBAR_HANDLER.setSection('mapping', 'Mapping process ended with an error', 'failed'),
                            startDependenciesDecorator: () => PROGRESSBAR_HANDLER.setSection('dependencies', 'Dependencies process starting...', 'started'),
                            successDependenciesDecorator: () => PROGRESSBAR_HANDLER.setSection('dependencies', 'Dependencies process ended successfuly', 'ended'), 
                            errorDependenciesDecorator: (error) => PROGRESSBAR_HANDLER.setSection('dependencies', 'Dependencies process ended with an error', 'failed'),
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
                            .on('record', (r, i) => {
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
                                        'WHERE Id IN ('+SALESFORCE_HANDLER.secureSOQLBindingVariable(classIds)+')'
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
                                                    'We asked Salesforce to recompile the following Apex Classes:<br />'+
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
                            if (b) return '<img src="/img/checkbox_checked.gif" alt="true" />';
                            return '<img src="/img/checkbox_unchecked.gif" alt="false" />';
                        },
                        link: function(uri, content) {
                            return '<a href="' + SALESFORCE_HANDLER.getEndpointUrl() + uri + '" target="_blank" rel="external noopener noreferrer">' + content + '</a>';
                        },
                        icon: function(name) {
                            switch (name) {
                                // img url check http://www.vermanshul.com/2017/10/quick-tips-salesforce-default-images.html
                                case 'greenFlag':  return '<img src="/img/samples/flag_green.gif" alt="green flag" />';
                                case 'redFlag':    return '<img src="/img/samples/flag_red.gif" alt="red flag" />';
                                case 'group':      return '<img src="/img/icon/groups24.png" alt="group" />';
                                case 'user':       return '<img src="/img/icon/alohaProfile16.png" alt="user" />';
                                case 'star0':      return '<img src="/img/samples/stars_000.gif" alt="star-0" />';
                                case 'star1':      return '<img src="/img/samples/stars_100.gif" alt="star-1" />';
                                case 'star2':      return '<img src="/img/samples/stars_200.gif" alt="star-2" />';
                                case 'star3':      return '<img src="/img/samples/stars_300.gif" alt="star-3" />';
                                case 'star4':      return '<img src="/img/samples/stars_400.gif" alt="star-4" />';
                                case 'star5':      return '<img src="/img/samples/stars_500.gif" alt="star-5" />';
                                case 'org':        return '<img src="/img/msg_icons/confirm16.png" alt="org level" />';
                                default:           return '';
                            }
                        },
                        color: function(label) {
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
                        }, 
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
        };

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
            const root = d3.hierarchy(rootData);

            // Set size
            let mdepth = 0;
            root.each(function(d) {
                if (mdepth < d.depth) mdepth = d.depth;
            });
            const width = BOX_WIDTH * (mdepth * 2 + 4);
            root.dx = BOX_HEIGHT + BOX_PADDING;
            root.dy = width / (root.height + 1);

            // Generate tree
            const tree = d3.tree().nodeSize([root.dx, root.dy])(root);

            // Define x0 and x1
            let x0 = Infinity;
            let x1 = -x0;
            root.each(function(d) {
                if (d.x > x1) x1 = d.x;
                if (d.x < x0) x0 = d.x;
                if (mdepth < d.depth) mdepth = d.depth;
            });

            // Construction of graph
            const svg = d3.create('svg')
                .attr('id', function(d, i) { return (tagId + 'svg' + i); })
                .attr('viewBox', [0, 0, width, x1 - x0 + root.dx * 2])
                .attr('xmlns', 'http://www.w3.org/2000/svg');
            
            const g = svg.append('g')
                .attr('id', function(d, i) { return (tagId + 'g' + i); })
                .attr('font-family', 'Salesforce Sans,Arial,sans-serif')
                .attr('font-size', '10')
                .attr('transform', `translate(${root.dy / 2},${root.dx - x0})`);
            
            const link = g.append('g')
                .attr('id', function(d, i) { return (tagId + 'link' + i); })
                .attr('fill', 'none')
                .attr('stroke', '#555')
                .attr('stroke-opacity', 0.4)
                .attr('stroke-width', 1.5)
                .selectAll('path')
                .data(root.links())
                .join('path')
                .attr('d', d3.linkHorizontal()
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
        };

    }
};