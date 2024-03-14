/**
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
}