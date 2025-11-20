import { DataCacheManagerIntf } from './orgcheck-api-cachemanager';
import { DataFactory } from './orgcheck-api-datafactory-impl';
import { DataFactoryIntf } from './orgcheck-api-datafactory';
import { Dataset } from './orgcheck-api-dataset';
import { DatasetAliases } from './orgcheck-api-datasets-aliases';
import { DatasetApexClasses } from '../dataset/orgcheck-api-dataset-apexclasses';
import { DatasetApexTriggers } from '../dataset/orgcheck-api-dataset-apextriggers';
import { DatasetApplications } from '../dataset/orgcheck-api-dataset-applications';
import { DatasetAppPermissions } from '../dataset/orgcheck-api-dataset-apppermissions';
import { DatasetBrowsers } from '../dataset/orgcheck-api-dataset-browsers';
import { DatasetCollaborationGroups } from '../dataset/orgcheck-api-dataset-collaborationgroups';
import { DatasetCurrentUserPermissions } from '../dataset/orgcheck-api-dataset-currentuserpermissions';
import { DatasetCustomFields } from '../dataset/orgcheck-api-dataset-customfields';
import { DatasetCustomLabels } from '../dataset/orgcheck-api-dataset-customlabels';
import { DatasetCustomTabs } from '../dataset/orgcheck-api-dataset-customtabs';
import { DatasetDashboards } from '../dataset/orgcheck-api-dataset-dashboards';
import { DatasetDocuments } from '../dataset/orgcheck-api-dataset-documents';
import { DatasetEmailTemplates } from '../dataset/orgcheck-api-dataset-emailtemplates';
import { DatasetFieldPermissions } from '../dataset/orgcheck-api-dataset-fieldpermissions';
import { DatasetFlows } from '../dataset/orgcheck-api-dataset-flows';
import { DatasetGroups } from '../dataset/orgcheck-api-dataset-groups';
import { DatasetHomePageComponents } from '../dataset/orgcheck-api-dataset-homepagecomponents';
import { DatasetInternalActiveUsers } from '../dataset/orgcheck-api-dataset-internalactiveusers';
import { DatasetKnowledgeArticles } from '../dataset/orgcheck-api-dataset-knowledgearticles';
import { DatasetLightningAuraComponents } from '../dataset/orgcheck-api-dataset-lighntingauracomponents';
import { DatasetLightningPages } from '../dataset/orgcheck-api-dataset-lighntingpages';
import { DatasetLightningWebComponents } from '../dataset/orgcheck-api-dataset-lighntingwebcomponents';
import { DatasetManagerIntf } from './orgcheck-api-datasetmanager';
import { DatasetObject } from '../dataset/orgcheck-api-dataset-object';
import { DatasetObjectPermissions } from '../dataset/orgcheck-api-dataset-objectpermissions';
import { DatasetObjects } from '../dataset/orgcheck-api-dataset-objects';
import { DatasetObjectTypes } from '../dataset/orgcheck-api-dataset-objecttypes';
import { DatasetOrganization } from '../dataset/orgcheck-api-dataset-organization';
import { DatasetPackages } from '../dataset/orgcheck-api-dataset-packages';
import { DatasetPageLayouts } from '../dataset/orgcheck-api-dataset-pagelayouts';
import { DatasetPermissionSetLicenses } from '../dataset/orgcheck-api-dataset-permissionsetlicenses';
import { DatasetPermissionSets } from '../dataset/orgcheck-api-dataset-permissionsets';
import { DatasetProfilePasswordPolicies } from '../dataset/orgcheck-api-dataset-profilepasswordpolicies';
import { DatasetProfileRestrictions } from '../dataset/orgcheck-api-dataset-profilerestrictions';
import { DatasetProfiles } from '../dataset/orgcheck-api-dataset-profiles';
import { DatasetRecordTypes } from '../dataset/orgcheck-api-dataset-recordtypes';
import { DatasetReports } from '../dataset/orgcheck-api-dataset-reports';
import { DatasetRunInformation } from './orgcheck-api-dataset-runinformation';
import { DatasetStaticResources } from '../dataset/orgcheck-api-dataset-staticresources';
import { DatasetUserRoles } from '../dataset/orgcheck-api-dataset-userroles';
import { DatasetValidationRules } from '../dataset/orgcheck-api-dataset-validationrules';
import { DatasetVisualForceComponents } from '../dataset/orgcheck-api-dataset-visualforcecomponents';
import { DatasetVisualForcePages } from '../dataset/orgcheck-api-dataset-visualforcepages';
import { DatasetWeblinks } from '../dataset/orgcheck-api-dataset-weblinks';
import { DatasetWorkflows } from '../dataset/orgcheck-api-dataset-workflows';
import { LoggerIntf } from './orgcheck-api-logger';
import { SalesforceManagerIntf } from './orgcheck-api-salesforcemanager';

