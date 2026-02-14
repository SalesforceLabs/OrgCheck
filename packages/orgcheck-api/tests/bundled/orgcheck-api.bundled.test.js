import { API } from '../../dist/orgcheck-api';

describe('tests.api.bundled.API', () => {
  describe('Test API once it has been bundled', () => {

    it('should be instantiable and usable', async () => {
      let hadError = false;
      let err;
      try {
        const api = new API({ 
          logSettings: {
            isConsoleFallback: () => {},
            log: () => {},
            ended: () => {},
            failed: () => {}
          },
          salesforce: { connection: { useJsForce: false, mockImpl: { Connection: class M {} } }, authentication: { } },
          storage: { localImpl: {
            getItem: () => {},
            setItem: () => {},
            keys: () => {}
          }, compression: { useFflate: false, mockImpl: {} }}
        });
        expect(api).not.toBeNull();
        await api.getActiveUsers();
        api.getAllScoreRulesAsDataMatrix();
        await api.getApexClasses();
        await api.getApexTests();
        await api.getApexTriggers();
        await api.getApexUncompiled();
        await api.getApplicationPermissionsPerParent();
        await api.getCacheInformation();
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
        await api.getObject('Account');
        await api.getObjectPermissionsPerParent();
        await api.getObjectTypes();
        await api.getOrganizationInformation();
        await api.getPackages();
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
        console.error(err)
      }
      expect(hadError).toBe(false);
      expect(err).not.toBeDefined();
    });

    it('should be ok to call all getters', async () => {

    });
  });
});