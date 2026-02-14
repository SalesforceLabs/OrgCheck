/**
 * @description Dataset Run Information
 */
export class DatasetRunInformation {
    
    /**
     * @type {string}
     * @public
     */
    alias: string;

    /**
     * @type {string}
     * @public
     */
    cacheKey: string;

    /**
     * @type {Map<string, any>}
     * @public
     */
    parameters: Map<string, any>;
    
    /**
     * @description Constructor
     * @param {string} alias - The recipe alias
     * @param {string} cacheKey - The cache key
     * @param {Map<string, any>} parameters - The parameters
     */
    constructor(alias: string, cacheKey: string, parameters: Map<string, any>) {
        this.alias = alias;
        this.cacheKey = cacheKey;
        this.parameters = parameters;
    }
}