import { OrgCheckDatasetManager } from './orgcheck-api-datasetmanager';
import { OrgCheckLogger } from './orgcheck-api-logger';
import { OrgCheckMap } from './orgcheck-api-type-map';
import { OrgCheckRecipeActiveUsers } from '../recipe/orgcheck-api-recipe-activeusers';
import { OrgCheckRecipeCustomFields } from '../recipe/orgcheck-api-recipe-customfields';
import { OrgCheckRecipeCustomLabels } from '../recipe/orgcheck-api-recipe-customlabels';
import { OrgCheckRecipePackagesTypesAndObjects } from '../recipe/orgcheck-api-recipe-globalfilters';
import { OrgCheckRecipeObject } from '../recipe/orgcheck-api-recipe-object';
import { OrgCheckRecipeOrgInformation } from '../recipe/orgcheck-api-recipe-orginfo';
import { OrgCheckRecipePermissionSets } from '../recipe/orgcheck-api-recipe-permissionsets';
import { OrgCheckRecipeProfiles } from '../recipe/orgcheck-api-recipe-profiles';
import { OrgCheckRecipeVisualForcePages } from '../recipe/orgcheck-api-recipe-visualforcepages';

export const RECIPE_ACTIVEUSERS_ALIAS = 'active-users';
export const RECIPE_CUSTOMFIELDS_ALIAS = 'custom-fields';
export const RECIPE_CUSTOMLABELS_ALIAS = 'custom-labels';
export const RECIPE_GLOBALFILTERS_ALIAS = 'global-filters';
export const RECIPE_OBJECT_ALIAS = 'object';
export const RECIPE_ORGINFO_ALIAS = 'org-information';
export const RECIPE_PERMISSIONSETS_ALIAS = 'permission-sets';
export const RECIPE_PROFILES_ALIAS = 'profiles';
export const RECIPE_VISUALFORCEPAGES_ALIAS = 'visual-force-pages';

export class OrgCheckRecipeManager {

    #logger;
    #recipes;
    #datasetManager;
            
    /**
     * Recipe Manager constructor
     * 
     * @param {OrgCheckDatasetManager} datasetManager 
     * @param {OrgCheckLogger} logger
     */
    constructor(datasetManager, logger) {

        if (datasetManager instanceof OrgCheckDatasetManager === false) {
            throw new Error('The given logger is not an instance of OrgCheckDatasetManager.');
        }
        if (logger instanceof OrgCheckLogger === false) {
            throw new Error('The given logger is not an instance of OrgCheckLogger.');
        }

        this.#datasetManager = datasetManager;
        this.#logger = logger;
        this.#recipes = new OrgCheckMap();

        this.#recipes.set(RECIPE_ACTIVEUSERS_ALIAS, new OrgCheckRecipeActiveUsers());
        this.#recipes.set(RECIPE_CUSTOMFIELDS_ALIAS, new OrgCheckRecipeCustomFields());
        this.#recipes.set(RECIPE_CUSTOMLABELS_ALIAS, new OrgCheckRecipeCustomLabels());
        this.#recipes.set(RECIPE_GLOBALFILTERS_ALIAS, new OrgCheckRecipePackagesTypesAndObjects());
        this.#recipes.set(RECIPE_OBJECT_ALIAS, new OrgCheckRecipeObject());
        this.#recipes.set(RECIPE_ORGINFO_ALIAS, new OrgCheckRecipeOrgInformation());
        this.#recipes.set(RECIPE_PERMISSIONSETS_ALIAS, new OrgCheckRecipePermissionSets());
        this.#recipes.set(RECIPE_PROFILES_ALIAS, new OrgCheckRecipeProfiles());
        this.#recipes.set(RECIPE_VISUALFORCEPAGES_ALIAS, new OrgCheckRecipeVisualForcePages());
    }

    async run(alias, ...parameters) {
        // Check if alias is registered
        if (this.#recipes.hasKey(alias) === false) {
            throw new Error(`The given alias (${alias}) does not correspond to a registered recipe.`);
        } 
        const section = `[recipe]-${alias}`;
        const recipe = this.#recipes.get(alias);

        // Start the logger
        this.#logger.begin();
        try {

            // Extract
            this.#logger.sectionStarts(section, 'Getting the information...');
            const data = await this.#datasetManager.run(recipe.extract(...parameters));
            this.#logger.sectionContinues(section, 'Information succesfully retrieved!');

            // Transform
            this.#logger.sectionContinues(section, 'Transform the information...');
            const finalData = recipe.transform(data, ...parameters);
            this.#logger.sectionEnded(section, 'Transformation done!');

            // Return value
            return finalData;

        } catch(error) {
            // Error handling
            this.#logger.sectionFailed(section, error.message);
            throw error;

        } finally {
            // End the logger
            this.#logger.end();
        }
    }
}