/**
 * @description Dataset manager
 */
export class DatasetManager extends DatasetManagerIntf {
    
    /**
     * @description List of datasets
     * @type {Map<string, Dataset>} 
     * @private
     */
    _datasets;

    /**
     * @description Datasets promise cache
     * @type {Map<string, Promise<Array<any>>>}
     * @private
     */
    _datasetPromisesCache;

    /**
     * @description Data cache manager
     * @type {DataCacheManagerIntf}
     * @private
     */
    _dataCache;

    /**
     * @description Salesforce manager
     * @type {SalesforceManagerIntf}
     * @private
     */
    _sfdcManager;

    /**
     * @description Logger
     * @type {LoggerIntf}
     * @private
     */
    _logger;

    /**
     * @description Data factory
     * @type {DataFactoryIntf}}
     * @private
     */
    _dataFactory;

    /**
     * @description Dataset Manager constructor
     * @param {SalesforceManagerIntf} sfdcManager - The instance of the salesforce manager
     * @param {DataCacheManagerIntf} cacheManager - The instance of the cache manager
     * @param {LoggerIntf} logger - The instance of the logger
     * @public
     */
    constructor(sfdcManager, cacheManager, logger) {
        super();
        
        if (sfdcManager instanceof SalesforceManagerIntf === false) {
            throw new TypeError('The given sfdcManager is not an instance of SalesforceManagerIntf.');
        }
        if (logger instanceof LoggerIntf === false) {
            throw new TypeError('The given logger is not an instance of LoggerIntf.');
        }
        
        this._sfdcManager = sfdcManager;
        this._logger = logger;
        this._dataCache = cacheManager;
        this._datasets = new Map();
        this._datasetPromisesCache = new Map();
        this._dataFactory = new DataFactory();

        this._datasets.set(DatasetAliases.APEXCLASSES, new DatasetApexClasses());
        this._datasets.set(DatasetAliases.APEXTRIGGERS, new DatasetApexTriggers());
        this._datasets.set(DatasetAliases.APPLICATIONS, new DatasetApplications());
        this._datasets.set(DatasetAliases.APPPERMISSIONS, new DatasetAppPermissions());
        this._datasets.set(DatasetAliases.BROWSERS, new DatasetBrowsers());
        this._datasets.set(DatasetAliases.CURRENTUSERPERMISSIONS, new DatasetCurrentUserPermissions());
        this._datasets.set(DatasetAliases.CUSTOMFIELDS, new DatasetCustomFields());
        this._datasets.set(DatasetAliases.CUSTOMLABELS, new DatasetCustomLabels());
        this._datasets.set(DatasetAliases.CUSTOMTABS, new DatasetCustomTabs());
        this._datasets.set(DatasetAliases.COLLABORATIONGROUPS, new DatasetCollaborationGroups());
        this._datasets.set(DatasetAliases.DASHBOARDS, new DatasetDashboards());
        this._datasets.set(DatasetAliases.DOCUMENTS, new DatasetDocuments());
        this._datasets.set(DatasetAliases.EMAILTEMPLATES, new DatasetEmailTemplates());
        this._datasets.set(DatasetAliases.FIELDPERMISSIONS, new DatasetFieldPermissions());
        this._datasets.set(DatasetAliases.FLOWS, new DatasetFlows());
        this._datasets.set(DatasetAliases.PUBLIC_GROUPS_AND_QUEUES, new DatasetGroups());
        this._datasets.set(DatasetAliases.HOMEPAGECOMPONENTS, new DatasetHomePageComponents());
        this._datasets.set(DatasetAliases.KNOWLEDGEARTICLES, new DatasetKnowledgeArticles());
        this._datasets.set(DatasetAliases.LIGHTNINGAURACOMPONENTS, new DatasetLightningAuraComponents());
        this._datasets.set(DatasetAliases.LIGHTNINGPAGES, new DatasetLightningPages());
        this._datasets.set(DatasetAliases.LIGHTNINGWEBCOMPONENTS, new DatasetLightningWebComponents());
        this._datasets.set(DatasetAliases.OBJECT, new DatasetObject());
        this._datasets.set(DatasetAliases.OBJECTPERMISSIONS, new DatasetObjectPermissions());
        this._datasets.set(DatasetAliases.OBJECTS, new DatasetObjects());
        this._datasets.set(DatasetAliases.OBJECTTYPES, new DatasetObjectTypes());
        this._datasets.set(DatasetAliases.ORGANIZATION, new DatasetOrganization());
        this._datasets.set(DatasetAliases.PACKAGES, new DatasetPackages());
        this._datasets.set(DatasetAliases.PAGELAYOUTS, new DatasetPageLayouts());
        this._datasets.set(DatasetAliases.PERMISSIONSETS, new DatasetPermissionSets());
        this._datasets.set(DatasetAliases.PERMISSIONSETLICENSES, new DatasetPermissionSetLicenses());
        this._datasets.set(DatasetAliases.PROFILEPWDPOLICIES, new DatasetProfilePasswordPolicies());
        this._datasets.set(DatasetAliases.PROFILERESTRICTIONS, new DatasetProfileRestrictions());
        this._datasets.set(DatasetAliases.PROFILES, new DatasetProfiles());
        this._datasets.set(DatasetAliases.RECORDTYPES, new DatasetRecordTypes());
        this._datasets.set(DatasetAliases.REPORTS, new DatasetReports());
        this._datasets.set(DatasetAliases.STATICRESOURCES, new DatasetStaticResources());
        this._datasets.set(DatasetAliases.USERROLES, new DatasetUserRoles());
        this._datasets.set(DatasetAliases.INTERNALACTIVEUSERS, new DatasetInternalActiveUsers());
        this._datasets.set(DatasetAliases.VALIDATIONRULES, new DatasetValidationRules());
        this._datasets.set(DatasetAliases.VISUALFORCECOMPONENTS, new DatasetVisualForceComponents());
        this._datasets.set(DatasetAliases.VISUALFORCEPAGES, new DatasetVisualForcePages());
        this._datasets.set(DatasetAliases.WEBLINKS, new DatasetWeblinks());
        this._datasets.set(DatasetAliases.WORKFLOWS, new DatasetWorkflows());
    }

