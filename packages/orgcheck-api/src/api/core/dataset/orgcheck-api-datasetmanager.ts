import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';

/**
 * @description Dataset manager error class
 */
export class DatasetManagerError extends Error {

    constructor(public readonly dataset: string, message: string, public readonly cause?: Error) {
        super(message);
    }
}

/**
 * @description Dataset manager interface
 */
export interface DatasetManagerIntf {

    /**
     * @description Run the given list of datasets and return them as a result
     * @param {Array<string | DatasetRunInformation>} datasets - The list of datasets to run
     * @returns {Promise<Map<string, any>>} The result
     * @throws {DatasetManagerError}
     * @public
     * @async
     */
    run(datasets: Array<string | DatasetRunInformation>): Promise<Map<string, any>>;

    /**
     * @description Clean the given list of datasets from cache (if present)
     * @param {Array<string | DatasetRunInformation>} datasets - The list of datasets to clean
     * @throws {DatasetManagerError}
     * @public
     */
    clean(datasets: Array<string | DatasetRunInformation>): void;
}