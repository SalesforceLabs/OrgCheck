// @ts-check

import { OrgCheckDatasetRunInformation, OrgCheckDatasetManager } from './orgcheck-api-datasetmanager';
import { OrgCheckLogger } from './orgcheck-api-logger';
import { OrgCheckRecipeActiveUsers } from '../recipe/orgcheck-api-recipe-activeusers';
import { OrgCheckRecipeCustomFields } from '../recipe/orgcheck-api-recipe-customfields';
import { OrgCheckRecipeCustomLabels } from '../recipe/orgcheck-api-recipe-customlabels';
import { OrgCheckRecipeObject } from '../recipe/orgcheck-api-recipe-object';
import { OrgCheckRecipeObjectPermissions } from '../recipe/orgcheck-api-recipe-objectpermissions';
import { OrgCheckRecipeAppPermissions } from '../recipe/orgcheck-api-recipe-apppermissions';
import { OrgCheckRecipeOrganization } from '../recipe/orgcheck-api-recipe-organization';
import { OrgCheckRecipeCurrentUserPermissions } from '../recipe/orgcheck-api-recipe-currentuserpermissions';
import { OrgCheckRecipePermissionSets } from '../recipe/orgcheck-api-recipe-permissionsets';
import { OrgCheckRecipeProfiles } from '../recipe/orgcheck-api-recipe-profiles';
import { OrgCheckRecipeProfileRestrictions } from '../recipe/orgcheck-api-recipe-profilerestrictions';
import { OrgCheckRecipeProfilePasswordPolicies } from '../recipe/orgcheck-api-recipe-profilepasswordpolicies';
import { OrgCheckRecipeVisualForcePages } from '../recipe/orgcheck-api-recipe-visualforcepages';
import { OrgCheckRecipeLightningWebComponents } from '../recipe/orgcheck-api-recipe-lightningwebcomponents';
import { OrgCheckRecipeLightningAuraComponents } from '../recipe/orgcheck-api-recipe-lightningauracomponents';
import { OrgCheckRecipeLightningPages } from '../recipe/orgcheck-api-recipe-lightningpages';
import { OrgCheckRecipeVisualForceComponents } from '../recipe/orgcheck-api-recipe-visualforcecomponents';
import { OrgCheckRecipeGroups } from '../recipe/orgcheck-api-recipe-groups';
import { OrgCheckRecipeApexClasses } from '../recipe/orgcheck-api-recipe-apexclasses';
import { OrgCheckRecipeApexTriggers } from '../recipe/orgcheck-api-recipe-apextriggers';
import { OrgCheckRecipeUserRoles } from '../recipe/orgcheck-api-recipe-userroles';
import { OrgCheckRecipeWorkflows } from '../recipe/orgcheck-api-recipe-workflows';
import { OrgCheckRecipeProcessBuilders } from '../recipe/orgcheck-api-recipe-processbuilders';
import { OrgCheckRecipeFlows } from '../recipe/orgcheck-api-recipe-flows';
import { OrgCheckRecipe } from './orgcheck-api-recipe';
import { OrgCheckData } from './orgcheck-api-data';
import { OrgCheckRecipePackages } from '../recipe/orgcheck-api-recipe-packages';
import { OrgCheckRecipeObjectTypes } from '../recipe/orgcheck-api-recipe-objecttypes';
import { OrgCheckRecipeObjects } from '../recipe/orgcheck-api-recipe-objects';
import { OrgCheckMatrixData } from './orgcheck-api-data-matrix';

export const RECIPE_ACTIVEUSERS_ALIAS = 'active-users';
export const RECIPE_CUSTOMFIELDS_ALIAS = 'custom-fields';
export const RECIPE_CUSTOMLABELS_ALIAS = 'custom-labels';
export const RECIPE_PACKAGES_ALIAS = 'packages';
export const RECIPE_OBJECTTYPES_ALIAS = 'object-types';
export const RECIPE_OBJECTS_ALIAS = 'objects';
export const RECIPE_OBJECT_ALIAS = 'object';
export const RECIPE_OBJECTPERMISSIONS_ALIAS = 'object-permissions';
export const RECIPE_APPPERMISSIONS_ALIAS = 'app-permissions';
export const RECIPE_ORGANIZATION_ALIAS = 'org-information';
export const RECIPE_CURRENTUSERPERMISSIONS_ALIAS = 'current-user-permissions';
export const RECIPE_PERMISSIONSETS_ALIAS = 'permission-sets';
export const RECIPE_PROFILES_ALIAS = 'profiles';
export const RECIPE_PROFILERESTRICTIONS_ALIAS = 'profile-restrictions';
export const RECIPE_PROFILEPWDPOLICIES_ALIAS = 'profile-password-policies';
export const RECIPE_VISUALFORCEPAGES_ALIAS = 'visual-force-pages';
export const RECIPE_LIGHTNINGPWEBCOMPONENTS_ALIAS = 'lightning-web-components';
export const RECIPE_LIGHTNINGAURACOMPONENTS_ALIAS = 'lightning-aura-components';
export const RECIPE_LIGHTNINGPAGES_ALIAS = 'lightning-pages';
export const RECIPE_VISUALFORCECOMPONENTS_ALIAS = 'visual-force-components';
export const RECIPE_GROUPS_ALIAS = 'groups';
export const RECIPE_APEXCLASSES_ALIAS = 'apex-classes';
export const RECIPE_APEXTRIGGERS_ALIAS = 'apex-triggers';
export const RECIPE_USERROLES_ALIAS = 'user-roles';
export const RECIPE_WORKFLOWS_ALIAS = 'workflows';
export const RECIPE_FLOWS_ALIAS = 'flows';
export const RECIPE_PROCESSBUILDERS_ALIAS = 'process-builders';

