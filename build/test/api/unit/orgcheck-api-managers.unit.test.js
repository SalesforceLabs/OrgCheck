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

  queryMore(url, options) {
    const matchRemaining = url.match(/#Remaining=(?<remaining>[0-9]*)#/);
    const remaining = Number.parseInt(matchRemaining.groups.remaining);
    const matchFields = url.match(/#Fields=(?<fields>.*)#/);
    const fields = matchFields.groups.fields.split(',').map((f) => f.trim());
    const records = [];
    for (let i = 0; i < remaining; i++) {
      const record = {};
      fields.forEach(field => record[field] = `${field}-${i}`);
      records.push(record);
    }
    return {
      records: records,
      done: true
    }
  }

  /** @type {number} */
  nbRecordsSoFarForCustomQueryMore = 0;

  async query(string, options) { 

    const matchWait = string.match(/#Wait=(?<wait>[0-9]*)#/);
    if (matchWait) {
      await new Promise((resolve) => setTimeout(resolve, matchWait.groups.wait));
    }
    const matchError = string.match(/#Error=(?<message>.*)#/);
    if (matchError) {
      throw new Error(matchError.groups.message);
    }
    const matchNbRecords = string.match(/#Records=(?<nb>[0-9]*)#/);
    const nbTotalRecords = Number.parseInt(matchNbRecords.groups.nb);
    const fields = string.match(/SELECT (?<fields>.*) FROM /).groups.fields.split(',').map((f) => f.trim());

    const matchNoSupportQueryMore = string.match(/#NoSupportQueryMore,max=(?<nb>[0-9]*)#/); 
    if (matchNoSupportQueryMore) {
      const matchLimit = string.match(/ LIMIT (?<size>[0-9]*)/);
      const maxBeforeError = Number.parseInt(matchNoSupportQueryMore.groups.max);
      const maxNbRecords = Number.parseInt(matchLimit.groups.size);
      if (maxNbRecords > maxBeforeError) {
        throw new Error('This entity does not support query more');
      }
      let realSize;
      if (this.nbRecordsSoFarForCustomQueryMore + maxNbRecords > nbTotalRecords) {
        realSize = nbTotalRecords - this.nbRecordsSoFarForCustomQueryMore;
        this.nbRecordsSoFarForCustomQueryMore = 0;
      } else {
        realSize = maxNbRecords;
        this.nbRecordsSoFarForCustomQueryMore += maxNbRecords;
      }
      const records = [];
      for (let i = 0; i < realSize; i++) {
        const record = {};
        fields.forEach(field => record[field] = `${field}-${i}`);
        records.push(record);
      }
      return {
        records: records,
        done: true
      }
    }

    const matchSupportQueryMore = string.match(/#SupportQueryMore,batchSize=(?<size>[0-9]*)#/);
    const batchSize = Number.parseInt(matchSupportQueryMore ? matchSupportQueryMore.groups.size : 2000);
    const currentBatchSize = nbTotalRecords > batchSize ? batchSize : nbTotalRecords;
    const remaining = nbTotalRecords - currentBatchSize;
    const records = [];
    for (let i = 0; i < currentBatchSize; i++) {
      const record = {};
      fields.forEach(field => record[field] = `${field}-${i}`);
      records.push(record);
    }
    return {
      records: records,
      done: remaining <= 0,
      nextRecordsUrl: `/next #Remaining=${remaining}# #SupportQueryMore,batchSize=${batchSize}# #Fields=${fields.join(',')}#`
    }
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
      const results = await manager.soqlQuery([{ string: 'SELECT Id FROM Account #Records=10# #Wait900ms#' }]);
      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      expect(results[0].length).toBe(10);
    });

    it('checks if the salesforce manager implementation runs soqlQuery correctly with a wrong query', async () => {
      try {
        const results = await manager.soqlQuery([{ string: 'SELECT Id FROM Account #Records=100# #Wait900ms# #RaiseError#' }]);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBe('Error raised by the query');
      }
    });

    it('checks if the salesforce manager implementation runs soqlQuery correctly with multiple good queries', async () => {
      const results = await manager.soqlQuery([
        { string: 'SELECT Id FROM Account #Records=10#' },
        { string: 'SELECT Id FROM Account #Records=100# #Wait500ms#' },
        { string: 'SELECT Id FROM Account #Records=1000# #Wait900ms#' }
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
          { string: 'SELECT Id FROM Account #Records=10# #Wait500ms#' },
          { string: 'SELECT Id FROM Account #Records=100# #Wait900ms#  #RaiseError#' },
          { string: 'SELECT Id FROM Account #Records=1000# #Wait900ms#' }
        ]);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBe('Error raised by the query');
      }
    });

    it('checks if the salesforce manager implementation runs soqlQuery correctly with queryMore standard retrieval', async () => {
      const results = await manager.soqlQuery([{ 
        string: 'SELECT Id, Name FROM Account #Records=10012# #SupportQueryMore,size=200#'
      }]);
      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      expect(results[0].length).toBe(10012);
    });

    it('checks if the salesforce manager implementation runs soqlQuery correctly with queryMore custom retrieval without aggregate', async () => {
      const results = await manager.soqlQuery([{ 
        string: 'SELECT Id, Name FROM Account #Records=10012# #NoSupportQueryMore,max=2000#',
        queryMoreField: 'Id'
      }]);
      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      expect(results[0].length).toBe(10012);
    });

    it('checks if the salesforce manager implementation runs soqlQuery correctly with queryMore custom retrieval withv aggregate', async () => {
      const results = await manager.soqlQuery([{ 
        string: 'SELECT Name FROM Account #Records=10012# #NoSupportQueryMore,max=2000# GROUP BY Name',
        queryMoreField: 'CreatedDate'
      }]);
      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      expect(results[0].length).toBe(10012);
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