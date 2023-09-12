class SFDC_OrgInformation {
    id;
    name;
    type;
    isProduction;
    localNamespace;
    constructor(setup) { 
        if (setup) Object.keys(this).forEach((p) => { this[p] = setup[p]; });
    }
}

class SFDC_Object {
    id;
    label;
    name;
    apiname;
    url;
    package;
    typeId;
    typeRef;
    constructor(setup) { 
        if (setup) Object.keys(this).forEach((p) => { this[p] = setup[p]; });
    }
}

const OBJECTTYPE_STANDARD_SOBJECT = 'StandardObject';
const OBJECTTYPE_CUSTOM_SOBJECT = 'CustomObject';
const OBJECTTYPE_CUSTOM_EXTERNAL_SOBJECT = 'ExternalObject';
const OBJECTTYPE_CUSTOM_SETTING = 'CustomSetting';
const OBJECTTYPE_CUSTOM_METADATA_TYPE = 'CustomMetadataType';
const OBJECTTYPE_CUSTOM_EVENT = 'CustomEvent';
const OBJECTTYPE_KNOWLEDGE_ARTICLE = 'KnowledgeArticle';
const OBJECTTYPE_CUSTOM_BIG_OBJECT = 'CustomBigObject';

class SFDC_ObjectType {
    id;
    label;
    constructor(setup) { 
        if (setup) Object.keys(this).forEach((p) => { this[p] = setup[p]; });
    }
}

class SFDC_CustomField {
    id;
    url;
    name;
    label;
    package;
    description;
    createdDate;
    lastModifiedDate;
    objectId; 
    objectRef; 
    score;
    constructor(setup) { 
        if (setup) Object.keys(this).forEach((p) => { this[p] = setup[p]; });
    }
}

class SFDC_Package {
    id;
    name;
    namespace;
    type;
    constructor(setup) { 
        if (setup) Object.keys(this).forEach((p) => { this[p] = setup[p]; });
    }
}

class SFDC_User {
    id;
    url;
    photoUrl;
    name;
    lastLogin;
    neverLogged;
    numberFailedLogins;
    onLightningExperience;
    lastPasswordChange;
    profileId;
    profileRef;
    importantPermissions;
    permissionSetIds;
    permissionSetRefs;
    score;
    constructor(setup) { 
        if (setup) Object.keys(this).forEach((p) => { this[p] = setup[p]; });
    }
}

class SFDC_Profile {
    id;
    url;
    name;
    apiName;
    description;
    license;
    isCustom;
    isUndescribedCustom;
    package;
    isUnusedCustom;
    memberCounts;
    hasMembers;
    createdDate;
    lastModifiedDate;
    nbFieldPermissions;
    nbObjectPermissions;
    score;
    constructor(setup) { 
        if (setup) Object.keys(this).forEach((p) => { this[p] = setup[p]; });
    }

}

class SFDC_PermissionSet {
    id;
    url;
    name;
    apiName;
    description;
    license;
    isCustom;
    isUndescribedCustom;
    package;
    isUnusedCustom;
    memberCounts;
    hasMembers;
    isGroup;
    createdDate;
    lastModifiedDate;
    nbFieldPermissions;
    nbObjectPermissions;
    profileIds;
    profileRefs;
    score;
    constructor(setup) { 
        if (setup) Object.keys(this).forEach((p) => { this[p] = setup[p]; });
    }
}

class OrgCheckMap {
    #keyIndexes = {};
    #keys = [];
    #values = [];
    #createdDate = new Date();
    #lastModificationDate = this.#createdDate;

