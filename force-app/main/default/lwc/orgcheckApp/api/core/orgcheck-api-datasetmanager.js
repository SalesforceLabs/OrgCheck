import { OrgCheckLogger } from './orgcheck-api-logger';
import { OrgCheckSalesforceManager } from './orgcheck-api-sfconnectionmanager';
import { OrgCheckDatasetCustomFields } from '../dataset/orgcheck-api-dataset-customfields';
import { OrgCheckDatasetCustomLabels } from '../dataset/orgcheck-api-dataset-customlabels';
import { OrgCheckDatasetObject } from '../dataset/orgcheck-api-dataset-object';
import { OrgCheckDatasetObjects } from '../dataset/orgcheck-api-dataset-objects';
import { OrgCheckDatasetObjectTypes } from '../dataset/orgcheck-api-dataset-objecttypes';
import { OrgCheckDatasetOrgInformation } from '../dataset/orgcheck-api-dataset-orginfo';
import { OrgCheckDatasetPackages } from '../dataset/orgcheck-api-dataset-packages';
import { OrgCheckDatasetPermissionSets } from '../dataset/orgcheck-api-dataset-permissionsets';
import { OrgCheckDatasetProfiles } from '../dataset/orgcheck-api-dataset-profiles';
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

export class DatasetCacheInfo {
    name;
    length;
    created;
    modified;
}

export class DatasetRunInformation {
    alias;
    parameters;
    cacheKey;
}

export const DATASET_CUSTOMFIELDS_ALIAS = 'custom-fields';
export const DATASET_CUSTOMLABELS_ALIAS = 'custom-labels';
export const DATASET_OBJECT_ALIAS = 'object';
export const DATASET_OBJECTS_ALIAS = 'objects';
export const DATASET_OBJECTTYPES_ALIAS = 'object-types';
export const DATASET_ORGINFO_ALIAS = 'org-information';
export const DATASET_PACKAGES_ALIAS = 'packages';
export const DATASET_PERMISSIONSETS_ALIAS = 'permission-sets';
export const DATASET_PROFILES_ALIAS = 'profiles';
export const DATASET_USERS_ALIAS = 'users';
export const DATASET_VISUALFORCEPAGES_ALIAS = 'visual-force-pages';
export const DATASET_VISUALFORCEOMPONENTS_ALIAS = 'visual-force-components';
export const DATASET_LIGHTNINGAURACOMPONENTS_ALIAS = 'lightning-aura-components';
export const DATASET_LIGHTNINGWEBCOMPONENTS_ALIAS = 'lightning-web-components';
export const DATASET_LIGHTNINGPAGES_ALIAS = 'lightning-pages';
export const DATASET_GROUPS_ALIAS = 'groups';
export const DATASET_APEXCLASSES_ALIAS = 'apex-classes';
export const DATASET_APEXTRIGGERS_ALIAS = 'apex-triggers';
export const DATASET_USERROLES_ALIAS = 'user-roles';
export const DATASET_FLOWS_ALIAS = 'flows';

export class OrgCheckDatasetManager {
    
    #datasets;
    #cache;
    #logger;
    #sfdcManager;

