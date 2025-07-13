import { DataDependenciesForOneItem, DataDependencies } from "./orgcheck-api-data-dependencies";

/**
 * @description Factory of dependencies
 */
export class DataDependenciesFactory {
    
    /**
     * @description Create a new instance of DataDependencies
     * @param {DataDependencies} data - The data containing records and errors
     * @param {Array<string>} whatIds - The IDs for which we want to get the dependencies
     * @returns {DataDependenciesForOneItem} Returns a new instance of DataDependencies containing the dependencies for the given whatIds
     */
    static create(data, whatIds) {
        // Check if at least one of the whatIds is present in the data errors list
        if (data.errors?.some(errorId => whatIds.includes(errorId))) {
            return {
                hadError: true,
                using: [],
                referenced: [],
                referencedByTypes: {},
            };
        }
        // Data can contain a lot of dependencies from other ids, we just want to get the dependencies for the given whatIds
        // WhatID is using what? -- Here we are getting the dependencies where the ID is in the whatIds list
        const using = data.records.filter(e => whatIds.includes(e.id)).map(n => { 
            return { 
                id: n.refId, 
                name: n.refName, 
                type: n.refType,
                url: n.refUrl
            }; 
        });
        /** @type {any} */
        const refByTypes = {};
        // WhatID is referenced where? -- Here we are getting the dependencies where the REFID is in the whatIds list
        const referenced = data.records.filter(e => whatIds.includes(e.refId)).map(n => {
            if (refByTypes[n.type] === undefined) {
                refByTypes[n.type] = 1;
            } else {
                refByTypes[n.type]++;
            }
            return { 
                id: n.id, 
                name: n.name, 
                type: n.type,
                url: n.url
            };
        })
        return {
            hadError: false,
            using: using,
            referenced: referenced,
            referencedByTypes: refByTypes
        }
    }
}