    keys() {
        return Object.keys(this.#keyIndexes);
    }

    _check_keyDefined(key, method) {
        if (key === undefined) {
            throw new Error(`OrgCheckMap.${method}: the given key is undefined.`);
        }
    }

    _check_keyExists(key, method) {
        const index = this.#keyIndexes[key];
        if (index === undefined) {
            throw new Error(`OrgCheckMap.${method}: the given key [${key}] is not found in the map.`);
        }
        return index;
    }

    hasKey(key) {
        this._check_keyDefined(key, 'hasKey');
        return this.#keys.includes(key) === true;
    }

    get(key) {
        this._check_keyDefined(key, 'get');
        return this.#values[this._check_keyExists(key, 'get')];
    }

    remove(key) {
        this._check_keyDefined(key, 'remove');
        const index = this._check_keyExists(key, 'remove');
        this.#keys.splice(index, 1);
        this.#values.splice(index, 1);
        delete this.#keyIndexes[key];
        for (let i = index; i < this.#keys.length; i++) {
            this.#keyIndexes[this.#keys[i]]--;
        }
        this.#lastModificationDate = new Date();
    }

    removeAll() {
        this.#keyIndexes = {};
        this.#keys = [];
        this.#values = [];
        this.#lastModificationDate = new Date();
    }

    set(key, value) {
        this._check_keyDefined(key, 'set');
        if (this.#keys.includes(key) === true) {
            this.#values[this.#keyIndexes[key]] = value;
        } else {
            this.#keyIndexes[key] = this.#values.length;
            this.#keys.push(key);
            this.#values.push(value);
        }
        this.#lastModificationDate = new Date();
    }

    size() {
        return this.#values.length;
    }

    createdDate() {
        return this.#createdDate;
    }

    lastModificationDate() {
        return this.#lastModificationDate;
    }

    filterValues(callback) {
        return this.#values.filter(callback);
    }

    mapValues(callback) {
        return this.#values.map(callback);
    }

    forEachValue(callback) {
        return this.#values.forEach(callback);
    }

    allValues() {
        return this.#values.slice();
    }
}

const CASESAFEID = (id) => {
    if (id && id.length === 18) return id.substr(0, 15);
    return id;
}

const ISEMPTY = (value) => {
    if (!value) return true;
    if (value.length === 0) return true;
    if (value.trim && value.trim().length === 0) return true;
    return false;
}

const DATASET_ORGINFO = 'OrgInfo';
const DATASET_PACKAGES = 'Packages';
const DATASET_OBJECTTYPES = 'ObjectTypes';
const DATASET_OBJECTS = 'Objects';
const DATASET_CUSTOMFIELDS = 'CustomFields';
const DATASET_USERS = 'Users';
const DATASET_PERMISSIONSETS = 'PermissionSets';
const DATASET_PROFILES = 'Profiles';

class DatasetCacheInfo {
    name;
    length;
    created;
    modified;
}

class DatasetManager {
    
    #retrievers;
    #cache;

    constructor(sfdcManager) {
        this.#retrievers = new OrgCheckMap();
        this.#cache = new OrgCheckMap();
        
        // ***************************
        // Dataset for ORG INFO
        // ***************************
        this.#retrievers.set(DATASET_ORGINFO, (resolve, reject) => {
            // SOQL queries on InstalledSubscriberPackage and Organization
            sfdcManager.soqlQuery([{ 
                string: 'SELECT Id, Name, IsSandbox, OrganizationType, TrialExpirationDate, '+
                            'NamespacePrefix FROM Organization'
            }]).then((results) => {
                // Init the map
                const information = new OrgCheckMap();
                // Set the map
                const organization = results[0].records[0];
                let type;
                if (organization.OrganizationType === 'Developer Edition') type = 'Developer Edition';
                else if (organization.IsSandbox === true) type = 'Sandbox';
                else if (organization.IsSandbox === false && organization.TrialExpirationDate) type = 'TrialOrDemo';
                else type = 'Production';
                information.set(organization.Id, new SFDC_OrgInformation({
                    id: organization.Id,
                    name: organization.Name,
                    type: type,
                    isProduction: (type === 'Production'),
                    localNamespace: (organization.NamespacePrefix || '')
                }));
                // Return data
                resolve(information);
            }).catch(reject);
        });

