/**
 * Salesforce connection
 * @param configuration Object must contain 'version', 'instanceUrl', 'accessToken', 'stopWatcherCallback'
 */
OrgCheck.SalesforceHandler = function (configuration) {

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
    const CONNECTION = new jsforce.Connection({
        accessToken: configuration.accessToken,
        version: API_VERSION + ".0",
        maxRequest: "10000",
        instanceUrl: ENDPOINT_URL
    });

    this.getApiVersion = function() {
        return API_VERSION;
    }

    this.getEndpointUrl = function() {
        return ENDPOINT_URL;
    }

    this.getOrgId = function() {
        return ORG_ID;
    }

    this.getCurrentUserId = function() {
        return USER_ID;
    }

    /**
     * Limits call
     */
    function private_check_limits() {
        CONNECTION.limits().then(d => {
            this.limitInfo = d;
            const elmt = document.getElementById('org-daily-api-requests');
            if (d && d.DailyApiRequests) {
                const rate = (d.DailyApiRequests.Max - d.DailyApiRequests.Remaining) / d.DailyApiRequests.Max;
                elmt.innerHTML = '<center><small>Daily API Request Limit: <br />'+rate.toFixed(3)+'</small></center>';
                if (rate > 0.9) {
                    elmt.classList.add('slds-theme_error');
                    stopWatcherCallback('Daily API Request is too high...');
                } else if (rate > 0.7) {
                    elmt.classList.add('slds-theme_warning');
                } else {
                    elmt.classList.add('slds-badge_lightest');
                }
            }
        });
    }

    // let's call it at the beggining
    private_check_limits();

    /**
     * Returns systematically an ID15 based on the ID18
     * @param id to simplify
     */
    this.salesforceIdFormat = function (id) {
        if (id && id.length == 18) return id.substr(0, 15);
        return id;
    };

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
    * @param onResult Callback function to call with the results from global describe
    * @param onError Callback function to call if there is an error
    */
    this.doDescribeGlobal = function (
        onResult,
        onError
    ) {
        private_check_limits();
        CONNECTION.describeGlobal(function (error, result) {
            if (error) {
                if (onError) {
                    onError(error);
                }
            } else {
                if (onResult) {
                    onResult(result.sobjects);
                }
            }
        });
    };

    /**
    * Do a describe for a specific object in the salesforce org
    * @param developerName Developer name of the object to retrieve
    * @param onResult Callback function to call with the describe of this object
    * @param onError Callback function to call if there is an error
    */
    this.doDescribeObject = function (
        developerName,
        onResult,
        onError
    ) {
        private_check_limits();
        CONNECTION.sobject(developerName).describe$(function (error, object) {
            if (error) {
                if (onError) {
                    onError(error);
                }
            } else {
                if (onResult) {
                    onResult(object);
                }
            }
        });
    };

    /**
    * Do a metadata retrieve describe for a specific type and list of members
    * @param types List of types of metadata to retrieve
    * @param onResult Callback function to call with the information
    * @param onError Callback function to call if there is an error
    */
    this.doMetadataRetrieve = function(
        types, 
        onResult,
        onError
    ) {
        private_check_limits();
        CONNECTION.metadata.list(types, API_VERSION + ".0", function(error, metadata) {
            if (error) {
                if (onError) {
                    onError(error);
                }
            } else {
                if (onResult) {
                    onResult(metadata);
                }
            }
        });
    }

    /**
    * Call REST api endpoint in HTTP direclty with GET (default) or POST method (with payload)
    * @param partialUrl URL that omits the domain name, and the /services/data/vXX.0, should start with a '/'
    * @param onEnd Callback function to call with all records (as a map)
    * @param onError Callback function to call if there is an error
    * @param optionalPayload Optional payload body and content type for the request (if specified method=POST if not method=GET)
    */
    this.doHttpCall = function(partialUrl, onEnd, onError, optionalPayload) {
        private_check_limits();
        let request = { 
            url: '/services/data/v'+API_VERSION+'.0' + partialUrl, 
            method: 'GET'
        };
        if (optionalPayload) {
            request.method = 'POST';
            request.body = optionalPayload.body;
            request.headers = { "Content-Type": optionalPayload.type };
        }
        CONNECTION.request(
            request, 
            function(error, response) {
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
                    onError(error);
                } else {
                    onEnd(response);
                }
            }
        );
    }

    /**
    * Do Salesforce SOQL queries from Tooling API or not
    * @param queries Array of objects containing 'tooling', 'queryMore', 'byPasses' (array of strings) and 'string'
    * @param onEach Callback function for each record from database
    * @param onEnd Callback function to call with all records (as a map)
    * @param onError Callback function to call if there is an error
    */
    this.doQueries = function (
        queries,
        onEach,
        onEnd,
        onError
    ) {
        private_check_limits();
        const promises = [];
        queries.forEach((q, i) => promises.push(new Promise(function (resolve, reject) {
            private_query({
                index: i,
                queryString: q.string,
                queryMore: q.queryMore, 
                api: (q.tooling === true ? 'tooling' : (q.bulk === true ? 'bulk' : 'rest')),
                onEach: onEach,
                onEnd: function (map, size) {
                    resolve({ d: map, l: size });
                },
                onError: function(error) {
                    if (q.byPasses && q.byPasses.includes(error["errorCode"])) {
                        resolve({ d: {}, l: 0 });
                        return;
                    }
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
                onEnd(data, length);
            })
            .catch(function (error) {
                onError(error);
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
            }
        } catch (error) {
            config.onError(error);  
        }
    }
}