/**
 * @description Dataset Run Information
 */
export class OrgCheckDatasetRunInformation {
    
    /**
     * @type {string}
     * @public
     */
    alias;

    /**
     * @type {string}
     * @public
     */
    cacheKey;

    /**
     * @type {Map}
     * @public
     */
    parameters;
    
    /**
     * @description Constructor
     * @param {string} alias 
     * @param {string} cacheKey 
     */
    constructor(alias, cacheKey) {
        this.alias = alias;
        this.cacheKey = cacheKey;
        this.parameters = new Map();
    }
}