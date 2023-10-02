import { OBJECTTYPE_ID_STANDARD_SOBJECT, OBJECTTYPE_ID_CUSTOM_SOBJECT, 
    OBJECTTYPE_ID_CUSTOM_EXTERNAL_SOBJECT, OBJECTTYPE_ID_CUSTOM_SETTING, 
    OBJECTTYPE_ID_CUSTOM_METADATA_TYPE, OBJECTTYPE_ID_CUSTOM_EVENT,
    OBJECTTYPE_ID_KNOWLEDGE_ARTICLE, OBJECTTYPE_ID_CUSTOM_BIG_OBJECT } from '../data/orgcheck-api-data-objecttype';

export class SOQLQueryInformation {
    string;
    tooling;
    byPasses;
    queryMore;
    addDependenciesBasedOnField;
}

export class OrgCheckSalesforceManager {

    /**
     * JSForce connection to your Salesforce org
     */
    #connection;

    /**
     * Construct the connection manager from a ConnectionFactory (like JSForce) and a VFP accesstoken
     * 
     * @param {JsForce} jsConnectionFactory 
     * @param {string} accessToken 
     */
    constructor(jsConnectionFactory, accessToken) {
        const THIS_YEAR = new Date().getFullYear();
        const THIS_MONTH = new Date().getMonth() + 1;
        const SF_API_VERSION = 3 * (THIS_YEAR - 2022) + 53 + (THIS_MONTH <= 2 ? 0 : (THIS_MONTH <= 6 ? 1 : (THIS_MONTH <= 10 ? 2 : 3 )));

        this.#connection = new jsConnectionFactory.Connection({
            accessToken: accessToken,
            version: SF_API_VERSION + '.0',
            maxRequest: '10000'
        });
    }

    isEmpty(value) {
        if (!value) return true;
        if (value.length === 0) return true;
        if (value.trim && value.trim().length === 0) return true;
        return false;
    }

    caseSafeId(id) {
        if (id && id.length === 18) return id.substr(0, 15);
        return id;
    }
    
    setupUrl(type, durableId, objectDurableId, objectType) {
        switch (type) {
            case 'field': {
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
                        console.error('field with type object uncovered: ', objectType);
                        return `/${durableId}`;
                }
            }
            case 'layout':
                return `/lightning/setup/ObjectManager/${objectDurableId}/PageLayouts/${durableId}/view`;
            case 'object': {
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
                        console.error('object with type uncovered: ', objectType);
                        return `/${objectDurableId}`;
                }
            }
            case 'validation-rule':
                return `/lightning/setup/ObjectManager/page?address=%2F${durableId}`;
            case 'web-link':
                return `/lightning/setup/ObjectManager/${objectDurableId}/ButtonsLinksActions/${durableId}/view`;
            case 'record-type':
                return `/lightning/setup/ObjectManager/${objectDurableId}/RecordTypes/${durableId}/view`;
            case 'apex-trigger':
                return '/lightning/setup/ObjectManager/${objectDurableId}/ApexTriggers/${durableId}/view';
            case 'field-set':
                return '/lightning/setup/ObjectManager/${objectDurableId}/FieldSets/${durableId}/view';
            case 'user':
                return `/lightning/setup/ManageUsers/page?address=%2F${durableId}%3Fnoredirect%3D1%26isUserEntityOverride%3D1`;
            case 'profile':
                return `/lightning/setup/EnhancedProfiles/page?address=%2F${durableId}`;
            case 'permission-set':
                return `/lightning/setup/PermSets/page?address=%2F${durableId}`;
            case 'permission-set-group':
                return `/lightning/setup/PermSetGroups/page?address=%2F${durableId}`;
            default:
                console.error('type uncovered: ', type);
                return `/${durableId}`;
        }
    }
    
    splitIdsInBatches(ids, batchsize, callback) {
        if (batchsize <= 0) return;
        for (let i = 0; i < ids.length; i += batchsize) {
            callback('\''+ids.slice(i, Math.min(i + batchsize, ids.length)).join('\',\'')+'\'');
        }
    }
    
    dapiHowManyTimesIsItUsedByType(dependencies, whatid) {
        const countersByType = {};
        dependencies.filter(e => e.refId === whatid).forEach(n => { 
            if (countersByType[n.type] === undefined) {
                countersByType[n.type] = 0;
            }
            countersByType[n.type]++; 
        });
        return countersByType;
    }
    
    dapiWhereIsItUsed(dependencies, whatid) {
        return dependencies.filter(e => e.refId === whatid).map(n => { return { id: n.id, name: n.name, type: n.type }; })
    }
    
    dapiWhatIsItUsing(dependencies, whatid) {
        return dependencies.filter(e => e.id === whatid).map(n => { return { id: n.refId, name: n.refName, type: n.refType }; })
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

    /**
     * Method to call a list of SOQL queries (tooling or not)
     * 
     * @param {Array<SOQLQueryInformation>} queries 
     */
    async soqlQuery(queries) {
        const promises = [];
        queries.forEach(q => {
            const queryPromise = new Promise((resolve, reject) => {
                const conn = q.tooling === true ? this.#connection.tooling : this.#connection;
                const records = [];
                const recursive_query = (e, d) => {
                    if (e) { 
                        if (q.byPasses && q.byPasses.includes(e.errorCode)) {
                            resolve();
                        } else {
                            e.context = { 
                                when: 'While creating a promise to call a SOQL query.',
                                what: {
                                    queryMore: q.queryMore,
                                    queryString: q.string,
                                    queryUseTooling: q.tooling
                                }
                            };
                            reject(e);
                        }
                    } else {
                        records.push(... d.records);
                        if (d.done === true) {
                            resolve({ records: records });
                        } else {
                            conn.queryMore(d.nextRecordsUrl, recursive_query);
                        }
                    }
                }
                conn.query(q.string, recursive_query);
            });
            if (q.addDependenciesBasedOnField) {
                promises.push(queryPromise
                    .then((results) => {
                        // Getting the Ids for DAPI call
                        const ids = results.records.map((record) => this.caseSafeId(record[q.addDependenciesBasedOnField]));
                        // We are going to split the DAPI calls into batches for <n> ids at the same time
                        const dapiPromises = [];
                        this.splitIdsInBatches(ids, 50, (subids) => {
                            dapiPromises.push(new Promise((resolve, reject) => {
                                this.#connection.tooling.query(
                                    'SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, '+
                                        'RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType '+
                                    'FROM MetadataComponentDependency '+
                                    `WHERE (RefMetadataComponentId IN (${subids}) OR MetadataComponentId IN (${subids}))`,
                                    (e, d) => {
                                        if (e) {
                                            e.context = { 
                                                when: 'While getting the dependencies from DAPI',
                                                what: {
                                                    allIds: ids,
                                                    concernedIds: subids
                                                }
                                            };
                                            reject(e);
                                        } else {
                                            resolve(d.records.map((r) => new SFDC_Dependency({
                                                id: this.caseSafeId(r.MetadataComponentId),
                                                name: r.MetadataComponentName,
                                                type: r.MetadataComponentType,
                                                refId: this.caseSafeId(r.RefMetadataComponentId),
                                                refName: r.RefMetadataComponentName,
                                                refType: r.RefMetadataComponentType
                                            })));
                                        }
                                    }
                                );
                            }));
                        });
                        return Promise.all(dapiPromises)
                            .then((allDependencies) => { 
                                // We are going to append the dependencies in the results
                                results.dependencies = [];
                                // We parse all the batches/results from the DAPI
                                allDependencies.forEach((dependencies) => {
                                    if (dependencies) {
                                        // Merge them into one array
                                        results.dependencies.push(... dependencies);
                                    }
                                });
                                // Return the altered results
                                return results
                            })
                            .catch((error) => {
                                console.error('Issue while parsing results from DAPI', error);
                            });
                    })
                    .catch((error) => {
                        console.error('Issue while accessing DAPI', error);
                    })
                );
            } else {
                promises.push(queryPromise);
            }
        });
        return Promise.all(promises);
    }

    /**
     * Method to get the list of sobjects
     */
    async describeGlobal() {
        return new Promise((resolve, reject) => {
            this.#connection.describeGlobal((e, d) => {
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
        return new Promise((resolve, reject) => {
            // describeSObject() method is not cached (compare to describe() method))
            this.#connection.describeSObject(sobjectDevName, (e, d) => {
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
        return new Promise((resolve, reject) => {
            this.#connection.request({ 
                url: '/services/data/v'+this.#connection.version+'/limits/recordCount?sObjects='+sobjectDevName,
                method: 'GET'
            }, (e, r) => {
                if (e) reject(e); else resolve((Array.isArray(r?.sObjects) && r?.sObjects.length == 1) ? r?.sObjects[0].count : 0);
            });
        });
    }

    /**
     * Get the lastest Daily API Usage from JSForce
     * 
     * @returns Ratio of the daily api usage.
     */
    getOrgLimits() {
        if (this.#connection.limitInfo && this.#connection.limitInfo.apiUsage) {
            const apiUsageUsed = this.#connection.limitInfo.apiUsage.used;
            const apiUsageMax = this.#connection.limitInfo.apiUsage.limit;
            return ( apiUsageUsed / apiUsageMax );
        }
        return 0;
    }
}