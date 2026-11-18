import { DataDependenciesForOneItem, DataDependencies, DataDependencyItem } from 'src/api/core/data/orgcheck-api-data-dependencies';

/**
 * @description Factory of dependencies
 */
export class DataDependenciesFactory {
    
    /**
     * @description Create a new instance of DataDependencies
     * @param {DataDependencies} data - The data containing items, relationships and errors
     * @param {string[]} whatIds - The IDs for which we want to get the dependencies
     * @returns {DataDependenciesForOneItem} Returns a new instance of DataDependencies containing the dependencies for the given whatIds
     */
    static create(data: DataDependencies, whatIds: string[]): DataDependenciesForOneItem {
        // Check if at least one of the whatIds is present in the data errors list
        if (data.errors?.some((errorId: string) => whatIds.includes(errorId))) {
            return {
                hadError: true,
                using: [],
                referenced: [],
                referencedByTypes: {},
            };
        }
        // Data can contain a lot of dependencies from other ids, we just want to get the dependencies for the given whatIds
        // WhatID is using what? -- Here we are getting the dependencies where the ID is in the whatIds list
        const using = data.relationships.filter((e) => whatIds.includes(e.id)).map((n) => data.items.get(n.refId));

        const refByTypes = {};
        // WhatID is referenced where? -- Here we are getting the dependencies where the REFID is in the whatIds list
        const referenced = data.relationships.filter((e) => whatIds.includes(e.refId)).map((n) => {
            const item = data.items.get(n.id);
            if (item) {
                if (refByTypes[item.type] === undefined) {
                    refByTypes[item.type] = 1;
                } else {
                    refByTypes[item.type]++;
                }
            }
            return item;
        })
        return {
            hadError: false,
            using: using.filter((item) => item !== undefined) as DataDependencyItem[],
            referenced: referenced.filter((item) => item !== undefined) as DataDependencyItem[],
            referencedByTypes: refByTypes
        }
    }
}