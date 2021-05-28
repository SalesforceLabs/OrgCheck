/**
 * OrgCheck main object
 */
const OrgCheck = {

    /**
     * OrgCheck Version
     */
    version: 'v1.9.4',

    /**
     * Organization Id where OrgCheck is currently installed
     */
    localOrgId: '',

    /**
     * Handlers
     */
    handlers: {

        /**
         * Salesforce query handler
         * @param configuration Object must contain 'version', 'instanceUrl' and 'accessToken'
         */
        SalesforceQueryHandler: function (configuration) {

            /**
             * Pivotable version number we use for connection and api age calculation
             */
            const API_VERSION = configuration.version;

            /**
             * Private connection to Salesforce using JsForce
             */
            //const BULK_CONNECTION = new jsforce.Connection({
            //    accessToken: configuration.accessToken,
            //    version: API_VERSION + ".0",
            //    proxyUrl: '/services/proxy',
            //    instanceUrl: 'https://eu29.salesforce.com'
            //});
            const CONNECTION = new jsforce.Connection({
                accessToken: configuration.accessToken,
                version: API_VERSION + ".0",
                maxRequest: "10000",
                instanceUrl: configuration.instanceUrl
            });

            /**
             * Is an API version is old or not?
             * @param version The given version number (should be an integer)
             * @param definition_of_old in Years (by default 3 years)
             */
            this.isVersionOld = function(version, definition_of_old = 3) {
                // Compute age version in Years
                const age = (API_VERSION - version) / 3;
                if (age >= definition_of_old) return true;
                return false;
            };

            /**
            * Helper to extract the package and developer name
            * @param fullDeveloperName Developer Name
            */
            this.splitDeveloperName = function(fullDeveloperName) {
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
            * Do a global describe on the salesforce org
            * @param onResultCallback Callback function to call with the results from global describe
            * @param onErrorCallback Callback function to call if there is an error
            */
            this.doDescribeGlobal = function (
                onResultCallback,
                onErrorCallback
            ) {
                CONNECTION.describeGlobal(function (error, result) {
                    if (error) {
                        if (onErrorCallback) {
                            onErrorCallback(error);
                        }
                    } else {
                        if (onResultCallback) {
                            onResultCallback(result.sobjects);
                        }
                    }
                });
            };

            /**
            * Do a describe for a specific object in the salesforce org
            * @param developerName Developer name of the object to retrieve
            * @param onResultCallback Callback function to call with the describe of this object
            * @param onErrorCallback Callback function to call if there is an error
            */
            this.doDescribeObject = function (
                developerName,
                onResultCallback,
                onErrorCallback
            ) {
                CONNECTION.sobject(developerName).describe$(function (error, object) {
                    if (error) {
                        if (onErrorCallback) {
                            onErrorCallback(error);
                        }
                    } else {
                        if (onResultCallback) {
                            onResultCallback(object);
                        }
                    }
                });
            };

            /**
            * Do a metadata retrieve describe for a specific type and list of members
            * @param types List of types of metadata to retrieve
            * @param onResultCallback Callback function to call with the information
            * @param onErrorCallback Callback function to call if there is an error
            */
            this.doMetadataRetrieve = function(
                types, 
                onResultCallback,
                onErrorCallback
            ) {
                CONNECTION.metadata.list(types, API_VERSION + ".0", function(error, metadata) {
                    if (error) {
                        if (onErrorCallback) {
                            onErrorCallback(error);
                        }
                    } else {
                        if (onResultCallback) {
                            onResultCallback(metadata);
                        }
                    }
                });
            }

            /**
            * Do Salesforce SOQL queries from Tooling API or not
            * @param queries Array of objects containing 'tooling', 'queryMore' and 'string'
            * @param onEachRecordCallback Callback function for each record from database
            * @param onEndCallback Callback function to call with all records (as a map)
            * @param onErrorCallback Callback function to call if there is an error
            */
            this.doQueries = function (
                queries,
                onEachRecordCallback,
                onEndCallback,
                onErrorCallback
            ) {
                const promises = [];
                queries.forEach((q, i) => promises.push(new Promise(function (resolve, reject) {
                    private_query({
                        index: i,
                        queryString: q.string,
                        queryMore: q.queryMore, 
                        api: (q.tooling === true ? 'tooling' : (q.bulk === true ? 'bulk' : 'rest')),
                        onEach: onEachRecordCallback,
                        onEnd: function (map, size) {
                            resolve({ d: map, l: size });
                        },
                        onError: function(error) {
                            error.context = { 
                                when: 'While creating a promise to call "private_query".',
                                what: {
                                    index: i,
                                    queryMore: q.queryMore,
                                    queryString: q.string,
                                    queryUseTooling: q.tooling
                                }
                            };
                            reject(error);
                        }
                    });
                })));
                Promise.all(promises)
                    .then(function (results) {
                        let data = {};
                        let length = 0;
                        results.forEach((v) => {
                            data = Object.assign({}, data, v.d);
                            length += v.l;
                        });
                        onEndCallback(data, length);
                    })
                    .catch(function (error) {
                        onErrorCallback(error);
                    });
            };

            function private_query(config) {
                const data = { records: {}, size: 0 };
                const wrap = function(record, totalSize) {
                    const wrapper = (config.onEach ? config.onEach(record, config.index, data.size+1, totalSize) : record);
                    if (wrapper && wrapper.id) {
                        const oldValue = data.records[wrapper.id];
                        if (!oldValue) data.size++;
                        data.records[wrapper.id] = wrapper;
                    }
                }
                try {
                    switch (config.api) {
                        case 'rest':
                        case 'tooling':
                            const api = (config.api === 'rest' ? CONNECTION : CONNECTION.tooling);
                            const callback_api = function(error, result) {
                                // Check errors
                                if (error) {
                                    config.onError(error);
                                    return;
                                }
                                // Add results to data
                                result.records.forEach((record) => wrap(record, result.totalSize));
                                // Continue looping?
                                if (result.done === true || (result.done === false && config.queryMore === false)) {
                                    if (config.onEnd) {
                                        config.onEnd(data.records, data.size);
                                    }
                                } else {
                                    api.queryMore(result.nextRecordsUrl, callback_api);
                                }
                            }
                            api.query(config.queryString, callback_api);
                            break;

                        case 'bulk':
                            /* bug in jsforce for bulk api with more than one batch */
                            //const query = config.queryString;
                            //const start = query.toUpperCase().lastIndexOf('FROM ')+5;
                            //const end = query.indexOf(' ', start);
                            //const table = query.substring(start, end);
                            //const job = BULK_CONNECTION.bulk.createJob(table, 'query');
                            //const batch = job.createBatch();
                            //batch.execute(query);
                            //batch.on('error', err => config.onError(err));
                            //batch.on('queue', info => { 
                            //    console.log('queue ==> info: ', info);
                            //    batch.poll(1000, 500000);
                            //});
                            //batch.on('response', responses => {
                            //    console.log('response ==> responses: ', responses);
                            //    responses.forEach(response => {
                            //        const ebatch = BULK_CONNECTION.bulk.job(response.jobId).batch(response.batchId);
                            //        ebatch.retrieve((error, results) => {
                            //            // Check errors
                            //            if (error) {
                            //                config.onError(error);
                            //                return;
                            //            }
                            //            // Add results to data
                            //            console.log('response ==> results: ', results);
                            //            results.forEach(result => ebatch.result(result.id)
                            //                .on('data', d => {
                            //                    console.log('record====', d);
                            //                    wrap(d);
                            //               })
                            //                .on('end', function() {
                            //                    if (config.onEnd) {
                            //                        config.onEnd(data.records, data.size);
                            //                    }
                            //                    console.log('end====', data.records, data.size);
                            //                })
                            //            );
                            //        });
                            //    });
                            //    // Close job
                            //    job.close();
                            //});
                            break;
                    }
                } catch (error) {
                    config.onError(error);  
                }
            }
        },

        /**
        * Format handler
        * @param configuration Object must contain 'defaultDateFormat' and 'defaultDatetimeFormat'
        */
        FormatterHandler: function (configuration) {
            /**
            * Returns systematically an ID15 based on the ID18
            * @param id to simplify
            */
            this.salesforceIdFormat = function (id) {
                if (id && id.length == 18) return id.substr(0, 15);
                return id;
            };

            /**
            * Returns the string representation of a given date using the user's preferences
            * @param value to format (number if a timestamp, string otherwise)
            */
            this.dateFormat = function (value) {
                return private_date_format(
                    value,
                    UserContext.dateFormat,
                    configuration.defaultDateFormat
                );
            };

            /**
            * Returns the string representation of a given datetime using the user's preferences
            * @param value to format (number if a timestamp, string otherwise)
            */
            this.datetimeFormat = function (value) {
                return private_date_format(
                    value,
                    UserContext.dateTimeFormat,
                    configuration.defaultDatetimeFormat
                );
            };

            /**
            * Private method to format data/time into a string representation
            * @param value to format (number if a timestamp, string otherwise)
            * @param format to use
            * @param formatIfNull to use if the previous parameter was null or empty
            */
            function private_date_format(value, format, formatIfNull) {
                if (value) {
                    const timestamp = typeof value === "number" ? value : Date.parse(value);
                    return DateUtil.formatDate(
                        new Date(timestamp),
                        format ? format : formatIfNull
                    );
                }
                return "";
            }
        },

        /**
        * Message handler
        * @param configuration Object must contain 'modalContentId', 'modalId'
        */
        MessageHandler: function (configuration) {

            const private_errors = [];

            /**
            * Show error and clean other stuff in the page
            * @param error
            */
            this.showError = function (error) {
                if (error) {
                    private_errors.push(error);
                    let commonHTML = '<h1 class="slds-text-heading--small"></h1><br /><br />';
                    commonHTML += 'Please go <a href="https://github.com/VinceFINET/OrgCheck/issues" '+
                            'target="_blank">here</a> and log an issue with the following information. <br /'+
                            '><br />';
                    let informationHTML = '<b>OrgCheck Information</b><br />';
                    informationHTML += 'Version: ' + (OrgCheck && OrgCheck.version ? OrgCheck.version : 'no version available') + '<br />';
                    informationHTML += 'Installed on OrgId: ' + (OrgCheck && OrgCheck.localOrgId ? OrgCheck.localOrgId : 'no orgId available') + '<br />';
                    informationHTML += '<br />';
                    informationHTML += '<b>Navigation Information</b><br />';
                    informationHTML += 'Page: ' + document.location.pathname + '<br />';
                    informationHTML += '<br />';
                    informationHTML += '<b>System Information</b><br />';
                    informationHTML += 'User Agent: ' + navigator.userAgent + '<br />';
                    informationHTML += 'Operating System: ' + navigator.platform + '<br />';
                    informationHTML += 'Language: ' + navigator.language + '<br />';
                    informationHTML += '<br />';
                    private_errors.forEach((v, i) => {
                        informationHTML += '<b>Error #' + i + ': ' + v.name + '</b><br />';
                        if (v.context) {
                            informationHTML += 'When: <small><code>' + v.context.when + '</code></small><br />';
                            informationHTML += 'What:<ul class="slds-list_dotted">';
                            for (k in v.context.what) {
                                informationHTML += '<li>' + k + ': <small><code>' + v.context.what[k] + '</code></small></li>';
                            }
                            informationHTML += '</ul>';
                        }
                        if (v.stack) {
                            informationHTML += 'Stack: <br/> <small><code>' + v.stack.replace(/  at /g, '<br />&nbsp;&nbsp;&nbsp;at ') + '</code></small><br />';
                        }
                        informationHTML += '<br />';
                    });
                    private_show_modal(
                        'Oh no, OrgCheck had an error!', 
                        commonHTML + informationHTML.replace(/https:\/\/[a-zA-Z0-9_-]*\./g, 'https://ANONYMIZED_MYDOMAIN.')
                    );
                }
            };

            /**
            * Show dialog box with a title and content
            * @param title String title
            * @param content String html or NodeElement representing the content of the box
            */
            this.showModal = function (title, element) {
                private_show_modal(title, element);
            };

            /**
            * Show the modal dialog box
            * @param element Html element to show in the modal box
            */
            function private_show_modal(title, element) {
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
                document.getElementById(configuration.modalId).style.display = 'block';
            }
        },

        /**
        * Caching handler
        * @param configuration Object must contain 'isPersistant', 'cachePrefix', 'timestampKey', 'sizeKey' and 'versionKey'
        */
        CacheHandler: function (configuration) {

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
            * Method to clear all OrgCheck cached items
            * @param section Name of the section (group of keys) in the cache. If undefined, any section
            */
            this.clearAll = function (section) {
                let keys_to_remove = private_get_keys(section);
                for (let i = 0; i < keys_to_remove.length; i++) {
                    private_delete_item(section, keys_to_remove[i]);
                }
            };

            /**
            * Method to clear one OrgCheck cached item
            * @param section Name of the section (group of keys) in the cache.
            * @param key in cache (without the prefix) to use
            * @return the previous value that has been deleted
            */
            this.clear = function (section, key) {
                const oldValue = private_delete_item(section, key);
                return oldValue;
            };

            /**
            * Method to get all keys of the WoldemOrg cache
            * @param section Name of the section (group of keys) in the cache.
            * @return All keys of the cache of the section.
            */
            this.keys = function (section) {
                const keys = private_get_keys(section);
                return keys;
            };

            /**
            * Method to get an item from the cache
            * @param section Name of the section (group of keys) in the cache.
            * @param key in cache (without the prefix) to use
            * @return the value in cache (undefined if not found)
            */
            this.getItem = function (section, key) {
                const value = private_get_item(section, key);
                return value;
            };

            /**
            * Method to get the timestamp and version of a specific cache item
            * @param section Name of the section (group of keys) in the cache.
            * @param key in cache (without the prefix) to use
            * @return the side values of the item in cache (undefined if not found)
            */
            this.sideValues = function (section, key) {
                const value = private_get_item(section, key);
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
            * @param section Name of the section (group of keys) in the cache.
            * @param key in cache (without the prefix) to use
            * @param value of the item to store in cache
            */
            this.setItem = function (section, key, value) {
                try {
                    private_set_item(section, key, value);
                } catch (e) {
                    private_log_error(e);
                }
            };

            /**
            * Method to cache error and clean other stuff in the page
            * @param section Name of the section (group of keys) in the cache.
            * @param key in cache (without the prefix) to use
            * @param retrieverCallback function that we call to get the value
            * @param finalCallback function to call after the value was got
            */
            this.cache = function (section, key, retrieverCallback, finalCallback) {
                // Query the cache first
                const value = private_get_item(section, key);
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
                                private_set_item(section, key, newValue);
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
            * Log actions from the cache
            * @param e Error
            */
            function private_log_error(e) {
                console.error("[OrgCheck:Cache]", { error: e });
            }

            /**
            * Private method to generate the prefix used for keys in cache
            * @param section Name of the section (group of keys) in the cache.
            * @return Prefix generated from section name
            */
            function private_generate_prefix(section) {
                return configuration.cachePrefix + "." + (section ? section + "." : "");
            }

            /**
            * Returns all the OrgCheck keys in cache
            * @param section Name of the section (group of keys) in the cache.
            * @return All the keys of the OrgCheck cache for the given section
            */
            function private_get_keys(section) {
                const prefix = private_generate_prefix(section);
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
            * @param section Name of the section (group of keys) in the cache.
            * @param key in cache (without the prefix) to use
            * @return the value in cache (undefined if not found)
            */
            function private_get_item(section, key) {
                const k = private_generate_prefix(section) + key;
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
            * @param section Name of the section (group of keys) in the cache.
            * @param key in cache (without the prefix) to use
            * @param value of the item to store in cache
            */
            function private_set_item(section, key, value) {
                if (!value) return;
                try {
                    value[TIMESTAMP_KEY] = Date.now();
                    value[VERSION_KEY] = OrgCheck.version;
                    CACHE_SYSTEM.setItem(
                        private_generate_prefix(section) + key,
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
            * Private method to clear one OrgCheck cached item
            * @param section Name of the section (group of keys) in the cache.
            * @param key in cache (without the prefix) to use
            * @return the previous value that has been deleted
            */
            function private_delete_item(section, key) {
                return CACHE_SYSTEM.removeItem(private_generate_prefix(section) + key);
            }
        },

        /**
        * Manage a "map" in this context which is an object containing
        *              Salesforce IDs as properties plus an extra property called
        *              "size" which is the number of Salesforce IDs contained in the
        *              object.
        * @param configuration Object must contain 'keySize' and 'keyExcludePrefix'
        */
        MapHandler: function (configuration) {
            /**
            * Iterative function for each key of the given map
            * @param map Given map
            * @param keyCallback function to call for each key of the given map
            */
            this.forEach = function (map, keyCallback) {
                for (let key in map)
                    if (map.hasOwnProperty(key) && key !== configuration.keySize 
                            && !key.startsWith(configuration.keyExcludePrefix)) {
                        keyCallback(key);
                    }
            };

            /**
            * Returns the size of the map (as stored)
            * @param map Given map
            */
            this.getSize = function (map) {
                return map[configuration.keySize];
            };

            /**
            * Set the size of the map
            * @param map Given map
            * @param newSize
            */
            this.setSize = function (map, newSize) {
                map[configuration.keySize] = newSize;
            };

            /**
            * Returns the keys of the map (excluding the technical size key!)
            * @param map Given map
            * @return Keys of the map
            */
            this.keys = function (map) {
                if (!map) return [];
                const keys = Object.keys(map);
                return keys.filter(key => key !== configuration.keySize && !key.startsWith(configuration.keyExcludePrefix));
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
            this.concat = function (array1, array2, prop) {
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
            };
        },

        /**
        * Progress bar handler
        * @param configuration Object must contain 'progressBarDivId' and 'spinnerDivId'
        */
        ProgressBarHandler: function (configuration) {

            const PROGRESSBAR_DIV = document.getElementById(configuration.progressBarDivId);
            const SPINNER_DIV = document.getElementById(configuration.spinnerDivId);
            const SPINNER_MSG_DIV = document.getElementById(configuration.spinnerMessageId);

            /**
            * Reset the progress bar with current value at zero
            * @param message Optionnal message to display
            */
            this.empty = function (message) {
                private_set_progress_bar(0, 1);
                private_set_message(message, false);
            };

            /**
            * Reset the progress bar with maximum value
            * @param message Optionnal message to display
            */
            this.full = function (message) {
                private_set_progress_bar(1, 1);
                private_set_message(message, true);
            };

            /**
            * Set the progress bar with a given value
            * @param value
            * @param max
            * @param message Optionnal message to display
            */
            this.set = function (value, max, message) {
                private_set_progress_bar(value, max);
                private_set_message(message, true);
            };

            /**
            * Set the progress message with a given value
            * @param message message to display
            */
            this.still = function (message) {
                private_set_message(message, true);
            };

            /**
            * Hide the spinner and toast
            */
            this.hide = function () {
                SPINNER_DIV.style.display = 'none';
                SPINNER_MSG_DIV.style.display = 'none';
            };

            /**
            * Show the spinner and toast
            */
            this.show = function () {
                SPINNER_DIV.style.display = 'block';
                SPINNER_MSG_DIV.style.display = 'block';
            };

            /**
            * Private method to set the message
            * @param message Text to write in the div
            * @param isAppended Reset the content or just append it
            */
            function private_set_message(message, isAppended) {
                if (message) {
                    if (isAppended === true) {
                        SPINNER_MSG_DIV.innerHTML += message + '<br />';
                    } else {
                        SPINNER_MSG_DIV.innerHTML = message + '<br />';
                    }
                }
            };

            /**
            * Private method to set the progress bar to the current
            *              value and potentially stop the spinner if we reach
            *              the maximum.
            * @param currentValue
            * @param maxValue
            */
            function private_set_progress_bar(currentValue, maxValue) {
                if (!maxValue) {
                    maxValue = 100;
                    currentValue = currentValue % maxValue;
                }
                PROGRESSBAR_DIV.style.width = (currentValue / maxValue) * 100 + "%";
            }
        }
    },

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
     *                <li><code>sfLocalInstanceUrl</code>: Salesforce Endpoint to access the local org</li>
     *                <li><code>htmlProgressBarTagId</code>: HTML Tag Id of the progress bar zone</li> 
     *                <li><code>htmlSpinnerTagId</code>: HTML Tag Id of the spinner zone</li> 
     *                <li><code>htmlSpinnerMessageTagId</code>: HTML Tag Id of the message that goes along with the spinner</li>
     *                <li><code>htmlModalContentTagId</code>: HTML Tag Id of the content zone of the dialog box</li> 
     *                <li><code>htmlModalTagId</code>: HTML Tag Id of the dialog box zone</li> 
     *                <li><code>htmlModalTitleTagId</code>: HTML Tag Id of the title zone of the dialog box</li> 
     *                <li><code>htmlMainContentTagId</code>: HTML Tag Id of the main content zone of the page</li> 
     *                <li><code>formatDefaultDate</code>: Default date format (if not specified for the current user)</li> 
     *                <li><code>formatDefaultDatetime</code>: Default datetime format (if not specified for the current user)</li> 
     *              </ol>
     */
    Core: function(setup) {

        // ======================================================
        // INITIALIZATION OF HANDLERS
        // ======================================================
        
        const CACHE_PREFIX = 'OrgCheck';
        const CACHE_SECTION_METADATA = 'Metadata';
        const CACHE_SECTION_PREFERENCE = 'Preference';
        const CACHE_SECTION_AUTH = 'Autorization';
        const MAP_KEYSIZE = '__51Z3__';

        const PERSISTANT_CACHE_HANDLER = new OrgCheck.handlers.CacheHandler({
            isPersistant: true,
            cachePrefix: CACHE_PREFIX
        });

        const TEMPORARY_CACHE_HANDLER = new OrgCheck.handlers.CacheHandler({
            isPersistant: false,
            cachePrefix: CACHE_PREFIX
        });

        // Current org information set by default to the local org
        const ORG_INFORMATION = {
            id: setup.sfLocalAccessToken.split('!')[0],
            version: setup.sfApiVersion,
            accessToken: setup.sfLocalAccessToken
        }

        // Set global information about org (in case of showError mainly)
        OrgCheck.localOrgId = ORG_INFORMATION.id;

        // Get the current Organization information
        const currentOrgId = TEMPORARY_CACHE_HANDLER.getItem(CACHE_SECTION_AUTH, 'CurrentOrgId');
        if (currentOrgId) {
            const orgs = TEMPORARY_CACHE_HANDLER.getItem(CACHE_SECTION_AUTH, 'Organisations') || {};
            if (orgs[currentOrgId] && orgs[currentOrgId].endpointUrl && orgs[currentOrgId].token) {
                ORG_INFORMATION.id = currentOrgId;
                ORG_INFORMATION.accessToken = orgs[currentOrgId].token;
                ORG_INFORMATION.instanceUrl = orgs[currentOrgId].endpointUrl;
                ORG_INFORMATION.proxyUrl = '/services/proxy';
            }
        }
        TEMPORARY_CACHE_HANDLER.setItem(CACHE_SECTION_AUTH, ORG_INFORMATION.id);
        document.getElementById('org-id').textContent = ORG_INFORMATION.id;

        const SALESFORCE_HANDLER = new OrgCheck.handlers.SalesforceQueryHandler(ORG_INFORMATION);

        const MAP_HANDLER = new OrgCheck.handlers.MapHandler({
            keySize: MAP_KEYSIZE,
            keyExcludePrefix: '__'            
        });

        const ARRAY_HANDLER = new OrgCheck.handlers.ArrayHandler();

        const MSG_HANDLER = new OrgCheck.handlers.MessageHandler({
            modalContentId: setup.htmlModalContentTagId,
            modalId: setup.htmlModalTagId,
            modalTitleId: setup.htmlModalTitleTagId
        });

        const PROGRESSBAR_HANDLER = new OrgCheck.handlers.ProgressBarHandler({
            progressBarDivId: setup.htmlProgressBarTagId,
            spinnerDivId: setup.htmlSpinnerTagId,
            spinnerMessageId: setup.htmlSpinnerMessageTagId
        });
        
        const FORMAT_HANDLER = new OrgCheck.handlers.FormatterHandler({ 
            defaultDateFormat: setup.formatDefaultDate,  
            defaultDatetimeFormat: setup.formatDefaultDatetime 
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
                        PROGRESSBAR_HANDLER.empty('*** Error ***');
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
                    PROGRESSBAR_HANDLER.show();
                    PROGRESSBAR_HANDLER.empty('Starting...');
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
                                ctlSetup.actions.exportTable.forEach(d => {
                                    if (d.visibleTab) {
                                        const tab = document.getElementById(d.visibleTab).parentNode;
                                        if (tab.classList.contains('slds-is-active') === false) {
                                            return;
                                        }
                                    }
                                    const table = document.getElementById(d.table);
                                    const rows = table.querySelectorAll('table tr');
                                    const data = [];
                                    for (let i=0; i<rows.length; i++) {
                                        const row = [];
                                        const cols = rows[i].querySelectorAll('td, th');
                                        for (let j=0; j<cols.length; j++) {
                                            let v = cols[j].attributes['aria-label']?.value || cols[j].innerText;
                                            v = v.replaceAll('\n', ','); // we used innerText so that \n stays, which is not the case for textContext
                                            if (v && v.indexOf(',')  != -1) v = '"'+v+'"';
                                            row.push(v);
                                        }
                                        data.push(row.join(","));        
                                    }
                                    const link = document.createElement('a');
                                    link.style.visibility = 'hidden';
                                    document.body.appendChild(link);
                                    link.download = d.filename + '.csv';
                                    link.target = '_blank';
                                    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(data.join('\n'));
                                    link.click();
                                    document.body.removeChild(link);
                                });
                            }
                            buttonExport.parentNode.style.display = 'block';
                        }
                        // 3.3 Set the help button (if specified)
                        if (ctlSetup.actions && ctlSetup.actions.help && ctlSetup.actions.help.content) { 
                            const buttonHelp = document.getElementById('button-help');
                            buttonHelp.onclick = function(e) { 
                                const lines = ctlSetup.actions.help.content || [];
                                let html = '<ul class="slds-has-dividers_around-space">';
                                lines.forEach(l => html += '<li class="slds-item" style="background-color: #f0f8ff;">'+l+'</li>');
                                html += '</ul>';
                                MSG_HANDLER.showModal('With A Little Help From My Friends', html);
                            };
                            buttonHelp.parentNode.style.display = 'block';
                        }
                    }

                    // 4. Method that calls the callback fonction and set the progress bar top 'FULL'
                    const onEnd = function(map) {
                        PROGRESSBAR_HANDLER.still('Records processing starting...');
                        ctlSetup.onRecords(map);
                        PROGRESSBAR_HANDLER.still('Records processing ended successfuly');
                        PROGRESSBAR_HANDLER.still('Action buttons starting...');
                        initActions(map);
                        PROGRESSBAR_HANDLER.still('Action buttons ended successfuly');
                        setTimeout(function() {
                            PROGRESSBAR_HANDLER.hide();
                            document.getElementById(setup.htmlMainContentTagId).style.display = 'block';
                        }, 1000);
                    }

                    // 5. Calling the dataset retreivers
                    const onLoadPromises = [];
                    ctlSetup.datasets.forEach(dataset => onLoadPromises.push(new Promise(function(s, e) { 
                        PROGRESSBAR_HANDLER.still('Dataset ['+dataset+'] starting...');
                        private_datasets_collection[dataset].retriever(
                            function(m) {
                                PROGRESSBAR_HANDLER.still('Dataset ['+dataset+'] ended successfuly');
                                s(m);
                            }, function(m) {
                                PROGRESSBAR_HANDLER.still('Dataset ['+dataset+'] ended with an error');
                                e(m);
                            }
                        ); 
                    })));

                    // 6. Calling the dataset retreivers
                    Promise.all(onLoadPromises)
                        .then(function(results) {
                            PROGRESSBAR_HANDLER.still('All datasets ('+ctlSetup.datasets.length+') were retrieved');
                            PROGRESSBAR_HANDLER.still('Mapping process starting...');
                            // 7. When all datasets are retreived, we calculate keys and map
                            const map = {};
                            let keys = [];
                            results.forEach((v, i) => {
                                map[ctlSetup.datasets[i]] = v;
                                keys = ARRAY_HANDLER.concat(keys, MAP_HANDLER.keys(v));
                            });
                            PROGRESSBAR_HANDLER.still('Mapping process ended successfuly');
                            return { m: map, k: keys };
                        })
                        .catch(function(error) {
                            PROGRESSBAR_HANDLER.still('Mapping process ended with an error');
                            showError(error);
                        }) 
                        .then(function(data) {
                            if (data) { // check if no error during mapping
                                // 8. If we were asked to get the dependencies of all Salesforce Ids in the map
                                if (ctlSetup.dependencies === true) {
                                    PROGRESSBAR_HANDLER.still('Dependencies process starting...');
                                    private_salesforce_dapi(
                                        data.k, 
                                        function(dependencies) { 
                                            PROGRESSBAR_HANDLER.still('Dependencies process ended successfuly');
                                            // We are altering the map to include the dependencies
                                            data.m['dependencies'] = dependencies || {};
                                            // 9.1 And then call the method (with dependencies)
                                            onEnd(data.m);
                                        }, 
                                        function(error) {
                                            PROGRESSBAR_HANDLER.still('Dependencies process ended with an error');
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
                            private_salesforce_descrive_object({
                                objectName: obj, 
                                callbackSuccess: success,
                                callbackError: error
                            });
                        }
                    },
                    version: {
                        isOld: function(version) {
                            return SALESFORCE_HANDLER.isVersionOld(version, 3);
                        }
                    },
                    information: function() {
                        return { 
                            organizationId: ORG_INFORMATION.id,
                            apiVersion: ORG_INFORMATION.version
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
                    },
                    switchToOrg: function(mydomain_url, id_url, access_token) {
                        PERSISTANT_CACHE_HANDLER.clearAll(CACHE_SECTION_METADATA);
                        var orgId = '';
                        if (mydomain_url && id_url && access_token) {
                            const arrSplit = id_url.split('/');
                            orgId = arrSplit[4].substring(0, 15);
                            const userId = arrSplit[5];
                            const map = TEMPORARY_CACHE_HANDLER.getItem(CACHE_SECTION_AUTH, 'Organisations') || {};
                            map[orgId] = { 
                                'orgId': orgId,
                                'userId': userId,
                                'endpointUrl': mydomain_url,
                                'token': access_token
                            };
                            TEMPORARY_CACHE_HANDLER.setItem(CACHE_SECTION_AUTH, 'Organisations', map);
                        } else {
                            orgId = setup.sfLocalAccessToken.split('!')[0];
                        }
                        TEMPORARY_CACHE_HANDLER.setItem(CACHE_SECTION_AUTH, 'CurrentOrgId', orgId);
                        document.getElementById('org-id').textContent = orgId;
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
                progressbar: {
                    empty: function(msg) {
                        PROGRESSBAR_HANDLER.empty(msg);
                    },
                    full: function(msg) {
                        PROGRESSBAR_HANDLER.full(msg);
                    },
                    set: function(value, max, msg) {
                        PROGRESSBAR_HANDLER.set(value, max, msg);
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
                    datatable: {
                        create: function(config) {
                            const dt = document.getElementById(config.element);
                            const table = dt.appendChild(document.createElement('table'));
                            if (config.showSearch === true) {
                                const searchBox = dt.insertBefore(document.createElement('div'), table);
                                const searchIcon = searchBox.appendChild(document.createElement('img'));
                                const search = searchBox.appendChild(document.createElement('input'));
                                searchBox.classList.add('slds-input-has-icon', 'slds-input-has-icon_left');
                                searchIcon.classList.add('slds-icon','slds-input__icon','slds-input__icon_left','slds-icon-text-default');
                                searchIcon.setAttribute('src', '/img/chatter/lookupSearchHover.png');
                                search.classList.add('slds-input');
                                search.setAttribute('placeholder', 'Search any field (case sensitive) and press Enter');
                                search.onkeydown = function(e) {
                                    if (e.code === 'Enter') {
                                        PROGRESSBAR_HANDLER.show();
                                        PROGRESSBAR_HANDLER.empty('Filtering...');
                                        const searchValue = e.target.value;
                                        PROGRESSBAR_HANDLER.still('Search value: '+searchValue);
                                        const items = [].slice.call(table.rows).slice(1);
                                        PROGRESSBAR_HANDLER.still('All data size: '+items.length);
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
                                        table.hidden = false; // make table visible again
                                        PROGRESSBAR_HANDLER.still('Number of rows visible: '+nbVisible);
                                        PROGRESSBAR_HANDLER.full('Good job!');
                                        PROGRESSBAR_HANDLER.hide();
                                    }
                                };
                            }
                            table.classList.add('slds-table', 'slds-table_bordered', 'slds-table_cell-buffer');
                            const thead = table.appendChild(document.createElement('thead'));
                            const trHead = thead.appendChild(document.createElement('tr'));
                            trHead.classList.add('slds-text-title_caps');
                            const orderingImage = document.createElement('img');
                            let firstSortCallback;
                            config.columns.forEach((c, i) => {
                                const thHead = trHead.appendChild(document.createElement('th'));
                                thHead.setAttribute('scope', 'col');
                                thHead.setAttribute('aria-label', c.name);
                                thHead.classList.add('slds-is-sortable');
                                const aHead = thHead.appendChild(document.createElement('a'));
                                aHead.classList.add('slds-th__action', 'slds-text-link_reset');
                                aHead.setAttribute('href', 'javascript:void(0);');
                                aHead.setAttribute('role', 'button');
                                aHead.setAttribute('tabindex', i);
                                const assHead = aHead.appendChild(document.createElement('span'));
                                assHead.classList.add('slds-assistive-text');
                                assHead.textContent = 'Sort by: ';
                                const grdHead = aHead.appendChild(document.createElement('div'));
                                grdHead.classList.add('slds-grid', 'slds-grid_vertical-align-center', 'slds-has-flexi-truncate');
                                const ttlHead = grdHead.appendChild(document.createElement('span'));
                                ttlHead.classList.add('slds-truncate');
                                ttlHead.setAttribute('title', c.name);
                                ttlHead.textContent = c.name;
                                aHead.onclick = function(e) { 
                                    if (e) {
                                        PROGRESSBAR_HANDLER.show();
                                        PROGRESSBAR_HANDLER.empty('Sorting...');
                                        if (config.sorting.name === c.name) {
                                            config.sorting.order = (config.sorting.order !== 'asc') ? 'asc' : 'desc';
                                        } else {
                                            config.sorting.name = c.name;
                                            config.sorting.order = 'asc';
                                        }
                                        if (orderingImage.parentNode) {
                                            orderingImage.parentNode.removeChild(orderingImage);
                                        }
                                        PROGRESSBAR_HANDLER.still('Name: '+config.sorting.name);
                                        PROGRESSBAR_HANDLER.still('Order: '+config.sorting.order);
                                    }
                                    if (config.sorting.order === 'asc') {
                                        thHead.setAttribute('aria-sort', 'ascending');
                                        orderingImage.src = '/img/sort_asc_arrow.gif';
                                    } else {
                                        thHead.setAttribute('aria-sort', 'descending');
                                        orderingImage.src = '/img/sort_desc_arrow.gif';
                                    }
                                    if (e) {
                                        PROGRESSBAR_HANDLER.still('Sorting data...');
                                    }
                                    grdHead.appendChild(orderingImage);
                                    const iOrder = config.sorting.order === 'asc' ? 1 : -1;
                                    const items = [].slice.call(table.rows).slice(1);
                                    items.sort(function compare(a, b) {
                                        const valueA = a.getElementsByTagName('td')[i].textContent;
                                        const valueB = b.getElementsByTagName('td')[i].textContent;
                                        if (c.type === 'numeric') return (valueA - valueB) * iOrder;
                                        if (valueA < valueB) return -iOrder;
                                        if (valueA > valueB) return iOrder;
                                        return 0;
                                    });
                                    if (e) {
                                        PROGRESSBAR_HANDLER.still('Reordering rows...');
                                    }
                                    table.hidden = true; // make table invisible while manipulating the DOM
                                    items.forEach(r => {
                                        const parent = r.parentNode;
                                        const detatchedItem = parent.removeChild(r);
                                        parent.appendChild(detatchedItem);
                                    });
                                    table.hidden = false; // make table visible again
                                    if (e) {
                                        PROGRESSBAR_HANDLER.full('Good job!');
                                        PROGRESSBAR_HANDLER.hide();
                                    }
                                };
                                if (config.sorting.name === c.name) {
                                    firstSortCallback = function() { aHead.onclick(); }
                                }
                            });
                            const tbody = table.appendChild(document.createElement('tbody'));
                            const isArray = Array.isArray(config.data);
                            const iterable = isArray ? config.data : MAP_HANDLER.keys(config.data);
                            table.hidden = true; // make table invisible while manipulating the DOM
                            iterable.forEach(k => {
                                if (config.filtering && config.filtering.formula && config.filtering.formula(config.data[k]) === false) return;
                                const trBody = tbody.appendChild(document.createElement('tr'));
                                let rowScore = 0;
                                let tdBodyScore = null;
                                config.columns.forEach(c => {
                                    const tdBody = trBody.appendChild(document.createElement('td'));
                                    if (c.property === '##score##') {
                                        tdBodyScore = tdBody;
                                        return;
                                    }
                                    const row = isArray ? k : config.data[k];
                                    let content = '';
                                    let additiveScore = 0;
                                    try {
                                        if (c.formula) {
                                            content = c.formula(row);
                                        } else if (c.property) {
                                            content = row[c.property];
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
                                            additiveScore = c.scoreFormula(row);
                                            if (additiveScore > 0) { // ensure that the method does not return negative values! ;)
                                                rowScore += additiveScore;
                                                tdBody.bgColor = '#ffd079';
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
                                    if (content) {
                                        const isArray = (Array.isArray(content) === true);
                                        if (typeof content === 'object' && isArray === false) {
                                            if (additiveScore > 0) {
                                                tdBody.innerHTML = '<img src="/img/samples/flag_red.gif" alt="red flag" />&nbsp;';
                                            }       
                                            tdBody.appendChild(content);
                                        } else {
                                            let html = '';
                                            if (additiveScore > 0) {
                                                html += '<img src="/img/samples/flag_red.gif" alt="red flag" />&nbsp;';
                                            }
                                            if (isArray === true) {
                                                content.forEach(cnt => html += cnt+'<br />');
                                            } else {
                                                html += content;
                                            }
                                            tdBody.innerHTML = html;
                                        }
                                    }
                                    const alternative = (c.property && c.formula ? row[c.property] : '') || '';
                                    if (alternative !== '' || alternative === true || alternative === false) {
                                        tdBody.setAttribute('aria-label', alternative?.toString());
                                    }
                                });
                                if (tdBodyScore && rowScore > 0) {
                                    tdBodyScore.innerHTML = '<img src="/img/msg_icons/error16.png" alt="bad score: '+rowScore+'" />&nbsp;' + rowScore;
                                    tdBodyScore.bgColor = '#ffd079';
                                    trBody.bgColor = '#ffe099';
                                }
                            });
                            table.hidden = false; // make table visible again
                            if (firstSortCallback) { 
                                firstSortCallback(); 
                            }
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
                            PROGRESSBAR_HANDLER.set(0, 1);
                            const tabItems = document.getElementsByClassName(itemClass);
                            const tabContents = document.getElementsByClassName(contentClass);
                            const buttons = document.getElementsByClassName(buttonClass);
                            for (let i=0; i<tabItems.length; i++) {
                                tabItems[i].onclick = function(event) {
                                    for (let j=0; j<tabItems.length; j++) {
                                        if (tabItems[j] == event.target.parentElement) {
                                            tabItems[j].classList.add('slds-is-active');
                                        } else {
                                            tabItems[j].classList.remove('slds-is-active');
                                        }
                                    }
                                    let correspondingTabId = event.target.attributes['aria-controls'].value;
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
                                    // show tab according to selection
                                    for (let j=0; j<tabContents.length; j++) {
                                        if (tabContents[j].id == correspondingTabId) {
                                            tabContents[j].classList.add('slds-show');
                                            tabContents[j].classList.remove('slds-hide');
                                        } else {
                                            tabContents[j].classList.remove('slds-show');
                                            tabContents[j].classList.add('slds-hide');
                                        }
                                    }
                                }
                            }
                            PROGRESSBAR_HANDLER.set(1, 1);
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
                        dependencies: function(id, name, data) {
                            const div = document.createElement('div');
                            div.style.cursor = 'zoom-in';
                            div.onclick = function() {
                                MSG_HANDLER.showModal('Dependencies Information', private_compute_dependencies_graph('dep'+id, name, data, '#5fc9f8')); 
                            };
                            div.setAttribute('id', 'chart-container-' + id);
                            div.innerHTML = (data.using?'<b>Using</b>':'Not using')+' / '+(data.used?'<b>Used</b>':'Not used')+' <img src="/img/chatter/lookupSearchHover.png" />';
                            return div;
                        },
                        percentage: function(v) {
                            if (v) {
                                const vv = Number.parseFloat(v);
                                if (!Number.isNaN(vv)) return (vv*100).toFixed(2) + ' %';
                            }
                            return '0 %';
                        },
                        checkbox: function(b) {
                            if (b) return '<img src="/img/checkbox_checked.gif" />';
                            return '<img src="/img/checkbox_unchecked.gif" />';
                        },
                        link: function(uri, content) {
                            const completeURL = (ORG_INFORMATION.instanceUrl ? ORG_INFORMATION.instanceUrl : '') + uri;
                            return '<a href="' + completeURL + '" target="_blank">' + content + '</a>';
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
            return FORMAT_HANDLER.salesforceIdFormat(id);
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
         *                <li><code>onEachRecordFromCacheCallback</code>: function called for each record of the map stored in the cache </li> 
         *                <li><code>onEndFromCacheCallback</code>: function called for the map stored in the cache</li> 
         *                <li><code>onErrorCallback</code>: function called if an error happens</li> 
         *              </ol>
         */
        this.doRetrieveDataWithCache = function(setup) {
            try {
                PERSISTANT_CACHE_HANDLER.cache(
                    CACHE_SECTION_METADATA,
                    setup.mnemonic, 
                    setup.doDataRetriever, 
                    function(records, isFromCache) {
                        if (setup.onEachRecordFromCacheCallback) {
                            MAP_HANDLER.forEach(records, function(id) {
                                setup.onEachRecordFromCacheCallback(records[id]);
                            });
                        }
                        if (setup.onEndFromCacheCallback) {
                            setup.onEndFromCacheCallback(records);
                        }
                    }
                );
            } catch (error) {
                if (setup.onErrorCallback) {
                    setup.onErrorCallback(error);
                }
            }
        };

        /**
         * Data retriever with cache for SOQL queries
         * @param setup JSON configuration including:
         *              <ol>
         *                <li><code>queries</code>: array describing the queries you want to execute ; for each you set the query and if you use the tooling api or not </li>
         *                <li><code>onEachRecordFromAPICallback</code>: function called for each record retrieved from database</li>
         *                <li><code>mnemonic</code>: tag used for caching this data</li>
         *                <li><code>doDataRetriever</code>: function with a callback function parameter used to set the cache if needed</li> 
         *                <li><code>onEachRecordFromCacheCallback</code>: function called for each record of the map stored in the cache </li> 
         *                <li><code>onEndFromCacheCallback</code>: function called for the map stored in the cache</li> 
         *                <li><code>onErrorCallback</code>: function called if an error happens</li> 
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
                                return setup.onEachRecordFromAPICallback(record, index, dataSize, totalSize);
                            } catch(error) {
                                setup.onErrorCallback(error);
                            }
                        }, 
                        function(records, size) {
                            try {
                                MAP_HANDLER.setSize(records, size);
                                callbackToSetTheCache(records);
                            } catch(error) {
                                setup.onErrorCallback(error);
                            }
                        },
                        setup.onErrorCallback
                    );
                },
                onEachRecordFromCacheCallback: setup.onEachRecordFromCacheCallback,
                onEndFromCacheCallback: setup.onEndFromCacheCallback,
                onErrorCallback: setup.onErrorCallback
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
                .append('xhtml').html(d => '<span class="slds-hyphenate" style="text-align: center;">' + d.data.name + '</span>');

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
                subids += '\'' + v + '\'';
                if (batchFull === true || lastItem === true) { 
                    queries.push({
                        tooling: true,
                        string: 'SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, '+
                                    'RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType '+
                                'FROM MetadataComponentDependency '+
                                'WHERE (RefMetadataComponentId IN (' + subids + ') '+
                                'OR MetadataComponentId IN (' + subids+ ')) '+
                                'AND MetadataComponentType != \'ReportType\' '+
                                'AND RefMetadataComponentType != \'ReportType\' ',
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
                    const aId = FORMAT_HANDLER.salesforceIdFormat(record.MetadataComponentId);
                    const aType = record.MetadataComponentType;
                    const aName = record.MetadataComponentName;
                    const bId = FORMAT_HANDLER.salesforceIdFormat(record.RefMetadataComponentId);
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
         *                <li><code>objectName</code>: Name of the object to get the description</li>
         *                <li><code>callbackSuccess</code>: function called in case of a successful describe query</li>
         *                <li><code>callbackError</code>: function called in case of an error</li>
         *              </ol>
         */
        function private_salesforce_descrive_object(setup) {
            const s = SALESFORCE_HANDLER.splitDeveloperName(setup.objectName);
            SALESFORCE_HANDLER.doDescribeObject(
                setup.objectName, 
                function(object) {
                    SALESFORCE_HANDLER.doQueries(
                        [{ 
                            tooling: true, 
                            string: 'SELECT DurableId, Description, ExternalSharingModel, InternalSharingModel, '+
                                        '(SELECT Id, DurableId, QualifiedApiName FROM Fields), '+
                                        '(SELECT Id, Name FROM ApexTriggers), '+
                                        '(SELECT Id, MasterLabel, Description FROM FieldSets), '+
                                        '(SELECT Id, Name, LayoutType FROM Layouts), '+
                                        '(SELECT DurableId, Label, Max, Remaining, Type FROM Limits), '+
                                        '(SELECT Id, Active, Description, ErrorDisplayField, ErrorMessage, '+
                                            'ValidationName FROM ValidationRules), '+
                                        '(SELECT Id, Name FROM WebLinks) '+
                                    'FROM EntityDefinition '+
                                    'WHERE DeveloperName = \''+s.shortName+'\' '+
                                    (s.package !== '' ? 'AND NamespacePrefix = \''+s.package+'\' ' : '')
                        }], 
                        function(record) {
                            // 0. Generic information
                            object.id = record.DurableId;
                            object.description = record.Description;
                            object.externalSharingModel = record.ExternalSharingModel;
                            object.internalSharingModel = record.InternalSharingModel;
                            // 1. Apex Triggers
                            if (record.ApexTriggers) {
                                let apexTriggers = [];
                                for (let i=0; i<record.ApexTriggers.records.length; i++) {
                                    apexTriggers.push({
                                        id: FORMAT_HANDLER.salesforceIdFormat(record.ApexTriggers.records[i].Id),
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
                                        id: FORMAT_HANDLER.salesforceIdFormat(record.FieldSets.records[i].Id),
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
                                        id: FORMAT_HANDLER.salesforceIdFormat(record.Layouts.records[i].Id),
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
                                        id: FORMAT_HANDLER.salesforceIdFormat(record.Limits.records[i].DurableId),
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
                                        id: FORMAT_HANDLER.salesforceIdFormat(record.ValidationRules.records[i].Id),
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
                                        id: FORMAT_HANDLER.salesforceIdFormat(record.WebLinks.records[i].Id),
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
                        function(records, size) {},
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
                        string: 'SELECT Id, FullName, Metadata FROM WorkflowRule WHERE Id = \''+record.Id+'\''
                    });
                }, 
                onEnd: function(records, size) { 
                    core.doSalesforceQueriesWithCache({
                        mnemonic: cache,
                        queries,
                        onEachRecordFromAPICallback: function(v, i, l, ts) {
                            const item =  {
                                id: core.doSimplifiySalesforceID(v.Id),
                                name: v.FullName,
                                description: v.Metadata.description,
                                actions: v.Metadata.actions,
                                futureActions: v.Metadata.workflowTimeTriggers,
                                isActive: v.Metadata.active
                            };
                            if (!item.actions) item.actions = [];
                            if (!item.futureActions) item.futureActions = [];
                            item.noAction = (item.actions.length == 0 && item.futureActions.length == 0);
                            return item;
                        },
                        onEndFromCacheCallback: resolve,
                        onErrorCallback: reject
                    });
                },
                onError: reject
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
                                'ProcessType FROM Flow '+
                                'WHERE Id = \''+record.Id+'\' '
                    });
                }, 
                onEnd: function(records, size) { 
                    core.doSalesforceQueriesWithCache({
                        mnemonic: cache,
                        queries,
                        onEachRecordFromAPICallback: function(v, i, l, ts) {
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
                                type: v.ProcessType
                            };
                            v.Metadata.processMetadataValues?.forEach(m => {
                                if (m.name === 'ObjectType') item.sobject = m.value.stringValue;
                                if (m.name === 'TriggerType') item.triggerType = m.value.stringValue;
                            });
                            return item;
                        },
                        onEndFromCacheCallback: resolve,
                        onErrorCallback: reject
                    });
                },
                onError: reject
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
                onEachRecordFromAPICallback: function(v, i, l, ts) {
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
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
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
            core.doSalesforceQueriesWithCache({
                mnemonic: this.keycache, 
                queries: [ { 
                    tooling: true, 
                    string: 'SELECT Id, Name, NamespacePrefix, Category, IsProtected, Language, MasterLabel, Value '+
                            'FROM ExternalString '+
                            'WHERE ManageableState = \'unmanaged\' '
                } ],
                onEachRecordFromAPICallback: function(v, i, l, ts) {
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
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
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
            core.doSalesforceQueriesWithCache({
                mnemonic: this.keycache, 
                queries: [ { 
                    tooling: true, 
                    string: 'SELECT DurableId, QualifiedApiName, NamespacePrefix '+
                            'FROM EntityDefinition '+
                            'WHERE IsCustomSetting = true ' + 
                            'AND NamespacePrefix = NULL '
                } ],
                onEachRecordFromAPICallback: function(v, i, l, ts) {
                    return {
                        id: core.doSimplifiySalesforceID(v.DurableId),
                        name: v.QualifiedApiName,
                        namespace: v.NamespacePrefix
                    };
                }, 
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
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
            core.doSalesforceQueriesWithCache({
                mnemonic: this.keycache, 
                queries: [ { 
                    tooling: true, 
                    string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, IsAvailableInTouch '+
                            'FROM ApexPage '+
                            'WHERE ManageableState = \'unmanaged\' '
                } ],
                onEachRecordFromAPICallback: function(v, i, l, ts) {
                    return {
                        id: core.doSimplifiySalesforceID(v.Id),
                        name: v.Name,
                        apiVersion: v.ApiVersion,
                        isApiVersionOld: core.isVersionOld({ apiVersion: v.ApiVersion }),
                        namespace: v.NamespacePrefix,
                        description: v.Description, 
                        mobile: v.IsAvailableInTouch
                    };
                }, 
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
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
            core.doSalesforceQueriesWithCache({
                mnemonic: this.keycache, 
                queries: [ { 
                    tooling: true, 
                    string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description '+
                            'FROM ApexComponent '+
                            'WHERE ManageableState = \'unmanaged\' '
                } ],
                onEachRecordFromAPICallback: function(v, i, l, ts) {
                    return {
                        id: core.doSimplifiySalesforceID(v.Id),
                        name: v.Name,
                        apiVersion: v.ApiVersion,
                        isApiVersionOld: core.isVersionOld({ apiVersion: v.ApiVersion }),
                        namespace: v.NamespacePrefix,
                        description: v.Description
                    };
                }, 
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
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
            const cache = this.keycache;
            const value = core.getMetadataInCache(cache);
            if (value) resolve(value);
            const classesMap = {};
            const relatedTestClassesMap = {};
            const classesCoverageMap = {};
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
                            'Body, LengthWithoutComments, SymbolTable '+
                            'FROM ApexClass '+
                            'WHERE ManageableState = \'unmanaged\' ',
                    tooling: true
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
                        default: {
                            // ApexClasses records
                            const item =  {
                                id: core.doSimplifiySalesforceID(v.Id),
                                name: v.Name,
                                apiVersion: v.ApiVersion,
                                isApiVersionOld: core.isVersionOld({ apiVersion: v.ApiVersion }),
                                namespace: v.NamespacePrefix,
                                isTest: false,
                                isAbstract: false,
                                isInterface: false,
                                isSharingMissing: false,
                                length: v.LengthWithoutComments,
                                needsRecompilation: (!v.SymbolTable ? true : false),
                                coverage: 0 // by default no coverage!
                            };
                            if (v.Body) {
                                item.isInterface = v.Body.match("(?:public|global)\\s+(?:interface)\\s+\\w+\\s*\\{") !== null;   
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
                            if (item.isTest === false && item.isInterface === false && !item.specifiedSharing) {
                                item.isSharingMissing = true;
                            }
                            classesMap[item.id] = item;
                        }
                    }
                }, 
                onEnd: function(records, size) { 
                    for (const [key, value] of Object.entries(classesMap)) {
                        if (classesCoverageMap[key]) value.coverage = classesCoverageMap[key].coverage;
                        if (relatedTestClassesMap[key]) value.relatedTestClasses = Array.from(relatedTestClassesMap[key]);
                    }
                    core.setMetadataInCache(cache, classesMap);
                    resolve(classesMap);
                },
                onError: reject
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
            core.doSalesforceQueriesWithCache({
                mnemonic: this.keycache, 
                queries: [ { 
                    tooling: true, 
                    string: 'SELECT Id, Name, ApiVersion, Status, '+
                                'NamespacePrefix, '+
                                'UsageBeforeInsert, UsageAfterInsert, '+
                                'UsageBeforeUpdate, UsageAfterUpdate, '+
                                'UsageBeforeDelete, UsageAfterDelete, '+
                                'UsageAfterUndelete, UsageIsBulk, '+
                                'LengthWithoutComments, EntityDefinitionId '+
                            'FROM ApexTrigger '+
                            'WHERE ManageableState = \'unmanaged\' '
                } ],
                onEachRecordFromAPICallback: function(v, i, l, ts) {
                    return {
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
                        sobject: v.EntityDefinitionId
                    };
                }, 
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
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
            core.doSalesforceQueriesWithCache({
                mnemonic: this.keycache, 
                queries: [ { 
                    tooling: true, 
                    string: 'SELECT Id, Name, NamespacePrefix '+
                            'FROM StaticResource '+
                            'WHERE ManageableState = \'unmanaged\' '
                } ],
                onEachRecordFromAPICallback: function(v, i, l, ts) {
                    return {
                        id: core.doSimplifiySalesforceID(v.Id),
                        name: v.Name,
                        namespace: v.NamespacePrefix
                    };
                }, 
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
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
            core.doSalesforceQueriesWithCache({
                mnemonic: this.keycache, 
                queries: [ { 
                    tooling: true, 
                    string: 'SELECT Id, MasterLabel, EntityDefinition.DeveloperName, '+
                                'Type, NamespacePrefix, Description ' +
                            'FROM FlexiPage '+
                            'WHERE ManageableState = \'unmanaged\' '
                } ],
                onEachRecordFromAPICallback: function(v, i, l, ts) {
                    return {
                        id: core.doSimplifiySalesforceID(v.Id),
                        name: v.MasterLabel,
                        entityName: v.EntityDefinition ? v.EntityDefinition.DeveloperName : '',
                        type: v.Type,
                        namespace: v.NamespacePrefix,
                        description: v.Description
                    };
                }, 
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
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
            core.doSalesforceQueriesWithCache({
                mnemonic: this.keycache, 
                queries: [ { 
                    tooling: true, 
                    string: 'SELECT Id, MasterLabel, ApiVersion, NamespacePrefix, Description '+ 
                            'FROM LightningComponentBundle '+
                            'WHERE ManageableState = \'unmanaged\' '
                } ],
                onEachRecordFromAPICallback: function(v, i, l, ts) {
                    return {
                        id: core.doSimplifiySalesforceID(v.Id),
                        name: v.MasterLabel,
                        apiVersion: v.ApiVersion,
                        isApiVersionOld: core.isVersionOld({ apiVersion: v.ApiVersion }),
                        namespace: v.NamespacePrefix,
                        description: v.Description
                    };
                }, 
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
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
            core.doSalesforceQueriesWithCache({
                mnemonic: this.keycache, 
                queries: [ { 
                    tooling: true, 
                    string: 'SELECT Id, MasterLabel, ApiVersion, NamespacePrefix, Description '+
                            'FROM AuraDefinitionBundle '+
                            'WHERE ManageableState = \'unmanaged\' '
                } ],
                onEachRecordFromAPICallback: function(v, i, l, ts) {
                    return {
                        id: core.doSimplifiySalesforceID(v.Id),
                        name: v.MasterLabel,
                        apiVersion: v.ApiVersion,
                        isApiVersionOld: core.isVersionOld({ apiVersion: v.ApiVersion }),
                        namespace: v.NamespacePrefix,
                        description: v.Description
                    };
                }, 
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
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
                onEachRecordFromAPICallback: function(v, i, l, ts) {
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
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
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
            core.doSalesforceQueriesWithCache({
                mnemonic: this.keycache, 
                queries: [ { 
                    tooling: false, 
                    string: 'SELECT Id, ProfileId, Profile.Name, Profile.Description, '+
                                'IsCustom, License.Name, Profile.UserType, NamespacePrefix, '+
                                '(SELECT Id FROM Assignments WHERE Assignee.IsActive = TRUE LIMIT 101) '+
                            'FROM PermissionSet '+ // oh yes we are not mistaken!
                            'WHERE isOwnedByProfile = TRUE'
                } ],
                onEachRecordFromAPICallback: function(v, i, l, ts) {
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
                        hasMembers: memberCounts > 0
                    };
                    return item;
                }, 
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
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
            const cache = this.keycache;
            const value = core.getMetadataInCache(cache);
            if (value) resolve(value);
            const queries = [];
            core.doSalesforceQueries({
                queries: [{ string: 'SELECT Id FROM Profile' }], 
                onEachRecord: function(record, index) {
                    queries.push({
                        tooling: true,
                        string: 'SELECT Id, Name, Metadata FROM Profile WHERE Id = \''+record.Id+'\''
                    });
                }, 
                onEnd: function(records, size) { 
                    core.doSalesforceQueriesWithCache({
                        mnemonic: cache,
                        queries,
                        onEachRecordFromAPICallback: function(v, i, l, ts) {
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
                        onEndFromCacheCallback: resolve,
                        onErrorCallback: reject
                    });
                },
                onError: reject
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
            core.doSalesforceQueriesWithCache({
                mnemonic: this.keycache, 
                queries: [ { 
                    tooling: false, 
                    string: 'SELECT Id, Name, Description, IsCustom, License.Name, NamespacePrefix, '+
                                '(SELECT Id FROM Assignments WHERE Assignee.IsActive = TRUE LIMIT 1) '+ // just to see if used
                            'FROM PermissionSet '+
                            'WHERE IsOwnedByProfile = FALSE' 
                } ],
                onEachRecordFromAPICallback: function(v, i, l, ts) {
                    const hasMembers = (v.Assignments && v.Assignments.records) ? v.Assignments.records.length > 0 : false;
                    return {
                        id: core.doSimplifiySalesforceID(v.Id),
                        name: v.Name,
                        description: v.Description,
                        hasLicense: (v.License ? 'yes' : 'no'),
                        license: (v.License ? v.License.Name : ''),
                        isCustom: v.IsCustom,
                        isUndescribedCustom: v.IsCustom && !v.Description,
                        package: v.NamespacePrefix,
                        isUnusedCustom: v.IsCustom && !hasMembers,
                        hasMembers: hasMembers
                    };
                }, 
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
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
            core.doSalesforceQueriesWithCache({
                mnemonic: this.keycache, 
                queries: [ { 
                    tooling: false, 
                    string: 'SELECT Id, AssigneeId, Assignee.ProfileId, PermissionSetId '+
                            'FROM PermissionSetAssignment '+
                            'WHERE Assignee.IsActive = TRUE '+
                            'AND PermissionSet.IsOwnedByProfile = FALSE '
                } ],
                onEachRecordFromAPICallback: function(v, i, l, ts) {
                    return {
                        id: core.doSimplifiySalesforceID(v.Id),
                        assigneeId: core.doSimplifiySalesforceID(v.AssigneeId),
                        assigneeProfileId: core.doSimplifiySalesforceID(v.Assignee.ProfileId),
                        permissionSetId: core.doSimplifiySalesforceID(v.PermissionSetId)
                    };
                }, 
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
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
            const ROOT_ID = '###root###';
            core.doSalesforceQueriesWithCache({
                mnemonic: this.keycache, 
                queries: [ { 
                    string: 'SELECT Id, DeveloperName, Name, ParentRoleId, PortalType, '+
                                '(SELECT Id, Name, Username, Email, Phone, '+
                                    'SmallPhotoUrl, IsActive FROM Users)'+
                            ' FROM UserRole '
                } ],
                onEachRecordFromAPICallback: function(v, i, l, ts) {
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
                onEndFromCacheCallback: function(records) {
                    records[ROOT_ID] = {
                        id: ROOT_ID,
                        name: 'Role Hierarchy',
                        developerName: ROOT_ID,
                        parentId: null
                    };
                    resolve(records);
                },
                onErrorCallback: reject
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
            core.doRetrieveDataWithCache({
                mnemonic: this.keycache, 
                doDataRetriever: function(callbackToSetTheCache) {
                    core.doSalesforceGlobalDescribe({
                        onEnd: function(sobjects) {
                            const map = {};
                            let size = 0;
                            if (sobjects) {
                                sobjects.forEach(v => {
                                    if (v.customSetting === false && 
                                        v.keyPrefix &&
                                        v.triggerable === true &&
                                        v.layoutable === true) {
                                        const object = {
                                            id: v.name,
                                            label: v.label,
                                            developerName: v.name,
                                            package: core.doSalesforceSplitDeveloperName(v.name).package
                                        };
                                        map[object.id] = object;
                                        size++;
                                    }
                                });
                            }
                            core.doSetSizeInMap(map, size);
                            callbackToSetTheCache(map);
                        }, 
                        onError: reject
                    });
                },
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
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
                onEachRecordFromAPICallback: function(v, i, l, ts) {
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
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
            });
        }
    }));
    core.addDataset(new OrgCheck.Dataset({
        name: 'batchesScheduledJobs',
        keycache: 'BatchesScheduledJobs',
        retriever: function(me, resolve, reject) {
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
                            'WHERE StartTime >= YESTERDAY '+
                            'AND State <> \'COMPLETE\' ' +
                            'LIMIT 10000 '
                } ],
                onEachRecordFromAPICallback: function(v, i, l, ts) {
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
                        default:  jobTypeLabel = 'Unknown type ('+v.CronJobDetail.JobType+')'; break;
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
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
            });
        }
    }));

    // ========================================================================
    // CUSTOM OBJECTS
    // ------------------------------------------------------------------------
    // Get the list of custom objects in Salesforce 
    // ========================================================================
    core.addDataset(new OrgCheck.Dataset({
        name: 'customObjects',
        keycache: 'CustomObjects',
        retriever: function(me, resolve, reject) {
            core.doSalesforceQueriesWithCache({
                mnemonic: this.keycache, 
                queries: [ { 
                    tooling: true, 
                    string: 'SELECT DurableId, DeveloperName, IsCustomSetting, QualifiedApiName, NamespacePrefix '+
                            'FROM EntityDefinition '+
                            'WHERE DurableId LIKE \'01I%\' AND (NOT DurableId LIKE \'%.%\') '
                } ],
                onEachRecordFromAPICallback: function(v, i, l, ts) {
                    let entityType = 'Other';
                    if (v.IsCustomSetting == true) 
                        entityType = 'CustomSetting';
                    else {
                        const pp = v.QualifiedApiName.split('__');
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
                    return { 
                        id: core.doSimplifiySalesforceID(v.DurableId),
                        developerName: v.DeveloperName,
                        packageName: v.NamespacePrefix,
                        type: entityType
                    };
                }, 
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
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
            core.doSalesforceQueriesWithCache({
                mnemonic: this.keycache, 
                queries: [ { 
                    tooling: true, 
                    string: 'SELECT Id, TableEnumOrId, DeveloperName, NamespacePrefix '+
                            'FROM CustomField '+
                            'WHERE ManageableState = \'unmanaged\'  '
                } ],
                onEachRecordFromAPICallback: function(v, i, l, ts) {
                    const isObjectId = (v.TableEnumOrId && v.TableEnumOrId.startsWith && v.TableEnumOrId.startsWith('01I'));
                    return { 
                        id: core.doSimplifiySalesforceID(v.Id),
                        objectId: (isObjectId === true ? core.doSimplifiySalesforceID(v.TableEnumOrId) : ''),
                        objectName: (isObjectId === false ? v.TableEnumOrId : ''),
                        fieldName: v.DeveloperName,
                        developerName: v.DeveloperName,
                        packageName: v.NamespacePrefix,
                        fullName: v.DeveloperName
                    };
                }, 
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
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
                onEachRecordFromAPICallback: function(v, i, l, ts) {
                    return { 
                        id: v.DurableId,
                        name: v.QualifiedApiName,
                        label: v.MasterLabel,
                        packageName: v.NamespacePrefix,
                        external: v.ExternalSharingModel,
                        internal: v.InternalSharingModel
                    };
                }, 
                onEndFromCacheCallback: resolve,
                onErrorCallback: reject
            });
        }
    }));
}
