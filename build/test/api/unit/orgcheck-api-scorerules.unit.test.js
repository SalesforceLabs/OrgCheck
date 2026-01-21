import { API } from "../../../src/api/orgcheck-api";
import { SecretSauce } from "../../../src/api/core/orgcheck-api-secretsauce";

class JsForceConnectionMock {}

const JsForceMock = {
    Connection: JsForceConnectionMock
}

const StorageMock = {};

const CompressorMock = {};

const LoggerMock = {}

describe('orgcheck-api-scorerules', () => {

    it('Check if getAllScoreRulesAsDataMatrix() is returning something good', () => {
        const numberOfRules = SecretSauce.AllScoreRules.length;
        const disctinctItems = new Set();
        SecretSauce.AllScoreRules.forEach((/** @type {ScoreRule} */ rule) => rule.applicable.forEach((item) => disctinctItems.add(item)));
        const numberOfItemsAccrossAllRules = SecretSauce.AllScoreRules.reduce((acc, /** @type {ScoreRule} */ rule) => { return acc + rule.applicable.length; }, 0)

        const api = new API({ 
            salesforce: { connection: { useJsForce: false, mockImpl: JsForceMock }},
            storage: { localImpl: StorageMock, compression: { useFflate: false, mockImpl: CompressorMock }},
            logSettings: LoggerMock
        });



        /** @type {DataMatrix} */
        const matrix = api.getAllScoreRulesAsDataMatrix();
        expect(matrix).toBeDefined();
        const items = matrix.columnHeaders;
        expect(items).toBeDefined();
        expect(items.length).toBe(disctinctItems.size);
        items.forEach((item) => expect(typeof item).toBe('string'));
        const rows = matrix.rows;
        expect(rows).toBeDefined();
        expect(rows.length).toBe(numberOfRules);
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