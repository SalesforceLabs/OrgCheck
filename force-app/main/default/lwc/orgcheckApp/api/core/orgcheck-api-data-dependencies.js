// @ts-check

/**
 * @description Helper class to structure the dependencies between data given a main item (identified by the given WhatId)
 */
export class OrgCheckDataDependencies {

    /**
     * @description List of items that the main item (identified by the given WhatId) is using
     * @type Array<{ id: string, name: string, type: string, url: string }>
     * @public
     */
    using;

    /**
     * @description List of items that are using the main item (identified by the given WhatId)
     * @type Array<{ id: string, name: string, type: string, url: string }>
     * @public
     */
    referenced;

    /**
     * @description Count of items using the main item (identified by the given WhatId) grouped by types
     * @type any
     * @public
     */
    referencedByTypes;

    /**
     * @description Constructor
     * @param {Array<{ id: string, name: string, type: string, url: string, refId: string, refName: string, refType: string, refUrl: string }>} data 
     * @param {string} whatId 
     */
    constructor(data, whatId) {

        this.using = data.filter(e => e.id === whatId).map(n => { 
            return { 
                id: n.refId, 
                name: n.refName, 
                type: n.refType,
                url: n.refUrl
            }; 
        });
        this.referencedByTypes = {};
        this.referenced = data.filter(e => e.refId === whatId).map(n => {
            if (this.referencedByTypes[n.type] === undefined) {
                this.referencedByTypes[n.type] = 1;
            } else {
                this.referencedByTypes[n.type]++; 
            }
            return { 
                id: n.id, 
                name: n.name, 
                type: n.type,
                url: n.url
            };
        });
    }
}