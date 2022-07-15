/**
 * OrgCheck main object
 */
 const OrgCheck = {

    /**
     * OrgCheck Version
     */
    version: 'Hydrogen [H,1]',

    /**
     * Organization Id where OrgCheck is currently installed
     */
    localOrgId: '',

    /**
     * Current User Id where OrgCheck is currently launched
     */
    localUserId: '',

    /**
     * Current limit informations
     */
    limitInfo: {},

    /**
     * Dataset representation
     * @param setup JSON configuration including:
     *              <ol>
     *                <li><code>name</code>: Technical name of this dataset (used in controller)</li>
     *                <li><code>keycache</code>: Key used when caching the data in localStorage</li>
     *                <li><code>retriever</code>: Retreiver function with success and error callback methods</li>
     *              </ol>
     */
    Dataset: function (setup) {
        const THAT = this;
        this.getName = function() { return setup.name };
        this.getKeyCache = function() { return setup.keycache };
        this.getRetriever = function() { return function(s, e) { setup.retriever(THAT, s, e) } };
    },
   
    /**
     * OrgCheck core
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
     *                <li><code>htmlWarningMessageTagId</code>: HTML Tag Id of the message</li>
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

        const PERSISTANT_CACHE_HANDLER = new OrgCheck.CacheHandler({
            isPersistant: true,
            cachePrefix: CACHE_PREFIX
        });

        const TEMPORARY_CACHE_HANDLER = new OrgCheck.CacheHandler({
            isPersistant: false,
            cachePrefix: CACHE_PREFIX
        });

        const MAP_HANDLER = new OrgCheck.DataTypes.MapHandler({
            keySize: MAP_KEYSIZE,
            keyExcludePrefix: '__'            
        });

        const ARRAY_HANDLER = new OrgCheck.DataTypes.ArrayHandler();

        const MSG_HANDLER = new OrgCheck.VisualComponents.MessageHandler({
            modalContentId: setup.htmlModalContentTagId,
            modalId: setup.htmlModalTagId,
            modalTitleId: setup.htmlModalTitleTagId,
            warningMessageId: setup.htmlWarningMessageTagId
        });

        const PROGRESSBAR_HANDLER = new OrgCheck.VisualComponents.ProgressBarHandler({
            spinnerDivId: setup.htmlSpinnerTagId,
            spinnerMessagesId: setup.htmlSpinnerMessagesTagId
        });
        
        const SALESFORCE_HANDLER = new OrgCheck.SalesforceHandler({
            id: setup.sfLocalAccessToken.split('!')[0],
            version: setup.sfApiVersion,
            accessToken: setup.sfLocalAccessToken,
            userId: setup.sfLocalCurrentUserId
        });

        // Set global information about org (in case of showError mainly)
        OrgCheck.localOrgId = SALESFORCE_HANDLER.getOrgId();
        OrgCheck.localUserId = SALESFORCE_HANDLER.getCurrentUserId();

        const FORMAT_HANDLER = new OrgCheck.DataTypes.DateHandler({ 
            defaultLanguage: setup.formatDefaultLanguage,
            defaultDateFormat: setup.formatDefaultDate,  
            defaultDatetimeFormat: setup.formatDefaultDatetime 
        });

        const SECURITY_HANDLER = new OrgCheck.DataTypes.SecurityHandler();

        const DATATABLE_HANDLER = new OrgCheck.VisualComponents.DatatableHandler({
            SecurityHandler: SECURITY_HANDLER,
            DateHandler: FORMAT_HANDLER
        });

        // ======================================================
        // DATASETS LAYER
        // ======================================================

        /**
         * This is a collection of dataset
         */
        const private_datasets_collection = {};

        /**
         * Add a dataset in the internal list
         * @param dataset Object of type OrgCheck.Dataset
         */
        this.addDataset = function(dataset) {
            private_datasets_collection[dataset.getName()] = {
                keycache: dataset.getKeyCache(),
                retriever: dataset.getRetriever()
            };
        };

        // ======================================================
        // CACHE LAYER
        // ======================================================

        /**
         * Get metadata item from cache
         * @param key in cache
         * @return the value in cache, undefined if not present in cache
         */
        this.getMetadataInCache = function(key) {
            return PERSISTANT_CACHE_HANDLER.getItem(CACHE_SECTION_METADATA, key);
        };
        
        /**
         * Set metadata item from cache
         * @param key in cache
         * @param value in cache
         */
        this.setMetadataInCache = function(key, value) {
            return PERSISTANT_CACHE_HANDLER.setItem(CACHE_SECTION_METADATA, key, value);
        };

        // ======================================================
        // CONTROLLER LAYER 
        // ======================================================

        /**
         * The OrgCheck controller
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
                        MSG_HANDLER.showError(error);
                        PROGRESSBAR_HANDLER.reset();
                        PROGRESSBAR_HANDLER.hide();
                        document.getElementById(setup.htmlMainContentTagId).style.display = 'none';
                    };

                    // 1. Check properties of ctlSetup
                    try {
                        if (!ctlSetup.datasets) throw '"datasets" property is undefined';
                        if (!Array.isArray(ctlSetup.datasets)) throw '"datasets" property is not an array';
                        ctlSetup.datasets.forEach(dataset => {
                            if (!dataset) throw '"datasets" property contains an undefined/null/empty value';
                            if (typeof dataset !== 'string') throw '"datasets" property should contain only string values';
                            const ds = private_datasets_collection[dataset];
                            if (!ds || !ds.retriever || typeof ds.retriever !== 'function') throw '"datasets" property should point to a known data retreiver (dataset causing the issue is '+dataset+')';
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
                    if (ctlSetup.dependencies) {
                        PROGRESSBAR_HANDLER.addSection('dependencies', 'Dependencies: initialize...', 'initialized');
                    }
                    PROGRESSBAR_HANDLER.addSection('mapping', 'Mapping: initialize...', 'initialized');
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
                                    const ds = private_datasets_collection[dataset];
                                    PERSISTANT_CACHE_HANDLER.clear(CACHE_SECTION_METADATA, ds.keycache);
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
                    const onLoadPromises = [];
                    ctlSetup.datasets.forEach(d => onLoadPromises.push(new Promise(function(s, e) { 
                        PROGRESSBAR_HANDLER.setSection('dataset-'+d, 'Dataset ['+d+']: starting...', 'started');
                        private_datasets_collection[d].retriever(
                            function(m) {
                                PROGRESSBAR_HANDLER.setSection('dataset-'+d, 'Dataset ['+d+']: ended successfuly', 'ended');
                                s(m);
                            }, function(m) {
                                PROGRESSBAR_HANDLER.setSection('dataset-'+d, 'Dataset ['+d+']: ended with an error', 'failed');
                                e(m);
                            }
                        ); 
                    })));

                    // 6. Calling the dataset retreivers
                    Promise.all(onLoadPromises)
                        .then(function(results) {
                            PROGRESSBAR_HANDLER.setSection('mapping', 'Mapping process starting...', 'started');
                            // 7. When all datasets are retreived, we calculate keys and map
                            const map = {};
                            let keys = [];
                            results.forEach((v, i) => {
                                map[ctlSetup.datasets[i]] = v;
                                keys = ARRAY_HANDLER.concat(keys, MAP_HANDLER.keys(v));
                            });
                            PROGRESSBAR_HANDLER.setSection('mapping', 'Mapping process ended successfuly', 'ended');
                            return { m: map, k: keys };
                        })
                        .catch(function(error) {
                            PROGRESSBAR_HANDLER.setSection('mapping', 'Mapping process ended with an error', 'failed');
                            showError(error);
                        }) 
                        .then(function(data) {
                            if (data) { // check if no error during mapping
                                // 8. If we were asked to get the dependencies of all Salesforce Ids in the map
                                if (ctlSetup.dependencies === true) {
                                    PROGRESSBAR_HANDLER.setSection('dependencies', 'Dependencies process starting...', 'started');
                                    private_salesforce_dapi(
                                        data.k, 
                                        function(dependencies) { 
                                            PROGRESSBAR_HANDLER.setSection('dependencies', 'Dependencies process ended successfuly', 'ended');
                                            // We are altering the map to include the dependencies
                                            data.m['dependencies'] = dependencies || {};
                                            // 9.1 And then call the method (with dependencies)
                                            onEnd(data.m);
                                        }, 
                                        function(error) {
                                            PROGRESSBAR_HANDLER.setSection('dependencies', 'Dependencies process ended with an error', 'failed');
                                            showError(error);
                                        }
                                    );
                                } else {
                                    // 9.2 Calling the method (no dependencies)
                                    onEnd(data.m);
                                }
                            }
                        })
                        .catch(function(error) {
                            showError(error);
                        });
                }
            };
        }

        // ======================================================
        // HELPER LAYER
        // ======================================================

        /**
         * The OrgCheck helper
         */
        this.getHelper = function() {
            return {
                salesforce: {
                    describe: {
                        object: function(pckg, obj, success, error) {
                            private_salesforce_describe_object({
                                namespaceName: pckg,
                                objectName: obj, 
                                callbackSuccess: success,
                                callbackError: error
                            });
                        }
                    },
                    apex: {
                        runAllLocalTests: function() {
                            return SALESFORCE_HANDLER.doHttpCall(
                                '/tooling/runTestsAsynchronous', 
                                r => console.debug(r), 
                                r => console.error(r), 
                                { 
                                    body: '{ "testLevel": "RunLocalTests", "skipCodeCoverage": "false" }', 
                                    type: 'application/json' 
                                }
                            );
                        }
                    },
                    version: {
                        isOld: function(version) {
                            return SALESFORCE_HANDLER.isVersionOld(version, 3);
                        }
                    }
                },
                cache: {
                    metadata: {
                        clearAll: function() {
                            PERSISTANT_CACHE_HANDLER.clearAll(CACHE_SECTION_METADATA);
                        },
                        keys: function() {
                            return PERSISTANT_CACHE_HANDLER.keys(CACHE_SECTION_METADATA);
                        },
                        sideValues: function(key) {
                            return PERSISTANT_CACHE_HANDLER.sideValues(CACHE_SECTION_METADATA, key);
                        },
                        clear: function(key) {
                            return PERSISTANT_CACHE_HANDLER.clear(CACHE_SECTION_METADATA, key);
                        }
                    }
                },
                information: {
                    showMainContent: function() {
                        document.getElementById(setup.htmlMainContentTagId).style.display = 'block';
                    }
                },
                preferences: {
                    get: function(key) {
                        const map = PERSISTANT_CACHE_HANDLER.getItem(CACHE_SECTION_PREFERENCE, 'Options') || {};
                        const value = map[key];
                        if (value === undefined) return true;
                        return value;
                    },
                    set: function(key, value) {
                        const map = PERSISTANT_CACHE_HANDLER.getItem(CACHE_SECTION_PREFERENCE, 'Options') || {};
                        map[key] = value;
                        PERSISTANT_CACHE_HANDLER.setItem(CACHE_SECTION_PREFERENCE, 'Options', map);
                    }
                },
                array: {
                    concat: function(array1, array2, prop) {
                        return ARRAY_HANDLER.concat(array1, array2, prop);
                    }
                },
                map: {
                    keys: function(map) {
                        return MAP_HANDLER.keys(map);
                    },
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
                    }
                },
                timestamp: {
                    to: {
                        datetime: function(ts) {
                            return FORMAT_HANDLER.datetimeFormat(ts);
                        },
                        date: function(ts) {
                            return FORMAT_HANDLER.dateFormat(ts);
                        }
                    }
                },
                error: {
                    show: function(error) {
                        MSG_HANDLER.showError(error);
                    }
                },
                html: {
                    modal: {
                        show: function(title, el) {
                            MSG_HANDLER.showModal(title, el);
                        }
                    },
                    message: {
                        show: function(message, type) {
                            MSG_HANDLER.showWarning(message);
                        },
                        hide: function() {
                            MSG_HANDLER.hideWarning();
                        }
                    },
                    progress: {
                        show: function() {
                            PROGRESSBAR_HANDLER.show();
                        },
                        hide: function() {
                            PROGRESSBAR_HANDLER.hide();
                        },
                        resetSections: function() {
                            PROGRESSBAR_HANDLER.reset();
                        },
                        addSection: function(sectionName, message) {
                            PROGRESSBAR_HANDLER.addSection(sectionName, message);
                        },
                        setSection: function (sectionName, message, status) {
                            PROGRESSBAR_HANDLER.setSection(sectionName, message, status);
                        }
                    },
                    datatable: {
                        create: function(config) {
                            if (!Array.isArray(config.data)) config.datakeys = MAP_HANDLER.keys(config.data);
                            DATATABLE_HANDLER.create(config);
                            /*
                            SECURITY_HANDLER.htmlSecurise(row[c.property]);
                        if (c.type && !c.formula) {
                            switch (c.type) {
                                case 'date': dataDecorated = services.Formatable_Date__dateFormat(dataRaw); break;
                                case 'datetime': dataDecorated = services.Formatable_Date__datetimeFormat

                            ).create(config);*/
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
                        format: function(label, ...parameters) {
                            if (label) return label.replace(/{(\d+)}/g, (m, n) => { return parameters[n] ? parameters[n] : m; });
                            return '';
                        },
                        escape: function(unsafe) { 
                            return private_secure_html(unsafe); 
                        },
                        dependencies: function(id, name, data) {
                            const div = document.createElement('div');
                            div.innerHTML = '<a>Dependencies <img src="/img/chatter/lookupSearchHover.png" /></a>';
                            div.setAttribute('id', 'chart-container-' + id);
                            div.style.cursor = 'zoom-in';
                            div.onclick = function() {
                                const information = document.createElement('div');
                                information.appendChild(private_compute_dependencies_graph('dep'+id, name, data, '#5fc9f8'));
                                information.appendChild(private_compute_dependencies_tabular('dep2'+id, name, data));
                                MSG_HANDLER.showModal('Dependencies Graphical and Tabular Information', information); 
                            };
                            return div;
                        },
                        whatIsItUsing: function(id, data) {
                            if (data && data.using) {
                                const types = MAP_HANDLER.keys(data.using);
                                if (types) {
                                    let count = 0;
                                    types.forEach(u => count += MAP_HANDLER.keys(data.using[u]).length);
                                    return count;
                                }
                            }
                            return 0;
                        },
                        whereIsItUsed: function(id, data) {
                            if (data && data.used) {
                                const types = MAP_HANDLER.keys(data.used);
                                if (types) {
                                    let count = 0;
                                    types.forEach(u => count += MAP_HANDLER.keys(data.used[u]).length);
                                    return count;
                                }
                            }
                            return 0;
                        },
                        whereIsItUsedBy: function(id, typeAPI, data) {
                            if (data) {
                                const usedTypes = MAP_HANDLER.keys(data.used);
                                if (usedTypes && typeAPI) {
                                    const idx = usedTypes.indexOf(typeAPI);
                                    if (idx >= 0) {
                                        return MAP_HANDLER.keys(data.used[typeAPI]).length;
                                    }
                                }
                            }
                            return 0;
                        },
                        percentage: function(v) {
                            if (v) {
                                const vv = Number.parseFloat(v);
                                if (!Number.isNaN(vv)) return (vv*100).toFixed(2) + ' %';
                            }
                            if (v === 0) return '0 %';
                            return '';
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
                                default:           return '';
                            }
                        },
                        shrinkText: function(value, size=150, appendStr='...') {
                            if (value && value.length > size) {
                                return value.substr(0, size) + appendStr;
                            }
                            return value;
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
         * Returns systematically an ID15 based on the ID18
         * @param id to simplify
         */
        this.doSimplifiySalesforceID = function(id) {
            return SALESFORCE_HANDLER.salesforceIdFormat(id);
        };

        /**
         * Returns the string representation of a given date using the user's preferences
         * @param value to format (number if a timestamp, string otherwise)
         */
        this.doFormatDate = function(value) {
            return FORMAT_HANDLER.dateFormat(value);
        };

        /**
         * Returns the string representation of a given datetime using the user's preferences
         * @param value to format (number if a timestamp, string otherwise)
         */
        this.doFormatDatetime = function(value) {
            return FORMAT_HANDLER.datetimeFormat(value);
        };

        this.doSetSizeInMap = function(map, size) {
            MAP_HANDLER.setSize(map, size);
        };

        /**
         * Data retriever with cache
         * @param setup JSON configuration including:
         *              <ol>
         *                <li><code>mnemonic</code>: tag used for caching this data</li>
         *                <li><code>doDataRetriever</code>: function with a callback function parameter used to set the cache if needed</li> 
         *                <li><code>onEachFromCache</code>: function called for each record of the map stored in the cache </li> 
         *                <li><code>onEndFromCache</code>: function called for the map stored in the cache</li> 
         *                <li><code>onError</code>: function called if an error happens</li> 
         *              </ol>
         */
        this.doRetrieveDataWithCache = function(setup) {
            try {
                PERSISTANT_CACHE_HANDLER.cache(
                    CACHE_SECTION_METADATA,
                    setup.mnemonic, 
                    setup.doDataRetriever, 
                    function(records, isFromCache) {
                        if (setup.onEachFromCache) {
                            MAP_HANDLER.forEach(records, function(id) {
                                setup.onEachFromCache(records[id]);
                            });
                        }
                        if (setup.onEndFromCache) {
                            setup.onEndFromCache(records);
                        }
                    }
                );
            } catch (error) {
                if (setup.onError) {
                    setup.onError(error);
                }
            }
        };

        /**
         * Data retriever with cache for SOQL queries
         * @param setup JSON configuration including:
         *              <ol>
         *                <li><code>queries</code>: array describing the queries you want to execute ; for each you set the query and if you use the tooling api or not </li>
         *                <li><code>onEachRecordFromAPI</code>: function called for each record retrieved from database</li>
         *                <li><code>mnemonic</code>: tag used for caching this data</li>
         *                <li><code>doDataRetriever</code>: function with a callback function parameter used to set the cache if needed</li> 
         *                <li><code>onEachFromCache</code>: function called for each record of the map stored in the cache </li> 
         *                <li><code>onEndFromCache</code>: function called for the map stored in the cache</li> 
         *                <li><code>onError</code>: function called if an error happens</li> 
         *              </ol>
         */
        this.doSalesforceQueriesWithCache = function(setup) {
            this.doRetrieveDataWithCache({
                mnemonic: setup.mnemonic,
                doDataRetriever: function(callbackToSetTheCache) {
                    SALESFORCE_HANDLER.doQueries(
                        setup.queries, 
                        function(record, index, dataSize, totalSize) {
                            try {
                                return setup.onEachRecordFromAPI(record, index, dataSize, totalSize);
                            } catch(error) {
                                setup.onError(error);
                            }
                        }, 
                        function(records, size) {
                            try {
                                MAP_HANDLER.setSize(records, size);
                                callbackToSetTheCache(records);
                            } catch(error) {
                                setup.onError(error);
                            }
                        },
                        setup.onError
                    );
                },
                onEachFromCache: setup.onEachFromCache,
                onEndFromCache: setup.onEndFromCache,
                onError: setup.onError
            });
        };

        /**
         * Data retriever without cache for SOQL queries
         * @param setup JSON configuration including:
         *              <ol>
         *                <li><code>queries</code>: array describing the queries you want to execute ; for each you set the query and if you use the tooling api or not </li>
         *                <li><code>onEachRecord</code>: function called for each record retrieved from database</li>
         *                <li><code>onEnd</code>: function called when all records were retrieved from database</li> 
         *                <li><code>onError</code>: function called if an error happens</li> 
         *              </ol>
         */
        this.doSalesforceQueries = function(setup) {
            SALESFORCE_HANDLER.doQueries(
                setup.queries, 
                function(record, index) {
                    try {
                        return setup.onEachRecord(record, index);
                    } catch(error) {
                        setup.onError(error);
                    }
                }, 
                function(records, size) {
                    try {
                        return setup.onEnd(records, size);
                    } catch(error) {
                        setup.onError(error);
                    }
                },
                setup.onError
            );
        }

        this.isVersionOld = function(setup) {
            return SALESFORCE_HANDLER.isVersionOld(
                setup.apiVersion
            );
        }

        /**
         * Metadata retriever without cache
         * @param setup JSON configuration including:
         *              <ol>
         *                <li><code>types</code>: List of types of metadata to retrieve</li> 
         *                <li><code>onEnd</code>: function called when all records were retrieved from database</li> 
         *                <li><code>onError</code>: function called if an error happens</li> 
         *              </ol>
         */
        this.doSalesforceMetadataRetrieve = function(setup) {
            SALESFORCE_HANDLER.doMetadataRetrieve(
                setup.types, 
                setup.onEnd,
                setup.onError
            );
        }

        /**
         * Helper to extract the package and developer name
         * @param fullDeveloperName Developer Name
        */
        this.doSalesforceSplitDeveloperName = function(fullDeveloperName) {
            return SALESFORCE_HANDLER.splitDeveloperName(fullDeveloperName);
        };

        /**
         * Do a global describe on the salesforce org
         * @param setup JSON configuration including:
         *              <ol>
         *                <li><code>onEnd</code>: Callback function to call with the results from global describe</li>
         *                <li><code>onError</code>: Callback function to call if there is an error</li>
         *              </ol>
         */
        this.doSalesforceGlobalDescribe = function(setup) {
            SALESFORCE_HANDLER.doDescribeGlobal(setup.onEnd, setup.onError);
        };

        /**
         * Return an HTML-safer version of the given string value
         * @param unsafe String to be escaped (no change if null or not a string type)
         */
        function private_secure_html(unsafe) {
            if (unsafe === undefined || Number.isNaN(unsafe) || unsafe === null) return '';
            if (typeof(unsafe) !== 'string') return unsafe;
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        /**
         * Return an SOQL-safer version of the given string value
         * @param unsafe String to be escaped
         */
        function private_secure_soql(unsafe) {
            // If unset the default, return value is an empty string
            if (!unsafe) return "''";
            
            // If not a string typed value, return value is itself (case of a numeric)
            if (typeof(unsafe) !== 'string') return unsafe;
            
            // If a string value, we substitute the quotes
            return "'" + unsafe.replace(/'/g, "\'") + "'";
        };

        /**
         * Return an SOQL-safer version of the given string value
         * @param unsafe String to be escaped
         */
        this.doSecureSOQLBindingVariable = function(unsafe) {
            return private_secure_soql(unsafe);
        }

        /**
         * Make sure the current user has enough rights on SObjects (only for REST queries)
         * @param setup JSON configuration including:
         *              <ol>
         *                <li><code>sobjects</code>: Map with keys as SObject API names and value as an Array of Field API Names</li>
         *                <li><code>onEnd</code>: Callback function to call with the results from global describe</li>
         *                <li><code>onError</code>: Callback function to call if there is an error</li>
         *              </ol>
         */
        this.doSecureSobjectReadEnforcement = function(setup) {
            const queries = [];
            const currentUser = OrgCheck.localUserId;
            let sobjectsList = [];
            let fieldsList = [];
            for (const [sobject, fields] of Object.entries(setup.sobjects)) {
                sobjectsList.push(sobject); 
                fields.filter(f => !f.endsWith('Id') && !f.startsWith('UserPreferences'));
                fields.forEach(f => fieldsList.push(sobject+'.'+f+'.'+currentUser)); 
                // Note: UserFieldAccess does not like including Lookup Ids that why we are filtering out 'fields'
            }
            sobjectsList.forEach(sobject =>
                queries.push({
                    tooling: true,
                    string: 'SELECT DurableId, IsReadable '+
                            'FROM UserEntityAccess '+
                            'WHERE UserId='+ private_secure_soql(currentUser) +' '+
                            'AND EntityDefinition.QualifiedApiName = '+ private_secure_soql(sobject) +' '+
                            'AND IsReadable = false'
                })
            );
            sobjectsList.forEach(field =>
                queries.push({
                    tooling: true,
                    string: 'SELECT DurableId, IsAccessible '+
                            'FROM UserFieldAccess '+
                            'WHERE DurableId = '+ private_secure_soql(field) +' '+
                            'AND IsAccessible = false'
                })
            );
            SALESFORCE_HANDLER.doQueries(
                queries, 
                (record) => {}, 
                (records, size) => { 
                    if (size > 0) {
                        setup.onError({
                            'when': 'FLS/CRUD Enforcement: you need to assign yourself the <b>OrgCheck Users</b> permission set.',
                            'what': {
                                'Objects and fields': setup.sobjects,
                                'Number of FLS or CRUD not compatible': size,
                                'Details': records
                            }
                        });
                    } else {
                        setup.onEnd(); 
                    }
                },
                setup.onError
            );
        }

        /**
         * Compute the dependencies tabular view
         * @param tagId id of the entity
         * @param name of the entity we want to analyze the dependencies
         * @param data Returned by the doSalesforceDAPI method
         */
        function private_compute_dependencies_tabular(tagId, name, data) {
            const tabularView = [];
            ['used', 'using'].forEach(category => {
                const types = data[category];
                if (types) for (const type in types) {
                    const references = types[type];
                    for (const referenceId in references) {
                        tabularView.push({ 
                            target: name, 
                            relation: category, 
                            refId: referenceId, 
                            refName: references[referenceId].name,
                            refType: type
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
         * @param boxColor Color of each box
         */
        function private_compute_dependencies_graph(tagId, name, data, boxColor) {

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
                if (d) {
                    for (const type in d) {
                        const refs = d[type];
                        const kidsForType = [];
                        for (const rid in refs) {
                            kidsForType.push({ id: rid, name: refs[rid].name });
                        }
                        e.children.push({ name: type, children: kidsForType });
                    }
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
                .attr('fill', function(d) { return boxColor; })
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
                .append('xhtml').html(d => '<span class="slds-hyphenate" style="text-align: center;">' + private_secure_html(d.data.name) + '</span>');

            return svg.node();
        };

        /**
         * Call the Dependency API (synchronous version)
         * @param ids Array of IDs that we are interested in
         * @param callbackSuccess Callback method in case of a success with the resulting map
         * @param callbackError Callback method in case of an error
         */
        function private_salesforce_dapi(ids, callbackSuccess, callbackError) {
            const map = {};

            if (ids.length == 0) {
                callbackSuccess();
                return;
            }

            const MAX_IDS_IN_QUERY = 50; // max is 2000 records, so avg of 40 dependencies for each id
            const queries = [];
            let subids = '';
            ids.forEach((v, i, a) => {
                const batchFull = (i != 0 && i % MAX_IDS_IN_QUERY === 0);
                const lastItem = (i === a.length-1);
                subids += private_secure_soql(v);
                if (batchFull === true || lastItem === true) { 
                    queries.push({
                        tooling: true,
                        string: 'SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, '+
                                    'RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType '+
                                'FROM MetadataComponentDependency '+
                                'WHERE (RefMetadataComponentId IN (' + subids + ') '+
                                'OR MetadataComponentId IN (' + subids+ ')) ',
                        queryMore: false
                    });
                    subids = '';
                } else {
                    subids += ',';
                }
            });

            SALESFORCE_HANDLER.doQueries(
                queries, 
                function(record) {
                    try {
                        const aId = SALESFORCE_HANDLER.salesforceIdFormat(record.MetadataComponentId);
                        const aType = record.MetadataComponentType;
                        const aName = record.MetadataComponentName;
                        const bId = SALESFORCE_HANDLER.salesforceIdFormat(record.RefMetadataComponentId);
                        const bType = record.RefMetadataComponentType;
                        const bName = record.RefMetadataComponentName;
                        let b = map[bId];
                        if (!b) b = map[bId] = {};
                        if (!b.used) b.used = {};
                        if (!b.used[aType]) b.used[aType] = [];
                        b.used[aType][aId] = { name: aName };
                        let a = map[aId];
                        if (!a) a = map[aId] = {};
                        if (!a.using) a.using = {};
                        if (!a.using[bType]) a.using[bType] = [];
                        a.using[bType][bId] = { name: bName };
                        return {};
                    } catch (e) {
                        callbackError(e);
                    }
                }, 
                function() {
                    callbackSuccess(map);
                },
                callbackError
            );
        };

        /**
         * Get description of an object (mix of JSForce and SOQL query in Tooling API)
         * @param setup JSON configuration including:
         *              <ol>
         *                <li><code>namespaceName</code>: Name of the package for the object to get the description</li>
         *                <li><code>objectName</code>: Name of the object to get the description (may contain the namespace already)</li>
         *                <li><code>callbackSuccess</code>: function called in case of a successful describe query</li>
         *                <li><code>callbackError</code>: function called in case of an error</li>
         *              </ol>
         */
        function private_salesforce_describe_object(setup) {
            // Get records count for this object
            SALESFORCE_HANDLER.doHttpCall(
                '/limits/recordCount?sObjects='+setup.objectName,
                function(result) {
                    const recordCount = (Array.isArray(result?.sObjects) && result?.sObjects.length == 1) ? result?.sObjects[0].count : 0;
                    SALESFORCE_HANDLER.doDescribeObject(
                        setup.objectName, 
                        function(object) {
                            let recordCount = 0;
                            SALESFORCE_HANDLER.doQueries(
                                [{ 
                                    tooling: true, 
                                    string: 'SELECT DurableId, Description, NamespacePrefix, ExternalSharingModel, InternalSharingModel, '+
                                                '(SELECT Id, DurableId, QualifiedApiName FROM Fields), '+
                                                '(SELECT Id, Name FROM ApexTriggers), '+
                                                '(SELECT Id, MasterLabel, Description FROM FieldSets), '+
                                                '(SELECT Id, Name, LayoutType FROM Layouts), '+
                                                '(SELECT DurableId, Label, Max, Remaining, Type FROM Limits), '+
                                                '(SELECT Id, Active, Description, ErrorDisplayField, ErrorMessage, '+
                                                    'ValidationName FROM ValidationRules), '+
                                                '(SELECT Id, Name FROM WebLinks) '+
                                            'FROM EntityDefinition '+
                                            'WHERE DurableId = '+private_secure_soql(setup.objectName)
                                }], 
                                function(record) {
                                    recordCount++;

                                    // 0. Generic information
                                    object.id = record.DurableId;
                                    object.description = record.Description;
                                    object.externalSharingModel = record.ExternalSharingModel;
                                    object.internalSharingModel = record.InternalSharingModel;
                                    object.recordCount = recordCount;
                                    // 1. Apex Triggers
                                    if (record.ApexTriggers) {
                                        let apexTriggers = [];
                                        for (let i=0; i<record.ApexTriggers.records.length; i++) {
                                            apexTriggers.push({
                                                id: SALESFORCE_HANDLER.salesforceIdFormat(record.ApexTriggers.records[i].Id),
                                                name: record.ApexTriggers.records[i].Name
                                            });
                                        }
                                        object.apexTriggers = apexTriggers;
                                    }
                                    // 2. FieldSets
                                    if (record.FieldSets) {
                                        let fieldSets = [];
                                        for (let i=0; i<record.FieldSets.records.length; i++) {
                                            fieldSets.push({
                                                id: SALESFORCE_HANDLER.salesforceIdFormat(record.FieldSets.records[i].Id),
                                                label: record.FieldSets.records[i].MasterLabel,
                                                description: record.FieldSets.records[i].Description
                                            });
                                        }
                                        object.fieldSets = fieldSets;
                                    }
                                    // 3. Page Layouts
                                    if (record.Layouts) {
                                        let layouts = [];
                                        for (let i=0; i<record.Layouts.records.length; i++) {
                                            layouts.push({
                                                id: SALESFORCE_HANDLER.salesforceIdFormat(record.Layouts.records[i].Id),
                                                name: record.Layouts.records[i].Name,
                                                type: record.Layouts.records[i].LayoutType
                                            });
                                        }
                                        object.layouts = layouts;
                                    }
                                    // 4. Limits
                                    if (record.Limits) {
                                        let limits = [];
                                        for (let i=0; i<record.Limits.records.length; i++) {
                                            limits.push({
                                                id: SALESFORCE_HANDLER.salesforceIdFormat(record.Limits.records[i].DurableId),
                                                label: record.Limits.records[i].Label,
                                                remaining: record.Limits.records[i].Remaining,
                                                max: record.Limits.records[i].Max,
                                                type: record.Limits.records[i].Type
                                            });
                                        }
                                        object.limits = limits;
                                    }
                                    // 5. ValidationRules
                                    if (record.ValidationRules) {
                                        let validationRules = [];
                                        for (let i=0; i<record.ValidationRules.records.length; i++) {
                                            validationRules.push({
                                                id: SALESFORCE_HANDLER.salesforceIdFormat(record.ValidationRules.records[i].Id),
                                                name: record.ValidationRules.records[i].ValidationName,
                                                isActive: record.ValidationRules.records[i].Active,
                                                description: record.ValidationRules.records[i].Description,
                                                errorDisplayField: record.ValidationRules.records[i].ErrorDisplayField,
                                                errorMessage: record.ValidationRules.records[i].ErrorMessage
                                            });
                                        }
                                        object.validationRules = validationRules;
                                    }
                                    // 6. WebLinks
                                    if (record.WebLinks) {
                                        let webLinks = [];
                                        for (let i=0; i<record.WebLinks.records.length; i++) {
                                            webLinks.push({
                                                id: SALESFORCE_HANDLER.salesforceIdFormat(record.WebLinks.records[i].Id),
                                                name: record.WebLinks.records[i].Name,
                                            });
                                        }
                                        object.webLinks = webLinks;
                                    }
                                    // 7. If any fields, add field dependencies
                                    if (record.Fields) {
                                        const mapFields = {};
                                        const fieldIds = [];
                                        for (let i=0; i<record.Fields.records.length; i++) {
                                            const f = record.Fields.records[i];
                                            const id = SALESFORCE_HANDLER.splitDeveloperName(f.DurableId).shortName.split('.')[1];
                                            fieldIds.push(id);
                                            mapFields[f.QualifiedApiName] = id;
                                        }
                                        object.fields.forEach(f => f.id = mapFields[f.name]);
                                        private_salesforce_dapi(
                                            fieldIds, 
                                            function(fieldDependencies) {
                                                object.fieldDependencies = fieldDependencies;
                                                setup.callbackSuccess(object);
                                            }, 
                                            setup.callbackError
                                        );
                                    } else {
                                        setup.callbackSuccess(object);
                                    }
                                },
                                function() { if (recordCount !== 1)
                                    if (recordCount == 0) setup.callbackError('we retrieved zero record!');
                                    if (recordCount > 1) setup.callbackError('we retrieved '+recordCount+' records!');
                                },
                                setup.callbackError
                            );
                        }, 
                        setup.callbackError
                    );
                },
                setup.callbackError
            );
        };
    }
};

/**
 * Let's define all the dataset that we have available for the pages.
 *              Pages will activate the one they need when calling the controller
 *              At this time, no data is yet retrieved from Salesforce.
 * @param core The OrgCheck instance 
 */
function buildDatasets(core) {

    // ========================================================================
    // WORKFLOWS
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'workflows',
        keycache: 'Workflows',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                },
                onError: reject,
                onEnd: () => {
                    const cache = this.keycache;
                    const value = core.getMetadataInCache(cache);
                    if (value) resolve(value);
                    const queries = [];
                    core.doSalesforceQueries({
                        queries: [{ 
                            string: 'SELECT Id FROM WorkflowRule',
                            tooling: true
                        }], 
                        onEachRecord: function(record, index) {
                            queries.push({
                                tooling: true,
                                byPasses: [ 'UNKNOWN_EXCEPTION' ],
                                string: 'SELECT Id, FullName, Metadata, CreatedDate, LastModifiedDate '+
                                        'FROM WorkflowRule '+
                                        'WHERE Id = ' + core.doSecureSOQLBindingVariable(record.Id)
                            });
                        }, 
                        onEnd: function(records, size) { 
                            core.doSalesforceQueriesWithCache({
                                mnemonic: cache,
                                queries,
                                onEachRecordFromAPI: function(v, i, l, ts) {
                                    const item =  {
                                        id: core.doSimplifiySalesforceID(v.Id),
                                        name: v.FullName,
                                        description: v.Metadata.description,
                                        actions: v.Metadata.actions,
                                        futureActions: v.Metadata.workflowTimeTriggers,
                                        isActive: v.Metadata.active,
                                        createdDate: v.CreatedDate,
                                        lastModifiedDate: v.LastModifiedDate
                                    };
                                    if (!item.actions) item.actions = [];
                                    if (!item.futureActions) item.futureActions = [];
                                    item.noAction = (item.actions.length == 0 && item.futureActions.length == 0);
                                    return item;
                                },
                                onEndFromCache: resolve,
                                onError: reject
                            });
                        },
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // FLOWS (and Process Builders)
    // ------------------------------------------------------------------------
    // Get the list of Flows and PB in Salesforce (metadata, using tooling API)
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'flows',
        keycache: 'Flows',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                },
                onError: reject,
                onEnd: () => {
                    const cache = this.keycache;
                    const value = core.getMetadataInCache(cache);
                    if (value) resolve(value);
                    const queries = [];
                    core.doSalesforceQueries({
                        queries: [{ 
                            string: 'SELECT Id FROM Flow',
                            tooling: true
                        }], 
                        onEachRecord: function(record, index) {
                            queries.push({
                                tooling: true,
                                string: 'SELECT Id, FullName, DefinitionId, MasterLabel, '+
                                        'VersionNumber, Metadata, Status, Description, '+
                                        'ProcessType, CreatedDate, LastModifiedDate FROM Flow '+
                                        'WHERE Id = ' + core.doSecureSOQLBindingVariable(record.Id)
                            });
                        }, 
                        onEnd: function(records, size) { 
                            core.doSalesforceQueriesWithCache({
                                mnemonic: cache,
                                queries,
                                onEachRecordFromAPI: function(v, i, l, ts) {
                                    const item =  {
                                        id: core.doSimplifiySalesforceID(v.Id),
                                        name: v.FullName,
                                        definitionId: core.doSimplifiySalesforceID(v.DefinitionId),
                                        definitionName: v.MasterLabel,
                                        version: v.VersionNumber,
                                        dmlCreates: v.Metadata.recordCreates?.length || 0,
                                        dmlDeletes: v.Metadata.recordDeletes?.length || 0,
                                        dmlUpdates: v.Metadata.recordUpdates?.length || 0,
                                        isActive: v.Status === 'Active',
                                        description: v.Description,
                                        type: v.ProcessType,
                                        createdDate: v.CreatedDate,
                                        lastModifiedDate: v.LastModifiedDate
                                    };
                                    v.Metadata.processMetadataValues?.forEach(m => {
                                        if (m.name === 'ObjectType') item.sobject = m.value.stringValue;
                                        if (m.name === 'TriggerType') item.triggerType = m.value.stringValue;
                                    });
                                    return item;
                                },
                                onEndFromCache: resolve,
                                onError: reject
                            });
                        },
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // PACKAGES
    // ------------------------------------------------------------------------
    // List of Packages in Salesforce (metadata, using tooling API). 
    // This includes the installed packages (with type="Installed"). And 
    // also the local packages (with type="Local").
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'packages',
        keycache: 'Packages',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'Organization': [ 'NamespacePrefix' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: true, 
                            string: 'SELECT Id, SubscriberPackage.NamespacePrefix, SubscriberPackage.Name '+
                                    'FROM InstalledSubscriberPackage ' 
                        }, { 
                            tooling: false,
                            string: 'SELECT NamespacePrefix '+
                                    'FROM Organization '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            if (i == 0) {
                                return { 
                                    id: v.Id, 
                                    name: v.SubscriberPackage.Name,
                                    namespace: v.SubscriberPackage.NamespacePrefix,
                                    type: 'Installed'
                                };
                            } else {
                                return { 
                                    id: v.NamespacePrefix, 
                                    name: v.NamespacePrefix,
                                    namespace: v.NamespacePrefix, 
                                    type: 'Local'
                                };
                            }
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // CUSTOM LABELS
    // ------------------------------------------------------------------------
    // List of Custom Labels in Salesforce (metadata, using tooling API)
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'customLabels',
        keycache: 'CustomLabels',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: true, 
                            string: 'SELECT Id, Name, NamespacePrefix, Category, IsProtected, Language, MasterLabel, Value '+
                                    'FROM ExternalString '+
                                    'WHERE ManageableState = \'unmanaged\' '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return {
                                id: core.doSimplifiySalesforceID(v.Id),
                                name: v.Name,
                                masterLabel: v.MasterLabel,
                                namespace: v.NamespacePrefix,
                                category: v.Category,
                                protected: v.IsProtected,
                                language: v.Language,
                                value: v.Value
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // CUSTOM SETTINGS
    // ------------------------------------------------------------------------
    // Get the list of Custom Settings in Salesforce (metadata, using tooling API)
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'customSettings',
        keycache: 'CustomSettings',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: true, 
                            string: 'SELECT DurableId, QualifiedApiName, NamespacePrefix '+
                                    'FROM EntityDefinition '+
                                    'WHERE IsCustomSetting = true ' + 
                                    'AND NamespacePrefix = NULL '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return {
                                id: core.doSimplifiySalesforceID(v.DurableId),
                                name: v.QualifiedApiName,
                                namespace: v.NamespacePrefix
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // VISUAL FORCE PAGES (still alive!)
    // ------------------------------------------------------------------------
    // Get the list of Visualforce Pages in Salesforce (metadata, using tooling API)
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'vfPages',
        keycache: 'VisualforcePages',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: true, 
                            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, IsAvailableInTouch, '+
                                        'CreatedDate, LastModifiedDate '+
                                    'FROM ApexPage '+
                                    'WHERE ManageableState = \'unmanaged\' '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return {
                                id: core.doSimplifiySalesforceID(v.Id),
                                name: v.Name,
                                apiVersion: v.ApiVersion,
                                isApiVersionOld: core.isVersionOld({ apiVersion: v.ApiVersion }),
                                namespace: v.NamespacePrefix,
                                description: v.Description, 
                                mobile: v.IsAvailableInTouch,
                                createdDate: v.CreatedDate,
                                lastModifiedDate: v.LastModifiedDate
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // VISUAL FORCE COMPONENTS (still alive!)
    // ------------------------------------------------------------------------
    // Get the list of Visualforce Components in Salesforce (metadata, using tooling API)
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'vfComponents',
        keycache: 'VisualforceComponents',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: true, 
                            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, '+
                                        'CreatedDate, LastModifiedDate '+
                                    'FROM ApexComponent '+
                                    'WHERE ManageableState = \'unmanaged\' '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return {
                                id: core.doSimplifiySalesforceID(v.Id),
                                name: v.Name,
                                apiVersion: v.ApiVersion,
                                isApiVersionOld: core.isVersionOld({ apiVersion: v.ApiVersion }),
                                namespace: v.NamespacePrefix,
                                description: v.Description,
                                createdDate: v.CreatedDate,
                                lastModifiedDate: v.LastModifiedDate
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // APEX CLASSES (UNIT TEST AND OTHERS)
    // ------------------------------------------------------------------------
    // Get the list of Apex Classes in Salesforce (metadata, using tooling API)
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'apexClasses',
        keycache: 'ApexClasses',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'AsyncApexJob': [ 'ApexClassId' ]
                },
                onError: reject,
                onEnd: () => {
                    const cache = this.keycache;
                    const value = core.getMetadataInCache(cache);
                    if (value) resolve(value);
                    const classesMap = {};
                    const relatedTestClassesMap = {};
                    const classesCoverageMap = {};
                    const schedulableMap = {};
                    const REGEX_ISINTERFACE = new RegExp("(?:public|global)\\s+(?:interface)\\s+\\w+\\s*\\{", 'i');
                    const REGEX_ISENUM = new RegExp("(?:public|global)\\s+(?:enum)\\s+\\w+\\s*\\{", 'i');
                    const REGEX_ISTESTSEEALLDATA = new RegExp("@IsTest\\(.*SeeAllData=true.*\\)", 'i');
                    const REGEX_TESTNBASSERTS = new RegExp("System.assert(?:Equals|NotEquals|)\\(", 'ig');
                    core.doSalesforceQueries({
                        queries: [{
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
                                    'WHERE ManageableState = \'unmanaged\' ',
                            tooling: true
                        }, {
                            string: 'SELECT ApexClassId '+
                                    'FROM AsyncApexJob '+
                                    'WHERE JobType = \'ScheduledApex\' ',
                            tooling: false
                        }], 
                        onEachRecord: function(v, index) {
                            switch (index) {
                                case 0: {
                                    // ApexCodeCoverage records
                                    const i = core.doSimplifiySalesforceID(v.ApexClassOrTriggerId);
                                    const t = core.doSimplifiySalesforceID(v.ApexTestClassId);
                                    const item = relatedTestClassesMap[i] || new Set();
                                    item.add(t);
                                    relatedTestClassesMap[i] = item;
                                    break;
                                }
                                case 1: {
                                    // ApexCodeCoverageAggregate records
                                    const item =  {
                                        id: core.doSimplifiySalesforceID(v.ApexClassOrTriggerId),
                                        covered: v.NumLinesCovered,
                                        uncovered: v.NumLinesUncovered,
                                        coverage: (v.NumLinesCovered / (v.NumLinesCovered + v.NumLinesUncovered))
                                    };
                                    classesCoverageMap[item.id] = item;
                                    break; 
                                }
                                case 2: {
                                    // ApexClasses records
                                    const item =  {
                                        id: core.doSimplifiySalesforceID(v.Id),
                                        name: v.Name,
                                        apiVersion: v.ApiVersion,
                                        isApiVersionOld: core.isVersionOld({ apiVersion: v.ApiVersion }),
                                        namespace: v.NamespacePrefix,
                                        isTest: false,
                                        isAbstract: false,
                                        isClass: true,
                                        isEnum: false,
                                        isInterface: false,
                                        isSharingMissing: false,
                                        length: v.LengthWithoutComments,
                                        needsRecompilation: (!v.SymbolTable ? true : false),
                                        coverage: 0, // by default no coverage!
                                        createdDate: v.CreatedDate,
                                        lastModifiedDate: v.LastModifiedDate
                                    };
                                    if (v.Body) {
                                        item.isInterface = v.Body.match(REGEX_ISINTERFACE) !== null;
                                        item.isEnum = v.Body.match(REGEX_ISENUM) !== null;
                                        item.isClass = (item.isInterface === false && item.isEnum === false);
                                    }
                                    if (v.SymbolTable) {
                                        item.innerClassesCount = v.SymbolTable.innerClasses.length || 0;
                                        item.interfaces = v.SymbolTable.interfaces;
                                        item.methodsCount = v.SymbolTable.methods.length || 0;
                                        if (v.SymbolTable.tableDeclaration) {
                                            item.annotations = v.SymbolTable.tableDeclaration.annotations;
                                            if (v.SymbolTable.tableDeclaration.modifiers) {
                                                v.SymbolTable.tableDeclaration.modifiers.forEach(m => {
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
                                            };
                                        }
                                    }
                                    if (item.isEnum === true || item.isInterface === true) item.specifiedSharing = 'n/a';
                                    if (item.isTest === false && item.isClass === true && !item.specifiedSharing) {
                                        item.isSharingMissing = true;
                                    }
                                    if (item.isTest === true) {
                                        item.isTestSeeAllData = v.Body.match(REGEX_ISTESTSEEALLDATA) !== null;
                                        item.nbSystemAsserts = v.Body.match(REGEX_TESTNBASSERTS)?.length || 0;
                                    }
                                    classesMap[item.id] = item;
                                    break;
                                }
                                default: {
                                    schedulableMap[core.doSimplifiySalesforceID(v.ApexClassId)] = true;
                                }
                            }
                        }, 
                        onEnd: function(records, size) { 
                            for (const [key, value] of Object.entries(classesMap)) {
                                if (classesCoverageMap[key]) value.coverage = classesCoverageMap[key].coverage;
                                if (relatedTestClassesMap[key]) value.relatedTestClasses = Array.from(relatedTestClassesMap[key]);
                                if (schedulableMap[key]) value.isScheduled = true;
                            }
                            core.setMetadataInCache(cache, classesMap);
                            resolve(classesMap);
                        },
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // APEX TRIGGERS
    // ------------------------------------------------------------------------
    // Get the list of Apex Triggers in Salesforce (metadata, using tooling API)
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'apexTriggers',
        keycache: 'ApexTriggers',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
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
                                    'WHERE ManageableState = \'unmanaged\' '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            if (v.EntityDefinition) {
                                const item = {
                                    id: core.doSimplifiySalesforceID(v.Id),
                                    name: v.Name,
                                    apiVersion: v.ApiVersion,
                                    isApiVersionOld: core.isVersionOld({ apiVersion: v.ApiVersion }),
                                    namespace: v.NamespacePrefix,
                                    length: v.LengthWithoutComments,
                                    isActive: (v.Status === 'Active' ? true : false),
                                    beforeInsert: v.UsageBeforeInsert,
                                    afterInsert: v.UsageAfterInsert,
                                    beforeUpdate: v.UsageBeforeUpdate,
                                    afterUpdate: v.UsageAfterUpdate,
                                    beforeDelete: v.UsageBeforeDelete,
                                    afterDelete: v.UsageAfterDelete,
                                    afterUndelete: v.UsageAfterUndelete,
                                    sobject: v.EntityDefinition.QualifiedApiName,
                                    hasSOQL: false,
                                    hasDML: false,
                                    createdDate: v.CreatedDate,
                                    lastModifiedDate: v.LastModifiedDate
                                };
                                if (v.Body) {
                                    item.hasSOQL = v.Body.match("\\[\\s*(?:SELECT|FIND)") !== null; 
                                    item.hasDML = v.Body.match("(?:insert|update|delete)\\s*(?:\\w+|\\(|\\[)") !== null; 
                                }
                                return item;
                            }
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // STATIC RESOURCES
    // ------------------------------------------------------------------------
    // Get the list of Static Resources in Salesforce (metadata, using tooling API)
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'stResources',
        keycache: 'StaticResources',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: true, 
                            string: 'SELECT Id, Name, NamespacePrefix '+
                                    'FROM StaticResource '+
                                    'WHERE ManageableState = \'unmanaged\' '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return {
                                id: core.doSimplifiySalesforceID(v.Id),
                                name: v.Name,
                                namespace: v.NamespacePrefix
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));                    

    // ========================================================================
    // LIGHTNING PAGES
    // ------------------------------------------------------------------------
    // Get the list of Lightning Pages in Salesforce (metadata, using tooling API)
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'auraPages',
        keycache: 'LightningPages',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: true, 
                            string: 'SELECT Id, MasterLabel, EntityDefinition.DeveloperName, '+
                                        'Type, NamespacePrefix, Description, ' +
                                        'CreatedDate, LastModifiedDate '+
                                    'FROM FlexiPage '+
                                    'WHERE ManageableState = \'unmanaged\' '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return {
                                id: core.doSimplifiySalesforceID(v.Id),
                                name: v.MasterLabel,
                                entityName: v.EntityDefinition ? v.EntityDefinition.DeveloperName : '',
                                type: v.Type,
                                namespace: v.NamespacePrefix,
                                description: v.Description,
                                createdDate: v.CreatedDate,
                                lastModifiedDate: v.LastModifiedDate
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // LIGHTNING WEB COMPONENTS
    // ------------------------------------------------------------------------
    // Get the list of Lightning Web Components in Salesforce (metadata, using tooling API)
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'lwComponents',
        keycache: 'LightningWebComponents',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: true, 
                            string: 'SELECT Id, MasterLabel, ApiVersion, NamespacePrefix, Description, '+ 
                                        'CreatedDate, LastModifiedDate '+
                                    'FROM LightningComponentBundle '+
                                    'WHERE ManageableState = \'unmanaged\' '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return {
                                id: core.doSimplifiySalesforceID(v.Id),
                                name: v.MasterLabel,
                                apiVersion: v.ApiVersion,
                                isApiVersionOld: core.isVersionOld({ apiVersion: v.ApiVersion }),
                                namespace: v.NamespacePrefix,
                                description: v.Description,
                                createdDate: v.CreatedDate,
                                lastModifiedDate: v.LastModifiedDate
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // LIGHTNING AURA COMPONENTS
    // ------------------------------------------------------------------------
    // Get the list of Lightning Aura Components in Salesforce (metadata, using tooling API)
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'auraComponents',
        keycache: 'AuraComponents',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: true, 
                            string: 'SELECT Id, MasterLabel, ApiVersion, NamespacePrefix, Description, '+
                                        'CreatedDate, LastModifiedDate '+
                                    'FROM AuraDefinitionBundle '+
                                    'WHERE ManageableState = \'unmanaged\' '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return {
                                id: core.doSimplifiySalesforceID(v.Id),
                                name: v.MasterLabel,
                                apiVersion: v.ApiVersion,
                                isApiVersionOld: core.isVersionOld({ apiVersion: v.ApiVersion }),
                                namespace: v.NamespacePrefix,
                                description: v.Description,
                                createdDate: v.CreatedDate,
                                lastModifiedDate: v.LastModifiedDate
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));
                        
    // ========================================================================
    // USERS
    // ------------------------------------------------------------------------
    // Get the list of Users in Salesforce (data, using REST API)
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'users',
        keycache: 'Users',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'User': [ 'Id', 'Name', 'SmallPhotoUrl', 'ProfileId', 'LastLoginDate', 
                              'LastPasswordChangeDate', 'NumberOfFailedLogins', 
                              'UserPreferencesLightningExperiencePreferred', 'IsActive' ],
                    'Profile': [ 'Id', 'Name' ],
                    'PermissionSetAssignment': [ 'PermissionSet' ],
                    'PermissionSet': [ 'Id', 'Name', 'PermissionSet', 'PermissionsApiEnabled',
                               'PermissionsViewSetup', 'PermissionsModifyAllData', 
                               'PermissionsViewAllData', 'IsOwnedByProfile' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: false, 
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
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            let item = {
                                id: core.doSimplifiySalesforceID(v.Id),
                                name: v.Name,
                                photourl: v.SmallPhotoUrl,
                                lastLogin: core.doFormatDatetime(v.LastLoginDate),
                                neverLogged: (!v.LastLoginDate ? true : false),
                                numberFailedLogins: v.NumberOfFailedLogins,
                                lastPasswordChange: core.doFormatDatetime(v.LastPasswordChangeDate),
                                onLightningExperience: v.UserPreferencesLightningExperiencePreferred,
                                profile: {
                                    id: core.doSimplifiySalesforceID(v.Profile.Id),
                                    name: v.Profile.Name
                                },
                                permissionSets: [],
                                permissions: {
                                    apiEnabled: false,
                                    viewSetup: false,
                                    modifyAllData: false,
                                    viewAllData: false
                                }
                            };
                            if (v.PermissionSetAssignments && v.PermissionSetAssignments.records) {
                                for (let i=0; i<v.PermissionSetAssignments.records.length; i++) {
                                    let assignment = v.PermissionSetAssignments.records[i];
                                    if (assignment.PermissionSet.PermissionsApiEnabled === true) item.permissions.apiEnabled = true;
                                    if (assignment.PermissionSet.PermissionsViewSetup === true) item.permissions.viewSetup = true;
                                    if (assignment.PermissionSet.PermissionsModifyAllData === true) item.permissions.modifyAllData = true;
                                    if (assignment.PermissionSet.PermissionsViewAllData === true) item.permissions.viewAllData = true;
                                    if (assignment.PermissionSet.IsOwnedByProfile == false) {
                                        item.permissionSets.push({
                                            id: core.doSimplifiySalesforceID(assignment.PermissionSet.Id),
                                            name: assignment.PermissionSet.Name
                                        });
                                    }
                                }
                            }
                            return item;
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));    

    // ========================================================================
    // PROFILES
    // ------------------------------------------------------------------------
    // Get the list of Profiles in Salesforce (data, using REST API)
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'profiles',
        keycache: 'Profiles',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'PermissionSet': [ 'isOwnedByProfile', 'Id', 'ProfileId', 'IsCustom',
                                       'NamespacePrefix' ],
                    'Profile': [ 'Name', 'Description', 'UserType' ],
                    'License': [ 'Name' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: false, 
                            string: 'SELECT Id, ProfileId, Profile.Name, Profile.Description, '+
                                        'Profile.CreatedDate, Profile.LastModifiedDate, '+
                                        'IsCustom, License.Name, Profile.UserType, NamespacePrefix, '+
                                        '(SELECT Id FROM Assignments WHERE Assignee.IsActive = TRUE LIMIT 101) '+
                                    'FROM PermissionSet '+ // oh yes we are not mistaken!
                                    'WHERE isOwnedByProfile = TRUE'
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            const memberCounts = (v.Assignments && v.Assignments.records) ? v.Assignments.records.length : 0;
                            const item = {
                                id: core.doSimplifiySalesforceID(v.ProfileId),
                                name: v.Profile.Name,
                                description: v.Profile.Description,
                                license: v.License.Name,
                                userType: v.Profile.UserType,
                                isCustom: v.IsCustom,
                                isUnusedCustom: v.IsCustom && memberCounts == 0,
                                isUndescribedCustom: v.IsCustom && !v.Profile.Description,
                                package: v.NamespacePrefix,
                                membersCount: memberCounts,
                                hasMembers: memberCounts > 0,
                                createdDate: v.Profile.CreatedDate, 
                                lastModifiedDate: v.Profile.LastModifiedDate
                            };
                            return item;
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));
    
    // ========================================================================
    // Object CRUD (Profile and Permission Set)
    // ------------------------------------------------------------------------
    // Get the Object and Fields CRUDs in Profiles and Permission Sets
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'objectCRUDs',
        keycache: 'ObjectCRUDs',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'ObjectPermissions': [ 'ParentId', 'SobjectType', 'PermissionsRead', 
                                'PermissionsCreate', 'PermissionsEdit', 'PermissionsDelete',
                                'PermissionsViewAllRecords', 'PermissionsModifyAllRecords' ],
                    'PermissionSet': [ 'ProfileId', 'Label', 'IsOwnedByProfile' ],
                    'Profile': [ 'Name' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: false, 
                            string: 'SELECT ParentId, Parent.Profile.Name, Parent.Label, Parent.IsOwnedByProfile, SobjectType, '+
                                        'PermissionsRead, PermissionsCreate, PermissionsEdit, PermissionsDelete, '+
                                        'PermissionsViewAllRecords, PermissionsModifyAllRecords '+
                                    'FROM ObjectPermissions '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return {
                                id: v.ParentId + v.SobjectType,
                                sobject: v.SobjectType,
                                type: (v.Parent.IsOwnedByProfile ? 'profile' : 'permissionSet'),
                                parent: { 
                                    id: (v.Parent.IsOwnedByProfile ? v.Parent.ProfileId : v.ParentId), 
                                    name: (v.Parent.IsOwnedByProfile ? v.Parent.Profile.Name : v.Parent.Label) 
                                },
                                permissions: {
                                    create: v.PermissionsCreate,
                                    read: v.PermissionsRead,
                                    update: v.PermissionsEdit,
                                    delete: v.PermissionsDelete,
                                    viewAll: v.PermissionsViewAllRecords,
                                    modifyAll: v.PermissionsModifyAllRecords
                                }
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // PROFILE LOGIN RESTRICTIONS (IN PROFILE)
    // ------------------------------------------------------------------------
    // Get the list of Login Restrictions in Profiles
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'profileLoginRestrictions',
        keycache: 'ProfileLoginRestrictions',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'Profile': [ 'Id' ]
                },
                onError: reject,
                onEnd: () => {
                    const cache = this.keycache;
                    const value = core.getMetadataInCache(cache);
                    if (value) resolve(value);
                    const queries = [];
                    core.doSalesforceQueries({
                        queries: [{ string: 'SELECT Id FROM Profile' }], 
                        onEachRecord: function(record, index) {
                            queries.push({
                                tooling: true,
                                string: 'SELECT Id, Name, Metadata '+
                                        'FROM Profile '+
                                        'WHERE Id = ' + core.doSecureSOQLBindingVariable(record.Id)
                            });
                        }, 
                        onEnd: function(records, size) { 
                            core.doSalesforceQueriesWithCache({
                                mnemonic: cache,
                                queries,
                                onEachRecordFromAPI: function(v, i, l, ts) {
                                    const item =  {
                                        id: core.doSimplifiySalesforceID(v.Id),
                                        name: v.Name,
                                        loginIpRanges: v.Metadata.loginIpRanges
                                    };
                                    if (v.Metadata.loginHours) {
                                        const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
                                        days.forEach(d => {
                                            const c1 = v.Metadata.loginHours[d + 'Start'];
                                            const c2 = v.Metadata.loginHours[d + 'End'];
                                            if (!item.loginHours) item.loginHours = {};
                                            item.loginHours[d] = {
                                                from: (('0' + Math.floor(c1 / 60)).slice(-2) + ':' + ('0' + (c1 % 60)).slice(-2)),
                                                to:   (('0' + Math.floor(c2 / 60)).slice(-2) + ':' + ('0' + (c2 % 60)).slice(-2))
                                            };
                                        });
                                    }
                                    return item;
                                },
                                onEndFromCache: resolve,
                                onError: reject
                            });
                        },
                        onError: reject
                    });
                }
            });
        }
    }));
                        
    // ========================================================================
    // PERMISSION SETS
    // ------------------------------------------------------------------------
    // Get the list of Permission Sets in Salesforce (data, using REST API)
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'permissionSets',
        keycache: 'PermissionSets',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'PermissionSet': [ 'Id', 'Name', 'Description', 'IsCustom', 'AssigneeId',
                                       'NamespacePrefix', 'Type', 'IsOwnedByProfile' ],
                    'License': [ 'Name' ],
                    'User': [ 'Id', 'IsActive' ],
                    'PermissionSetGroup': [ 'Id', 'DeveloperName', 'Description', 
                                       'NamespacePrefix', 'Status' ]
                },
                onError: reject,
                onEnd: () => {
                    const cache = this.keycache;
                    const value = core.getMetadataInCache(cache);
                    if (value) resolve(value);

                    const psMap = {};
                    const psgByName1 = {};
                    const psgByName2 = {};
                    core.doSalesforceQueries({
                        queries: [ { 
                            tooling: false, 
                            string: 'SELECT Id, Name, Description, IsCustom, License.Name, NamespacePrefix, Type, '+
                                        'CreatedDate, LastModifiedDate, '+
                                        '(SELECT Id FROM Assignments WHERE Assignee.IsActive = TRUE LIMIT 1) '+ // just to see if used
                                    'FROM PermissionSet '+
                                    'WHERE IsOwnedByProfile = FALSE' 
                        }, {
                            tooling: false,
                            byPasses: [ 'INVALID_TYPE' ],
                            string: 'SELECT Id, DeveloperName, Description, NamespacePrefix, Status, '+
                                        'CreatedDate, LastModifiedDate '+
                                    'FROM PermissionSetGroup ' 
                        } ],
                        onEachRecord: function(v, i) {
                            if (i === 0) {
                                const hasMembers = (v.Assignments && v.Assignments.records) ? v.Assignments.records.length > 0 : false;
                                const item = {
                                    id: core.doSimplifiySalesforceID(v.Id),
                                    name: v.Name,
                                    description: v.Description,
                                    hasLicense: (v.License ? 'yes' : 'no'),
                                    license: (v.License ? v.License.Name : ''),
                                    isCustom: v.IsCustom,
                                    isUndescribedCustom: v.IsCustom && !v.Description,
                                    package: v.NamespacePrefix,
                                    isUnusedCustom: v.IsCustom && !hasMembers,
                                    hasMembers: hasMembers,
                                    isGroup: (v.Type === 'Group'),     // other values can be 'Regular', 'Standard', 'Session
                                    createdDate: v.CreatedDate, 
                                    lastModifiedDate: v.LastModifiedDate
                                };
                                if (item.isGroup === true) psgByName1[item.package+'--'+item.name] = item;
                                psMap[item.id] = item;
                            } else {
                                const item = {
                                    id: core.doSimplifiySalesforceID(v.Id),
                                    name: v.DeveloperName,
                                    description: v.Description,
                                    package: v.NamespacePrefix,
                                    createdDate: v.CreatedDate, 
                                    lastModifiedDate: v.LastModifiedDate
                                }
                                psgByName2[item.package+'--'+item.name] = item;
                            }
                        }, 
                        onEnd: function() { 
                            for (const [key, value] of Object.entries(psgByName1)) if (psgByName2[key]) {
                                value.groupId = psgByName2[key].id;
                                value.description = psgByName2[key].description;
                                value.isUndescribedCustom = value.isCustom && !value.description;
                                psMap[value.id] = value;
                            };
                            core.setMetadataInCache(cache, psMap);
                            resolve(psMap);
                        },
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // PERMISSION SETS ASSIGNMENTS
    // ------------------------------------------------------------------------
    // Get the list of user assignements to permission sets in 
    //      Salesforce (data, using REST API)
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'permissionSetAssignments',
        keycache: 'PermissionSetAssignments',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'PermissionSetAssignment': [ 'AssigneeId', 'Id', 'PermissionSetId' ],
                    'PermissionSet': [ 'IsOwnedByProfile' ],
                    'User': [ 'ProfileId', 'IsActive' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: false, 
                            string: 'SELECT Id, AssigneeId, Assignee.ProfileId, PermissionSetId '+
                                    'FROM PermissionSetAssignment '+
                                    'WHERE Assignee.IsActive = TRUE '+
                                    'AND PermissionSet.IsOwnedByProfile = FALSE '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return {
                                id: core.doSimplifiySalesforceID(v.Id),
                                assigneeId: core.doSimplifiySalesforceID(v.AssigneeId),
                                assigneeProfileId: core.doSimplifiySalesforceID(v.Assignee.ProfileId),
                                permissionSetId: core.doSimplifiySalesforceID(v.PermissionSetId)
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));
 
    // ========================================================================
    // ROLES
    // ------------------------------------------------------------------------
    // Get the list of Roles in Salesforce (data, using REST API)
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'roles',
        keycache: 'Roles',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'UserRole': [ 'Id', 'DeveloperName', 'Name', 'ParentRoleId', 
                                  'PortalType' ],
                    'User': [ 'Id', 'Name', 'Username', 'Email', 'Phone', 
                                  'SmallPhotoUrl', 'IsActive' ]
                },
                onError: reject,
                onEnd: () => {
                    const ROOT_ID = '###root###';
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            string: 'SELECT Id, DeveloperName, Name, ParentRoleId, PortalType, '+
                                        '(SELECT Id, Name, Username, Email, Phone, '+
                                            'SmallPhotoUrl, IsActive FROM Users)'+
                                    ' FROM UserRole '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            let item = {
                                id: core.doSimplifiySalesforceID(v.Id),
                                name: v.Name,
                                developerName: v.DeveloperName,
                                parentId: v.ParentRoleId ? core.doSimplifiySalesforceID(v.ParentRoleId) : ROOT_ID,
                                hasParent: v.ParentRoleId ? true : false,
                                activeMembersCount: 0,
                                activeMembers: [],
                                hasActiveMembers: false,
                                inactiveMembersCount: 0,
                                hasInactiveMembers: false,
                                isExternal: (v.PortalType !== 'None') ? true : false
                            };
                            if (v.Users && v.Users.records) for (let i=0; i<v.Users.records.length; i++) {
                                let user = v.Users.records[i];
                                if (user.IsActive) {
                                    item.activeMembers.push({
                                        id: core.doSimplifiySalesforceID(user.Id),
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
                            return item;
                        }, 
                        onEndFromCache: function(records) {
                            records[ROOT_ID] = {
                                id: ROOT_ID,
                                name: 'Role Hierarchy',
                                developerName: ROOT_ID,
                                parentId: null
                            };
                            resolve(records);
                        },
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // PUBLIC GROUPS
    // ------------------------------------------------------------------------
    // Get the list of Public Groups in Salesforce (data, using REST API)
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'publicGroups',
        keycache: 'PublicGroups',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'GroupMember': [ 'Id', 'GroupId', 'UserOrGroupId' ],
                    'Group': [ 'Id', 'Name', 'DeveloperName', 'DoesIncludeBosses', 'Type', 'RelatedId' ] 
                },
                onError: reject,
                onEnd: () => {
                    const cache = this.keycache;
                    const value = core.getMetadataInCache(cache);
                    if (value) resolve(value);
                    const publicGroupsMap = {};
                    const pgAssignmentsMap = {};
                    core.doSalesforceQueries({
                        queries: [ { 
                            tooling: false, 
                            string: 'SELECT Id, Name, DeveloperName, DoesIncludeBosses, Type, RelatedId, Related.Name '+
                                    'FROM Group ' 
                        }, { 
                            tooling: false, 
                            string: 'SELECT Id, GroupId, UserOrGroupId FROM GroupMember '
                        } ],
                        onEachRecord: function(v, i, l, ts) {
                            if (i === 0) {
                                const item = { id: core.doSimplifiySalesforceID(v.Id) };
                                switch (v.Type) {
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
                                    item.relatedId = core.doSimplifiySalesforceID(v.RelatedId);
                                } else {
                                    item.developerName = v.DeveloperName;
                                    item.name = v.Name;
                                    item.includeBosses = v.DoesIncludeBosses;
                                    item.directMembersCount = 0;
                                    item.directUsers = [];
                                    item.directGroups = [];                            
                                }
                                publicGroupsMap[item.id] = item;
                            } else {
                                const groupId = core.doSimplifiySalesforceID(v.GroupId);
                                let item = pgAssignmentsMap[groupId];
                                if (!item) {
                                    // no assignment yet for this group
                                    item = { 
                                        directMembersCount: 0,
                                        directUsers: [],
                                        directGroups: []
                                    };
                                }
                                item.directMembersCount++;
                                const member_id = core.doSimplifiySalesforceID(v.UserOrGroupId);
                                const member_is_a_user = member_id.startsWith('005');
                                (member_is_a_user === true ? item.directUsers : item.directGroups).push({ id: member_id });    
                                pgAssignmentsMap[groupId] = item;
                            }
                        }, 
                        onEnd: function(records, size) {
                            // Merge publicGroupsMap and pgAssignmentsMap
                            for (const [key, value] of Object.entries(publicGroupsMap)) {
                                if (pgAssignmentsMap[key]) {
                                    value.directMembersCount = pgAssignmentsMap[key].directMembersCount;
                                    value.directUsers = pgAssignmentsMap[key].directUsers;
                                    value.directGroups = pgAssignmentsMap[key].directGroups;
                                    delete pgAssignmentsMap[key];
                                }
                            }
                            core.setMetadataInCache(cache, publicGroupsMap);
                            resolve(publicGroupsMap);
                        },
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // SOBJECTS GLOBAL DESCRIBE
    // ------------------------------------------------------------------------
    // Get the list of sobjects in Salesforce 
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'objects',
        keycache: 'Objects',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doRetrieveDataWithCache({
                        mnemonic: this.keycache, 
                        doDataRetriever: function(callbackToSetTheCache) {
                            core.doSalesforceGlobalDescribe({
                                onEnd: function(sobjects) {
                                    const map = {};
                                    let size = 0;
                                    if (sobjects) {
                                        sobjects.forEach(v => {
                                            if (!v.keyPrefix) return;
                                            let entityType = 'Other';
                                            if (v.customSetting == true) {
                                                entityType = 'CustomSetting';
                                            } else if (v.custom === false) {
                                                entityType = 'StandardObject';
                                            } else if (v.name) {
                                                const pp = v.name.split('__');
                                                const prefix = pp[pp.length-1];
                                                switch (prefix) {
                                                    case 'c':   entityType = 'CustomObject';  break;
                                                    case 'e':   entityType = 'CustomEvent';  break;
                                                    case 'ka':  entityType = 'KnowledgeArticle';  break;
                                                    case 'x':   entityType = 'ExternalObject';  break;
                                                    case 'b':   entityType = 'BigObject';  break;
                                                    case 'mdt': entityType = 'CustomMetadataType';  break;
                                                }
                                            }
                                            if (entityType === 'Other') return;
                                            const object = {
                                                id: v.name,
                                                label: v.label,
                                                developerName: v.name,
                                                package: core.doSalesforceSplitDeveloperName(v.name).package,
                                                isCustomSetting: entityType === 'CustomSetting',
                                                isCustomObject: entityType === 'CustomObject',
                                                isStandardObject: entityType === 'StandardObject',
                                                isExternalObject: entityType === 'ExternalObject',
                                                isCustomMetadataType: entityType === 'CustomMetadataType',
                                                isPlatformEvent: entityType === 'CustomEvent',
                                                isBigObject: entityType === 'BigObject',
                                                isKnowledgeArticle: entityType === 'KnowledgeArticle',
                                                type: entityType
                                            };
                                            map[object.id] = object;
                                            size++;
                                        });
                                    }
                                    core.doSetSizeInMap(map, size);
                                    callbackToSetTheCache(map);
                                }, 
                                onError: reject
                            });
                        },
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // REPORTS
    // ------------------------------------------------------------------------
    // Get the list of failed reports in Salesforce 
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'reports',
        keycache: 'Reports',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'Report' : [ 'Id', 'Name', 'NamespacePrefix', 'DeveloperName', 
                                 'FolderName', 'Format', 'Description' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: false, 
                            string: 'SELECT Id, Name, NamespacePrefix, DeveloperName, FolderName, Format, Description '+
                                    'FROM Report '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return { 
                                id: v.Id,
                                name: v.Name,
                                package: v.NamespacePrefix,
                                developerName: v.DeveloperName,
                                folder: { name: v.FolderName },
                                format: v.Format,
                                description: v.Description
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // DASHBOARDS
    // ------------------------------------------------------------------------
    // Get the list of failed dashboards in Salesforce 
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'dashboards',
        keycache: 'Dashboards',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'Dashboard': [ 'Id', 'Title', 'NamespacePrefix', 'DeveloperName', 
                                   'FolderId', 'FolderName', 'Description' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: false, 
                            string: 'SELECT Id, Title, NamespacePrefix, DeveloperName, FolderId, FolderName, Description '+
                                    'FROM Dashboard '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return { 
                                id: v.Id,
                                name: v.Title,
                                package: v.NamespacePrefix,
                                developerName: v.DeveloperName,
                                folder: { id: v.FolderId, name: v.FolderName },
                                description: v.Description
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // BATCHES
    // ------------------------------------------------------------------------
    // Get the list of failed batches and scheduled jobs in Salesforce 
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'batchesApexJobs',
        keycache: 'BatchesApexJobs',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'AsyncApexJob': [ 'JobType', 'ApexClassId', 'MethodName', 'Status', 
                                      'ExtendedStatus', 'Id', 'NumberOfErrors', 'CreatedDate' ]
                },
                onError: reject,
                onEnd: () => {
                    let artificial_id = 0;
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: false, 
                            string: 'SELECT JobType, ApexClass.Name, MethodName, Status, ExtendedStatus, COUNT(Id) ids, SUM(NumberOfErrors) errors '+
                                    'FROM AsyncApexJob '+
                                    'WHERE CreatedDate >= YESTERDAY '+
                                    'AND ((Status = \'Completed\' AND ExtendedStatus <> NULL) '+
                                    'OR Status = \'Failed\') '+
                                    'GROUP BY JobType, ApexClass.Name, MethodName, Status, ExtendedStatus '+
                                    'LIMIT 10000 '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            const apexClass = (v.ApexClass ? v.ApexClass.Name : 'anonymous')+(v.MethodName ? ('.'+v.MethodName) : '');
                            return { 
                                id: 'APXJOBS-'+artificial_id++,
                                type: v.JobType,
                                context: apexClass,
                                status: v.Status,
                                message: v.ExtendedStatus,
                                numIds: v.ids,
                                numErrors: v.errors
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));
    core.addDataset(new OrgCheck.Dataset({
        name: 'batchesScheduledJobs',
        keycache: 'BatchesScheduledJobs',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'CronTrigger': [ 'CreatedById', 'CreatedDate', 'CronExpression', 
                                     'CronJobDetailId', 'EndTime', 'Id', 'LastModifiedById', 
                                     'NextFireTime', 'OwnerId', 'PreviousFireTime', 
                                     'StartTime', 'State', 'TimesTriggered', 'TimeZoneSidKey' ]
                },
                onError: reject,
                onEnd: () => {
                    let artificial_id = 0;
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: false, 
                            string: 'SELECT CreatedById, CreatedDate, CronExpression, '+
                                        'CronJobDetailId, CronJobDetail.JobType, CronJobDetail.Name, '+
                                        'EndTime, Id, LastModifiedById, NextFireTime, OwnerId, '+
                                        'PreviousFireTime, StartTime, State, TimesTriggered, '+
                                        'TimeZoneSidKey '+
                                    'FROM CronTrigger '+
                                    'WHERE State <> \'COMPLETE\' ' +
                                    'LIMIT 10000 '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            let jobTypeLabel = '';
                            switch (v.CronJobDetail.JobType) {
                                case '1': jobTypeLabel = 'Data Export'; break;
                                case '3': jobTypeLabel = 'Dashboard Refresh'; break;
                                case '4': jobTypeLabel = 'Reporting Snapshot'; break;
                                case '6': jobTypeLabel = 'Scheduled Flow'; break;
                                case '7': jobTypeLabel = 'Scheduled Apex'; break;
                                case '8': jobTypeLabel = 'Report Run'; break;
                                case '9': jobTypeLabel = 'Batch Job'; break;
                                case 'A': jobTypeLabel = 'Reporting Notification'; break;
                                default:  return; // skip if type is not supported
                            }
                            return { 
                                id: 'SCHJOBS-'+artificial_id++,
                                name: v.CronJobDetail.Name,
                                type: jobTypeLabel,
                                status: v.State,
                                userid: core.doSimplifiySalesforceID(v.OwnerId),
                                start: v.StartTime,
                                end: v.EndTime,
                                timezone: v.TimeZoneSidKey
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // CUSTOM FIELDS
    // ------------------------------------------------------------------------
    // Get the list of custom fields in Salesforce 
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'customFields',
        keycache: 'CustomFields',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                },
                onError: reject,
                onEnd: () => {
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: true, 
                            string: 'SELECT Id, EntityDefinition.QualifiedApiName, EntityDefinitionId, '+
                                        'DeveloperName, NamespacePrefix, Description, CreatedDate, LastModifiedDate '+
                                    'FROM CustomField '+
                                    'WHERE ManageableState = \'unmanaged\' '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            if (v.EntityDefinition) {
                                const objectId = core.doSimplifiySalesforceID(v.EntityDefinitionId);
                                const objectName = v.EntityDefinition.QualifiedApiName;
                                return { 
                                    id: core.doSimplifiySalesforceID(v.Id),
                                    objectId: objectId,
                                    objectDeveloperName: objectName,
                                    fieldName: v.DeveloperName,
                                    developerName: v.DeveloperName,
                                    package: v.NamespacePrefix,
                                    fullName: v.DeveloperName,
                                    description: v.Description,
                                    createdDate: v.CreatedDate, 
                                    lastModifiedDate: v.LastModifiedDate
                                };
                            }
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // ORG WIDE DEFAULTS
    // ------------------------------------------------------------------------
    // Get the list of all org wide default in this org
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'orgWideDefaults',
        keycache: 'OrgWideDefaults',
        retriever: function(me, resolve, reject) {
            core.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    /*'EntityDefinition': [ 'DurableId', 'QualifiedApiName', 'MasterLabel', 
                                          'ExternalSharingModel', 'InternalSharingModel',
                                          'NamespacePrefix', 'IsCustomSetting',
                                          'IsApexTriggerable', 'IsCompactLayoutable' ]*/
                },
                onError: reject,
                onEnd: () => {
                    // We have some issue calling the Bulk API with jsforce
                    // As EntityDefinition does not accept querMore, we will trick the system
                    const MAX_COUNT_ENTITYDEF = 600;
                    const BATCH_SIZE = 200;
                    const NUM_LOOP = MAX_COUNT_ENTITYDEF/BATCH_SIZE;
                    const entityDefQueries = [];
                    for (let i=0; i<NUM_LOOP; i++) {
                        entityDefQueries.push({
                            rest: true,
                            string: 'SELECT DurableId, QualifiedApiName, MasterLabel, ExternalSharingModel, InternalSharingModel, '+
                                        'NamespacePrefix '+
                                    'FROM EntityDefinition '+
                                    'WHERE IsCustomSetting = false '+
                                    'AND IsApexTriggerable = true '+
                                    'AND IsCompactLayoutable = true '+
                                    'LIMIT ' + BATCH_SIZE + ' '+
                                    'OFFSET ' + (BATCH_SIZE*i),
                            queryMore: false
                        });
                    }
                    core.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: entityDefQueries,
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return { 
                                id: v.DurableId,
                                name: v.QualifiedApiName,
                                label: v.MasterLabel,
                                package: v.NamespacePrefix,
                                external: v.ExternalSharingModel,
                                internal: v.InternalSharingModel
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));
}