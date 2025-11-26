import { SalesforceManagerIntf } from "../../../src/api/core/orgcheck-api-salesforcemanager";
import { DatasetManagerIntf } from "../../../src/api/core/orgcheck-api-datasetmanager";
import { LoggerIntf } from "../../../src/api/core/orgcheck-api-logger";
import { DataCacheManagerIntf } from "../../../src/api/core/orgcheck-api-cachemanager";

export const ProfilePasswordPolicy = 'ProfilePasswordPolicy';
export const ProfilePasswordPolicy_Member1__Profile = 'profile1';
export const ProfilePasswordPolicy_Member2__Profile = 'profile2';

export class SalesforceManagerMock extends SalesforceManagerIntf {
  get apiVersion() { return 53; }
  caseSafeId(id) { return id; }
  setupUrl(/*id, type, parentId, parentType*/) { return null; }
  getObjectType(/*objectName, isCustomSetting*/) { return null; }
  get dailyApiRequestLimitInformation() { return null; }
  async soqlQuery(queries/*, logger*/) { return queries.map((/*e*/) => { return []; }); }
  async dependenciesQuery(/*ids, logger*/) { return { records: [], errors: [] }; }
  async readMetadata(/*metadatas, logger*/) { return new Map(); }
  async readMetadataAtScale(/*type, ids, byPasses, logger*/) { return []; }
  async describeGlobal(/*logger*/) { return null; }
  async describe(/*sobjectDevName, logger*/) { return {}; }
  async recordCount(/*sobjectDevName, logger*/) { return 0; }
}

export class JsForceMetadataMock {
  async list(requests) {
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
  async read(type/*, members*/) {
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


export class JsForceConnectionMock {
  
  metadata;
  
  constructor() {
    this.metadata = new JsForceMetadataMock();
  }

  queryMore(url/*, options*/) {
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

  async query(string/*, options*/) { 

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

  get tooling() { return this; }
}

export const JsForceMock = {
  Connection: JsForceConnectionMock
}

export class CacheManagerMock extends DataCacheManagerIntf {
    has(/*key*/) { return false; }
    get(/*key*/) { return ''; }
    set(/*key, value*/) { }
    details() { return []; }
    remove(/*key*/) { }
    clear() {};
}

export class LoggerMock extends LoggerIntf {
  log(/*sectionName, message*/) { }
  ended(/*sectionName, message*/) { }
  failed(/*sectionName, error*/) { }
  toSimpleLogger() { return { log: () => {}, debug: () => {} }; }
}

export class DatasetManagerMock extends DatasetManagerIntf {}
