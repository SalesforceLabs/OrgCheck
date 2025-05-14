import { Data, DataWithoutScoring } from './orgcheck-api-data';
import { DataMatrix } from './orgcheck-api-data-matrix';
import { DatasetManagerIntf } from './orgcheck-api-datasetmanager';
import { DatasetRunInformation } from './orgcheck-api-dataset-runinformation';
import { LoggerIntf } from './orgcheck-api-logger';
import { Recipe } from './orgcheck-api-recipe';
import { RecipeActiveUsers } from '../recipe/orgcheck-api-recipe-activeusers';
import { RecipeAliases } from './orgcheck-api-recipes-aliases';
import { RecipeApexClasses } from '../recipe/orgcheck-api-recipe-apexclasses';
import { RecipeApexTriggers } from '../recipe/orgcheck-api-recipe-apextriggers';
import { RecipeAppPermissions } from '../recipe/orgcheck-api-recipe-apppermissions';
import { RecipeCurrentUserPermissions } from '../recipe/orgcheck-api-recipe-currentuserpermissions';
import { RecipeCustomFields } from '../recipe/orgcheck-api-recipe-customfields';
import { RecipeCustomLabels } from '../recipe/orgcheck-api-recipe-customlabels';
import { RecipeFlows } from '../recipe/orgcheck-api-recipe-flows';
import { RecipeLightningAuraComponents } from '../recipe/orgcheck-api-recipe-lightningauracomponents';
import { RecipeLightningPages } from '../recipe/orgcheck-api-recipe-lightningpages';
import { RecipeLightningWebComponents } from '../recipe/orgcheck-api-recipe-lightningwebcomponents';
import { RecipeManagerIntf } from './orgcheck-api-recipemanager';
import { RecipeObject } from '../recipe/orgcheck-api-recipe-object';
import { RecipeObjectPermissions } from '../recipe/orgcheck-api-recipe-objectpermissions';
import { RecipeObjects } from '../recipe/orgcheck-api-recipe-objects';
import { RecipeObjectTypes } from '../recipe/orgcheck-api-recipe-objecttypes';
import { RecipeOrganization } from '../recipe/orgcheck-api-recipe-organization';
import { RecipePackages } from '../recipe/orgcheck-api-recipe-packages';
import { RecipePermissionSets } from '../recipe/orgcheck-api-recipe-permissionsets';
import { RecipeProcessBuilders } from '../recipe/orgcheck-api-recipe-processbuilders';
import { RecipeProfilePasswordPolicies } from '../recipe/orgcheck-api-recipe-profilepasswordpolicies';
import { RecipeProfileRestrictions } from '../recipe/orgcheck-api-recipe-profilerestrictions';
import { RecipeProfiles } from '../recipe/orgcheck-api-recipe-profiles';
import { RecipePublicGroups } from '../recipe/orgcheck-api-recipe-publicgroups';
import { RecipeQueues } from '../recipe/orgcheck-api-recipe-queues';
import { RecipeUserRoles } from '../recipe/orgcheck-api-recipe-userroles';
import { RecipeVisualForceComponents } from '../recipe/orgcheck-api-recipe-visualforcecomponents';
import { RecipeVisualForcePages } from '../recipe/orgcheck-api-recipe-visualforcepages';
import { RecipeWorkflows } from '../recipe/orgcheck-api-recipe-workflows';
import { RecipeApexTests } from '../recipe/orgcheck-api-recipe-apextests';
import { RecipeApexUncompiled } from '../recipe/orgcheck-api-recipe-apexuncomplied';
import { RecipeFieldPermissions } from '../recipe/orgcheck-api-recipe-fieldpermissions';
import { RecipeValidationRules } from '../recipe/orgcheck-api-recipe-validationrules';
import { RecipePermissionSetLicenses } from '../recipe/orgcheck-api-recipe-permissionsetlicenses';
import { RecipeRecordType } from '../recipe/orgcheck-api-recipe-recordtypes';
import { RecipePageLayouts } from '../recipe/orgcheck-api-recipe-pagelayouts';
import { RecipeDocuments } from '../recipe/orgcheck-api-recipe-documents';

/**
 * @description Recipe Manager
 */ 
export class RecipeManager extends RecipeManagerIntf {

    /**
     * @description Private logger to use
     * @type {LoggerIntf}
     * @private
     */
    _logger;

    /**
     * @description Map of recipes given their alias.
     * @type {Map<string, Recipe>}
     * @private
     */
    _recipes;

    /**
     * @description Recipes need a dataset manager to work
     * @type {DatasetManagerIntf}
     * @private
     */
    _datasetManager;
            
