import { Data, DataWithScore } from 'src/api/core/orgcheck-api-data';
import { DataMatrixIntf } from 'src/api/core/orgcheck-api-data-matrix';
import { DatasetManagerIntf } from 'src/api/core/orgcheck-api-datasetmanager';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { LoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { RecipeAliases } from 'src/api/core/orgcheck-api-recipes-aliases';
import { RecipeApexClasses, RecipeApexTests, RecipeApexUncompiled } from 'src/api/recipe/orgcheck-api-recipe-apexclasses';
import { RecipeApexTriggers } from 'src/api/recipe/orgcheck-api-recipe-apextriggers';
import { RecipeAppPermissions } from 'src/api/recipe/orgcheck-api-recipe-apppermissions';
import { RecipeBrowsers } from 'src/api/recipe/orgcheck-api-recipe-browsers';
import { RecipeCollaborationGroups } from 'src/api/recipe/orgcheck-api-recipe-collaborationgroups';
import { DataCollectionStatisticsOK, DataCollectionStatisticsWithError, RecipeCollection } from 'src/api/core/orgcheck-api-recipecollection';
import { RecipeCurrentUserPermissions } from 'src/api/recipe/orgcheck-api-recipe-currentuserpermissions';
import { RecipeCustomFields } from 'src/api/recipe/orgcheck-api-recipe-customfields';
import { RecipeCustomLabels } from 'src/api/recipe/orgcheck-api-recipe-customlabels';
import { RecipeCustomTabs } from 'src/api/recipe/orgcheck-api-recipe-customtabs';
import { RecipeDashboards } from 'src/api/recipe/orgcheck-api-recipe-dashboards';
import { RecipeDocuments } from 'src/api/recipe/orgcheck-api-recipe-documents';
import { RecipeEmailTemplates } from 'src/api/recipe/orgcheck-api-recipe-emailtemplates';
import { RecipeFieldPermissions } from 'src/api/recipe/orgcheck-api-recipe-fieldpermissions';
import { RecipeFlows } from 'src/api/recipe/orgcheck-api-recipe-flows';
import { RecipeGlobalView } from 'src/api/recipecollection/orgcheck-api-recipe-globalview';
import { RecipeHardcodedURLsView } from 'src/api/recipecollection/orgcheck-api-recipe-hardcodedurlsview';
import { RecipeHomePageComponents } from 'src/api/recipe/orgcheck-api-recipe-homepagecomponents';
import { RecipeInternalActiveUsers } from 'src/api/recipe/orgcheck-api-recipe-internalactiveusers';
import { RecipeKnowledgeArticles } from 'src/api/recipe/orgcheck-api-recipe-knowledgearticles';
import { RecipeLightningAuraComponents } from 'src/api/recipe/orgcheck-api-recipe-lightningauracomponents';
import { RecipeLightningPages } from 'src/api/recipe/orgcheck-api-recipe-lightningpages';
import { RecipeLightningWebComponents } from 'src/api/recipe/orgcheck-api-recipe-lightningwebcomponents';
import { RecipeManagerError, RecipeManagerIntf } from 'src/api/core/orgcheck-api-recipemanager';
import { RecipeObject, SfdcObjectAsTable } from 'src/api/recipe/orgcheck-api-recipe-object';
import { RecipeObjectPermissions } from 'src/api/recipe/orgcheck-api-recipe-objectpermissions';
import { RecipeObjects } from 'src/api/recipe/orgcheck-api-recipe-objects';
import { RecipeObjectTypes } from 'src/api/recipe/orgcheck-api-recipe-objecttypes';
import { RecipeOrganization } from 'src/api/recipe/orgcheck-api-recipe-organization';
import { RecipePackages } from 'src/api/recipe/orgcheck-api-recipe-packages';
import { RecipePageLayouts } from 'src/api/recipe/orgcheck-api-recipe-pagelayouts';
import { RecipePermissionSetLicenses } from 'src/api/recipe/orgcheck-api-recipe-permissionsetlicenses';
import { RecipePermissionSets } from 'src/api/recipe/orgcheck-api-recipe-permissionsets';
import { RecipeProcessBuilders } from 'src/api/recipe/orgcheck-api-recipe-processbuilders';
import { RecipeProfilePasswordPolicies } from 'src/api/recipe/orgcheck-api-recipe-profilepasswordpolicies';
import { RecipeProfileRestrictions } from 'src/api/recipe/orgcheck-api-recipe-profilerestrictions';
import { RecipeProfiles } from 'src/api/recipe/orgcheck-api-recipe-profiles';
import { RecipeQueues, RecipePublicGroups } from 'src/api/recipe/orgcheck-api-recipe-groups';
import { RecipeRecordType } from 'src/api/recipe/orgcheck-api-recipe-recordtypes';
import { RecipeReports } from 'src/api/recipe/orgcheck-api-recipe-reports';
import { RecipeStaticResources } from 'src/api/recipe/orgcheck-api-recipe-staticresources';
import { RecipeUserRoles } from 'src/api/recipe/orgcheck-api-recipe-userroles';
import { RecipeValidationRules } from 'src/api/recipe/orgcheck-api-recipe-validationrules';
import { RecipeVisualForceComponents } from 'src/api/recipe/orgcheck-api-recipe-visualforcecomponents';
import { RecipeVisualForcePages } from 'src/api/recipe/orgcheck-api-recipe-visualforcepages';
import { RecipeWebLinks } from 'src/api/recipe/orgcheck-api-recipe-weblinks';
import { RecipeWorkflows } from 'src/api/recipe/orgcheck-api-recipe-workflows';
import { DataCollectionStatisticsIntf } from 'src/api/core/orgcheck-api-data-datacollectionstats';
import { RecipeScoreRules } from 'src/api/recipe/orgcheck-api-recipe-scorerules';
import { Recipe, ServedRecipe } from 'src/api/core/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';

/**
 * @description Recipe Manager
 */ 
export class RecipeManager implements RecipeManagerIntf {

    /**
     * @description Private logger to use
     * @type {LoggerIntf}
     * @private
     */
    private _logger: LoggerIntf;

    /**
     * @description Map of recipes given their alias
     * @type {Map<RecipeAliases, Recipe<any> | ServedRecipe<any, any>>}
     * @private
     */
    private _recipes: Map<RecipeAliases, Recipe<any> | ServedRecipe<any, any>>;

    /**
     * @description Map of recipe collections given their alias.
     * @type {Map<RecipeAliases, RecipeCollection>}
     * @private
     */
    private _recipeCollections: Map<RecipeAliases, RecipeCollection>;

    /**
     * @description Recipes need a dataset manager to work
     * @type {DatasetManagerIntf}
     * @private
     */
    private _datasetManager: DatasetManagerIntf;
            
    /**
     * @description Recipe Manager constructor
     * @param {DatasetManagerIntf} datasetManager - Dataset manager to inject
     * @param {LoggerIntf} logger - Logger to inject
     */
    constructor(datasetManager: DatasetManagerIntf, logger: LoggerIntf) {

        this._datasetManager = datasetManager;
        this._logger = logger;
        this._recipes = new Map<RecipeAliases, Recipe<Data | Data[] | DataMatrixIntf | Map<string, boolean>>>();
        this._recipeCollections = new Map<RecipeAliases, RecipeCollection>();

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
        this._recipes.set(RecipeAliases.SCORE_RULES, new RecipeScoreRules());
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
     * @description Prepare a designated recipe (by its alias)
     *   - Step 1. Extract the list of datasets to run that this recipe uses
     *   - Step 2. Run the given datasets and gather the global data retrieved
     *   - Step 3. Combine/mix all the data together
     *   - Step 4. Return the mixture
     * @param {RecipeAliases} alias -String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Map<string, any>} [parameters] - List of values to pass to the recipe
     * @returns {Promise<Data | Data[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]>} Returns the mixture
     * @throws {RecipeManagerError}
     * @async
     * @public
     */
    public async prepare(alias: RecipeAliases, parameters: Map<string, any>): Promise<Data | Data[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]> {
        if (this._recipes.has(alias)) {
            return await this._prepareRecipe(alias, parameters);
        } else if (this._recipeCollections.has(alias)) {
            return await this._prepareRecipeCollection(alias, parameters);
        } else {
            throw new RecipeManagerError(alias, `The given alias (${alias}) does not correspond to a registered recipe.`);
        }
    }

    /**
     * @description Serve the mixture from a designated recipe to a table
     * @param {RecipeAliases} alias -String representation of a recipe
     * @param {Data | Data[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]} [mixture] - The mixture
     * @returns {Promise<Table | SfdcObjectAsTable>} Returns the mixture as a table
     * @throws {RecipeManagerError}
     * @async
     * @public
     */
    public async serveToTable(alias: RecipeAliases, mixture: Data | Data[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]): Promise<Table | SfdcObjectAsTable> {
        let recipe = this._recipes.get(alias) ?? this._recipeCollections.get(alias);
        if (recipe) {
            try {
                // @ts-ignore
                return await recipe.serveToTable(mixture);
            } catch (error) {
                throw new RecipeManagerError(alias, `The given alias (${alias}) does not correspond to a registered recipe that can be served.`, error);
            }
        } else {
            throw new RecipeManagerError(alias, `The given alias (${alias}) does not correspond to a registered recipe.`);
        }
    }

    /**
     * @description Serve the mixture from a designated recipe to go
     * @param {RecipeAliases} alias -String representation of a recipe
     * @param {Data | Data[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]} [mixture] - The mixture
     * @returns {Promise<ExportedTable | ExportedTable[]>} Returns the mixture as to go
     * @throws {RecipeManagerError}
     * @async
     * @public
     */
    public async serveToGo(alias: RecipeAliases, mixture: Data | Data[] | DataMatrixIntf | Map<string, boolean> | DataCollectionStatisticsIntf[]): Promise<ExportedTable | ExportedTable[]> {
        let recipe = this._recipes.get(alias) ?? this._recipeCollections.get(alias);
        if (recipe) {
            try {
                // @ts-ignore
                return await recipe.serveToGo(mixture);
            } catch (error) {
                throw new RecipeManagerError(alias, `The given alias (${alias}) does not correspond to a registered recipe that can be served.`, error);
            }
        } else {
            throw new RecipeManagerError(alias, `The given alias (${alias}) does not correspond to a registered recipe.`);
        }
    }

    /**
     * @description Cleans a designated recipe (by its alias) and the corresponding datasets.
     * @param {RecipeAliases} alias -String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Map<string, any>} [parameters] - List of values to pass to the recipe
     * @throws {RecipeManagerError}
     * @public
     */
    public clean(alias: RecipeAliases, parameters: Map<string, any>) {
        if (this._recipes.has(alias)) {
            this._cleanRecipe(alias, parameters);
        } else if (this._recipeCollections.has(alias)) {
            this._cleanRecipeCollection(alias, parameters);
        } else {
            throw new RecipeManagerError(alias, `The given alias (${alias}) does not correspond to a registered recipe.`);
        }
    }

    /**
     * @description Returns the cache stamp for a designated recipe (by its alias)
     * @param {RecipeAliases} alias -String representation of a recipe
     * @param {Map<string, any>} [parameters] - List of values to pass to the recipe
     * @returns {Promise<string>} Returns the cache stamp
     * @public
     */
    public cachestamp(alias: RecipeAliases, parameters: Map<string, any>): string {
        if (this._recipes.has(alias)) {
            const recipe = this._recipes.get(alias);
            let cachestamp = '';
            recipe?.mixDependencies().forEach((p) => {
                cachestamp += `${p}:${JSON.stringify(parameters.get(p)) ?? '-'},`;
            });
            return cachestamp;
        } else if (this._recipeCollections.has(alias)) {
            const recipeCollection = this._recipeCollections.get(alias);
            let cachestamp = '';
            recipeCollection?.ingredientsDependencies().forEach((p) => {
                cachestamp += `${p}:${JSON.stringify(parameters.get(p)) ?? '-'},`;
            });
            return cachestamp;
        } else {
            throw new RecipeManagerError(alias, `The given alias (${alias}) does not correspond to a registered recipe.`);
        }
    }

    /**
     * @description Runs a designated recipe (by its alias)
     *   - Step 1. Extract the list of datasets to run that this recipe uses
     *   - Step 2. Run the given datasets and gather the global data retrieved
     *   - Step 3. Transform the retrieved data and return the final result as a Map
     * @param {RecipeAliases} alias -String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Map<string, any>} [parameters] List of values to pass to the recipe
     * @returns {Promise<Data | Data[] | DataMatrixIntf | Map<string, boolean>>} Returns the value from the recipe or undefined if something bad happens
     * @throws {RecipeManagerError}
     * @async
     */
    private async _prepareRecipe(alias: RecipeAliases, parameters: Map<string, any>): Promise<Data | Data[] | DataMatrixIntf | Map<string, boolean>> {

        const section = `Run recipe "${alias}"`;
        const recipe = this._recipes.get(alias);
        if (recipe === undefined) {
            throw new RecipeManagerError(alias, `The recipe with alias: ${alias} was not found.`)
        }

        // -------------------
        // STEP 1. Extract
        // -------------------
        this._logger.log(section, 'How many datasets this recipe has?');
        let datasets: Array<string | DatasetRunInformation>;
        try {
            datasets = recipe.ingredients(this._logger.toSimpleLogger(section), parameters);
        } catch (error) {
            throw new RecipeManagerError(alias, `An error occurred while extracting the datasets (message: ${error.message}).`, error);
        }
        this._logger.log(section, `This recipe has ${datasets?.length} ${datasets?.length>1?'datasets':'dataset'}: ${datasets.map((d) => d instanceof DatasetRunInformation ? d.alias : d ).join(', ')}...`);

        // -------------------
        // STEP 2. Run
        // -------------------
        let data: Map<string, any>;
        try {
            data = await this._datasetManager.run(datasets);
        } catch(error) {
            throw new RecipeManagerError(alias, `An error occurred while running the dataset (message: ${error.message}).`, error);
        }
        this._logger.log(section, 'Datasets information successfuly retrieved!');

        // -------------------
        // STEP 3. Transform
        // -------------------
        this._logger.log(section, 'This recipe will now transform all this information...');
        let finalData: Array<Data> | DataMatrixIntf | Data | Map<string, any>;
        try {
            finalData = await recipe.mix(data, this._logger.toSimpleLogger(section), parameters);
        } catch(error) {
            throw new RecipeManagerError(alias, `An error occurred while transforming the data (message: ${error.message}).`, error);
        }
        this._logger.finalLog(section, 'Transformation successfuly done!');
        
        // Return value
        return finalData;
    }

    /**
     * @param {RecipeAliases} alias -String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Map<string, any>} [parameters] - List of values to pass to the recipe
     * @returns {Promise<DataCollectionStatisticsIntf[]>} Returns the value from the recipe collection or undefined if something bad happens.
     * @throws {RecipeManagerError}
     * @async
     */
    private async _prepareRecipeCollection(alias: RecipeAliases, parameters: Map<string, any>): Promise<DataCollectionStatisticsIntf[]> {

        const section = `Run recipe collection "${alias}"`;
        const recipeCollection = this._recipeCollections.get(alias);
        if (recipeCollection === undefined) {
            throw new RecipeManagerError(alias, `The recipe collection with alias: ${alias} was not found.`)
        }

        // -------------------
        // STEP 1. Extract recipes in the collection
        // -------------------
        this._logger.log(section, 'How many recipes this recipe collection has?');
        /** @type {Array<string>}} */
        let recipes: Array<string>;
        try {
            recipes = recipeCollection.ingredients(this._logger.toSimpleLogger(section), parameters);
        } catch(error) {
            throw new RecipeManagerError(alias, `An error occurred while extracting the recipes (message: ${error.message}).`)
        }
        this._logger.log(section, `This recipe collection has ${recipes?.length} ${recipes?.length>1?'recipes':'recipe'}: ${recipes.join(', ')}...`);

        // -------------------
        // STEP 2. Run the recipes in the collection
        // -------------------
        const data: Map<RecipeAliases, Array<Data>> = new Map();
        const recipesInError: Map<RecipeAliases, Error> = new Map();
        try {
            this._logger.optimisticByPass = true;
            await Processor.forEach(recipes, async (recipe: RecipeAliases) => {
                try {
                    const recipeData = await this._prepareRecipe(recipe, parameters);
                    if (recipeData && Array.isArray(recipeData)) {
                        data.set(recipe, recipeData);
                    } else if (recipeData) {
                        throw new RecipeManagerError(recipe, `The recipe "${recipe}" did not return an array of data as expected (type was ${typeof recipeData} and value was ${JSON.stringify(recipeData)}).`);
                    } else {
                        throw new RecipeManagerError(recipe, `The recipe "${recipe}" did not return an array of data as expected (null or undefined value).`);
                    }
                } catch (error) {
                    // We don't want to block the other iteration so we store the error
                    recipesInError.set(recipe, error);
                }
            });
        } catch (error) {
            throw new RecipeManagerError(alias, `An error occurred while running the recipes (message: ${error.message}).`);
        } finally {
            this._logger.optimisticByPass = false;
        }
        this._logger.log(section, 'All datasets information successfuly retrieved from recipes!');

        // -------------------
        // STEP 3. Transform the recipe collection finally
        // -------------------
        this._logger.log(section, 'This recipe collection will now transform all this information...');
        const listRules = recipeCollection.filterByScoreRules(this._logger.toSimpleLogger(section), parameters);
        const listRulesByIds = new Map(listRules.map(rule => [ rule.id, rule ]));
        const listRuleIds = Array.from(listRulesByIds.keys());
        const isRuleFilterOn = listRules?.length > 0 || false;
        const finalData: Array<DataCollectionStatisticsIntf> = [];
        try {
            // Add the successful recipes and their stats in the final list
            await Processor.forEach(data, async ( records: Array<DataWithScore>, recipe: string) => {
                // We get only the bad records (with score > 0)
                // Potentially we can be asked to filter records on certain rules only (see `listRules`)
                //   In this scenario, bad records are filtered and their badReasonIds as well
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
                })?.sort((a, b) => { // sort by sore to have the biggest first
                    return a.score > b.score ? -1 : 1; 
                });
                const countOfBadRecordsPerRuleId = new Map<number, number>();
                const badValues = new Set<any>();
                onlyBadRecords?.forEach((d) => {  // for each bad record...
                    d.badReasonIds.filter(id => { // only for the badReason that are part of the rules we want
                        return isRuleFilterOn === true ? listRuleIds.includes(id) : true;
                    }).forEach(id => { 
                        // add the count of bad records per rule
                        countOfBadRecordsPerRuleId.set(id, (countOfBadRecordsPerRuleId.get(id) ?? 0) + 1);
                        // add the bad values in a set
                        const rule = listRulesByIds.get(id);
                        if (rule) {
                            badValues.add(d[rule.badField] ?? '')
                        }
                    });
                });
                finalData.push(new DataCollectionStatisticsOK(
                    recipe,
                    (records?.length ?? 0),
                    (onlyBadRecords?.length ?? 0),
                    listRules.map((rule) => {
                        return {
                            ruleId: rule.id,
                            ruleName: rule.description,
                            count: countOfBadRecordsPerRuleId.get(rule.id) ?? 0
                        };
                    })?.sort((a, b) => { // sort by count to have the biggest first
                        return a.count > b.count ? -1 : 1; 
                    }),
                    Array.from(badValues),
                    onlyBadRecords
                ));
            });

            // Add the recipes in error in the final list
            recipesInError.forEach((lastError, recipe) => {
                finalData.push(new DataCollectionStatisticsWithError(
                    recipe,
                    lastError?.message || 'Unknown error'
                ));
            });

            // Finally we order 
            // The KO first (aka hasError = true) 
            // Then for the stats without Issues, by bad counts desc
            finalData.sort((a, b) => {
                // if a has error but b has not, a is before b (-1)
                // if a and b have errors, a is before b (-1)
                if (a.hadError === true) return -1;
                // if a has more count bad than b, a is before b (-1)
                // if a has less count bad than b, a is after b (1)
                return (a.countBad > b.countBad) ? -1 : 1;
            })

        } catch(error) {
            throw new RecipeManagerError(alias, `An error occurred while transforming the data (message: ${error.message}).`, error);
        }
        this._logger.finalLog(section, 'Transformation successfuly done!');

        // Return value
        return finalData;
    }

    /**
     * @description Cleans a designated recipe (by its alias) and the corresponding datasets.
     *    - Step 1. Extract the list of datasets to clean that this recipe uses
     *    - Step 2. Clean the given datasets
     * @param {RecipeAliases} alias -String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Map<string, any>} [parameters] List of values to pass to the recipe
     * @throws {RecipeManagerError}
     * @public
     */
    private _cleanRecipe(alias: RecipeAliases, parameters: Map<string, any>) {

        const section = `Clean recipe "${alias}"`;
        const recipe = this._recipes.get(alias);
        if (recipe === undefined) {
            throw new RecipeManagerError(alias, `The recipe with alias: ${alias} was not found.`);
        }

        // -------------------
        // STEP 1. Extract
        // -------------------
        this._logger.log(section, 'How many datasets this recipe has?');
        let datasets: Array<string | DatasetRunInformation>;
        try {
            datasets = recipe.ingredients(this._logger.toSimpleLogger(section), parameters);
        } catch(error) {
            throw new RecipeManagerError(alias, `An error occurred while extracting the datasets (message: ${error.message}).`, error);
        }
        this._logger.log(section, `This recipe has ${datasets?.length} ${datasets?.length>1?'datasets':'dataset'}: ${datasets.map((d) => d instanceof DatasetRunInformation ? d.alias : d ).join(', ')}...`);

        // -------------------
        // STEP 2. Clean
        // -------------------
        this._logger.log(section, 'Clean all datasets...');
        try {
            this._datasetManager.clean(datasets);
        } catch(error) {
            throw new RecipeManagerError(alias, `An error occurred while cleaning the datasets (message: ${error.message}).`, error);
        }
        this._logger.finalLog(section, 'Datasets succesfully cleaned!');
    }

    /**
     * @param {RecipeAliases} alias -String representation of a recipe -- use one of the RECIPE_*_ALIAS constants available in this unit.
     * @param {Map<string, any>} [parameters] List of values to pass to the recipe
     * @throws {RecipeManagerError}
     * @public
     */
    private _cleanRecipeCollection(alias: RecipeAliases, parameters: Map<string, any>) {

        const section = `Clean recipe collection "${alias}"`;
        const recipeCollection = this._recipeCollections.get(alias);
        if (recipeCollection === undefined) {
            throw new RecipeManagerError(alias, `The recipe collection with alias: ${alias} was not found.`);
        }

        // -------------------
        // STEP 1. Extract
        // -------------------
        this._logger.log(section, 'How many recipes this recipe collection has?');
        let recipes: RecipeAliases[];
        try {
            recipes = recipeCollection.ingredients(this._logger.toSimpleLogger(section), parameters);
        } catch(error) {
            throw new RecipeManagerError(alias, `An error occurred while extracting the recipes (message: ${error.message}).`, error);
        }
        this._logger.log(section, `This recipe collection has ${recipes?.length} ${recipes?.length>1?'recipes':'recipe'}: ${recipes.join(', ')}...`);

        // -------------------
        // STEP 2. Clean
        // -------------------
        this._logger.log(section, 'Clean all datasets of these recipes...');
        try {
            recipes.forEach((recipe) => { this._cleanRecipe(recipe, parameters); });
        } catch(error) {
            throw new RecipeManagerError(alias, `An error occurred while cleaning the datasets (message: ${error.message}).`, error);
        }
        this._logger.finalLog(section, 'Datasets of these recipes succesfully cleaned!');
    }

    /**
     * @description List all available recipe titles
     * @returns {Map<RecipeAliases, string>} Returns the map of all available recipe titles
     * @public
     */
    public listAllTitles(): Map<RecipeAliases, string> {
        const titles = new Map();;
        [ this._recipes, this._recipeCollections ].forEach((map) => map.forEach((recipe, alias) => titles.set(alias, recipe.title)));
        return titles;
    }

}