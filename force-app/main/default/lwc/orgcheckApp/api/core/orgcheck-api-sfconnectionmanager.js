import { OBJECTTYPE_ID_STANDARD_SOBJECT, OBJECTTYPE_ID_CUSTOM_SOBJECT, 
    OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT, OBJECTTYPE_ID_CUSTOM_SETTING, 
    OBJECTTYPE_ID_CUSTOM_METADATA_TYPE, OBJECTTYPE_ID_CUSTOM_EVENT,
    OBJECTTYPE_ID_KNOWLEDGE_ARTICLE, OBJECTTYPE_ID_CUSTOM_BIG_OBJECT } from '../data/orgcheck-api-data-objecttype';

export class SOQLQueryInformation {
    string;
    tooling;
    byPasses;
    queryMore;
}

export class DailyApiRequestLimitInformation {
    percentage;
    isGreenZone;
    isYellowZone;
    isRedZone;
    yellowThresholdPercentage;
    redThresholdPercentage;
}

const MAX_COMPOSITE_REQUEST_SIZE = 25;
const DAILY_API_REQUEST_WARNING_THRESHOLD = 0.70; // =70%
const DAILY_API_REQUEST_FATAL_THRESHOLD = 0.90;   // =90%

export class OrgCheckSalesforceManager {

    /**
     * API Version used to make the connection
     */
    #apiVersion;

    /**
     * JSForce connection to your Salesforce org
     */
    #connection;


    /**
     * Timestamp of the last request we have made to Salesforce.
     * Why we do this? to better appreciate the limitInfo we have from the last request.
     * If the information is fresh then no need to ask again the API, if not we need to try calling.
     */
    #lastRequestToSalesforce;
    
    /**
     * Last ratio the Salesforce API gave us about the Daily API Request. 
     */
    #lastApiUsage;

