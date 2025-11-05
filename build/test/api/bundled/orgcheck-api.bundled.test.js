import { API } from '../../../dist/orgcheck/orgcheck-api';

class JsForceConnectionMock {
  metadata;
  constructor() {
    this.metadata = new JsForceMetadataMock();
  }
  async describe(objectname) { return { name: objectname }};
  async describeGlobal() { return { sobjects: [] }; }
  async query() { return { done: true, size: 0, records: [] }; }
  async search() { return { done: true, size: 0, records: [] }; }
  async request() { return {}; }
  get tooling() { return this; }
}

class JsForceMetadataMock {
  async list() { return []; }
  async read() { return []; }
}

const JsForceMock = {
  Connection: JsForceConnectionMock
}

const localStorageMock = new Map();

const StorageMock = {
  setItem: (key, value) => localStorageMock.set(key, value),
  getItem: (key) => localStorageMock.get(key),
  removeItem: (key) => localStorageMock.delete(key),
  keys: () => Array.from(localStorageMock.keys()),
  length: () => localStorageMock.size
}

const EncoderMock = {
  encode: (t) => { return t; },
  decode: (t) => { return t; }
}

const CompressionMock = {
  zlibSync: (t) => { return t; },
  unzlibSync: (t) => { return t; }
}

/** @type {BasicLoggerIntf} */
const LoggerMock = {
  isConsoleFallback: () => false,
  log: () => { },
  ended: () => { },
  failed: (... argv) => { console.error(argv); },
}

describe('tests.api.bundled.API', () => {
  describe('Test API once it has been bundled', () => {

    const api = new API('ACCESS_TOKEN', JsForceMock, StorageMock, EncoderMock, CompressionMock, LoggerMock);
    
    it('should be instantiable', () => {
      expect(api).not.toBeNull();
    });

    it('should be ok to call all getters', async () => {
      expect(await api.getActiveUsers()).toBeDefined();
      expect(await api.getAllScoreRulesAsDataMatrix()).toBeDefined();
      expect(await api.getApexClasses()).toBeDefined();
      expect(await api.getApexTests()).toBeDefined();
      expect(await api.getApexTriggers()).toBeDefined();
      expect(await api.getApexUncompiled()).toBeDefined();
      expect(await api.getApplicationPermissionsPerParent()).toBeDefined();
      expect(await api.getCacheInformation()).toBeDefined();
      expect(await api.getChatterGroups()).toBeDefined();
      expect(await api.getCustomFields()).toBeDefined();
      expect(await api.getCustomLabels()).toBeDefined();
      expect(await api.getCustomTabs()).toBeDefined();
      expect(await api.getDocuments()).toBeDefined();
      expect(await api.getEmailTemplates()).toBeDefined();
      expect(await api.getFieldPermissionsPerParent()).toBeDefined();
      expect(await api.getFlows()).toBeDefined();
      expect(await api.getGlobalView()).toBeDefined();
      expect(await api.getHardcodedURLsView()).toBeDefined();
      expect(await api.getHomePageComponents()).toBeDefined();
      expect(await api.getKnowledgeArticles()).toBeDefined();
      expect(await api.getLightningAuraComponents()).toBeDefined();
      expect(await api.getLightningPages()).toBeDefined();
      expect(await api.getLightningWebComponents()).toBeDefined();
      //expect(await api.getObject('Account')).toBeDefined();
      expect(await api.getObjectPermissionsPerParent()).toBeDefined();
      expect(await api.getObjectTypes()).toBeDefined();
      //expect(await api.getOrganizationInformation()).toBeDefined();
      //expect(await api.getPackages()).toBeDefined();
      expect(await api.getPageLayouts()).toBeDefined();
      expect(await api.getPermissionSetLicenses()).toBeDefined();
      expect(await api.getPermissionSets()).toBeDefined();
      expect(await api.getProcessBuilders()).toBeDefined();
      expect(await api.getProfilePasswordPolicies()).toBeDefined();
      expect(await api.getProfileRestrictions()).toBeDefined();
      expect(await api.getProfiles()).toBeDefined();
      expect(await api.getPublicGroups()).toBeDefined();
      expect(await api.getQueues()).toBeDefined();
      expect(await api.getRecordTypes()).toBeDefined();
      expect(await api.getRoles()).toBeDefined();
      //expect(await api.getRolesTree()).toBeDefined();
      expect(await api.getValidationRules()).toBeDefined();
      expect(await api.getVisualForceComponents()).toBeDefined();
      expect(await api.getVisualForcePages()).toBeDefined();
      expect(await api.getWeblinks()).toBeDefined();
      expect(await api.getWorkflows()).toBeDefined();
    });
  });
});