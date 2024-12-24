// @ts-check

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
const MAX_COMPOSITE_QUERY_REQUEST_SIZE = 5;
const MAX_IDS_IN_DAPI_REQUEST_SIZE = 100;
const MAX_NOQUERYMORE_BATCH_SIZE = 200;
const DAILY_API_REQUEST_WARNING_THRESHOLD = 0.70; // =70%
const DAILY_API_REQUEST_FATAL_THRESHOLD = 0.90;   // =90%

export const TYPE_ANY_FIELD = 'Field';
export const TYPE_APEX_CLASS = 'ApexClass';
export const TYPE_APEX_TRIGGER = 'ApexTrigger';
export const TYPE_AURA_WEB_COMPONENT = 'AuraDefinitionBundle';
export const TYPE_CUSTOM_BIG_OBJECT = 'CustomBigObject';
export const TYPE_CUSTOM_EVENT = 'CustomEvent';
export const TYPE_CUSTOM_FIELD = 'CustomField';
export const TYPE_CUSTOM_LABEL = 'CustomLabel';
export const TYPE_CUSTOM_METADATA_TYPE = 'CustomMetadataType';
export const TYPE_CUSTOM_OBJECT = 'CustomObject';
export const TYPE_CUSTOM_SETTING = 'CustomSetting';
export const TYPE_CUSTOM_SITE = 'CustomSite';
export const TYPE_CUSTOM_TAB = 'CustomTab';
export const TYPE_EXTERNAL_OBJECT = 'ExternalObject';
export const TYPE_FIELD_SET = 'FieldSet';
export const TYPE_FLOW_DEFINITION = 'FlowDefinition';
export const TYPE_FLOW_VERSION = 'Flow';
export const TYPE_KNOWLEDGE_ARTICLE = 'KnowledgeArticle';
export const TYPE_LIGHTNING_PAGE = 'FlexiPage';
export const TYPE_LIGHTNING_WEB_COMPONENT = 'LightningComponentBundle';
export const TYPE_PAGE_LAYOUT = 'Layout';
export const TYPE_PERMISSION_SET = 'PermissionSet';
export const TYPE_PERMISSION_SET_GROUP = 'PermissionSetGroup';
export const TYPE_PROFILE = 'Profile';
export const TYPE_PUBLIC_GROUP = 'PublicGroup';
export const TYPE_QUEUE = 'Queue';
export const TYPE_RECORD_TYPE = 'RecordType';
export const TYPE_ROLE = 'UserRole';
export const TYPE_TECHNICAL_GROUP = 'TechnicalGroup';
export const TYPE_STANDARD_FIELD = 'StandardField';
export const TYPE_STANDARD_OBJECT = 'StandardEntity';
export const TYPE_STATIC_RESOURCE = 'StaticResource';
export const TYPE_USER = 'User';
export const TYPE_VALIDATION_RULE = 'ValidationRule';
export const TYPE_VISUAL_FORCE_COMPONENT = 'ApexComponent';
export const TYPE_VISUAL_FORCE_PAGE = 'ApexPage';
export const TYPE_WEB_LINK = 'WebLink';
export const TYPE_WORKFLOW_RULE = 'WorkflowRule';

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
            maxRequest: 15 // making sure we set it to a reasonable value = 15
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
    
    /**
     * @param {String} id Identification of the data to be used in the Setup URL. 
     * @param {String} type Type of the data to be used to choose the correct URL template
     * @param {String} parentId In case the template URL has a reference to the parent, this optional property
     *                          will contain the parent identification.
     * @param {String} parentType In case the template URL has a reference to the parent, this optional property
     *                            will contain the parent type.
     * @returns A url in string representation
     */
    setupUrl(id, type, parentId, parentType) {
        // If the salesforce identifier is not set, just return a blank url!
        if (!id) {
            return '';
        }
        switch (type) {
            // FIELD
            case TYPE_STANDARD_FIELD:
            case TYPE_CUSTOM_FIELD:
            case TYPE_ANY_FIELD: {
                switch (parentType) {
                    case TYPE_STANDARD_OBJECT:
                    case TYPE_CUSTOM_OBJECT:
                    case TYPE_KNOWLEDGE_ARTICLE:    return `/lightning/setup/ObjectManager/${parentId}/FieldsAndRelationships/${id}/view`;
                    case TYPE_CUSTOM_BIG_OBJECT:    return `/lightning/setup/BigObjects/page?address=%2F${id}%3Fsetupid%3DBigObjects`;
                    case TYPE_CUSTOM_EVENT:         return `/lightning/setup/EventObjects/page?address=%2F${id}%3Fsetupid%3DEventObjects`;
                    case TYPE_CUSTOM_SETTING:       return `/lightning/setup/CustomSettings/page?address=%2F${id}%3Fsetupid%3DCustomSettings`;
                    case TYPE_CUSTOM_METADATA_TYPE: return `/lightning/setup/CustomMetadata/page?address=%2F${id}%3Fsetupid%3DCustomMetadata`;
                    case TYPE_EXTERNAL_OBJECT:      return `/lightning/setup/ExternalObjects/page?address=%2F${id}%3Fsetupid%3DExternalObjects`;
                    default:                        return `/${id}`;
                }
            }
            // SOBJECT
            case TYPE_STANDARD_OBJECT:
            case TYPE_CUSTOM_OBJECT:
            case TYPE_KNOWLEDGE_ARTICLE:       return `/lightning/setup/ObjectManager/${id}/Details/view`;
            case TYPE_CUSTOM_BIG_OBJECT:       return `/lightning/setup/BigObjects/page?address=%2F${id}%3Fsetupid%3DBigObjects`;
            case TYPE_CUSTOM_EVENT:            return `/lightning/setup/EventObjects/page?address=%2F${id}%3Fsetupid%3DEventObjects`;
            case TYPE_CUSTOM_SETTING:          return `/lightning/setup/CustomSettings/page?address=%2F${id}%3Fsetupid%3DCustomSettings`;
            case TYPE_CUSTOM_METADATA_TYPE:    return `/lightning/setup/CustomMetadata/page?address=%2F${id}%3Fsetupid%3DCustomMetadata`;
            case TYPE_EXTERNAL_OBJECT:         return `/lightning/setup/ExternalObjects/page?address=%2F${id}%3Fsetupid%3DExternalObjects`;
            // SOBJECT COMPONENTS
            case TYPE_PAGE_LAYOUT:             return `/lightning/setup/ObjectManager/${parentId}/PageLayouts/${id}/view`;
            case TYPE_VALIDATION_RULE:         return `/lightning/setup/ObjectManager/page?address=%2F${id}`;
            case TYPE_WEB_LINK:                return `/lightning/setup/ObjectManager/${parentId}/ButtonsLinksActions/${id}/view`;
            case TYPE_RECORD_TYPE:             return `/lightning/setup/ObjectManager/${parentId}/RecordTypes/${id}/view`;
            case TYPE_APEX_TRIGGER:            return `/lightning/setup/ObjectManager/${parentId}/ApexTriggers/${id}/view`;
            case TYPE_FIELD_SET:               return `/lightning/setup/ObjectManager/${parentId}/FieldSets/${id}/view`;
            // SECURITY AND ACCESS
            case TYPE_USER:                    return `/lightning/setup/ManageUsers/page?address=%2F${id}%3Fnoredirect%3D1%26isUserEntityOverride%3D1`;
            case TYPE_PROFILE:                 return `/lightning/setup/EnhancedProfiles/page?address=%2F${id}`;
            case TYPE_PERMISSION_SET:          return `/lightning/setup/PermSets/page?address=%2F${id}`;
            case TYPE_PERMISSION_SET_GROUP:    return `/lightning/setup/PermSetGroups/page?address=%2F${id}`;
            case TYPE_ROLE:                    return `/lightning/setup/Roles/page?address=%2F${id}`;
            case TYPE_PUBLIC_GROUP:            return `/lightning/setup/PublicGroups/page?address=%2Fsetup%2Fown%2Fgroupdetail.jsp%3Fid%3D${id}`;
            case TYPE_QUEUE:                   return `/lightning/setup/Queues/page?address=%2Fp%2Fown%2FQueue%2Fd%3Fid%3D${id}`;
            case TYPE_TECHNICAL_GROUP:         return '';
            // SETTING
            case TYPE_CUSTOM_LABEL:            return `/lightning/setup/ExternalStrings/page?address=%2F${id}`;
            case TYPE_STATIC_RESOURCE:         return `/lightning/setup/StaticResources/page?address=%2F${id}`;
            case TYPE_CUSTOM_SITE:             return `/servlet/networks/switch?networkId=${id}&startURL=%2FcommunitySetup%2FcwApp.app%23%2Fc%2Fhome&`;
            case TYPE_CUSTOM_TAB:              return `/lightning/setup/CustomTabs/page?address=%2F${id}`;
            // AUTOMATION
            case TYPE_FLOW_VERSION:            return `/builder_platform_interaction/flowBuilder.app?flowId=${id}`;
            case TYPE_FLOW_DEFINITION:         return `/${id}`;
            case TYPE_WORKFLOW_RULE:           return `/lightning/setup/WorkflowRules/page?address=%2F${id}&nodeId=WorkflowRules`;
            // VISUAL COMPONENTS
            case TYPE_VISUAL_FORCE_PAGE:       return `/lightning/setup/ApexPages/page?address=%2F${id}`;
            case TYPE_VISUAL_FORCE_COMPONENT:  return `/lightning/setup/ApexComponent/page?address=%2F${id}`;
            case TYPE_AURA_WEB_COMPONENT:
            case TYPE_LIGHTNING_WEB_COMPONENT: return `/lightning/setup/LightningComponentBundles/page?address=%2F${id}`;
            case TYPE_LIGHTNING_PAGE:          return `/lightning/setup/ObjectManager/Account/LightningPages/${id}/view`;
            // APEX PROGAMMATION
            case TYPE_APEX_CLASS:              return `/lightning/setup/ApexClasses/page?address=%2F${id}`;
            // Other types or even undefined type
            default: {
                console.error(`Type <${type}> not supported yet. Returning "/id" as url. FYI, id was <${id}>, parentId was <${parentId}> and parentType was <${parentType}>`);
                return `/${id}`;
            }
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
            let queryMoreStartingId = '000000000000000000';
            const uniqueFieldName = query.uniqueFieldName || 'Id';
            const sequential_query = (callback) => {
                if (query.queryMore === false) {
                    conn.query(`${query.string} AND ${uniqueFieldName} > '${queryMoreStartingId}' ORDER BY ${uniqueFieldName} LIMIT ${MAX_NOQUERYMORE_BATCH_SIZE}`, { autoFetch: false }, callback);
                } else {
                    conn.query(query.string, { autoFetch: true }, callback);
                }
            }
            return new Promise((resolve, reject) => {
                const records = [];
                const recursive_query = (e, d) => {
                    this._watchDog__afterRequest(reject);
                    if (e) { 
                        if (query.byPasses && query.byPasses.includes && query.byPasses.includes(e.errorCode)) {
                            nbQueriesByPassed++;
                            resolve();
                        } else {
                            nbQueriesError++;
                            reject(Object.assign(e, { context: { 
                                when: 'While creating a promise to call a SOQL query.', 
                                what: query 
                            }}));  
                        }
                        nbQueriesPending--;
                    } else {
                        records.push(... d.records);
                        if (query.queryMore === false) {
                            // Here we can't call queryMore (the sobject in the FROM statment does not support it, like EntityDefinition)
                            if (d.records.length < MAX_NOQUERYMORE_BATCH_SIZE) {
                                nbQueriesDone++;
                                nbQueriesPending--;
                                resolve({ records: records });
                            } else {
                                queryMoreStartingId = records[records.length-1][uniqueFieldName];
                                nbQueryMore++;
                                sequential_query(recursive_query);
                            }
                        } else {
                            // Here we can call queryMore if fetching is not done...
                            if (d.done === true) {
                                nbQueriesDone++;
                                nbQueriesPending--;
                                resolve({ records: records });
                            } else {
                                nbQueryMore++;
                                conn.queryMore(d.nextRecordsUrl, recursive_query);
                            }
                        }
                    }
                    localLogger?.log(`Statistics of ${queries.length} SOQL ${queries.length>1?'queries':'query'}: ${nbQueryMore} queryMore done, ${nbQueriesPending} pending, ${nbQueriesDone} done, ${nbQueriesByPassed} by-passed, ${nbQueriesError} in error...`);
                }
                sequential_query(recursive_query);
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
                    'WHERE RefMetadataComponentId IN (\'(ids)\') '+
                    'OR MetadataComponentId IN (\'(ids)\') ', 
                [], 
                MAX_COMPOSITE_QUERY_REQUEST_SIZE,
                MAX_IDS_IN_DAPI_REQUEST_SIZE,
                (hundredOfIds) => { return hundredOfIds.join("','")},
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
                    url: this.setupUrl(id, e.MetadataComponentType),
                    refId: refId, 
                    refName: e.RefMetadataComponentName,
                    refType: e.RefMetadataComponentType,
                    refUrl: this.setupUrl(refId, e.RefMetadataComponentType)
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

    async _callComposite(ids, tooling, uriPattern, byPasses, numberCompositeRequests=MAX_COMPOSITE_REQUEST_SIZE, maxIdsInEachCompositeRequest=1, idsAsStringCallback, logger) {
        this._watchDog__beforeRequest();
        if (!numberCompositeRequests || numberCompositeRequests > MAX_COMPOSITE_REQUEST_SIZE || numberCompositeRequests <= 0) numberCompositeRequests = MAX_COMPOSITE_REQUEST_SIZE;
        if (!maxIdsInEachCompositeRequest || maxIdsInEachCompositeRequest <= 0) maxIdsInEachCompositeRequest = 1;
        const compositeRequestBodies = [];
        let currentCompositeRequestBody;
        for (let i = 0; i < ids.length; i += maxIdsInEachCompositeRequest) {
            const idsInCurrentCompositeRequest = ids.slice(i, i + maxIdsInEachCompositeRequest);
            if (!currentCompositeRequestBody || currentCompositeRequestBody.compositeRequest.length === numberCompositeRequests) {
                currentCompositeRequestBody = {
                    allOrNone: false,
                    compositeRequest: []
                };
                compositeRequestBodies.push(currentCompositeRequestBody);
            }
            currentCompositeRequestBody.compositeRequest.push({ 
                url: `/services/data/v${this.#connection.version}${tooling === true ? '/tooling' : ''}${uriPattern.replaceAll('(ids)', idsAsStringCallback(idsInCurrentCompositeRequest))}`, 
                method: 'GET',
                referenceId: `chunk${i}`
            });
        }
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
                                e(Object.assign(error, { context: { 
                                    when: `While creating a promise to call the ${tooling === true ? 'Tooling Composite API' : 'Composite API'}.`,
                                    what: {
                                        tooling: tooling,
                                        pattern: uriPattern,
                                        ids: ids,
                                        body: requestBody
                                    }
                                }}));   
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
                                if (byPasses && byPasses.includes && byPasses.includes(errorCode) === false) {
                                    const error = new TypeError(`errorCode: ${errorCode}`);
                                    reject(Object.assign(error, { context: { 
                                        when: 'After receiving a response with bad HTTP status code.',
                                        what: {
                                            tooling: tooling,
                                            pattern: uriPattern,
                                            ids: ids,
                                            body: response.body
                                        }
                                    }}));
                                } else {
                                    nbQueriesByPassed++;
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
            `/sobjects/${type}/(ids)`, 
            byPasses, 
            MAX_COMPOSITE_REQUEST_SIZE,
            1, // replace (ids) in the pattern below by only one id at a time
            (id) => { return id; }, // as previous arg is 1, this callback will be called with an array of one item only.
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