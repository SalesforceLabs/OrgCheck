import { DatasetManager } from "../../../src/api/core/orgcheck-api-datasetmanager-impl";
import { RecipeManager } from "../../../src/api/core/orgcheck-api-recipemanager-impl";
import { SalesforceManagerIntf } from "../../../src/api/core/orgcheck-api-salesforcemanager";
import { DataCacheManager } from "../../../src/api/core/orgcheck-api-cachemanager-impl";
import { DatasetManagerIntf } from "../../../src/api/core/orgcheck-api-datasetmanager";
import { DatasetAliases } from "../../../src/api/core/orgcheck-api-datasets-aliases";
import { SalesforceManager } from "../../../src/api/core/orgcheck-api-salesforcemanager-impl";
import { LoggerIntf } from "../../../src/api/core/orgcheck-api-logger";
import { DataCacheManagerIntf } from "../../../src/api/core/orgcheck-api-cachemanager";

class SalesforceManagerMock extends SalesforceManagerIntf {
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

  async query(string, options) { 
    if (string.includes('#Wait500ms#')) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    } else if (string.includes('#Wait900ms#')) {
      await new Promise((resolve) => setTimeout(resolve, 900));
    }
    if (string.includes('#RaiseError#')) {
      throw new Error('Error raised by the query');
    }
    const nbRecords = string.includes('TableWith10Records') ? 10 : 
                      string.includes('TableWith100Records') ? 100 : 
                      string.includes('TableWith1000Records') ? 1000 : 5;
    return {
      records: new Array(nbRecords).map((r, i) => { return { Id: `abc${i}`, Name: `Test${i}` }; }) 
    };
  }
}

const JsForceMock = {
  Connection: JsForceConnectionMock
}

class CacheManagerMock extends DataCacheManagerIntf {
    has(key) { return false; }
    get(key) { return ''; }
    set(key, value) { }
    details() { return []; }
    remove(key) { }
    clear() {};
}

class LoggerMock extends LoggerIntf {
  log(sectionName, message) { }
  ended(sectionName, message) { }
  failed(sectionName, error) { }
  toSimpleLogger() { return { log: () => {}, debug: () => {} }; }
}

class DatasetManagerMock extends DatasetManagerIntf {}

describe('tests.api.unit.Managers', () => {

  describe('Test DatasetManager implementation', () => {
    
    it('checks if the dataset manager implementation runs correctly', async () => {
      const manager = new DatasetManager(
        new SalesforceManagerMock(),
        new CacheManagerMock(),
        new LoggerMock()
      ); 
      const results1 = await manager.run([ DatasetAliases.APEXCLASSES ]);
      expect(results1).toBeDefined();
      expect(results1 instanceof Map).toBeTruthy();
      expect(results1.size).toBe(1);
      expect(results1.has(DatasetAliases.APEXCLASSES)).toBeTruthy();
      const apexClasses = results1.get(DatasetAliases.APEXCLASSES);
      expect(apexClasses instanceof Map).toBeTruthy();
      expect(apexClasses.size).toBe(0);

      const results2 = await manager.run([ DatasetAliases.PROFILEPWDPOLICIES ]);
      expect(results2).toBeDefined();
      expect(results2 instanceof Map).toBeTruthy();
      expect(results2.size).toBe(1);
      expect(results2.has(DatasetAliases.PROFILEPWDPOLICIES)).toBeTruthy();
      const policies = results2.get(DatasetAliases.PROFILEPWDPOLICIES);
      expect(policies instanceof Map).toBeTruthy();
      expect(policies.size).toBe(0);
    });    
  });

  describe('Test RecipeManager implementation', () => {

    it('checks if the recipe manager implementation runs correctly', async () => {
      const manager = new RecipeManager(
        new DatasetManagerMock(),
        new LoggerMock()
      );      
    });
  });

  describe('Test DataCacheManager implementation', () => {

    it('checks if the cache manager implementation runs correctly', async () => {
      const manager = new DataCacheManager({ 
        compress: (d) => d,
        decompress: (d) => d,
        encode: (d) => d,
        decode: (d) => d,
        storage: {}
      });
    });

    it('checks if the cache manager implementation behaves normally when storage is full', async () => {
      const mockCache = new Map();
      const manager = new DataCacheManager({ 
        compress: (buffer) => buffer,
        decompress: (buffer) => buffer,
        encode: (/** @type {string} */ stringData) => new Uint8Array(stringData.length),
        decode: (/** @type {Uint8Array} */ buffer) => `{"data": "${'value'.padStart(buffer.length, '*')}"}`,
        storage: {
          setItem: (key, value) => { 
            if (value.length > 200) { 
              throw new Error(`Simulation of a LocalStorage limitation to 200 characters for key: ${key}`); 
            } else { 
              mockCache.set(key, value); 
          }},
          getItem: (key) => { return mockCache.get(key); },
          removeItem: (key) => { mockCache.delete(key); },
          key: (index) => { return Array.from(mockCache.keys())[index]; },
          keys: () => { return Array.from(mockCache.keys()); },
          length: () => { return mockCache.size; }
        }
      });   
      manager.set('key0', 'test'); // 4 characters ;)
      manager.set('key1', 'value small enough to fit the storage limiation---'); // 50 charcaters --> data will fit the storage limitation
      manager.set('key2', 'value too big to fit the storage limitation ------------------------------------'); // 80 characters --> data will exceed the storage limitation
      expect(mockCache.size).toBe(4); // only the metadata data and data for key0 and key1 (and not key2 because the data extends the storage limitation)
      expect(manager.has('key0')).toBeTruthy();
      expect(manager.has('key1')).toBeTruthy();
      expect(manager.has('key2')).toBeFalsy();
      manager.remove('key0');
      expect(mockCache.size).toBe(2);
      manager.clear();
      expect(mockCache.size).toBe(0);
    });
  });

  describe('Test SalesforceManager implementation', () => {

    const manager = new SalesforceManager(JsForceMock, '');
    const logger = new LoggerMock();

    it('checks if the salesforce manager implementation runs soqlQuery correctly with a good query', async () => {
      const results = await manager.soqlQuery([{ string: 'SELECT Id FROM TableWith10Records #Wait900ms#' }]);
      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      expect(results[0].length).toBe(10);
    });

    it('checks if the salesforce manager implementation runs soqlQuery correctly with a wrong query', async () => {
      try {
        const results = await manager.soqlQuery([{ string: 'SELECT Id FROM TableWith1000Records #Wait900ms# #RaiseError#' }]);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBe('Error raised by the query');
      }
    });

    it('checks if the salesforce manager implementation runs soqlQuery correctly with multiple good queries', async () => {
      const results = await manager.soqlQuery([
        { string: 'SELECT Id FROM TableWith10Records' },
        { string: 'SELECT Id FROM TableWith100Records #Wait500ms#' },
        { string: 'SELECT Id FROM TableWith1000Records #Wait900ms#' }
      ]);
      expect(results).toBeDefined();
      expect(results.length).toBe(3);
      expect(results[0].length).toBe(10);
      expect(results[1].length).toBe(100);
      expect(results[2].length).toBe(1000);
    });

    it('checks if the salesforce manager implementation runs soqlQuery correctly with multiple good queries and one wrong query', async () => {
      try {
        const results = await manager.soqlQuery([
          { string: 'SELECT Id FROM TableWith10Records #Wait500ms#' },
          { string: 'SELECT Id FROM TableWith100Records #Wait900ms#  #RaiseError#' },
          { string: 'SELECT Id FROM TableWith1000Records #Wait900ms#' }
        ]);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBe('Error raised by the query');
      }
    });

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