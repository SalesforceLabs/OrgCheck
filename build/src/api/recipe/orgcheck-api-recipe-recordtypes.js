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

export class RecipeRecordType extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [ 
            DatasetAliases.RECORDTYPES,
            DatasetAliases.OBJECTTYPES, 
            DatasetAliases.OBJECTS
         ];
    }
    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {Map | undefined} [parameters] List of optional argument to pass
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, parameters) {

        // Get data and parameters
        const /** @type {Map<string, SFDC_RecordType>} */ recordTypes = data.get(DatasetAliases.RECORDTYPES);
        const /** @type {Map<string, SFDC_ObjectType>} */ types = data.get(DatasetAliases.OBJECTTYPES);
        const /** @type {Map<string, SFDC_Object>} */ objects = data.get(DatasetAliases.OBJECTS);
        const namespace = parameters?.get('namespace') ?? '*';
        const objecttype = parameters?.get('objecttype') ?? '*';
        const object = parameters?.get('object') ?? '*';

        // Checking data
        if (!recordTypes) throw new Error(`RecipeRecordTypes: Data from dataset alias 'RECORDTYPES' was undefined.`);
        if (!types) throw new Error(`RecipeRecordTypes: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipeRecordTypes: Data from dataset alias 'OBJECTS' was undefined.`);
        

        // Augment and filter data
        const array = [];
        await Processor.forEach(recordTypes, (recordType) => {
            // Augment data
            const objectRef = objects.get(recordType.objectId);
            logger.log(`ObjectId: ${recordType.objectId}`);
            if (objectRef && !objectRef.typeRef) {
                objectRef.typeRef = types.get(objectRef.typeId);
            }
            recordType.objectRef = objectRef;
            // Filter data
            if ((namespace === '*' || recordType.package === namespace) &&
                (objecttype === '*' || recordType.objectRef?.typeRef?.id === objecttype) &&
                (object === '*' || recordType.objectRef?.apiname === object)) {
                array.push(recordType);
                logger.log(`Pushing a record type in the array: ${recordType}`);
            }
        });

        // Return data
        logger.log(`Array has ${array.length} items.`);
        return array;
    }
}