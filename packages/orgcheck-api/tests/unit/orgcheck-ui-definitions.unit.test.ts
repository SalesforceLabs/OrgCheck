import { ApexTriggersInObjectTableDefinitions, ApexTriggersTableDefinitions } from "src/ui/table/definitions/orgcheck-ui-tabledef-apextriggers";
import { CustomFieldsTableDefinitions, CustomFieldsInObjectTableDefinitions } from "src/ui/table/definitions/orgcheck-ui-tabledef-customfields";
import { FlexiPagesTableDefinitions, FlexiPagesInObjectTableDefinitions } from "src/ui/table/definitions/orgcheck-ui-tabledef-flexipages";
import { RecordTypesTableDefinitions, RecordTypesInObjectTableDefinitions } from "src/ui/table/definitions/orgcheck-ui-tabledef-recordtypes";
import { ValidationRulesTableDefinitions, ValidationRulesInObjectTableDefinitions } from "src/ui/table/definitions/orgcheck-ui-tabledef-validationrules";
import { WebLinksTableDefinitions, WebLinksInObjectTableDefinitions } from "src/ui/table/definitions/orgcheck-ui-tabledef-weblinks";

describe('tests.ui.unit.TableDefinitions', () => {

    describe('Test the table definitions with or without object informations', () => {

        // Table definitions of "things" in a context of an object should not include object columns
        // For example, ApexTrigger list in the object description of Account should not include that the triggers are for Account, we know it.
        // But the same list in the global listing of apex trggers should include object information

        // So the "InObject" table definitions should not have the object columns because already in an object context
        // therefore we consider the "InObject" table definitions as "WithoutObjectInfo" :) 

        it('checks if apex trigger table definitions are correctly setting the columns with or without object information', () => {
            const countColumnsWithObjectInfo = new ApexTriggersTableDefinitions().columns.length;
            const countColumnsWithoutObjectInfo = new ApexTriggersInObjectTableDefinitions().columns.length;
            expect(countColumnsWithoutObjectInfo).toBeDefined();
            expect(countColumnsWithObjectInfo).toBeDefined();
            expect(countColumnsWithoutObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithoutObjectInfo).toBeLessThan(countColumnsWithObjectInfo);
        });
        
        it('checks if custom fields table definitions are correctly setting the columns with or without object information', () => {
            
            const countColumnsWithObjectInfo = new CustomFieldsTableDefinitions().columns.length;
            const countColumnsWithoutObjectInfo = new CustomFieldsInObjectTableDefinitions().columns.length;
            expect(countColumnsWithoutObjectInfo).toBeDefined();
            expect(countColumnsWithObjectInfo).toBeDefined();
            expect(countColumnsWithoutObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithoutObjectInfo).toBeLessThan(countColumnsWithObjectInfo);
        });

        it('checks if flexi pages table definitions are correctly setting the columns with or without object information', () => {
            const countColumnsWithObjectInfo = new FlexiPagesTableDefinitions().columns.length;
            const countColumnsWithoutObjectInfo = new FlexiPagesInObjectTableDefinitions().columns.length;
            expect(countColumnsWithoutObjectInfo).toBeDefined();
            expect(countColumnsWithObjectInfo).toBeDefined();
            expect(countColumnsWithoutObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithoutObjectInfo).toBeLessThan(countColumnsWithObjectInfo);
        });

        it('checks if record types table definitions are correctly setting the columns with or without object information', () => {
            const countColumnsWithObjectInfo = new RecordTypesTableDefinitions().columns.length;
            const countColumnsWithoutObjectInfo = new RecordTypesInObjectTableDefinitions().columns.length;
            expect(countColumnsWithoutObjectInfo).toBeDefined();
            expect(countColumnsWithObjectInfo).toBeDefined();
            expect(countColumnsWithoutObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithoutObjectInfo).toBeLessThan(countColumnsWithObjectInfo);
        });

        it('checks if validation rules table definitions are correctly setting the columns with or without object information', () => {
            const countColumnsWithObjectInfo = new ValidationRulesTableDefinitions().columns.length;
            const countColumnsWithoutObjectInfo = new ValidationRulesInObjectTableDefinitions().columns.length;
            expect(countColumnsWithoutObjectInfo).toBeDefined();
            expect(countColumnsWithObjectInfo).toBeDefined();
            expect(countColumnsWithoutObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithoutObjectInfo).toBeLessThan(countColumnsWithObjectInfo);
        });

        it('checks if web links table definitions are correctly setting the columns with or without object information', () => {
            const countColumnsWithObjectInfo = new WebLinksTableDefinitions().columns.length;
            const countColumnsWithoutObjectInfo = new WebLinksInObjectTableDefinitions().columns.length;
            expect(countColumnsWithoutObjectInfo).toBeDefined();
            expect(countColumnsWithObjectInfo).toBeDefined();
            expect(countColumnsWithoutObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithoutObjectInfo).toBeLessThan(countColumnsWithObjectInfo);
        });
    });
});