        // ***************************
        // Dataset for PACKAGES
        // ***************************
        this.#retrievers.set(DATASET_PACKAGES, (resolve, reject) => {
            // SOQL queries on InstalledSubscriberPackage and Organization
            sfdcManager.soqlQuery([{ 
                tooling: true,
                string: 'SELECT Id, SubscriberPackage.NamespacePrefix, SubscriberPackage.Name '+
                        'FROM InstalledSubscriberPackage ' 
            }, { 
                string: 'SELECT NamespacePrefix FROM Organization '
            }]).then((results) => {
                // Init the map
                const packages = new OrgCheckMap();
                // Set the map (1/2) - installed package
                results[0].records.forEach((record) => {
                    packages.set(record.Id, new SFDC_Package({
                        id: record.Id,
                        name: record.SubscriberPackage.Name,
                        namespace: record.SubscriberPackage.NamespacePrefix,
                        type: 'Installed'
                    }));
                });
                // Set the map (2/2) - local package
                results[1].records.forEach((record) => {
                    packages.set('<local>', new SFDC_Package({
                        id: record.NamespacePrefix, 
                        name: record.NamespacePrefix, 
                        namespace: record.NamespacePrefix, 
                        type: 'Local'
                    }));
                });
                // Return data
                resolve(packages);
            }).catch(reject);
        });

        // ***************************
        // Dataset for OBJECT TYPES
        // ***************************
        this.#retrievers.set(DATASET_OBJECTTYPES, (resolve, reject) => {
            try {
                // Init the map
                const types = new OrgCheckMap();
                // Set the map
                [
                    { id: OBJECTTYPE_STANDARD_SOBJECT,        label: 'Standard Object' },
                    { id: OBJECTTYPE_CUSTOM_SOBJECT,          label: 'Custom Object' },
                    { id: OBJECTTYPE_CUSTOM_EXTERNAL_SOBJECT, label: 'External Object' },
                    { id: OBJECTTYPE_CUSTOM_SETTING,          label: 'Custom Setting' },
                    { id: OBJECTTYPE_CUSTOM_METADATA_TYPE,    label: 'Custom Metadata Type' },
                    { id: OBJECTTYPE_CUSTOM_EVENT,            label: 'Platform Event' },
                    { id: OBJECTTYPE_KNOWLEDGE_ARTICLE,       label: 'Knowledge Article' },
                    { id: OBJECTTYPE_CUSTOM_BIG_OBJECT,       label: 'Big Object' }
                ].forEach((e) => { 
                    types.set(e.id, new SFDC_ObjectType({id: e.id, label: e.label})); 
                });
                // Return data
                resolve(types);
            } catch(error) { reject(error); }
        });

        // ***************************
        // Dataset for OBJECTS
        // ***************************
        this.#retrievers.set(DATASET_OBJECTS, (resolve, reject) => {
            sfdcManager.soqlQuery([{ 
                string: 'SELECT NamespacePrefix FROM Organization'
            }]).then((results) => {
                // Get the namespace of the org (if any)
                const localNamespace = results[0].records[0].NamespacePrefix;
                // Two actions to perform in parallel, global describe and an additional entity definition soql query
                const promises = [];
                // Requesting information from the current salesforce org
                promises.push(sfdcManager.describeGlobal());
                // Some information are not in the global describe, we need to append them with EntityDefinition soql query
                promises.push(sfdcManager.soqlQuery([{ 
                    tooling: true,
                    string: 'SELECT DurableId, NamespacePrefix, DeveloperName, QualifiedApiName '+
                            'FROM EntityDefinition ' +
                            `WHERE PublisherId IN ('System', '<local>', '${localNamespace}') ` +
                            'AND keyPrefix <> null '+
                            'AND DeveloperName <> null '
                }]));
                Promise.all(promises)
                    .then((resultss) => {
                        // Init the map
                        const objects = new OrgCheckMap();
                        // Set the map
                        const objectsDescription = resultss[0]; 
                        const entities = resultss[1][0].records;
                        const entitiesByName = {};
                        const qualifiedApiNames = entities.map((record) => { 
                            entitiesByName[record.QualifiedApiName] = record; 
                            return record.QualifiedApiName;
                        });
                        objectsDescription
                            .filter((object) => qualifiedApiNames.includes(object.name))
                            .forEach((object) => {
                                let type;
                                if (object.custom === false) type = OBJECTTYPE_STANDARD_SOBJECT;
                                else if (object.customSetting === true) type = OBJECTTYPE_CUSTOM_SOBJECT;
                                else if (object.name.endsWith('__c')) type = OBJECTTYPE_CUSTOM_EXTERNAL_SOBJECT;
                                else if (object.name.endsWith('__x')) type = OBJECTTYPE_CUSTOM_SETTING;
                                else if (object.name.endsWith('__mdt')) type = OBJECTTYPE_CUSTOM_METADATA_TYPE;
                                else if (object.name.endsWith('__e')) type = OBJECTTYPE_CUSTOM_EVENT;
                                else if (object.name.endsWith('__ka')) type = OBJECTTYPE_KNOWLEDGE_ARTICLE;
                                else if (object.name.endsWith('__b')) type = OBJECTTYPE_CUSTOM_BIG_OBJECT;
                                else if (!type) return;
                                const entity = entitiesByName[object.name];
                                const id = CASESAFEID(object.name);
                                objects.set(id, new SFDC_Object({
                                    id: id,
                                    label: object.label,
                                    name: entity.DeveloperName,
                                    apiname: object.name,
                                    url: `/${id}`,
                                    package: (entity.NamespacePrefix || ''),
                                    typeId: type
                                }));
                            });
                        // Return data
                        resolve(objects);
                    })
                    .catch(reject)
            }).catch(reject);
        });

        // ***************************
        // Dataset for CUSTOM FIELDS
        // ***************************
        this.#retrievers.set(DATASET_CUSTOMFIELDS, (resolve, reject) => {
            // SOQL query on CustomField
            sfdcManager.soqlQuery([{ 
                tooling: true,
                string: 'SELECT Id, EntityDefinition.QualifiedApiName, DeveloperName, NamespacePrefix, '+
                            'Description, CreatedDate, LastModifiedDate '+
                        'FROM CustomField '+
                        'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\')'
            }]).then((results) => {
                // Init the map
                const customFields = new OrgCheckMap();
                // Set the map
                results[0].records
                    .filter((record) => (record.EntityDefinition ? true : false))
                    .forEach((record) => {
                        // Get the ID15 of this custom field
                        const id = CASESAFEID(record.Id);

                        // Compute the score of this user, with the following rule:
                        //  - If the field has no description, then you get +1.
                        //  - If the field is not used by any other entity (based on the Dependency API), then you get +1.
                        let score = 0;
                        if (ISEMPTY(record.Description)) score++;
                        // TODO: get the DAPI information for this field......
                        // Add it to the map  
                        customFields.set(id, new SFDC_CustomField({
                            id: id,
                            url: `/${record.Id}`,
                            name: record.DeveloperName,
                            label: record.DeveloperName,
                            package: (record.NamespacePrefix || ''),
                            description: record.Description,
                            createdDate: record.CreatedDate,
                            lastModifiedDate: record.LastModifiedDate,
                            objectId: CASESAFEID(record.EntityDefinition.QualifiedApiName),
                            score: score
                        }));
                    });
                // Return data
                resolve(customFields);
            }).catch(reject);
        });

        // ***************************
        // Dataset for ACTIVE USERS
        // ***************************
        this.#retrievers.set(DATASET_USERS, (resolve, reject) => {
            const IMPORTANT_PERMISSIONS = [ 'ApiEnabled', 'ViewSetup', 'ModifyAllData', 'ViewAllData' ];
            // SOQL query on User
            sfdcManager.soqlQuery([{ 
                string: 'SELECT Id, Name, SmallPhotoUrl, ProfileId, '+
                'LastLoginDate, LastPasswordChangeDate, NumberOfFailedLogins, '+
                'UserPreferencesLightningExperiencePreferred, '+
                '(SELECT PermissionSetId, '+
                    'PermissionSet.PermissionsApiEnabled, '+
                    'PermissionSet.PermissionsViewSetup, '+
                    'PermissionSet.PermissionsModifyAllData, '+
                    'PermissionSet.PermissionsViewAllData, '+
                    'PermissionSet.IsOwnedByProfile '+
                    'FROM PermissionSetAssignments) '+
                'FROM User '+
                'WHERE Profile.Id != NULL ' + // we do not want the Automated Process users!
                'AND IsActive = true ', // we only want active users
            }]).then((results) => {
                // Init the map
                const users = new OrgCheckMap();
                // Set the map
                results[0].records
                    .forEach((record) => {
                        // Get the ID15 of this user
                        const id = CASESAFEID(record.Id);
                        // Check if this user has a set of important permissions in Profile and Permission Sets
                        // At the same time, set the reference if of its permission sets
                        const importantPermissions = {};
                        const permissionSetRefs = [];
                        if (record.PermissionSetAssignments && record.PermissionSetAssignments.records) {
                            record.PermissionSetAssignments.records.forEach((assignment) => {
                                IMPORTANT_PERMISSIONS.forEach((permission) => {
                                    if (assignment.PermissionSet[`Permissions${permission}`] === true) {
                                        importantPermissions[permission] = true;
                                    }
                                });
                                if (assignment.PermissionSet.IsOwnedByProfile === false) {
                                    permissionSetRefs.push(CASESAFEID(assignment.PermissionSetId));
                                }
                            });
                        }
                        // Compute the score of this user, with the following rule:
                        //   - If the user is not using Lightning Experience, then you get +1.
                        //   - If the user never logged, then you get +1.
                        let score = 0;
                        if (record.UserPreferencesLightningExperiencePreferred === false) score++;
                        if (!record.LastLoginDate) score++;
                        // Add it to the map  
                        users.set(id, new SFDC_User({
                            id: id,
                            url: `/${id}`,
                            photoUrl: record.SmallPhotoUrl,
                            name: record.Name,
                            lastLogin: record.LastLoginDate,
                            neverLogged: (record.LastLoginDate ? false : true),
                            numberFailedLogins: record.NumberOfFailedLogins,
                            onLightningExperience: record.UserPreferencesLightningExperiencePreferred,
                            lastPasswordChange: record.LastPasswordChangeDate,
                            profileId: CASESAFEID(record.ProfileId),
                            importantPermissions: Object.keys(importantPermissions).sort(),
                            permissionSetIds: permissionSetRefs,
                            score: score
                        }));
                    });
                // Return data
                resolve(users);
            }).catch(reject);
        })

        // ***************************
        // Dataset for PROFILES
        // ***************************
        this.#retrievers.set(DATASET_PROFILES, (resolve, reject) => {
            // SOQL query on PermissionSet with isOwnedByProfile = TRUE
            sfdcManager.soqlQuery([{ 
                string: 'SELECT ProfileId, Profile.Name, Profile.Description, IsCustom, License.Name, NamespacePrefix, '+
                            'CreatedDate, LastModifiedDate, '+
                            '(SELECT Id FROM Assignments WHERE Assignee.IsActive = TRUE LIMIT 51), '+
                            '(SELECT Id FROM FieldPerms LIMIT 51), '+
                            '(SELECT Id FROM ObjectPerms LIMIT 51)'+
                        'FROM PermissionSet '+ // oh yes we are not mistaken!
                        'WHERE isOwnedByProfile = TRUE'
            }]).then((results) => {
                // Init the map
                const profiles = new OrgCheckMap();
                // Set the map
                results[0].records
                    .forEach((record) => {
                        // Get the ID15 of this profile
                        const profileId = CASESAFEID(record.ProfileId);
                        // Get the count of active users assigned to this profile (maximum is 51)
                        const memberCounts = (record.Assignments && record.Assignments.records) ? record.Assignments.records.length : 0;                        
                        // Compute the score of this profile, with the following rule:
                        //   - If it is custom and is not used by any active users, then you get +1.
                        //   - If it is custom and has no description, then you get +1.
                        let score = 0;
                        if (record.IsCustom && memberCounts === 0) score++;
                        if (record.IsCustom && ISEMPTY(record.Profile.Description)) score++;
                        // Add it to the map                        
                        profiles.set(profileId, new SFDC_Profile({
                            id: profileId,
                            url: `/${profileId}`,
                            name: record.Profile.Name,
                            apiName: (record.NamespacePrefix ? (record.NamespacePrefix + '__') : '') + record.Profile.Name,
                            description: record.Profile.Description,
                            license: (record.License ? record.License.Name : ''),
                            isCustom: record.IsCustom,
                            isUndescribedCustom: record.IsCustom && !record.Profile.Description,
                            package: (record.NamespacePrefix || ''),
                            isUnusedCustom: record.IsCustom && memberCounts === 0,
                            memberCounts: memberCounts,
                            hasMembers: memberCounts > 0,
                            createdDate: record.CreatedDate, 
                            lastModifiedDate: record.LastModifiedDate,
                            nbFieldPermissions: record.FieldPerms?.records.length || 0,
                            nbObjectPermissions: record.ObjectPerms?.records.length || 0,
                            score: score
                        }));                    
                    });
                // Return data
                resolve(profiles);
            }).catch(reject);
        });

        // ***************************
        // Dataset for PERMISSION SETS
        // ***************************
        this.#retrievers.set(DATASET_PERMISSIONSETS, (resolve, reject) => {
            // SOQL query on PermissionSet
            sfdcManager.soqlQuery([{ 
                string: 'SELECT Id, Name, Description, IsCustom, License.Name, NamespacePrefix, Type, '+
                            'CreatedDate, LastModifiedDate, '+
                            '(SELECT Id FROM Assignments WHERE Assignee.IsActive = TRUE LIMIT 51), '+
                            '(SELECT Id FROM FieldPerms LIMIT 51), '+
                            '(SELECT Id FROM ObjectPerms LIMIT 51)'+
                        'FROM PermissionSet '+
                        'WHERE IsOwnedByProfile = FALSE' 
            }, { 
                string: 'SELECT Id, AssigneeId, Assignee.ProfileId, PermissionSetId '+
                        'FROM PermissionSetAssignment '+
                        'WHERE Assignee.IsActive = TRUE '+
                        'AND PermissionSet.IsOwnedByProfile = FALSE '+
                        'ORDER BY PermissionSetId '
            }]).then((results) => {
                // Init the map
                const permissionSets = new OrgCheckMap();
                // Set the map
                results[0].records
                    .forEach((record) => {
                        // Get the ID15 of this permission set
                        const id = CASESAFEID(record.Id);
                        // Get the count of active users assigned to this permission set (maximum is 51)
                        const memberCounts = (record.Assignments && record.Assignments.records) ? record.Assignments.records.length : 0;
                        // Compute the score of this permission set, with the following rule:
                        //   - If it is custom and is not used by any active users, then you get +1.
                        //   - If it is custom and has no description, then you get +1.
                        let score = 0;
                        if (record.IsCustom && memberCounts === 0) score++;
                        if (record.IsCustom && ISEMPTY(record.Description)) score++;
                        // Add it to the map                        
                        permissionSets.set(id, new SFDC_PermissionSet({
                            id: id,
                            url: `/${id}`,
                            name: record.Name,
                            apiName: (record.NamespacePrefix ? (record.NamespacePrefix + '__') : '') + record.Name,
                            description: record.Description,
                            license: (record.License ? record.License.Name : ''),
                            isCustom: record.IsCustom,
                            isUndescribedCustom: record.IsCustom && !record.Description,
                            package: (record.NamespacePrefix || ''),
                            isUnusedCustom: record.IsCustom && memberCounts === 0,
                            memberCounts: memberCounts,
                            hasMembers: memberCounts > 0,
                            isGroup: (record.Type === 'Group'), // other values can be 'Regular', 'Standard', 'Session
                            createdDate: record.CreatedDate, 
                            lastModifiedDate: record.LastModifiedDate,
                            nbFieldPermissions: record.FieldPerms?.records.length || 0,
                            nbObjectPermissions: record.ObjectPerms?.records.length || 0,
                            profileIds: {},
                            score: score
                        }));
                    });
                results[1].records
                    .forEach((record) => {
                        const permissionSetId = CASESAFEID(record.PermissionSetId);
                        const profileId = CASESAFEID(record.Assignee.ProfileId);
                        if (permissionSets.hasKey(permissionSetId)) {
                            const permissionSet = permissionSets.get(permissionSetId);
                            if (permissionSet.profileIds[profileId] !== true) permissionSet.profileIds[profileId] = true;
                        }
                    });
                permissionSets.forEachValue((permissionSet) => {
                    permissionSet.profileIds = Object.keys(permissionSet.profileIds);
                });
                // Return data
                resolve(permissionSets);
            }).catch(reject);
        });
    }

    async run(datasets) {
        const results = new OrgCheckMap();
        const promises = [];
        datasets.forEach((dataset) => {
            if (this.#retrievers.hasKey(dataset) === false) {
                throw new Error(`Dataset '${dataset}' is not yet implemented.`);
            }
            promises.push(new Promise((resolve, reject) => {
                // Check cache if any
                if (this.#cache.hasKey(dataset) === true) {
                    // Set the results from cache
                    results.set(dataset, this.#cache.get(dataset));
                    // Resolve
                    resolve();
                    return;
                }
                // Calling the retriever
                this.#retrievers.get(dataset)(
                    // success
                    (data) => {
                        // Cache the data
                        this.#cache.set(dataset, data);
                        // Set the results
                        results.set(dataset, data);
                        // Resolve
                        resolve();
                    },
                    // error
                    (error) => {
                        // Reject with this error
                        reject(error);
                    }
                );
            }));
        });
        return Promise.all(promises).then(() => results);
    }

    getCacheInformation() {
        return this.#cache.keys().map((datasetName) => {
            const dataset = this.#cache.get(datasetName);
            const info = new DatasetCacheInfo();
            info.name = datasetName;
            info.length = dataset?.size();
            info.created = dataset?.createdDate();
            info.modified = dataset?.lastModificationDate();
            return info;
        });
    }

    removeCache(name) {
        this.#cache.remove(name);
    }

    removeAllCache() {
        this.#cache.removeAll();
    }
}

