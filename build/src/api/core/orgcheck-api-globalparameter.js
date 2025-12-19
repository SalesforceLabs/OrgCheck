const ALL_VALUES = '*';
const SOBJECT_NAME = 'sobject';
const PACKAGE_NAME = 'namespace';
const SOBJECT_TYPE_NAME = 'sobjecttype';
const SYSTEM_PERMISSIONS_LIST = 'permissions';
const APEX_CLASS_TYPE = 'apexclasstype';
const APEX_CLASS_TYPE_REGULAR = 'apexregular';
const APEX_CLASS_TYPE_TEST = 'apextest';
const APEX_CLASS_TYPE_UNCOMPILED = 'apexuncompiled';
const GROUP_TYPE = 'grouptype';
const GROUP_TYPE_PG = 'publicgroup';
const GROUP_TYPE_QUEUE = 'queue';

export class OrgCheckGlobalParameter {

    /**
     * @description Constant for any values
     * @returns {string} The value of the constant
     */
    static get ALL_VALUES() { return ALL_VALUES; }

    /**
     * @description Key to represent a SObject name
     * @returns {string} The value of the constant
     * @static
     */
    static get SOBJECT_NAME() { return SOBJECT_NAME; }

    /**
     * @description Key to represent a namespace of a package
     * @returns {string} The value of the constant
     * @static
     */
    static get PACKAGE_NAME() { return PACKAGE_NAME; }

    /**
     * @description Key to represent a type of a SObject
     * @returns {string} The value of the constant
     * @static
     */
    static get SOBJECT_TYPE_NAME() { return SOBJECT_TYPE_NAME; }

    /**
     * @description Key to represent a list of system permissions
     * @returns {string} The value of the constant
     * @static
     */
    static get SYSTEM_PERMISSIONS_LIST() { return SYSTEM_PERMISSIONS_LIST; }

    /**
     * @description Key to represent a type of an Apex class
     * @returns {string} The value of the constant
     * @static
     */ 
    static get APEX_CLASS_TYPE() { return APEX_CLASS_TYPE; }

    /**
     * @description Key to represent a type of a regular Apex class
     * @returns {string} The value of the constant
     * @static
     */ 
    static get APEX_CLASS_TYPE_REGULAR() { return APEX_CLASS_TYPE_REGULAR; }

    /**
     * @description Key to represent a type of an Apex class test
     * @returns {string} The value of the constant
     * @static
     */
    static get APEX_CLASS_TYPE_TEST() { return APEX_CLASS_TYPE_TEST; }

    /**
     * @description Key to represent a type of an Apex uncompiled class
     * @returns {string} The value of the constant
     * @static
     */ 
    static get APEX_CLASS_TYPE_UNCOMPILED() { return APEX_CLASS_TYPE_UNCOMPILED; }

    /**
     * @description Key to represent a type of a group
     * @returns {string} The value of the constant
     * @static
     */ 
    static get GROUP_TYPE() { return GROUP_TYPE; }

    /**
     * @description Key to represent the value of the public group type
     * @returns {string} The value of the constant
     * @static
     */ 
    static get GROUP_TYPE_PG() { return GROUP_TYPE_PG; }

    /**
     * @description Key to represent the value of the queue type
     * @returns {string} The value of the constant
     * @static
     */ 
    static get GROUP_TYPE_QUEUE() { return GROUP_TYPE_QUEUE; }

    /**
     * @description Get the SObject name from the parameters
     * @param {Map<string, string>} parameters - Map of parameters
     * @returns {string} The SObject name or ALL_VALUES if not specified
     * @static
     * @public
     */
    static getSObjectName(parameters) {
        return parameters?.get(SOBJECT_NAME) ?? ALL_VALUES;
    }

    /**
     * @description Get the package name from the parameters
     * @param {Map<string, string>} parameters - Map of parameters
     * @returns {string} The package name or ALL_VALUES if not specified
     * @static
     * @public
     */
    static getPackageName(parameters) {
        return parameters?.get(PACKAGE_NAME) ?? ALL_VALUES;
    }

    /**
     * @description Get the SObject type name from the parameters
     * @param {Map<string, string>} parameters - Map of parameters
     * @returns {string} The SObject type name or ALL_VALUES if not specified
     * @static
     * @public
     */
    static getSObjectTypeName(parameters) {
        return parameters?.get(SOBJECT_TYPE_NAME) ?? ALL_VALUES;
    }

    /**
     * @description Get the list of system permissions from the parameters
     * @param {Map<string, Array<string>>} parameters - Map of parameters
     * @returns {Array<string>} The list of system permissions or an empty array if not specified
     * @static
     * @public
     */
    static getSystemPermissionsList(parameters) {
        return parameters?.get(SYSTEM_PERMISSIONS_LIST) ?? [];
    }

    /**
     * @description Get the Apex class type from the parameters
     * @param {Map<string, string>} parameters - Map of parameters
     * @returns {string} The Apex class type or ALL_VALUES if not specified
     * @static
     * @public
     */
    static getApexClassType(parameters) {
        return parameters?.get(APEX_CLASS_TYPE) ?? ALL_VALUES;
    }

    /**
     * @description Get the Group type from the parameters
     * @param {Map<string, string>} parameters - Map of parameters
     * @returns {string} The Group type or ALL_VALUES if not specified
     * @static
     * @public
     */
    static getGroupType(parameters) {
        return parameters?.get(GROUP_TYPE) ?? ALL_VALUES;
    }
}