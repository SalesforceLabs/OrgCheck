/**
 * @description Dataset Run Information
 */
export class DatasetRunInformation {
    
    /**
     * @type {string}
     * @public
     */
    public readonly alias: string;

    /**
     * @type {string}
     * @public
     */
    public readonly cacheKey: string;

    /**
     * @type {Map<string, any>}
     * @public
     */
    public readonly parameters: Map<string, any>;
    
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