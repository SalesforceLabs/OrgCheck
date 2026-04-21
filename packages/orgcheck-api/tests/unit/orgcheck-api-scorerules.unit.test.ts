import { SecretSauce } from 'src/api/core/orgcheck-api-secretsauce';
import { ScoreRule } from 'src/api/core/orgcheck-api-data-scorerule';
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
});