import { OrgCheckDatasetManager } from "../api/core/orgcheck-api-datasetmanager-impl";
import { OrgCheckRecipeManager } from "../api/core/orgcheck-api-recipemanager-impl";
import { OrgCheckSalesforceManagerIntf } from "../api/core/orgcheck-api-salesforcemanager";
import { OrgCheckDataCacheManager } from "../api/core/orgcheck-api-cachemanager-impl";
import { OrgCheckDatasetManagerIntf } from "../api/core/orgcheck-api-datasetmanager";
import { OrgCheckDatasetAliases } from "../api/core/orgcheck-api-datasets-aliases";
import { OrgCheckSalesforceManager } from "../api/core/orgcheck-api-salesforcemanager-impl";
import { OrgCheckLoggerIntf } from "../api/core/orgcheck-api-logger";
import { OrgCheckDataCacheManagerIntf } from "../api/core/orgcheck-api-cachemanager";

class SalesforceManagerMock extends OrgCheckSalesforceManagerIntf {
  get apiVersion() { return 53; }
  caseSafeId(id) { return id; }
  setupUrl(id, type, parentId, parentType) { return null; }
  getObjectType(objectName, isCustomSetting) { return null; }
  get dailyApiRequestLimitInformation() { return null; }
  async soqlQuery(queries, logger) { return queries.map((e) => { return []; }); }
  async dependenciesQuery(ids, logger) { return { records: [], errors: [] }; }
  async readMetadata(metadatas, logger) { return new Map(); }
  async readMetadataAtScale(type, ids, byPasses, logger) { return []; }
  async describeGlobal(logger) { return null; }
  async describe(sobjectDevName, logger) { return {}; }
  async recordCount(sobjectDevName, logger) { return 0; }
}

const ProfilePasswordPolicy = 'ProfilePasswordPolicy';
const ProfilePasswordPolicy_Member1__Profile = 'profile1';
const ProfilePasswordPolicy_Member2__Profile = 'profile2';

class JsForceMetadataMock {
  list(requests) {
    if (requests[0].type === ProfilePasswordPolicy) {
      return [
        { fullName: 'test36_profilePasswordPolicy1677694498243' }, 
        { fullName: 'test32_profilePasswordPolicy1677694267531' },
        { fullName: 'test_35_profilePasswordPolicy1677694446603' },
        { fullName: 'test33_profilePasswordPolicy1677694383439' }
      ];
    }
    throw new Error('Need implt.');
  }
  read(type, members) {
    if (type === ProfilePasswordPolicy) {
      return [
        {"fullName":"test36_profilePasswordPolicy1677694498243","forgotPasswordRedirect":false,"lockoutInterval":60,"maxLoginAttempts":5,"minimumPasswordLength":8,"minimumPasswordLifetime":true,"obscure":true,"passwordComplexity":1,"passwordExpiration":90,"passwordHistory":3,"passwordQuestion":1,"profile":ProfilePasswordPolicy_Member1__Profile},
        {"fullName":"test32_profilePasswordPolicy1677694267531","forgotPasswordRedirect":false,"lockoutInterval":60,"maxLoginAttempts":5,"minimumPasswordLength":8,"minimumPasswordLifetime":true,"obscure":true,"passwordComplexity":1,"passwordExpiration":90,"passwordHistory":3,"passwordQuestion":1,"profile":ProfilePasswordPolicy_Member2__Profile},
        {"fullName":"test_35_profilePasswordPolicy1677694446603","forgotPasswordRedirect":false,"lockoutInterval":60,"maxLoginAttempts":5,"minimumPasswordLength":8,"minimumPasswordLifetime":true,"obscure":true,"passwordComplexity":1,"passwordExpiration":90,"passwordHistory":3,"passwordQuestion":1,"profile":""},
        {"fullName":"test33_profilePasswordPolicy1677694383439","forgotPasswordRedirect":false,"lockoutInterval":60,"maxLoginAttempts":5,"minimumPasswordLength":8,"minimumPasswordLifetime":true,"obscure":true,"passwordComplexity":1,"passwordExpiration":90,"passwordHistory":3,"passwordQuestion":1,"profile":""}        
      ];
    } else {
      throw new Error('Need implt.');
    }
  }
}

