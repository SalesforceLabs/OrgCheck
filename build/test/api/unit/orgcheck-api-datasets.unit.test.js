import { DataFactoryIntf } from '../../../src/api/core/orgcheck-api-datafactory';
import { SimpleLoggerIntf } from '../../../src/api/core/orgcheck-api-logger';
import { SalesforceManagerIntf } from '../../../src/api/core/orgcheck-api-salesforcemanager';
import { DatasetApexClasses } from '../../../src/api/dataset/orgcheck-api-dataset-apexclasses';
import { DatasetApexTriggers } from '../../../src/api/dataset/orgcheck-api-dataset-apextriggers';
import { DatasetAppPermissions } from '../../../src/api/dataset/orgcheck-api-dataset-apppermissions';
import { DatasetCurrentUserPermissions } from '../../../src/api/dataset/orgcheck-api-dataset-currentuserpermissions';
import { DatasetCustomFields } from '../../../src/api/dataset/orgcheck-api-dataset-customfields';
import { DatasetCustomLabels } from '../../../src/api/dataset/orgcheck-api-dataset-customlabels';
import { DatasetDocuments } from '../../../src/api/dataset/orgcheck-api-dataset-documents';
import { DatasetFieldPermissions } from '../../../src/api/dataset/orgcheck-api-dataset-fieldpermissions';
import { DatasetFlows } from '../../../src/api/dataset/orgcheck-api-dataset-flows';
import { DatasetGroups } from '../../../src/api/dataset/orgcheck-api-dataset-groups';
import { DatasetLightningAuraComponents } from '../../../src/api/dataset/orgcheck-api-dataset-lighntingauracomponents';
import { DatasetLightningPages } from '../../../src/api/dataset/orgcheck-api-dataset-lighntingpages';
import { DatasetLightningWebComponents } from '../../../src/api/dataset/orgcheck-api-dataset-lighntingwebcomponents';
import { DatasetObject } from '../../../src/api/dataset/orgcheck-api-dataset-object';
import { DatasetObjectPermissions } from '../../../src/api/dataset/orgcheck-api-dataset-objectpermissions';
import { DatasetObjects } from '../../../src/api/dataset/orgcheck-api-dataset-objects';
import { DatasetObjectTypes } from '../../../src/api/dataset/orgcheck-api-dataset-objecttypes';
import { DatasetOrganization } from '../../../src/api/dataset/orgcheck-api-dataset-organization';
import { DatasetPackages } from '../../../src/api/dataset/orgcheck-api-dataset-packages';
import { DatasetPageLayouts } from '../../../src/api/dataset/orgcheck-api-dataset-pagelayouts';
import { DatasetPermissionSetLicenses } from '../../../src/api/dataset/orgcheck-api-dataset-permissionsetlicenses';
import { DatasetPermissionSets } from '../../../src/api/dataset/orgcheck-api-dataset-permissionsets';
import { DatasetProfilePasswordPolicies } from '../../../src/api/dataset/orgcheck-api-dataset-profilepasswordpolicies';
import { DatasetProfileRestrictions } from '../../../src/api/dataset/orgcheck-api-dataset-profilerestrictions';
import { DatasetProfiles } from '../../../src/api/dataset/orgcheck-api-dataset-profiles';
import { DatasetUserRoles } from '../../../src/api/dataset/orgcheck-api-dataset-userroles';
import { DatasetInternalActiveUsers } from '../../../src/api/dataset/orgcheck-api-dataset-internalactiveusers';
import { DatasetValidationRules } from '../../../src/api/dataset/orgcheck-api-dataset-validationrules';
import { DatasetVisualForceComponents } from '../../../src/api/dataset/orgcheck-api-dataset-visualforcecomponents';
import { DatasetVisualForcePages } from '../../../src/api/dataset/orgcheck-api-dataset-visualforcepages';
import { DatasetWorkflows } from '../../../src/api/dataset/orgcheck-api-dataset-workflows';
import { DatasetRecordTypes } from '../../../src/api/dataset/orgcheck-api-dataset-recordtypes';
import { DatasetCollaborationGroups } from '../../../src/api/dataset/orgcheck-api-dataset-collaborationgroups';
import { DatasetHomePageComponents } from '../../../src/api/dataset/orgcheck-api-dataset-homepagecomponents';
import { DatasetCustomTabs } from '../../../src/api/dataset/orgcheck-api-dataset-customtabs';
import { DatasetEmailTemplates } from '../../../src/api/dataset/orgcheck-api-dataset-emailtemplates';

