/**
 * @description Dependency between two items
 */
export class DataDependency {

    /**
     * @description Salesforce ID of the item
     * @type {string}
     * @public
     */
    id: string;

    /**
     * @description Name of the item
     * @type {string}
     * @public
     */
    name: string;

    /**
     * @description Type of the item
     * @type {string}
     * @public
     */
    type: string;

    /**
     * @description Salesforce Setup URL of the item
     * @type {string}
     * @public
     */
    url: string;

    /**
     * @description Salesforce ID of the referenced item
     * @type {string}
     * @public
     */
    refId: string;

    /**
     * @description Name of the referenced item
     * @type {string}
     * @public
     */
    refName: string;

    /**
     * @description Type of the referenced item
     * @type {string}
     * @public
     */
    refType: string;

    /**
     * @description Salesforce Setup URL of the referenced item
     * @type {string}
     * @public
     */
    refUrl: string;
}

export class DataDependencies {

    /** 
     * @description List of dependencies between items
     * @type {Array<DataDependency>} 
     * @public
     */
    records: DataDependency[];
    
    /** 
     * @description List of errors from system, if any
     * @type {Array<string>} 
     * @public
     */
    errors: string[];
}

/**
 * @description Dependency item using or referencing our dear main item
 */
export class DataDependencyItem {

    /**
     * @description Salesforce ID of the item
     * @type {string}
     * @public
     */
    id: string;
    
    /**
     * @description Name of the item
     * @type {string}
     * @public
     */
    name: string;
    
    /**
     * @description Type of the item
     * @type {string}
     * @public
     */
    type: string;
    
    /**
     * @description URL of the item
     * @type {string}
     * @public
     */
    url: string;
}

/**
 * @description Dependencies between data given a main item (identified by the given WhatId)
 */
export class DataDependenciesForOneItem {

    /**
     * @description List of items that the main item (identified by the given WhatId) is using
     * @type {boolean}
     * @public
     */
    hadError: boolean;

    /**
     * @description List of items that the main item (identified by the given WhatId) is using
     * @type {Array<DataDependencyItem>}
     * @public
     */
    using: DataDependencyItem[];

    /**
     * @description List of items that are using the main item (identified by the given WhatId)
     * @type {Array<DataDependencyItem>}
     * @public
     */
    referenced: DataDependencyItem[];

    /**
     * @description Count of items using the main item (identified by the given WhatId) grouped by types
     * @type {any}
     * @public
     */
    referencedByTypes: any;
}