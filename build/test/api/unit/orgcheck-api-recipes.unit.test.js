import { Recipe } from '../../../src/api/core/orgcheck-api-recipe';
import { RecipeApexClasses } from "../../../src/api/recipe/orgcheck-api-recipe-apexclasses";
import { RecipeApexTriggers } from "../../../src/api/recipe/orgcheck-api-recipe-apextriggers";
import { RecipeAppPermissions } from "../../../src/api/recipe/orgcheck-api-recipe-apppermissions";
import { RecipeCollaborationGroups } from "../../../src/api/recipe/orgcheck-api-recipe-collaborationgroups";
import { RecipeCurrentUserPermissions } from "../../../src/api/recipe/orgcheck-api-recipe-currentuserpermissions";
import { RecipeCustomFields } from "../../../src/api/recipe/orgcheck-api-recipe-customfields";
import { RecipeCustomLabels } from "../../../src/api/recipe/orgcheck-api-recipe-customlabels";
import { RecipeCustomTabs } from "../../../src/api/recipe/orgcheck-api-recipe-customtabs";
import { RecipeDocuments } from "../../../src/api/recipe/orgcheck-api-recipe-documents";
import { RecipeEmailTemplates } from "../../../src/api/recipe/orgcheck-api-recipe-emailtemplates";
import { RecipeFieldPermissions } from "../../../src/api/recipe/orgcheck-api-recipe-fieldpermissions";
import { RecipeFlows } from "../../../src/api/recipe/orgcheck-api-recipe-flows";
import { RecipeHomePageComponents } from "../../../src/api/recipe/orgcheck-api-recipe-homepagecomponents";
import { RecipeInternalActiveUsers } from "../../../src/api/recipe/orgcheck-api-recipe-internalactiveusers";
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
import { RecipePublicGroups } from "../../../src/api/recipe/orgcheck-api-recipe-publicgroups";
import { RecipeQueues } from "../../../src/api/recipe/orgcheck-api-recipe-queues";
import { RecipeUserRoles } from "../../../src/api/recipe/orgcheck-api-recipe-userroles";
import { RecipeValidationRules } from "../../../src/api/recipe/orgcheck-api-recipe-validationrules";
import { RecipeVisualForceComponents } from "../../../src/api/recipe/orgcheck-api-recipe-visualforcecomponents";
import { RecipeVisualForcePages } from "../../../src/api/recipe/orgcheck-api-recipe-visualforcepages";
import { RecipeWebLinks } from "../../../src/api/recipe/orgcheck-api-recipe-weblinks";
import { RecipeWorkflows } from "../../../src/api/recipe/orgcheck-api-recipe-workflows";
import { SimpleLoggerIntf } from "../../../src/api/core/orgcheck-api-logger";

class SimpleLoggerMock extends SimpleLoggerIntf {
  log() {}
  debug() {}
}

describe('tests.api.unit.Recipes', () => {
  describe('checks if all recipes are working fine', () => {
    [
      /*  1 */ RecipeApexClasses,
      /*  2 */ RecipeApexTriggers,
      /*  3 */ RecipeAppPermissions,
      /*  4 */ RecipeCollaborationGroups,
      /*  5 */ RecipeCurrentUserPermissions,
      /*  6 */ RecipeCustomFields,
      /*  7 */ RecipeCustomLabels,
      /*  8 */ RecipeCustomTabs,
      /*  9 */ RecipeDocuments,
      /* 10 */ RecipeEmailTemplates,
      /* 11 */ RecipeFieldPermissions,
      /* 12 */ RecipeFlows,
      /* 13 */ RecipeHomePageComponents,
      /* 14 */ RecipeInternalActiveUsers,
      /* 15 */ RecipeLightningAuraComponents,
      /* 16 */ RecipeLightningPages,
      /* 17 */ RecipeLightningWebComponents,
      /* 18 */ RecipeObject,
      /* 19 */ RecipeObjectPermissions,
      /* 20 */ RecipeObjects,
      /* 21 */ RecipeObjectTypes,
      /* 22 */ RecipeOrganization,
      /* 23 */ RecipePackages,
      /* 24 */ RecipePageLayouts,
      /* 25 */ RecipePermissionSetLicenses,
      /* 26 */ RecipePermissionSets,
      /* 27 */ RecipeProcessBuilders,
      /* 28 */ RecipeProfilePasswordPolicies,
      /* 29 */ RecipeProfileRestrictions,
      /* 30 */ RecipeProfiles,
      /* 31 */ RecipePublicGroups,
      /* 32 */ RecipeQueues,
      /* 33 */ RecipeUserRoles,
      /* 34 */ RecipeValidationRules,
      /* 35 */ RecipeVisualForceComponents,
      /* 36 */ RecipeVisualForcePages,
      /* 37 */ RecipeWebLinks,
      /* 38 */ RecipeWorkflows
    ].forEach((recipeClass, index) => {
      it(`checks if the recipe "${recipeClass.name}" extracts and transforms correctly`, async () => {
        expect(`${index+1}: ${typeof recipeClass}`).toBe(`${index+1}: function`);
        const recipe = new recipeClass();
        const logger = new SimpleLoggerMock();
        expect(recipe instanceof Recipe).toBeTruthy();
        const datasets = recipe.extract(logger, new Map());
        expect(datasets).toBeDefined();
        expect(datasets instanceof Array).toBeTruthy();
        expect(datasets.length).toBeDefined();
        const data = new Map();
        datasets.forEach((dataset) => {
          data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
        });
        const results = await recipe.transform(data, logger, new Map());
        expect(results).toBeDefined();
      });
    });
  });
});