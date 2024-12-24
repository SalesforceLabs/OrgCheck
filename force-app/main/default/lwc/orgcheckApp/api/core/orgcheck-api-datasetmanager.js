// @ts-check

import { OrgCheckLogger } from './orgcheck-api-logger';
import { OrgCheckDataCacheManager } from './orgcheck-api-datacache';
import { OrgCheckSalesforceManager } from './orgcheck-api-sfconnectionmanager';
import { OrgCheckDataFactory, OrgCheckValidationRule } from './orgcheck-api-datafactory';
import { OrgCheckDatasetCustomFields } from '../dataset/orgcheck-api-dataset-customfields';
import { OrgCheckDatasetCustomLabels } from '../dataset/orgcheck-api-dataset-customlabels';
import { OrgCheckDatasetObject } from '../dataset/orgcheck-api-dataset-object';
import { OrgCheckDatasetObjectPermissions } from '../dataset/orgcheck-api-dataset-objectpermissions';
import { OrgCheckDatasetAppPermissions } from '../dataset/orgcheck-api-dataset-apppermissions';
import { OrgCheckDatasetObjects } from '../dataset/orgcheck-api-dataset-objects';
import { OrgCheckDatasetObjectTypes } from '../dataset/orgcheck-api-dataset-objecttypes';
import { OrgCheckDatasetOrganization } from '../dataset/orgcheck-api-dataset-organization';
import { OrgCheckDatasetCurrentUserPermissions } from '../dataset/orgcheck-api-dataset-currentuserpermissions';
import { OrgCheckDatasetPackages } from '../dataset/orgcheck-api-dataset-packages';
import { OrgCheckDatasetPermissionSets } from '../dataset/orgcheck-api-dataset-permissionsets';
import { OrgCheckDatasetProfiles } from '../dataset/orgcheck-api-dataset-profiles';
import { OrgCheckDatasetProfileRestrictions } from '../dataset/orgcheck-api-dataset-profilerestrictions';
import { OrgCheckDatasetProfilePasswordPolicies } from '../dataset/orgcheck-api-dataset-profilepasswordpolicies';
import { OrgCheckDatasetUsers } from '../dataset/orgcheck-api-dataset-users';
import { OrgCheckDatasetVisualForcePages } from '../dataset/orgcheck-api-dataset-visualforcepages';
import { OrgCheckDatasetVisualForceComponents } from '../dataset/orgcheck-api-dataset-visualforcecomponents';
import { OrgCheckDatasetLightningAuraComponents } from '../dataset/orgcheck-api-dataset-lighntingauracomponents';
import { OrgCheckDatasetLightningWebComponents } from '../dataset/orgcheck-api-dataset-lighntingwebcomponents';
import { OrgCheckDatasetLightningPages } from '../dataset/orgcheck-api-dataset-lighntingpages';
import { OrgCheckDatasetGroups } from '../dataset/orgcheck-api-dataset-groups';
import { OrgCheckDatasetApexClasses } from '../dataset/orgcheck-api-dataset-apexclasses';
import { OrgCheckDatasetApexTriggers } from '../dataset/orgcheck-api-dataset-apextriggers';
import { OrgCheckDatasetUserRoles } from '../dataset/orgcheck-api-dataset-userroles';
import { OrgCheckDatasetFlows } from '../dataset/orgcheck-api-dataset-flows';
import { OrgCheckDatasetWorkflows } from '../dataset/orgcheck-api-dataset-workflows';
import { OrgCheckDataset } from './orgcheck-api-dataset';

/**
 * @description Dataset Run Information
 */
export class OrgCheckDatasetRunInformation {
    
    /**
     * @type {string}
     * @public
     */
    alias;

    /**
     * @type {string}
     * @public
     */
    cacheKey;

    /**
     * @type {Map}
     * @public
     */
    parameters;
    
    /**
     * @description Constructor
     * @param {string} alias 
     * @param {string} cacheKey 
     */
    constructor(alias, cacheKey) {
        this.alias = alias;
        this.cacheKey = cacheKey;
        this.parameters = new Map();
    }
}

/**
 * @description Dataset aliases
 */
