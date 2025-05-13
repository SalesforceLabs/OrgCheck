import { DataDependencies } from "./orgcheck-api-data-dependencies";

/**
 * @description Factory of dependencies
 */
export class DataDependenciesFactory {
    
    /**
     * @description Create a new instance of DataDependencies
     * @param {{ records: Array<{ id: string, name: string, type: string, url: string, refId: string, refName: string, refType: string, refUrl: string }>, errors: Array<string> }} data 
     * @param {Array<string>} whatIds 
     * @returns {DataDependencies}
     */
    static create(data, whatIds) {
        // Check if at least one of the whatIds is present in the data errors list
        if (data.errors?.some(errorId => whatIds.includes(errorId))) {
            return {
                hadError: true,
                using: [],
                referenced: [],
                referencedByTypes: {}
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
        const referencedByTypes = {};
        // WhatID is referenced where? -- Here we are getting the dependencies where the REFID is in the whatIds list
        const referenced = data.records.filter(e => whatIds.includes(e.refId)).map(n => {
            if (referencedByTypes[n.type] === undefined) {
                referencedByTypes[n.type] = 1;
            } else {
                referencedByTypes[n.type]++; 
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
            referencedByTypes: referencedByTypes
        }
    }
}