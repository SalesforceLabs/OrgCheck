import { OrgCheckLoggerIntf } from './orgcheck-api-logger';
import { OrgCheckDataCacheManagerIntf } from './orgcheck-api-cachemanager';
import { OrgCheckSalesforceManagerIntf } from './orgcheck-api-salesforcemanager';
import { OrgCheckDataFactoryIntf, OrgCheckValidationRule } from './orgcheck-api-datafactory';
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
import { OrgCheckDatasetRunInformation } from './orgcheck-api-dataset-runinformation';
import { OrgCheckDataFactory } from './orgcheck-api-datafactory-impl';
import { OrgCheckDatasetAliases } from './orgcheck-api-datasets-aliases';
import { OrgCheckDatasetManagerIntf } from './orgcheck-api-datasetmanager';
import { OrgCheckDatasetApplications } from '../dataset/orgcheck-api-dataset-applications';
import { OrgCheckDatasetFieldPermissions } from '../dataset/orgcheck-api-dataset-fieldpermissions';
import { OrgCheckDatasetValidationRules } from '../dataset/orgcheck-api-dataset-validationrules';

/**
 * @description Dataset manager
 */
export class OrgCheckDatasetManager extends OrgCheckDatasetManagerIntf {
    
    /**
     * @description List of datasets
     * @type {Map<string, OrgCheckDataset>} 
     * @private
     */
    _datasets;

    /**
     * @description Datasets promise cache
     * @type {Map<string, Promise>}
     * @private
     */
    _datasetPromisesCache;

    /**
     * @description Data cache manager
     * @type {OrgCheckDataCacheManagerIntf}
     * @private
     */
    _dataCache;

    /**
     * @description Salesforce manager
     * @type {OrgCheckSalesforceManagerIntf}
     * @private
     */
    _sfdcManager;

    /**
     * @description Logger
     * @type {OrgCheckLoggerIntf}
     * @private
     */
    _logger;

    /**
     * @description Data factory
     * @type {OrgCheckDataFactoryIntf}}
     * @private
     */
    _dataFactory;

    /**
     * @description Dataset Manager constructor
     * @param {OrgCheckSalesforceManagerIntf} sfdcManager 
     * @param {OrgCheckDataCacheManagerIntf} cacheManager
     * @param {OrgCheckLoggerIntf} logger
     * @public
     */
    constructor(sfdcManager, cacheManager, logger) {
        super();
        
        if (sfdcManager instanceof OrgCheckSalesforceManagerIntf === false) {
            throw new TypeError('The given sfdcManager is not an instance of OrgCheckSalesforceManagerIntf.');
        }
        if (logger instanceof OrgCheckLoggerIntf === false) {
            throw new TypeError('The given logger is not an instance of OrgCheckLoggerIntf.');
        }
        
        this._sfdcManager = sfdcManager;
        this._logger = logger;
        this._dataCache = cacheManager;
        this._datasets = new Map();
        this._datasetPromisesCache = new Map();
        this._dataFactory = new OrgCheckDataFactory(sfdcManager);

        this._datasets.set(OrgCheckDatasetAliases.APEXCLASSES, new OrgCheckDatasetApexClasses());
        this._datasets.set(OrgCheckDatasetAliases.APEXTRIGGERS, new OrgCheckDatasetApexTriggers());
        this._datasets.set(OrgCheckDatasetAliases.APPLICATIONS, new OrgCheckDatasetApplications());
        this._datasets.set(OrgCheckDatasetAliases.APPPERMISSIONS, new OrgCheckDatasetAppPermissions());
        this._datasets.set(OrgCheckDatasetAliases.CURRENTUSERPERMISSIONS, new OrgCheckDatasetCurrentUserPermissions());
        this._datasets.set(OrgCheckDatasetAliases.CUSTOMFIELDS, new OrgCheckDatasetCustomFields());
        this._datasets.set(OrgCheckDatasetAliases.CUSTOMLABELS, new OrgCheckDatasetCustomLabels());
        this._datasets.set(OrgCheckDatasetAliases.FIELDPERMISSIONS, new OrgCheckDatasetFieldPermissions());
        this._datasets.set(OrgCheckDatasetAliases.FLOWS, new OrgCheckDatasetFlows());
        this._datasets.set(OrgCheckDatasetAliases.GROUPS, new OrgCheckDatasetGroups());
        this._datasets.set(OrgCheckDatasetAliases.LIGHTNINGAURACOMPONENTS, new OrgCheckDatasetLightningAuraComponents());
        this._datasets.set(OrgCheckDatasetAliases.LIGHTNINGPAGES, new OrgCheckDatasetLightningPages());
        this._datasets.set(OrgCheckDatasetAliases.LIGHTNINGWEBCOMPONENTS, new OrgCheckDatasetLightningWebComponents());
        this._datasets.set(OrgCheckDatasetAliases.OBJECT, new OrgCheckDatasetObject());
        this._datasets.set(OrgCheckDatasetAliases.OBJECTPERMISSIONS, new OrgCheckDatasetObjectPermissions());
        this._datasets.set(OrgCheckDatasetAliases.OBJECTS, new OrgCheckDatasetObjects());
        this._datasets.set(OrgCheckDatasetAliases.OBJECTTYPES, new OrgCheckDatasetObjectTypes());
        this._datasets.set(OrgCheckDatasetAliases.ORGANIZATION, new OrgCheckDatasetOrganization());
        this._datasets.set(OrgCheckDatasetAliases.PACKAGES, new OrgCheckDatasetPackages());
        this._datasets.set(OrgCheckDatasetAliases.PERMISSIONSETS, new OrgCheckDatasetPermissionSets());
        this._datasets.set(OrgCheckDatasetAliases.PROFILEPWDPOLICIES, new OrgCheckDatasetProfilePasswordPolicies());
        this._datasets.set(OrgCheckDatasetAliases.PROFILERESTRICTIONS, new OrgCheckDatasetProfileRestrictions());
        this._datasets.set(OrgCheckDatasetAliases.PROFILES, new OrgCheckDatasetProfiles());
        this._datasets.set(OrgCheckDatasetAliases.USERROLES, new OrgCheckDatasetUserRoles());
        this._datasets.set(OrgCheckDatasetAliases.USERS, new OrgCheckDatasetUsers());
        this._datasets.set(OrgCheckDatasetAliases.VALIDATIONRULES, new OrgCheckDatasetValidationRules());
        this._datasets.set(OrgCheckDatasetAliases.VISUALFORCECOMPONENTS, new OrgCheckDatasetVisualForceComponents());
        this._datasets.set(OrgCheckDatasetAliases.VISUALFORCEPAGES, new OrgCheckDatasetVisualForcePages());
        this._datasets.set(OrgCheckDatasetAliases.WORKFLOWS, new OrgCheckDatasetWorkflows());
    }

