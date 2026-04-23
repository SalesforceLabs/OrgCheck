import { DataCacheManagerIntf } from 'src/api/core/cache/orgcheck-api-cachemanager';
import { DataFactory } from 'src/api/core/data/orgcheck-api-datafactory-impl';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { DatasetApexClasses } from 'src/api/dataset/orgcheck-api-dataset-apexclasses';
import { DatasetApexTriggers } from 'src/api/dataset/orgcheck-api-dataset-apextriggers';
import { DatasetApplications } from 'src/api/dataset/orgcheck-api-dataset-applications';
import { DatasetAppPermissions } from 'src/api/dataset/orgcheck-api-dataset-apppermissions';
import { DatasetBrowsers } from 'src/api/dataset/orgcheck-api-dataset-browsers';
import { DatasetCollaborationGroups } from 'src/api/dataset/orgcheck-api-dataset-collaborationgroups';
import { DatasetCurrentUserPermissions } from 'src/api/dataset/orgcheck-api-dataset-currentuserpermissions';
import { DatasetCustomFields } from 'src/api/dataset/orgcheck-api-dataset-customfields';
import { DatasetCustomLabels } from 'src/api/dataset/orgcheck-api-dataset-customlabels';
import { DatasetCustomTabs } from 'src/api/dataset/orgcheck-api-dataset-customtabs';
import { DatasetDashboards } from 'src/api/dataset/orgcheck-api-dataset-dashboards';
import { DatasetDocuments } from 'src/api/dataset/orgcheck-api-dataset-documents';
import { DatasetEmailTemplates } from 'src/api/dataset/orgcheck-api-dataset-emailtemplates';
import { DatasetFieldPermissions } from 'src/api/dataset/orgcheck-api-dataset-fieldpermissions';
import { DatasetFlows } from 'src/api/dataset/orgcheck-api-dataset-flows';
import { DatasetGroups } from 'src/api/dataset/orgcheck-api-dataset-groups';
import { DatasetHomePageComponents } from 'src/api/dataset/orgcheck-api-dataset-homepagecomponents';
import { DatasetInternalActiveUsers } from 'src/api/dataset/orgcheck-api-dataset-internalactiveusers';
import { DatasetKnowledgeArticles } from 'src/api/dataset/orgcheck-api-dataset-knowledgearticles';
import { DatasetLightningAuraComponents } from 'src/api/dataset/orgcheck-api-dataset-lightningauracomponents';
import { DatasetLightningPages } from 'src/api/dataset/orgcheck-api-dataset-lightningpages';
import { DatasetLightningWebComponents } from 'src/api/dataset/orgcheck-api-dataset-lightningwebcomponents';
import { DatasetManagerIntf, DatasetManagerError } from 'src/api/core/dataset/orgcheck-api-datasetmanager';
import { DatasetObject } from 'src/api/dataset/orgcheck-api-dataset-object';
import { DatasetObjectPermissions } from 'src/api/dataset/orgcheck-api-dataset-objectpermissions';
import { DatasetObjects } from 'src/api/dataset/orgcheck-api-dataset-objects';
import { DatasetObjectTypes } from 'src/api/dataset/orgcheck-api-dataset-objecttypes';
import { DatasetOrganization } from 'src/api/dataset/orgcheck-api-dataset-organization';
import { DatasetPackages } from 'src/api/dataset/orgcheck-api-dataset-packages';
import { DatasetPageLayouts } from 'src/api/dataset/orgcheck-api-dataset-pagelayouts';
import { DatasetPermissionSetLicenses } from 'src/api/dataset/orgcheck-api-dataset-permissionsetlicenses';
import { DatasetPermissionSets } from 'src/api/dataset/orgcheck-api-dataset-permissionsets';
import { DatasetProfilePasswordPolicies } from 'src/api/dataset/orgcheck-api-dataset-profilepasswordpolicies';
import { DatasetProfileRestrictions } from 'src/api/dataset/orgcheck-api-dataset-profilerestrictions';
import { DatasetProfiles } from 'src/api/dataset/orgcheck-api-dataset-profiles';
import { DatasetRecordTypes } from 'src/api/dataset/orgcheck-api-dataset-recordtypes';
import { DatasetReleaseUpdates } from 'src/api/dataset/orgcheck-api-dataset-releaseupdates';
import { DatasetReports } from 'src/api/dataset/orgcheck-api-dataset-reports';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetStaticResources } from 'src/api/dataset/orgcheck-api-dataset-staticresources';
import { DatasetUserRoles } from 'src/api/dataset/orgcheck-api-dataset-userroles';
import { DatasetValidationRules } from 'src/api/dataset/orgcheck-api-dataset-validationrules';
import { DatasetVisualForceComponents } from 'src/api/dataset/orgcheck-api-dataset-visualforcecomponents';
import { DatasetVisualForcePages } from 'src/api/dataset/orgcheck-api-dataset-visualforcepages';
import { DatasetSharingRules } from 'src/api/dataset/orgcheck-api-dataset-sharingrules';
import { DatasetWeblinks } from 'src/api/dataset/orgcheck-api-dataset-weblinks';
import { DatasetWorkflows } from 'src/api/dataset/orgcheck-api-dataset-workflows';
import { LoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { LargeProcessor } from 'src/api/core/orgcheck-api-processor';

/**
 * @description Dataset manager
 */
export class DatasetManager implements DatasetManagerIntf {
    
    /**
     * @description List of datasets
     * @type {Map<string, Dataset>} 
     * @private
     */
    private _datasets: Map<string, Dataset>;

    /**
     * @description Datasets promise cache
     * @type {Map<string, Promise<any[]>>}
     * @private
     */
    private _datasetPromisesCache: Map<string, Promise<any[]>>;

    /**
     * @description Data factory
     * @type {DataFactoryIntf}}
     * @private
     */
    private _dataFactory: DataFactoryIntf;

    /**
     * @description Dataset Manager constructor
     * @param {SalesforceManagerIntf} sfdcManager - The instance of the salesforce manager
     * @param {DataCacheManagerIntf} cacheManager - The instance of the cache manager
     * @param {LoggerIntf} logger - The instance of the logger
     * @public
     */
    constructor(private readonly sfdcManager: SalesforceManagerIntf, private readonly cacheManager: DataCacheManagerIntf, private readonly logger: LoggerIntf) {
         
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
        this._datasets.set(DatasetAliases.PUBLICGROUPSANDQUEUES, new DatasetGroups());
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
        this._datasets.set(DatasetAliases.RELEASEUPDATES, new DatasetReleaseUpdates());
        this._datasets.set(DatasetAliases.REPORTS, new DatasetReports());
        this._datasets.set(DatasetAliases.STATICRESOURCES, new DatasetStaticResources());
        this._datasets.set(DatasetAliases.USERROLES, new DatasetUserRoles());
        this._datasets.set(DatasetAliases.INTERNALACTIVEUSERS, new DatasetInternalActiveUsers());
        this._datasets.set(DatasetAliases.VALIDATIONRULES, new DatasetValidationRules());
        this._datasets.set(DatasetAliases.VISUALFORCECOMPONENTS, new DatasetVisualForceComponents());
        this._datasets.set(DatasetAliases.VISUALFORCEPAGES, new DatasetVisualForcePages());
        this._datasets.set(DatasetAliases.SHARINGRULES, new DatasetSharingRules());
        this._datasets.set(DatasetAliases.WEBLINKS, new DatasetWeblinks());
        this._datasets.set(DatasetAliases.WORKFLOWS, new DatasetWorkflows());
    }

    /**
     * @description Run the given list of datasets and return them as a result
     * @param {string | DatasetRunInformation[]} datasets - The list of datasets to run
     * @returns {Promise<Map<string, any>>} Returns the result 
     * @throws {DatasetManagerError}
     * @public
     * @async
     */
    public async run(datasets: Array<string | DatasetRunInformation>): Promise<Map<string, any[]>> {
        if (datasets === undefined || datasets === null) {
            throw new DatasetManagerError('', `The given datasets is not defined.`);
        }
        if (datasets instanceof Array === false) {
            throw new DatasetManagerError('', `The given datasets is not an instance of Array (typeof= ${typeof datasets}).`);
        }
        const data: any[] = await LargeProcessor.runAll<any>(datasets.map((dataset) => async () => {
            const alias      = (typeof dataset === 'string' ? dataset : dataset.alias);
            const cacheKey   = (typeof dataset === 'string' ? dataset : dataset.cacheKey);
            const parameters = (typeof dataset === 'string' ? undefined : dataset.parameters);
            const section = `Run dataset "${alias}"`;
            if (this._datasetPromisesCache.has(cacheKey) === false) {
                this._datasetPromisesCache.set(cacheKey, Promise.resolve().then(async () => {
                    try {
                        this.logger.log(section, `Checking the data cache for key=${cacheKey}...`);
                        // Get data cache if any
                        const dataFromCache = this.cacheManager.get(cacheKey);
                        if (dataFromCache) {
                            // Set the results from data cache
                            this.logger.finalLog(section, 'There was data in data cache, we use it!');
                            // Return the key/alias and value from the data cache
                            return [ alias, dataFromCache ]; // when data comes from cache instanceof won't work! (keep that in mind)
                        } else {
                            this.logger.log(section, `There was no data in data cache. Let's retrieve data.`);
                            // Calling the retriever
                            const data = await this._datasets.get(alias)?.run(
                                this.sfdcManager, // sfdc manager
                                this._dataFactory, // data factory
                                this.logger?.toSimpleLogger(section), // local logger
                                parameters // Send any parameters if needed
                            );
                            // Cache the data (if possible and not too big)
                            this.cacheManager.set(cacheKey, data); 
                            // Some logs
                            this.logger.finalLog(section, `Data retrieved and saved in cache with key=${cacheKey}`);
                            // Return the key/alias and value from the cache
                            return [ alias, data ];
                        }
                    } catch (error) {
                        this.logger.fatal(section, error);
                        throw new DatasetManagerError(alias, `There was an error while retrieving the data for this dataset (either cache issue or dataset.run issue).`, error);
                    }
                }));
            }
            return await this._datasetPromisesCache.get(cacheKey);
        }));
        return new Map(data);
    }

    /**
     * @description Clean the given list of datasets from cache (if present)
     * @param {string | DatasetRunInformation[]} datasets - The list of datasets to clean
     * @throws {DatasetManagerError}
     * @public
     */
    public clean(datasets: Array<string | DatasetRunInformation>) {
        if (datasets === undefined || datasets === null) {
            throw new DatasetManagerError('', `The given datasets is not defined.`);
        }
        if (datasets instanceof Array === false) {
            throw new DatasetManagerError('', `The given datasets is not an instance of Array (typeof= ${typeof datasets}).`);
        }
        datasets.forEach((dataset) => {
            try {
                const cacheKey = (typeof dataset === 'string' ? dataset : dataset.cacheKey);
                this.cacheManager.remove(cacheKey);
                this._datasetPromisesCache.delete(cacheKey);
            } catch (error) {
                throw new DatasetManagerError(JSON.stringify(dataset), `There was an error while cleaning the dataset`, error);
            }
        });
    }
}