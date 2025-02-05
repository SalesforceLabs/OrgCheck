import { OrgCheckData, OrgCheckDataWithoutScoring } from './orgcheck-api-data';
import { OrgCheckDataMatrix } from './orgcheck-api-data-matrix';
import { OrgCheckDatasetManagerIntf } from './orgcheck-api-datasetmanager';
import { OrgCheckDatasetRunInformation } from './orgcheck-api-dataset-runinformation';
import { OrgCheckLoggerIntf } from './orgcheck-api-logger';
import { OrgCheckRecipe } from './orgcheck-api-recipe';
import { OrgCheckRecipeActiveUsers } from '../recipe/orgcheck-api-recipe-activeusers';
import { OrgCheckRecipeAliases } from './orgcheck-api-recipes-aliases';
import { OrgCheckRecipeApexClasses } from '../recipe/orgcheck-api-recipe-apexclasses';
import { OrgCheckRecipeApexTriggers } from '../recipe/orgcheck-api-recipe-apextriggers';
import { OrgCheckRecipeAppPermissions } from '../recipe/orgcheck-api-recipe-apppermissions';
import { OrgCheckRecipeCurrentUserPermissions } from '../recipe/orgcheck-api-recipe-currentuserpermissions';
import { OrgCheckRecipeCustomFields } from '../recipe/orgcheck-api-recipe-customfields';
import { OrgCheckRecipeCustomLabels } from '../recipe/orgcheck-api-recipe-customlabels';
import { OrgCheckRecipeFlows } from '../recipe/orgcheck-api-recipe-flows';
import { OrgCheckRecipeLightningAuraComponents } from '../recipe/orgcheck-api-recipe-lightningauracomponents';
import { OrgCheckRecipeLightningPages } from '../recipe/orgcheck-api-recipe-lightningpages';
import { OrgCheckRecipeLightningWebComponents } from '../recipe/orgcheck-api-recipe-lightningwebcomponents';
import { OrgCheckRecipeManagerIntf } from './orgcheck-api-recipemanager';
import { OrgCheckRecipeObject } from '../recipe/orgcheck-api-recipe-object';
import { OrgCheckRecipeObjectPermissions } from '../recipe/orgcheck-api-recipe-objectpermissions';
import { OrgCheckRecipeObjects } from '../recipe/orgcheck-api-recipe-objects';
import { OrgCheckRecipeObjectTypes } from '../recipe/orgcheck-api-recipe-objecttypes';
import { OrgCheckRecipeOrganization } from '../recipe/orgcheck-api-recipe-organization';
import { OrgCheckRecipePackages } from '../recipe/orgcheck-api-recipe-packages';
import { OrgCheckRecipePermissionSets } from '../recipe/orgcheck-api-recipe-permissionsets';
import { OrgCheckRecipeProcessBuilders } from '../recipe/orgcheck-api-recipe-processbuilders';
import { OrgCheckRecipeProfilePasswordPolicies } from '../recipe/orgcheck-api-recipe-profilepasswordpolicies';
import { OrgCheckRecipeProfileRestrictions } from '../recipe/orgcheck-api-recipe-profilerestrictions';
import { OrgCheckRecipeProfiles } from '../recipe/orgcheck-api-recipe-profiles';
import { OrgCheckRecipePublicGroups } from '../recipe/orgcheck-api-recipe-publicgroups';
import { OrgCheckRecipeQueues } from '../recipe/orgcheck-api-recipe-queues';
import { OrgCheckRecipeUserRoles } from '../recipe/orgcheck-api-recipe-userroles';
import { OrgCheckRecipeVisualForceComponents } from '../recipe/orgcheck-api-recipe-visualforcecomponents';
import { OrgCheckRecipeVisualForcePages } from '../recipe/orgcheck-api-recipe-visualforcepages';
import { OrgCheckRecipeWorkflows } from '../recipe/orgcheck-api-recipe-workflows';
import { OrgCheckRecipeApexTests } from '../recipe/orgcheck-api-recipe-apextests';
import { OrgCheckRecipeApexUncompiled } from '../recipe/orgcheck-api-recipe-apexuncomplied';
import { OrgCheckRecipeFieldPermissions } from '../recipe/orgcheck-api-recipe-fieldpermissions';
import { OrgCheckRecipeValidationRules } from '../recipe/orgcheck-api-recipe-validationrules';
import { OrgCheckRecipePermissionSetLicenses } from '../recipe/orgcheck-api-recipe-permissionsetlicenses';

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
        this._recipes.set(OrgCheckRecipeAliases.APEX_TESTS, new OrgCheckRecipeApexTests());
        this._recipes.set(OrgCheckRecipeAliases.APEX_TRIGGERS, new OrgCheckRecipeApexTriggers());
        this._recipes.set(OrgCheckRecipeAliases.APEX_UNCOMPILED, new OrgCheckRecipeApexUncompiled());
        this._recipes.set(OrgCheckRecipeAliases.APP_PERMISSIONS, new OrgCheckRecipeAppPermissions())
        this._recipes.set(OrgCheckRecipeAliases.CURRENT_USER_PERMISSIONS, new OrgCheckRecipeCurrentUserPermissions());
        this._recipes.set(OrgCheckRecipeAliases.CUSTOM_FIELDS, new OrgCheckRecipeCustomFields());
        this._recipes.set(OrgCheckRecipeAliases.CUSTOM_LABELS, new OrgCheckRecipeCustomLabels());
        this._recipes.set(OrgCheckRecipeAliases.FIELD_PERMISSIONS, new OrgCheckRecipeFieldPermissions());
        this._recipes.set(OrgCheckRecipeAliases.FLOWS, new  OrgCheckRecipeFlows());
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
        this._recipes.set(OrgCheckRecipeAliases.PERMISSION_SET_LICENSES, new OrgCheckRecipePermissionSetLicenses());
        this._recipes.set(OrgCheckRecipeAliases.PROCESS_BUILDERS, new OrgCheckRecipeProcessBuilders());
        this._recipes.set(OrgCheckRecipeAliases.PROFILE_PWD_POLICIES, new OrgCheckRecipeProfilePasswordPolicies());
        this._recipes.set(OrgCheckRecipeAliases.PROFILE_RESTRICTIONS, new OrgCheckRecipeProfileRestrictions());
        this._recipes.set(OrgCheckRecipeAliases.PROFILES, new OrgCheckRecipeProfiles());
        this._recipes.set(OrgCheckRecipeAliases.PUBLIC_GROUPS, new OrgCheckRecipePublicGroups());
        this._recipes.set(OrgCheckRecipeAliases.QUEUES, new OrgCheckRecipeQueues());
        this._recipes.set(OrgCheckRecipeAliases.USER_ROLES, new OrgCheckRecipeUserRoles());
        this._recipes.set(OrgCheckRecipeAliases.VALIDATION_RULES, new OrgCheckRecipeValidationRules());
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

        // -------------------
        // Extract
        // -------------------
        this._logger.log(section, 'How many datasets this recipe has?');

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
            this._logger.failed(section, error);
            throw error;
        }
        this._logger.log(section, `This recipe has ${datasets?.length} ${datasets?.length>1?'datasets':'dataset'}: ${datasets.map((d) => d instanceof OrgCheckDatasetRunInformation ? d.alias : d ).join(', ')}...`);
        let data;
        try {
            data = await this._datasetManager.run(datasets);
        } catch(error) {
            this._logger.failed(section, error);
            throw error;
        }
        this._logger.log(section, 'Datasets information successfuly retrieved!');

        // -------------------
        // Transform
        // -------------------
        this._logger.log(section, 'This recipe will now transform all this information...');

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
            this._logger.failed(section, error);
            throw error;
        }
        this._logger.ended(section, 'Transformation successfuly done!');

        // Return value
        return finalData;
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

        // -------------------
        // Extract
        // -------------------
        this._logger.log(section, 'How many datasets this recipe has?');
        let datasets;
        try {
            datasets = recipe.extract(
                // local logger
                this._logger.toSimpleLogger(section),
                // all parameters
                ...parameters
            );
        } catch(error) {
            this._logger.failed(section, error);
            throw error;
        }
        this._logger.log(section, `This recipe has ${datasets?.length} ${datasets?.length>1?'datasets':'dataset'}: ${datasets.map((d) => d instanceof OrgCheckDatasetRunInformation ? d.alias : d ).join(', ')}...`);

        // -------------------
        // Clean
        // -------------------
        this._logger.log(section, 'Clean all datasets...');
        try {
            this._datasetManager.clean(datasets);
        } catch(error) {
            this._logger.failed(section, error);
            throw error;
        }
        this._logger.ended(section, 'Datasets succesfully cleaned!');
    }
}