class SfdcManagerMock extends SalesforceManagerIntf { 

  SfdcManagerMock() {}

  #soqlQueryResponses = {};
  #describeGlobal = [];

  addSoqlQueryResponse(/** @type {string} */ queryMatch, /** @type {Array<any>} */ response) {
    this.#soqlQueryResponses[queryMatch] = response;
  }

  setDescribeGolbal(describeGlobal) {
    this.#describeGlobal = describeGlobal;
  }

  // ---------------------------------------------------------------------------
  // METHODS FROM SalesforceManager
  // ---------------------------------------------------------------------------

  get apiVersion() { return 53; }

  caseSafeId(id) { return id; }

  setupUrl(id, type, _parentId, _parentType) { return `/setupURL/type/${type}/id/${id}`; }

  getObjectType(_objectName, isCustomSetting) {
    return isCustomSetting ? 'CustomSetting' : 'StandardObject';
  }

  get dailyApiRequestLimitInformation() { return null; }

  async soqlQuery(queries, _logger) { 
    return queries.map((query) => { 
      const key = Object.keys(this.#soqlQueryResponses).find((p) => query?.string?.indexOf(p) !== -1);
      const response = this.#soqlQueryResponses[key];
      return response ?? [];
    });
  }

  async dependenciesQuery(_ids, _logger) { return { records: [], errors: [] }; }

  async readMetadata(_metadatas, _logger) { return new Map(); }

  async readMetadataAtScale(_type, _ids, _byPasses, _logger) { return []; }

  async describeGlobal(_logger) { return this.#describeGlobal; }

  async describe(_sobjectDevName, _logger) { return {}; }

  async recordCount(_sobjectDevName, _logger) { return 0; }

}

class DataFactoryMock extends DataFactoryIntf { 

  getScoreRule(_id) { return null; }

  getInstance(_dataClass) {
    return {
      create: (setup) => { return setup.properties; },
      createWithScore: (setup) => { setup.score = 0; return setup.properties; },
      computeScore: (row) => { row.score = 0; return row; }
    }
  }
};

class SimpleLoggerMock extends SimpleLoggerIntf {
  log() {}
  debug() {}
}





describe('tests.api.unit.Datasets', () => {

  describe('Basic test for all datasets', () => {
    [
      DatasetApexClasses, DatasetApexTriggers, DatasetAppPermissions, 
      DatasetCurrentUserPermissions, DatasetCustomFields, 
      DatasetCustomLabels, DatasetDocuments, DatasetFieldPermissions, 
      DatasetFlows, DatasetGroups, DatasetLightningAuraComponents, 
      DatasetLightningPages, DatasetLightningWebComponents, 
      /*DatasetObject, */ DatasetObjectPermissions, DatasetObjects, 
      DatasetObjectTypes, DatasetOrganization, DatasetPackages, 
      DatasetPageLayouts, DatasetPermissionSetLicenses, 
      DatasetPermissionSets, DatasetProfilePasswordPolicies, 
      DatasetProfileRestrictions, DatasetProfiles, DatasetUserRoles, 
      DatasetInternalActiveUsers, DatasetValidationRules, 
      DatasetVisualForceComponents, DatasetVisualForcePages, 
      DatasetWorkflows, DatasetRecordTypes, DatasetCollaborationGroups, 
      DatasetHomePageComponents, DatasetCustomTabs, DatasetEmailTemplates 
    ].forEach((datasetClass) => {
      const dataset = new datasetClass();
      it(`checks if ${dataset.constructor.name} runs correctly`, async () => {
        const sfdcManager = new SfdcManagerMock();
        const dataFactory = new DataFactoryMock();
        const logger = new SimpleLoggerMock();
        let hadError = false, errorMessageIfAny = undefined;
        try {
          const results = await dataset.run(sfdcManager, dataFactory, logger);
          expect(results).toBeDefined();
          expect(results instanceof Map).toBeTruthy();
          expect(results.size).toBeDefined();
        } catch (error) {
          hadError = true;
          errorMessageIfAny = error?.message;
        } finally {
          // hadError = true -> OK
          // hadError = false AND msg startsWith.... = true -> OK
          // hadError = false AND msg startsWith.... = false -> KO
          expect(hadError === false && errorMessageIfAny?.startsWith(`${dataset.constructor.name}: `) === false).toBeFalsy();
        }
      });
    });
  });

  describe('Specific test for DatasetApexClasses', () => {
    const dataset = new DatasetApexClasses();      
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

  describe('Specific test for DatasetGroups', () => {
    const dataset = new DatasetGroups();      
    it('checks if mapping is correct', async() => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      sfdcManager.addSoqlQueryResponse('FROM Group ', [
        { Id: '01', Name: 'n01', DeveloperName: 'dn01', DoesIncludeBosses: true,  Type: 'Regular' },
        { Id: '02', Name: 'n02', DeveloperName: 'dn02', DoesIncludeBosses: false, Type: 'Regular' },
        { Id: '03', Name: 'n03', DeveloperName: 'dn03', DoesIncludeBosses: false, Type: 'Queue' },
        { Id: '04', Name: 'n04', DeveloperName: 'dn04', DoesIncludeBosses: true,  Type: 'Role', RelatedId: '0A', Related: { Name: 'n0A' } },
        { Id: '05', Name: 'n05', DeveloperName: 'dn05', DoesIncludeBosses: false, Type: 'RoleAndSubordinates', RelatedId: '0B', Related: { Name: 'n0B' }},
        { Id: '06', Name: 'n06', DeveloperName: 'dn06', DoesIncludeBosses: false, Type: 'RoleAndSubordinatesInternal' },
        { Id: '07', Name: 'n07', DeveloperName: 'dn07', DoesIncludeBosses: false, Type: 'AllCustomerPortal' },
        { Id: '08', Name: 'n08', DeveloperName: 'dn08', DoesIncludeBosses: false, Type: 'Organization' },
        { Id: '09', Name: 'n09', DeveloperName: 'dn09', DoesIncludeBosses: false, Type: 'PRMOrganization' },
        { Id: '10', Name: 'n10', DeveloperName: 'dn10', DoesIncludeBosses: false, Type: 'GuestUserGroup' },
      ]);
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(10);
      expect(results.get('01').name).toBe('n01');
      expect(results.get('01').developerName).toBe('dn01');
      expect(results.get('01').type).toBe('PublicGroup');
      expect(results.get('01').isPublicGroup).toBeTruthy();
      expect(results.get('01').isQueue).toBeFalsy();
      expect(results.get('01').nbDirectMembers).toBe(0);
      expect(results.get('01').directUserIds.length).toBe(0);
      expect(results.get('01').directGroupIds.length).toBe(0);
      expect(results.get('01').includeBosses).toBeTruthy();
      expect(results.get('01').includeSubordinates).toBeFalsy();
      expect(results.get('01').relatedId).toBeUndefined();
      expect(results.get('03').name).toBe('n03');
      expect(results.get('03').developerName).toBe('dn03');
      expect(results.get('03').type).toBe('Queue');
      expect(results.get('03').isPublicGroup).toBeFalsy();
      expect(results.get('03').isQueue).toBeTruthy();
      expect(results.get('03').nbDirectMembers).toBe(0);
      expect(results.get('03').directUserIds.length).toBe(0);
      expect(results.get('03').directGroupIds.length).toBe(0);
      expect(results.get('03').includeBosses).toBeFalsy();
      expect(results.get('03').includeSubordinates).toBeFalsy();
      expect(results.get('03').relatedId).toBeUndefined();
      expect(results.get('04').name).toBe('n0A'); // should be the name of the related role!
      expect(results.get('04').developerName).toBeUndefined(); // no developer name for roles
      expect(results.get('04').type).toBe('UserRole');
      expect(results.get('04').isPublicGroup).toBeFalsy();
      expect(results.get('04').isQueue).toBeFalsy();
      expect(results.get('04').nbDirectMembers).toBe(0);
      expect(results.get('04').directUserIds.length).toBe(0);
      expect(results.get('04').directGroupIds.length).toBe(0);
      expect(results.get('04').includeBosses).toBeFalsy();
      expect(results.get('04').includeSubordinates).toBeFalsy();
      expect(results.get('04').relatedId).toBe('0A');
      expect(results.get('06').name).toBe('(unknown)'); // In this case we do not have a related role so name is unknown!
      expect(results.get('06').developerName).toBeUndefined(); // no developer name for roles
      expect(results.get('06').type).toBe('UserRole');
      expect(results.get('06').isPublicGroup).toBeFalsy();
      expect(results.get('06').isQueue).toBeFalsy();
      expect(results.get('06').nbDirectMembers).toBe(0);
      expect(results.get('06').directUserIds.length).toBe(0);
      expect(results.get('06').directGroupIds.length).toBe(0);
      expect(results.get('06').includeBosses).toBeFalsy();
      expect(results.get('06').includeSubordinates).toBeTruthy();
      expect(results.get('06').relatedId).toBeUndefined(); // In this case we do not have a related role so relatedId is undefined!
    });
  });

  describe('Specific test for DatasetRecordTypes', () => { 
    const dataset = new DatasetRecordTypes();
    it('checks if regex are correct', async() => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(0);
    });
    it('checks if we get the correct data', async() => {
      const sfdcManager = new SfdcManagerMock();
      const dataFactory = new DataFactoryMock();
      sfdcManager.addSoqlQueryResponse('FROM RecordType ', [
        {
          DeveloperName: 'RecordType1', 
          Id: '01', 
          Name: 'Name1', 
          SobjectType: 'Account'
        }
      ]);
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(1);
      expect(results.get('01')).toBeDefined();
      expect(results.get('01').name).toBe('Name1');
      expect(results.get('01').developerName).toBe('RecordType1');
      expect(results.get('01').objectId).toBe('Account'); 
    });
  });

  describe('Specific test for DatasetCurrentUserPermissions', () => {  
    const dataset = new DatasetCurrentUserPermissions();  
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      sfdcManager.addSoqlQueryResponse('SELECT PermissionsA FROM UserPermissionAccess', [{ PermissionsA: true }]);
      sfdcManager.addSoqlQueryResponse('SELECT PermissionsB FROM UserPermissionAccess', [{ PermissionsB: false }]);
      sfdcManager.addSoqlQueryResponse('SELECT PermissionsC FROM UserPermissionAccess', [{ PermissionsC: false }]);
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const parameters = new Map([ ['permissions', ['A', 'B', 'c']] ]); // note the case difference on c!
      const results = await dataset.run(sfdcManager, dataFactory, logger, parameters);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(3); // we only asked for 3 permissions a, b and c (not d!)
      // PermissionsA is returned by Mock SOQL + the name matches the first parameters (capital A after "Permissions")
      expect(results.has('PermissionsA')).toBeTruthy(); // the key is present in the result map
      expect(results.get('PermissionsA')).toBeTruthy(); // and the value is true (value comes from Mock SOQL)
      // PermissionsB is returned by Mock SOQL + the name matches the second parameters (capital B after "Permissions")
      expect(results.has('PermissionsB')).toBeTruthy(); // the key is present in the result map
      expect(results.get('PermissionsB')).toBeFalsy(); // and the value is false (value comes from Mock SOQL)
      // PermissionsC is returned by Mock SOQL + BUT the name DOES NOT matches the third `parameters` map (lower c after "Permissions")
      expect(results.has('PermissionsC')).toBeFalsy(); // the key is therefore NOT present in the result map
      expect(results.get('PermissionsC')).toBeUndefined();  // Getting this key results of an undefined value
      // Permissionsc is NOT returned by Mock SOQL + BUT the name matches the third parameters (lower c after "Permissions")
      expect(results.has('Permissionsc')).toBeTruthy(); // the key is present in the result map
      expect(results.get('Permissionsc')).toBeUndefined();  // Getting this key results of an undefined value because Mock SOQL did not return it
    });
    it('checks if this dataset class runs correctly when one of the permission is not defined in the org', async () => {
      const sfdcManager = new SfdcManagerMock();
      sfdcManager.addSoqlQueryResponse('SELECT PermissionsA FROM UserPermissionAccess', [{ PermissionsA: true }]);
      sfdcManager.addSoqlQueryResponse('SELECT PermissionsZ FROM UserPermissionAccess', []); // PermissionsZ is an invalid field for this org but as we byPass 'INVALID_FIELD', the manager return an empty array
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const resultsKO = await dataset.run(sfdcManager, dataFactory, logger, new Map([ ['permissions', ['A', 'Z']] ]));
      expect(resultsKO).toBeDefined();
    });
  });

  describe('Specific test for DatasetFieldPermissions', () => {
    const dataset = new DatasetFieldPermissions();      
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      sfdcManager.addSoqlQueryResponse('FROM FieldPermissions', [
        { Field: 'Account.Name', PermissionsRead: true, PermissionsEdit: true, ParentId: '0MQ123', Parent: null},
        { Field: 'Account.Name', PermissionsRead: true, PermissionsEdit: true, ParentId: '0PS123', Parent: { IsOwnedByProfile: false, ProfileId: null }},
        { Field: 'Account.Name', PermissionsRead: true, PermissionsEdit: false, ParentId: '0PS456', Parent: { IsOwnedByProfile: true, ProfileId: '00eABC' }},
        { Field: 'Account.Name', PermissionsRead: false, PermissionsEdit: false, ParentId: '0PS789', Parent: { IsOwnedByProfile: true, ProfileId: 'XYZ' }}
      ]);
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const parameters = new Map([ ['object', 'Account'] ]);
      const results = await dataset.run(sfdcManager, dataFactory, logger, parameters);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(3);
    });
  });

  describe('Specific test for DatasetObject', () => {
    const dataset = new DatasetObject();      
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

  describe('Specific test for DatasetObjects', () => {
    const dataset = new DatasetObjects();      
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
        });
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

  describe('Specific test for DatasetOrganization', () => {
    const dataset = new DatasetOrganization();
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

  describe('Specific test for DatasetPackages', () => {
    const dataset = new DatasetPackages();      
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

  describe('Specific test for DatasetUserRoles', () => {  
    const dataset = new DatasetUserRoles();
    it('checks if this dataset class runs correctly', async () => {
      const sfdcManager = new SfdcManagerMock();
      sfdcManager.addSoqlQueryResponse('FROM UserRole', [
        { Id: '001', DeveloperName: '001', Name: '001', ParentRoleId: undefined, PortalType: 'None' }, // LEVEL 1
        { Id: '002', DeveloperName: '002', Name: '002', ParentRoleId: '001', PortalType: 'None' }, // LEVEL 2
        { Id: '003', DeveloperName: '003', Name: '003', ParentRoleId: '001', PortalType: 'None' }, // LEVEL 2
        { Id: '004', DeveloperName: '004', Name: '004', ParentRoleId: '002', PortalType: 'None' }, // LEVEL 3
        { Id: '005', DeveloperName: '005', Name: '005', ParentRoleId: '002', PortalType: 'None' }, // LEVEL 3
        { Id: '006', DeveloperName: '006', Name: '006', ParentRoleId: '004', PortalType: 'None' }, // LEVEL 4
        { Id: '007', DeveloperName: '007', Name: '007', ParentRoleId: '004', PortalType: 'None' }, // LEVEL 4
        { Id: '008', DeveloperName: '008', Name: '008', ParentRoleId: '007', PortalType: 'None' }, // LEVEL 5
        { Id: '009', DeveloperName: '009', Name: '009', ParentRoleId: '006', PortalType: 'None' }, // LEVEL 5
        { Id: '010', DeveloperName: '010', Name: '010', ParentRoleId: '001', PortalType: 'None' }  // LEVEL 2
      ]);
      const dataFactory = new DataFactoryMock();
      const logger = new SimpleLoggerMock();
      const results = await dataset.run(sfdcManager, dataFactory, logger);
      expect(results).toBeDefined();
      expect(results instanceof Map).toBeTruthy();
      expect(results.size).toBe(10);
      expect(results.get('001')).toBeDefined();
      expect(results.get('001').level).toBe(1);
      expect(results.get('002')).toBeDefined();
      expect(results.get('002').level).toBe(2);
      expect(results.get('003')).toBeDefined();
      expect(results.get('003').level).toBe(2);
      expect(results.get('004')).toBeDefined();
      expect(results.get('004').level).toBe(3);
      expect(results.get('005')).toBeDefined();
      expect(results.get('005').level).toBe(3);
      expect(results.get('006')).toBeDefined();
      expect(results.get('006').level).toBe(4);
      expect(results.get('007')).toBeDefined();
      expect(results.get('007').level).toBe(4);
      expect(results.get('008')).toBeDefined();
      expect(results.get('008').level).toBe(5);
      expect(results.get('009')).toBeDefined();
      expect(results.get('009').level).toBe(5);
      expect(results.get('010')).toBeDefined();
      expect(results.get('010').level).toBe(2);
    });
  });

});