class SFDCConnectionManager {

    /**
     * JSForce connection to your Salesforce org
     */
    #connection;

    constructor(sfdcConnector, accessToken) {
        const THIS_YEAR = new Date().getFullYear();
        const THIS_MONTH = new Date().getMonth() + 1;
        const SF_API_VERSION = 3 * (THIS_YEAR - 2022) + 53 + (THIS_MONTH <= 2 ? 0 : (THIS_MONTH <= 6 ? 1 : (THIS_MONTH <= 10 ? 2 : 3 )));

        this.#connection = new sfdcConnector.Connection({
            accessToken: accessToken,
            version: SF_API_VERSION + '.0',
            maxRequest: '10000'
        });
    }

    /**
     * Method to call a list of SOQL queries (tooling or not)
     */
    async soqlQuery(queries) {
        const promises = [];
        queries.forEach(q => {
            promises.push(new Promise((resolve, reject) => {
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
            }));
        });
        return Promise.all(promises);
    }


    /*
                    const recursive_query = (error, result) => {
                        
                    }
                    api.query(query.string, recursive_query);

    */

    /**
     * Method to call a list of sobjects
     */
    async describeGlobal() {
        return new Promise((resolve, reject) => {
            this.#connection.describeGlobal((e, d) => {
                if (e) reject(e);
                resolve(d.sobjects);
            });
        });
    }

    /**
     * Get the lastest Daily API Usage from JSForce
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

/**
 * Org Check API main class
 */
