import { SimpleLoggerIntf } from "../../../src/api/core/orgcheck-api-logger";
import { RecipeInternalActiveUsers } from "../../../src/api/recipe/orgcheck-api-recipe-internalactiveusers";
import { RecipeApexClasses } from "../../../src/api/recipe/orgcheck-api-recipe-apexclasses";
import { RecipeApexTriggers } from "../../../src/api/recipe/orgcheck-api-recipe-apextriggers";
import { RecipeAppPermissions } from "../../../src/api/recipe/orgcheck-api-recipe-apppermissions";
import { RecipeCollaborationGroups } from "../../../src/api/recipe/orgcheck-api-recipe-collaborationgroups";
import { RecipeCurrentUserPermissions } from "../../../src/api/recipe/orgcheck-api-recipe-currentuserpermissions";
import { RecipeCustomFields } from "../../../src/api/recipe/orgcheck-api-recipe-customfields";
import { RecipeCustomLabels } from "../../../src/api/recipe/orgcheck-api-recipe-customlabels";
import { RecipeCustomTabs } from "../../../src/api/recipe/orgcheck-api-recipe-customtabs";
import { RecipeDocuments } from "../../../src/api/recipe/orgcheck-api-recipe-documents";
import { RecipeFieldPermissions } from "../../../src/api/recipe/orgcheck-api-recipe-fieldpermissions";
import { RecipeFlows } from "../../../src/api/recipe/orgcheck-api-recipe-flows";
import { RecipeHomePageComponents } from "../../../src/api/recipe/orgcheck-api-recipe-homepagecomponents";
import { RecipeLightningAuraComponents } from "../../../src/api/recipe/orgcheck-api-recipe-lightningauracomponents";
import { RecipeLightningPages } from "../../../src/api/recipe/orgcheck-api-recipe-lightningpages";
import { RecipeLightningWebComponents } from "../../../src/api/recipe/orgcheck-api-recipe-lightningwebcomponents";
import { RecipeObject } from "../../../src/api/recipe/orgcheck-api-recipe-object";
import { RecipeObjectPermissions } from "../../../src/api/recipe/orgcheck-api-recipe-objectpermissions";
import { RecipeObjects } from "../../../src/api/recipe/orgcheck-api-recipe-objects";
import { RecipeObjectTypes } from "../../../src/api/recipe/orgcheck-api-recipe-objecttypes";
import { RecipeOrganization } from "../../../src/api/recipe/orgcheck-api-recipe-organization";
import { RecipePackages } from "../../../src/api/recipe/orgcheck-api-recipe-packages";
import { RecipePageLayouts } from "../../../src/api/recipe/orgcheck-api-recipe-pagelayouts";
import { RecipePermissionSetLicenses } from "../../../src/api/recipe/orgcheck-api-recipe-permissionsetlicenses";
import { RecipePermissionSets } from "../../../src/api/recipe/orgcheck-api-recipe-permissionsets";
import { RecipeProcessBuilders } from "../../../src/api/recipe/orgcheck-api-recipe-processbuilders";
import { RecipeProfilePasswordPolicies } from "../../../src/api/recipe/orgcheck-api-recipe-profilepasswordpolicies";
import { RecipeProfileRestrictions } from "../../../src/api/recipe/orgcheck-api-recipe-profilerestrictions";
import { RecipeProfiles } from "../../../src/api/recipe/orgcheck-api-recipe-profiles";
import { RecipePublicGroupsAndQueues } from "../../../src/api/recipe/orgcheck-api-recipe-publicgroupsandqueues";
import { RecipeUserRoles } from "../../../src/api/recipe/orgcheck-api-recipe-userroles";
import { RecipeValidationRules } from "../../../src/api/recipe/orgcheck-api-recipe-validationrules";
import { RecipeVisualForceComponents } from "../../../src/api/recipe/orgcheck-api-recipe-visualforcecomponents";
import { RecipeVisualForcePages } from "../../../src/api/recipe/orgcheck-api-recipe-visualforcepages";
import { RecipeWorkflows } from "../../../src/api/recipe/orgcheck-api-recipe-workflows";
import { RecipeWebLinks } from "../../../src/api/recipe/orgcheck-api-recipe-weblinks";
import { RecipeEmailTemplates } from "../../../src/api/recipe/orgcheck-api-recipe-emailtemplates";

class SimpleLoggerMock extends SimpleLoggerIntf {
  log() {}
  debug() {}
}

describe('tests.api.unit.Recipes', () => {


  describe('Basic test for all recipes', () => {
    [
      RecipeInternalActiveUsers, RecipeApexClasses, RecipeApexTriggers, 
      RecipeAppPermissions, RecipeCollaborationGroups, 
      RecipeCurrentUserPermissions, RecipeCustomFields, 
      RecipeCustomLabels, RecipeCustomTabs, RecipeDocuments, 
      RecipeFieldPermissions, RecipeFlows, RecipeHomePageComponents, 
      RecipeLightningAuraComponents, RecipeLightningPages, 
      RecipeLightningWebComponents, RecipeObject, RecipeObjectPermissions, 
      RecipeObjects, RecipeObjectTypes, RecipeOrganization, 
      RecipePackages, RecipePageLayouts, RecipePermissionSetLicenses, 
      RecipePermissionSets, RecipeProcessBuilders, 
      RecipeProfilePasswordPolicies, RecipeProfileRestrictions, 
      RecipeProfiles, RecipePublicGroupsAndQueues, RecipeUserRoles, 
      RecipeValidationRules, RecipeVisualForceComponents, 
      RecipeVisualForcePages, RecipeWorkflows, RecipeWebLinks, 
      RecipeEmailTemplates
    ].forEach((recipeClass) => {
      const recipe = new recipeClass();
      const logger = new SimpleLoggerMock();
      it(`checks if ${recipe.constructor.name} extracts and transforms correctly`, async () => {
        const datasets = recipe.extract(logger);
        expect(datasets).toBeDefined();
        expect(datasets instanceof Array).toBeTruthy();
        expect(datasets.length).toBeDefined();
        const data = new Map();
        datasets.forEach((dataset) => {
          data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
        });
        const results = await recipe.transform(data, logger);
        expect(results).toBeDefined();
      });
    });
  });
});