import { OrgCheckSalesforceManager } from './core/orgcheck-api-sfconnectionmanager';
import { OrgCheckLogger } from './core/orgcheck-api-logger';
import { OrgCheckDatasetManager } from './core/orgcheck-api-datasetmanager';
import { OrgCheckDatasetCustomFields } from './dataset/orgcheck-api-dataset-customfields';
import { OrgCheckDatasetCustomLabels } from './dataset/orgcheck-api-dataset-customlabels';
import { OrgCheckDatasetObject } from './dataset/orgcheck-api-dataset-object';
import { OrgCheckDatasetObjects } from './dataset/orgcheck-api-dataset-objects';
import { OrgCheckDatasetObjectTypes } from './dataset/orgcheck-api-dataset-objecttypes';
import { OrgCheckDatasetOrgInformation } from './dataset/orgcheck-api-dataset-orginfo';
import { OrgCheckDatasetPackages } from './dataset/orgcheck-api-dataset-packages';
import { OrgCheckDatasetPermissionSets } from './dataset/orgcheck-api-dataset-permissionsets';
import { OrgCheckDatasetProfiles } from './dataset/orgcheck-api-dataset-profiles';
import { OrgCheckDatasetUsers } from './dataset/orgcheck-api-dataset-users';

const DATASET_CUSTOMFIELDS_ALIAS = 'custom-fields';
const DATASET_CUSTOMLABELS_ALIAS = 'custom-labels';
const DATASET_OBJECT_ALIAS = 'object';
const DATASET_OBJECTS_ALIAS = 'objects';
const DATASET_OBJECTTYPES_ALIAS = 'object-types';
const DATASET_ORGINFO_ALIAS = 'org-information';
const DATASET_PACKAGES_ALIAS = 'packages';
const DATASET_PERMISSIONSETS_ALIAS = 'permission-sets';
const DATASET_PROFILES_ALIAS = 'profiles';
const DATASET_USERS_ALIAS = 'users';

/**
 * Org Check API main class
 */
export class OrgCheckAPI {

    /**
     * Org Check version
     * 
     * @return String representation of the Org Check version in a form of Element [El,n]
     */
    version() {
        return 'Beryllium [Be,4]';
    }

    /**
     * @property {OrgCheckDatasetManager} datasetManager
     */
    #datasetManager;

    /**
     * @property {OrgCheckSalesforceManager} sfdcManager
     */
    #sfdcManager;

    /**
     * @property {OrgCheckLogger} logger
     */
    #logger;

    /**
     * Org Check constructor
     * 
     * @param {JsForce} jsConnectionFactory
     * @param {String} accessToken
     * @param {String} userId
     * @param {JSon} loggerSetup
     */
    constructor(jsConnectionFactory, accessToken, userId, loggerSetup) {

        this.#sfdcManager = new OrgCheckSalesforceManager(jsConnectionFactory, accessToken, userId);
        this.#logger = new OrgCheckLogger(loggerSetup);
        this.#datasetManager = new OrgCheckDatasetManager(this.#sfdcManager, this.#logger);
        this.#datasetManager.register(DATASET_CUSTOMFIELDS_ALIAS, new OrgCheckDatasetCustomFields());
        this.#datasetManager.register(DATASET_CUSTOMLABELS_ALIAS, new OrgCheckDatasetCustomLabels());
        this.#datasetManager.register(DATASET_OBJECT_ALIAS, new OrgCheckDatasetObject());
        this.#datasetManager.register(DATASET_OBJECTS_ALIAS, new OrgCheckDatasetObjects());
        this.#datasetManager.register(DATASET_OBJECTTYPES_ALIAS, new OrgCheckDatasetObjectTypes());
        this.#datasetManager.register(DATASET_ORGINFO_ALIAS, new OrgCheckDatasetOrgInformation());
        this.#datasetManager.register(DATASET_PACKAGES_ALIAS, new OrgCheckDatasetPackages());
        this.#datasetManager.register(DATASET_PERMISSIONSETS_ALIAS, new OrgCheckDatasetPermissionSets());
        this.#datasetManager.register(DATASET_PROFILES_ALIAS, new OrgCheckDatasetProfiles());
        this.#datasetManager.register(DATASET_USERS_ALIAS, new OrgCheckDatasetUsers());
    }

    /**
     * Remove all cache from dataset manager
     */
    removeAllCache() {
        this.#datasetManager.removeAllCache();
    }

    /**
     * Remove a given cache from dataset manager
     * 
     * @param {string} name 
     */
    removeCache(name) {
        this.#datasetManager.removeCache(name);
    }

    /**
     * Get cache information from dataset manager
     * 
     * @returns {Array<DatasetCacheInfo>} list of cache information 
     */
    getCacheInformation() {
        return this.#datasetManager.getCacheInformation();
    }

