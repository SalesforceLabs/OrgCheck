import { DatasetRunInformation } from './orgcheck-api-dataset-runinformation';

/**
 * @description Dataset manager interface
 */
export interface DatasetManagerIntf {

    /**
     * @description Run the given list of datasets and return them as a result
     * @param {Array<string | DatasetRunInformation>} datasets - The list of datasets to run
     * @returns {Promise<Map<string, any>>} The result
     * @public
     * @async
     */
    run(datasets: Array<string | DatasetRunInformation>): Promise<Map<string, any>>;

    /**
     * @description Clean the given list of datasets from cache (if present)
     * @param {Array<string | DatasetRunInformation>} datasets - The list of datasets to clean
     * @public
     */
    clean(datasets: Array<string | DatasetRunInformation>): void;
}