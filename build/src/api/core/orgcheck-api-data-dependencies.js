/**
 * @description Dependency between two items
 */
export class DataDependency {

    /**
     * @description Salesforce ID of the item
     * @type {string}
     * @public
     */
    id;

    /**
     * @description Name of the item
     * @type {string}
     * @public
     */
    name;

    /**
     * @description Type of the item
     * @type {string}
     * @public
     */
    type;

    /**
     * @description Salesforce Setup URL of the item
     * @type {string}
     * @public
     */
    url;

    /**
     * @description Salesforce ID of the referenced item
     * @type {string}
     * @public
     */
    refId;

    /**
     * @description Name of the referenced item
     * @type {string}
     * @public
     */
    refName;

    /**
     * @description Type of the referenced item
     * @type {string}
     * @public
     */
    refType;

    /**
     * @description Salesforce Setup URL of the referenced item
     * @type {string}
     * @public
     */
    refUrl
}

export class DataDependencies {

    /** 
     * @description List of dependencies between items
     * @type {Array<DataDependency>} 
     * @public
     */
    records;
    
    /** 
     * @description List of errors from system, if any
     * @type {Array<string>} 
     * @public
     */
    errors;
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
    id;
    
    /**
     * @description Name of the item
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Type of the item
     * @type {string}
     * @public
     */
    type;
    
    /**
     * @description URL of the item
     * @type {string}
     * @public
     */
    url;
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
    hadError;

    /**
     * @description List of items that the main item (identified by the given WhatId) is using
     * @type {Array<DataDependencyItem>}
     * @public
     */
    using;

    /**
     * @description List of items that are using the main item (identified by the given WhatId)
     * @type {Array<DataDependencyItem>}
     * @public
     */
    referenced;

    /**
     * @description Count of items using the main item (identified by the given WhatId) grouped by types
     * @type {any}
     * @public
     */
    referencedByTypes;
}