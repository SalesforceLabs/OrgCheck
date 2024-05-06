import { OrgCheckDatasetManager } from './orgcheck-api-datasetmanager';
import { OrgCheckLogger } from './orgcheck-api-logger';
import { OrgCheckRecipeActiveUsers } from '../recipe/orgcheck-api-recipe-activeusers';
import { OrgCheckRecipeCustomFields } from '../recipe/orgcheck-api-recipe-customfields';
import { OrgCheckRecipeCustomLabels } from '../recipe/orgcheck-api-recipe-customlabels';
import { OrgCheckRecipePackagesTypesAndObjects } from '../recipe/orgcheck-api-recipe-globalfilters';
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
import { OrgCheckRecipePublicGroups } from '../recipe/orgcheck-api-recipe-publicgroups';
import { OrgCheckRecipeQueues } from '../recipe/orgcheck-api-recipe-queues';
import { OrgCheckRecipeApexClasses } from '../recipe/orgcheck-api-recipe-apexclasses';
import { OrgCheckRecipeApexTriggers } from '../recipe/orgcheck-api-recipe-apextriggers';
import { OrgCheckRecipeUserRoles } from '../recipe/orgcheck-api-recipe-userroles';
import { OrgCheckRecipeWorkflows } from '../recipe/orgcheck-api-recipe-workflows';
import { OrgCheckRecipeProcessBuilders } from '../recipe/orgcheck-api-recipe-processbuilders';
import { OrgCheckRecipeFlows } from '../recipe/orgcheck-api-recipe-flows';

