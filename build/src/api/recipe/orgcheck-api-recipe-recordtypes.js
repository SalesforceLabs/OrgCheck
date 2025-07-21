import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SFDC_RecordType } from '../data/orgcheck-api-data-recordtype';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_ObjectType } from '../data/orgcheck-api-data-objecttype';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipeRecordType extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger) {
        return [ 
            DatasetAliases.RECORDTYPES,
            DatasetAliases.OBJECTTYPES, 
            DatasetAliases.OBJECTS
         ];
    }
    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data, logger, parameters) {

        // Get data and parameters
        const /** @type {Map<string, SFDC_RecordType>} */ recordTypes = data.get(DatasetAliases.RECORDTYPES);
        const /** @type {Map<string, SFDC_ObjectType>} */ types = data.get(DatasetAliases.OBJECTTYPES);
        const /** @type {Map<string, SFDC_Object>} */ objects = data.get(DatasetAliases.OBJECTS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);
        const objecttype = OrgCheckGlobalParameter.getSObjectTypeName(parameters);
        const object = OrgCheckGlobalParameter.getSObjectName(parameters);

        // Checking data
        if (!recordTypes) throw new Error(`RecipeRecordTypes: Data from dataset alias 'RECORDTYPES' was undefined.`);
        if (!types) throw new Error(`RecipeRecordTypes: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipeRecordTypes: Data from dataset alias 'OBJECTS' was undefined.`);
        

        // Augment and filter data
        /** @type {Array<SFDC_RecordType>} */ 
        const array = [];
        await Processor.forEach(recordTypes, (/** @type {SFDC_RecordType} */ recordType) => {
            // Augment data
            const objectRef = objects.get(recordType.objectId);
            logger.log(`ObjectId: ${recordType.objectId}`);
            if (objectRef && !objectRef.typeRef) {
                objectRef.typeRef = types.get(objectRef.typeId);
            }
            recordType.objectRef = objectRef;
            // Filter data
            if ((namespace === OrgCheckGlobalParameter.ALL_VALUES || recordType.package === namespace) &&
                (objecttype === OrgCheckGlobalParameter.ALL_VALUES || recordType.objectRef?.typeRef?.id === objecttype) &&
                (object === OrgCheckGlobalParameter.ALL_VALUES || recordType.objectRef?.apiname === object)) {
                array.push(recordType);
                logger.log(`Pushing a record type in the array: ${recordType}`);
            }
        });

        // Return data
        logger.log(`Array has ${array.length} items.`);
        return array;
    }
}