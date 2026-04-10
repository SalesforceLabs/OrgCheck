import { ApexTriggersInObjectTableDefinition, ApexTriggersTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apextriggers';
import { CustomFieldsTableDefinition, CustomFieldsInObjectTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-customfields';
import { FlexiPagesTableDefinition, FlexiPagesInObjectTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-flexipages';
import { RecordTypesTableDefinition, RecordTypesInObjectTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-recordtypes';
import { ValidationRulesTableDefinition, ValidationRulesInObjectTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-validationrules';
import { WebLinksTableDefinition, WebLinksInObjectTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-weblinks';

describe('tests.ui.unit.TableDefinitions', () => {

    describe('Test the table definitions with or without object informations', () => {

        // Table definitions of "things" in a context of an object should not include object columns
        // For example, ApexTrigger list in the object description of Account should not include that the triggers are for Account, we know it.
        // But the same list in the global listing of apex trggers should include object information

        // So the "InObject" table definitions should not have the object columns because already in an object context
        // therefore we consider the "InObject" table definitions as "WithoutObjectInfo" :) 

        it('checks if apex trigger table definitions are correctly setting the columns with or without object information', () => {
            const countColumnsWithObjectInfo = new ApexTriggersTableDefinition().columns.length;
            const countColumnsWithoutObjectInfo = new ApexTriggersInObjectTableDefinition().columns.length;
            expect(countColumnsWithoutObjectInfo).toBeDefined();
            expect(countColumnsWithObjectInfo).toBeDefined();
            expect(countColumnsWithoutObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithoutObjectInfo).toBeLessThan(countColumnsWithObjectInfo);
        });
        
        it('checks if custom fields table definitions are correctly setting the columns with or without object information', () => {
            
            const countColumnsWithObjectInfo = new CustomFieldsTableDefinition().columns.length;
            const countColumnsWithoutObjectInfo = new CustomFieldsInObjectTableDefinition().columns.length;
            expect(countColumnsWithoutObjectInfo).toBeDefined();
            expect(countColumnsWithObjectInfo).toBeDefined();
            expect(countColumnsWithoutObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithoutObjectInfo).toBeLessThan(countColumnsWithObjectInfo);
        });

        it('checks if flexi pages table definitions are correctly setting the columns with or without object information', () => {
            const countColumnsWithObjectInfo = new FlexiPagesTableDefinition().columns.length;
            const countColumnsWithoutObjectInfo = new FlexiPagesInObjectTableDefinition().columns.length;
            expect(countColumnsWithoutObjectInfo).toBeDefined();
            expect(countColumnsWithObjectInfo).toBeDefined();
            expect(countColumnsWithoutObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithoutObjectInfo).toBeLessThan(countColumnsWithObjectInfo);
        });

        it('checks if record types table definitions are correctly setting the columns with or without object information', () => {
            const countColumnsWithObjectInfo = new RecordTypesTableDefinition().columns.length;
            const countColumnsWithoutObjectInfo = new RecordTypesInObjectTableDefinition().columns.length;
            expect(countColumnsWithoutObjectInfo).toBeDefined();
            expect(countColumnsWithObjectInfo).toBeDefined();
            expect(countColumnsWithoutObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithoutObjectInfo).toBeLessThan(countColumnsWithObjectInfo);
        });

        it('checks if validation rules table definitions are correctly setting the columns with or without object information', () => {
            const countColumnsWithObjectInfo = new ValidationRulesTableDefinition().columns.length;
            const countColumnsWithoutObjectInfo = new ValidationRulesInObjectTableDefinition().columns.length;
            expect(countColumnsWithoutObjectInfo).toBeDefined();
            expect(countColumnsWithObjectInfo).toBeDefined();
            expect(countColumnsWithoutObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithoutObjectInfo).toBeLessThan(countColumnsWithObjectInfo);
        });

        it('checks if web links table definitions are correctly setting the columns with or without object information', () => {
            const countColumnsWithObjectInfo = new WebLinksTableDefinition().columns.length;
            const countColumnsWithoutObjectInfo = new WebLinksInObjectTableDefinition().columns.length;
            expect(countColumnsWithoutObjectInfo).toBeDefined();
            expect(countColumnsWithObjectInfo).toBeDefined();
            expect(countColumnsWithoutObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithObjectInfo).toBeGreaterThan(0);
            expect(countColumnsWithoutObjectInfo).toBeLessThan(countColumnsWithObjectInfo);
        });
    });
});