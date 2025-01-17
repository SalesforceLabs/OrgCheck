import { OrgCheckSimpleLoggerIntf } from "../api/core/orgcheck-api-logger";
import { OrgCheckRecipeActiveUsers } from "../api/recipe/orgcheck-api-recipe-activeusers";
import { OrgCheckRecipeApexClasses } from "../api/recipe/orgcheck-api-recipe-apexclasses";
import { OrgCheckRecipeApexTriggers } from "../api/recipe/orgcheck-api-recipe-apextriggers";
import { OrgCheckRecipeAppPermissions } from "../api/recipe/orgcheck-api-recipe-apppermissions";
import { OrgCheckRecipeCurrentUserPermissions } from "../api/recipe/orgcheck-api-recipe-currentuserpermissions";
import { OrgCheckRecipeCustomFields } from "../api/recipe/orgcheck-api-recipe-customfields";
import { OrgCheckRecipeCustomLabels } from "../api/recipe/orgcheck-api-recipe-customlabels";
import { OrgCheckRecipeFlows } from "../api/recipe/orgcheck-api-recipe-flows";
import { OrgCheckRecipeLightningAuraComponents } from "../api/recipe/orgcheck-api-recipe-lightningauracomponents";
import { OrgCheckRecipeLightningPages } from "../api/recipe/orgcheck-api-recipe-lightningpages";
import { OrgCheckRecipeLightningWebComponents } from "../api/recipe/orgcheck-api-recipe-lightningwebcomponents";
import { OrgCheckRecipeObject } from "../api/recipe/orgcheck-api-recipe-object";
import { OrgCheckRecipeObjectPermissions } from "../api/recipe/orgcheck-api-recipe-objectpermissions";
import { OrgCheckRecipeObjects } from "../api/recipe/orgcheck-api-recipe-objects";
import { OrgCheckRecipeObjectTypes } from "../api/recipe/orgcheck-api-recipe-objecttypes";
import { OrgCheckRecipeOrganization } from "../api/recipe/orgcheck-api-recipe-organization";
import { OrgCheckRecipePackages } from "../api/recipe/orgcheck-api-recipe-packages";
import { OrgCheckRecipePermissionSets } from "../api/recipe/orgcheck-api-recipe-permissionsets";
import { OrgCheckRecipeProcessBuilders } from "../api/recipe/orgcheck-api-recipe-processbuilders";
import { OrgCheckRecipeProfilePasswordPolicies } from "../api/recipe/orgcheck-api-recipe-profilepasswordpolicies";
import { OrgCheckRecipeProfileRestrictions } from "../api/recipe/orgcheck-api-recipe-profilerestrictions";
import { OrgCheckRecipeProfiles } from "../api/recipe/orgcheck-api-recipe-profiles";
import { OrgCheckRecipePublicGroups } from "../api/recipe/orgcheck-api-recipe-publicgroups";
import { OrgCheckRecipeQueues } from "../api/recipe/orgcheck-api-recipe-queues";
import { OrgCheckRecipeUserRoles } from "../api/recipe/orgcheck-api-recipe-userroles";
import { OrgCheckRecipeVisualForceComponents } from "../api/recipe/orgcheck-api-recipe-visualforcecomponents";
import { OrgCheckRecipeVisualForcePages } from "../api/recipe/orgcheck-api-recipe-visualforcepages";
import { OrgCheckRecipeWorkflows } from "../api/recipe/orgcheck-api-recipe-workflows";

class SimpleLoggerMock extends OrgCheckSimpleLoggerIntf {
  log() {}
  debug() {}
}

describe('api.core.OrgCheckRecipes', () => {

  describe('Test OrgCheckRecipeActiveUsers', () => {
  
    const recipe = new OrgCheckRecipeActiveUsers();      
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

  describe('Test OrgCheckRecipeApexClasses', () => {
  
    const recipe = new OrgCheckRecipeApexClasses();      
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

  describe('Test OrgCheckRecipeApexTriggers', () => {
  
    const recipe = new OrgCheckRecipeApexTriggers();
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

  describe('Test OrgCheckRecipeAppPermissions', () => {
  
    const recipe = new OrgCheckRecipeAppPermissions();
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

  describe('Test OrgCheckRecipeCurrentUserPermissions', () => {
  
    const recipe = new OrgCheckRecipeCurrentUserPermissions();
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

  describe('Test OrgCheckRecipeCustomFields', () => {
  
    const recipe = new OrgCheckRecipeCustomFields();
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

  describe('Test OrgCheckRecipeCustomLabels', () => {
  
    const recipe = new OrgCheckRecipeCustomLabels();
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

  describe('Test OrgCheckRecipeFlows', () => {
  
    const recipe = new OrgCheckRecipeFlows();
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

  describe('Test OrgCheckRecipePublicGroups', () => {
  
    const recipe = new OrgCheckRecipePublicGroups();
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

  describe('Test OrgCheckRecipeQueues', () => {
  
    const recipe = new OrgCheckRecipeQueues();
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

  describe('Test OrgCheckRecipeLightningAuraComponents', () => {
  
    const recipe = new OrgCheckRecipeLightningAuraComponents();
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

  describe('Test OrgCheckRecipeLightningPages', () => {
  
    const recipe = new OrgCheckRecipeLightningPages();
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

  describe('Test OrgCheckRecipeLightningWebComponents', () => {
  
    const recipe = new OrgCheckRecipeLightningWebComponents();
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

  describe('Test OrgCheckRecipeObject', () => {
  
    const recipe = new OrgCheckRecipeObject();
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

  describe('Test OrgCheckRecipeObjectPermissions', () => {
  
    const recipe = new OrgCheckRecipeObjectPermissions();
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

  describe('Test OrgCheckRecipeObjectTypes', () => {
  
    const recipe = new OrgCheckRecipeObjectTypes();
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

  describe('Test OrgCheckRecipeObjects', () => {
  
    const recipe = new OrgCheckRecipeObjects();
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

  describe('Test OrgCheckRecipeOrganization', () => {
  
    const recipe = new OrgCheckRecipeOrganization();
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

  describe('Test OrgCheckRecipePackages', () => {
  
    const recipe = new OrgCheckRecipePackages();
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

  describe('Test OrgCheckRecipePermissionSets', () => {
  
    const recipe = new OrgCheckRecipePermissionSets();
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

  describe('Test OrgCheckRecipeProcessBuilders', () => {
  
    const recipe = new OrgCheckRecipeProcessBuilders();
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

  describe('Test OrgCheckRecipeProfilePasswordPolicies', () => {
  
    const recipe = new OrgCheckRecipeProfilePasswordPolicies();
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

  describe('Test OrgCheckRecipeProfileRestrictions', () => {
  
    const recipe = new OrgCheckRecipeProfileRestrictions();
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

  describe('Test OrgCheckRecipeProfiles', () => {
  
    const recipe = new OrgCheckRecipeProfiles();
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

  describe('Test OrgCheckRecipeUserRoles', () => {
    
    const recipe = new OrgCheckRecipeUserRoles();
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

  describe('Test OrgCheckRecipeVisualForceComponents', () => {
  
    const recipe = new OrgCheckRecipeVisualForceComponents();
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

  describe('Test OrgCheckRecipeVisualForcePages', () => {
  
    const recipe = new OrgCheckRecipeVisualForcePages();
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

  describe('Test OrgCheckRecipeWorkflows', () => {
  
    const recipe = new OrgCheckRecipeWorkflows();
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