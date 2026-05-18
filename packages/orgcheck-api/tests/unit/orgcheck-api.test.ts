import { describe, it, expect } from '@jest/globals';
import jsforce from 'tests/utils/orgcheck-api-jsforce-mock.utility';
import fflate from 'tests/utils/orgcheck-api-fflate-mock.utility';
import { createAPIforUnitTests } from 'tests/utils/orgcheck-api-for-unit-tests-utility';
import { RecipeAliases } from 'src/api/core/recipe/orgcheck-api-recipes-aliases';

describe('tests.api.API', () => {

  describe('Test API', () => {
    globalThis.jsforce = jsforce;
    globalThis.fflate = fflate;

    it('should be instantiable and usable in production', async () => {
      let hadError = false;
      let err: Error | undefined = undefined;
      try {
        const api = createAPIforUnitTests(true);
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

    it('should set the terms to auto-accepted because org is not a production', async () => {
      const api = createAPIforUnitTests(false);

      // For non produciton org terms should be auto-approved
      expect(await api.checkUsageTerms()).toBeTruthy();

      // We don't really care but this should be logically false
      expect(api.wereUsageTermsAcceptedManually()).toBeFalsy();

      // Trying to call a getter and it should not fail
      let hadError = false;
      let err: Error | undefined = undefined;
      try {
        await api.getPackages();
      } catch(error) {
        hadError = true;
        err = error;
        console.error(error);
      }
      expect(hadError).toBe(false);
      expect(err).not.toBeDefined();
    });

    it('should set the terms to not accepted because org is a production', async () => {
      const api = createAPIforUnitTests(true);

      // For produciton org terms should NOT be auto-approved
      expect(await api.checkUsageTerms()).toBeFalsy();

      // We did not manually approved yet the terms, so should be false
      expect(api.wereUsageTermsAcceptedManually()).toBeFalsy(); 

      // Trying to call a getter at this point and it SHOULD fail
      let hadError = false;
      let err: Error | undefined = undefined;
      try {
        await api.getPackages();
      } catch(error) {
        hadError = true;
        err = error;
        // console.error(error);
      }
      expect(hadError).toBe(true);
      expect(err).toBeDefined();
      expect(err?.message).toBe('You must accept the usage terms before using Org Check in this environment.');

      // We then accept the terms explicitely
      api.acceptUsageTermsManually();

      // This time it should be true
      expect(api.wereUsageTermsAcceptedManually()).toBeTruthy(); 

      // Finally checking back the terms, should be true
      expect(await api.checkUsageTerms()).toBeTruthy();

      // Trying to call a getter and it should not fail
      hadError = false;
      err = undefined;
      try {
        await api.getPackages();
      } catch(error) {
        hadError = true;
        err = error;
        console.error(error);
      }
      expect(hadError).toBe(false);
      expect(err).not.toBeDefined();
    });
  });

  describe('Test API with different daily API limits', () => {
    globalThis.jsforce = jsforce;
    globalThis.fflate = fflate;

    it('should be instantiable and usable with a green daily API limit', async () => {
      const api = createAPIforUnitTests(false, 20);
      expect(api).toBeDefined();
      // measure number 1 before calling anything
      const measure1 = api.dailyApiRequestLimitInformation;
      expect(measure1).toBeDefined();
      expect(measure1.currentUsageRatio).toBe(0);
      expect(measure1.currentUsageRatio < measure1.yellowThresholdPercentage).toBeTruthy();
      expect(measure1.currentUsageRatio < measure1.redThresholdPercentage).toBeTruthy();
      expect(measure1.isGreenZone).toBeTruthy();
      expect(measure1.isYellowZone).toBeFalsy();
      expect(measure1.isRedZone).toBeFalsy();
      // Use the api hoping that Daily API Limit will not be reached (all green)
      await api.getOrganizationInformation();
      // measure number 2 before calling anything
      const measure2 = api.dailyApiRequestLimitInformation;
      expect(measure2).toBeDefined();
      expect(measure2.currentUsageRatio).toBe(0.20);
      expect(measure2.currentUsageRatio < measure2.yellowThresholdPercentage).toBeTruthy();
      expect(measure2.currentUsageRatio < measure2.redThresholdPercentage).toBeTruthy();
      expect(measure2.isGreenZone).toBeTruthy();
      expect(measure2.isYellowZone).toBeFalsy();
      expect(measure2.isRedZone).toBeFalsy();
    });

    it('should NOT be instantiable and usable with a red daily API limit (should throw an error)', async () => {
      const api = createAPIforUnitTests(false, 95);
      expect(api).toBeDefined();
      // measure number 1 before calling anything
      const measure1 = api.dailyApiRequestLimitInformation;
      expect(measure1).toBeDefined();
      expect(measure1.currentUsageRatio).toBe(0);
      expect(measure1.currentUsageRatio < measure1.yellowThresholdPercentage).toBeTruthy();
      expect(measure1.currentUsageRatio < measure1.redThresholdPercentage).toBeTruthy();
      expect(measure1.isGreenZone).toBeTruthy();
      expect(measure1.isYellowZone).toBeFalsy();
      expect(measure1.isRedZone).toBeFalsy();
      // Use the api hoping that Daily API Limit will be reached (all red)
      try {
        await api.getOrganizationInformation();
      } catch(error) {
        expect(error).toBeDefined();
        expect(error.message).toBe('[Code: WATCH_DOG] The Daily API Request limit has been reached. We cannot continue.');
        expect(error.contextInformation).toBeDefined();
      }
    });
  });
});