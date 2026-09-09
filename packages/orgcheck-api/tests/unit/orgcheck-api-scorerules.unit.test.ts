import { describe, it, expect } from '@jest/globals';
import { SecretSauce } from 'src/api/core/orgcheck-api-secretsauce';
import { ScoreRule } from 'src/api/core/orgcheck-api-data-scorerule';
import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import jsforce from 'tests/utils/orgcheck-api-jsforce-mock.utility';
import fflate from 'tests/utils/orgcheck-api-fflate-mock.utility';
import { createAPIforUnitTests } from 'tests/utils/orgcheck-api-for-unit-tests-utility';
import { RecipeAliases } from 'src/api/core/recipe/orgcheck-api-recipes-aliases';
// import { Table } from 'src/api/core/orgcheck-api-recipe';

describe('orgcheck-api-scorerules', () => {
    globalThis.jsforce = jsforce;
    globalThis.fflate = fflate;

    it('Check if getAllScoreRulesAsDataMatrix() is returning something good', async () => {
        // const numberOfRules = SecretSauce.AllScoreRules?.length;
        const disctinctItems = new Set();
        SecretSauce.AllScoreRules.forEach((rule: ScoreRule) => rule.applicable.forEach((item) => disctinctItems.add(item)));
        const api = createAPIforUnitTests(false);
        const mixture = await api.prepareData(RecipeAliases.SCORE_RULES, '', '', '');
        const table = await api.serveData(RecipeAliases.SCORE_RULES, mixture);
        expect(table).toBeDefined();
        /*expect(table.rows).toBeDefined();
        expect(table.rows.length).toBe(numberOfRules);*/
    })

    describe('Items from a locked installed package must never be flagged', () => {

        // These data types can contain items coming from a locked installed package, ie. items the 
        // customer can't modify. Their datasets set 'isEditable' to false for those, and every rule 
        // applicable to them must take that flag into account.
        const ALIASES_WITH_PACKAGED_ITEMS = [ 
            DataAliases.SfdcField, DataAliases.SfdcCustomLabel, DataAliases.SfdcCustomTab, 
            DataAliases.SfdcLightningPage, DataAliases.SfdcWebLink 
        ];

        // Two variants because rules 0 and 1 need 'hadError' to be false whereas rule 3 needs it to be 
        // true, so no single row can trip all the rules at once.
        const badRows = (isEditable: boolean | undefined) => [ false, true ].map((hadError) => { return {
            isEditable: isEditable,
            isCustom: true,
            description: '',
            hardCodedURLs: [ 'https://www.salesforce.com' ],
            hardCodedIDs: [ '005000000000000AAA' ],
            isAttachmentRelatedListIncluded: true,
            formula: `IF(TRUE, 'javascript:void(0)', '')`,
            dependencies: { hadError: hadError, referenced: [] }
        }});

        const rulesForPackagedItems = SecretSauce.AllScoreRules.filter(
            (rule: ScoreRule) => rule.applicable.some((alias) => ALIASES_WITH_PACKAGED_ITEMS.includes(alias))
        );

        it('checks that we found the rules to verify', () => {
            expect(rulesForPackagedItems.length).toBeGreaterThan(0);
        });

        rulesForPackagedItems.forEach((rule: ScoreRule) => {

            it(`checks that rule #${rule.id} (${rule.description}) does not flag a non editable item`, () => {
                // Making sure the rows would trip that rule if the item were editable, otherwise the 
                // test below would pass for the wrong reason
                expect(badRows(true).some((row) => rule.formula(row) === true)).toBeTruthy();
                // And now the actual check
                badRows(false).forEach((row) => expect(rule.formula(row)).toBe(false));
            });
        });

        it('checks that an item with no isEditable information at all is still flagged', () => {
            // Most data types never set the flag (reports, dashboards, email templates...). The rules use 
            // 'isEditable !== false' precisely so that these keep being flagged as before.
            rulesForPackagedItems.forEach((rule: ScoreRule) => {
                expect(badRows(undefined).some((row) => rule.formula(row) === true)).toBeTruthy();
            });
        });
    });
});