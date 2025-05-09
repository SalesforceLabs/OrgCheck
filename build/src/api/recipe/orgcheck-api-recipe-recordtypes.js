import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processing';
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
            DatasetAliases.RECORDTYPE,
            DatasetAliases.OBJECTTYPES, 
            DatasetAliases.OBJECTS
         ];
    }
    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @param {string} objecttype Name of the type (if all use '*')
     * @param {string} object API name of the object (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace, objecttype, object) {

        // Get data
        const /** @type {Map<string, SFDC_RecordType>} */ recordTypes = data.get(DatasetAliases.RECORDTYPES);
        const /** @type {Map<string, SFDC_ObjectType>} */ types = data.get(DatasetAliases.OBJECTTYPES);
        const /** @type {Map<string, SFDC_Object>} */ objects = data.get(DatasetAliases.OBJECTS);

        // Checking data
        if (!recordTypes) throw new Error(`RecipeRecordTypes: Data from dataset alias 'RECORDTYPES' was undefined.`);
        if (!types) throw new Error(`RecipeRecordTypes: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`RecipeRecordTypes: Data from dataset alias 'OBJECTS' was undefined.`);
        

        // Augment and filter data
        const array = [];
        await Processor.forEach(recordTypes, (recordType) => {
            // Augment data
            const objectRef = objects.get(recordType.objectId);
            if (objectRef && !objectRef.typeRef) {
                objectRef.typeRef = types.get(objectRef.typeId);
            }
            recordType.objectRef = objectRef;
            // Filter data
            if ((namespace === '*' || recordType.package === namespace) &&
                (objecttype === '*' || recordType.objectRef?.typeRef?.id === objecttype) &&
                (object === '*' || recordType.objectRef?.apiname === object)) {
                array.push(recordType);
            }
        });

        // Return data
        return array;
    }
}