import { describe, it, expect } from "@jest/globals";
import { DataFactoryIntf } from "../../src/api/core/orgcheck-api-datafactory";
import { DataFactory } from "../../src/api/core/orgcheck-api-datafactory-impl";
import { DataAliases } from "../../src/api/core/orgcheck-api-data-aliases";

describe('orgcheck-api-datafactory', () => {
    it('checks if datafactory constructor is working fine', () => {
        const factory: DataFactoryIntf = new DataFactory();
        expect(factory).toBeDefined();
    });
    describe('checks if datafactoryinstance is working fine for data with score and no dependencies', () => {
        // export interface SFDC_Browser extends DataWithScore { .... }
        const factory = new DataFactory().getInstance(DataAliases.SFDC_Browser);
        it('should pass with data with score and no dependencies', () => {
            const data = factory.createWithScore({
                properties: {
                    prop1: "test",
                    prop2: 98
                }
            });
            const properties = Object.keys(data);
            expect(properties).toContain('score');
            expect(properties).toContain('badFields')
            expect(properties).toContain('badReasonIds');
        });
        it('should fail with data with score and no dependencies', () => {
            let err: any = undefined;
            try {
                factory.createWithScore({
                    properties: {},
                    dependencyData: { records: [], errors: []},
                    dependencyIdFields: []
                });
            } catch (error) {
                err = error;
            }
            expect(err).toBeDefined();
            expect(err.message).toBeDefined();
            expect(err.message.endsWith('is defined as without dependencies, but some dependencies were provided.')).toBeTruthy();
        });
    });
    describe('checks if datafactoryinstance is working fine for data with score and dependencies', () => {
        // export interface SFDC_ApexClass extends DataWithScoreAndDependencies { ... }
        const factory = new DataFactory().getInstance(DataAliases.SFDC_ApexClass);
        it('should pass with data with score and with dependencies', () => {
            const data = factory.createWithScore({ 
                properties: {},
                dependencyData: { records: [], errors: []},
                dependencyIdFields: []
            });
            const properties = Object.keys(data);
            expect(properties).toContain('score');
            expect(properties).toContain('badFields')
            expect(properties).toContain('badReasonIds');
            expect(properties).toContain('dependencies');
        });
        it('should fail with data with score and with dependencies', () => {
            let err: any = undefined;
            try {
                factory.createWithScore({ properties: {} });
            } catch (error) {
                err = error;
            }
            expect(err).toBeDefined();
            expect(err.message).toBeDefined();
            expect(err.message.endsWith('is defined as with dependencies, but no dependencies were provided.')).toBeTruthy();
        });
    });
    describe('checks if datafactoryinstance is working fine for data without score', () => {
        // export interface SFDC_ApexTestMethodResult extends DataWithoutScore { ... }
        const factory = new DataFactory().getInstance(DataAliases.SFDC_ApexTestMethodResult);
        it('should pass with data without score (and not dependencies)', () => {
            const data = factory.createWithScore({ properties: {} });
            const properties = Object.keys(data);
            expect(properties).not.toContain('score');
            expect(properties).not.toContain('badFields')
            expect(properties).not.toContain('badReasonIds');
        });
        it('should fail with data without score (and not dependencies)', () => {
            let err: any = undefined;
            try {
                factory.createWithScore({
                    properties: {},
                    dependencyData: { records: [], errors: []},
                    dependencyIdFields: []
                });
            } catch (error) {
                err = error;
            }
            expect(err).toBeDefined();
            expect(err.message).toBeDefined();
            expect(err.message.endsWith('is defined as without dependencies, but some dependencies were provided.')).toBeTruthy();
        });
    })
})