class JsForceConnectionMock {
  metadata;
  constructor() {
    this.metadata = new JsForceMetadataMock();
  }
}

const JsForceMock = {
  Connection: JsForceConnectionMock
}

class CacheManagerMock extends OrgCheckDataCacheManagerIntf {
    has(key) { return false; }
    get(key) { return ''; }
    set(key, value) { }
    details() { return []; }
    remove(key) { }
    clear() {};
}

class LoggerMock extends OrgCheckLoggerIntf {
  begin() { }
  sectionStarts(sectionName, message) { }
  sectionContinues(sectionName, message) { }
  sectionEnded(sectionName, message) { }
  sectionFailed(sectionName, error) { }
  end(countSuccesses=0, countFailures=0) { }
  toSimpleLogger() { return { log: () => {}, debug: () => {} }; }
}

class DatasetManagerMock extends OrgCheckDatasetManagerIntf {}

describe('api.core.OrgCheckManagers', () => {

  describe('Test OrgCheckDatasetManager implementation', () => {
    
    it('checks if the dataset manager implementation runs correctly', async () => {
      const manager = new OrgCheckDatasetManager(
        new SalesforceManagerMock(),
        new CacheManagerMock(),
        new LoggerMock()
      ); 
      const results1 = await manager.run([ OrgCheckDatasetAliases.APEXCLASSES ]);
      expect(results1).toBeDefined();
      expect(results1 instanceof Map).toBeTruthy();
      expect(results1.size).toBe(1);
      expect(results1.has(OrgCheckDatasetAliases.APEXCLASSES)).toBeTruthy();
      const apexClasses = results1.get(OrgCheckDatasetAliases.APEXCLASSES);
      expect(apexClasses instanceof Map).toBeTruthy();
      expect(apexClasses.size).toBe(0);

      const results2 = await manager.run([ OrgCheckDatasetAliases.PROFILEPWDPOLICIES ]);
      expect(results2).toBeDefined();
      expect(results2 instanceof Map).toBeTruthy();
      expect(results2.size).toBe(1);
      expect(results2.has(OrgCheckDatasetAliases.PROFILEPWDPOLICIES)).toBeTruthy();
      const policies = results2.get(OrgCheckDatasetAliases.PROFILEPWDPOLICIES);
      expect(policies instanceof Map).toBeTruthy();
      expect(policies.size).toBe(0);
    });    
  });

  describe('Test OrgCheckRecipeManager implementation', () => {

    it('checks if the recipe manager implementation runs correctly', async () => {
      const manager = new OrgCheckRecipeManager(
        new DatasetManagerMock(),
        new LoggerMock()
      );      
    });
  });

  describe('Test OrgCheckDataCacheManager implementation', () => {

    it('checks if the cache manager implementation runs correctly', async () => {
      const manager = new OrgCheckDataCacheManager({});      
    });
  });

  describe('Test OrgCheckSalesforceManager implementation', () => {

    const manager = new OrgCheckSalesforceManager(JsForceMock, '');
    const logger = new LoggerMock();
    it('checks if the salesforce manager implementation runs readMetadata correctly', async () => {
      const readMetadataResults = await manager.readMetadata([{ type: ProfilePasswordPolicy, members: ['*'] }], logger.toSimpleLogger());
      expect(readMetadataResults).toBeDefined();
      expect(readMetadataResults instanceof Map).toBeTruthy();
      expect(readMetadataResults.size).toBe(1);
      expect(readMetadataResults.has(ProfilePasswordPolicy)).toBeTruthy();
      const policies = readMetadataResults.get(ProfilePasswordPolicy);
      expect(policies instanceof Array).toBeTruthy();
      expect(policies.length).toBe(4);
    });
  });
});