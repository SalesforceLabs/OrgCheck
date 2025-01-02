import { SFDC_ApexClass } from "../data/orgcheck-api-data-apexclass";
import { OBJECTTYPE_ID_CUSTOM_SETTING, OBJECTTYPE_ID_CUSTOM_SOBJECT, OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT, OBJECTTYPE_ID_CUSTOM_METADATA_TYPE, OBJECTTYPE_ID_CUSTOM_EVENT, OBJECTTYPE_ID_KNOWLEDGE_ARTICLE, OBJECTTYPE_ID_CUSTOM_BIG_OBJECT, OBJECTTYPE_ID_STANDARD_SOBJECT } from "../data/orgcheck-api-data-objecttype";
import { OrgCheckSimpleLoggerIntf } from "./orgcheck-api-logger";
import { OrgCheckSalesforceMetadataTypes } from "./orgcheck-api-salesforce-metadatatypes";
import { OrgCheckSalesforceWatchDog, OrgCheckSalesforceUsageInformation } from "./orgcheck-api-salesforce-watchdog";
import { OrgCheckSalesforceManagerIntf, OrgCheckSalesforceMetadataRequest, OrgCheckSalesforceQueryRequest } from "./orgcheck-api-salesforcemanager";

/**
 * @description Maximum number of Ids that is contained per DAPI query
 */
const MAX_IDS_IN_DAPI_REQUEST_SIZE = 100;

/**
 * @description When an SObject does not support QueryMore we use an alternative that will gather a maximum number of records
 *                  Where the salesforce maximum is 2000 for EntityDefinition
 */
const MAX_NOQUERYMORE_BATCH_SIZE = 2000;

/**
 * @description Maximum number of members we want per type/request 
 */
const MAX_MEMBERS_IN_METADATAAPI_REQUEST_SIZE = 10;

/**
 * @description Maximum number of sub queries we want to have in a single composite request
 *              Where the salesforce maximum is 25 BUT ony 5 can be query or sobject operations
 * @see https://developer.salesforce.com/docs/atlas.en-us.232.0.api_rest.meta/api_rest/resources_composite_composite.htm
 */
const MAX_COMPOSITE_REQUEST_SIZE = 5;

/** 
 * @description Salesforce APIs Manager Implementation with JsForce Connection
 */
export class OrgCheckSalesforceManager extends OrgCheckSalesforceManagerIntf {

    /**
     * @description API Version used to make the connection
     * @type {number}
     * @private
     */
    _apiVersion;

    /**
     * @description WatchDog to monitor the API Usage
     * @type {OrgCheckSalesforceWatchDog}
     * @private
     */ 
    _watchDog;

    /**
     * @description JsForce Connection
     * @type {any}
     * @private
     */ 
    _connection;

    /**
     * @description Construct the connection manager from a ConnectionFactory (like JSForce) and a VFP accesstoken
     * @param {any} jsConnectionFactory 
     * @param {string} accessToken 
     */
    constructor(jsConnectionFactory, accessToken) {

        super();
        
        // Compute the last known Salesforce API Version dynamically
        const THIS_YEAR = new Date().getFullYear();
        const THIS_MONTH = new Date().getMonth()+1;
        const SF_API_VERSION = 3*(THIS_YEAR-2022)+53+(THIS_MONTH<=2?0:(THIS_MONTH<=6?1:(THIS_MONTH<=10?2:3)));
        this._apiVersion = SF_API_VERSION;
        
        // Create a JsForce Connection to the current salesforce org
        const jsConnection = new jsConnectionFactory.Connection({
            accessToken: accessToken,
            version: SF_API_VERSION + '.0',
            maxRequest: 15 // making sure we set it to a reasonable value = 15
        });

        // Create the WatchDog instance which knows how to retrieve the API Usage from the connection
        this._watchDog = new OrgCheckSalesforceWatchDog(
            () => {
                return { 
                    used: jsConnection.limitInfo?.apiUsage?.used, 
                    max: jsConnection.limitInfo?.apiUsage?.limit
                };
            }
        );

        // Link the connection to the manager
        this._connection = jsConnection;
    }

