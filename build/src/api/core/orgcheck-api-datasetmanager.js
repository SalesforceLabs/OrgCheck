import { ScoreRule } from './orgcheck-api-datafactory';
import { DatasetRunInformation } from './orgcheck-api-dataset-runinformation';

/**
 * @description Dataset manager interface
 */
export class DatasetManagerIntf {

    /**
     * @description Run the given list of datasets and return them as a result
     * @param {Array<string | DatasetRunInformation>} datasets 
     * @returns {Promise<Map>}
     * @public
     * @async
     */
    async run(datasets) { throw new TypeError(`You need to implement the method "run()"`); }

    /**
     * @description Clean the given list of datasets from cache (if present)
     * @param {Array<string | DatasetRunInformation>} datasets 
     * @public
     */
    clean(datasets) { throw new TypeError(`You need to implement the method "clean()"`); }
}