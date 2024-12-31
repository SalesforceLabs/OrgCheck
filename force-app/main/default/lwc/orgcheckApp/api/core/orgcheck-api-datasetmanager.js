import { OrgCheckValidationRule } from './orgcheck-api-datafactory';
import { OrgCheckDatasetRunInformation } from './orgcheck-api-dataset-runinformation';

/**
 * @description Dataset manager interface
 */
export class OrgCheckDatasetManagerIntf {

    /**
     * @description Run the given list of datasets and return them as a result
     * @param {Array<string | OrgCheckDatasetRunInformation>} datasets 
     * @returns {Promise<Map>}
     * @public
     * @async
     */
    async run(datasets) { throw new TypeError(`You need to implement the method "run()"`); }

    /**
     * @description Clean the given list of datasets from cache (if present)
     * @param {Array<string | OrgCheckDatasetRunInformation>} datasets 
     * @public
     */
    clean(datasets) { throw new TypeError(`You need to implement the method "clean()"`); }

    /**
     * @description Get the validation rule given its id
     * @param {number} id
     * @returns {OrgCheckValidationRule}
     * @public
     */
    getValidationRule(id) { throw new TypeError(`You need to implement the method "clean()"`); }
 }