export const OrgCheckDatasetAliases = {
    CUSTOMFIELDS: 'custom-fields',
    CUSTOMLABELS: 'custom-labels',
    OBJECT: 'object',
    OBJECTPERMISSIONS: 'object-permissions',
    APPPERMISSIONS: 'app-permisions',
    OBJECTS: 'objects',
    OBJECTTYPES: 'object-types',
    ORGANIZATION: 'org-information',
    CURRENTUSERPERMISSIONS: 'current-user-permissions',
    PACKAGES: 'packages',
    PERMISSIONSETS: 'permission-sets',
    PROFILES: 'profiles',
    PROFILERESTRICTIONS: 'profile-restrictions',
    PROFILEPWDPOLICY: 'profile-password-policies',
    USERS: 'users',
    VISUALFORCEPAGES: 'visual-force-pages',
    VISUALFORCEOMPONENTS: 'visual-force-components',
    LIGHTNINGAURACOMPONENTS: 'lightning-aura-components',
    LIGHTNINGWEBCOMPONENTS: 'lightning-web-components',
    LIGHTNINGPAGES: 'lightning-pages',
    GROUPS: 'groups',
    APEXCLASSES: 'apex-classes',
    APEXTRIGGERS: 'apex-triggers',
    USERROLES: 'user-roles',
    FLOWS: 'flows',
    WORKFLOWS: 'workflows'
}

/**
 * @description Dataset manager
 */
export class OrgCheckDatasetManager {
    
    /**
     * @description List of datasets
     * @type {Map<string, OrgCheckDataset>} 
     * @private
     */
    private_datasets;

    /**
     * @description Cache manager
     * @type {OrgCheckDataCacheManager}
     * @private
     */
    private_cache;

    /**
     * @description Salesforce manager
     * @type {OrgCheckSalesforceManager}
     * @private
     */
    private_sfdcManager;

    /**
     * @description Logger
     * @type {OrgCheckLogger}
     * @private
     */
    private_logger;

    /**
     * @description Data factory
     * @type {OrgCheckDataFactory}
     * @private
     */
    private_dataFactory;

    /**
     * @description Dataset Manager constructor
     * @param {OrgCheckSalesforceManager} sfdcManager 
     * @param {{unzlibSync: (data: Uint8Array) => Uint8Array, zlibSync: (data: Uint8Array, opts?: any) => Uint8Array}} jsCompression
     * @param {OrgCheckLogger} logger
     * @public
     */
    constructor(sfdcManager, jsCompression, logger) {
        
        if (sfdcManager instanceof OrgCheckSalesforceManager === false) {
            throw new TypeError('The given logger is not an instance of OrgCheckSalesforceManager.');
        }
        if (logger instanceof OrgCheckLogger === false) {
            throw new TypeError('The given logger is not an instance of OrgCheckLogger.');
        }
        
        this.private_sfdcManager = sfdcManager;
        this.private_logger = logger;
        this.private_datasets = new Map();
        this.private_dataFactory = new OrgCheckDataFactory(sfdcManager);
        this.private_cache = new OrgCheckDataCacheManager({
            compress:   (data) => { return jsCompression.zlibSync(data, { level: 9 }); },
            decompress: (data) => { return jsCompression.unzlibSync(data); }
        });

        this.private_datasets.set(OrgCheckDatasetAliases.CUSTOMFIELDS, new OrgCheckDatasetCustomFields());
        this.private_datasets.set(OrgCheckDatasetAliases.CUSTOMLABELS, new OrgCheckDatasetCustomLabels());
        this.private_datasets.set(OrgCheckDatasetAliases.OBJECT, new OrgCheckDatasetObject());
        this.private_datasets.set(OrgCheckDatasetAliases.OBJECTPERMISSIONS, new OrgCheckDatasetObjectPermissions());
        this.private_datasets.set(OrgCheckDatasetAliases.APPPERMISSIONS, new OrgCheckDatasetAppPermissions());
        this.private_datasets.set(OrgCheckDatasetAliases.OBJECTS, new OrgCheckDatasetObjects());
        this.private_datasets.set(OrgCheckDatasetAliases.OBJECTTYPES, new OrgCheckDatasetObjectTypes());
        this.private_datasets.set(OrgCheckDatasetAliases.ORGANIZATION, new OrgCheckDatasetOrganization());
        this.private_datasets.set(OrgCheckDatasetAliases.CURRENTUSERPERMISSIONS, new OrgCheckDatasetCurrentUserPermissions());
        this.private_datasets.set(OrgCheckDatasetAliases.PACKAGES, new OrgCheckDatasetPackages());
        this.private_datasets.set(OrgCheckDatasetAliases.PERMISSIONSETS, new OrgCheckDatasetPermissionSets());
        this.private_datasets.set(OrgCheckDatasetAliases.PROFILES, new OrgCheckDatasetProfiles());
        this.private_datasets.set(OrgCheckDatasetAliases.PROFILERESTRICTIONS, new OrgCheckDatasetProfileRestrictions());
        this.private_datasets.set(OrgCheckDatasetAliases.PROFILEPWDPOLICY, new OrgCheckDatasetProfilePasswordPolicies());
        this.private_datasets.set(OrgCheckDatasetAliases.USERS, new OrgCheckDatasetUsers());
        this.private_datasets.set(OrgCheckDatasetAliases.VISUALFORCEPAGES, new OrgCheckDatasetVisualForcePages());
        this.private_datasets.set(OrgCheckDatasetAliases.VISUALFORCEOMPONENTS, new OrgCheckDatasetVisualForceComponents());
        this.private_datasets.set(OrgCheckDatasetAliases.LIGHTNINGAURACOMPONENTS, new OrgCheckDatasetLightningAuraComponents());
        this.private_datasets.set(OrgCheckDatasetAliases.LIGHTNINGWEBCOMPONENTS, new OrgCheckDatasetLightningWebComponents());
        this.private_datasets.set(OrgCheckDatasetAliases.LIGHTNINGPAGES, new OrgCheckDatasetLightningPages());
        this.private_datasets.set(OrgCheckDatasetAliases.GROUPS, new OrgCheckDatasetGroups());
        this.private_datasets.set(OrgCheckDatasetAliases.APEXCLASSES, new OrgCheckDatasetApexClasses());
        this.private_datasets.set(OrgCheckDatasetAliases.APEXTRIGGERS, new OrgCheckDatasetApexTriggers());
        this.private_datasets.set(OrgCheckDatasetAliases.USERROLES, new OrgCheckDatasetUserRoles());
        this.private_datasets.set(OrgCheckDatasetAliases.FLOWS, new OrgCheckDatasetFlows());
        this.private_datasets.set(OrgCheckDatasetAliases.WORKFLOWS, new OrgCheckDatasetWorkflows());
    }

