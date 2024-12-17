// @ts-check
export class OrgCheckDataDependencies {

    /**
     * @type Array<{ id: string, name: string, type: string, url: string }>
     */
    using;

    /**
     * @type Array<{ id: string, name: string, type: string, url: string }>
     */
    referenced;

    /**
     * @type any
     */
    referencedByTypes;

    /**
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