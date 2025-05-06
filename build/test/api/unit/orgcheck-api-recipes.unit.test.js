import { SimpleLoggerIntf } from "../../../src/api/core/orgcheck-api-logger";
import { RecipeActiveUsers } from "../../../src/api/recipe/orgcheck-api-recipe-activeusers";
import { RecipeApexClasses } from "../../../src/api/recipe/orgcheck-api-recipe-apexclasses";
import { RecipeApexTriggers } from "../../../src/api/recipe/orgcheck-api-recipe-apextriggers";
import { RecipeAppPermissions } from "../../../src/api/recipe/orgcheck-api-recipe-apppermissions";
import { RecipeCurrentUserPermissions } from "../../../src/api/recipe/orgcheck-api-recipe-currentuserpermissions";
import { RecipeCustomFields } from "../../../src/api/recipe/orgcheck-api-recipe-customfields";
import { RecipeCustomLabels } from "../../../src/api/recipe/orgcheck-api-recipe-customlabels";
import { RecipeFieldPermissions } from "../../../src/api/recipe/orgcheck-api-recipe-fieldpermissions";
import { RecipeFlows } from "../../../src/api/recipe/orgcheck-api-recipe-flows";
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
import { RecipeWorkflows } from "../../../src/api/recipe/orgcheck-api-recipe-workflows";

class SimpleLoggerMock extends SimpleLoggerIntf {
  log() {}
  debug() {}
}

describe('tests.api.unit.Recipes', () => {

  describe('Test RecipeActiveUsers', () => {
  
    const recipe = new RecipeActiveUsers();      
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {
      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(3);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger);
      expect(results).toBeDefined();
    });
  });

  describe('Test RecipeApexClasses', () => {
  
    const recipe = new RecipeApexClasses();      
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(1);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger, 'namespace');
      expect(results).toBeDefined();
    });
  });

  describe('Test RecipeApexTriggers', () => {
  
    const recipe = new RecipeApexTriggers();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(2);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger, 'namespace');
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeAppPermissions', () => {
  
    const recipe = new RecipeAppPermissions();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(4);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger, 'namespace');
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeCurrentUserPermissions', () => {
  
    const recipe = new RecipeCurrentUserPermissions();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger, ['perm1', 'perm2']);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(1);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger);
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeCustomFields', () => {
  
    const recipe = new RecipeCustomFields();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(3);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger, 'namespace', 'objecttype', 'object');
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeCustomLabels', () => {
  
    const recipe = new RecipeCustomLabels();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(1);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger, 'namespace');
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeFieldPermissions', () => {
  
    const recipe = new RecipeFieldPermissions();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger, 'Account');
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(3);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger, '*', '*');
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeFlows', () => {
  
    const recipe = new RecipeFlows();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(1);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger);
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipePublicGroups', () => {
  
    const recipe = new RecipePublicGroups();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(2);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger);
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeQueues', () => {
  
    const recipe = new RecipeQueues();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(2);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger);
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeLightningAuraComponents', () => {
  
    const recipe = new RecipeLightningAuraComponents();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(1);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger, 'namespace');
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeLightningPages', () => {
  
    const recipe = new RecipeLightningPages();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(2);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger, 'namespace');
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeLightningWebComponents', () => {
  
    const recipe = new RecipeLightningWebComponents();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(1);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger, 'namespace');
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeObject', () => {
  
    const recipe = new RecipeObject();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger, 'Account');
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(5);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger);
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeObjectPermissions', () => {
  
    const recipe = new RecipeObjectPermissions();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(3);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger, 'namespace');
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeObjectTypes', () => {
  
    const recipe = new RecipeObjectTypes();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(1);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger);
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeObjects', () => {
  
    const recipe = new RecipeObjects();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(2);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger, 'namespace', 'type');
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeOrganization', () => {
  
    const recipe = new RecipeOrganization();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(1);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger);
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipePackages', () => {
  
    const recipe = new RecipePackages();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(1);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger);
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipePageLayouts', () => {
  
    const recipe = new RecipePageLayouts();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(3);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger);
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipePermissionSets', () => {
  
    const recipe = new RecipePermissionSets();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(1);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger, 'namespace');
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipePermissionSetLicenses', () => {
  
    const recipe = new RecipePermissionSetLicenses();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(2);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger);
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeProcessBuilders', () => {
  
    const recipe = new RecipeProcessBuilders();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(1);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger);
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeProfilePasswordPolicies', () => {
  
    const recipe = new RecipeProfilePasswordPolicies();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(1);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger);
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeProfileRestrictions', () => {
  
    const recipe = new RecipeProfileRestrictions();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(2);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger, 'namespace');
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeProfiles', () => {
  
    const recipe = new RecipeProfiles();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(1);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger, 'namespace');
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeUserRoles', () => {
    
    const recipe = new RecipeUserRoles();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(2);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger);
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeValidationRules', () => {
  
    const recipe = new RecipeValidationRules();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(3);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger);
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeVisualForceComponents', () => {
  
    const recipe = new RecipeVisualForceComponents();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(1);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger, 'namespace');
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeVisualForcePages', () => {
  
    const recipe = new RecipeVisualForcePages();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(1);
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger, 'namespace');
      expect(results).toBeDefined();
    });

  });

  describe('Test RecipeWorkflows', () => {
  
    const recipe = new RecipeWorkflows();
    const logger = new SimpleLoggerMock();
    it('checks if this recipe class extracts and transforms correctly', async () => {

      const datasets = recipe.extract(logger);
      expect(datasets).toBeDefined();
      expect(datasets instanceof Array).toBeTruthy();
      expect(datasets.length).toBe(1);      
      const data = new Map();
      datasets.forEach((dataset) => {
        data.set(typeof dataset === 'string' ? dataset : dataset.alias , new Map());
      });
      const results = await recipe.transform(data, logger);
      expect(results).toBeDefined();
    });

  });
});