    /**
     * Construct the connection manager from a ConnectionFactory (like JSForce) and a VFP accesstoken
     * 
     * @param {JsForce} jsConnectionFactory 
     * @param {string} accessToken 
     * @param {string} userId
     */
    constructor(jsConnectionFactory, accessToken) {
        const THIS_YEAR = new Date().getFullYear();
        const THIS_MONTH = new Date().getMonth() + 1;
        const SF_API_VERSION = 3 * (THIS_YEAR - 2022) + 53 + (THIS_MONTH <= 2 ? 0 : (THIS_MONTH <= 6 ? 1 : (THIS_MONTH <= 10 ? 2 : 3 )));

        this.#apiVersion = SF_API_VERSION;
        this.#connection = new jsConnectionFactory.Connection({
            accessToken: accessToken,
            version: SF_API_VERSION + '.0',
            maxRequest: '20' // default is 10, we set it to 20
        });
        this.#lastRequestToSalesforce = undefined;
        this.#lastApiUsage = 0;
    }

    getApiVersion() {
        return this.#apiVersion;
    }

    ratioToPercentage(ratio, decimals) {
        return (ratio*100).toFixed(decimals);
    }

    caseSafeId(id) {
        if (id && id.length === 18) return id.substr(0, 15);
        return id;
    }

    arraySafeIds(ids) {
        if (ids) {
            if (Array.isArray(ids)) {
                return `'${ids.map(a => a.replaceAll(`'`, '')).join(`','`)}'`
            }
        }
        return `''`;
    }
    
    setupUrl(type, durableId, objectDurableId, objectType) {
        
        switch (type) {

            /*
              In case the type is from the DAPI, we only have the id and the type from the DAPI (not the 
                object information). so in this case we cannot point to the direct URL in Lightning Setup. 
                Let's give it a try by returning just '/' and the id...
            */
            case 'CustomField': // From DAPI 
                return `/${durableId}`;
            case 'Layout': // From DAPI 
                return ''; // The /{Id} does not work for pagelayout so better returning nothing (outcome will be no link!).

            /*
              In the following section we have enought information go return the full URL
            */
            case 'field': { // Org Check specific
                switch (objectType) {
                    case OBJECTTYPE_ID_STANDARD_SOBJECT:
                    case OBJECTTYPE_ID_CUSTOM_SOBJECT:
                        return `/lightning/setup/ObjectManager/${objectDurableId}/FieldsAndRelationships/${durableId}/view`;
                    case OBJECTTYPE_ID_CUSTOM_BIG_OBJECT:
                        return `/lightning/setup/BigObjects/page?address=%2F${durableId}%3Fsetupid%3DBigObjects`;
                    case OBJECTTYPE_ID_CUSTOM_EVENT:
                        return `/lightning/setup/EventObjects/page?address=%2F${durableId}%3Fsetupid%3DEventObjects`;
                    case OBJECTTYPE_ID_CUSTOM_SETTING:
                        return `/lightning/setup/CustomSettings/page?address=%2F${durableId}%3Fsetupid%3DCustomSettings`;
                    case OBJECTTYPE_ID_CUSTOM_METADATA_TYPE:
                        return `/lightning/setup/CustomMetadata/page?address=%2F${durableId}%3Fsetupid%3DCustomMetadata`;
                    case OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT:
                        return `/lightning/setup/ExternalObjects/page?address=%2F${durableId}%3Fsetupid%3DExternalObjects`;
                    default:
                        return `/${durableId}`;
                }
            }
            case 'layout': { // Org Check specific
                return `/lightning/setup/ObjectManager/${objectDurableId}/PageLayouts/${durableId}/view`;
            }
            case 'object': { // Org Check specific
                switch (objectType) {
                    case OBJECTTYPE_ID_STANDARD_SOBJECT:
                    case OBJECTTYPE_ID_CUSTOM_SOBJECT:
                        return `/lightning/setup/ObjectManager/${objectDurableId}/Details/view`;
                    case OBJECTTYPE_ID_CUSTOM_BIG_OBJECT:
                        return `/lightning/setup/BigObjects/page?address=%2F${objectDurableId}%3Fsetupid%3DBigObjects`;
                    case OBJECTTYPE_ID_CUSTOM_EVENT:
                        return `/lightning/setup/EventObjects/page?address=%2F${objectDurableId}%3Fsetupid%3DEventObjects`;
                    case OBJECTTYPE_ID_CUSTOM_SETTING:
                        return `/lightning/setup/CustomSettings/page?address=%2F${objectDurableId}%3Fsetupid%3DCustomSettings`;
                    case OBJECTTYPE_ID_CUSTOM_METADATA_TYPE:
                        return `/lightning/setup/CustomMetadata/page?address=%2F${objectDurableId}%3Fsetupid%3DCustomMetadata`;
                    case OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT:
                        return `/lightning/setup/ExternalObjects/page?address=%2F${objectDurableId}%3Fsetupid%3DExternalObjects`;
                    default:
                        return `/${objectDurableId}`;
                }
            }
            case 'validation-rule': // Org Check specific
            case 'ValidationRule': { // From DAPI 
                return `/lightning/setup/ObjectManager/page?address=%2F${durableId}`;
            }
            case 'web-link': { // Org Check specific
                return `/lightning/setup/ObjectManager/${objectDurableId}/ButtonsLinksActions/${durableId}/view`;
            } 
            case 'record-type': { // Org Check specific
                return `/lightning/setup/ObjectManager/${objectDurableId}/RecordTypes/${durableId}/view`;
            }
            case 'apex-trigger': { // Org Check specific
                return `/lightning/setup/ObjectManager/${objectDurableId}/ApexTriggers/${durableId}/view`;
            }            
            case 'field-set': { // Org Check specific
                return `/lightning/setup/ObjectManager/${objectDurableId}/FieldSets/${durableId}/view`;
            }
            case 'user': { // Org Check specific
                return `/lightning/setup/ManageUsers/page?address=%2F${durableId}%3Fnoredirect%3D1%26isUserEntityOverride%3D1`;
            }
            case 'profile': { // Org Check specific
                return `/lightning/setup/EnhancedProfiles/page?address=%2F${durableId}`;
            }
            case 'permission-set': { // Org Check specific
                return `/lightning/setup/PermSets/page?address=%2F${durableId}`;
            }
            case 'permission-set-group': { // Org Check specific
                return `/lightning/setup/PermSetGroups/page?address=%2F${durableId}`;
            }
            case 'custom-label': // Org Check specific            
            case 'CustomLabel': { // From DAPI 
                return `/lightning/setup/ExternalStrings/page?address=%2F${durableId}`;
            }
            case 'flow': // Org Check specific
            case 'Flow': { // From DAPI 
                return `/builder_platform_interaction/flowBuilder.app?flowId=${durableId}`;
            }
            case 'flowDefinition': { // Org Check specific
                return `/${durableId}`
            }
            case 'visual-force-page': // Org Check specific
            case 'ApexPage': { // From DAPI 
                return `/lightning/setup/ApexPages/page?address=%2F${durableId}`;
            }
            case 'visual-force-component': // Org Check specific
            case 'ApexComponent': { // From DAPI 
                return `/lightning/setup/ApexComponent/page?address=%2F${durableId}`;
            }
            case 'static-resource': // Org Check specific
            case 'StaticResource': { // From DAPI 
                return `/lightning/setup/StaticResources/page?address=%2F${durableId}`;
            }
            //CustomSite
            //CustomTab
            case 'apex-class': // Org Check specific
            case 'ApexClass': { // From DAPI 
                return `/lightning/setup/ApexClasses/page?address=%2F${durableId}`;
            }
            // User
            //AuraDefinitionBundle
            default:
                return `/${durableId}`;
        }
    }
    
    getObjectType(apiName, isCustomSetting) {
        if (isCustomSetting === true) return OBJECTTYPE_ID_CUSTOM_SETTING;
        if (apiName.endsWith('__c')) return OBJECTTYPE_ID_CUSTOM_SOBJECT;
        if (apiName.endsWith('__x')) return OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT;
        if (apiName.endsWith('__mdt')) return OBJECTTYPE_ID_CUSTOM_METADATA_TYPE;
        if (apiName.endsWith('__e')) return OBJECTTYPE_ID_CUSTOM_EVENT;
        if (apiName.endsWith('__ka')) return OBJECTTYPE_ID_KNOWLEDGE_ARTICLE;
        if (apiName.endsWith('__b')) return OBJECTTYPE_ID_CUSTOM_BIG_OBJECT;
        return OBJECTTYPE_ID_STANDARD_SOBJECT;
    }

    _watchDog__beforeRequest(callback) {
        if (this.#lastRequestToSalesforce && Date.now() - this.#lastRequestToSalesforce <= 60000 && this.#lastApiUsage > DAILY_API_REQUEST_FATAL_THRESHOLD) {
            const error = new TypeError(
                `WATCH DOG: Daily API Request limit is ${this.ratioToPercentage(this.#lastApiUsage)}%, `+
                `and our internal threshold is ${this.ratioToPercentage(DAILY_API_REQUEST_FATAL_THRESHOLD)}%. `+
                'We stop there to keep your org safe.'
            );
            if (callback) callback(error); else throw error;
        }
    }

    _watchDog__afterRequest(callback) {
        if (this.#connection.limitInfo && this.#connection.limitInfo.apiUsage) {
            const apiUsageUsed = this.#connection.limitInfo.apiUsage.used;
            const apiUsageMax = this.#connection.limitInfo.apiUsage.limit;
            this.#lastApiUsage = ( apiUsageUsed / apiUsageMax );
            this.#lastRequestToSalesforce = Date.now();
            this._watchDog__beforeRequest(callback);
        }
    }

    /**
     * Get the lastest Daily API Usage from JSForce, and the level of confidence 
     * we have in this ratio to continue using org check.
     * 
     * @returns {DailyApiRequestLimitInformation} Percentage of the daily api usage and other flags to see if that percentage is good or bad.
     */
    getDailyApiRequestLimitInformation() {
        const info = new DailyApiRequestLimitInformation();
        info.percentage = this.ratioToPercentage(this.#lastApiUsage, 3);
        if (this.#lastApiUsage > DAILY_API_REQUEST_FATAL_THRESHOLD) info.isRedZone = true;
        else if (this.#lastApiUsage > DAILY_API_REQUEST_WARNING_THRESHOLD) info.isYellowZone = true;
        else info.isGreenZone = true;
        info.yellowThresholdPercentage = DAILY_API_REQUEST_WARNING_THRESHOLD;
        info.redThresholdPercentage = DAILY_API_REQUEST_FATAL_THRESHOLD;
        return info;
    }

    /**
     * Method to call a list of SOQL queries (tooling or not)
     * 
     * @param {Array<SOQLQueryInformation>} queries 
     * @param localLogger
     */
    async soqlQuery(queries, localLogger) {
        this._watchDog__beforeRequest();
        localLogger?.log(`Preparing ${queries.length} SOQL ${queries.length>1?'queries':'query'}...`);
        let nbQueriesDone = 0, nbQueriesByPassed = 0, nbQueriesError = 0, nbQueryMore = 0, nbQueriesPending = queries.length;
        return Promise.all(queries.map((query) => {
            const conn = query.tooling === true ? this.#connection.tooling : this.#connection;
            return new Promise((resolve, reject) => {
                const records = [];
                const recursive_query = (e, d) => {
                    this._watchDog__afterRequest(reject);
                    if (e) { 
                        if (query.byPasses && query.byPasses.includes(e.errorCode)) {
                            nbQueriesByPassed++;
                            resolve();
                        } else {
                            e.context = { when: 'While creating a promise to call a SOQL query.', what: query };
                            nbQueriesError++;
                            reject(e);
                        }
                        nbQueriesPending--;
                    } else {
                        records.push(... d.records);
                        if (d.done === true || (d.done === false && query.queryMore === false)) {
                            nbQueriesDone++;
                            nbQueriesPending--;
                            resolve({ records: records });
                        } else {
                            nbQueryMore++;
                            conn.queryMore(d.nextRecordsUrl, recursive_query);
                        }
                    }
                    localLogger?.log(`Statistics of ${queries.length} SOQL ${queries.length>1?'queries':'query'}: ${nbQueryMore} queryMore done, ${nbQueriesPending} pending, ${nbQueriesDone} done, ${nbQueriesByPassed} by-passed, ${nbQueriesError} in error...`);
                }
                conn.query(query.string, { autoFetch: query.queryMore === true ? true : false }, recursive_query);
            });
        }));
    }

    async dependenciesQuery(ids, localLogger) {
        this._watchDog__beforeRequest();
        localLogger?.log(`Preparing to call the Dependency API for these ${ids.length} ids...`);
        const results = await new Promise((resolve, reject) => {
            this._callComposite(
                ids, 
                true, 
                '/query?q='+
                    'SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, '+
                        'RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType '+
                    'FROM MetadataComponentDependency '+
                    'WHERE RefMetadataComponentId = \'(id)\' '+
                    'OR MetadataComponentId = \'(id)\' ', 
                [], 
                5, 
                { 
                    onRequest: (nbQueriesDone, nbQueriesError, nbQueriesPending) => {
                        localLogger?.log(`Statistics of ${ids.length} Dependency API ${ids.length>1?'elements':'element'}: ${nbQueriesPending} pending, ${nbQueriesDone} done, ${nbQueriesError} in error...`);
                    },
                    onFetched: (nbRecords, nbQueriesByPassed) => {
                        localLogger?.log(`Statistics of ${ids.length} Dependency API ${ids.length>1?'elements':'element'}: ${nbRecords} records fetched, ${nbQueriesByPassed} by-passed...`);
                    }
                }
            )
            .then(resolve)
            .catch((e) => { if (e.errorCode === 'INVALID_TYPE') resolve(); else reject(e); })
            .finally(() => this._watchDog__afterRequest(reject));
        });
        localLogger?.log(`Dependencies successfuly retrieved!`);
        const duplicateCheck = new Set(); // Using a set to filter duplicates
        return results.map(r => r.records).flat() // flatten all results
            .filter(r => r !== undefined) // Remove by passed dependencies
            .map(e => { // map the dependency
                const id = this.caseSafeId(e.MetadataComponentId);
                const refId = this.caseSafeId(e.RefMetadataComponentId);
                const key = `${id}-${refId}`;
                if (duplicateCheck.has(key)) return null;
                duplicateCheck.add(key);
                return {
                    id: id,
                    name: e.MetadataComponentName, 
                    type: e.MetadataComponentType,
                    url: this.setupUrl(e.MetadataComponentType, e.MetadataComponentId),
                    refId: refId, 
                    refName: e.RefMetadataComponentName,
                    refType: e.RefMetadataComponentType,
                    refUrl: this.setupUrl(e.RefMetadataComponentType, e.RefMetadataComponentId),
                }
            })
            .filter(r => r !== null); // Remove duplicates
    }

    /*
    https://github.com/SalesforceLabs/OrgCheck/blob/main/build/src/javascript/orgcheck/OrgCheck.Salesforce.js#L298
    */
    async readMetadata(metadatas) {
        this._watchDog__beforeRequest();
        return new Promise((resolve1, reject1) => {
            // First, if the metadatas contains an item with member='*' we want to list for this type and substitute the '*' with the fullNames
            Promise.all(
                metadatas
                    .filter(m => m.members.includes('*'))
                    .map(m => new Promise((resolve, reject) => { 
                        this.#connection.metadata.list([{type: m.type}], this.#connection.version, (error, members) => {
                            if (error) {
                                reject(Object.assign(error, { context: { 
                                    when: 'While calling a metadata api list.',
                                    what: { type: m.type }
                                }}));
                            } else {
                                // clear the members (remove the stars)
                                m.members = m.members.filter(b => b !== '*'); // 'metadatas' will be altered!
                                // add the fullNames 
                                if (members) (Array.isArray(members) ? members : [ members ]).forEach(f => { m.members.push(f.fullName); });
                                resolve();
                            }
                        });
                    })))
            .then(() => { 
                // At this point, no more wildcard, only types and legitime member values in 'metadatas'.
                // Second, we want to read the metatda for these types and members
                const promises = [];
                metadatas.forEach(m => {
                    while (m.members.length > 0) {
                        const membersMax10 = m.members.splice(0, 10); // get the first 10 items of the members, and members will no longer include them 
                        promises.push(new Promise((resolve, reject) => { 
                            this.#connection.metadata.read(m.type, membersMax10, (error, results) => {
                                if (error) {
                                    reject(Object.assign(error, { context: { 
                                        when: 'While calling a metadata api read.',
                                        what: { type: m.type, members: membersMax10 }
                                    }}));   
                                } else {
                                    resolve({ type: m.type, members: Array.isArray(results) ? results : [ results ] });
                                }
                            });
                        }));
                    }
                });
                Promise.all(promises)
                    .then((results) => {
                        const response = {};
                        results.forEach(r => {
                            const m = response[r.type] || [];
                            m.push(...r.members);
                            response[r.type] = m;
                        });
                        return response;
                    })
                    .catch(reject1)
                    .then(resolve1);
                })
                .catch(reject1); // in case some of the list went wrong!!
        });
    }

    async _bulk2Query(query, pollInterval, pollTimeout) {
        const uri = `/services/data/v${this.#connection.version}${query.tooling === true ? '/tooling' : ''}/jobs/query`;
        const queryJob = await this.#connection.request({
            url: uri, 
            method: 'POST',
            body: `{ "operation": "query", "query": "${query.string}" } `,
            headers: { 'Content-Type': 'application/json' }
        });

        const isJobComplete = async () => {
            const job = await this.#connection.request({
                url: `${uri}/${queryJob.id}`,
                method: 'GET'
            });
            if (job.state === 'JobComplete') return true;
            return false;
        };
        const sleep = ms => new Promise(resolve => {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(resolve, ms) 
        });
        
        let jobComplete = false;
        const start = Date.now();
        while (jobComplete === false && Date.now() - start < pollTimeout) {
            // eslint-disable-next-line no-await-in-loop
            if (await isJobComplete()) {
                jobComplete = true;
            } else {
                // eslint-disable-next-line no-await-in-loop
                await sleep(pollInterval);
            }
        }

        if (jobComplete === false) {
            throw new Error(`Job #${queryJob.id} has not been finished BEFORE timeout!`);
        }

        const results = await this.#connection.request({
            url: `${uri}/${queryJob.id}/results`,
            method: 'GET',
            headers: { 'Accept': 'text/csv' }
        });
        return results;
    }

    async _callComposite(ids, tooling, uriPattern, byPasses, maxRequestSize=MAX_COMPOSITE_REQUEST_SIZE, logger) {
        this._watchDog__beforeRequest();
        if (maxRequestSize > MAX_COMPOSITE_REQUEST_SIZE) maxRequestSize = MAX_COMPOSITE_REQUEST_SIZE;
        const compositeRequestBodies = [];
        let currentCompositeRequestBody;
        ids.forEach((id) => {
            if (!currentCompositeRequestBody || currentCompositeRequestBody.compositeRequest.length === maxRequestSize) {
                currentCompositeRequestBody = {
                    allOrNone: false,
                    compositeRequest: []
                };
                compositeRequestBodies.push(currentCompositeRequestBody);
            }
            currentCompositeRequestBody.compositeRequest.push({ 
                url: `/services/data/v${this.#connection.version}${tooling === true ? '/tooling' : ''}${uriPattern.replaceAll('(id)', id)}`, 
                method: 'GET',
                referenceId: id
            });
        });
        let nbQueriesDone = 0, nbQueriesError = 0, nbQueriesPending = compositeRequestBodies.length;
        return new Promise((resolve, reject) => {
            Promise.all(
                compositeRequestBodies.map((requestBody) => new Promise((r, e) => {
                    this.#connection.request({
                            url: `/services/data/v${this.#connection.version}${tooling === true ? '/tooling' : ''}/composite`, 
                            method: 'POST',
                            body: JSON.stringify(requestBody),
                            headers: { 'Content-Type': 'application/json' }
                        }, (error, response) => { 
                            this._watchDog__afterRequest(e);
                            if (error) {
                                nbQueriesError++;
                                error.context = { 
                                    when: `While creating a promise to call the ${tooling === true ? 'Tooling Composite API' : 'Composite API'}.`,
                                    what: {
                                        tooling: tooling,
                                        pattern: uriPattern,
                                        ids: ids,
                                        body: requestBody
                                    }
                                };
                                e(error); 
                            } else {
                                nbQueriesDone++;
                                r(response); 
                            }
                            nbQueriesPending--;
                            logger?.onRequest(nbQueriesDone, nbQueriesError, nbQueriesPending);
                        }
                    );
                })))
                .then((results) => {
                    const records = [];
                    let nbQueriesByPassed = 0;
                    results.forEach((result) => {
                        result.compositeResponse.forEach((response) => {
                            if (response.httpStatusCode === 200) {
                                records.push(response.body);
                            } else {
                                const errorCode = response.body[0].errorCode;
                                if (byPasses) {
                                    if (byPasses.includes(errorCode) === false) {
                                        const error = new TypeError();
                                        error.context = { 
                                            when: 'After receiving a response with bad HTTP status code.',
                                            what: {
                                                tooling: tooling,
                                                pattern: uriPattern,
                                                ids: ids,
                                                body: response.body
                                            }
                                        };
                                        reject(error);
                                    } else {
                                        nbQueriesByPassed++;
                                    }
                                }
                            }
                        });
                        logger?.onFetched(records.length, nbQueriesByPassed);
                    });
                    resolve(records);
                })
                .catch(reject);
        });
    }

    async readMetadataAtScale(type, ids, byPasses, localLogger) {
        return this._callComposite(
            ids, 
            true, 
            `/sobjects/${type}/(id)`, 
            byPasses, 
            MAX_COMPOSITE_REQUEST_SIZE,
            { 
                onRequest: (nbQueriesDone, nbQueriesError, nbQueriesPending) => {
                    localLogger?.log(`Statistics of ${ids.length} Metadata ${type}${ids.length>1?'s':''}: ${nbQueriesPending} pending, ${nbQueriesDone} done, ${nbQueriesError} in error...`);
                },
                onFetched: (nbRecords, nbQueriesByPassed) => {
                    localLogger?.log(`Statistics of ${ids.length} Metadata ${type}${ids.length>1?'s':''}: ${nbRecords} records fetched, ${nbQueriesByPassed} by-passed...`);
                }
            }
        );
    }

    /**
     * Method to get the list of sobjects
     */
    async describeGlobal() {
        this._watchDog__beforeRequest();
        return new Promise((resolve, reject) => {
            this.#connection.describeGlobal((e, d) => {
                this._watchDog__afterRequest(reject);
                if (e) reject(e); else resolve(d.sobjects);
            });
        });
    }

    /**
     * Method to describe one particular sobject
     * 
     * @param {string} sobjectDevName 
     */
    async describe(sobjectDevName) {
        this._watchDog__beforeRequest();
        return new Promise((resolve, reject) => {
            // describeSObject() method is not cached (compare to describe() method))
            this.#connection.describeSObject(sobjectDevName, (e, d) => {
                this._watchDog__afterRequest(reject);
                if (e) reject(e); else resolve(d);
            });
        });
    }
    
    /**
     * Method to get the record count (recycle bin included) of one particular sobject
     * 
     * @param {string} sobjectDevName 
     */
    async recordCount(sobjectDevName) {
        this._watchDog__beforeRequest();
        return new Promise((resolve, reject) => {
            this.#connection.request({ 
                url: `/services/data/v${this.#connection.version}/limits/recordCount?sObjects=${sobjectDevName}`,
                method: 'GET'
            }, (e, r) => {
                this._watchDog__afterRequest(reject);
                if (e) reject(e); else resolve((Array.isArray(r?.sObjects) && r?.sObjects.length === 1) ? r?.sObjects[0].count : 0);
            });
        });
    }

    async runAllTests() {
        return new Promise((resolve, reject) => {
            this.#connection.request({ 
                url: `/services/data/v${this.#connection.version}/tooling/runTestsAsynchronous`,
                method: 'POST',
                body: '{ "testLevel": "RunLocalTests", "skipCodeCoverage": false }', // double quote is mandatory by SFDC Json parser.
                headers: { 'Content-Type': 'application/json' }
            }, (e, r) => {
                this._watchDog__afterRequest(reject);
                if (e) reject(e); else resolve(r);
            });
        });
    }

    async compileClasses(classes) {
        const timestamp = Date.now();
        const compositeRequestBodies = [];
        let currentCompositeRequestBody;
        let countBatches = 0;
        const BATCH_MAX_SIZE = 25; // Composite can't handle more than 25 records per request
        classes.forEach((c) => {
            if (!currentCompositeRequestBody || currentCompositeRequestBody.compositeRequest.length === BATCH_MAX_SIZE) {
                countBatches++;
                currentCompositeRequestBody = {
                    allOrNone: false,
                    compositeRequest: [
                        {
                            method: 'POST',
                            url: `/services/data/v${this.#connection.version}/tooling/sobjects/MetadataContainer`,
                            referenceId: 'container',
                            body: { Name : `container-${timestamp}-${countBatches}` }
                        },
                        {
                            method: 'POST',
                            url: `/services/data/v${this.#connection.version}/tooling/sobjects/ContainerAsyncRequest`,
                            referenceId: 'request',
                            body: { MetadataContainerId: '@{container.id}', IsCheckOnly: true }
                        }
                    ]
                };
                compositeRequestBodies.push(currentCompositeRequestBody);
            }
            currentCompositeRequestBody.compositeRequest.push({ 
                method: 'POST',
                url: `/services/data/v${this.#connection.version}/tooling/sobjects/ApexClassMember`, 
                referenceId: c.id,
                body: { MetadataContainerId: '@{container.id}', ContentEntityId: c.id, Body: c.sourceCode }
            });
        });
        const promises = compositeRequestBodies.map(request => {
            return this.#connection.request({
                url: `/services/data/v${this.#connection.version}/tooling/composite`,
                method: 'POST',
                body: JSON.stringify(request), 
                headers: { 'Content-Type': 'application/json' }
            });    
        });
        return Promise.all(promises);
    }
}