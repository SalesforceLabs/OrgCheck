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
const OBJECTS_MODE = 'objectsmode';
const OBJECTS_MODE_FULL = 'full';
const OBJECTS_MODE_LITE = 'lite';
const LFS_BETA_MODE = 'lfsbetamode';
const LFS_MIN_SEVERITY = 'lfsminseverity';
const LFS_SEVERITY_ALL = '*';

export class OrgCheckGlobalParameter {

    /**
     * @description Constant for any values
     * @returns {string} The value of the constant
     */
    static get ALL_VALUES(): string { return ALL_VALUES; }

    /**
     * @description Key to represent a SObject name
     * @returns {string} The value of the constant
     * @static
     */
    static get SOBJECT_NAME(): string { return SOBJECT_NAME; }

    /**
     * @description Key to represent the mode of SObjects dataset (full or lite)
     * @returns {string} The value of the constant
     * @static
     */
    static get OBJECTS_MODE(): string { return OBJECTS_MODE; }

    /**
     * @description Key to represent the FULL mode of SObjects dataset
     * @returns {string} The value of the constant
     * @static
     */
    static get OBJECTS_MODE_FULL(): string { return OBJECTS_MODE_FULL; }

    /**
     * @description Key to represent the LITE mode of SObjects dataset
     * @returns {string} The value of the constant
     * @static
     */
    static get OBJECTS_MODE_LITE(): string { return OBJECTS_MODE_LITE; }

    /**
     * @description Key to represent a namespace of a package
     * @returns {string} The value of the constant
     * @static
     */
    static get PACKAGE_NAME(): string { return PACKAGE_NAME; }

    /**
     * @description Key to represent a type of a SObject
     * @returns {string} The value of the constant
     * @static
     */
    static get SOBJECT_TYPE_NAME(): string { return SOBJECT_TYPE_NAME; }

    /**
     * @description Key to represent a list of system permissions
     * @returns {string} The value of the constant
     * @static
     */
    static get SYSTEM_PERMISSIONS_LIST(): string { return SYSTEM_PERMISSIONS_LIST; }

    /**
     * @description Key to represent a type of an Apex class
     * @returns {string} The value of the constant
     * @static
     */ 
    static get APEX_CLASS_TYPE(): string { return APEX_CLASS_TYPE; }

    /**
     * @description Key to represent a type of a regular Apex class
     * @returns {string} The value of the constant
     * @static
     */ 
    static get APEX_CLASS_TYPE_REGULAR(): string { return APEX_CLASS_TYPE_REGULAR; }

    /**
     * @description Key to represent a type of an Apex class test
     * @returns {string} The value of the constant
     * @static
     */
    static get APEX_CLASS_TYPE_TEST(): string { return APEX_CLASS_TYPE_TEST; }

    /**
     * @description Key to represent a type of an Apex uncompiled class
     * @returns {string} The value of the constant
     * @static
     */ 
    static get APEX_CLASS_TYPE_UNCOMPILED(): string { return APEX_CLASS_TYPE_UNCOMPILED; }

    /**
     * @description Key to represent a type of a group
     * @returns {string} The value of the constant
     * @static
     */ 
    static get GROUP_TYPE(): string { return GROUP_TYPE; }

    /**
     * @description Key to represent the value of the public group type
     * @returns {string} The value of the constant
     * @static
     */ 
    static get GROUP_TYPE_PG(): string { return GROUP_TYPE_PG; }

    /**
     * @description Key to represent the value of the queue type
     * @returns {string} The value of the constant
     * @static
     */ 
    static get GROUP_TYPE_QUEUE(): string { return GROUP_TYPE_QUEUE; }

    /**
     * @description Get the SObject name from the parameters
     * @param {Map<string, string>} parameters - Map of parameters
     * @returns {string} The SObject name or ALL_VALUES if not specified
     * @static
     * @public
     */
    static getSObjectName(parameters: Map<string, string>): string {
        return parameters?.get(SOBJECT_NAME) ?? ALL_VALUES;
    }

