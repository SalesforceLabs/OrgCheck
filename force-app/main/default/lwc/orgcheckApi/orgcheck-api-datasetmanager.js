import { OrgCheckMap } from './orgcheck-api-type-map';
import { OrgCheckLogger } from './orgcheck-api-logger';
import { OrgCheckDataset } from './orgcheck-api-dataset';

export class DatasetCacheInfo {
    name;
    length;
    created;
    modified;
}

export class DatasetRunInformation {
    alias;
    parameters;
    cacheKey;
}

export class OrgCheckDatasetManager {
    
    #datasets;
    #cache;
    #logger;
    #sfdcManager;

    /**
     * Dataset Manager constructor
     * 
     * @param {SFDCConnectionManager} sfdcManager 
     * @param {OrgCheckLogger} logger
     */
    constructor(sfdcManager, logger) {
        if (logger instanceof OrgCheckLogger === false) {
            throw new Error('The given logger is not an instance of OrgCheckLogger.');
        } 
        this.#logger = logger;
        this.#datasets = new OrgCheckMap();
        this.#cache = new OrgCheckMap();
        this.#sfdcManager = sfdcManager;
    }

    /**
     * Add a dataset in the manager with a given alias
     * 
     * @param {string} alias
     * @param {OrgCheckDataset} dataset 
     */
    register(alias, dataset) {
        if (dataset instanceof OrgCheckDataset === false) {
            throw new Error('The given dataset is not an instance of Dataset.');
        } 
        this.#datasets.set(alias, dataset);
    }

    /**
     * Run the given list of datasets and return them as a result
     * 
     * @param {Array<DatasetRunInformation>} datasets 
     * @return OrgCheckMap<Any>
     */
    async run(datasets) {
        if (datasets instanceof Array === false) {
            throw new Error('The given datasets is not an instance of Array.');
        }
        const results = new OrgCheckMap();
        const promises = [];
        datasets.forEach((dataset) => {
            const alias      = (typeof dataset === 'string' ? dataset : dataset.alias);
            const cacheKey   = (typeof dataset === 'string' ? dataset : dataset.cacheKey);
            const paramaters = (typeof dataset === 'string' ? undefined : dataset.parameters);
            promises.push(new Promise((resolve, reject) => {
                this.#logger.sectionContinues(`DatasetManager:${cacheKey}:Cache`, 'Checking the cache...');
                // Check cache if any
                if (this.#cache.hasKey(cacheKey) === true) {
                    // Set the results from cache
                    this.#logger.sectionEnded(`DatasetManager:${cacheKey}:Cache`, 'There was data in cache!');
                    results.set(alias, this.#cache.get(cacheKey));
                    // Resolve
                    resolve();
                    return;
                }
                this.#logger.sectionContinues(`DatasetManager:${cacheKey}:Cache`, 'There was no data in cache.');

                // Calling the retriever
                this.#logger.sectionContinues(`DatasetManager:${alias}:Retriever`, 'Calling the retriever...');
                this.#datasets.get(alias)(
                    // sfdc manager
                    this.#sfdcManager,
                    // success
                    (data) => {
                        // Cache the data
                        this.#logger.sectionEnded(`DatasetManager:${alias}:Cache`, 'We save the cache with this data.');
                        this.#cache.set(alias, data);
                        // Set the results
                        this.#logger.sectionEnded(`DatasetManager:${alias}:Retriever`, 'Information retrieved!');
                        results.set(alias, data);
                        // Resolve
                        resolve();
                    },
                    // error
                    (error) => {
                        // Reject with this error
                        this.#logger.sectionFailed(`DatasetManager:${alias}:Cache`, 'Due to an error the cache is still empty');
                        this.#logger.sectionFailed(`DatasetManager:${alias}:Retriever`, error.message);
                        reject(error);
                    },
                    // Send any parameters if needed
                    paramaters
                );
            }));
        });
        return Promise.all(promises).then(() => results);
    }

    getCacheInformation() {
        return this.#cache.keys().map((datasetName) => {
            const dataset = this.#cache.get(datasetName);
            const info = new DatasetCacheInfo();
            info.name = datasetName;
            info.length = dataset?.size();
            info.created = dataset?.createdDate();
            info.modified = dataset?.lastModificationDate();
            return info;
        });
    }

    removeCache(name) {
        this.#cache.remove(name);
    }

    removeAllCache() {
        this.#cache.removeAll();
    }
}