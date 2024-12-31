import { OrgCheckDatasetManagerIntf } from './orgcheck-api-datasetmanager';
import { OrgCheckLoggerIntf } from './orgcheck-api-logger';
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
import { OrgCheckData, OrgCheckDataWithoutScoring } from './orgcheck-api-data';
import { OrgCheckRecipePackages } from '../recipe/orgcheck-api-recipe-packages';
import { OrgCheckRecipeObjectTypes } from '../recipe/orgcheck-api-recipe-objecttypes';
import { OrgCheckRecipeObjects } from '../recipe/orgcheck-api-recipe-objects';
import { OrgCheckDataMatrix } from './orgcheck-api-data-matrix';
import { OrgCheckDatasetRunInformation } from './orgcheck-api-dataset-runinformation';
import { OrgCheckRecipeManagerIntf } from './orgcheck-api-recipemanager';
import { OrgCheckRecipeAliases } from './orgcheck-api-recipes-aliases';

/**
 * @description Recipe Manager
 */ 
export class OrgCheckRecipeManager extends OrgCheckRecipeManagerIntf {

    /**
     * @description Private logger to use
     * @type {OrgCheckLoggerIntf}
     * @private
     */
    _logger;

    /**
     * @description Map of recipes given their alias.
     * @type {Map<string, OrgCheckRecipe>}
     * @private
     */
    _recipes;

    /**
     * @description Recipes need a dataset manager to work
     * @type {OrgCheckDatasetManagerIntf}
     * @private
     */
    _datasetManager;
            
    /**
     * @description Recipe Manager constructor
     * @param {OrgCheckDatasetManagerIntf} datasetManager 
     * @param {OrgCheckLoggerIntf} logger
     */
    constructor(datasetManager, logger) {
        super();

        if (datasetManager instanceof OrgCheckDatasetManagerIntf === false) {
            throw new TypeError('The given datasetManager is not an instance of OrgCheckDatasetManagerIntf.');
        }
        if (logger instanceof OrgCheckLoggerIntf === false) {
            throw new TypeError('The given logger is not an instance of OrgCheckLoggerIntf.');
        }

        this._datasetManager = datasetManager;
        this._logger = logger;
        this._recipes = new Map();

        this._recipes.set(OrgCheckRecipeAliases.ACTIVE_USERS, new OrgCheckRecipeActiveUsers());
        this._recipes.set(OrgCheckRecipeAliases.APEX_CLASSES, new OrgCheckRecipeApexClasses());
        this._recipes.set(OrgCheckRecipeAliases.APEX_TRIGGERS, new OrgCheckRecipeApexTriggers());
        this._recipes.set(OrgCheckRecipeAliases.APP_PERMISSIONS, new OrgCheckRecipeAppPermissions())
        this._recipes.set(OrgCheckRecipeAliases.CURRENT_USER_PERMISSIONS, new OrgCheckRecipeCurrentUserPermissions());
        this._recipes.set(OrgCheckRecipeAliases.CUSTOM_FIELDS, new OrgCheckRecipeCustomFields());
        this._recipes.set(OrgCheckRecipeAliases.CUSTOM_LABELS, new OrgCheckRecipeCustomLabels());
        this._recipes.set(OrgCheckRecipeAliases.FLOWS, new  OrgCheckRecipeFlows());
        this._recipes.set(OrgCheckRecipeAliases.GROUPS, new OrgCheckRecipeGroups());
        this._recipes.set(OrgCheckRecipeAliases.LIGHTNING_AURA_COMPONENTS, new OrgCheckRecipeLightningAuraComponents());
        this._recipes.set(OrgCheckRecipeAliases.LIGHTNING_PAGES, new OrgCheckRecipeLightningPages());
        this._recipes.set(OrgCheckRecipeAliases.LIGHTNING_WEB_COMPONENTS, new OrgCheckRecipeLightningWebComponents());
        this._recipes.set(OrgCheckRecipeAliases.OBJECT, new OrgCheckRecipeObject());
        this._recipes.set(OrgCheckRecipeAliases.OBJECT_PERMISSIONS, new OrgCheckRecipeObjectPermissions());
        this._recipes.set(OrgCheckRecipeAliases.OBJECTS, new OrgCheckRecipeObjects());
        this._recipes.set(OrgCheckRecipeAliases.OBJECT_TYPES, new OrgCheckRecipeObjectTypes());
        this._recipes.set(OrgCheckRecipeAliases.ORGANIZATION, new OrgCheckRecipeOrganization());
        this._recipes.set(OrgCheckRecipeAliases.PACKAGES, new OrgCheckRecipePackages());
        this._recipes.set(OrgCheckRecipeAliases.PERMISSION_SETS, new OrgCheckRecipePermissionSets());
        this._recipes.set(OrgCheckRecipeAliases.PROCESS_BUILDERS, new OrgCheckRecipeProcessBuilders());
        this._recipes.set(OrgCheckRecipeAliases.PROFILE_PWD_POLICIES, new OrgCheckRecipeProfilePasswordPolicies());
        this._recipes.set(OrgCheckRecipeAliases.PROFILE_RESTRICTIONS, new OrgCheckRecipeProfileRestrictions());
        this._recipes.set(OrgCheckRecipeAliases.PROFILES, new OrgCheckRecipeProfiles());
        this._recipes.set(OrgCheckRecipeAliases.USER_ROLES, new OrgCheckRecipeUserRoles());
        this._recipes.set(OrgCheckRecipeAliases.VISUALFORCE_COMPONENTS, new OrgCheckRecipeVisualForceComponents());
        this._recipes.set(OrgCheckRecipeAliases.VISUALFORCE_PAGES, new OrgCheckRecipeVisualForcePages());
        this._recipes.set(OrgCheckRecipeAliases.WORKFLOWS, new OrgCheckRecipeWorkflows());
    }