    /**
     * @see OrgCheckSalesforceManagerIntf.apiVersion
     * @type {number}
     */
    get apiVersion() {
        return this._apiVersion;
    }

    /**
     * @see OrgCheckSalesforceManagerIntf.caseSafeId
     * @param {string} id 
     * @returns {string}
     */
    caseSafeId(id) {
        if (id && id.length === 18) return id.substr(0, 15);
        return id;
    }

    /**
     * @see OrgCheckSalesforceManagerIntf.setupUrl
     * @param {string} id Identification of the data to be used in the Setup URL. 
     * @param {string} type Type of the data to be used to choose the correct URL template
     * @param {string} [parentId] In case the template URL has a reference to the parent, this optional property will contain the parent identification.
     * @param {string} [parentType] In case the template URL has a reference to the parent, this optional property will contain the parent type.
     * @returns {string} 
     */
    setupUrl(id, type, parentId, parentType) {
        // If the salesforce identifier is not set, just return a blank url!
        if (!id) {
            return '';
        }
        switch (type) {
            // FIELD
            case OrgCheckSalesforceMetadataTypes.STANDARD_FIELD:
            case OrgCheckSalesforceMetadataTypes.CUSTOM_FIELD:
            case OrgCheckSalesforceMetadataTypes.ANY_FIELD: {
                switch (parentType) {
                    case OrgCheckSalesforceMetadataTypes.STANDARD_OBJECT:
                    case OrgCheckSalesforceMetadataTypes.CUSTOM_OBJECT:
                    case OrgCheckSalesforceMetadataTypes.KNOWLEDGE_ARTICLE:    return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/FieldsAndRelationships/${id}/view` : `page?address=%2F${id}`);
                    case OrgCheckSalesforceMetadataTypes.CUSTOM_BIG_OBJECT:    return `/lightning/setup/BigObjects/page?address=%2F${id}%3Fsetupid%3DBigObjects`;
                    case OrgCheckSalesforceMetadataTypes.CUSTOM_EVENT:         return `/lightning/setup/EventObjects/page?address=%2F${id}%3Fsetupid%3DEventObjects`;
                    case OrgCheckSalesforceMetadataTypes.CUSTOM_SETTING:       return `/lightning/setup/CustomSettings/page?address=%2F${id}%3Fsetupid%3DCustomSettings`;
                    case OrgCheckSalesforceMetadataTypes.CUSTOM_METADATA_TYPE: return `/lightning/setup/CustomMetadata/page?address=%2F${id}%3Fsetupid%3DCustomMetadata`;
                    case OrgCheckSalesforceMetadataTypes.EXTERNAL_OBJECT:      return `/lightning/setup/ExternalObjects/page?address=%2F${id}%3Fsetupid%3DExternalObjects`;
                    default:                                                   return `/lightning/setup/ObjectManager/page?address=%2F${id}`;
                }
            }
            // SOBJECT
            case OrgCheckSalesforceMetadataTypes.STANDARD_OBJECT:
            case OrgCheckSalesforceMetadataTypes.CUSTOM_OBJECT:
            case OrgCheckSalesforceMetadataTypes.KNOWLEDGE_ARTICLE:       return `/lightning/setup/ObjectManager/${id}/Details/view`;
            case OrgCheckSalesforceMetadataTypes.CUSTOM_BIG_OBJECT:       return `/lightning/setup/BigObjects/page?address=%2F${id}%3Fsetupid%3DBigObjects`;
            case OrgCheckSalesforceMetadataTypes.CUSTOM_EVENT:            return `/lightning/setup/EventObjects/page?address=%2F${id}%3Fsetupid%3DEventObjects`;
            case OrgCheckSalesforceMetadataTypes.CUSTOM_SETTING:          return `/lightning/setup/CustomSettings/page?address=%2F${id}%3Fsetupid%3DCustomSettings`;
            case OrgCheckSalesforceMetadataTypes.CUSTOM_METADATA_TYPE:    return `/lightning/setup/CustomMetadata/page?address=%2F${id}%3Fsetupid%3DCustomMetadata`;
            case OrgCheckSalesforceMetadataTypes.EXTERNAL_OBJECT:         return `/lightning/setup/ExternalObjects/page?address=%2F${id}%3Fsetupid%3DExternalObjects`;
            // SOBJECT COMPONENTS
            case OrgCheckSalesforceMetadataTypes.PAGE_LAYOUT:             return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/PageLayouts/${id}/view` : `page?address=%2F${id}`);
            case OrgCheckSalesforceMetadataTypes.VALIDATION_RULE:         return `/lightning/setup/ObjectManager/page?address=%2F${id}`;
            case OrgCheckSalesforceMetadataTypes.WEB_LINK:                return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/ButtonsLinksActions/${id}/view` : `page?address=%2F${id}`);
            case OrgCheckSalesforceMetadataTypes.RECORD_TYPE:             return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/RecordTypes/${id}/view` : `page?address=%2F${id}`);
            case OrgCheckSalesforceMetadataTypes.APEX_TRIGGER:            return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/ApexTriggers/${id}/view` : `page?address=%2F${id}`);
            case OrgCheckSalesforceMetadataTypes.FIELD_SET:               return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/FieldSets/${id}/view` : `page?address=%2F${id}`);
            // SECURITY AND ACCESS
            case OrgCheckSalesforceMetadataTypes.USER:                    return `/lightning/setup/ManageUsers/page?address=%2F${id}%3Fnoredirect%3D1%26isUserEntityOverride%3D1`;
            case OrgCheckSalesforceMetadataTypes.PROFILE:                 return `/lightning/setup/EnhancedProfiles/page?address=%2F${id}`;
            case OrgCheckSalesforceMetadataTypes.PERMISSION_SET:          return `/lightning/setup/PermSets/page?address=%2F${id}`;
            case OrgCheckSalesforceMetadataTypes.PERMISSION_SET_GROUP:    return `/lightning/setup/PermSetGroups/page?address=%2F${id}`;
            case OrgCheckSalesforceMetadataTypes.ROLE:                    return `/lightning/setup/Roles/page?address=%2F${id}`;
            case OrgCheckSalesforceMetadataTypes.PUBLIC_GROUP:            return `/lightning/setup/PublicGroups/page?address=%2Fsetup%2Fown%2Fgroupdetail.jsp%3Fid%3D${id}`;
            case OrgCheckSalesforceMetadataTypes.QUEUE:                   return `/lightning/setup/Queues/page?address=%2Fp%2Fown%2FQueue%2Fd%3Fid%3D${id}`;
            case OrgCheckSalesforceMetadataTypes.TECHNICAL_GROUP:         return '';
            // SETTING
            case OrgCheckSalesforceMetadataTypes.CUSTOM_LABEL:            return `/lightning/setup/ExternalStrings/page?address=%2F${id}`;
            case OrgCheckSalesforceMetadataTypes.STATIC_RESOURCE:         return `/lightning/setup/StaticResources/page?address=%2F${id}`;
            case OrgCheckSalesforceMetadataTypes.CUSTOM_SITE:             return `/servlet/networks/switch?networkId=${id}&startURL=%2FcommunitySetup%2FcwApp.app%23%2Fc%2Fhome&`;
            case OrgCheckSalesforceMetadataTypes.CUSTOM_TAB:              return `/lightning/setup/CustomTabs/page?address=%2F${id}`;
            // AUTOMATION
            case OrgCheckSalesforceMetadataTypes.FLOW_VERSION:            return `/builder_platform_interaction/flowBuilder.app?flowId=${id}`;
            case OrgCheckSalesforceMetadataTypes.FLOW_DEFINITION:         return `/${id}`;
            case OrgCheckSalesforceMetadataTypes.WORKFLOW_RULE:           return `/lightning/setup/WorkflowRules/page?address=%2F${id}&nodeId=WorkflowRules`;
            // VISUAL COMPONENTS
            case OrgCheckSalesforceMetadataTypes.VISUAL_FORCE_PAGE:       return `/lightning/setup/ApexPages/page?address=%2F${id}`;
            case OrgCheckSalesforceMetadataTypes.VISUAL_FORCE_COMPONENT:  return `/lightning/setup/ApexComponent/page?address=%2F${id}`;
            case OrgCheckSalesforceMetadataTypes.AURA_WEB_COMPONENT:
            case OrgCheckSalesforceMetadataTypes.LIGHTNING_WEB_COMPONENT: return `/lightning/setup/LightningComponentBundles/page?address=%2F${id}`;
            case OrgCheckSalesforceMetadataTypes.LIGHTNING_PAGE:          return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/LightningPages/${id}/view` : `page?address=%2F${id}`);
            // APEX PROGAMMATION
            case OrgCheckSalesforceMetadataTypes.APEX_CLASS:              return `/lightning/setup/ApexClasses/page?address=%2F${id}`;
            // Other types or even undefined type
            default: {
                console.error(`Type <${type}> not supported yet. Returning "/id" as url. FYI, id was <${id}>, parentId was <${parentId}> and parentType was <${parentType}>`);
                return `/${id}`;
            }
        }
    }
    
    /**
     * @see OrgCheckSalesforceManagerIntf.getObjectType
     * @param {string} apiName 
     * @param {boolean} isCustomSetting 
     * @returns {string}
     */
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

    /**
     * @see OrgCheckSalesforceManagerIntf.dailyApiRequestLimitInformation
     * @returns {OrgCheckSalesforceUsageInformation} Information of the current usage of the Daily Request API
     */
    get dailyApiRequestLimitInformation() {
        return this._watchDog.dailyApiRequestLimitInformation;
    }

    /**
     * @see OrgCheckSalesforceManagerIntf.soqlQuery
     * @param {Array<OrgCheckSalesforceQueryRequest>} queries 
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Array<any>>}
     */
    async soqlQuery(queries, logger) {
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        // Now we can start, log some message
        logger?.log(`Preparing ${queries.length} SOQL ${queries.length>1?'queries':'query'}...`);
        // Here some statisitcs to monitor the progress in the logs
        let nbQueriesDone = 0, nbQueriesByPassed = 0, nbQueriesError = 0, nbQueryMore = 0, nbQueriesPending = queries.length;
        // We'll run the queries in parallel, each query will be mapped as a promise and ran with Promise.all()
        return Promise.all(queries.map((query) => {
            // Each query can use the tooling or not, se based on that flag we'll use the right JsForce connection
            const conn = query.tooling === true ? this._connection.tooling : this._connection;
            // In case the query does not support queryMore we have an alternative, based on ids
            let queryMoreStartingId = '000000000000000000';
            const sequential_query = (/** @type {Function} */ callback) => {
                if (query.queryMoreField) {
                    // Alternative to queryMore based on ID ordering (inspired by Maroun IMAD!)
                    // Deactivate AutoFetch to avoid the automatic call to queryMore by JsForce!
                    conn.query(`${query.string} `+
                               `AND ${query.queryMoreField} > '${queryMoreStartingId}' `+
                               `ORDER BY ${query.queryMoreField} `+
                               `LIMIT ${MAX_NOQUERYMORE_BATCH_SIZE}`, { autoFetch: false }, callback);
                } else {
                    // Standard use of queryMore with AutoFetch from JsForce
                    conn.query(query.string, { autoFetch: true }, callback);
                }
            }
            // Finally we return the promise that will call the query (and maybe more queries if needed!)
            return new Promise((resolve, reject) => {
                // Array of records that we store along the way, will be used with resolve()
                const records = [];
                // Recursive query function that will be called for each query and each queryMore
                const recursive_query = (/** @type {{errorCode: string}} */ error, /** @type {any} */ d) => {
                    // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
                    this._watchDog?.afterRequest(reject); // if limit has been reached, we reject the promise with a specific error and stop the process
                    if (error) { 
                        // Error has been raised but it might be one of the ones we want to by-pass
                        if (query.byPasses && query.byPasses.includes && query.byPasses.includes(error.errorCode)) {
                            // By-passed! 
                            nbQueriesByPassed++;
                            // Let's resolve the promise
                            resolve();
                        } else {
                            // That's an error we can't by-pass
                            nbQueriesError++;
                            // We reject the promise with the current error and additional context information
                            reject(Object.assign(error, { 
                                context: { 
                                    when: 'While creating a promise to call a SOQL query.', 
                                    what: query 
                            }}));  
                        }
                        // This query is done, so we decrement the pending counter
                        nbQueriesPending--;
                    } else {
                        // Add the records to the global array
                        records.push(... d.records);
                        if (query.queryMoreField) {
                            // Here we can't call queryMore (the sobject in the FROM statment does not support it, like EntityDefinition)
                            if (d.records.length < MAX_NOQUERYMORE_BATCH_SIZE) {
                                // This query is done, so we increment the done counter AND decrement the pending counter
                                nbQueriesDone++;
                                nbQueriesPending--;
                                // Resolve the promise with the records
                                resolve({ records: records });
                            } else {
                                // Update the last ID to start the next batch
                                queryMoreStartingId = records[records.length-1][query.queryMoreField];
                                // Not done yet more sub query to do
                                nbQueryMore++;
                                // Call the custom query more
                                sequential_query(recursive_query);
                            }
                        } else {
                            // Here we can call queryMore if fetching is not done...
                            if (d.done === true) {
                                // This query is done, so we increment the done counter AND decrement the pending counter
                                nbQueriesDone++;
                                nbQueriesPending--;
                                // Resolve the promise with the records
                                resolve({ records: records });
                            } else {
                                // Not done yet more sub query to do
                                nbQueryMore++;
                                // Call the queryMore with the nextRecordsUrl
                                conn.queryMore(d.nextRecordsUrl, recursive_query);
                            }
                        }
                    }
                    logger?.log(`Statistics of ${queries.length} SOQL ${queries.length>1?'queries':'query'}: ${nbQueryMore} queryMore done, ${nbQueriesPending} pending, ${nbQueriesDone} done, ${nbQueriesByPassed} by-passed, ${nbQueriesError} in error...`);
                }
                sequential_query(recursive_query);
            });
        }));
    }

    /**
     * @see OrgCheckSalesforceManagerIntf.dependenciesQuery
     * @param {Array<string>} ids
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Array<any>>}
     */
    async dependenciesQuery(ids, logger) {
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        // Now we can start, log some message
        logger?.log(`Starting to call Tooling API for dependency API call of ${ids.length} item(s)...`);
        const bodies = [];
        let currentBody;
        for (let i = 0; i < ids.length; i += MAX_IDS_IN_DAPI_REQUEST_SIZE) {
            if (!currentBody || currentBody.compositeRequest.length === MAX_COMPOSITE_REQUEST_SIZE) {
                currentBody = { allOrNone: false, compositeRequest: [] };
                bodies.push(currentBody);
            }
            const subsetIds = `'${ids.slice(i, i + MAX_IDS_IN_DAPI_REQUEST_SIZE).join("','")}'`;
            currentBody.compositeRequest.push({
                method: 'GET',
                url: `/services/data/v${this._apiVersion}.0/tooling/query?q=`+ // here we need to have the full URI
                        'SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, '+
                            'RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType '+
                        'FROM MetadataComponentDependency '+
                        `WHERE RefMetadataComponentId IN (${subsetIds}) `+
                        `OR MetadataComponentId IN (${subsetIds}) `,
                referenceId: `chunk${i}`
            });
        }
        logger?.log(`Divided the query into ${bodies.length} Tooling composite queries...`);
        const results = await Promise.all(bodies.map(async (body) => {
            // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
            this._watchDog?.afterRequest(); // if limit has been reached, we reject the promise with a specific error and stop the process
            // Call the tooling composite request
            return this._connection.tooling.request({
                url: `/tooling/composite`, // here JsForce will automatically complete the start of the URI
                method: 'POST',
                body: JSON.stringify(body), 
                headers: { 'Content-Type': 'application/json' }
            });    
        }));
        logger?.log(`Got all the results`);
        const records = [];
        results.forEach((result) => {
            result.compositeResponse.forEach((/** @type {any} */ response) => {
                if (response.httpStatusCode === 200) {
                    logger?.log(`This response had a code: 200 so we add the ${response?.body?.records?.length} records`);
                    records.push(... response.body.records); // multiple response in one batch
                } else {
                    const errorCode = response.body[0].errorCode;
                    logger?.log(`This response had a code: ${errorCode}`);
                    const error = new TypeError(`One of the request had an issue with HTTP errorCode=${errorCode}`);
                    throw Object.assign(error, { 
                        context: { 
                            when: 'Calling Composite Tooling API to get dependencies.',
                            what: {
                                ids: ids,
                                body: response.body
                            }
                        }
                    });
                }
            });
        });
        const duplicateCheck = new Set(); // Using a set to filter duplicates
        return records.map((record) => { // Duplicates will be "null" and will get removed in further filter() call 
            const id = this.caseSafeId(record.MetadataComponentId);
            const refId = this.caseSafeId(record.RefMetadataComponentId);
            const key = `${id}-${refId}`;
            if (duplicateCheck.has(key)) return null;
            logger?.log(`Keep ${key}`);
            duplicateCheck.add(key);
            return {
                id: id,
                name: record.MetadataComponentName, 
                type: record.MetadataComponentType,
                url: this.setupUrl(id, record.MetadataComponentType),
                refId: refId, 
                refName: record.RefMetadataComponentName,
                refType: record.RefMetadataComponentType,
                refUrl: this.setupUrl(refId, record.RefMetadataComponentType)
            }
        }).filter((r) => r !== null); // Remove duplicates
    }

    /**
     * @see OrgCheckSalesforceManagerIntf.readMetadata
     * @param {Array<OrgCheckSalesforceMetadataRequest>} metadatas 
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<any>}
     */
    async readMetadata(metadatas, logger) {
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        // Now we can start, log some message
        logger?.log(`Starting to call Metadata API for ${metadatas.length} types...`);
        // First, if the metadatas contains an item with member='*' we want to list for this 
        // type and substitute the '*' with the fullNames
        await Promise.all(
            // only get the types that have at least '*' once
            metadatas.filter((m) => m.members.includes('*'))
            // then turn this filtered list into a list of promises
            .map((m) => async () => { // using async as we just want to run parallel processes without manipulating their return values
                try {
                    // each promise will call the List metadata api operation for a specific type
                    const members = await this._connection.metadata.list([{ type: m.type }], this._apiVersion);
                    // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
                    this._watchDog?.afterRequest(); // if limit has been reached, we reject the promise with a specific error and stop the process
                    // clear the members (remove the stars)
                    m.members = m.members.filter((/** @type {string} */ b) => b !== '*'); // 'metadatas' will be altered!
                    // Add the rerieved fullNames to the members array
                    MAKE_IT_AN_ARRAY(members).forEach(f => { m.members.push(f.fullName); }); 
                    // don't return anything we are just altering the m.members.
                } catch (error) {
                    // We reject the promise with the current error and additional context information
                    throw Object.assign(error, { 
                        context: { 
                            when: 'While calling a metadata api list.', 
                            what: { type: m.type } 
                    }});  
                }
            })
        );
        // All the promises to list the types have been done and potentially altered the 'metadatas' array
        // At this point, no more wildcard, only types and legitime member values in 'metadatas'.
        // Second, we want to read the metatda for these types and members
        const promises = [];
        metadatas.forEach(m => {
            while (m.members.length > 0) {
                // Slice the members in batch of MAX_MEMBERS_IN_METADATAAPI_REQUEST_SIZE
                const currentMembers = m.members.splice(0, MAX_MEMBERS_IN_METADATAAPI_REQUEST_SIZE); // get the first members
                // These first members have been removed from m.members (so next time we don't see them anymore
                promises.push(new Promise((resolve, reject) => { // using Promise to manage the result propperly
                    this._connection.metadata.read(m.type, currentMembers, (/** @type {Error} */ error, /** @type {any} */ members) => {
                        // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
                        this._watchDog?.afterRequest(reject); // if limit has been reached, we reject the promise with a specific error and stop the process
                        if (error) {
                            // We reject the promise with the current error and additional context information
                            reject(Object.assign(error, {
                                context: { 
                                    when: 'While calling a metadata api read.',
                                    what: { type: m.type, members: currentMembers }
                            }}));
                        } else {
                            // return the member(s) for this type (their might be another batch with the same type!)
                            resolve({ type: m.type, members: MAKE_IT_AN_ARRAY(results) });
                        }
                    });
                }));
            }
        }); // Promises are ready to be run
        const results = await Promise.all(promises);
        // Here we have the results, but we need to group them by type
        const response = {};
        results.forEach((r, i) => {
            const m = response[r.type] || [];
            m.push(...r.members);
            response[r.type] = m;
        });
        return response;
    }

    /**
     * @see OrgCheckSalesforceManagerIntf.readMetadataAtScale
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @param {string} type
     * @param {any[]} ids
     * @param {string[]} byPasses
     * @returns {Promise<Array<any>>}
     */
    async readMetadataAtScale(type, ids, byPasses, logger) {
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        const bodies = [];
        let currentBody;
        let countBatches = 0;
        ids.forEach((id, i) => {
            if (!currentBody || currentBody.compositeRequest.length === MAX_COMPOSITE_REQUEST_SIZE) {
                countBatches++;
                currentBody = { allOrNone: false, compositeRequest: [] };
                bodies.push(currentBody);
            }
            currentBody.compositeRequest.push({ 
                method: 'GET',
                url: `/services/data/v${this._apiVersion}.0/tooling/sobjects/${type}/${id}`, // here we need to have the full URI
                referenceId: `chunk${i}`
            });
        });
        const results = await Promise.all(bodies.map((body) => {
            // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
            this._watchDog?.afterRequest(); // if limit has been reached, we reject the promise with a specific error and stop the process
            // Call the tooling composite request
            return this._connection.tooling.request({
                url: `/tooling/composite`, // here JsForce will automatically complete the start of the URI
                method: 'POST',
                body: JSON.stringify(body), 
                headers: { 'Content-Type': 'application/json' }
            });    
        }));
        const records = [];
        results.forEach((result) => {
            result.compositeResponse.forEach((/** @type {any} */ response) => {
                if (response.httpStatusCode === 200) {
                    records.push(response.body); // here only one record per response 
                } else {
                    const errorCode = response.body[0].errorCode;
                    if (byPasses && byPasses.includes && byPasses.includes(errorCode) === false) {
                        const error = new TypeError(`One of the request for type=${type} had an issue with HTTP errorCode=${errorCode}`);
                        throw Object.assign(error, { 
                            context: { 
                                when: 'Calling Composite Tooling API to get metadata at scale.',
                                what: {
                                    type: type,
                                    ids: ids,
                                    body: response.body
                                }
                            }
                        });
                    }
                }
            });
        });
        return records;
    }

    /**
     * @see OrgCheckSalesforceManagerIntf.describeGlobal
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Array<any>>}
     */
    async describeGlobal(logger) {
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        // Call the global describe
        const response = await this._connection.describeGlobal();
        // Adding support of the Activity object from describe
        response.sobjects.push(ACTIVITY_OBJECT_THAT_SHOULD_BE_RETURNED_BY_DESCRIBE);
        // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
        this._watchDog?.afterRequest(); // if limit has been reached, an error will be thrown here
        // return the sobjects property
        return response.sobjects;
    }

    /**
     * @see OrgCheckSalesforceManagerIntf.describe
     * @param {string} sobjectDevName 
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<any>}
     */
    async describe(sobjectDevName, logger) {
        // Adding support of the Activity object from describe
        if (sobjectDevName === 'Activity') return ACTIVITY_OBJECT_THAT_SHOULD_BE_RETURNED_BY_DESCRIBE;
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        const object = await this._connection.describe(sobjectDevName);
        // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
        this._watchDog?.afterRequest(); // if limit has been reached, an error will be thrown here
        // return the object as it is
        return object;
    }
    
    /**
     * @see OrgCheckSalesforceManagerIntf.recordCount
     * @param {string} sobjectDevName 
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<number>}
     */
    async recordCount(sobjectDevName, logger) {
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        const result = await this._connection.request({ 
            url: `/limits/recordCount?sObjects=${sobjectDevName}`, 
            method: 'GET' 
        });
        // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
        this._watchDog?.afterRequest(); // if limit has been reached, an error will be thrown here
        // return the first item of the sobjects property
        return (Array.isArray(result?.sObjects) && result?.sObjects.length === 1) ? result?.sObjects[0].count : 0;
    }

    /**
     * @see OrgCheckSalesforceManagerIntf.runAllTests
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<string>}
     */ 
    async runAllTests(logger) {
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        const result = await this._connection.request({ 
            url: `/services/data/v${this._connection.version}/tooling/runTestsAsynchronous`,
            method: 'POST',
            body: '{ "testLevel": "RunLocalTests", "skipCodeCoverage": false }', // double quote is mandatory by SFDC Json parser.
            headers: { 'Content-Type': 'application/json' }
        });
        // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
        this._watchDog?.afterRequest(); // if limit has been reached, an error will be thrown here
        // return the result as it is
        return result;
    }

    /**
     * @see OrgCheckSalesforceManagerIntf.compileClasses
     * @param {Array<SFDC_ApexClass>} classes
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Array<any>>}
     */ 
    async compileClasses(classes, logger) {
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        const timestamp = Date.now();
        const bodies = [];
        let currentBody;
        let countBatches = 0;
        classes.forEach((c) => {
            if (!currentBody || currentBody.compositeRequest.length === MAX_COMPOSITE_REQUEST_SIZE) {
                countBatches++;
                currentBody = {
                    allOrNone: false,
                    compositeRequest: [
                        {
                            method: 'POST',
                            url: `/services/data/v${this._apiVersion}.0/tooling/sobjects/MetadataContainer`,
                            referenceId: 'container',
                            body: { Name : `container-${timestamp}-${countBatches}` }
                        },
                        {
                            method: 'POST',
                            url: `/services/data/v${this._apiVersion}.0/tooling/sobjects/ContainerAsyncRequest`,
                            referenceId: 'request',
                            body: { MetadataContainerId: '@{container.id}', IsCheckOnly: true }
                        }
                    ]
                };
                bodies.push(currentBody);
            }
            currentBody.compositeRequest.push({ 
                method: 'POST',
                url: `/services/data/v${this._apiVersion}.0/tooling/sobjects/ApexClassMember`, 
                referenceId: c.id,
                body: { MetadataContainerId: '@{container.id}', ContentEntityId: c.id, Body: c.sourceCode }
            });
        });
        const promises = bodies.map((body) => {
            // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
            this._watchDog?.afterRequest(); // if limit has been reached, we reject the promise with a specific error and stop the process
            // Call the tooling composite request
            return this._connection.tooling.request({
                url: `/tooling/composite`,
                method: 'POST',
                body: JSON.stringify(body), 
                headers: { 'Content-Type': 'application/json' }
            });    
        });
        const finalResult = await Promise.all(promises);
        // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
        this._watchDog?.afterRequest(); // if limit has been reached, an error will be thrown here
        // return the final result as it is
        return finalResult;
    }
}

/** 
 * @description Metadata API returns an array or a single object!
 * @param {any} data
 * @returns {Array<any>}
 */
const MAKE_IT_AN_ARRAY = (/** @type {any} */ data) => data ? (Array.isArray(data) ? data : [ data ]) : []; 

/**
 * @description Activity object that is not present in the describe API
 * @type {any}
 */
const ACTIVITY_OBJECT_THAT_SHOULD_BE_RETURNED_BY_DESCRIBE = {
    name: 'Activity',
    label: 'Activity',
    labelPlural: 'Activities',
    customSetting: false,
    custom: false,
    keyPrefix: '00T'
};