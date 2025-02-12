import { DataDependencies } from "./orgcheck-api-data-dependencies";

/**
 * @description Factory of dependencies
 */
export class DataDependenciesFactory {
    
    /**
     * @description Create a new instance of DataDependencies
     * @param {{ records: Array<{ id: string, name: string, type: string, url: string, refId: string, refName: string, refType: string, refUrl: string }>, errors: Array<string> }} data 
     * @param {string} whatId 
     * @returns {DataDependencies | any}
     */
    static create(data, whatId) {
        if (data.errors.includes(whatId)) {
            return {
                hadError: true
            };
        }
        const using = data.records.filter(e => e.id === whatId).map(n => { 
            return { 
                id: n.refId, 
                name: n.refName, 
                type: n.refType,
                url: n.refUrl
            }; 
        });
        const referencedByTypes = {};
        const referenced = data.records.filter(e => e.refId === whatId).map(n => {
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
            using: using,
            referenced: referenced,
            referencedByTypes: referencedByTypes
        }
    }
}