export class OrgCheckAPI {

    /**
     * Org Check version
     * @return String representation of the Org Check version in a form of Element [El,n]
     */
    version() {
        return 'Beryllium [Be,4]';
    }

    #datasetManager;
    #sfdcManager;

    /**
     * Org Check constructor
     * 
     * @param {JsForce} sfdcConnector
     * @param {String} accessToken
     * @param {String} userId
     */
    constructor(sfdcConnector, accessToken, userId) {

        this.#sfdcManager = new SFDCConnectionManager(sfdcConnector, accessToken, userId);
        this.#datasetManager = new DatasetManager(this.#sfdcManager);
    }

    /**
     * Private method to extract the package name and the logical name of a resource
     * 
     * @param {String} name of a resource in Salesforce like <code>MyPackage__CustomObj__c</code> or <code>CustomObj__mdt</code>
     * @returns the package name as <code>package</code> and the logical name as <code>logicalName</code>
     */
    _extractInformationFromName(name) {
        const name_splitted = name?.split('__');
        switch (name_splitted?.length) {
            case 3:
                // Use case #1: Custom resource in a package or using local namespace
                // Example: MyPackage__CustomObj__c, MyPackage__CustomObj__mdt, ...
                return { package: name_splitted[0], logicalName: name_splitted[1] };
            case 2:
                // Use case #2: Custom resource in the org without local namespace
                return { package: '', logicalName: name_splitted[0] };
            default:
                // Use case #3: Standard object in the org
                return { package: '', logicalName: name };
        }
    }