    /**
     * Get the lastest Daily API Usage from JSForce
     * 
     * @returns Ratio of the daily api usage.
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
        const data = await this.#datasetManager.run([DATASET_ORGINFO_ALIAS]);
        const orgInfo = data.get(DATASET_ORGINFO_ALIAS);
        // Return the only first value!
        return orgInfo.allValues()[0];
    }

    /**
     * Get a list of your packages (local and distant), supported types 
     *     and objects (async method)
     * 
     * @param namespace of the objects you want to list (optional), '*' for any
     * @param type of the objects you want to list (optional), '*' for any
     * 
     * @returns {package: Array<SFDC_Package>, types: Array<SFDC_Type>, objects: Array<SFDC_Object>}
     */
    async getPackagesTypesAndObjects(namespace, type) {
        const SECTION = 'PackagesTypesAndObjects';

        // Start the logger
        this.#logger.begin();
        try {

            // Extract
            this.#logger.sectionStarts(SECTION, 'Getting the information...');
            const data = await this.#datasetManager.run([DATASET_PACKAGES_ALIAS, DATASET_OBJECTTYPES_ALIAS, DATASET_OBJECTS_ALIAS]);
            const packages = data.get(DATASET_PACKAGES_ALIAS);
            const types = data.get(DATASET_OBJECTTYPES_ALIAS);
            const objects = data.get(DATASET_OBJECTS_ALIAS);
            this.#logger.sectionEnded(SECTION, 'Information succesfully retrieved!');

            // Transform
            this.#logger.sectionStarts(SECTION, 'Augment objects with type references...');
            objects.forEachValue((object) => {
                object.typeRef = types.get(object.typeId);
            });
            this.#logger.sectionContinues(SECTION, 'Filter objects with selected namespace and type...');
            const finalData = { 
                packages: packages.allValues(),
                types: types.allValues(),
                objects: objects.filterValues((object) => {
                    if (namespace !== '*' && object.package !== namespace) return false;
                    if (type !== '*' && object.typeRef?.id !== type) return false;
                    return true;
                })
            };
            this.#logger.sectionEnded(SECTION, 'Done');

            // Return value
            return finalData;

        } catch(error) {
            // Error handling
            this.#logger.sectionFailed(SECTION, error.message);
            throw error;

        } finally {
            // End the logger
            this.#logger.end();
        }
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
        const SECTION = 'CustomFields';

        // Start the logger
        this.#logger.begin();
        try {

            // Extract
            this.#logger.sectionStarts(SECTION, 'Getting the information...');
            const data = await this.#datasetManager.run([DATASET_CUSTOMFIELDS_ALIAS, DATASET_OBJECTTYPES_ALIAS, DATASET_OBJECTS_ALIAS]);
            const types = data.get(DATASET_OBJECTTYPES_ALIAS);
            const objects = data.get(DATASET_OBJECTS_ALIAS);
            const customFields = data.get(DATASET_CUSTOMFIELDS_ALIAS);
            this.#logger.sectionEnded(SECTION, 'Information succesfully retrieved!');

            // Transform
            this.#logger.sectionStarts(SECTION, 'Augment custom fields with object references...');
            objects.forEachValue((obj) => {
                obj.typeRef = types.get(obj.typeId);
            });
            customFields.forEachValue((customField) => {
                customField.objectRef = objects.get(customField.objectId);
            });
            this.#logger.sectionContinues(SECTION, 'Filter custom fields with selected namespace, type and object...');
            const finalData = customFields.filterValues((customField) => {
                if (namespace !== '*' && customField.package !== namespace) return false;
                if (objecttype !== '*' && customField.objectRef?.typeRef?.id !== objecttype) return false;
                if (object !== '*' && customField.objectRef?.apiname !== object) return false;
                return true;
            });
            this.#logger.sectionEnded(SECTION, 'Done');

            // Return value
            return finalData;

        } catch(error) {
            // Error handling
            this.#logger.sectionFailed(SECTION, error.message);
            throw error;

        } finally {
            // End the logger
            this.#logger.end();
        }
    }

    /**
     * Get a list of permission sets (async method)
     * 
     * @param namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_PermissionSet>}
     */
    async getPermissionSets(namespace) {
        const SECTION = 'PermissionSets';

        // Start the logger
        this.#logger.begin();
        try {

            // Extract
            this.#logger.sectionStarts(SECTION, 'Getting the information...');
            const data = await this.#datasetManager.run([DATASET_PERMISSIONSETS_ALIAS, DATASET_PROFILES_ALIAS]);
            const permissionSets = data.get(DATASET_PERMISSIONSETS_ALIAS);
            const profiles = data.get(DATASET_PROFILES_ALIAS);
            this.#logger.sectionEnded(SECTION, 'Information succesfully retrieved!');

            // Transform
            this.#logger.sectionStarts(SECTION, 'Augment permission sets with profile references...');
            permissionSets.forEachValue((permissionSet) => {
                permissionSet.profileRefs = permissionSet.profileIds.filter((id) => profiles.hasKey(id)).map((id) => profiles.get(id));
            });
            this.#logger.sectionContinues(SECTION, 'Filter permission sets with selected namespace...');
            const finalData = permissionSets.filterValues((permissionSet) => {
                if (namespace !== '*' && permissionSet.package !== namespace) return false;
                return true;
            });
            this.#logger.sectionEnded(SECTION, 'Done');

            // Return value
            return finalData;

        } catch(error) {
            // Error handling
            this.#logger.sectionFailed(SECTION, error.message);
            throw error;

        } finally {
            // End the logger
            this.#logger.end();
        }
    }

