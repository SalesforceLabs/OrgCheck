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
import { OrgCheckRecipeLightningWebComponents } from '../recipe/orgcheck-api-recipe-lightningwebcomponents';
import { OrgCheckRecipeLightningAuraComponents } from '../recipe/orgcheck-api-recipe-lightningauracomponents';
import { OrgCheckRecipeLightningPages } from '../recipe/orgcheck-api-recipe-lightningpages';
import { OrgCheckRecipeVisualForceComponents } from '../recipe/orgcheck-api-recipe-visualforcecomponents';
import { OrgCheckRecipePublicGroups } from '../recipe/orgcheck-api-recipe-publicgroups';
import { OrgCheckRecipeQueues } from '../recipe/orgcheck-api-recipe-queues';

export const RECIPE_ACTIVEUSERS_ALIAS = 'active-users';
export const RECIPE_CUSTOMFIELDS_ALIAS = 'custom-fields';
export const RECIPE_CUSTOMLABELS_ALIAS = 'custom-labels';
export const RECIPE_GLOBALFILTERS_ALIAS = 'global-filters';
export const RECIPE_OBJECT_ALIAS = 'object';
export const RECIPE_ORGINFO_ALIAS = 'org-information';
export const RECIPE_PERMISSIONSETS_ALIAS = 'permission-sets';
export const RECIPE_PROFILES_ALIAS = 'profiles';
export const RECIPE_VISUALFORCEPAGES_ALIAS = 'visual-force-pages';
export const RECIPE_LIGHTNINGPWEBCOMPONENTS_ALIAS = 'lightning-web-components';
export const RECIPE_LIGHTNINGAURACOMPONENTS_ALIAS = 'lightning-aura-components';
export const RECIPE_LIGHTNINGPAGES_ALIAS = 'lightning-pages';
export const RECIPE_VISUALFORCECOMPONENTS_ALIAS = 'visual-force-components';
export const RECIPE_PUBLICGROUPS_ALIAS = 'public-groups';
export const RECIPE_QUEUES_ALIAS = 'queues';

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
        this.#recipes.set(RECIPE_LIGHTNINGPWEBCOMPONENTS_ALIAS, new OrgCheckRecipeLightningWebComponents());
        this.#recipes.set(RECIPE_LIGHTNINGAURACOMPONENTS_ALIAS, new OrgCheckRecipeLightningAuraComponents());
        this.#recipes.set(RECIPE_LIGHTNINGPAGES_ALIAS, new OrgCheckRecipeLightningPages());
        this.#recipes.set(RECIPE_VISUALFORCECOMPONENTS_ALIAS, new OrgCheckRecipeVisualForceComponents());
        this.#recipes.set(RECIPE_PUBLICGROUPS_ALIAS, new OrgCheckRecipePublicGroups());
        this.#recipes.set(RECIPE_QUEUES_ALIAS, new OrgCheckRecipeQueues());

    }

    async run(alias, ...parameters) {
        // Check if alias is registered
        if (this.#recipes.hasKey(alias) === false) {
            throw new Error(`The given alias (${alias}) does not correspond to a registered recipe.`);
        } 
        const section = `⛭ ${alias}`;
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
            this.#logger.sectionFailed(section, error);
            throw error;

        } finally {
            // End the logger
            this.#logger.end();
        }
    }
}