    removeAllCache() {
        this.#datasetManager.removeAllCache();
    }

    removeCache(name) {
        this.#datasetManager.removeCache(name);
    }

    getCacheInformation() {
        return this.#datasetManager.getCacheInformation();
    }

    /**
     * Get the lastest Daily API Usage from JSForce
     */
    getOrgDailyApiLimitRate() {
        return this.#sfdcManager.getOrgLimits();
    }

    /**
     * Get the information of the org (async method)
     * 
     * @returns {SFDC_OrgInformation}
     */
    async getOrgInformation() {
        // Get data
        const data = await this.#datasetManager.run([DATASET_ORGINFO]);
        const orgInfo = data.get(DATASET_ORGINFO);
        // Return the only first value!
        return orgInfo.allValues()[0];
    }

    /**
     * Get a list of your packages (local and distant) (async method)
     * 
     * @returns {Array<SFDC_Package>}
     */
    async getPackages() {
        // Get data
        const data = await this.#datasetManager.run([DATASET_PACKAGES]);
        const packages = data.get(DATASET_PACKAGES);
        // Return values
        return packages.allValues();
    }

    /**
     * Get a list of supported types
     * 
     * @returns {Array<SFDC_ObjectType>}
     */
    async getTypes() {
        // Get data
        const data = await this.#datasetManager.run([DATASET_OBJECTTYPES]);
        const types = data.get(DATASET_OBJECTTYPES);
        // Return values
        return types.allValues();
    }