    /**
     * Get a list of profiles (async method)
     * 
     * @param namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_Profile>}
     */
    async getProfiles(namespace) {
        const SECTION = 'Profiles';

        // Start the logger
        this.#logger.begin();
        try {

            // Extract
            this.#logger.sectionStarts(SECTION, 'Getting the information...');
            const data = await this.#datasetManager.run([DATASET_PROFILES_ALIAS]);
            const profiles = data.get(DATASET_PROFILES_ALIAS);
            this.#logger.sectionEnded(SECTION, 'Information succesfully retrieved!');

            // Transform
            this.#logger.sectionStarts(SECTION, 'Filter profiles with selected namespace...');
            const finalData = profiles.filterValues((profile) => {
                if (namespace !== '*' && profile.package !== namespace) return false;
                return true;
            });
            this.#logger.sectionEnded(SECTION, 'Done');

            // Return value
            return finalData;

        } catch(error) {
            // Error handling
            this.#logger.sectionFailed(SECTION, error.message);
            throw error;

        } finally {
            // End the logger
            this.#logger.end();
        }
    }

    /**
     * Get a list of active users (async method)
     * 
     * @returns {Array<SFDC_User>}
     */
    async getActiveUsers() {
        const SECTION = 'ActiveUsers';

        // Start the logger
        this.#logger.begin();
        try {

            // Extract
            this.#logger.sectionStarts(SECTION, 'Getting the information...');
            const data = await this.#datasetManager.run([DATASET_USERS_ALIAS, DATASET_PROFILES_ALIAS, DATASET_PERMISSIONSETS_ALIAS]);
            const users = data.get(DATASET_USERS_ALIAS);
            const profiles = data.get(DATASET_PROFILES_ALIAS);
            const permissionSets = data.get(DATASET_PERMISSIONSETS_ALIAS);
            this.#logger.sectionEnded(SECTION, 'Information succesfully retrieved!');

            // Transform
            this.#logger.sectionStarts(SECTION, 'Augment users with profile and permission set references...');
            users.forEachValue((user) => {
                user.profileRef = profiles.get(user.profileId);
                user.permissionSetRefs = user.permissionSetIds.filter((id) => permissionSets.hasKey(id)).map((id) => permissionSets.get(id));
            });
            this.#logger.sectionContinues(SECTION, 'Filter permission sets with selected namespace...');
            this.#logger.sectionStarts(SECTION, 'Mapping the information...');
            const finalData = users.allValues();
            this.#logger.sectionEnded(SECTION, 'Done');

            // Return value
            return finalData;

        } catch(error) {
            // Error handling
            this.#logger.sectionFailed(SECTION, error.message);
            throw error;

        } finally {
            // End the logger
            this.#logger.end();
        }
    }

    /**
     * Get a full description of an object (async method)
     * 
     * @param object you want to describe, can't be empty or '*'
     * 
     * @returns {Array<SFDC_Object>}
     */
    async getObject(object) {

        // Just checking if the object name is given
        if (this.#sfdcManager.isEmpty(object) || object === '*') throw new Error('Please specify an object so that we can get its description');

        const SECTION = 'Object';

        // Start the logger
        this.#logger.begin();
        try {

            // Extract
            this.#logger.sectionStarts(SECTION, 'Getting the information...');
            const data = await this.#datasetManager.run([{ name: DATASET_OBJECT_ALIAS, cacheKey: `${DATASET_OBJECT_ALIAS}_${object}`, parameters: { object: object }}]);
            const objectDescribed = data.get(DATASET_OBJECT_ALIAS);
            this.#logger.sectionEnded(SECTION, 'Information succesfully retrieved!');

            // Return value
            return objectDescribed;

        } catch(error) {
            // Error handling
            this.#logger.sectionFailed(SECTION, error.message);
            throw error;

        } finally {
            // End the logger
            this.#logger.end();
        }
    }

    /**
     * Get a list of custom labels (async method)
     * 
     * @param namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_CustomLabel>}
     */
    async getCustomLabels(namespace) {
        const SECTION = 'CustomLabels';

        // Start the logger
        this.#logger.begin();
        try {

            // Extract
            this.#logger.sectionStarts(SECTION, 'Getting the information...');
            const data = await this.#datasetManager.run([DATASET_CUSTOMLABELS_ALIAS]);
            const customLabels = data.get(DATASET_CUSTOMLABELS_ALIAS);
            this.#logger.sectionEnded(SECTION, 'Information succesfully retrieved!');

            // Transform
            this.#logger.sectionContinues(SECTION, 'Filter custom labels with selected namespace...');
            const finalData = customLabels.filterValues((customLabel) => {
                if (namespace !== '*' && customLabel.package !== namespace) return false;
                return true;
            });
            this.#logger.sectionEnded(SECTION, 'Done');

            // Return value
            return finalData;

        } catch(error) {
            // Error handling
            this.#logger.sectionFailed(SECTION, error.message);
            throw error;

        } finally {
            // End the logger
            this.#logger.end();
        }
    }
}