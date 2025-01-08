import { OrgCheckDataFactoryIntf } from '../api/core/orgcheck-api-datafactory';
import { OrgCheckSimpleLoggerIntf } from '../api/core/orgcheck-api-logger';
import { OrgCheckSalesforceManagerIntf } from '../api/core/orgcheck-api-salesforcemanager';
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

class SfdcManagerMock extends OrgCheckSalesforceManagerIntf { 

  SfdcManagerMock() {}

  #soqlQueryResponses = {};
  #describeGlobal = [];

  addSoqlQueryResponse(queryMatch, records) {
    this.#soqlQueryResponses[queryMatch] = records;
  }

  setDescribeGolbal(describeGlobal) {
    this.#describeGlobal = describeGlobal;
  }

  // ---------------------------------------------------------------------------
  // METHODS FROM OrgCheckSalesforceManager
  // ---------------------------------------------------------------------------

  get apiVersion() { return 53; }

  caseSafeId(id) { return id; }

  setupUrl(id, type, parentId, parentType) { return `/setupURL/type/${type}/id/${id}`; }

  getObjectType(objectName, isCustomSetting) {
    return isCustomSetting ? 'CustomSetting' : 'StandardObject';
  }

  get dailyApiRequestLimitInformation() { return null; }

  async soqlQuery(queries, logger) { 
    return queries.map((query) => { 
      const key = Object.keys(this.#soqlQueryResponses).find((p) => query?.string?.indexOf(p) !== -1);
      return { records: (key ? this.#soqlQueryResponses[key] : []) }; 
    });
  }

  async dependenciesQuery(ids, logger) { return { records: [], errors: [] }; }

  async readMetadata(metadatas, logger) { return metadatas.map(() => { return []; }); }

  async readMetadataAtScale(type, ids, byPasses, logger) { return []; }

  async describeGlobal(logger) { return this.#describeGlobal; }

  async describe(sobjectDevName, logger) { return {}; }

  async recordCount(sobjectDevName, logger) { return 0; }

}

class DataFactoryMock extends OrgCheckDataFactoryIntf { 

  getValidationRule(id) { return null; }

  getInstance(dataClass) {
    return {
      create: (setup) => { return setup.properties; },
      createWithScore: (setup) => { setup.score = 0; return setup.properties; },
      computeScore: (row) => { row.score = 0; return row; }
    }
  }
};

class SimpleLoggerMock extends OrgCheckSimpleLoggerIntf {
  log() {}
  debug() {}
}

describe('api.core.OrgCheckDatasets', () => {

  describe('Test OrgCheckDatasetApexClasses', () => {
  
    const dataset = new OrgCheckDatasetApexClasses();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });

    it('checks if regex are correct', async() => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      sfdcManager.addSoqlQueryResponse('FROM ApexClass ', [
        {
          Id: '01',
          Name: 'TestA',
          SymbolTable: { tableDeclaration: { modifiers: [ 'testMethod' ] }},
          Body: "@isTest \nprivate class TestA {\n public static void test() {\n assert.fail ();\n //Assert.fail();\n /*Assert.areEqual(true, '', 'ii'); aSSert.isFalse(1 == 1, 'false');*/\n}\n}"
        },
        {
          Id: '02',
          Name: 'TestB',
          SymbolTable: { tableDeclaration: { modifiers: [ 'testMethod' ] }},
          Body: "@isTest (SeeAllData=true) \nprivate class TestB {\n public static void test() {\n assert.fail ();\n Assert.fail();\n /*Assert.areEqual(true, '', 'ii'); aSSert.isFalse(1 == 1, 'false');*/\n}\n}"
        },
        {
          Id: '03',
          Name: 'TestC',
          SymbolTable: { tableDeclaration: { modifiers: [ 'testMethod' ] }},
          Body: "@isTest (SeeAllData=false) \nprivate class TestC {\n public static void test() {\n assert.fail ();\n Assert.fail();\n Assert.areEqual(true, '', 'ii'); aSSert.isFalse(1 == 1, 'false');\n}\n}"
        },
        {
          Id: '04',
          Name: 'C',
          SymbolTable: { tableDeclaration: { modifiers: [] }},
          Body: "public class C {\n public static void doSomething() {\n assert.fail ();\n}\n}"
        },
        {
          Id: '05',
          Name: 'TestD',
          SymbolTable: { tableDeclaration: { modifiers: [ 'testMethod' ] }},
          Body: "@isTest(SeeAllData=true) \nprivate class TestD {\n public static void test() {\n}\n}"
        }
      ])
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(5);
      expect(results.get('01').name).toBe('TestA');
      expect(results.get('01').isTest).toBeTruthy();
      expect(results.get('01').isTestSeeAllData).toBeFalsy();
      expect(results.get('01').nbSystemAsserts).toBe(1);
      expect(results.get('02').name).toBe('TestB');
      expect(results.get('02').isTest).toBeTruthy();
      expect(results.get('02').isTestSeeAllData).toBeTruthy();
      expect(results.get('02').nbSystemAsserts).toBe(2);
      expect(results.get('03').name).toBe('TestC');
      expect(results.get('03').isTest).toBeTruthy();
      expect(results.get('03').isTestSeeAllData).toBeFalsy();
      expect(results.get('03').nbSystemAsserts).toBe(4);
      expect(results.get('04').name).toBe('C');
      expect(results.get('04').isTest).toBeFalsy();
      expect(results.get('04').isTestSeeAllData).toBeFalsy();
      expect(results.get('04').nbSystemAsserts).toBeUndefined();
      expect(results.get('05').name).toBe('TestD');
      expect(results.get('05').isTest).toBeTruthy();
      expect(results.get('05').isTestSeeAllData).toBeTruthy();
      expect(results.get('05').nbSystemAsserts).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetApexTriggers', () => {
  
    const dataset = new OrgCheckDatasetApexTriggers();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetAppPermissions', () => {
  
    const dataset = new OrgCheckDatasetAppPermissions();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
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
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const parameters = new Map([ ['permissions', ['a', 'b']] ]);
      const results = await dataset.run(sfdcManager, dataFactory, logger, parameters);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(1);
    });
  });
  
  describe('Test OrgCheckDatasetCustomFields', () => {
  
    const dataset = new OrgCheckDatasetCustomFields();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger, null);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetCustomLabels', () => {
  
    const dataset = new OrgCheckDatasetCustomLabels();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetFlows', () => {
  
    const dataset = new OrgCheckDatasetFlows();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetGroups', () => {
  
    const dataset = new OrgCheckDatasetGroups();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetLightningAuraComponents', () => {
  
    const dataset = new OrgCheckDatasetLightningAuraComponents();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetLightningPages', () => {
  
    const dataset = new OrgCheckDatasetLightningPages();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetLightningWebComponents', () => {
  
    const dataset = new OrgCheckDatasetLightningWebComponents();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
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
      ]);
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const parameters = new Map([ ['object', 'Account'] ]);
      const result = await dataset.run(sfdcManager, dataFactory, logger, parameters);
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
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
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
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });

    it('checks if we do not have a regression for issue #476', async () => {
      const sfdcManager = new SfdcManagerMock();
      const describeGlobal = [
        {
          activateable: false, associateEntityType: "ChangeEvent", associateParentEntity: "Activation__c",
          createable: false, custom: false, customSetting: false, deepCloneable: false, deletable: false, 
          deprecatedAndHidden: false, feedEnabled: false, hasSubtypes: false, isInterface: false, 
          isSubtype: false, keyPrefix: null, layoutable: false, mergeable: false, mruEnabled: false,
          label: "Change Event: Activation", labelPlural: "Change Event: Activation", name: "Activation__ChangeEvent", 
          queryable: false, replicateable: false, retrieveable: true, searchable: false, triggerable: true, 
          undeletable: false, updateable: false,
          urls: {
            rowTemplate: "/services/data/v60.0/sobjects/Activation__ChangeEvent/{ID}",
            eventSchema: "/services/data/v60.0/sobjects/Activation__ChangeEvent/eventSchema",
            describe: "/services/data/v60.0/sobjects/Activation__ChangeEvent/describe",
            sobject: "/services/data/v60.0/sobjects/Activation__ChangeEvent"
          }
        },
        {
          activateable: false, associateEntityType: "Feed", associateParentEntity: "Activation__c",
          createable: false, custom: false, customSetting: false, deepCloneable: false, deletable: true, 
          deprecatedAndHidden: false, feedEnabled: false, hasSubtypes: false, isInterface: false, 
          isSubtype: false, keyPrefix: null, layoutable: false, mergeable: false, mruEnabled: false, 
          label: "Feed: Activation", labelPlural: "Feed: Activation", name: "Activation__Feed", 
          queryable: true, replicateable: true, retrieveable: true, searchable: false, triggerable: false, 
          undeletable: false, updateable: false,
          urls: {
            rowTemplate: "/services/data/v60.0/sobjects/Activation__Feed/{ID}",
            describe: "/services/data/v60.0/sobjects/Activation__Feed/describe",
            sobject: "/services/data/v60.0/sobjects/Activation__Feed"
          }
        }, {
          activateable: false, associateEntityType: null, associateParentEntity: null, createable: true, 
          custom: true, customSetting: false, deepCloneable: false, deletable: true, deprecatedAndHidden: false, 
          feedEnabled: true, hasSubtypes: false, isInterface: false, isSubtype: false, keyPrefix: "a3L", 
          layoutable: true, mergeable: false, mruEnabled: true, queryable: true, replicateable: true, 
          label: "Activation", labelPlural: "Activations", name: "Activation__c", 
          retrieveable: true, searchable: true, triggerable: true, undeletable: true, updateable: true,
          urls: {
            compactLayouts: "/services/data/v60.0/sobjects/Activation__c/describe/compactLayouts",
            rowTemplate: "/services/data/v60.0/sobjects/Activation__c/{ID}",
            approvalLayouts: "/services/data/v60.0/sobjects/Activation__c/describe/approvalLayouts",
            describe: "/services/data/v60.0/sobjects/Activation__c/describe",
            quickActions: "/services/data/v60.0/sobjects/Activation__c/quickActions",
            layouts: "/services/data/v60.0/sobjects/Activation__c/describe/layouts",
            sobject: "/services/data/v60.0/sobjects/Activation__c"
          }
        }, {
          activateable: false, associateEntityType: null, associateParentEntity: null, createable: true, 
          custom: true, customSetting: false, deepCloneable: false, deletable: true, deprecatedAndHidden: false, 
          feedEnabled: true, hasSubtypes: false, isInterface: false, isSubtype: false, keyPrefix: "a3V", 
          layoutable: true, mergeable: false, mruEnabled: true, queryable: true, replicateable: true, 
          label: "CR Volunteers", labelPlural: "CR Volunteers", name: "CR_Volunteers__c", 
          retrieveable: true, searchable: true, triggerable: true, undeletable: true, updateable: true,
          urls: {
            compactLayouts: "/services/data/v60.0/sobjects/CR_Volunteers__c/describe/compactLayouts",
            rowTemplate: "/services/data/v60.0/sobjects/CR_Volunteers__c/{ID}",
            approvalLayouts: "/services/data/v60.0/sobjects/CR_Volunteers__c/describe/approvalLayouts",
            describe: "/services/data/v60.0/sobjects/CR_Volunteers__c/describe",
            quickActions: "/services/data/v60.0/sobjects/CR_Volunteers__c/quickActions",
            layouts: "/services/data/v60.0/sobjects/CR_Volunteers__c/describe/layouts",
            sobject: "/services/data/v60.0/sobjects/CR_Volunteers__c"
          }
        }
      ];
      const entityDefinitions = [
        { DurableId: '0117V000000VJvx', NamespacePrefix: '', DeveloperName: 'Activation', 
          QualifiedApiName: 'Activation__c', ExternalSharingModel: 'private', InternalSharingModel: 'private' },
        { DurableId: '0117V000000VJw7', NamespacePrefix: null, DeveloperName: 'CR_Volunteers', 
          QualifiedApiName: 'CR_Volunteers__c', ExternalSharingModel: 'private', InternalSharingModel: 'private' }
      ];
      for (let o = 0; o < 10; o++) {
        entityDefinitions.push({ 
          DurableId: `0117V000000${o}`, NamespacePrefix: '', DeveloperName: `${o}`, 
          QualifiedApiName: `${o}__c`, ExternalSharingModel: 'private', InternalSharingModel: 'private' });
        describeGlobal.push({ activateable: false, associateEntityType: null, associateParentEntity: null,
          createable: true, custom: true, customSetting: false, deepCloneable: false,
          deletable: true, deprecatedAndHidden: false, feedEnabled: true, hasSubtypes: false,
          isInterface: false, isSubtype: false, keyPrefix: "a3V", label: `${o}`,
          labelPlural: `${o}s`, layoutable: true, mergeable: false, mruEnabled: true,
          name: `${o}__c`, queryable: true, replicateable: true, retrieveable: true,
          searchable: true, triggerable: true, undeletable: true, updateable: true, urls: {
            rowTemplate: "/services/data/v60.0/sobjects/${o}__c/{ID}",
            eventSchema: "/services/data/v60.0/sobjects/${o}__c/eventSchema",
            describe: "/services/data/v60.0/sobjects/${o}__c/describe",
            sobject: "/services/data/v60.0/sobjects/${o}__c"
          }
 })
      }
      sfdcManager.setDescribeGolbal(describeGlobal);
      sfdcManager.addSoqlQueryResponse('FROM EntityDefinition', entityDefinitions);
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(12);
      expect(results.has('Activation__c')).toBeTruthy();
      expect(results.has('CR_Volunteers__c')).toBeTruthy();
      expect(results.has('0__c')).toBeTruthy();
      expect(results.has('9__c')).toBeTruthy();
    });
  });

  describe('Test OrgCheckDatasetObjectTypes', () => {
  
    const dataset = new OrgCheckDatasetObjectTypes();      
    it('checks if this dataset class runs correctly', async () => {
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(null, dataFactory, logger);
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
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const result = await dataset.run(sfdcManager, dataFactory, logger);
      expect(result).toBeDefined();
      expect(result instanceof Map).toBeFalsy();
      expect(result instanceof Object).toBeTruthy();
      expect(result).toHaveProperty('id');
      expect(result.id).toBe('00Dxxxx');
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
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(3);
    });
  });

  describe('Test OrgCheckDatasetPermissionSets', () => {
  
    const dataset = new OrgCheckDatasetPermissionSets();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });
  
  describe('Test OrgCheckDatasetProfilePasswordPolicies', () => {
  
    const dataset = new OrgCheckDatasetProfilePasswordPolicies();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });
  
  describe('Test OrgCheckDatasetProfileRestrictions', () => {
  
    const dataset = new OrgCheckDatasetProfileRestrictions();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetProfiles', () => {
  
    const dataset = new OrgCheckDatasetProfiles();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetUserRoles', () => {
  
    const dataset = new OrgCheckDatasetUserRoles();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetUsers', () => {
  
    const dataset = new OrgCheckDatasetUsers();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });

  describe('Test OrgCheckDatasetVisualForceComponents', () => {
  
    const dataset = new OrgCheckDatasetVisualForceComponents();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });
  
  describe('Test OrgCheckDatasetVisualForcePages', () => {
  
    const dataset = new OrgCheckDatasetVisualForcePages();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });
  
  describe('Test OrgCheckDatasetWorkflows', () => {
  
    const dataset = new OrgCheckDatasetWorkflows();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
  });
});