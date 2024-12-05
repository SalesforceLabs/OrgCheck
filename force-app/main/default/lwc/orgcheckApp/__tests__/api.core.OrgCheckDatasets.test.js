import { OrgCheckDatasetApexClasses } from '../api/dataset/orgcheck-api-dataset-apexclasses';
import { OrgCheckDatasetApexTriggers } from '../api/dataset/orgcheck-api-dataset-apextriggers';
import { OrgCheckDatasetAppPermissions } from '../api/dataset/orgcheck-api-dataset-apppermissions';
import { OrgCheckDatasetCurrentUserPermissions } from '../api/dataset/orgcheck-api-dataset-currentuserpermissions';
import { OrgCheckDatasetCustomFields } from '../api/dataset/orgcheck-api-dataset-customfields';
import { OrgCheckDatasetCustomLabels } from '../api/dataset/orgcheck-api-dataset-customlabels';
import { OrgCheckDatasetFlows } from '../api/dataset/orgcheck-api-dataset-flows';
import { OrgCheckDatasetGroups } from '../api/dataset/orgcheck-api-dataset-groups';
import { OrgCheckDatasetLightningAuraComponents } from '../api/dataset/orgcheck-api-dataset-lighntingauracomponents';
import { OrgCheckDatasetLightningPages } from '../api/dataset/orgcheck-api-dataset-lighntingpages';
import { OrgCheckDatasetLightningWebComponents } from '../api/dataset/orgcheck-api-dataset-lighntingwebcomponents';
import { OrgCheckDatasetObject } from '../api/dataset/orgcheck-api-dataset-object';
import { OrgCheckDatasetObjectPermissions } from '../api/dataset/orgcheck-api-dataset-objectpermissions';
import { OrgCheckDatasetObjects } from '../api/dataset/orgcheck-api-dataset-objects';
import { OrgCheckDatasetObjectTypes } from '../api/dataset/orgcheck-api-dataset-objecttypes';
import { OrgCheckDatasetOrganization } from '../api/dataset/orgcheck-api-dataset-organization';
import { OrgCheckDatasetPackages } from '../api/dataset/orgcheck-api-dataset-packages';
import { OrgCheckDatasetPermissionSets } from '../api/dataset/orgcheck-api-dataset-permissionsets';
import { OrgCheckDatasetProfilePasswordPolicies } from '../api/dataset/orgcheck-api-dataset-profilepasswordpolicies';
import { OrgCheckDatasetProfileRestrictions } from '../api/dataset/orgcheck-api-dataset-profilerestrictions';
import { OrgCheckDatasetProfiles } from '../api/dataset/orgcheck-api-dataset-profiles';
import { OrgCheckDatasetUserRoles } from '../api/dataset/orgcheck-api-dataset-userroles';
import { OrgCheckDatasetUsers } from '../api/dataset/orgcheck-api-dataset-users';
import { OrgCheckDatasetVisualForceComponents } from '../api/dataset/orgcheck-api-dataset-visualforcecomponents';
import { OrgCheckDatasetVisualForcePages } from '../api/dataset/orgcheck-api-dataset-visualforcepages';
import { OrgCheckDatasetWorkflows } from '../api/dataset/orgcheck-api-dataset-workflows';

class SfdcManagerMock { 

  #soqlQueryResponses = {};
  #describeGlobal = [];

  addSoqlQueryResponse(queryMatch, records) {
    this.#soqlQueryResponses[queryMatch] = records;
  }

  setDescribeGolbal(describeGlobal) {
    this.#describeGlobal = describeGlobal;
  }

  describeGlobal() {
    return this.#describeGlobal;
  }

  describe(objectName) {
    return {};
  }

  recordCount(objectName) {
    return 0;
  }

  getObjectType(objectName, isCustomSetting) {
    return isCustomSetting ? 'CustomSetting' : 'StandardObject';
  }

