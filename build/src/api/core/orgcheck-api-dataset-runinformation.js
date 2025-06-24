/**
 * @description Dataset Run Information
 */
export class DatasetRunInformation {
    
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
     * @param {Map} parameters 
     */
    constructor(alias, cacheKey, parameters) {
        this.alias = alias;
        this.cacheKey = cacheKey;
        this.parameters = parameters;
    }
}