    /**
     * @description Run the given list of datasets and return them as a result
     * @param {Array<string | OrgCheckDatasetRunInformation>} datasets 
     * @returns Map
     * @public
     * @async
     */
    async run(datasets) {
        if (datasets instanceof Array === false) {
            throw new TypeError('The given datasets is not an instance of Array.');
        }
        return new Map((await Promise.all(datasets.map((dataset) => {
            const alias      = (typeof dataset === 'string' ? dataset : dataset.alias);
            const cacheKey   = (typeof dataset === 'string' ? dataset : dataset.cacheKey);
            const parameters = (typeof dataset === 'string' ? undefined : dataset.parameters);
            const section = `DATASET ${alias}`;
            return new Promise((resolve, reject) => {
                this.private_logger.sectionContinues(section, `Checking the cache for key=${cacheKey}...`);
                // Check cache if any
                if (this.private_cache.has(cacheKey) === true) {
                    // Set the results from cache
                    this.private_logger.sectionEnded(section, 'There was data in cache, we use it!');
                    // Return the key/alias and value from the cache
                    resolve([ alias, this.private_cache.get(cacheKey) ]);
                    // Stop there
                    return;
                }
                this.private_logger.sectionContinues(section, 'There was no data in cache. Let\'s retrieve data.');
                // Calling the retriever
                this.private_datasets.get(alias).run(
                    // sfdc manager
                    this.private_sfdcManager,
                    // data factory
                    this.private_dataFactory,
                    // local logger
                    { log: (msg) => { this.private_logger.sectionContinues(section, msg); }},
                    // Send any parameters if needed
                    parameters
                ).then((data) => {
                    // Cache the data (if possible and not too big)
                    this.private_cache.set(cacheKey, data); 
                    // Some logs
                    this.private_logger.sectionEnded(section, `Data retrieved and saved in cache with key=${cacheKey}`);
                    // Return the key/alias and value from the cache
                    resolve([ alias, data ]);
                }).catch((error) => {
                    // Reject with this error
                    this.private_logger.sectionFailed(section, error);
                    reject(error);
                });
            });
        }))));
    }

    /**
     * @description Clean the given list of datasets from cache (if present)
     * @param {Array<string | OrgCheckDatasetRunInformation>} datasets 
     * @public
     */
    clean(datasets) {
        if (datasets instanceof Array === false) {
            throw new TypeError('The given datasets is not an instance of Array.');
        }
        datasets.forEach((dataset) => {
            const cacheKey = (typeof dataset === 'string' ? dataset : dataset.cacheKey);
            this.private_cache.remove(cacheKey);
        });
    }

    /**
     * @description Get all the details from the inner cache manager
     * @public
     */
    getCacheInformation() {
        return this.private_cache.details();
    }

    /**
     * @description Removes a specific item from the inner cache manager
     * @param {string} name 
     * @public
     */
    removeCache(name) {
        this.private_cache.remove(name);
    }

    /**
     * @description Removes all items from the inner cache manager
     * @public
     */
    removeAllCache() {
        this.private_cache.clear();
    }

    /**
     * @description Get the validation rule given its id
     * @param {number} id
     * @returns {OrgCheckValidationRule}
     * @public
     */
    getValidationRule(id) {
        return this.private_dataFactory.getValidationRule(id);
    }
 }