export class OrgCheckRecipeManager {

    /**
     * @description Private logger to use
     * @type {OrgCheckLogger}
     * @private
     */
    private_logger;

    /**
     * @description Map of recipes given their alias.
     * @type {Map<string, OrgCheckRecipe>}
     * @private
     */
    private_recipes;

    /**
     * @description Recipes need a dataset manager to work
     * @type {OrgCheckDatasetManager}
     * @private
     */
    private_datasetManager;
            
    /**
     * @description Recipe Manager constructor
     * @param {OrgCheckDatasetManager} datasetManager 
     * @param {OrgCheckLogger} logger
     */
    constructor(datasetManager, logger) {

        if (datasetManager instanceof OrgCheckDatasetManager === false) {
            throw new TypeError('The given logger is not an instance of OrgCheckDatasetManager.');
        }
        if (logger instanceof OrgCheckLogger === false) {
            throw new TypeError('The given logger is not an instance of OrgCheckLogger.');
        }

        this.private_datasetManager = datasetManager;
        this.private_logger = logger;
        this.private_recipes = new Map();

        this.private_recipes.set(RECIPE_ACTIVEUSERS_ALIAS, new OrgCheckRecipeActiveUsers());
        this.private_recipes.set(RECIPE_CUSTOMFIELDS_ALIAS, new OrgCheckRecipeCustomFields());
        this.private_recipes.set(RECIPE_CUSTOMLABELS_ALIAS, new OrgCheckRecipeCustomLabels());
        this.private_recipes.set(RECIPE_PACKAGES_ALIAS, new OrgCheckRecipePackages());
        this.private_recipes.set(RECIPE_OBJECTTYPES_ALIAS, new OrgCheckRecipeObjectTypes());
        this.private_recipes.set(RECIPE_OBJECTS_ALIAS, new OrgCheckRecipeObjects());
        this.private_recipes.set(RECIPE_OBJECT_ALIAS, new OrgCheckRecipeObject());
        this.private_recipes.set(RECIPE_OBJECTPERMISSIONS_ALIAS, new OrgCheckRecipeObjectPermissions());
        this.private_recipes.set(RECIPE_APPPERMISSIONS_ALIAS, new OrgCheckRecipeAppPermissions())
        this.private_recipes.set(RECIPE_ORGANIZATION_ALIAS, new OrgCheckRecipeOrganization());
        this.private_recipes.set(RECIPE_CURRENTUSERPERMISSIONS_ALIAS, new OrgCheckRecipeCurrentUserPermissions());
        this.private_recipes.set(RECIPE_PERMISSIONSETS_ALIAS, new OrgCheckRecipePermissionSets());
        this.private_recipes.set(RECIPE_PROFILES_ALIAS, new OrgCheckRecipeProfiles());
        this.private_recipes.set(RECIPE_PROFILERESTRICTIONS_ALIAS, new OrgCheckRecipeProfileRestrictions());
        this.private_recipes.set(RECIPE_PROFILEPWDPOLICIES_ALIAS, new OrgCheckRecipeProfilePasswordPolicies());
        this.private_recipes.set(RECIPE_VISUALFORCEPAGES_ALIAS, new OrgCheckRecipeVisualForcePages());
        this.private_recipes.set(RECIPE_LIGHTNINGPWEBCOMPONENTS_ALIAS, new OrgCheckRecipeLightningWebComponents());
        this.private_recipes.set(RECIPE_LIGHTNINGAURACOMPONENTS_ALIAS, new OrgCheckRecipeLightningAuraComponents());
        this.private_recipes.set(RECIPE_LIGHTNINGPAGES_ALIAS, new OrgCheckRecipeLightningPages());
        this.private_recipes.set(RECIPE_VISUALFORCECOMPONENTS_ALIAS, new OrgCheckRecipeVisualForceComponents());
        this.private_recipes.set(RECIPE_GROUPS_ALIAS, new OrgCheckRecipeGroups());
        this.private_recipes.set(RECIPE_APEXCLASSES_ALIAS, new OrgCheckRecipeApexClasses());
        this.private_recipes.set(RECIPE_APEXTRIGGERS_ALIAS, new OrgCheckRecipeApexTriggers());
        this.private_recipes.set(RECIPE_USERROLES_ALIAS, new OrgCheckRecipeUserRoles());
        this.private_recipes.set(RECIPE_WORKFLOWS_ALIAS, new OrgCheckRecipeWorkflows());
        this.private_recipes.set(RECIPE_PROCESSBUILDERS_ALIAS, new OrgCheckRecipeProcessBuilders());
        this.private_recipes.set(RECIPE_FLOWS_ALIAS, new  OrgCheckRecipeFlows());
    }