    /**
     * Get a list of objects (async method)
     * 
     * @param namespace of the object you want to list (optional), '*' for any
     * @param type of the object you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_Object>}
     */
    async getObjects(namespace, type) {
        // Get data
        const data = await this.#datasetManager.run([DATASET_OBJECTS, DATASET_OBJECTTYPES]);
        const objects = data.get(DATASET_OBJECTS);
        const types = data.get(DATASET_OBJECTTYPES);
        // Augment custom fields with object references
        objects.forEachValue((object) => {
            object.typeRef = types.get(object.typeId);
        });
        // Return values filtered by inputs
        return objects.filterValues((object) => {
            if (namespace !== '*' && object.package !== namespace) return false;
            if (type !== '*' && object.typeRef?.id !== type) return false;
            return true;
        });
    }

    /**
     * Get a list of custom fields (async method)
     * 
     * @param namespace you want to list (optional), '*' for any
     * @param object type you want to list (optional), '*' for any
     * @param object you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_CustomField>}
     */
    async getCustomFields(namespace, objecttype, object) {
        // Get data
        const data = await this.#datasetManager.run([DATASET_CUSTOMFIELDS, DATASET_OBJECTS]);
        const objects = data.get(DATASET_OBJECTS);
        const customFields = data.get(DATASET_CUSTOMFIELDS);
        // Augment custom fields with object references
        customFields.forEachValue((customField) => {
            customField.objectRef = objects.get(customField.objectId);
        });
        // Return values filtered by inputs
        return customFields.filterValues((customField) => {
            if (namespace !== '*' && customField.package !== namespace) return false;
            if (objecttype !== '*' && customField.objectRef?.typeRef?.id !== objecttype) return false;
            if (object !== '*' && customField.objectRef?.apiname !== object) return false;
            return true;
        });
    }