    /**
     * @description Runs a designated recipe (by its alias)
     *   - Step 1. Extract the list of datasets to run that this recipe uses
     *   - Step 2. Run the given datasets and gather the global data retrieved
     *   - Step 3. Transform the retrieved data and return the final result as a Map
     * @param {string} alias String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Array<string|object>} parameters List of values to pass to the exract and tranform methods of the recipe.
     * @returns {Promise<Array<OrgCheckData | OrgCheckDataWithoutScoring> | OrgCheckDataMatrix | OrgCheckData | OrgCheckDataWithoutScoring | Map>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async run(alias, ...parameters) {
        // Check if alias is registered
        if (this._recipes.has(alias) === false) {
            throw new TypeError(`The given alias (${alias}) does not correspond to a registered recipe.`);
        } 
        const section = `RECIPE ${alias}`;
        
        /**
         * @description The recipe designated by the alias
         * @type {OrgCheckRecipe}
         */
        const recipe = this._recipes.get(alias);

        try {
            // Start the logger
            this._logger.begin();

            // -------------------
            // Extract
            // -------------------
            this._logger.sectionStarts(section, 'List the datasets that are needed...');

            /**
             * @description The list of datasets to be used by this recipe
             * @type {Array<string | OrgCheckDatasetRunInformation>}}
             */
            let datasets;
            try {
                datasets = recipe.extract(
                    // local logger
                    this._logger.toSimpleLogger(section),
                    // all parameters
                    ...parameters
                );
            } catch(error) {
                this._logger.sectionFailed(section, error);
                throw error;
            }
            this._logger.sectionContinues(section, 'Run all the datasets and extract their data...');
            let data;
            try {
                data = await this._datasetManager.run(datasets);
            } catch(error) {
                // the detail of the error should have been logged by dataset manager
                // just mentionning that there was an error on the dataset layer
                this._logger.sectionFailed(section, 'Error in dataset!');
                throw error;
            }
            this._logger.sectionContinues(section, 'Information succesfully retrieved!');

            // -------------------
            // Transform
            // -------------------
            this._logger.sectionContinues(section, 'Transform the information...');

            /**
             * @description The final data that we will return as it is.
             * @type {Array<OrgCheckData | OrgCheckDataWithoutScoring> | OrgCheckDataMatrix | OrgCheckData | OrgCheckDataWithoutScoring | Map}
             */
            let finalData;
            try {
                finalData = await recipe.transform(
                    // Data from datasets
                    data, 
                    // local logger
                    this._logger.toSimpleLogger(section),
                    // all parameters
                    ...parameters);
            } catch(error) {
                this._logger.sectionFailed(section, error);
                throw error;
            }
            this._logger.sectionEnded(section, 'Transformation done!');

            // Return value
            return finalData;

        } finally {
            // End the logger
            this._logger.end();
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
        if (this._recipes.has(alias) === false) {
            throw new TypeError(`The given alias (${alias}) does not correspond to a registered recipe.`);
        } 
        const section = `RECIPE ${alias}`;
        const recipe = this._recipes.get(alias);

        try {
            // Start the logger
            this._logger.begin();

            // -------------------
            // Extract
            // -------------------
            this._logger.sectionStarts(section, 'List the datasets that were needed...');
            let datasets;
            try {
                datasets = recipe.extract(
                    // local logger
                    this._logger.toSimpleLogger(section),
                    // all parameters
                    ...parameters
                );
            } catch(error) {
                this._logger.sectionFailed(section, error);
                throw error;
            }
            this._logger.sectionContinues(section, 'Information succesfully retrieved!');

            // -------------------
            // Clean
            // -------------------
            this._logger.sectionContinues(section, 'Clean all datasets...');
            try {
                this._datasetManager.clean(datasets);
            } catch(error) {
                this._logger.sectionFailed(section, error);
                throw error;
            }
            this._logger.sectionEnded(section, 'Datasets succesfully cleaned!');

        } finally {
            // End the logger
            this._logger.end();
        }
    }
}