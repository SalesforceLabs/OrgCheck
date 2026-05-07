import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcRecordType }from 'src/api/data/orgcheck-api-data-recordtype';
import { SfdcObject }from 'src/api/data/orgcheck-api-data-object';
import { SfdcObjectType }from 'src/api/data/orgcheck-api-data-objecttype';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { RecordTypesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-recordtypes';

export class RecipeRecordType implements ServedRecipe<SfdcRecordType[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🏏 Record Types';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(): Array<string | DatasetRunInformation> {
        return [ 
            DatasetAliases.RECORDTYPES,
            DatasetAliases.OBJECTTYPES, 
            DatasetAliases.OBJECTS
         ];
    }

    /**
     * @description List the parameters that this mix depends on
     * @returns {string[]} List of parameters that this mix dependes on
     * @public
     */
    public mixDependencies(): string[] {
        return [OrgCheckGlobalParameter.PACKAGE_NAME, OrgCheckGlobalParameter.SOBJECT_TYPE_NAME, OrgCheckGlobalParameter.SOBJECT_NAME];
    }


    /**
     * @description mix the ingredients all together and return the result
     * @param {Map<string, any>} ingredients - Records or information grouped by their alias in a Map
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<SfdcRecordType[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, unknown>, logger: SimpleLoggerIntf, parameters: Map<string, string>): Promise<SfdcRecordType[]> {

        // Get data and parameters
        const recordTypes = ingredients.get(DatasetAliases.RECORDTYPES) as Map<string, SfdcRecordType>;
        const types = ingredients.get(DatasetAliases.OBJECTTYPES) as Map<string, SfdcObjectType>;
        const objects = ingredients.get(DatasetAliases.OBJECTS) as Map<string, SfdcObject>;
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);
        const objecttype = OrgCheckGlobalParameter.getSObjectTypeName(parameters);
        const object = OrgCheckGlobalParameter.getSObjectName(parameters);

        // Checking data
        if (!recordTypes) throw new Error(`RecipeRecordTypes: Data from dataset alias 'RECORDTYPES' was undefined.`);
        if (!types) throw new Error(`RecipeRecordTypes: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipeRecordTypes: Data from dataset alias 'OBJECTS' was undefined.`);
        

        // Augment and filter data
        
        const array: SfdcRecordType[] = [];
        await MediumProcessor.forEach(recordTypes, async (recordType: SfdcRecordType) => {
            // Augment data
            const objectRef = objects.get(recordType.objectId);
            if (objectRef) {
                if (objectRef.typeRef === undefined) {
                    const typeObjectRef = types.get(objectRef.typeId);
                    if (typeObjectRef) {
                        objectRef.typeRef = typeObjectRef;
                    }
                }
                recordType.objectRef = objectRef;
            }
            // Filter data
            if ((namespace === OrgCheckGlobalParameter.ALL_VALUES || recordType.package === namespace) &&
                (objecttype === OrgCheckGlobalParameter.ALL_VALUES || recordType.objectRef?.typeRef?.id === objecttype) &&
                (object === OrgCheckGlobalParameter.ALL_VALUES || recordType.objectRef?.apiname === object)) {
                array.push(recordType);
                logger.log(`Pushing a record type in the array: ${recordType}`);
            }
        });

        // Return data
        logger.log(`Array has ${array?.length} items.`);
        return array;
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcRecordType[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcRecordType[]): Promise<Table> {
        return TableFactory.create(this.title, new RecordTypesTableDefinition(), mixture);
    }

    /**
     * @description We put your plate in a doggy bag
     * @param {Table} plate - Plate which was on the table
     * @returns {Promise<ExportedTable>} Meal in a doggy bag, ready to take back home!
     * @async
     * @public
     */
    public async serveToGo(plate: Table): Promise<ExportedTable> {
        return TableFactory.export(plate);
    }
}