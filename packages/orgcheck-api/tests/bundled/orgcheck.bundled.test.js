import jsforce from 'tests/utils/orgcheck-api-jsforce-mock.utility';
import fflate from 'tests/utils/orgcheck-api-fflate-mock.utility';
import { createAPIforBundeledTests } from 'tests/utils/orgcheck-api-for-bundled-tests-utility';
import { Recipes } from 'dist/orgcheck';

describe('tests.orgcheck.bundled', () => {

  describe('Test API', () => {
    globalThis.jsforce = jsforce;
    globalThis.fflate = fflate;

    it('should be instantiable and usable', async () => {
      let hadError = false;
      let err;
      try {
        const api = createAPIforBundeledTests();
        expect(api).not.toBeNull();

        // by default the jest jsforce is a production org
        expect(await api.checkUsageTerms()).toBeFalsy(); // so terms should be not initially accepted
        api.acceptUsageTermsManually(); // accept them manually
        expect(await api.checkUsageTerms()).toBeTruthy(); // now it should be good
        
        // manual getters
        api.listCacheItems();
        await api.getObjectTypes();
        await api.getObjects();
        await api.getOrganizationInformation();
        await api.getPackages();
        
        // generic getters
        await Promise.all([
          Recipes.INTERNAL_ACTIVE_USERS, Recipes.SCORE_RULES, Recipes.APEX_CLASSES, 
          Recipes.APEX_TESTS, Recipes.APEX_TRIGGERS, Recipes.APEX_UNCOMPILED, 
          Recipes.APP_PERMISSIONS, Recipes.COLLABORATION_GROUPS, Recipes.CUSTOM_FIELDS, 
          Recipes.CUSTOM_LABELS, Recipes.CUSTOM_TABS, Recipes.DOCUMENTS, 
          Recipes.EMAIL_TEMPLATES, Recipes.FIELD_PERMISSIONS, Recipes.FLOWS, 
          Recipes.GLOBAL_VIEW, Recipes.HARDCODED_URLS_VIEW, Recipes.HOME_PAGE_COMPONENTS, 
          Recipes.KNOWLEDGE_ARTICLES, Recipes.LIGHTNING_AURA_COMPONENTS, Recipes.LIGHTNING_PAGES, 
          Recipes.LIGHTNING_WEB_COMPONENTS, /* Recipes.OBJECT, */ Recipes.OBJECT_PERMISSIONS, 
          Recipes.OBJECTS, Recipes.PAGE_LAYOUTS, Recipes.PERMISSION_SET_LICENSES, 
          Recipes.PERMISSION_SETS, Recipes.PROCESS_BUILDERS, Recipes.PROFILE_PWD_POLICIES, 
          Recipes.PROFILE_RESTRICTIONS, Recipes.PROFILES, Recipes.PUBLIC_GROUPS, 
          Recipes.QUEUES, Recipes.RECORD_TYPES, Recipes.USER_ROLES, Recipes.VALIDATION_RULES, 
          Recipes.VISUALFORCE_COMPONENTS, Recipes.VISUALFORCE_PAGES, Recipes.WEBLINKS, 
          Recipes.WORKFLOWS
        ].map(async (alias, index) => {
          try {
            const mixture = await api.prepareData(alias, '', '', 'Account');
            expect(mixture).toBeDefined();
            const table = await api.serveData(alias, mixture);
            expect(table).toBeDefined();
          } catch (err) {
            console.error(index, err);
          }
        }));
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