    /**
     * @description Get the package name from the parameters
     * @param {Map<string, string>} parameters - Map of parameters
     * @returns {string} The package name or ALL_VALUES if not specified
     * @static
     * @public
     */
    static getPackageName(parameters: Map<string, string>): string {
        return parameters?.get(PACKAGE_NAME) ?? ALL_VALUES;
    }

    /**
     * @description Get the SObject type name from the parameters
     * @param {Map<string, string>} parameters - Map of parameters
     * @returns {string} The SObject type name or ALL_VALUES if not specified
     * @static
     * @public
     */
    static getSObjectTypeName(parameters: Map<string, string>): string {
        return parameters?.get(SOBJECT_TYPE_NAME) ?? ALL_VALUES;
    }

    /**
     * @description Get the list of system permissions from the parameters
     * @param {Map<string, string>[]} parameters - Map of parameters
     * @returns {string[]} The list of system permissions or an empty array if not specified
     * @static
     * @public
     */
    static getSystemPermissionsList(parameters: Map<string, string[]>): string[] {
        return parameters?.get(SYSTEM_PERMISSIONS_LIST) ?? [];
    }

    /**
     * @description Get the Apex class type from the parameters
     * @param {Map<string, string>} parameters - Map of parameters
     * @returns {string} The Apex class type or ALL_VALUES if not specified
     * @static
     * @public
     */
    static getApexClassType(parameters: Map<string, string>): string {
        return parameters?.get(APEX_CLASS_TYPE) ?? ALL_VALUES;
    }

    /**
     * @description Get the Group type from the parameters
     * @param {Map<string, string>} parameters - Map of parameters
     * @returns {string} The Group type or ALL_VALUES if not specified
     * @static
     * @public
     */
    static getGroupType(parameters: Map<string, string>): string {
        return parameters?.get(GROUP_TYPE) ?? ALL_VALUES;
    }

    /**
     * @description Get the SObject dataset mode from the parameters
     * @param {Map<string, string>} parameters - Map of parameters
     * @returns {string} The mode (by default it's full)
     * @static
     * @public
     */
    static getObjectsMode(parameters: Map<string, string>): string {
        return parameters?.get(OBJECTS_MODE) ?? OBJECTS_MODE_FULL;
    }

    /**
     * @description Key to enable Lightning Flow Scanner beta rules
     * @returns {string} The value of the constant
     * @static
     */
    static get LFS_BETA_MODE(): string { return LFS_BETA_MODE; }

    /**
     * @description Key for the minimum LFS violation severity to display ('error', 'warning', 'note', or '*' for all)
     * @returns {string} The value of the constant
     * @static
     */
    static get LFS_MIN_SEVERITY(): string { return LFS_MIN_SEVERITY; }

    /**
     * @description Wildcard value meaning all severities
     * @returns {string} The value of the constant
     * @static
     */
    static get LFS_SEVERITY_ALL(): string { return LFS_SEVERITY_ALL; }

    /**
     * @description Get the LFS beta mode setting from the parameters
     * @param {Map<string, unknown>} parameters - Map of parameters
     * @returns {boolean} true if beta rules should be included
     * @static
     * @public
     */
    static getLfsBetaMode(parameters: Map<string, unknown>): boolean {
        return (parameters?.get(LFS_BETA_MODE) as boolean) ?? false;
    }

    /**
     * @description Get the LFS minimum severity from the parameters
     * @param {Map<string, unknown>} parameters - Map of parameters
     * @returns {string} The minimum severity or '*' (all)
     * @static
     * @public
     */
    static getLfsMinSeverity(parameters: Map<string, unknown>): string {
        return (parameters?.get(LFS_MIN_SEVERITY) as string) ?? LFS_SEVERITY_ALL;
    }
}