import { DatasetRunInformation } from './orgcheck-api-dataset-runinformation';

/**
 * @description Dataset manager interface
 */
export class DatasetManagerIntf {

    /**
     * @description Run the given list of datasets and return them as a result
     * @param {Array<string | DatasetRunInformation>} datasets - The list of datasets to run
     * @returns {Promise<Map<string, any>>} The result
     * @public
     * @async
     */
    async run(datasets) { throw new Error(`Method run(datasets=${datasets}) not implemented yet.`); }

    /**
     * @description Clean the given list of datasets from cache (if present)
     * @param {Array<string | DatasetRunInformation>} datasets - The list of datasets to clean
     * @public
     */
    clean(datasets) { throw new Error(`Method clean(datasets=${datasets}) not implemented yet.`); }
}