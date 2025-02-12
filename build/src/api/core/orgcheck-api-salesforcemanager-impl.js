import { SFDC_ApexClass } from "../data/orgcheck-api-data-apexclass";
import { OBJECTTYPE_ID_CUSTOM_SETTING, OBJECTTYPE_ID_CUSTOM_SOBJECT, OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT, OBJECTTYPE_ID_CUSTOM_METADATA_TYPE, OBJECTTYPE_ID_CUSTOM_EVENT, OBJECTTYPE_ID_KNOWLEDGE_ARTICLE, OBJECTTYPE_ID_CUSTOM_BIG_OBJECT, OBJECTTYPE_ID_STANDARD_SOBJECT } from "../data/orgcheck-api-data-objecttype";
import { SimpleLoggerIntf } from "./orgcheck-api-logger";
import { SalesforceMetadataTypes } from "./orgcheck-api-salesforce-metadatatypes";
import { SalesforceWatchDog, SalesforceUsageInformation } from "./orgcheck-api-salesforce-watchdog";
import { SalesforceManagerIntf, SalesforceMetadataRequest, SalesforceQueryRequest } from "./orgcheck-api-salesforcemanager";

/**
 * @description Maximum number of Ids that is contained per DAPI query
 * @private
 */
const MAX_IDS_IN_DAPI_REQUEST_SIZE = 100;

/**
 * @description When an SObject does not support QueryMore we use an alternative that will gather a maximum number of records
 *                  Where the salesforce maximum is 2000 for EntityDefinition
 * @private
 */
const MAX_NOQUERYMORE_BATCH_SIZE = 2000;

/**
 * @description Maximum batch size when calling the Query api (saleforce can choose to use less). This is only up to the 
 *                  server to decide how many records it returns
 * @private
 */
const MAX_STANDARDSOQL_BATCH_SIZE = 2000;

/**
 * @description Maximum size JsForce will query/retrieve data from the Query api.
 * @private
 */
const MAX_STANDARDSOQL_GLOBAL_SIZE = 1000000000000;

/**
 * @description Maximum number of members we want per type/request 
 * @private
 */
const MAX_MEMBERS_IN_METADATAAPI_REQUEST_SIZE = 10;

/**
 * @description Maximum number of sub queries we want to have in a single composite request
 *              Where the salesforce maximum is 25 BUT ony 5 can be query or sobject operations
 * @private
 * @see https://developer.salesforce.com/docs/atlas.en-us.232.0.api_rest.meta/api_rest/resources_composite_composite.htm
 */
const MAX_COMPOSITE_REQUEST_SIZE = 5;

/** 
 * @description Salesforce APIs Manager Implementation with JsForce Connection
 * @public
 */
export class SalesforceManager extends SalesforceManagerIntf {

    /**
     * @description API Version used to make the connection
     * @type {number}
     * @private
     */
    _apiVersion;

    /**
     * @description WatchDog to monitor the API Usage
     * @type {SalesforceWatchDog}
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
     * @public
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
        this._watchDog = new SalesforceWatchDog(
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
     * @see SalesforceManagerIntf.apiVersion
     * @returns {number}
     * @public
     */
    get apiVersion() {
        return this._apiVersion;
    }

    /**
     * @see SalesforceManagerIntf.caseSafeId
     * @param {string} id 
     * @returns {string}
     * @public
     */
    caseSafeId(id) {
        if (id && id.length === 18) return id.substr(0, 15);
        return id;
    }

