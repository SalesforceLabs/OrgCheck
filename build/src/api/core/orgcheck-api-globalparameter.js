const ALL_VALUES = '*';
const SOBJECT_NAME = 'sobject';
const PACKAGE_NAME = 'namespace';
const SOBJECT_TYPE_NAME = 'sobjecttype';
const SYSTEM_PERMISSIONS_LIST = 'permissions';

export class OrgCheckGlobalParameter {

    /**
     * @description Constant for any values
     */
    static get ALL_VALUES() { return ALL_VALUES; }

    /**
     * @description Key to represent a SObject name
     * @type {string}
     * @static
     */
    static get SOBJECT_NAME() { return SOBJECT_NAME; }

    /**
     * @description Key to represent a namespace of a package
     * @type {string}
     * @static
     */
    static get PACKAGE_NAME() { return PACKAGE_NAME; }

    /**
     * @description Key to represent a type of a SObject
     * @type {string}
     * @static
     */
    static get SOBJECT_TYPE_NAME() { return SOBJECT_TYPE_NAME; }

    /**
     * @description Key to represent a list of system permissions
     * @type {string}
     * @static
     */
    static get SYSTEM_PERMISSIONS_LIST() { return SYSTEM_PERMISSIONS_LIST; }

    /**
     * @description Get the SObject name from the parameters
     * @param {Map<string, string>} parameters Map of parameters
     * @return {string} The SObject name or ALL_VALUES if not specified
     * @static
     * @public
     */
    static getSObjectName(parameters) {
        return parameters?.get(SOBJECT_NAME) ?? ALL_VALUES;
    }

    /**
     * @description Get the package name from the parameters
     * @param {Map<string, string>} parameters Map of parameters
     * @return {string} The package name or ALL_VALUES if not specified
     * @static
     * @public
     */
    static getPackageName(parameters) {
        return parameters?.get(PACKAGE_NAME) ?? ALL_VALUES;
    }

    /**
     * @description Get the SObject type name from the parameters
     * @param {Map<string, string>} parameters Map of parameters
     * @return {string} The SObject type name or ALL_VALUES if not specified
     * @static
     * @public
     */
    static getSObjectTypeName(parameters) {
        return parameters?.get(SOBJECT_TYPE_NAME) ?? ALL_VALUES;
    }

    /**
     * @description Get the list of system permissions from the parameters
     * @param {Map<string, Array<string>>} parameters Map of parameters
     * @return {Array<string>} The list of system permissions or an empty array if not specified
     * @static
     * @public
     */
    static getSystemPermissionsList(parameters) {
        return parameters?.get(SYSTEM_PERMISSIONS_LIST) ?? [];
    }
}