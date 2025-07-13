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
     * @type {Map<string, any>}
     * @public
     */
    parameters;
    
    /**
     * @description Constructor
     * @param {string} alias - The recipe alias
     * @param {string} cacheKey - The cache key
     * @param {Map<string, any>} parameters - The parameters
     */
    constructor(alias, cacheKey, parameters) {
        this.alias = alias;
        this.cacheKey = cacheKey;
        this.parameters = parameters;
    }
}