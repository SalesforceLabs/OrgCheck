import { SecretSauce } from 'src/api/core/orgcheck-api-secretsauce';
import { DataMatrixIntf } from 'src/api/core/orgcheck-api-data-matrix';
import { ScoreRule } from 'src/api/core/orgcheck-api-datafactory';
import jsforce from 'tests/utils/orgcheck-api-jsforce-mock.utility';
import fflate from 'tests/utils/orgcheck-api-fflate-mock.utility';
import { createAPIforUnitTests } from 'tests/utils/orgcheck-api-for-unit-tests-utility';

describe('orgcheck-api-scorerules', () => {
    globalThis.jsforce = jsforce;
    globalThis.fflate = fflate;

    it('Check if getAllScoreRulesAsDataMatrix() is returning something good', () => {
        const numberOfRules = SecretSauce.AllScoreRules?.length;
        const disctinctItems = new Set();
        SecretSauce.AllScoreRules.forEach((/** @type {ScoreRule} */ rule: ScoreRule) => rule.applicable.forEach((item) => disctinctItems.add(item)));
        const numberOfItemsAccrossAllRules = SecretSauce.AllScoreRules.reduce((acc, /** @type {ScoreRule} */ rule: ScoreRule) => { return acc + rule.applicable?.length; }, 0)

        const api = createAPIforUnitTests();

        /** @type {DataMatrixIntf} */
        const matrix: DataMatrixIntf = api.getAllScoreRulesAsDataMatrix();
        expect(matrix).toBeDefined();
        const items = matrix.columnHeaders;
        expect(items).toBeDefined();
        expect(items?.length).toBe(disctinctItems.size);
        items.forEach((item) => expect(typeof item).toBe('string'));
        const rows = matrix.rows;
        expect(rows).toBeDefined();
        expect(rows?.length).toBe(numberOfRules);
        rows.forEach((row) => expect(typeof row).toBe('object')); 
        let countTrue = 0;
        rows.forEach((row) => {
            items.forEach((item) => {
                const value = row.data[item];
                expect(value === 'true' || value === undefined).toBeTruthy();
                if (value === 'true') {
                    countTrue++;
                }
            });
        }); 
        expect(countTrue).toBe(numberOfItemsAccrossAllRules);
    })
});