import { Data, DataWithoutScoring } from './orgcheck-api-data';
import { DataCollectionStatistics } from './orgcheck-api-recipecollection';
import { DataMatrix } from './orgcheck-api-data-matrix';
import { DatasetManagerIntf } from './orgcheck-api-datasetmanager';
import { DatasetRunInformation } from './orgcheck-api-dataset-runinformation';
import { LoggerIntf } from './orgcheck-api-logger';
import { Processor } from './orgcheck-api-processor';
import { Recipe } from './orgcheck-api-recipe';
import { RecipeAliases } from './orgcheck-api-recipes-aliases';
import { RecipeApexClasses } from '../recipe/orgcheck-api-recipe-apexclasses';
import { RecipeApexTests } from '../recipe/orgcheck-api-recipe-apextests';
import { RecipeApexTriggers } from '../recipe/orgcheck-api-recipe-apextriggers';
import { RecipeApexUncompiled } from '../recipe/orgcheck-api-recipe-apexuncomplied';
import { RecipeAppPermissions } from '../recipe/orgcheck-api-recipe-apppermissions';
import { RecipeBrowsers } from '../recipe/orgcheck-api-recipe-browsers';
import { RecipeCollaborationGroups } from '../recipe/orgcheck-api-recipe-collaborationgroups';
import { RecipeCollection } from './orgcheck-api-recipecollection';
import { RecipeCurrentUserPermissions } from '../recipe/orgcheck-api-recipe-currentuserpermissions';
import { RecipeCustomFields } from '../recipe/orgcheck-api-recipe-customfields';
import { RecipeCustomLabels } from '../recipe/orgcheck-api-recipe-customlabels';
import { RecipeCustomTabs } from '../recipe/orgcheck-api-recipe-customtabs';
import { RecipeDashboards } from '../recipe/orgcheck-api-recipe-dashboards';
import { RecipeDocuments } from '../recipe/orgcheck-api-recipe-documents';
import { RecipeEmailTemplates } from '../recipe/orgcheck-api-recipe-emailtemplates';
import { RecipeFieldPermissions } from '../recipe/orgcheck-api-recipe-fieldpermissions';
import { RecipeFlows } from '../recipe/orgcheck-api-recipe-flows';
import { RecipeGlobalView } from '../recipecollection/orgcheck-api-recipe-globalview';
import { RecipeHardcodedURLsView } from '../recipecollection/orgcheck-api-recipe-hardcodedurlsview';
import { RecipeHomePageComponents } from '../recipe/orgcheck-api-recipe-homepagecomponents';
import { RecipeInternalActiveUsers } from '../recipe/orgcheck-api-recipe-internalactiveusers';
import { RecipeKnowledgeArticles } from '../recipe/orgcheck-api-recipe-knowledgearticles';
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
import { RecipePageLayouts } from '../recipe/orgcheck-api-recipe-pagelayouts';
import { RecipePermissionSetLicenses } from '../recipe/orgcheck-api-recipe-permissionsetlicenses';
import { RecipePermissionSets } from '../recipe/orgcheck-api-recipe-permissionsets';
import { RecipeProcessBuilders } from '../recipe/orgcheck-api-recipe-processbuilders';
import { RecipeProfilePasswordPolicies } from '../recipe/orgcheck-api-recipe-profilepasswordpolicies';
import { RecipeProfileRestrictions } from '../recipe/orgcheck-api-recipe-profilerestrictions';
import { RecipeProfiles } from '../recipe/orgcheck-api-recipe-profiles';
import { RecipePublicGroups } from '../recipe/orgcheck-api-recipe-publicgroups';
import { RecipeQueues } from '../recipe/orgcheck-api-recipe-queues';
import { RecipeRecordType } from '../recipe/orgcheck-api-recipe-recordtypes';
import { RecipeReports } from '../recipe/orgcheck-api-recipe-reports';
import { RecipeStaticResources } from '../recipe/orgcheck-api-recipe-staticresources';
import { RecipeUserRoles } from '../recipe/orgcheck-api-recipe-userroles';
import { RecipeValidationRules } from '../recipe/orgcheck-api-recipe-validationrules';
import { RecipeVisualForceComponents } from '../recipe/orgcheck-api-recipe-visualforcecomponents';
import { RecipeVisualForcePages } from '../recipe/orgcheck-api-recipe-visualforcepages';
import { RecipeWebLinks } from '../recipe/orgcheck-api-recipe-weblinks';
import { RecipeWorkflows } from '../recipe/orgcheck-api-recipe-workflows';
import { SecretSauce } from './orgcheck-api-secretsauce';

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
     * @description Map of recipe collections given their alias.
     * @type {Map<string, RecipeCollection>}
     * @private
     */
    _recipeCollections;

    /**
     * @description Recipes need a dataset manager to work
     * @type {DatasetManagerIntf}
     * @private
     */
    _datasetManager;
            
    /**
     * @description Recipe Manager constructor
     * @param {DatasetManagerIntf} datasetManager - Dataset manager to inject
     * @param {LoggerIntf} logger - Logger to inject
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
        this._recipeCollections = new Map();

        // Recipes
        this._recipes.set(RecipeAliases.INTERNAL_ACTIVE_USERS, new RecipeInternalActiveUsers());
        this._recipes.set(RecipeAliases.APEX_CLASSES, new RecipeApexClasses());
        this._recipes.set(RecipeAliases.APEX_TESTS, new RecipeApexTests());
        this._recipes.set(RecipeAliases.APEX_TRIGGERS, new RecipeApexTriggers());
        this._recipes.set(RecipeAliases.APEX_UNCOMPILED, new RecipeApexUncompiled());
        this._recipes.set(RecipeAliases.APP_PERMISSIONS, new RecipeAppPermissions());
        this._recipes.set(RecipeAliases.BROWSERS, new RecipeBrowsers());
        this._recipes.set(RecipeAliases.COLLABORATION_GROUPS, new RecipeCollaborationGroups());
        this._recipes.set(RecipeAliases.CURRENT_USER_PERMISSIONS, new RecipeCurrentUserPermissions());
        this._recipes.set(RecipeAliases.CUSTOM_FIELDS, new RecipeCustomFields());
        this._recipes.set(RecipeAliases.CUSTOM_LABELS, new RecipeCustomLabels());
        this._recipes.set(RecipeAliases.CUSTOM_TABS, new RecipeCustomTabs());
        this._recipes.set(RecipeAliases.DASHBOARDS, new RecipeDashboards());
        this._recipes.set(RecipeAliases.DOCUMENTS, new RecipeDocuments());
        this._recipes.set(RecipeAliases.EMAIL_TEMPLATES, new RecipeEmailTemplates());
        this._recipes.set(RecipeAliases.FIELD_PERMISSIONS, new RecipeFieldPermissions());
        this._recipes.set(RecipeAliases.FLOWS, new RecipeFlows());
        this._recipes.set(RecipeAliases.HOME_PAGE_COMPONENTS, new RecipeHomePageComponents());
        this._recipes.set(RecipeAliases.KNOWLEDGE_ARTICLES, new RecipeKnowledgeArticles());
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
        this._recipes.set(RecipeAliases.REPORTS, new RecipeReports());
        this._recipes.set(RecipeAliases.STATIC_RESOURCES, new RecipeStaticResources());
        this._recipes.set(RecipeAliases.USER_ROLES, new RecipeUserRoles());
        this._recipes.set(RecipeAliases.VALIDATION_RULES, new RecipeValidationRules());
        this._recipes.set(RecipeAliases.VISUALFORCE_COMPONENTS, new RecipeVisualForceComponents());
        this._recipes.set(RecipeAliases.VISUALFORCE_PAGES, new RecipeVisualForcePages());
        this._recipes.set(RecipeAliases.WEBLINKS, new RecipeWebLinks());
        this._recipes.set(RecipeAliases.WORKFLOWS, new RecipeWorkflows());

        // Recipe collections
        this._recipeCollections.set(RecipeAliases.GLOBAL_VIEW, new RecipeGlobalView());
        this._recipeCollections.set(RecipeAliases.HARDCODED_URLS_VIEW, new RecipeHardcodedURLsView());
    }

    /**
     * @description Runs a designated recipe (by its alias)
     * @param {string} alias - String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Map<string, any>} [parameters] List of values to pass to the recipe
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async run(alias, parameters) {
        if (this._recipes.has(alias)) {
            return this._runRecipe(alias, parameters);
        } else if (this._recipeCollections.has(alias)) {
            return this._runRecipeCollection(alias, parameters);
        } else {
            throw new TypeError(`The given alias (${alias}) does not correspond to a registered recipe.`);
        }
    }

    /**
     * @description Cleans a designated recipe (by its alias) and the corresponding datasets.
     * @param {string} alias - String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Map<string, any>} [parameters] - List of values to pass to the recipe
     * @public
     */
    clean(alias, parameters) {
        if (this._recipes.has(alias)) {
            this._cleanRecipe(alias, parameters);
        } else if (this._recipeCollections.has(alias)) {
            this._cleanRecipeCollection(alias, parameters);
        } else {
            throw new TypeError(`The given alias (${alias}) does not correspond to a registered recipe.`);
        }
    }

    /**
     * @description Runs a designated recipe (by its alias)
     *   - Step 1. Extract the list of datasets to run that this recipe uses
     *   - Step 2. Run the given datasets and gather the global data retrieved
     *   - Step 3. Transform the retrieved data and return the final result as a Map
     * @param {string} alias - String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Map<string, any>} [parameters] List of values to pass to the recipe
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     */
    async _runRecipe(alias, parameters) {

        const section = `Run recipe "${alias}"`;
        const recipe = this._recipes.get(alias);

        // -------------------
        // STEP 1. Extract
        // -------------------
        this._logger.log(section, 'How many datasets this recipe has?');
        /** @type {Array<string | DatasetRunInformation>}} */
        let datasets;
        try {
            datasets = recipe.extract(this._logger.toSimpleLogger(section), parameters);
        } catch(error) {
            this._logger.failed(section, `An error occurred while extracting the datasets (message: ${error.message}).`);
            return;
        }
        this._logger.log(section, `This recipe has ${datasets?.length} ${datasets?.length>1?'datasets':'dataset'}: ${datasets.map((d) => d instanceof DatasetRunInformation ? d.alias : d ).join(', ')}...`);

        // -------------------
        // STEP 2. Run
        // -------------------
        let data;
        try {
            data = await this._datasetManager.run(datasets);
        } catch(error) {
            this._logger.failed(section, `An error occurred while running the dataset ${error.dataset}.`);
            return;
        }
        this._logger.log(section, 'Datasets information successfuly retrieved!');

        // -------------------
        // STEP 3. Transform
        // -------------------
        this._logger.log(section, 'This recipe will now transform all this information...');
        /** @type {Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>} */
        let finalData;
        try {
            finalData = await recipe.transform(data, this._logger.toSimpleLogger(section), parameters);
        } catch(error) {
            this._logger.failed(section, `An error occurred while transforming the data (message: ${error.message}).`);
            return;
        }
        this._logger.ended(section, 'Transformation successfuly done!');
        
        // Return value
        return finalData;
    }

    /**
     * @param {string} alias - String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Map<string, any>} [parameters] - List of values to pass to the recipe
     * @returns {Promise<Map<string, DataCollectionStatistics>>} Returns as it is the value returned by the transform method recipe.
     * @async
     */
    async _runRecipeCollection(alias, parameters) {

        const section = `Run recipe collection "${alias}"`;
        const recipeCollection = this._recipeCollections.get(alias);

        // -------------------
        // STEP 1. Extract recipes in the collection
        // -------------------
        this._logger.log(section, 'How many recipes this recipe collection has?');
        /** @type {Array<string>}} */
        let recipes;
        try {
            recipes = recipeCollection.extract(this._logger.toSimpleLogger(section), parameters);
        } catch(error) {
            this._logger.failed(section, `An error occurred while extracting the recipes (message: ${error.message}).`);
            return;
        }
        this._logger.log(section, `This recipe collection has ${recipes?.length} ${recipes?.length>1?'recipes':'recipe'}: ${recipes.join(', ')}...`);

        // -------------------
        // STEP 2. Run the recipes in the collection
        // -------------------
        /** @type {Map<string, Array<Data>>}} */
        const data = new Map();
        /** @type {Map<string, Error>}} */
        const recipesInError = new Map();
        try {
            this._logger.enableFailed(false);
            await Processor.forEach(recipes, async (/** @type {string} */ recipe) => {
                try {
                    const recipeData = await this._runRecipe(recipe, parameters);
                    if (Array.isArray(recipeData)) {
                        // @ts-ignore
                        data.set(recipe, recipeData);
                    } else {
                        throw new TypeError(`The recipe "${recipe}" did not return an array of data as expected.`);
                    }
                } catch(error) {
                    recipesInError.set(recipe, error);
                }
            });
        } catch(error) {
            this._logger.failed(section, `An error occurred while running the recipes (message: ${error.message}).`);
            return;
        } finally {
            this._logger.enableFailed(true);
        }
        this._logger.log(section, 'All datasets information successfuly retrieved from recipes!');

        // -------------------
        // STEP 3. Transform the recipe collection finally
        // -------------------
        this._logger.log(section, 'This recipe collection will now transform all this information...');
        const listRuleIds = recipeCollection.filterByScoreRuleIds(this._logger.toSimpleLogger(section), parameters);
        const isRuleFilterOn = listRuleIds?.length > 0 || false;
        /** @type {Map<string, DataCollectionStatistics>} */
        const finalData = new Map();
        try {
            // Add the successful recipes and their stats in the final list
            await Processor.forEach(data, (/** @type {Array<Data>} */records, /** @type {string} */ key) => {
                const onlyBadRecords = records?.filter((r) => {
                    if (r.score && r.score > 0) {
                        if (isRuleFilterOn === true) {
                            return r.badReasonIds?.some((id) => listRuleIds.includes(id)) ?? false;
                        } else {
                            return true;
                        }
                    } else {
                        return false;
                    }
                })?.sort((a, b) => a.score > b.score ? -1 : 1);
                const series = new Map();
                onlyBadRecords?.forEach((d) => { 
                    d.badReasonIds.filter(id => { 
                        return isRuleFilterOn === true ? listRuleIds.includes(id) : true;
                    }).forEach(id => {
                        series.set(id, series.has(id) ? (series.get(id) + 1) : 1);
                    });
                });
                const stats = new DataCollectionStatistics();
                stats.hadError = false;
                stats.countAll = (records?.length ?? 0);
                stats.countBad = (onlyBadRecords?.length ?? 0);
                stats.countBadByRule = Array.from(series.keys()).map((id) => { return { 
                    ruleId: id,
                    ruleName: SecretSauce.GetScoreRuleDescription(id), 
                    count: series.get(id)
                }});
                stats.data = onlyBadRecords;
                finalData.set(key, stats);
            });

            // Add the recipes in error in the final list
            recipesInError.forEach((lastError, recipe) => {
                const stats = new DataCollectionStatistics();
                stats.hadError = true;
                stats.lastErrorMessage = lastError?.message || 'Unknown error';
                finalData.set(recipe, stats);
            });
        } catch(error) {
            this._logger.failed(section, `An error occurred while transforming the data (message: ${error.message}).`);
            return;
        }
        this._logger.ended(section, 'Transformation successfuly done!');

        // Return value
        return finalData;
    }

    /**
     * @description Cleans a designated recipe (by its alias) and the corresponding datasets.
     *    - Step 1. Extract the list of datasets to clean that this recipe uses
     *    - Step 2. Clean the given datasets
     * @param {string} alias - String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Map<string, any>} [parameters] List of values to pass to the recipe
     * @public
     */
    _cleanRecipe(alias, parameters) {

        const section = `Clean recipe "${alias}"`;
        const recipe = this._recipes.get(alias);

        // -------------------
        // STEP 1. Extract
        // -------------------
        this._logger.log(section, 'How many datasets this recipe has?');
        let datasets;
        try {
            datasets = recipe.extract(this._logger.toSimpleLogger(section), parameters);
        } catch(error) {
            this._logger.failed(section, `An error occurred while extracting the datasets (message: ${error.message}).`);
            return;
        }
        this._logger.log(section, `This recipe has ${datasets?.length} ${datasets?.length>1?'datasets':'dataset'}: ${datasets.map((d) => d instanceof DatasetRunInformation ? d.alias : d ).join(', ')}...`);

        // -------------------
        // STEP 2. Clean
        // -------------------
        this._logger.log(section, 'Clean all datasets...');
        try {
            this._datasetManager.clean(datasets);
        } catch(error) {
            this._logger.failed(section, `An error occurred while cleaning the datasets (message: ${error.message}).`);
            return;
        }
        this._logger.ended(section, 'Datasets succesfully cleaned!');
    }


    /**
     * @param {string} alias - String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Map<string, any>} [parameters] List of values to pass to the recipe
     * @public
     */
    _cleanRecipeCollection(alias, parameters) {

        const section = `Clean recipe collection "${alias}"`;
        const recipeCollection = this._recipeCollections.get(alias);

        // -------------------
        // STEP 1. Extract
        // -------------------
        this._logger.log(section, 'How many recipes this recipe collection has?');
        /** @type {Array<string>}} */
        let recipes;
        try {
            recipes = recipeCollection.extract(this._logger.toSimpleLogger(section), parameters);
        } catch(error) {
            this._logger.failed(section, `An error occurred while extracting the recipes (message: ${error.message}).`);
            return;
        }
        this._logger.log(section, `This recipe collection has ${recipes?.length} ${recipes?.length>1?'recipes':'recipe'}: ${recipes.join(', ')}...`);

        // -------------------
        // STEP 2. Clean
        // -------------------
        this._logger.log(section, 'Clean all datasets of these recipes...');
        try {
            recipes.forEach((recipe) => { this._cleanRecipe(recipe, parameters); });
        } catch(error) {
            this._logger.failed(section, `An error occurred while cleaning the datasets (message: ${error.message}).`);
            return;
        }
        this._logger.ended(section, 'Datasets of these recipes succesfully cleaned!');
    }
}