    /**
     * @description Run the given list of datasets and return them as a result
     * @param {Array<string | DatasetRunInformation>} datasets - The list of datasets to run
     * @returns {Promise<Map<string, any>>} Returns the result 
     * @public
     * @async
     */
    async run(datasets) {
        if (datasets instanceof Array === false) {
            throw new TypeError('The given datasets is not an instance of Array.');
        }
        /** @type {Array<any>} */
        const data = await Promise.all(datasets.map((dataset) => {
            const alias      = (typeof dataset === 'string' ? dataset : dataset.alias);
            const cacheKey   = (typeof dataset === 'string' ? dataset : dataset.cacheKey);
            const parameters = (typeof dataset === 'string' ? undefined : dataset.parameters);
            const section = `Run dataset "${alias}"`;
            if (this._datasetPromisesCache.has(cacheKey) === false) {
                this._datasetPromisesCache.set(cacheKey, new Promise((resolve, reject) => {
                    this._logger.log(section, `Checking the data cache for key=${cacheKey}...`);
                    // Get data cache if any
                    const dataFromCache = this._dataCache.get(cacheKey);
                    if (dataFromCache) {
                        // Set the results from data cache
                        this._logger.ended(section, 'There was data in data cache, we use it!');
                        // Return the key/alias and value from the data cache
                        resolve([ alias, dataFromCache ]); // when data comes from cache instanceof won't work! (keep that in mind)
                    } else {
                        this._logger.log(section, `There was no data in data cache. Let's retrieve data.`);
                        // Calling the retriever
                        this._datasets.get(alias).run(
                            this._sfdcManager, // sfdc manager
                            this._dataFactory, // data factory
                            this._logger.toSimpleLogger(section), // local logger
                            parameters // Send any parameters if needed
                        ).then((data) => {
                            // Cache the data (if possible and not too big)
                            this._dataCache.set(cacheKey, data); 
                            // Some logs
                            this._logger.ended(section, `Data retrieved and saved in cache with key=${cacheKey}`);
                            // Return the key/alias and value from the cache
                            resolve([ alias, data ]);
                        }).catch((/** @type {Error} */ error) => {
                            // Reject with this error
                            this._logger.failed(section, error);
                            reject({ dataset: alias, cause: error });
                        });
                    }
                }));
            }
            return this._datasetPromisesCache.get(cacheKey);
        }));
        return new Map(data);
    }

    /**
     * @description Clean the given list of datasets from cache (if present)
     * @param {Array<string | DatasetRunInformation>} datasets - The list of datasets to clean
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
}