  soqlQuery(queries) { 
    return queries.map((query) => { 
      const key = Object.keys(this.#soqlQueryResponses).find((p) => query?.string?.indexOf(p) !== -1);
      return { records: (key ? this.#soqlQueryResponses[key] : []) }; 
    });
  }

  caseSafeId(id) { 
    return id; 
  }

  setupUrl() { 
    return '/';
  }

  readMetadataAtScale(type, members) {
    return members.map(() => { return []; });
  }

  readMetadata(metadatas) {
    return metadatas.map(() => { return []; });
  }

  dependenciesQuery(ids) { 
    return []; 
  }
}

const DATA_FACTORY_MOCK = {
  getInstance: () => {
    return {
      create: (setup) => { return setup.properties; },
      createWithScore: (setup) => { return setup.properties; }
    }; 
  }
};

const LOCAL_LOGGER_MOCK = { 
  log: () => {}
};

describe('api.code.OrgCheckDatasets', () => {

  describe('Test OrgCheckDatasetApexClasses', () => {
  
    const dataset = new OrgCheckDatasetApexClasses();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetApexTriggers', () => {
  
    const dataset = new OrgCheckDatasetApexTriggers();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetAppPermissions', () => {
  
    const dataset = new OrgCheckDatasetAppPermissions();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetCurrentUserPermissions', () => {
  
    const dataset = new OrgCheckDatasetCurrentUserPermissions();  
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      sfdcManager.addSoqlQueryResponse('FROM UserPermissionAccess', [
        { PermissionsA: true },
        { PermissionsB: true },
        { PermissionsC: true }
      ]);
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK, { get: () => ['a', 'b'] });
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(1);
    });
  });
  
  describe('Test OrgCheckDatasetCustomFields', () => {
  
    const dataset = new OrgCheckDatasetCustomFields();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetCustomLabels', () => {
  
    const dataset = new OrgCheckDatasetCustomLabels();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetFlows', () => {
  
    const dataset = new OrgCheckDatasetFlows();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetGroups', () => {
  
    const dataset = new OrgCheckDatasetGroups();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetLightningAuraComponents', () => {
  
    const dataset = new OrgCheckDatasetLightningAuraComponents();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetLightningPages', () => {
  
    const dataset = new OrgCheckDatasetLightningPages();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetLightningWebComponents', () => {
  
    const dataset = new OrgCheckDatasetLightningWebComponents();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetObject', () => {
  
    const dataset = new OrgCheckDatasetObject();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      sfdcManager.addSoqlQueryResponse('FROM EntityDefinition', [
        { DurableId: 'Account', NamespacePrefix: null, DeveloperName: 'Account', QualifiedApiName: 'Account', ExternalSharingModel: 'private', InternalSharingModel: 'private' }
      ])
      const result = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK, { get: () => 'Account' });
      expect(result).toBeDefined();
      expect(result instanceof Map).toBeFalsy();
      expect(result instanceof Object).toBeTruthy();
      expect(result).toHaveProperty('id');
      expect(result.id).toBe('Account');
    });
  });

  describe('Test OrgCheckDatasetObjectPermissions', () => {
  
    const dataset = new OrgCheckDatasetObjectPermissions();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetObjects', () => {
  
    const dataset = new OrgCheckDatasetObjects();      
    it('checks if this dataset runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      sfdcManager.setDescribeGolbal([
        { name: 'a', customSetting: false, label: 'Object A' },
        { name: 'b', customSetting: false, label: 'Object B' },
        { name: 'c', customSetting: false, label: 'Object C' },
      ]);
      sfdcManager.addSoqlQueryResponse('FROM EntityDefinition', [
        { DurableId: 'a', NamespacePrefix: null, DeveloperName: 'a', QualifiedApiName: 'a__c', ExternalSharingModel: 'private', InternalSharingModel: 'private' },
        { DurableId: 'b', NamespacePrefix: 'test', DeveloperName: 'b', QualifiedApiName: 'test__b__c', ExternalSharingModel: 'private', InternalSharingModel: 'private' },
        { DurableId: 'c', NamespacePrefix: null, DeveloperName: 'c', QualifiedApiName: 'c__c', ExternalSharingModel: 'private', InternalSharingModel: 'private' }
      ]);
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetObjectTypes', () => {
  
    const dataset = new OrgCheckDatasetObjectTypes();      
    it('checks if this dataset class runs correctly', async () => {
      const results = await dataset.run(null, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).not.toBe(0); 
    });
  });

  describe('Test OrgCheckDatasetOrganization', () => {
  
    const dataset = new OrgCheckDatasetOrganization();
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      sfdcManager.addSoqlQueryResponse('FROM Organization', [
        { Id: '00Dxxxx', Name: 'name', IsSandbox: 'false', OrganizationType: 'Production', TrialExpirationDate: null, NamespacePrefix: '' }
      ]);
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(1);
    });
  });

  describe('Test OrgCheckDatasetPackages', () => {
  
    const dataset = new OrgCheckDatasetPackages();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      sfdcManager.addSoqlQueryResponse('FROM Organization', [
        { Id: '00Dxxxx', Name: 'name', IsSandbox: 'false', OrganizationType: 'Production', TrialExpirationDate: null, NamespacePrefix: 'me' }
      ]);
      sfdcManager.addSoqlQueryResponse('FROM InstalledSubscriberPackage', [
        { Id: '0000000', SubscriberPackage: { NamespacePrefix: 'test', Name: 'Testing Package' }},
        { Id: '0000001', SubscriberPackage: { NamespacePrefix: 'starwars', Name: 'Padawan Package' }}
      ]);
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(3);
    });
  });

  describe('Test OrgCheckDatasetPermissionSets', () => {
  
    const dataset = new OrgCheckDatasetPermissionSets();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });
  
  describe('Test OrgCheckDatasetProfilePasswordPolicies', () => {
  
    const dataset = new OrgCheckDatasetProfilePasswordPolicies();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });
  
  describe('Test OrgCheckDatasetProfileRestrictions', () => {
  
    const dataset = new OrgCheckDatasetProfileRestrictions();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetProfiles', () => {
  
    const dataset = new OrgCheckDatasetProfiles();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetUserRoles', () => {
  
    const dataset = new OrgCheckDatasetUserRoles();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetUsers', () => {
  
    const dataset = new OrgCheckDatasetUsers();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetVisualForceComponents', () => {
  
    const dataset = new OrgCheckDatasetVisualForceComponents();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });
  
  describe('Test OrgCheckDatasetVisualForcePages', () => {
  
    const dataset = new OrgCheckDatasetVisualForcePages();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });
  
  describe('Test OrgCheckDatasetWorkflows', () => {
  
    const dataset = new OrgCheckDatasetWorkflows();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const results = await dataset.run(sfdcManager, DATA_FACTORY_MOCK, LOCAL_LOGGER_MOCK);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });
});