    /**
     * @description Runs a designated recipe (by its alias)
     *   - Step 1. Extract the list of datasets to run that this recipe uses
     *   - Step 2. Run the given datasets and gather the global data retrieved
     *   - Step 3. Transform the retrieved data and return the final result as a Map
     * @param {string} alias String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Array<string|object>} parameters List of values to pass to the exract and tranform methods of the recipe.
     * @returns {Promise<Array<OrgCheckData> | OrgCheckMatrixData | OrgCheckData | Map>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async run(alias, ...parameters) {
        // Check if alias is registered
        if (this.private_recipes.has(alias) === false) {
            throw new TypeError(`The given alias (${alias}) does not correspond to a registered recipe.`);
        } 
        const section = `RECIPE ${alias}`;
        
        /**
         * @description The recipe designated by the alias
         * @type {OrgCheckRecipe}
         */
        const recipe = this.private_recipes.get(alias);

        try {
            // Start the logger
            this.private_logger.begin();

            // -------------------
            // Extract
            // -------------------
            this.private_logger.sectionStarts(section, 'List the datasets that are needed...');

            /**
             * @description The list of datasets to be used by this recipe
             * @type {Array<string | OrgCheckDatasetRunInformation>}}
             */
            let datasets;
            try {
                datasets = recipe.extract(...parameters);   
            } catch(error) {
                this.private_logger.sectionFailed(section, error);
                throw error;
            }
            this.private_logger.sectionContinues(section, 'Run all the datasets and extract their data...');
            let data;
            try {
                data = await this.private_datasetManager.run(datasets);
            } catch(error) {
                // the detail of the error should have been logged by dataset manager
                // just mentionning that there was an error on the dataset layer
                this.private_logger.sectionFailed(section, 'Error in dataset!');
                throw error;
            }
            this.private_logger.sectionContinues(section, 'Information succesfully retrieved!');

            // -------------------
            // Transform
            // -------------------
            this.private_logger.sectionContinues(section, 'Transform the information...');

            /**
             * @description The final data that we will return as it is.
             * @type {Array<OrgCheckData> | OrgCheckMatrixData | OrgCheckData | Map}
             */
            let finalData;
            try {
                finalData = await recipe.transform(data, ...parameters);
            } catch(error) {
                this.private_logger.sectionFailed(section, error);
                throw error;
            }
            this.private_logger.sectionEnded(section, 'Transformation done!');

            // Return value
            return finalData;

        } finally {
            // End the logger
            this.private_logger.end();
        }
    }

    /**
     * @description Cleans a designated recipe (by its alias) and the corresponding datasets.
     *    - Step 1. Extract the list of datasets to clean that this recipe uses
     *    - Step 2. Clean the given datasets
     * @param {string} alias String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Array<string|object>} [parameters] List of values to pass to the exract method of the recipe.
     * @public
     */
    clean(alias, ...parameters) {
        // Check if alias is registered
        if (this.private_recipes.has(alias) === false) {
            throw new TypeError(`The given alias (${alias}) does not correspond to a registered recipe.`);
        } 
        const section = `RECIPE ${alias}`;
        const recipe = this.private_recipes.get(alias);

        try {
            // Start the logger
            this.private_logger.begin();

            // -------------------
            // Extract
            // -------------------
            this.private_logger.sectionStarts(section, 'List the datasets that were needed...');
            let datasets;
            try {
                datasets = recipe.extract(...parameters);   
            } catch(error) {
                this.private_logger.sectionFailed(section, error);
                throw error;
            }
            this.private_logger.sectionContinues(section, 'Information succesfully retrieved!');

            // -------------------
            // Clean
            // -------------------
            this.private_logger.sectionContinues(section, 'Clean all datasets...');
            try {
                this.private_datasetManager.clean(datasets);
            } catch(error) {
                this.private_logger.sectionFailed(section, error);
                throw error;
            }
            this.private_logger.sectionEnded(section, 'Datasets succesfully cleaned!');

        } finally {
            // End the logger
            this.private_logger.end();
        }
    }
}