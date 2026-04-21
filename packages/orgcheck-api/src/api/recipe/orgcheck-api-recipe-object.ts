import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcApexTrigger }from 'src/api/data/orgcheck-api-data-apextrigger';
import { SfdcField }from 'src/api/data/orgcheck-api-data-field';
import { SfdcObject }from 'src/api/data/orgcheck-api-data-object';
import { SfdcObjectType }from 'src/api/data/orgcheck-api-data-objecttype';
import { SfdcLightningPage }from 'src/api/data/orgcheck-api-data-lightningpage';
import { SfdcWorkflow }from 'src/api/data/orgcheck-api-data-workflow';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { StandardFieldsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-standardfields';
import { CustomFieldsInObjectTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-customfields';
import { WebLinksInObjectTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-weblinks';
import { ApexTriggersInObjectTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apextriggers';
import { FieldSetsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-fieldsets';
import { PageLayoutsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-pagelayouts';
import { FlexiPagesInObjectTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-flexipages';
import { LimitsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-limits';
import { ValidationRulesInObjectTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-validationrules';
import { RecordTypesInObjectTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-recordtypes';
import { RelationshipsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-relationships';
import { WorkflowsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-workflows';

export interface SfdcObjectAsTable {
    apiname: string;
    package: string;
    label: string;
    labelPlural: string;
    description : string;
    keyPrefix: string;
    recordCount: number;
    isCustom: boolean;
    isFeedEnabled: boolean;
    isMostRecentEnabled: boolean;
    isSearchable: boolean;
    internalSharingModel: string;
    externalSharingModel: string;
    type: string;
    standardFields: Table,
    customFields: Table,
    apexTriggers: Table,
    fieldSets: Table,
    layouts: Table,
    flexiPages: Table,
    limits: Table,
    validationRules: Table,
    webLinks: Table,
    recordTypes: Table,
    relationships: Table,
    workflowRules: Table
}

export class RecipeObject implements ServedRecipe<SfdcObject, SfdcObjectAsTable> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🎳 Object Documentation';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf, parameters: Map<string, any>): Array<string | DatasetRunInformation> {
        return [ 
            new DatasetRunInformation(
                DatasetAliases.OBJECT,
                `${DatasetAliases.OBJECT}_${OrgCheckGlobalParameter.getSObjectName(parameters)}`,
                parameters // should include 'object'
            ),
            DatasetAliases.OBJECTTYPES,
            DatasetAliases.APEXTRIGGERS,
            DatasetAliases.WORKFLOWS,
            DatasetAliases.LIGHTNINGPAGES,
            new DatasetRunInformation(
                DatasetAliases.CUSTOMFIELDS,
                `${DatasetAliases.CUSTOMFIELDS}_${OrgCheckGlobalParameter.getSObjectName(parameters)}`,
                parameters // should include 'object'
            ),
        ];
    }

    /**
     * @description List the parameters that this mix dependes on
     * @returns {string[]} List of parameters that this mix dependes on
     * @public
     */
    public mixDependencies(): string[] {
        return [OrgCheckGlobalParameter.SOBJECT_NAME];
    }

    /**
     * @description mix the ingredients all together and return the result
     * @param {Map<string, any>} ingredients - Records or information grouped by their alias in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<SfdcObject>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, _logger: SimpleLoggerIntf): Promise<SfdcObject> {

        // Get data
        const types: Map<string, SfdcObjectType> = ingredients.get(DatasetAliases.OBJECTTYPES);
        const object: SfdcObject = ingredients.get(DatasetAliases.OBJECT);
        const apexTriggers: Map<string, SfdcApexTrigger> = ingredients.get(DatasetAliases.APEXTRIGGERS);
        const workflowRules: Map<string, SfdcWorkflow> = ingredients.get(DatasetAliases.WORKFLOWS);
        const pages: Map<string, SfdcLightningPage> = ingredients.get(DatasetAliases.LIGHTNINGPAGES);
        const customFields: Map<string, SfdcField> = ingredients.get(DatasetAliases.CUSTOMFIELDS);

        // Checking data
        if (!types) throw new Error(`RecipeObject: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!object) throw new Error(`RecipeObject: Data from dataset alias 'OBJECT' was undefined.`);
        if (!apexTriggers) throw new Error(`RecipeObject: Data from dataset alias 'APEXTRIGGERS' was undefined.`);
        if (!workflowRules) throw new Error(`RecipeObject: Data from dataset alias 'WORKFLOWS' was undefined.`);
        if (!pages) throw new Error(`RecipeObject: Data from dataset alias 'LIGHTNINGPAGES' was undefined.`);
        if (!customFields) throw new Error(`RecipeObject: Data from dataset alias 'CUSTOMFIELDS' was undefined.`);

        // Augment data
        const typeRef = types.get(object.typeId);
        if (typeRef) {
            object.typeRef = typeRef;
        }
        object.flexiPages = [];
        const result = await Promise.all([
            MediumProcessor.map( // returns apexTriggerRefs
                object.apexTriggerIds,
                (id: string) => { 
                    const apexTrigger = apexTriggers.get(id);
                    if (apexTrigger) {
                        apexTrigger.objectRef = object;
                    } else {
                        throw new Error(`Apex Trigger ${id} was not found for object ${object.name}`)
                    }
                    return apexTrigger;
                },
                (id: string) => apexTriggers.has(id)
            ),
            MediumProcessor.map( // returns workflowRuleRefs
                object.workflowRuleIds,
                (id: string) => workflowRules.get(id),
                (id: string) => workflowRules.has(id)
            ),
            MediumProcessor.forEach(pages, async (page: SfdcLightningPage) => {
                if (page.objectId === object.id) {
                    object.flexiPages.push(page);
                }
            }),
            MediumProcessor.map( // returns customFieldRefs
                object.customFieldIds,
                (id: string) => { 
                    const customField = customFields.get(id);
                    if (customField) {
                        customField.objectRef = object;
                    } else {
                        throw new Error(`Custom Field ${id} was not found for object ${object.name}`)
                    }
                    return customField;
                },
                (id: string) => customFields.has(id)
            )
        ]);
        object.apexTriggerRefs = result[0];
        object.workflowRuleRefs = result[1]?.filter(n => n !== undefined);
        object.customFieldRefs = result[3];

        // Return data
        return object;
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcObject} mixture - Mixed data to be served to a table
     * @returns {Promise<SfdcObjectAsTable>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcObject): Promise<SfdcObjectAsTable> {
        return {
            apiname: mixture.apiname,
            package: mixture.package,
            label: mixture.label,
            labelPlural: mixture.labelPlural,
            description : mixture.description,
            type: mixture.typeRef?.label ?? '',
            keyPrefix: mixture.keyPrefix,
            recordCount: mixture.recordCount,
            isCustom: mixture.isCustom,
            isFeedEnabled: mixture.isFeedEnabled,
            isMostRecentEnabled: mixture.isMostRecentEnabled,
            isSearchable: mixture.isSearchable,
            internalSharingModel: mixture.internalSharingModel,
            externalSharingModel: mixture.externalSharingModel,
            standardFields: TableFactory.create('Standard Fields', new StandardFieldsTableDefinition(), mixture.standardFields),
            customFields: TableFactory.create('Custom Fields', new CustomFieldsInObjectTableDefinition(), mixture.customFieldRefs),
            apexTriggers: TableFactory.create('Apex Triggers', new ApexTriggersInObjectTableDefinition(), mixture.apexTriggerRefs),
            fieldSets: TableFactory.create('Field Sets', new FieldSetsTableDefinition(), mixture.fieldSets),
            layouts: TableFactory.create('Page Layouts', new PageLayoutsTableDefinition(), mixture.layouts),
            flexiPages: TableFactory.create('Lightning Pages', new FlexiPagesInObjectTableDefinition(), mixture.flexiPages),
            limits: TableFactory.create('Limits', new LimitsTableDefinition(), mixture.limits),
            validationRules: TableFactory.create('Validation Rules', new ValidationRulesInObjectTableDefinition(), mixture.validationRules),
            webLinks: TableFactory.create('Web Links', new WebLinksInObjectTableDefinition(), mixture.webLinks),
            recordTypes: TableFactory.create('Record Types', new RecordTypesInObjectTableDefinition(), mixture.recordTypes),
            relationships: TableFactory.create('Relationships', new RelationshipsTableDefinition(), mixture.relationships),
            workflowRules: TableFactory.create('Workflows', new WorkflowsTableDefinition(), mixture.workflowRuleRefs)
        };
    }


    /**
     * @description We put your plate in a doggy bag
     * @param {SfdcObjectAsTable} plate - Plate which was on the table
     * @returns {Promise<ExportedTable[]>} Meal in a doggy bag, ready to take back home!
     * @async
     * @public
     */
    public async serveToGo(plate: SfdcObjectAsTable): Promise<ExportedTable[]> {
        return [
            { 
                label: 'General information',
                columns: [ 'Label', 'Value' ],
                rows: [
                    [ 'API Name', `${plate.apiname ?? ''}` ],
                    [ 'Package', `${plate.package ?? ''}` ],
                    [ 'Singular Label', `${plate.label ?? ''}` ],
                    [ 'Plural Label', `${plate.labelPlural ?? ''}` ],
                    [ 'Description', `${plate.description ?? ''}` ],
                    [ 'Key Prefix', `${plate.keyPrefix ?? ''}` ],
                    [ 'Record Count (including deleted ones)', `${plate.recordCount}` ],
                    [ 'Is Custom?', `${plate.isCustom?'true':'false'}` ],
                    [ 'Feed Enable?', `${plate.isFeedEnabled?'true':'false'}` ],
                    [ 'Most Recent Enabled?', `${plate.isMostRecentEnabled?'true':'false'}` ],
                    [ 'Global Search Enabled?', `${plate.isSearchable?'true':'false'}` ],
                    [ 'Internal Sharing', `${plate.internalSharingModel ?? ''}` ],
                    [ 'External Sharing', `${plate.externalSharingModel ?? ''}` ]
                ]
            },
            TableFactory.export(plate.standardFields),
            TableFactory.export(plate.customFields),
            TableFactory.export(plate.apexTriggers),
            TableFactory.export(plate.fieldSets),
            TableFactory.export(plate.layouts),
            TableFactory.export(plate.flexiPages),
            TableFactory.export(plate.limits),
            TableFactory.export(plate.validationRules),
            TableFactory.export(plate.webLinks),
            TableFactory.export(plate.recordTypes),
            TableFactory.export(plate.relationships),
            TableFactory.export(plate.workflowRules)
        ];
    }
}