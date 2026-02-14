import { describe, it, expect } from "@jest/globals";
import { RecipeApexClasses, RecipeApexTests, RecipeApexUncompiled } from "../../src/api/recipe/orgcheck-api-recipe-apexclasses";
import { RecipeApexTriggers } from "../../src/api/recipe/orgcheck-api-recipe-apextriggers";
import { RecipeAppPermissions } from "../../src/api/recipe/orgcheck-api-recipe-apppermissions";
import { RecipeCollaborationGroups } from "../../src/api/recipe/orgcheck-api-recipe-collaborationgroups";
import { RecipeCurrentUserPermissions } from "../../src/api/recipe/orgcheck-api-recipe-currentuserpermissions";
import { RecipeCustomFields } from "../../src/api/recipe/orgcheck-api-recipe-customfields";
import { RecipeCustomLabels } from "../../src/api/recipe/orgcheck-api-recipe-customlabels";
import { RecipeCustomTabs } from "../../src/api/recipe/orgcheck-api-recipe-customtabs";
import { RecipeDocuments } from "../../src/api/recipe/orgcheck-api-recipe-documents";
import { RecipeEmailTemplates } from "../../src/api/recipe/orgcheck-api-recipe-emailtemplates";
import { RecipeFieldPermissions } from "../../src/api/recipe/orgcheck-api-recipe-fieldpermissions";
import { RecipeFlows } from "../../src/api/recipe/orgcheck-api-recipe-flows";
import { RecipeHomePageComponents } from "../../src/api/recipe/orgcheck-api-recipe-homepagecomponents";
import { RecipeInternalActiveUsers } from "../../src/api/recipe/orgcheck-api-recipe-internalactiveusers";
import { RecipeLightningAuraComponents } from "../../src/api/recipe/orgcheck-api-recipe-lightningauracomponents";
import { RecipeLightningPages } from "../../src/api/recipe/orgcheck-api-recipe-lightningpages";
import { RecipeLightningWebComponents } from "../../src/api/recipe/orgcheck-api-recipe-lightningwebcomponents";
import { RecipeObject } from "../../src/api/recipe/orgcheck-api-recipe-object";
import { RecipeObjectPermissions } from "../../src/api/recipe/orgcheck-api-recipe-objectpermissions";
import { RecipeObjects } from "../../src/api/recipe/orgcheck-api-recipe-objects";
import { RecipeObjectTypes } from "../../src/api/recipe/orgcheck-api-recipe-objecttypes";
import { RecipeOrganization } from "../../src/api/recipe/orgcheck-api-recipe-organization";
import { RecipePackages } from "../../src/api/recipe/orgcheck-api-recipe-packages";
import { RecipePageLayouts } from "../../src/api/recipe/orgcheck-api-recipe-pagelayouts";
import { RecipePermissionSetLicenses } from "../../src/api/recipe/orgcheck-api-recipe-permissionsetlicenses";
import { RecipePermissionSets } from "../../src/api/recipe/orgcheck-api-recipe-permissionsets";
import { RecipeProcessBuilders } from "../../src/api/recipe/orgcheck-api-recipe-processbuilders";
import { RecipeProfilePasswordPolicies } from "../../src/api/recipe/orgcheck-api-recipe-profilepasswordpolicies";
import { RecipeProfileRestrictions } from "../../src/api/recipe/orgcheck-api-recipe-profilerestrictions";
import { RecipeProfiles } from "../../src/api/recipe/orgcheck-api-recipe-profiles";
import { RecipePublicGroups, RecipeQueues } from "../../src/api/recipe/orgcheck-api-recipe-groups";
import { RecipeGlobalView } from "../../src/api/recipecollection/orgcheck-api-recipe-globalview";
import { RecipeHardcodedURLsView } from "../../src/api/recipecollection/orgcheck-api-recipe-hardcodedurlsview";
import { RecipeUserRoles } from "../../src/api/recipe/orgcheck-api-recipe-userroles";
import { RecipeValidationRules } from "../../src/api/recipe/orgcheck-api-recipe-validationrules";
import { RecipeVisualForceComponents } from "../../src/api/recipe/orgcheck-api-recipe-visualforcecomponents";
import { RecipeVisualForcePages } from "../../src/api/recipe/orgcheck-api-recipe-visualforcepages";
import { RecipeWebLinks } from "../../src/api/recipe/orgcheck-api-recipe-weblinks";
import { RecipeWorkflows } from "../../src/api/recipe/orgcheck-api-recipe-workflows";
import { SimpleLoggerMock_DoingNothing } from "../utils/orgcheck-api-logger-mock.utility";

describe('tests.api.unit.Recipes', () => {
  describe('checks if all recipes are working fine', () => {
    [
      RecipeApexClasses,
      RecipeApexTests,
      RecipeApexTriggers,
      RecipeApexUncompiled,
      RecipeAppPermissions,
      RecipeCollaborationGroups,
      RecipeCurrentUserPermissions,
      RecipeCustomFields,
      RecipeCustomLabels,
      RecipeCustomTabs,
      RecipeDocuments,
      RecipeEmailTemplates,
      RecipeFieldPermissions,
      RecipeFlows,
      RecipeHomePageComponents,
      RecipeInternalActiveUsers,
      RecipeLightningAuraComponents,
      RecipeLightningPages,
      RecipeLightningWebComponents,
      RecipeObject,
      RecipeObjectPermissions,
      RecipeObjects,
      RecipeObjectTypes,
      RecipeOrganization,
      RecipePackages,
      RecipePageLayouts,
      RecipePermissionSetLicenses,
      RecipePermissionSets,
      RecipeProcessBuilders,
      RecipeProfilePasswordPolicies,
      RecipeProfileRestrictions,
      RecipeProfiles,
      RecipePublicGroups,
      RecipeQueues,
      RecipeUserRoles,
      RecipeValidationRules,
      RecipeVisualForceComponents,
      RecipeVisualForcePages,
      RecipeWebLinks,
      RecipeWorkflows
    ].forEach((recipeClass, index) => {
      it(`checks if the recipe "${recipeClass.name}" extracts and transforms correctly`, async () => {
        expect(`${index+1}: ${typeof recipeClass}`).toBe(`${index+1}: function`);
        const recipe = new recipeClass();
        const datasets = recipe.extract(new SimpleLoggerMock_DoingNothing(), new Map());
        expect(datasets).toBeDefined();
        expect(datasets instanceof Array).toBeTruthy();
        expect(datasets?.length).toBeDefined();
        const data = new Map();
        datasets.forEach((dataset) => {
          data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
        });
        const results = await recipe.transform(data, new SimpleLoggerMock_DoingNothing(), new Map());
        expect(results).toBeDefined();
      });
    });
  });

    describe('checks if all recipe collections are working fine', () => {
    [
      RecipeGlobalView,
      RecipeHardcodedURLsView
    ].forEach((recipeClass, index) => {
      it(`checks if the recipe collection "${recipeClass.name}" extracts and transforms correctly`, async () => {
        expect(`${index+1}: ${typeof recipeClass}`).toBe(`${index+1}: function`);
        const recipe = new recipeClass();
        const datasets = recipe.extract(new SimpleLoggerMock_DoingNothing());
        expect(datasets).toBeDefined();
        expect(datasets instanceof Array).toBeTruthy();
        expect(datasets?.length).toBeDefined();
        datasets.forEach((dataset) => {
          expect(dataset).toBeDefined();
          expect(typeof dataset).toBe('string');
        });
      });
    });
  });
});