    /**
     * @description Recipe Manager constructor
     * @param {DatasetManagerIntf} datasetManager 
     * @param {LoggerIntf} logger
     */
    constructor(datasetManager, logger) {
        super();

        if (datasetManager instanceof DatasetManagerIntf === false) {
            throw new TypeError('The given datasetManager is not an instance of DatasetManagerIntf.');
        }
        if (logger instanceof LoggerIntf === false) {
            throw new TypeError('The given logger is not an instance of LoggerIntf.');
        }

        this._datasetManager = datasetManager;
        this._logger = logger;
        this._recipes = new Map();

        this._recipes.set(RecipeAliases.ACTIVE_USERS, new RecipeActiveUsers());
        this._recipes.set(RecipeAliases.APEX_CLASSES, new RecipeApexClasses());
        this._recipes.set(RecipeAliases.APEX_TESTS, new RecipeApexTests());
        this._recipes.set(RecipeAliases.APEX_TRIGGERS, new RecipeApexTriggers());
        this._recipes.set(RecipeAliases.APEX_UNCOMPILED, new RecipeApexUncompiled());
        this._recipes.set(RecipeAliases.APP_PERMISSIONS, new RecipeAppPermissions())
        this._recipes.set(RecipeAliases.CURRENT_USER_PERMISSIONS, new RecipeCurrentUserPermissions());
        this._recipes.set(RecipeAliases.CUSTOM_FIELDS, new RecipeCustomFields());
        this._recipes.set(RecipeAliases.CUSTOM_LABELS, new RecipeCustomLabels());
        this._recipes.set(RecipeAliases.DOCUMENTS, new RecipeDocuments());
        this._recipes.set(RecipeAliases.FIELD_PERMISSIONS, new RecipeFieldPermissions());
        this._recipes.set(RecipeAliases.FLOWS, new  RecipeFlows());
        this._recipes.set(RecipeAliases.LIGHTNING_AURA_COMPONENTS, new RecipeLightningAuraComponents());
        this._recipes.set(RecipeAliases.LIGHTNING_PAGES, new RecipeLightningPages());
        this._recipes.set(RecipeAliases.LIGHTNING_WEB_COMPONENTS, new RecipeLightningWebComponents());
        this._recipes.set(RecipeAliases.OBJECT, new RecipeObject());
        this._recipes.set(RecipeAliases.OBJECT_PERMISSIONS, new RecipeObjectPermissions());
        this._recipes.set(RecipeAliases.OBJECTS, new RecipeObjects());
        this._recipes.set(RecipeAliases.OBJECT_TYPES, new RecipeObjectTypes());
        this._recipes.set(RecipeAliases.ORGANIZATION, new RecipeOrganization());
        this._recipes.set(RecipeAliases.PACKAGES, new RecipePackages());
        this._recipes.set(RecipeAliases.PAGE_LAYOUTS, new RecipePageLayouts());
        this._recipes.set(RecipeAliases.PERMISSION_SETS, new RecipePermissionSets());
        this._recipes.set(RecipeAliases.PERMISSION_SET_LICENSES, new RecipePermissionSetLicenses());
        this._recipes.set(RecipeAliases.PROCESS_BUILDERS, new RecipeProcessBuilders());
        this._recipes.set(RecipeAliases.PROFILE_PWD_POLICIES, new RecipeProfilePasswordPolicies());
        this._recipes.set(RecipeAliases.PROFILE_RESTRICTIONS, new RecipeProfileRestrictions());
        this._recipes.set(RecipeAliases.PROFILES, new RecipeProfiles());
        this._recipes.set(RecipeAliases.PUBLIC_GROUPS, new RecipePublicGroups());
        this._recipes.set(RecipeAliases.QUEUES, new RecipeQueues());
        this._recipes.set(RecipeAliases.RECORD_TYPES, new RecipeRecordType());
        this._recipes.set(RecipeAliases.USER_ROLES, new RecipeUserRoles());
        this._recipes.set(RecipeAliases.VALIDATION_RULES, new RecipeValidationRules());
        this._recipes.set(RecipeAliases.VISUALFORCE_COMPONENTS, new RecipeVisualForceComponents());
        this._recipes.set(RecipeAliases.VISUALFORCE_PAGES, new RecipeVisualForcePages());
        this._recipes.set(RecipeAliases.WORKFLOWS, new RecipeWorkflows());        
    }

    /**
     * @description Runs a designated recipe (by its alias)
     *   - Step 1. Extract the list of datasets to run that this recipe uses
     *   - Step 2. Run the given datasets and gather the global data retrieved
     *   - Step 3. Transform the retrieved data and return the final result as a Map
     * @param {string} alias String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Array<string|object>} parameters List of values to pass to the exract and tranform methods of the recipe.
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>} Returns as it is the value returned by the transform method recipe.
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
         * @type {Recipe}
         */
        const recipe = this._recipes.get(alias);

        // -------------------
        // Extract
        // -------------------
        this._logger.log(section, 'How many datasets this recipe has?');

        /**
         * @description The list of datasets to be used by this recipe
         * @type {Array<string | DatasetRunInformation>}}
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
        this._logger.log(section, `This recipe has ${datasets?.length} ${datasets?.length>1?'datasets':'dataset'}: ${datasets.map((d) => d instanceof DatasetRunInformation ? d.alias : d ).join(', ')}...`);
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
         * @type {Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map}
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
        this._logger.log(section, `This recipe has ${datasets?.length} ${datasets?.length>1?'datasets':'dataset'}: ${datasets.map((d) => d instanceof DatasetRunInformation ? d.alias : d ).join(', ')}...`);

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