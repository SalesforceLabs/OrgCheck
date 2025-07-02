import { API } from '../../../dist/orgcheck/orgcheck-api';

class JsForceConnectionMock {
  metadata;
  constructor() {
    this.metadata = new JsForceMetadataMock();
  }
  async describe(objectname) { return { name: objectname }};
  async describeGlobal() { return { sobjects: [] }; }
  async query(string, options) { return { done: true, size: 0, records: [] }; }
  async search(string, options) { return { done: true, size: 0, records: [] }; }
  async request(options) { return {}; }
  get tooling() { return this; }
}

export class JsForceMetadataMock {
  async list(requests) { return []; }
  async read(type, members) { return []; }
}

const JsForceMock = {
  Connection: JsForceConnectionMock
}

const StorageMock = {
  setItem: (k, v) => undefined,
  getItem: (k) => undefined,
  removeItem: (k) => undefined,
  key: (i) => undefined,
  keys: ()  => [],
  length: () => 0
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
  log: (section, message) => { },
  ended: (section, message) => { },
  failed: (section, error) => { }
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