    /**
     * @see SalesforceManagerIntf.setupUrl
     * @param {string} id Identification of the data to be used in the Setup URL. 
     * @param {string} type Type of the data to be used to choose the correct URL template
     * @param {string} [parentId] In case the template URL has a reference to the parent, this optional property will contain the parent identification.
     * @param {string} [parentType] In case the template URL has a reference to the parent, this optional property will contain the parent type.
     * @returns {string} 
     * @public
     */
    setupUrl(id, type, parentId, parentType) {
        // If the salesforce identifier is not set, just return a blank url!
        if (!id) {
            return '';
        }
        switch (type) {
            // FIELD
            case SalesforceMetadataTypes.STANDARD_FIELD:
            case SalesforceMetadataTypes.CUSTOM_FIELD:
            case SalesforceMetadataTypes.ANY_FIELD: {
                switch (parentType) {
                    case SalesforceMetadataTypes.STANDARD_OBJECT:
                    case SalesforceMetadataTypes.CUSTOM_OBJECT:
                    case SalesforceMetadataTypes.KNOWLEDGE_ARTICLE:    return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/FieldsAndRelationships/${id}/view` : `page?address=%2F${id}`);
                    case SalesforceMetadataTypes.CUSTOM_BIG_OBJECT:    return `/lightning/setup/BigObjects/page?address=%2F${id}%3Fsetupid%3DBigObjects`;
                    case SalesforceMetadataTypes.CUSTOM_EVENT:         return `/lightning/setup/EventObjects/page?address=%2F${id}%3Fsetupid%3DEventObjects`;
                    case SalesforceMetadataTypes.CUSTOM_SETTING:       return `/lightning/setup/CustomSettings/page?address=%2F${id}%3Fsetupid%3DCustomSettings`;
                    case SalesforceMetadataTypes.CUSTOM_METADATA_TYPE: return `/lightning/setup/CustomMetadata/page?address=%2F${id}%3Fsetupid%3DCustomMetadata`;
                    case SalesforceMetadataTypes.EXTERNAL_OBJECT:      return `/lightning/setup/ExternalObjects/page?address=%2F${id}%3Fsetupid%3DExternalObjects`;
                    default:                                                   return `/lightning/setup/ObjectManager/page?address=%2F${id}`;
                }
            }
            // SOBJECT
            case SalesforceMetadataTypes.STANDARD_OBJECT:
            case SalesforceMetadataTypes.CUSTOM_OBJECT:
            case SalesforceMetadataTypes.KNOWLEDGE_ARTICLE:       return `/lightning/setup/ObjectManager/${id}/Details/view`;
            case SalesforceMetadataTypes.CUSTOM_BIG_OBJECT:       return `/lightning/setup/BigObjects/page?address=%2F${id}%3Fsetupid%3DBigObjects`;
            case SalesforceMetadataTypes.CUSTOM_EVENT:            return `/lightning/setup/EventObjects/page?address=%2F${id}%3Fsetupid%3DEventObjects`;
            case SalesforceMetadataTypes.CUSTOM_SETTING:          return `/lightning/setup/CustomSettings/page?address=%2F${id}%3Fsetupid%3DCustomSettings`;
            case SalesforceMetadataTypes.CUSTOM_METADATA_TYPE:    return `/lightning/setup/CustomMetadata/page?address=%2F${id}%3Fsetupid%3DCustomMetadata`;
            case SalesforceMetadataTypes.EXTERNAL_OBJECT:         return `/lightning/setup/ExternalObjects/page?address=%2F${id}%3Fsetupid%3DExternalObjects`;
            // SOBJECT COMPONENTS
            case SalesforceMetadataTypes.PAGE_LAYOUT:             return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/PageLayouts/${id}/view` : `page?address=%2F${id}`);
            case SalesforceMetadataTypes.VALIDATION_RULE:         return `/lightning/setup/ObjectManager/page?address=%2F${id}`;
            case SalesforceMetadataTypes.WEB_LINK:                return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/ButtonsLinksActions/${id}/view` : `page?address=%2F${id}`);
            case SalesforceMetadataTypes.RECORD_TYPE:             return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/RecordTypes/${id}/view` : `page?address=%2F${id}`);
            case SalesforceMetadataTypes.APEX_TRIGGER:            return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/ApexTriggers/${id}/view` : `page?address=%2F${id}`);
            case SalesforceMetadataTypes.FIELD_SET:               return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/FieldSets/${id}/view` : `page?address=%2F${id}`);
            // SECURITY AND ACCESS
            case SalesforceMetadataTypes.USER:                    return `/lightning/setup/ManageUsers/page?address=%2F${id}%3Fnoredirect%3D1%26isUserEntityOverride%3D1`;
            case SalesforceMetadataTypes.PROFILE:                 return `/lightning/setup/EnhancedProfiles/page?address=%2F${id}`;
            case SalesforceMetadataTypes.PERMISSION_SET:          return `/lightning/setup/PermSets/page?address=%2F${id}`;
            case SalesforceMetadataTypes.PERMISSION_SET_LICENSE:  return `/lightning/setup/PermissionSetLicense/page?address=%2F${id}`;
            case SalesforceMetadataTypes.PERMISSION_SET_GROUP:    return `/lightning/setup/PermSetGroups/page?address=%2F${id}`;
            case SalesforceMetadataTypes.ROLE:                    return `/lightning/setup/Roles/page?address=%2F${id}`;
            case SalesforceMetadataTypes.PUBLIC_GROUP:            return `/lightning/setup/PublicGroups/page?address=%2Fsetup%2Fown%2Fgroupdetail.jsp%3Fid%3D${id}`;
            case SalesforceMetadataTypes.QUEUE:                   return `/lightning/setup/Queues/page?address=%2Fp%2Fown%2FQueue%2Fd%3Fid%3D${id}`;
            case SalesforceMetadataTypes.TECHNICAL_GROUP:         return '';
            // SETTING
            case SalesforceMetadataTypes.CUSTOM_LABEL:            return `/lightning/setup/ExternalStrings/page?address=%2F${id}`;
            case SalesforceMetadataTypes.STATIC_RESOURCE:         return `/lightning/setup/StaticResources/page?address=%2F${id}`;
            case SalesforceMetadataTypes.CUSTOM_SITE:             return `/servlet/networks/switch?networkId=${id}&startURL=%2FcommunitySetup%2FcwApp.app%23%2Fc%2Fhome&`;
            case SalesforceMetadataTypes.CUSTOM_TAB:              return `/lightning/setup/CustomTabs/page?address=%2F${id}`;
            // AUTOMATION
            case SalesforceMetadataTypes.FLOW_VERSION:            return `/builder_platform_interaction/flowBuilder.app?flowId=${id}`;
            case SalesforceMetadataTypes.FLOW_DEFINITION:         return `/${id}`;
            case SalesforceMetadataTypes.WORKFLOW_RULE:           return `/lightning/setup/WorkflowRules/page?address=%2F${id}&nodeId=WorkflowRules`;
            // VISUAL COMPONENTS
            case SalesforceMetadataTypes.VISUAL_FORCE_PAGE:       return `/lightning/setup/ApexPages/page?address=%2F${id}`;
            case SalesforceMetadataTypes.VISUAL_FORCE_COMPONENT:  return `/lightning/setup/ApexComponent/page?address=%2F${id}`;
            case SalesforceMetadataTypes.AURA_WEB_COMPONENT:
            case SalesforceMetadataTypes.LIGHTNING_WEB_COMPONENT: return `/lightning/setup/LightningComponentBundles/page?address=%2F${id}`;
            case SalesforceMetadataTypes.LIGHTNING_PAGE:          return `/lightning/setup/ObjectManager/` + (parentId ? `${parentId}/LightningPages/${id}/view` : `page?address=%2F${id}`);
            // APEX PROGAMMATION
            case SalesforceMetadataTypes.APEX_CLASS:              return `/lightning/setup/ApexClasses/page?address=%2F${id}`;
            // Other types or even undefined type
            default: {
                console.error(`Type <${type}> not supported yet. Returning "/id" as url. FYI, id was <${id}>, parentId was <${parentId}> and parentType was <${parentType}>`);
                return `/${id}`;
            }
        }
    }
    
    /**
     * @see SalesforceManagerIntf.getObjectType
     * @param {string} apiName 
     * @param {boolean} isCustomSetting 
     * @returns {string}
     * @public
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
     * @see SalesforceManagerIntf.dailyApiRequestLimitInformation
     * @returns {SalesforceUsageInformation} Information of the current usage of the Daily Request API
     * @public
     */
    get dailyApiRequestLimitInformation() {
        return this._watchDog.dailyApiRequestLimitInformation;
    }

    /**
     * @param {boolean} useTooling Use the tooling or not
     * @param {string} query SOQL query string
     * @param {Array<string>} byPasses List of error codes to by-pass
     * @returns {Promise<Array<any>>}
     * @async
     * @private
     */
    async _standardSOQLQuery(useTooling, query, byPasses) {
        // Each query can use the tooling or not, se based on that flag we'll use the right JsForce connection
        const conn = useTooling === true ? this._connection.tooling : this._connection;
        try {
            // Let's start to check if we are 'allowed' to use the Salesforce API...
            this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
            // Run this query
            const results = await conn.query(query, { 
                autoFetch: true, 
                maxFetch: MAX_STANDARDSOQL_GLOBAL_SIZE,
                headers: { 'Sforce-Query-Options': `batchSize=${MAX_STANDARDSOQL_BATCH_SIZE}` }
            });
            // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
            this._watchDog?.afterRequest(); // if limit has been reached, an error will be thrown here
            // Return all the records
            return results.records;
        } catch (error) {
            if (byPasses && byPasses.includes && byPasses.includes(error.errorCode)) {
                // by pass this error! and return an empty array
                return [];
            } else {
                // Throw the error
                throw Object.assign(error, { 
                    context: { 
                        when: 'While running a SOQL query with the standard queryMore', 
                        what: query 
                }});
            }
        }
    }

    /**
     * @param {boolean} useTooling Use the tooling or not
     * @param {string} query SOQL query string
     * @param {string} fieldId Unique field name to use for the custom QueryMore (Id by default)
     * @returns {Promise<Array<any>>}
     * @async
     * @private
     */
    async _customSOQLQuery(useTooling, query, fieldId) {
        // Each query can use the tooling or not, se based on that flag we'll use the right JsForce connection
        const conn = useTooling === true ? this._connection.tooling : this._connection;
        // the records to return
        const allRecords = [];
        // Alternative method to queryMore based on ID ordering (inspired by Maroun IMAD!)
        const doNextQuery = async (/** @type {string} */ startingId) => {
            const realQuery = `${query} AND ${fieldId}>'${startingId}' ORDER BY ${fieldId} LIMIT ${MAX_NOQUERYMORE_BATCH_SIZE}`;
            // Let's start to check if we are 'allowed' to use the Salesforce API...
            this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
            // Deactivate AutoFetch to avoid the automatic call to queryMore by JsForce!
            const results = await conn.query(realQuery, { 
                autoFetch: false,
                headers: { 'Sforce-Query-Options': `batchSize=${MAX_NOQUERYMORE_BATCH_SIZE}` }
            });
            // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
            this._watchDog?.afterRequest(); // if limit has been reached, an error will be thrown here
            // Adding records to the global array.
            allRecords.push(... results.records);
            // Check if this was the last batch?
            if (results.records.length >= MAX_NOQUERYMORE_BATCH_SIZE) { // this was not yet the last batch
                // Update the last ID to start the next batch
                const newStartingId = allRecords[allRecords.length-1][fieldId];
                // call the next Batch
                await doNextQuery(newStartingId);
            }
        }
        try {
            // Call the first time with a fake Id that will always be first
            await doNextQuery('000000000000000000'); // and then the method will chain next calls
            // return the records
            return allRecords;
        } catch (error) {
            // Throw the error
            throw Object.assign(error, { 
                context: { 
                    when: 'While running a SOQL query with the custom queryMore', 
                    what: query 
            }});
        }
    }

    /**
     * @see SalesforceManagerIntf.soqlQuery
     * @param {Array<SalesforceQueryRequest>} queries 
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Array<any>>>}
     * @public
     */
    async soqlQuery(queries, logger) {
        // Now we can start, log some message
        logger?.log(`Preparing ${queries.length} SOQL ${queries.length>1?'queries':'query'}...`);
        let nbRecords = 0;
        const pendingEntities = [], doneEntities = [], errorEntities = [];
        // We'll run the queries in parallel, each query will be mapped as a promise and ran with Promise.all()
        const allPromisesResult = await Promise.all(queries.map(async (query) => {
            // Dynamically get the entityName of the Query
            const str = query.string.lastIndexOf('FROM ')+5;
            const end = query.string.indexOf(' ', str);
            const entityName = query.string.substring(str, end === -1 ? query.string.length : end);
            pendingEntities.push(entityName);
            // Are we doing a custom Query More?
            let records;
            try {
                if (query.queryMoreField) {
                    // yes!! do the custom one -- In case the query does not support queryMore we have an alternative, based on ids
                    records = await this._customSOQLQuery(query.tooling, query.string, query.queryMoreField);
                } else {
                    // no!!! use the standard one
                    records = await this._standardSOQLQuery(query.tooling, query.string, query.byPasses);
                }
                doneEntities.push(entityName)
                nbRecords += records.length;
            } catch (error) {
                errorEntities.push(entityName);
                throw error;
            } finally {
                const index = pendingEntities.indexOf(entityName);
                if (index > -1) pendingEntities.splice(index, 1);
            }
            logger?.log(
                `Processing ${queries.length} SOQL ${queries.length>1?'queries':'query'}... `+
                `Records retrieved: ${nbRecords}, `+
                `Pending: (${pendingEntities.length}) on [${pendingEntities.join(', ')}], `+
                `Done: (${doneEntities.length}) on [${doneEntities.join(', ')}], `+
                `Error: (${errorEntities.length}) on [${errorEntities.join(', ')}]`);
            return records;
        }));
        logger?.log(`Done running ${queries.length} SOQL ${queries.length>1?'queries':'query'}.`);
        return allPromisesResult;
    }

    /**
     * @see SalesforceManagerIntf.dependenciesQuery
     * @param {Array<string>} ids
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<{ records: Array<any>, errors: Array<string> }>}
     * @public
     * @async
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
        let nbPending = bodies.length, nbDone = 0, nbErrors = 0;
        const results = await Promise.all(bodies.map(async (body) => {
            try {
                // Call the tooling composite request
                const results = await this._connection.tooling.request({
                    url: `/tooling/composite`, // here JsForce will automatically complete the start of the URI
                    method: 'POST',
                    body: JSON.stringify(body), 
                    headers: { 'Content-Type': 'application/json' }
                });
                // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
                this._watchDog?.afterRequest(); // if limit has been reached, we reject the promise with a specific error and stop the process
                // Update the stats
                nbDone++;
                // Returning this results
                return results;
            } catch (error) {
                // Update the stats
                nbErrors++;
            } finally {
                // Update the stats
                nbPending--;
                logger?.log(`Processing ${bodies.length} Tooling composite queries... Pending: ${nbPending}, Done: ${nbDone}, Error: ${nbErrors}`);
            }
        }));
        logger?.log(`Got all the results`);
        const dependenciesRecords = []; // dependencies records
        const idsInError = []; // ids contained in a batch that has an error
        const duplicateCheck = new Set(); // Using a set to filter duplicates
        results.forEach((result) => {
            result.compositeResponse.forEach((/** @type {any} */ response) => {
                if (response.httpStatusCode === 200) {
                    logger?.log(`This response had a code: 200 so we add the ${response?.body?.records?.length} records`);
                    dependenciesRecords.push(... response.body.records // multiple response in one batch
                        .map((r) => { // Duplicates will be "null" and will get removed in further filter() call 
                            const id = this.caseSafeId(r.MetadataComponentId);
                            const refId = this.caseSafeId(r.RefMetadataComponentId);
                            const key = `${id}-${refId}`;
                            if (duplicateCheck.has(key)) return null;
                            duplicateCheck.add(key);
                            return {
                                id: id,
                                name: r.MetadataComponentName, 
                                type: r.MetadataComponentType,
                                url: this.setupUrl(id, r.MetadataComponentType),
                                refId: refId, 
                                refName: r.RefMetadataComponentName,
                                refType: r.RefMetadataComponentType,
                                refUrl: this.setupUrl(refId, r.RefMetadataComponentType)
                            }
                        })
                        .filter((r) => r !== null) // Remove duplicates
                    ); 
                } else {
                    const errorCode = response.body[0].errorCode;
                    if (errorCode === 'UNKNOWN_EXCEPTION') {
                        // This is a known issue with the DAPI in case the metadata in the org is messy for one of the IDs
                        logger?.log(`This response had a code: ${errorCode}`);
                        idsInError.push(... ids);
                    } else {
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
                }
            });
        });
        return { records: dependenciesRecords, errors: idsInError };
    }

    /**
     * @see SalesforceManagerIntf.readMetadata
     * @param {Array<SalesforceMetadataRequest>} metadatas 
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Map<string, Array<any>>>}
     * @public
     * @async
     */
    async readMetadata(metadatas, logger) {
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        // Now we can start, log some message
        logger?.log(`Starting to call Metadata API for ${metadatas.length} types...`);
        // First, if the metadatas contains an item with member='*' we want to list for this type and substitute the '*' with the fullNames
        await Promise.all(
            // only get the types that have at least '*' once
            metadatas.filter((m) => m.members.includes('*'))
            // then turn this filtered list into a list of promises
            .map(async (metadata) => { // using async as we just want to run parallel processes without manipulating their return values
                try {
                    // each promise will call the List metadata api operation for a specific type
                    const members = await this._connection.metadata.list([{ type: metadata.type }], this._apiVersion);
                    // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
                    this._watchDog?.afterRequest(); // if limit has been reached, we reject the promise with a specific error and stop the process
                    // clear the members (remove the stars)
                    metadata.members = metadata.members.filter((/** @type {string} */ b) => b !== '*'); // 'metadatas' will be altered!
                    // Add the rerieved fullNames to the members array
                    MAKE_IT_AN_ARRAY(members).forEach(f => { metadata.members.push(f.fullName); }); 
                    // don't return anything we are just altering the metadata.members.
                } catch (error) {
                    logger?.log(`The method metadata.list returned an error: ${JSON.stringify(error)}`);
                    // We reject the promise with the current error and additional context information
                    throw Object.assign(error, { 
                        context: { 
                            when: 'Calling Metadata API to get a list of metadata.',
                            what: {
                                type: metadata.type,
                                apiVersion: this._apiVersion
                            }
                        }
                    });
                }
            })
        );
        // All the promises to list the types have been done and potentially altered the 'metadatas' array
        // At this point, no more wildcard, only types and legitime member values in 'metadatas'.
        // Second, we want to read the metatda for these types and members
        const promises = [];
        const response = new Map(); 
        metadatas.forEach((metadata) => {
            // Init the response array for this type 
            logger?.log(`Init the response array for this type: ${metadata.type}`);
            response.set(metadata.type, []);
            // The API call to Metadata.Read will be done in slice, if for one type we have more than a certain amount 
            // of members we will do more queries
            logger?.log(`Starting looping for type ${metadata.type} and metadata.members.length=${metadata.members.length}`);
            while (metadata.members.length > 0) {
                // Slice the members in batch of MAX_MEMBERS_IN_METADATAAPI_REQUEST_SIZE
                const currentMembers = metadata.members.splice(0, MAX_MEMBERS_IN_METADATAAPI_REQUEST_SIZE); // get the first members
                // These first members have been removed from metadata.members (so next time we don't see them anymore
                promises.push(new Promise(async (resolve, reject) => {
                    logger?.log(`Try to call metadata read for type ${metadata.type} and currentMembers=${currentMembers}`);
                    try {
                        const members = await this._connection.metadata.read(metadata.type, currentMembers);
                        // Here the call has been made, so we can check if we have reached the limit of Salesforce API usage
                        this._watchDog?.afterRequest(); // if limit has been reached, we reject the promise with a specific error and stop the process
                        // Add the received member to the global response (there might be another batch with the same type!)
                        response.get(metadata.type).push(... MAKE_IT_AN_ARRAY(members));
                        resolve();
                    } catch (error) {
                        logger?.log(`The method metadata.read returned an error: ${JSON.stringify(error)}`);
                        // We reject the promise with the current error and additional context information
                        reject(Object.assign(error, { 
                            context: { 
                                when: 'Calling Metadata API to read a list of metadata.',
                                what: {
                                    type: metadata.type,
                                    pendingMembers: metadata.members,
                                    membersInProcess: currentMembers,
                                }
                            }
                        }));
                    };
                }));
            }
        }); // Promises are ready to be run
        logger?.log(`Calling all promises: ${promises.length}`);
        await Promise.all(promises); // response will be updated in the promises
        logger?.log(`All promises ended and response is like: ${JSON.stringify(Array.from(response.entries()))}`);
        return response;
    }

    /**
     * @see SalesforceManagerIntf.readMetadataAtScale
     * @param {SimpleLoggerIntf} logger
     * @param {string} type
     * @param {any[]} ids
     * @param {string[]} byPasses
     * @returns {Promise<Array<any>>}
     * @public
     * @async
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
     * @see SalesforceManagerIntf.describeGlobal
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<any>>}
     * @public
     * @async
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
     * @see SalesforceManagerIntf.describe
     * @param {string} sobjectDevName 
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<any>}
     * @public
     * @async
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
     * @see SalesforceManagerIntf.recordCount
     * @param {string} sobjectDevName 
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<number>}
     * @public
     * @async
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
     * @see SalesforceManagerIntf.runAllTests
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<string>}
     * @public
     * @async
     */ 
    async runAllTests(logger) {
        // Let's start to check if we are 'allowed' to use the Salesforce API...
        this._watchDog?.beforeRequest(); // if limit has been reached, an error will be thrown here
        const result = await this._connection.request({ 
            url: `/tooling/runTestsAsynchronous`,
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
     * @see SalesforceManagerIntf.compileClasses
     * @param {Array<SFDC_ApexClass>} classes
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<any>>}
     * @public
     * @async
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
 * @private
 */
const MAKE_IT_AN_ARRAY = (/** @type {any} */ data) => data ? (Array.isArray(data) ? data : [ data ]) : []; 

/**
 * @description Activity object that is not present in the describe API
 * @type {any}
 * @private
 */
const ACTIVITY_OBJECT_THAT_SHOULD_BE_RETURNED_BY_DESCRIBE = {
    name: 'Activity',
    label: 'Activity',
    labelPlural: 'Activities',
    customSetting: false,
    custom: false,
    keyPrefix: '00T'
};