/**
 * Salesforce module 
 */
OrgCheck.Salesforce = {
    
    AbstractProcess: function() {
        const private_events = {
            'error': (error) => { console.error(error); }
        };
        const private_error_event = private_events.error;
        this.fire = (name, ...args) => { 
            if (private_events.hasOwnProperty(name)) {
                private_events[name](...args); 
            }
        };
        this.on = (name, fn) => { private_events[name] = fn; return this; };
        this.run = () => { private_error_event('Run method should be implemented!')};
    },

    SoqlProcess: function(connection, queries) {
        OrgCheck.Salesforce.AbstractProcess.call(this);
        const that = this;
        this.run = () => {
            try {
                const promises = [];
                queries.forEach((query, index) => promises.push(new Promise((resolve, reject) => {
                    const api = (query.tooling === true ? connection.tooling : connection);
                    const records = [];
                    api.query(query.string)
                        .on('record', (record) => { that.fire('record', record, index); records.push(record); })
                        .on('end', () => resolve(records))
                        .on('error', (error) => {
                            if (query.byPasses && query.byPasses.includes(error['errorCode'])) {
                                resolve();
                                return;
                            }
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
                        })
                        .run(); 
                    // TODO: queryMore to implement here
                })));
                Promise.all(promises)
                    .then((results) => that.fire('end', results))
                    .catch((error) => that.fire('error', error));
            } catch (error) {
                that.fire('error', error);
            }
        }
    },

    GlobalDescribeProcess: function(connection) {
        OrgCheck.Salesforce.AbstractProcess.call(this);
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

    MetadataAtScaleProcess: function(connection, metadataInformation) {
        OrgCheck.Salesforce.AbstractProcess.call(this);
        const that = this;
        this.run = () => {
            try {
                const compositeRequestBodies = [];
                let currentCompositeRequestBody;
                const BATCH_MAX_SIZE = 25;
                metadataInformation.ids.forEach((id) => {
                    if (!currentCompositeRequestBody || currentCompositeRequestBody.compositeRequest.length === BATCH_MAX_SIZE) {
                        currentCompositeRequestBody = {
                            allOrNone: false,
                            compositeRequest: []
                        };
                        compositeRequestBodies.push(currentCompositeRequestBody);
                    }
                    currentCompositeRequestBody.compositeRequest.push({ 
                        url: '/services/data/v'+connection.version+'/tooling/sobjects/' + metadataInformation.type + '/' + id, 
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
                                            type: metadataInformation.type,
                                            ids: metadataInformation.ids,
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
                                    if (metadataInformation.byPasses && metadataInformation.byPasses.includes(errorCode) === false) {
                                        const error = new Error();
                                        error.context = { 
                                            when: 'After receiving a response with bad HTTP status code.',
                                            what: {
                                                type: metadataInformation.type,
                                                ids: metadataInformation.ids,
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
                    request.body = optionalPayload.body;
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
     * @param configuration Object must contain 'version', 'instanceUrl', 'accessToken', 'stopWatcherCallback'
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
        const CONNECTION = new jsforce.Connection({
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
         * Limits call
         */
        const private_check_limits = () => {
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
         * Return an SOQL-safer version of the given string value
         * @param unsafe String to be escaped
         */
        this.secureSOQLBindingVariable = (unsafe) => {
            // If unset the default, return value is an empty string
            if (!unsafe) return "''";
            
            // If not a string typed value, return value is itself (case of a numeric)
            if (typeof(unsafe) !== 'string') return unsafe;
            
            // If a string value, we substitute the quotes
            return "'" + unsafe.replace(/'/g, "\'") + "'";
        };
        
       /**
         * Call the Dependency API (synchronous version)
         * @param ids Array of IDs that we are interested in
         * @param callbackSuccess Callback method in case of a success with the resulting map
         * @param callbackError Callback method in case of an error
         */
        this.dependencyApi = (ids, callbackSuccess, callbackError) => {
            if (ids.length == 0) { callbackSuccess(); return; }

            const MAX_IDS_IN_QUERY = 50; // max is 2000 records, so avg of 40 dependencies for each id
            const queries = [];
            let subids = '';
            ids.forEach((v, i, a) => {
                const batchFull = (i != 0 && i % MAX_IDS_IN_QUERY === 0);
                const lastItem = (i === a.length-1);
                subids += '\''+v+'\'';
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
            const map = {};
            new OrgCheck.Salesforce.SoqlProcess(CONNECTION, queries)
                .on('record', (r) => {
                    const aId = this.salesforceIdFormat(r.MetadataComponentId);
                    const aType = r.MetadataComponentType;
                    const aName = r.MetadataComponentName;
                    const bId = this.salesforceIdFormat(r.RefMetadataComponentId);
                    const bType = r.RefMetadataComponentType;
                    const bName = r.RefMetadataComponentName;
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
                })
                .on('error', (error) => callbackError(error))
                .on('end', () => callbackSuccess(map))
                .run();
        };

        this.query = (queries) => {
            return new OrgCheck.Salesforce.SoqlProcess(CONNECTION, queries);
        }

        this.describeGlobal = () => {
            return new OrgCheck.Salesforce.GlobalDescribeProcess(CONNECTION);
        }

        this.readMetadataAtScale = (metadataInformation) => {
            return new OrgCheck.Salesforce.MetadataAtScaleProcess(CONNECTION, metadataInformation);
        }

        this.httpCall = function(partialUrl, optionalPayload) {
            return new OrgCheck.Salesforce.HttpProcess(CONNECTION, partialUrl, optionalPayload);
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
    }
}