import { API } from '../../src/api/orgcheck-api';
import { StorageSetupMock_DoingNothing } from '../utils/orgcheck-api-storage-mock.utility';
import { CompressorMock_IdemPotent } from '../utils/orgcheck-api-compressor-mock.utility';
import { jsforce } from "../utils/orgcheck-api-jsforce-mock.utility";

describe('tests.api.API', () => {

  describe('Test API', () => {
    // @ts-ignore    
    globalThis.jsforce = jsforce;

    it('should be instantiable and usable', async () => {
      let hadError = false;
      let err;
      try {
        const api = new API({ 
          logSettings: {
            isConsoleFallback: () => { return false; },
            log: () => {},
            ended: () => {},
            failed: (... argv) => { console.error('-_-_-_-_-_--_-_-_-_-_--_-_-_-_-_--_-_-_-_-_--_-_-_-_-_-', argv); }
          },
          salesforce: { 
            authenticationOptions: {
              accessToken: 'TESTING-BUNDLE'
            } 
          },
          storage: { 
            localImpl: new StorageSetupMock_DoingNothing(), 
            compression: { 
              useFflate: false, 
              mockImpl: new CompressorMock_IdemPotent()
            }}
        });
        expect(api).not.toBeNull();
        await api.getActiveUsers();
        api.getAllScoreRulesAsDataMatrix();
        await api.getApexClasses();
        await api.getApexTests();
        await api.getApexTriggers();
        await api.getApexUncompiled();
        await api.getApplicationPermissionsPerParent();
        api.getCacheInformation();
        await api.getChatterGroups();
        await api.getCustomFields();
        await api.getCustomLabels();
        await api.getCustomTabs();
        await api.getDocuments();
        await api.getEmailTemplates();
        await api.getFieldPermissionsPerParent();
        await api.getFlows();
        await api.getGlobalView();
        await api.getHardcodedURLsView();
        await api.getHomePageComponents();
        await api.getKnowledgeArticles();
        await api.getLightningAuraComponents();
        await api.getLightningPages();
        await api.getLightningWebComponents();
        //await api.getObject('Account');
        await api.getObjectPermissionsPerParent();
        await api.getObjectTypes();
        //await api.getOrganizationInformation();
        //await api.getPackages();
        await api.getPageLayouts();
        await api.getPermissionSetLicenses();
        await api.getPermissionSets();
        await api.getProcessBuilders();
        await api.getProfilePasswordPolicies();
        await api.getProfileRestrictions();
        await api.getProfiles();
        await api.getPublicGroups();
        await api.getQueues();
        await api.getRecordTypes();
        await api.getRoles();
        await api.getRolesTree();
        await api.getValidationRules();
        await api.getVisualForceComponents();
        await api.getVisualForcePages();
        await api.getWeblinks();
        await api.getWorkflows();
      } catch(error) {
        hadError = true;
        err = error;
        console.error(error);
      }
      expect(hadError).toBe(false);
      expect(err).not.toBeDefined();
    });
  });
});