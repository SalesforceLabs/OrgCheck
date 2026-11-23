export interface DataDependencies {

    /**
     * @description Map of dependency items by their Salesforce ID (id15)
     * @type {Map<string, DataDependencyItem>}
     * @public
     */
    items: Map<string, DataDependencyItem>;

    /**
     * @description List of dependencies between items
     * @type {DataDependencyRelationShip[]}
     * @public
     */
    relationships: DataDependencyRelationShip[];
    
    /** 
     * @description List of errors from system, if any
     * @type {string[]} 
     * @public
     */
    errors: string[];
}

export interface DataDependencyRelationShip {

    /**
     * @description Salesforce ID of the item
     * @type {string}
     * @public
     */
    id: string;

    /**
     * @description Salesforce ID of the referenced item
     * @type {string}
     * @public
     */
    refId: string;
}

export enum DataDependencyItemStatus {
    NOT_SPECIFIED = 'Not specified',
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
    DRAFT = 'Draft',
}

/**
 * @description Dependency item using or referencing our dear main item
 */
export interface DataDependencyItem {

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
     * @description Status of the item
     * @type {DataDependencyItemStatus}
     * @public
     */
    status: DataDependencyItemStatus;

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
export interface DataDependenciesForOneItem {

    /**
     * @description List of items that the main item (identified by the given WhatId) is using
     * @type {boolean}
     * @public
     */
    hadError: boolean;

    /**
     * @description List of items that the main item (identified by the given WhatId) is using
     * @type {DataDependencyItem[]}
     * @public
     */
    using: DataDependencyItem[];

    /**
     * @description List of items that are using the main item (identified by the given WhatId)
     * @type {DataDependencyItem[]}
     * @public
     */
    referenced: DataDependencyItem[];

    /**
     * @description Count of items using the main item (identified by the given WhatId) grouped by types
     * @type {any}
     * @public
     */
    referencedByTypes: Record<string, number>;
}