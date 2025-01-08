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
  async soqlQuery(queries, logger) { return queries.map((e) => { return { records: [] }; }); }
  async dependenciesQuery(ids, logger) { return { records: [], errors: [] }; }
  async readMetadata(metadatas, logger) { return metadatas.map(() => { return []; }); }
  async readMetadataAtScale(type, ids, byPasses, logger) { return []; }
  async describeGlobal(logger) { return null; }
  async describe(sobjectDevName, logger) { return {}; }
  async recordCount(sobjectDevName, logger) { return 0; }
}

class JsForceConnectionMock {}

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
      await manager.run([ OrgCheckDatasetAliases.APEXCLASSES ]);
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

    it('checks if the salesforce manager implementation runs correctly', async () => {
      const manager = new OrgCheckSalesforceManager(JsForceMock, '');      
    });
  });
});