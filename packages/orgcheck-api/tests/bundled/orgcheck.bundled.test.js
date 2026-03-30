import jsforce from 'tests/utils/orgcheck-api-jsforce-mock.utility';
import fflate from 'tests/utils/orgcheck-api-fflate-mock.utility';
import { createAPIforBundeledTests } from 'tests/utils/orgcheck-api-for-bundled-tests-utility';
import { RecipeAliases } from 'src/api/core/orgcheck-api-recipes-aliases';

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
          RecipeAliases.INTERNAL_ACTIVE_USERS, RecipeAliases.SCORE_RULES, RecipeAliases.APEX_CLASSES, 
          RecipeAliases.APEX_TESTS, RecipeAliases.APEX_TRIGGERS, RecipeAliases.APEX_UNCOMPILED, 
          RecipeAliases.APP_PERMISSIONS, RecipeAliases.COLLABORATION_GROUPS, RecipeAliases.CUSTOM_FIELDS, 
          RecipeAliases.CUSTOM_LABELS, RecipeAliases.CUSTOM_TABS, RecipeAliases.DOCUMENTS, 
          RecipeAliases.EMAIL_TEMPLATES, RecipeAliases.FIELD_PERMISSIONS, RecipeAliases.FLOWS, 
          RecipeAliases.GLOBAL_VIEW, RecipeAliases.HARDCODED_URLS_VIEW, RecipeAliases.HOME_PAGE_COMPONENTS, 
          RecipeAliases.KNOWLEDGE_ARTICLES, RecipeAliases.LIGHTNING_AURA_COMPONENTS, RecipeAliases.LIGHTNING_PAGES, 
          RecipeAliases.LIGHTNING_WEB_COMPONENTS, /* RecipeAliases.OBJECT, */ RecipeAliases.OBJECT_PERMISSIONS, 
          RecipeAliases.OBJECTS, RecipeAliases.PAGE_LAYOUTS, RecipeAliases.PERMISSION_SET_LICENSES, 
          RecipeAliases.PERMISSION_SETS, RecipeAliases.PROCESS_BUILDERS, RecipeAliases.PROFILE_PWD_POLICIES, 
          RecipeAliases.PROFILE_RESTRICTIONS, RecipeAliases.PROFILES, RecipeAliases.PUBLIC_GROUPS, 
          RecipeAliases.QUEUES, RecipeAliases.RECORD_TYPES, RecipeAliases.USER_ROLES, RecipeAliases.VALIDATION_RULES, 
          RecipeAliases.VISUALFORCE_COMPONENTS, RecipeAliases.VISUALFORCE_PAGES, RecipeAliases.WEBLINKS, 
          RecipeAliases.WORKFLOWS
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