    /**
     * Dataset Manager constructor
     * 
     * @param {SFDCConnectionManager} sfdcManager 
     * @param {OrgCheckLogger} logger
     */
    constructor(sfdcManager, logger) {
        
        if (sfdcManager instanceof OrgCheckSalesforceManager === false) {
            throw new Error('The given logger is not an instance of OrgCheckSalesforceManager.');
        }
        if (logger instanceof OrgCheckLogger === false) {
            throw new Error('The given logger is not an instance of OrgCheckLogger.');
        }
        
        this.#sfdcManager = sfdcManager;
        this.#logger = logger;
        this.#datasets = new Map();
        this.#cache = new Map();

        this.#datasets.set(DATASET_CUSTOMFIELDS_ALIAS, new OrgCheckDatasetCustomFields());
        this.#datasets.set(DATASET_CUSTOMLABELS_ALIAS, new OrgCheckDatasetCustomLabels());
        this.#datasets.set(DATASET_OBJECT_ALIAS, new OrgCheckDatasetObject());
        this.#datasets.set(DATASET_OBJECTS_ALIAS, new OrgCheckDatasetObjects());
        this.#datasets.set(DATASET_OBJECTTYPES_ALIAS, new OrgCheckDatasetObjectTypes());
        this.#datasets.set(DATASET_ORGINFO_ALIAS, new OrgCheckDatasetOrgInformation());
        this.#datasets.set(DATASET_PACKAGES_ALIAS, new OrgCheckDatasetPackages());
        this.#datasets.set(DATASET_PERMISSIONSETS_ALIAS, new OrgCheckDatasetPermissionSets());
        this.#datasets.set(DATASET_PROFILES_ALIAS, new OrgCheckDatasetProfiles());
        this.#datasets.set(DATASET_USERS_ALIAS, new OrgCheckDatasetUsers());
        this.#datasets.set(DATASET_VISUALFORCEPAGES_ALIAS, new OrgCheckDatasetVisualForcePages());
        this.#datasets.set(DATASET_VISUALFORCEOMPONENTS_ALIAS, new OrgCheckDatasetVisualForceComponents());
        this.#datasets.set(DATASET_LIGHTNINGAURACOMPONENTS_ALIAS, new OrgCheckDatasetLightningAuraComponents());
        this.#datasets.set(DATASET_LIGHTNINGWEBCOMPONENTS_ALIAS, new OrgCheckDatasetLightningWebComponents());
        this.#datasets.set(DATASET_LIGHTNINGPAGES_ALIAS, new OrgCheckDatasetLightningPages());
        this.#datasets.set(DATASET_GROUPS_ALIAS, new OrgCheckDatasetGroups());
        this.#datasets.set(DATASET_APEXCLASSES_ALIAS, new OrgCheckDatasetApexClasses());
        this.#datasets.set(DATASET_APEXTRIGGERS_ALIAS, new OrgCheckDatasetApexTriggers());
        this.#datasets.set(DATASET_USERROLES_ALIAS, new OrgCheckDatasetUserRoles());
        this.#datasets.set(DATASET_FLOWS_ALIAS, new OrgCheckDatasetFlows());
    }

    /**
     * Run the given list of datasets and return them as a result
     * 
     * @param {Array<DatasetRunInformation>} datasets 
     * @return Map
     */
    async run(datasets) {
        if (datasets instanceof Array === false) {
            throw new Error('The given datasets is not an instance of Array.');
        }
        const results = new Map();
        const promises = [];
        datasets.forEach((dataset) => {
            const alias      = (typeof dataset === 'string' ? dataset : dataset.alias);
            const cacheKey   = (typeof dataset === 'string' ? dataset : dataset.cacheKey);
            const parameters = (typeof dataset === 'string' ? undefined : dataset.parameters);
            const section = `DATASET ${alias}`;

            promises.push(new Promise((resolve, reject) => {
                this.#logger.sectionContinues(section, `Checking the cache for key=${cacheKey}...`);
                // Check cache if any
                if (this.#cache.has(cacheKey) === true) {
                    // Set the results from cache
                    this.#logger.sectionEnded(section, 'There was data in cache, we use it!');
                    results.set(alias, this.#cache.get(cacheKey));
                    // Resolve
                    resolve();
                    return;
                }
                this.#logger.sectionContinues(section, 'There was no data in cache. Let\'s retrieve data.');

                // Calling the retriever
                this.#datasets.get(alias).run(
                    // sfdc manager
                    this.#sfdcManager,
                    // success
                    (data) => {
                        // Cache the data
                        this.#cache.set(alias, data);
                        // Set the results
                        results.set(alias, data);
                        // Some logs
                        this.#logger.sectionEnded(section, `Data retrieved and saved in cache with key=${cacheKey}`);
                        // Resolve
                        resolve();
                    },
                    // error
                    (error) => {
                        // Reject with this error
                        this.#logger.sectionFailed(section, error);
                        reject(error);
                    },
                    // Send any parameters if needed
                    parameters
                );
            }));
        });
        return Promise.all(promises).then(() => results);
    }

    getCacheInformation() {
        const section = 'DATASET cache-info';
        this.#logger.sectionStarts(section, `Parsing all the dataset cache to answer your request...`);
        const cacheInformation = [];
        for (const [datasetName, dataset] of this.#cache.entries()) {
            const info = new DatasetCacheInfo();
            info.name = datasetName;
            info.length = dataset?.size || 1;
            if (dataset?.createdDate) info.created = dataset?.createdDate();
            if (dataset?.lastModificationDate) info.modified = dataset?.lastModificationDate();
            cacheInformation.push(info);
        };
        this.#logger.sectionEnded(section, `Done with ${cacheInformation.length} item(s) scanned.`);
        this.#logger.end();
        return cacheInformation;
    }

    removeCache(name) {
        this.#cache.remove(name);
    }

    removeAllCache() {
        this.#cache.clear();
    }
}