/**
 * @description Dependencies between data given a main item (identified by the given WhatId)
 */
export class OrgCheckDataDependencies {

    /**
     * @description List of items that the main item (identified by the given WhatId) is using
     * @type {boolean}
     * @public
     */
    hadError;

    /**
     * @description List of items that the main item (identified by the given WhatId) is using
     * @type {Array<{ id: string, name: string, type: string, url: string }>}
     * @public
     */
    using;

    /**
     * @description List of items that are using the main item (identified by the given WhatId)
     * @type {Array<{ id: string, name: string, type: string, url: string }>}
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