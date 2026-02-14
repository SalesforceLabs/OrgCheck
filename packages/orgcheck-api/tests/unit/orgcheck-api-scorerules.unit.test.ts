import { describe, it, expect } from "@jest/globals";
import { API } from "../../src/api/orgcheck-api";
import { SecretSauce } from "../../src/api/core/orgcheck-api-secretsauce";
import { DataMatrix } from "../../src/api/core/orgcheck-api-data-matrix";
import { ScoreRule } from "../../src/api/core/orgcheck-api-datafactory";
import { JsForceMock_SoqlQuery } from "../utils/orgcheck-api-jsforce-mock.utility";
import { StorageMock_BasedOnMap } from "../utils/orgcheck-api-storage-mock.utility";
import { CompressorMock_IdemPotent } from "../utils/orgcheck-api-compressor-mock.utility";
import { LoggerMock_DoingNothing } from "../utils/orgcheck-api-logger-mock.utility";

describe('orgcheck-api-scorerules', () => {

    it('Check if getAllScoreRulesAsDataMatrix() is returning something good', () => {
        const numberOfRules = SecretSauce.AllScoreRules?.length;
        const disctinctItems = new Set();
        SecretSauce.AllScoreRules.forEach((/** @type {ScoreRule} */ rule: ScoreRule) => rule.applicable.forEach((item) => disctinctItems.add(item)));
        const numberOfItemsAccrossAllRules = SecretSauce.AllScoreRules.reduce((acc, /** @type {ScoreRule} */ rule: ScoreRule) => { return acc + rule.applicable?.length; }, 0)

        const api = new API({ 
            logSettings: new LoggerMock_DoingNothing(),
            salesforce: { connection: { useJsForce: false, mockImpl: JsForceMock_SoqlQuery }, authentication: { } },
            storage: { localImpl: new StorageMock_BasedOnMap(), compression: { useFflate: false, mockImpl: new CompressorMock_IdemPotent() }}
        });

        /** @type {DataMatrix} */
        const matrix: DataMatrix = api.getAllScoreRulesAsDataMatrix();
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