    /**
     * Get a list of permission sets (async method)
     * 
     * @param namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_PermissionSet>}
     */
    async getPermissionSets(namespace) {
        // Get data
        const data = await this.#datasetManager.run([DATASET_PERMISSIONSETS, DATASET_PROFILES]);
        const permissionSets = data.get(DATASET_PERMISSIONSETS);
        const profiles = data.get(DATASET_PROFILES);
        // Augment permission sets with profile references
        permissionSets.forEachValue((permissionSet) => {
            permissionSet.profileRefs = permissionSet.profileIds.filter((id) => profiles.hasKey(id)).map((id) => profiles.get(id));
        });
        // Return values filtered by inputs
        return permissionSets.filterValues((permissionSet) => {
            if (namespace !== '*' && permissionSet.package !== namespace) return false;
            return true;
        });
    }

    /**
     * Get a list of profiles (async method)
     * 
     * @param namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_Profile>}
     */
    async getProfiles(namespace) {
        // Get data
        const data = await this.#datasetManager.run([DATASET_PROFILES]);
        const profiles = data.get(DATASET_PROFILES);
        // Return values
        return profiles.filterValues((profile) => {
            if (namespace !== '*' && profile.package !== namespace) return false;
            return true;
        });
    }

    /**
     * Get a list of active users (async method)
     * 
     * @returns {Array<SFDC_User>}
     */
    async getActiveUsers() {
        // Get data
        const data = await this.#datasetManager.run([DATASET_USERS, DATASET_PROFILES, DATASET_PERMISSIONSETS]);
        const users = data.get(DATASET_USERS);
        const profiles = data.get(DATASET_PROFILES);
        const permissionSets = data.get(DATASET_PERMISSIONSETS);
        // Augment users with profile and permission sets references
        users.forEachValue((user) => {
            user.profileRef = profiles.get(user.profileId);
            user.permissionSetRefs = user.permissionSetIds.filter((id) => permissionSets.hasKey(id)).map((id) => permissionSets.get(id));
        });
        // Return values
        return users.allValues();
    }
}