    /**
     * @description Run the given list of datasets and return them as a result
     * @param {Array<string | OrgCheckDatasetRunInformation>} datasets 
     * @returns {Promise<Map>}
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
            if (this._datasetPromisesCache.has(cacheKey) === false) {
                this._datasetPromisesCache.set(cacheKey, new Promise((resolve, reject) => {
                    this._logger.log(section, `Checking the data cache for key=${cacheKey}...`);
                    // Check data cache if any
                    if (this._dataCache.has(cacheKey) === true) {
                        // Set the results from data cache
                        this._logger.ended(section, 'There was data in data cache, we use it!');
                        // Return the key/alias and value from the data cache
                        resolve([ alias, this._dataCache.get(cacheKey) ]); // when data comes from cache instanceof won't work! (keep that in mind)
                    } else {
                        this._logger.log(section, `There was no data in data cache. Let's retrieve data.`);
                        // Calling the retriever
                        this._datasets.get(alias).run(
                            // sfdc manager
                            this._sfdcManager,
                            // data factory
                            this._dataFactory,
                            // local logger
                            this._logger.toSimpleLogger(section),
                            // Send any parameters if needed
                            parameters
                        ).then((data) => {
                            // Cache the data (if possible and not too big)
                            this._dataCache.set(cacheKey, data); 
                            // Some logs
                            this._logger.ended(section, `Data retrieved and saved in cache with key=${cacheKey}`);
                            // Return the key/alias and value from the cache
                            resolve([ alias, data ]);
                        }).catch((error) => {
                            // Reject with this error
                            this._logger.failed(section, error);
                            reject(error);
                        });
                    }
                }));
            }
            return this._datasetPromisesCache.get(cacheKey);
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
            this._dataCache.remove(cacheKey);
            this._datasetPromisesCache.delete(cacheKey);
        });
    }

    /**
     * @description Get the validation rule given its id
     * @param {number} id
     * @returns {OrgCheckValidationRule}
     * @public
     */
    getValidationRule(id) {
        return this._dataFactory.getValidationRule(id);
    }
 }