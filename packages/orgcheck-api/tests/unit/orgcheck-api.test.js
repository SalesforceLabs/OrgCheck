import { API } from 'src/api/orgcheck-api-impl';
import jsforce from 'tests/utils/orgcheck-api-jsforce-mock.utility';
import fflate from 'tests/utils/orgcheck-api-fflate-mock.utility';
import { StorageSetupMock_BasedOnMap } from 'tests/utils/orgcheck-api-storage-mock.utility'

const createAPIforTests = () => {
  return new API({ 
    logSettings: {
      isConsoleFallback: () => { return false; },
      log: () => {},
      ended: () => {},
      failed: (... argv) => { console.error('-_-_-_-_-_--_-_-_-_-_--_-_-_-_-_--_-_-_-_-_--_-_-_-_-_-', argv); }
    },
    salesforce: { 
      authenticationOptions: {
        accessToken: 'UNIT_TESTING'
      } 
    },
    storage: new StorageSetupMock_BasedOnMap()
  });
}

describe('tests.api.API', () => {

  describe('Test API', () => {
    globalThis.jsforce = jsforce;
    globalThis.fflate = fflate;

    it('should be instantiable and usable', async () => {
      let hadError = false;
      let err;
      try {
        const api = createAPIforTests();
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

    it('should set the terms to auto-accepted because org is not a production', async () => {
      const api = createAPIforTests();

      // mocking a connection to a non-production org
      api.getOrganizationInformation = jest.fn(async function () {
        return Promise.resolve({ isProduction: false });
      });

      // For non produciton org terms should be auto-approved
      expect(await api.checkUsageTerms()).toBeTruthy();

      // We don't really care but this should be logically false
      expect(api.wereUsageTermsAcceptedManually()).toBeFalsy();
    });

    it('should set the terms to not accepted because org is a production', async () => {
      const api = createAPIforTests();

      // mocking a connection to a production org
      api.getOrganizationInformation = jest.fn(async function () {
        return Promise.resolve({ isProduction: true });
      });

      // For produciton org terms should NOT be auto-approved
      expect(await api.checkUsageTerms()).toBeFalsy();

      // We did not manually approved yet the terms, so should be false
      expect(api.wereUsageTermsAcceptedManually()).toBeFalsy(); 

      // We then accept the terms explicitely
      api.acceptUsageTermsManually();

      // This time it should be true
      expect(api.wereUsageTermsAcceptedManually()).toBeTruthy(); 

      // Finally checking back the terms, should be true
      expect(await api.checkUsageTerms()).toBeTruthy();

    });
  });
});