export const RECIPE_ACTIVEUSERS_ALIAS = 'active-users';
export const RECIPE_CUSTOMFIELDS_ALIAS = 'custom-fields';
export const RECIPE_CUSTOMLABELS_ALIAS = 'custom-labels';
export const RECIPE_GLOBALFILTERS_ALIAS = 'global-filters';
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
export const RECIPE_PUBLICGROUPS_ALIAS = 'public-groups';
export const RECIPE_QUEUES_ALIAS = 'queues';
export const RECIPE_APEXCLASSES_ALIAS = 'apex-classes';
export const RECIPE_APEXTRIGGERS_ALIAS = 'apex-triggers';
export const RECIPE_USERROLES_ALIAS = 'user-roles';
export const RECIPE_WORKFLOWS_ALIAS = 'workflows';
export const RECIPE_FLOWS_ALIAS = 'flows';
export const RECIPE_PROCESSBUILDERS_ALIAS = 'process-builders';

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
            throw new TypeError('The given logger is not an instance of OrgCheckDatasetManager.');
        }
        if (logger instanceof OrgCheckLogger === false) {
            throw new TypeError('The given logger is not an instance of OrgCheckLogger.');
        }

        this.#datasetManager = datasetManager;
        this.#logger = logger;
        this.#recipes = new Map();

        this.#recipes.set(RECIPE_ACTIVEUSERS_ALIAS, new OrgCheckRecipeActiveUsers());
        this.#recipes.set(RECIPE_CUSTOMFIELDS_ALIAS, new OrgCheckRecipeCustomFields());
        this.#recipes.set(RECIPE_CUSTOMLABELS_ALIAS, new OrgCheckRecipeCustomLabels());
        this.#recipes.set(RECIPE_GLOBALFILTERS_ALIAS, new OrgCheckRecipePackagesTypesAndObjects());
        this.#recipes.set(RECIPE_OBJECT_ALIAS, new OrgCheckRecipeObject());
        this.#recipes.set(RECIPE_OBJECTPERMISSIONS_ALIAS, new OrgCheckRecipeObjectPermissions());
        this.#recipes.set(RECIPE_APPPERMISSIONS_ALIAS, new OrgCheckRecipeAppPermissions())
        this.#recipes.set(RECIPE_ORGANIZATION_ALIAS, new OrgCheckRecipeOrganization());
        this.#recipes.set(RECIPE_CURRENTUSERPERMISSIONS_ALIAS, new OrgCheckRecipeCurrentUserPermissions());
        this.#recipes.set(RECIPE_PERMISSIONSETS_ALIAS, new OrgCheckRecipePermissionSets());
        this.#recipes.set(RECIPE_PROFILES_ALIAS, new OrgCheckRecipeProfiles());
        this.#recipes.set(RECIPE_PROFILERESTRICTIONS_ALIAS, new OrgCheckRecipeProfileRestrictions());
        this.#recipes.set(RECIPE_PROFILEPWDPOLICIES_ALIAS, new OrgCheckRecipeProfilePasswordPolicies());
        this.#recipes.set(RECIPE_VISUALFORCEPAGES_ALIAS, new OrgCheckRecipeVisualForcePages());
        this.#recipes.set(RECIPE_LIGHTNINGPWEBCOMPONENTS_ALIAS, new OrgCheckRecipeLightningWebComponents());
        this.#recipes.set(RECIPE_LIGHTNINGAURACOMPONENTS_ALIAS, new OrgCheckRecipeLightningAuraComponents());
        this.#recipes.set(RECIPE_LIGHTNINGPAGES_ALIAS, new OrgCheckRecipeLightningPages());
        this.#recipes.set(RECIPE_VISUALFORCECOMPONENTS_ALIAS, new OrgCheckRecipeVisualForceComponents());
        this.#recipes.set(RECIPE_PUBLICGROUPS_ALIAS, new OrgCheckRecipePublicGroups());
        this.#recipes.set(RECIPE_QUEUES_ALIAS, new OrgCheckRecipeQueues());
        this.#recipes.set(RECIPE_APEXCLASSES_ALIAS, new OrgCheckRecipeApexClasses());
        this.#recipes.set(RECIPE_APEXTRIGGERS_ALIAS, new OrgCheckRecipeApexTriggers());
        this.#recipes.set(RECIPE_USERROLES_ALIAS, new OrgCheckRecipeUserRoles());
        this.#recipes.set(RECIPE_WORKFLOWS_ALIAS, new OrgCheckRecipeWorkflows());
        this.#recipes.set(RECIPE_PROCESSBUILDERS_ALIAS, new OrgCheckRecipeProcessBuilders());
        this.#recipes.set(RECIPE_FLOWS_ALIAS, new  OrgCheckRecipeFlows());
    }

    async run(alias, ...parameters) {
        // Check if alias is registered
        if (this.#recipes.has(alias) === false) {
            throw new TypeError(`The given alias (${alias}) does not correspond to a registered recipe.`);
        } 
        const section = `RECIPE ${alias}`;
        const recipe = this.#recipes.get(alias);

        try {
            // Start the logger
            this.#logger.begin();

            // -------------------
            // Extract
            // -------------------
            this.#logger.sectionStarts(section, 'List the datasets that are needed...');
            let datasets;
            try {
                datasets = recipe.extract(...parameters);   
            } catch(error) {
                this.#logger.sectionFailed(section, error);
                throw error;
            }
            this.#logger.sectionContinues(section, 'Run all the datasets and extract their data...');
            let data;
            try {
                data = await this.#datasetManager.run(datasets);
            } catch(error) {
                // the detail of the error should have been logged by dataset manager
                // just mentionning that there was an error on the dataset layer
                this.#logger.sectionFailed(section, 'Error in dataset!');
                throw error;
            }
            this.#logger.sectionContinues(section, 'Information succesfully retrieved!');

            // -------------------
            // Transform
            // -------------------
            this.#logger.sectionContinues(section, 'Transform the information...');
            let finalData;
            try {
                finalData = recipe.transform(data, ...parameters);
            } catch(error) {
                this.#logger.sectionFailed(section, error);
                throw error;
            }
            this.#logger.sectionEnded(section, 'Transformation done!');

            // Return value
            return finalData;

        } finally {
            // End the logger
            this.#logger.end();
        }
    }
}