/**
 * @description This interface represents a matrix data
 * @example Example of a DataMatrix would be:
 *               {
 *                  columnHeaders: [
 *                      { id: 'objectA', label: 'Object A', url: '...' }},
 *                      { id: 'objectB', label: 'Object B', url: '...' }},
 *                      { id: 'objectC', label: 'Object C', url: '...' }},
 *                      { id: 'objectD', label: 'Object D', url: '...' }}
 *                  ],
 *                  rows: [
 *                     { header: { label: 'Profile 1',        url: '...' }, data: { objectA: 'CR', objectB: 'CRU',                   objectD: 'R'     } },
 *                     { header: { label: 'Permission Set A', url: '...' }, data: { objectA: 'CR',                                   objectD: 'R'     } },
 *                     { header: { label: 'Permission Set B', url: '...' }, data: {                                objectC: 'CRUDm', objectD: 'CRUDm' } },
 *                  ]
 *               }
 */
interface DataMatrixIntf {
    /**
     * @description Information about the columns that could be found in the rows.data structure. Keys are the name fo the properties. Values are the information for this property.
     * @type {Array<any>}
     * @public
     */
    columnHeaders: Array<any>;
    /**
     * @description List of data for each "row". A row will have a headerId (used as row header in the matrix view). And data is an object with as many properties.
     * @type {Array<DataMatrixRowIntf>}
     * @public
     */
    rows: Array<DataMatrixRowIntf>;
}
/**
 * @description This interface represents a row in a matrix data.
 */
interface DataMatrixRowIntf {
    /**
     * @description Header reference of the matrix row
     * @type {any}
     * @public
     */
    header: any;
    /**
     * @description Data of the row as an object with dynamic properties (defined in the parent DataMatrix object).
     * @type {any}
     * @public
     * @see DataMatrix
     */
    data: any;
}

/**
 * @description Information about the current Daily API Request usage limit
 */
interface SalesforceUsageInformationIntf {
    /**
     * @description Current ratio (not percentage!) of Daily API Request limit usage
     * @type {number}
     * @public
     */
    currentUsageRatio: number;
    /**
     * @description Current percentage of Daily API Request limit usage
     * @type {string}
     * @public
     */
    currentUsagePercentage: string;
    /**
     * @description Threshold value when percentage is reaching a "warning" zone (not yet a "critical" zone)
     * @type {number}
     * @public
     */
    yellowThresholdPercentage: number;
    /**
     * @description Threshold value when percentage is reaching a "critical" zone.
     * @type {number}
     * @public
     */
    redThresholdPercentage: number;
    /**
     * @description Is the current percentage in the "OK" zone?
     * @type {boolean}
     * @public
     */
    isGreenZone: boolean;
    /**
     * @description Is the current percentage in the "warning" zone?
     * @type {boolean}
     * @public
     */
    isYellowZone: boolean;
    /**
     * @description Is the current percentage in the "critical" zone?
     * @type {boolean}
     * @public
     */
    isRedZone: boolean;
}

/**
 * @description Data aliases
 */
declare enum DataAliases {
    SFDC_ApexTestMethodResult = "Apex Test Method",
    SFDC_ApexClass = "Apex Class",
    SFDC_ApexTrigger = "Apex Trigger",
    SFDC_Application = "Application",
    SFDC_AppPermission = "App Permission",
    SFDC_Browser = "Browser",
    SFDC_CollaborationGroup = "Chatter Group",
    SFDC_CustomLabel = "Custom Label",
    SFDC_CustomTab = "Custom Tab",
    SFDC_Dashboard = "Dashboard",
    SFDC_Document = "Document",
    SFDC_EmailTemplate = "Email Template",
    SFDC_Field = "Field",
    SFDC_FieldPermission = "Field Permission",
    SFDC_FieldSet = "Field Set",
    SFDC_Flow = "Flow",
    SFDC_FlowVersion = "Flow Version",
    SFDC_Group = "Group",
    SFDC_HomePageComponent = "Home Page",
    SFDC_KnowledgeArticle = "Article",
    SFDC_LightningAuraComponent = "Aura Component",
    SFDC_LightningPage = "Page",
    SFDC_LightningWebComponent = "Lightning Web Component",
    SFDC_Limit = "Limit",
    SFDC_Object = "Object",
    SFDC_ObjectPermission = "CRUD",
    SFDC_ObjectRelationShip = "Relationship",
    SFDC_ObjectType = "Object Type",
    SFDC_Organization = "Organization",
    SFDC_Package = "Package",
    SFDC_PageLayout = "Page Layout",
    SFDC_PermissionSet = "Permission Set",
    SFDC_PermissionSetLicense = "Permission Set License",
    SFDC_Profile = "Profile",
    SFDC_ProfilePasswordPolicy = "Password Policy",
    SFDC_ProfileRestrictions = "Profile Restrictions",
    SFDC_ProfileIpRangeRestriction = "Profile Ip Range Restrictions",
    SFDC_ProfileLoginHourRestriction = "Profile Login Hour Restrictions",
    SFDC_RecordType = "Record Type",
    SFDC_Report = "Report",
    SFDC_StaticResource = "Sstatic Resource",
    SFDC_User = "User",
    SFDC_UserRole = "Role",
    SFDC_ValidationRule = "Validation Rule",
    SFDC_VisualForceComponent = "Visualforce Component",
    SFDC_VisualForcePage = "Visualforce Page",
    SFDC_WebLink = "Web Link",
    SFDC_Workflow = "Workflow"
}

/**
 * @description Dependency item using or referencing our dear main item
 */
interface DataDependencyItem {
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
interface DataDependenciesForOneItem {
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

/**
 * @description This interface represents a data in Org Check
 * @see DataWithScore
 * @see DataWithoutScore
 * @see DataWithScoreAndDependencies
 */
interface Data {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases;
}
/**
 * @description This interface represents a set of information around a unique instance of a specific artefact (like User, Profile, UserRole, ...)
 *   Such interface are created by a "data factory" (see DataFactory) which also computes its "score" based on specific best practices rules.
 */
interface DataWithScore extends Data {
    /**
     * @description Badness score of the data. Zero means the data follows best practices. Positive value means some areas need to be corrected.
     * @type {number}
     * @public
     */
    score: number;
    /**
     * @description If the above score is positive, then this property will contain a list of fields that need to be corrected.
     * @type {Array<string>}
     * @public
     */
    badFields: Array<string>;
    /**
     * @description If the above score is positive, then this property will contain a list of reasons ids that explain why the score is positive.
     * @type {Array<number>}
     * @public
     */
    badReasonIds: Array<number>;
}
/**
 * @description In some cases, the DAPI can retrieve dependencies for org check data and having dependencies participate in the computation of the score.
 */
interface DataWithScoreAndDependencies extends DataWithScore {
    /**
     * @description Optionnal dependencies information for this data.
     * @type {DataDependenciesForOneItem}
     * @public
     */
    dependencies: DataDependenciesForOneItem;
}
/**
 * @description This interface represents a set of information around a unique instance of a specific artefact (like User, Profile, UserRole, ...)
 *   Such interface are created by a "data factory" (see DataFactory) BUT do not need any scoring.
 */
interface DataWithoutScore extends Data {
}

interface SFDC_ApexTestMethodResult extends DataWithoutScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_ApexTestMethodResult;
    /**
    * @description Name of this method
    * @type {string}
    * @public
    */
    methodName: string;
    /**
     * @description Is this method was successful or failed
     * @type {boolean}
     * @public
     */
    isSuccessful: boolean;
    /**
     * @description Runtime of that method whatever its result
     * @type {number}
     * @public
     */
    runtime: number;
    /**
     * @description If the method failed this is the error stack trace
     * @type {string}
     * @public
     */
    stacktrace: string;
    /**
     * @description CPU consumption during the test
     * @type {number}
     * @public
     */
    cpuConsumption: number;
    /**
     * @description Async Calls consumption during the test
     * @type {number}
     * @public
     */
    asyncCallsConsumption: number;
    /**
     * @description SOSL consumption during the test
     * @type {number}
     * @public
     */
    soslConsumption: number;
    /**
     * @description SOQL consumption during the test
     * @type {number}
     * @public
     */
    soqlConsumption: number;
    /**
     * @description Query Rows consumption during the test
     * @type {number}
     * @public
     */
    queryRowsConsumption: number;
    /**
     * @description DML Rows consumption during the test
     * @type {number}
     * @public
     */
    dmlRowsConsumption: number;
    /**
     * @description DML consumption during the test
     * @type {number}
     * @public
     */
    dmlConsumption: number;
}
/**
 * @description Representation of an Apex Class in Org Check
 */
interface SFDC_ApexClass extends DataWithScoreAndDependencies {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_ApexClass;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion: number;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Is this class a test class?
     * @type {boolean}
     * @public
     */
    isTest: boolean;
    /**
     * @description Is this class a test class with See All Data option?
     * @type {boolean}
     * @public
     */
    isTestSeeAllData: boolean;
    /**
     * @description Number of direct asserts in this class (if it's a test class)
     * @type {number}
     * @public
     */
    nbSystemAsserts: number;
    /**
     * @description Is this class with the Asbtract modifier?
     * @type {boolean}
     * @public
     */
    isAbstract: boolean;
    /**
     * @description Is this a class? (and not an interface or an enum)
     * @type {boolean}
     * @public
     */
    isClass: boolean;
    /**
     * @description Is this an enum? (and not an interface or a class)
     * @type {boolean}
     * @public
     */
    isEnum: boolean;
    /**
     * @description Is this an interface? (and not a class or an enum)
     * @type {boolean}
     * @public
     */
    isInterface: boolean;
    /**
     * @description Number of inner classs in this class
     * @type {number}
     * @public
     */
    innerClassesCount: number;
    /**
     * @description Is this a class implements Schedulable?
     * @type {boolean}
     * @public
     */
    isSchedulable: boolean;
    /**
     * @description Is this Schedulable class even scheduled in this org?
     * @type {boolean}
     * @public
     */
    isScheduled: boolean;
    /**
     * @description List of interface that this class implements
     * @type {Array<string>}
     * @public
     */
    interfaces: Array<string>;
    /**
     * @description List of super class that this class extends
     * @type {Array<string>}
     * @public
     */
    extends: Array<string>;
    /**
     * @description Number of methods in this class (Note: if the class is a test, this not only the testing methods, this is ALL the methods)
     * @type {number}
     * @public
     */
    methodsCount: number;
    /**
     * @description List of test methods that were OK in the last run results but took more than 20 seconds
     * @type {Array<SFDC_ApexTestMethodResult>}
     * @public
     */
    testPassedButLongMethods: Array<SFDC_ApexTestMethodResult>;
    /**
     * @description List of test methods that were OK in the last run results
     * @type {Array<SFDC_ApexTestMethodResult>}
     * @public
     */
    testFailedMethods: Array<SFDC_ApexTestMethodResult>;
    /**
     * @description Date/Time when this test class was last run. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastTestRunDate: number;
    /**
     * @description Entire time (at the class level) it took to run all test methods (whatever their result) during the last run.
     * @type {number}
     * @public
     */
    testMethodsRunTime: number;
    /**
     * @description List of annotations that this class uses
     * @type {Array<string>}
     * @public
     */
    annotations: Array<string>;
    /**
     * @description Specified sharing mode for this class
     * @type {string}
     * @public
     */
    specifiedSharing: string;
    /**
     * @description Specified access mode for this class
     * @type {string}
     * @public
     */
    specifiedAccess: string;
    /**
     * @description Number of characters used in the class (without comments)
     * @type {number}
     * @public
     */
    length: number;
    /**
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs: Array<string>;
    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs: Array<string>;
    /**
     * @description When we do not have compiler information about this class, it means it needs to be recompiled manually.
     * @type {boolean}
     * @public
     */
    needsRecompilation: boolean;
    /**
     * @description Current code coverage of this class. May vary if you have run all test classes or not.
     * @type {number}
     * @public
     */
    coverage: number;
    /**
     * @description List of test class Ids that participate in the current code coverage of this class (if this is a not test class).
     * @type {Array<string>}
     * @public
     */
    relatedTestClassIds: Array<string>;
    /**
     * @description List of test class that participate in the current code coverage of this class (if this is a not test class).
     * @type {Array<SFDC_ApexClass>}
     * @public
     */
    relatedTestClassRefs: Array<SFDC_ApexClass>;
    /**
     * @description List of class Ids that are tested by this class (if this is a test class).
     * @type {Array<string>}
     * @public
     */
    relatedClassIds: Array<string>;
    /**
     * @description List of class that are tested by this class (if this is a test class).
     * @type {Array<SFDC_ApexClass>}
     * @public
     */
    relatedClassRefs: Array<SFDC_ApexClass>;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
}

/**
 * @description Representation of a Standard Field or a Custom Field in Org Check
 */
interface SFDC_Field extends DataWithScoreAndDependencies {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Field;
    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Label
     * @type {string}
     * @public
     */
    label: string;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Salesforce Id of the sObject where this field is defined
     * @type {string}
     * @public
     */
    objectId: string;
    /**
     * @description Reference of the object for this field
     * @type {SFDC_Object}
     * @public
     */
    objectRef: SFDC_Object;
    /**
     * @description Is tgis field custom or standard
     * @type {boolean}
     * @public
     */
    isCustom: boolean;
    /**
     * @description Tooltip
     * @type {string}
     * @public
     */
    tooltip: string;
    /**
     * @description Type of this field
     * @type {string}
     * @public
     */
    type: string;
    /**
     * @description Length of this field in addition to its type
     * @type {number}
     * @public
     */
    length: number;
    /**
     * @description Is this field unique?
     * @type {boolean}
     * @public
     */
    isUnique: boolean;
    /**
     * @description Is this field encrypted?
     * @type {boolean}
     * @public
     */
    isEncrypted: boolean;
    /**
     * @description Is this field set as an external id?
     * @type {boolean}
     * @public
     */
    isExternalId: boolean;
    /**
     * @description Is this field uses an index in the table?
     * @type {boolean}
     * @public
     */
    isIndexed: boolean;
    /**
     * @description Default value
     * @type {string}
     * @public
     */
    defaultValue: string;
    /**
     * @description If this is a picklist, is it restricted to a list of values?
     * @type {boolean}
     * @public
     */
    isRestrictedPicklist: boolean;
    /**
     * @description What is the formula of that field? (obviously only for formula field!)
     * @type {string}
     * @public
     */
    formula: string;
    /**
     * @description Only for formula field -- List of unique hard coded Salesforce URLs in the formula
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs: Array<string>;
    /**
     * @description Only for formula field -- List of unique hard coded Salesforce IDs in the formula
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs: Array<string>;
}

/**
 * @description Representation of a Field Set in Org Check
 */
interface SFDC_FieldSet extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_FieldSet;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Label
     * @type {string}
     * @public
     */
    label: string;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
}

/**
 * @description Representation of a Lightning Page in Org Check
 */
interface SFDC_LightningPage extends DataWithScoreAndDependencies {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_LightningPage;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Type of the Lightning Page
     * @type {string}
     * @public
     */
    type: string;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Identifier of the related object for this page (if any)
     * @type {string}
     * @public
     */
    objectId: string;
    /**
     * @description Reference of the related object for this page (if any)
     * @type {SFDC_Object}
     * @public
     */
    objectRef: SFDC_Object;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Number of related lists on this page
     * @type {number}
     * @public
     */
    nbRelatedLists: number;
    /**
     * @description Indicates if the attachment related list is directly included on this page
     * @type {boolean}
     * @public
     */
    isAttachmentRelatedListIncluded: boolean;
    /**
     * @description Indicates if the related list from the page layout is included on this page
     * @type {boolean}
     * @public
     */
    isRelatedListFromPageLayoutIncluded: boolean;
    /**
     * @description Number of components on this page
     * @type {number}
     * @public
     */
    nbComponents: number;
    /**
     * @description Number of fields used on this page
     * @type {number}
     * @public
     */
    nbFields: number;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
}

/**
 * @description Representation of a SObject Limit in Org Check
 */
interface SFDC_Limit extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Limit;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Label of this limit
     * @type {string}
     * @public
     */
    label: string;
    /**
     * @description Remaining count for this limit
     * @type {number}
     * @public
     */
    remaining: number;
    /**
     * @description Maximum count allowed for this limit
     * @type {number}
     * @public
     */
    max: number;
    /**
     * @description Currently used count for this limit
     * @type {number}
     * @public
     */
    used: number;
    /**
     * @description Percentage of used limit
     * @type {number}
     * @public
     */
    usedPercentage: number;
    /**
     * @description Technical name of that limit
     * @type {string}
     * @public
     */
    type: string;
}

interface SFDC_ObjectRelationShip extends DataWithoutScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_ObjectRelationShip;
    /**
    * @description Name
    * @type {string}
    * @public
    */
    name: string;
    /**
     * @description Child object
     * @type {string}
     * @public
     */
    childObject: string;
    /**
     * @description Field that support the lookup in the parent object
     * @type {string}
     * @public
     */
    fieldName: string;
    /**
     * @description Is cascade delete enabled?
     * @type {boolean}
     * @public
     */
    isCascadeDelete: boolean;
    /**
     * @description Is restricted delete enabled?
     * @type {boolean}
     * @public
     */
    isRestrictedDelete: boolean;
}

interface SFDC_ObjectType extends DataWithoutScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_ObjectType;
    /**
    * @description Technical representation of this type
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Label of the type
     * @type {string}
     * @public
     */
    label: string;
}

interface SFDC_PageLayout extends DataWithScoreAndDependencies {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_PageLayout;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type: string;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Object Id of this page layout
     * @type {string}
     * @public
     */
    objectId: string;
    /**
     * @description Object reference of this page layout
     * @type {SFDC_Object}
     * @public
     */
    objectRef: SFDC_Object;
    /**
     * @description Number of profiles assigned to this page layout
     * @type {number}
     * @public
     */
    profileAssignmentCount: number;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Number of related lists on this page layout
     * @type {number}
     * @public
     */
    nbRelatedLists: number;
    /**
     * @description Indicates if the attachment related list is included on this page layout
     * @type {boolean}
     * @public
     */
    isAttachmentRelatedListIncluded: boolean;
    /**
     * @description Number of fields on this page layout
     * @type {number}
     * @public
     */
    nbFields: number;
}

interface SFDC_RecordType extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_RecordType;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Developer Name
     * @type {string}
     * @public
     */
    developerName: string;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive: boolean;
    /**
     * @description Is this record type available?
     * @type {boolean}
     * @public
     */
    isAvailable: boolean;
    /**
     * @description Is this the default record type?
     * @type {boolean}
     * @public
     */
    isDefault: boolean;
    /**
     * @description Is this the master record type?
     * @type {boolean}
     * @public
     */
    isMaster: boolean;
    /**
     * @description Object Id of thid record type
     * @type {string}
     * @public
     */
    objectId: string;
    /**
     * @description Object reference of this record type
     * @type {SFDC_Object}
     * @public
     */
    objectRef: SFDC_Object;
}

interface SFDC_ValidationRule extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_ValidationRule;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive: boolean;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Field where to show the error message if any
     * @type {string}
     * @public
     */
    errorDisplayField: string;
    /**
     * @description Error message
     * @type {string}
     * @public
     */
    errorMessage: string;
    /**
     * @description Salesforce Id of the sObject where this field is defined
     * @type {string}
     * @public
     */
    objectId: string;
    /**
     * @description Reference of the object for this rule
     * @type {SFDC_Object}
     * @public
     */
    objectRef: SFDC_Object;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
}

interface SFDC_WebLink extends DataWithScoreAndDependencies {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_WebLink;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs: Array<string>;
    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs: Array<string>;
    /**
     * @description Type of the link
     * @type {string}
     * @public
     */
    type: string;
    /**
     * @description Behavior of the link
     * @type {string}
     * @public
     */
    behavior: string;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Identifier of the object for this trigger
     * @type {string}
     * @public
     */
    objectId: string;
    /**
     * @description Reference of the object for this trigger
     * @type {SFDC_Object}
     * @public
     */
    objectRef: SFDC_Object;
}

interface SFDC_Workflow extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Workflow;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Direct actions associated with this item
     * @type {Array<any>}
     * @public
     */
    actions: Array<any>;
    /**
     * @description Future actions associated with this item
     * @type {Array<any>}
     * @public
     */
    futureActions: Array<any>;
    /**
     * @description Empty time triggers associated with this item
     * @type {Array<any>}
     * @public
     */
    emptyTimeTriggers: Array<any>;
    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive: boolean;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description True if this item has at least one action associated with it
     * @type {boolean}
     * @public
     */
    hasAction: boolean;
}

/**
 * @description Representation of as SObject in Org Check
 */
interface SFDC_Object extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Object;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Label of this object
     * @type {string}
     * @public
     */
    label: string;
    /**
     * @description Plural label of this object
     * @type {string}
     * @public
     */
    labelPlural: string;
    /**
     * @description Whether this object is custom or not
     * @type {boolean}
     * @public
     */
    isCustom: boolean;
    /**
     * @description Whether this object has feed enabled or not
     * @type {boolean}
     * @public
     */
    isFeedEnabled: boolean;
    /**
     * @description Whether this object has MRU enabled or not
     * @type {boolean}
     * @public
     */
    isMostRecentEnabled: boolean;
    /**
     * @description Whether this object has search enabled or not
     * @type {boolean}
     * @public
     */
    isSearchable: boolean;
    /**
     * @description Prefix for this object (the three first digits of every record's salesforce id from this sobject)
     * @type {string}
     * @public
     */
    keyPrefix: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description API name
     * @type {string}
     * @public
     */
    apiname: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Id of the type of this object
     * @type {string}
     * @public
     */
    typeId: string;
    /**
     * @description Reference of the type of this object
     * @type {SFDC_ObjectType}
     * @public
     */
    typeRef: SFDC_ObjectType;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description External OWD
     * @type {string}
     * @public
     */
    externalSharingModel: string;
    /**
     * @description Internal OWD
     * @type {string}
     * @public
     */
    internalSharingModel: string;
    /**
     * @description List of Apex Triggers ids for this object
     * @type {Array<string>}
     * @public
     */
    apexTriggerIds: Array<string>;
    /**
     * @description Corresponding Apex Trigger references fot this object
     * @type {Array<SFDC_ApexTrigger>}
     * @public
     */
    apexTriggerRefs: Array<SFDC_ApexTrigger>;
    /**
     * @description Number of apex triggers (active or not) for this object
     * @type {number}
     * @public
     */
    nbApexTriggers: number;
    /**
     * @description List of field Sets for this object
     * @type {Array<SFDC_FieldSet>}
     * @public
     */
    fieldSets: Array<SFDC_FieldSet>;
    /**
     * @description List of layouts for this object
     * @type {Array<SFDC_PageLayout>}
     * @public
     */
    layouts: Array<SFDC_PageLayout>;
    /**
     * @description Number of page layouts for this object
     * @type {number}
     * @public
     */
    nbPageLayouts: number;
    /**
     * @description List of Ligthning Pages for this object
     * @type {Array<SFDC_LightningPage>}
     * @public
     */
    flexiPages: Array<SFDC_LightningPage>;
    /**
     * @description Limits for this object
     * @type {Array<SFDC_Limit>}
     * @public
     */
    limits: Array<SFDC_Limit>;
    /**
     * @description List of validation rules for this object
     * @type {Array<SFDC_ValidationRule>}
     * @public
     */
    validationRules: Array<SFDC_ValidationRule>;
    /**
     * @description Number of validation rules for this object
     * @type {number}
     * @public
     */
    nbValidationRules: number;
    /**
     * @description List of web links for this object
     * @type {Array<SFDC_WebLink>}
     * @public
     */
    webLinks: Array<SFDC_WebLink>;
    /**
     * @description List of standard fields for this object
     * @type {Array<SFDC_Field>}
     * @public
     */
    standardFields: Array<SFDC_Field>;
    /**
     * @description List of custom field Ids for this object
     * @type {Array<string>}
     * @public
     */
    customFieldIds: Array<string>;
    /**
     * @description Number of custom fields for this object
     * @type {number}
     * @public
     */
    nbCustomFields: number;
    /**
     * @description List of custom field references for this object
     * @type {Array<SFDC_Field>}
     * @public
     */
    customFieldRefs: Array<SFDC_Field>;
    /**
     * @description List of record types for this object
     * @type {Array<SFDC_RecordType>}
     * @public
     */
    recordTypes: Array<SFDC_RecordType>;
    /**
     * @description Number of record types for this object
     * @type {number}
     * @public
     */
    nbRecordTypes: number;
    /**
     * @description List of Workflow Rules ids for this object
     * @type {Array<string>}
     * @public
     */
    workflowRuleIds: Array<string>;
    /**
     * @description Corresponding Workflow Rules references fot this object
     * @type {Array<SFDC_Workflow>}
     * @public
     */
    workflowRuleRefs: Array<SFDC_Workflow>;
    /**
     * @description Number of workflow rules for this object
     * @type {number}
     * @public
     */
    nbWorkflowRules: number;
    /**
     * @description List of relationships for this object
     * @type {Array<SFDC_ObjectRelationShip>}
     * @public
     */
    relationships: Array<SFDC_ObjectRelationShip>;
    /**
     * @description Number of records for this object (including deleted ones)
     * @type {number}
     * @public
     */
    recordCount: number;
}

/**
 * @description Representation of an Apex Trigger in Org Check
 */
interface SFDC_ApexTrigger extends DataWithScoreAndDependencies {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_ApexTrigger;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion: number;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Number of characters used in the class (without comments)
     * @type {number}
     * @public
     */
    length: number;
    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive: boolean;
    /**
     * @description Is this trigger before insert or not?
     * @type {boolean}
     * @public
     */
    beforeInsert: boolean;
    /**
     * @description Is this trigger after insert or not?
     * @type {boolean}
     * @public
     */
    afterInsert: boolean;
    /**
     * @description Is this trigger before update or not?
     * @type {boolean}
     * @public
     */
    beforeUpdate: boolean;
    /**
     * @description Is this trigger after update or not?
     * @type {boolean}
     * @public
     */
    afterUpdate: boolean;
    /**
     * @description Is this trigger before delete or not?
     * @type {boolean}
     * @public
     */
    beforeDelete: boolean;
    /**
     * @description Is this trigger after delete or not?
     * @type {boolean}
     * @public
     */
    afterDelete: boolean;
    /**
     * @description Is this trigger after undelete or not?
     * @type {boolean}
     * @public
     */
    afterUndelete: boolean;
    /**
     * @description Identifier of the object for this trigger
     * @type {string}
     * @public
     */
    objectId: string;
    /**
     * @description Reference of the object for this trigger
     * @type {SFDC_Object}
     * @public
     */
    objectRef: SFDC_Object;
    /**
     * @description Is this trigger containing SOQL statement?
     * @type {boolean}
     * @public
     */
    hasSOQL: boolean;
    /**
     * @description Is this trigger containing DML statement?
     * @type {boolean}
     * @public
     */
    hasDML: boolean;
    /**
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs: Array<string>;
    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs: Array<string>;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
}

/**
 * @description Representation of a browser used by salesforce users while visiting the "Application" in this org
 */
interface SFDC_Browser extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Browser;
    /**
    * @description full name of the browser as it appears in LoginHistory (name + version)
    * @type {string}
    * @public
    */
    fullName: string;
    /**
     * @description Name of the browser
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Version (as a number) of the browser
     * @type {number}
     * @public
     */
    version: number;
    /**
     * @description Number of "application" logins with this browser in LoginHistory
     * @type {number}
     * @public
     */
    nbApplicationLogin: number;
}

interface SFDC_CollaborationGroup extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_CollaborationGroup;
    /**
    * @description Unique identifier of this group in the org.
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name of this group in the org.
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Description of this group in the org.
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs: Array<string>;
    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs: Array<string>;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Url to the group in the setup of the org.
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Name of the package where this group is stored.
     * @type {string}
     * @public
     */
    package: string;
}

/**
 * @description Representation of a Custom Label in Org Check
 */
interface SFDC_CustomLabel extends DataWithScoreAndDependencies {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_CustomLabel;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Label
     * @type {string}
     * @public
     */
    label: string;
    /**
     * @description Category
     * @type {string}
     * @public
     */
    category: string;
    /**
     * @description Is this item protected?
     * @type {boolean}
     * @public
     */
    isProtected: boolean;
    /**
     * @description Language code for the label
     * @type {string}
     * @public
     */
    language: string;
    /**
     * @description Value
     * @type {string}
     * @public
     */
    value: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
}

interface SFDC_Document extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Document;
    /**
    * @description Unique identifier of this document in the org.
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name of the document.
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description URL to the document in the org.
     * @type {string}
     * @public
     */
    documentUrl: string;
    /**
     * @description Is the url of this document is a hard coded value
     * @type {boolean}
     * @public
     */
    isHardCodedURL: boolean;
    /**
     * @description Size of the document in bytes.
     * @type {number}
     * @public
     */
    size: number;
    /**
     * @description Type of the document (e.g. PDF, Word, etc.).
     * @type {string}
     * @public
     */
    type: string;
    /**
     * @description Description of the document.
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Name of the folder where this document is stored.
     * @type {string}
     * @public
     */
    folderName: string;
    /**
     * @description Unique identifier of the folder where this document is stored.
     * @type {string}
     * @public
     */
    folderId: string;
    /**
     * @description Url to the document in the setup of the org.
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Name of the package where this document is stored.
     * @type {string}
     * @public
     */
    package: string;
}

interface SFDC_EmailTemplate extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_EmailTemplate;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Type of the UI this item is used in
     * @type {string}
     * @public
     */
    uiType: string;
    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type: string;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs: Array<string>;
    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs: Array<string>;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Description of the document.
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Id of the folder this email template is in
     * @type {string}
     * @public
     */
    folderId: string;
    /**
     * @description Name of the folder this email template is in
     * @type {string}
     * @public
     */
    folderName: string;
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion: number;
    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive: boolean;
    /**
     * @description Date of the last time this email template was used.
     * @type {number}
     * @public
     */
    lastUsedDate: number;
    /**
     * @description Number of time this email template was used.
     * @type {number}
     * @public
     */
    timesUsed: number;
}

/**
 * Represents a Flow Definition and its Flow Version children
 */
interface SFDC_Flow extends DataWithScoreAndDependencies {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Flow;
    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion: number;
    /**
     * @description Salesforce Id of the current flow version being used by this flow
     * @type {string}
     * @public
     */
    currentVersionId: string;
    /**
     * @description Reference of the current flow version being used by this flow
     * @type {SFDC_FlowVersion}
     * @public
     */
    currentVersionRef: SFDC_FlowVersion;
    /**
     * @description Is the current flow version of this flow is the latest version of this flow?
     * @type {boolean}
     * @public
     */
    isLatestCurrentVersion: boolean;
    /**
     * @description Is the version active?
     * @type {boolean}
     * @public
     */
    isVersionActive: boolean;
    /**
     * @description Count of versions for this flow
     * @type {number}
     * @public
     */
    versionsCount: number;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Type of this flow
     * @type {string}
     * @public
     */
    type: string;
    /**
     * @description Is this a PB or not?
     * @type {boolean}
     * @public
     */
    isProcessBuilder: boolean;
    /**
     * @description Is this a screen flow or not?
     * @type {boolean}
     * @public
     */
    isScreenFlow: boolean;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
}
/**
 * Represents a Flow Version
 */
interface SFDC_FlowVersion extends DataWithoutScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_FlowVersion;
    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description API Version (as a string) set in the metadata for this item.
     * @type {string}
     * @public
     */
    version: string;
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion: number;
    /**
     * @description Number of nodes in this flow version
     * @type {number}
     * @public
     */
    totalNodeCount: number;
    /**
     * @description Number of nodes in this flow version of DML Create type
     * @type {number}
     * @public
     */
    dmlCreateNodeCount: number;
    /**
     * @description Number of nodes in this flow version of DML Delete type
     * @type {number}
     * @public
     */
    dmlDeleteNodeCount: number;
    /**
     * @description Number of nodes in this flow version of DML Update type
     * @type {number}
     * @public
     */
    dmlUpdateNodeCount: number;
    /**
     * @description Number of nodes in this flow version of Screen type
     * @type {number}
     * @public
     */
    screenNodeCount: number;
    /**
     * @description Is this item active or not?
     * @type {boolean}
     * @public
     */
    isActive: boolean;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type: string;
    /**
     * @description Is this a PB or not?
     * @type {boolean}
     * @public
     */
    isProcessBuilder: boolean;
    /**
     * @description Is this a screen flow or not?
     * @type {boolean}
     * @public
     */
    isScreenFlow: boolean;
    /**
     * @description Running mode of this flow version
     * @type {string}
     * @public
     */
    runningMode: string;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Name of the optional sobject this flow version is related to
     * @type {string}
     * @public
     */
    sobject: string;
    /**
     * @description Trigger type of this flow version (optional)
     * @type {string}
     * @public
     */
    triggerType: string;
    /**
     * @description Record trigger type of this flow version (optional)
     * @type {string}
     * @public
     */
    recordTriggerType: string;
    /**
     * @description LFS Violations (list of rule names) for this flow version
     * @type {Array<string>}
     * @public
     */
    lfsViolations: Array<string>;
}

interface SFDC_PermissionSet extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_PermissionSet;
    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description License type of this item
     * @type {string}
     * @public
     */
    license: string;
    /**
     * @description Whether this item is a custom item
     * @type {boolean}
     * @public
     */
    isCustom: boolean;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Number of users assigned to this permission set
     * @type {number}
     * @public
     */
    memberCounts: number;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Number of field permissions
     * @type {number}
     * @public
     */
    nbFieldPermissions: number;
    /**
     * @description Number of object permissions
     * @type {number}
     * @public
     */
    nbObjectPermissions: number;
    /**
     * @description Type of this item
     * @type {number}
     * @public
     */
    type: number;
    /**
     * @description Number of sensitive system permissions in this permission set (like view all data etc..)
     * @type {{apiEnabled: boolean, viewSetup: boolean, modifyAllData: boolean, viewAllData: boolean, manageUsers: boolean, customizeApplication: boolean}}
     * @public
     */
    importantPermissions: {
        apiEnabled: boolean;
        viewSetup: boolean;
        modifyAllData: boolean;
        viewAllData: boolean;
        manageUsers: boolean;
        customizeApplication: boolean;
    };
    /**
     * @description True if this permission set is admin-like (has some powerful permissions)
     * @type {boolean}
     * @public
     */
    isAdminLike: boolean;
    /**
    * @description Is this a Permission Set Group
    * @type {boolean}
    * @public
    */
    isGroup: boolean;
    /**
     * @description Corresponding Permission Set Group Salesforce Id, if this item is a Permission Set Group
     * @type {string}
     * @public
     */
    groupId: string;
    /**
     * @description True if all the permission set groups including this permission set are empty
     * @type {boolean}
     * @public
     */
    allIncludingGroupsAreEmpty: boolean;
    /**
     * @description List of permission set Salesforce Ids associated with the current group (if it's a group!)
     * @type {Array<string>}
     * @public
     */
    permissionSetIds: Array<string>;
    /**
     * @description Corresponding references of the permission sets associated with the current group (if it's a group!)
     * @type {Array<SFDC_PermissionSet>}
     * @public
     */
    permissionSetRefs: Array<SFDC_PermissionSet>;
    /**
     * @description List of permission set group Salesforce Ids that include the current permission set (if it's NOT a group!)
     * @type {Array<string>}
     * @public
     */
    permissionSetGroupIds: Array<string>;
    /**
     * @description Corresponding references of the permission set groups that include the current permission set (if it's NOT a group!)
     * @type {Array<SFDC_PermissionSet>}
     * @public
     */
    permissionSetGroupRefs: Array<SFDC_PermissionSet>;
}

interface SFDC_Profile extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Profile;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description License type of this item
     * @type {string}
     * @public
     */
    license: string;
    /**
     * @description Whether this item is a custom item
     * @type {boolean}
     * @public
     */
    isCustom: boolean;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Number of users assigned to this profile
     * @type {number}
     * @public
     */
    memberCounts: number;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Number of field permissions
     * @type {number}
     * @public
     */
    nbFieldPermissions: number;
    /**
     * @description Number of object permissions
     * @type {number}
     * @public
     */
    nbObjectPermissions: number;
    /**
     * @description Type of this item
     * @type {number}
     * @public
     */
    type: number;
    /**
     * @description Number of sensitive system permissions in this profile (like view all data etc..)
     * @type {{apiEnabled: boolean, viewSetup: boolean, modifyAllData: boolean, viewAllData: boolean, manageUsers: boolean, customizeApplication: boolean}}
     * @public
     */
    importantPermissions: {
        apiEnabled: boolean;
        viewSetup: boolean;
        modifyAllData: boolean;
        viewAllData: boolean;
        manageUsers: boolean;
        customizeApplication: boolean;
    };
    /**
     * @description True if this profile is admin-like (has some powerful permissions)
     * @type {boolean}
     * @public
     */
    isAdminLike: boolean;
}

interface SFDC_User extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_User;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Datetime of the last login of that user. Undefined if never logged in.
     * @type {number}
     * @public
     */
    lastLogin: number;
    /**
     * @description Number of failed logins
     * @type {number}
     * @public
     */
    numberFailedLogins: number;
    /**
     * @description Is this user on the Lightning Experience?
     * @type {boolean}
     * @public
     */
    onLightningExperience: boolean;
    /**
     * @description When this user changed its password for the last time. Undefined if never changed.
     * @type {number}
     * @public
     */
    lastPasswordChange: number;
    /**
     * @description Profile salesforce id of this user
     * @type {string}
     * @public
     */
    profileId: string;
    /**
     * @description Crresponding Profile reference used by this user
     * @type {SFDC_Profile}
     * @public
     */
    profileRef: SFDC_Profile;
    /**
     * @description Set of sensible system permissions granted to this users (like view all etc.)
     * @type {{apiEnabled: boolean, viewSetup: boolean, modifyAllData: boolean, viewAllData: boolean, manageUsers: boolean, customizeApplication: boolean}}
     * @public
     */
    importantPermissions: {
        apiEnabled: boolean;
        viewSetup: boolean;
        modifyAllData: boolean;
        viewAllData: boolean;
        manageUsers: boolean;
        customizeApplication: boolean;
    };
    /**
     * @description Set of sensible system permissions along with the Profile or PermSet that grants them to this users (like view all etc.)
     * @type {{apiEnabled: Array<SFDC_Profile>, viewSetup: Array<SFDC_Profile>, modifyAllData: Array<SFDC_Profile>, viewAllData: Array<SFDC_Profile>, manageUsers: Array<SFDC_Profile>, customizeApplication: Array<SFDC_Profile>}}
     * @public
     */
    importantPermissionsGrantedBy: {
        apiEnabled: Array<SFDC_Profile>;
        viewSetup: Array<SFDC_Profile>;
        modifyAllData: Array<SFDC_Profile>;
        viewAllData: Array<SFDC_Profile>;
        manageUsers: Array<SFDC_Profile>;
        customizeApplication: Array<SFDC_Profile>;
    };
    /**
     * @description Is this user admin-like (has some powerful permissions)
     * @type {boolean}
     * @public
     */
    isAdminLike: boolean;
    /**
     * @description Does this user have MFA bypass activated
     * @type {boolean}
     * @public
     */
    hasMfaByPass: boolean;
    /**
     * @description Does this user have debug mode activated
     * @type {boolean}
     * @public
     */
    hasDebugMode: boolean;
    /**
     * @description List of permission set ids assigned to this user
     * @type {Array<string>}
     * @public
     */
    permissionSetIds: Array<string>;
    /**
     * @description List of permission set references assigned to this user
     * @type {Array<SFDC_PermissionSet>}
     * @public
     */
    permissionSetRefs: Array<SFDC_PermissionSet>;
    /**
     * @description Number of direct logins to salesforce
     * @type {number}
     * @public
     */
    nbDirectLogins: number;
    /**
     * @description Number of direct logins without using MFA
     * @type {number}
     * @public
     */
    nbDirectLoginsWithoutMFA: number;
    /**
     * @description Number of direct logins with using MFA
     * @type {number}
     * @public
     */
    nbDirectLoginsWithMFA: number;
    /**
     * @description Number of indirect logins via SSO
     * @type {number}
     * @public
     */
    nbSSOLogins: number;
}

/**
 * @description Representation of a User Group in Org Check
 */
interface SFDC_Group extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Group;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Developer Name
     * @type {string}
     * @public
     */
    developerName: string;
    /**
     * @description Does it include bosses?
     * @type {boolean}
     * @public
     */
    includeBosses: boolean;
    /**
     * @description Does it include subordinates?
     * @type {boolean}
     * @public
     */
    includeSubordinates: boolean;
    /**
     * @description Salesfiorce Id of the related entity for this "box"
     * @type {string}
     * @public
     */
    relatedId: string;
    /**
     * @description Count of direct members (regardless if there are users or groups or roles etc.)
     * @type {number}
     * @public
     */
    nbDirectMembers: number;
    /**
     * @description List of direct user ids
     * @type {Array<string>}
     * @public
     */
    directUserIds: Array<string>;
    /**
     * @description List of direct user references
     * @type {Array<SFDC_User>}
     * @public
     */
    directUserRefs: Array<SFDC_User>;
    /**
     * @description List of direct group ids
     * @type {Array<string>}
     * @public
     */
    directGroupIds: Array<string>;
    /**
     * @description List of direct group references
     * @type {Array<SFDC_Group>}
     * @public
     */
    directGroupRefs: Array<SFDC_Group>;
    /**
     * @description Is this a public group?
     * @type {boolean}
     * @public
     */
    isPublicGroup: boolean;
    /**
     * @description Is this a queue?
     * @type {boolean}
     * @public
     */
    isQueue: boolean;
    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type: string;
}

interface SFDC_HomePageComponent extends DataWithScoreAndDependencies {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_HomePageComponent;
    /**
     * @description Unique identifier of this page in the org.
     * @type {string}
     * @public
     */
    id: string;
    /**
     * @description Name of this page in the org.
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Is this item has an empty body?
     * @type {boolean}
     * @public
     */
    isBodyEmpty: boolean;
    /**
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs: Array<string>;
    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs: Array<string>;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Url to the group in the setup of the org.
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Name of the package where this page is stored.
     * @type {string}
     * @public
     */
    package: string;
}

interface SFDC_KnowledgeArticle extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_KnowledgeArticle;
    /**
    * @description Unique identifier of this article in the org.
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Current version id published for this article.
     * @type {string}
     * @public
     */
    versionId: string;
    /**
     * @description Article number
     * @type {string}
     * @public
     */
    number: string;
    /**
     * @description Is the url of this document is a hard coded value
     * @type {boolean}
     * @public
     */
    isHardCodedURL: boolean;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Url to the article in the setup of the org.
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Title of this article
     * @type {string}
     * @public
     */
    title: string;
    /**
     * @description Url tto this article
     * @type {string}
     * @public
     */
    urlName: string;
    /**
     * @description Publish Status of this article
     * @type {string}
     * @public
     */
    status: string;
}

/**
 * @description Representation of a Lightning Aura Component in Org Check
 */
interface SFDC_LightningAuraComponent extends DataWithScoreAndDependencies {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_LightningAuraComponent;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion: number;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
}

/**
 * @description Representation of a Lightning Web Component in Org Check
 */
interface SFDC_LightningWebComponent extends DataWithScoreAndDependencies {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_LightningWebComponent;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion: number;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
}

interface SFDC_Organization extends DataWithoutScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Organization;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type: string;
    /**
     * @description Is this organization a Developer Edition enviroment?
     * @type {boolean}
     * @public
     */
    isDeveloperEdition: boolean;
    /**
     * @description Is this organization a Sandbox environment?
     * @type {boolean}
     * @public
     */
    isSandbox: boolean;
    /**
     * @description Is this organization a Trial environment?
     * @type {boolean}
     * @public
     */
    isTrial: boolean;
    /**
     * @description Is this organization a Production environment?
     * @type {boolean}
     * @public
     */
    isProduction: boolean;
    /**
     * @description Local namespace of this organization
     * @type {string}
     * @public
     */
    localNamespace: string;
}

interface SFDC_Package extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Package;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Namespace
     * @type {string}
     * @public
     */
    namespace: string;
    /**
     * @description Type of this item
     * @type {string}
     * @public
     */
    type: string;
}

interface SFDC_PermissionSetLicense extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_PermissionSetLicense;
    /**
    * @description Salesforce Id of this item
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Total count of licenses
     * @type {number}
     * @public
     */
    totalCount: number;
    /**
     * @description Used count of licenses
     * @type {number}
     * @public
     */
    usedCount: number;
    /**
     * @description Percentage of used licenses
     * @type {number}
     * @public
     */
    usedPercentage: number;
    /**
     * @description Remaining count of licenses
     * @type {number}
     * @public
     */
    remainingCount: number;
    /**
     * @description Salesforce Id of the permission set associated with the current license
     * @type {Array<string>}
     * @public
     */
    permissionSetIds: Array<string>;
    /**
     * @description Corresponding references of the permission set associated with the current license
     * @type {Array<SFDC_PermissionSet>}
     * @public
     */
    permissionSetRefs: Array<SFDC_PermissionSet>;
    /**
     * @description Number of distinct users assigned to the permission set license
     * @type {number}
     * @public
     */
    distinctActiveAssigneeCount: number;
    /**
     * @description Status of the permission set license
     * @type {string}
     * @public
     */
    status: string;
    /**
     * @description Expiration date of the permission set license
     * @type {number}
     * @public
     */
    expirationDate: number;
    /**
     * @description Is the permission set license available for integrations
     * @type {boolean}
     * @public
     */
    isAvailableForIntegrations: boolean;
    /**
     * @description Created date of the permission set license
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Last modified date of the permission set license
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
}

interface SFDC_ProfilePasswordPolicy extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_ProfilePasswordPolicy;
    /**
    * @description The duration of the login lockout, in minutes. If users are locked out, they
    *                  must wait until the lockout period expires. Valid values: 0, 15, 30, 60
    * @type {number}
    * @public
    */
    lockoutInterval: number;
    /**
     * @description The number of times a user can enter a wrong password before getting locked
     *                  out. Valid values: 0, 3, 5, 10.
     * @type {number}
     * @public
     */
    maxLoginAttempts: number;
    /**
     * @description Minimum number of characters required for a password. Valid values: 5–50.
     * @type {number}
     * @public
     */
    minimumPasswordLength: number;
    /**
     * @description If true, a user cannot change a password more than once in a 24-hour period.
     * @type {boolean}
     * @public
     */
    minimumPasswordLifetime: boolean;
    /**
     * @description If true, answers to security questions are hidden as the user types.
     * @type {boolean}
     * @public
     */
    obscure: boolean;
    /**
     * @description Level of complexity required for the character types in a user’s password.
     *                  If 0, the password can contain any type of character.
     *                  If 1, the password must contain at least one alphabetic character and 1 number.
     *                  If 2, the password must contain at least one alphabetic character, one number,
     *                      and one of the following special characters: ! # $ % - _ = + < >.
     *                  If 3, the password must contain at least one number, one uppercase letter, and
     *                      one lowercase letter.
     *                  If 4, the password must contain at least one number, one uppercase letter, one
     *                      lowercase letter, and one of the following special
     *                      characters: ! # $ % - _ = + < >.
     * @type {number}
     * @public
     */
    passwordComplexity: number;
    /**
     * @description Number of days until user passwords expire and must be changed. Valid values:
     *                  0 (If set to 0, the password never expires), 30, 60, 90, 180 or 365
     * @type {number}
     * @public
     */
    passwordExpiration: number;
    /**
     * @description Number of previous passwords to save. Saving passwords is required to ensure
     *                  that users reset their password to a new, unique password. This value must
     *                  be set before a password reset succeeds. If 0, passwordExpiration must
     *                  be set to 0.
     * @type {number}
     * @public
     */
    passwordHistory: number;
    /**
     * @description If set to true, the answer to the password hint cannot contain the password itself.
     *                  If false, the answer has no restrictions.
     * @type {boolean}
     * @public
     */
    passwordQuestion: boolean;
    /**
     * @description Name of the associated user profile.
     * @type {string}
     * @public
     */
    profileName: string;
}

interface SFDC_ProfileRestrictions extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_ProfileRestrictions;
    /**
    * @description Salesforce Id of the corresponding Profile
    * @type {string}
    * @public
    */
    profileId: string;
    /**
     * @description Reference to the corresponding Profile
     * @type {SFDC_Profile}
     * @public
     */
    profileRef: SFDC_Profile;
    /**
     * @description IP Range Restriction list for this profile
     * @type {Array<SFDC_ProfileIpRangeRestriction>}
     * @public
     */
    ipRanges: Array<SFDC_ProfileIpRangeRestriction>;
    /**
     * @description Login Hour Restriction list for this profile
     * @type {Array<SFDC_ProfileLoginHourRestriction>}
     * @public
     */
    loginHours: Array<SFDC_ProfileLoginHourRestriction>;
}
interface SFDC_ProfileIpRangeRestriction extends DataWithoutScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_ProfileIpRangeRestriction;
    /**
    * @description Start IP address
    * @type {string}
    * @public
    */
    startAddress: string;
    /**
     * @description End IP address
     * @type {string}
     * @public
     */
    endAddress: string;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Number of IP addresses in this range (= end - start)
     * @type {number}
     * @public
     */
    difference: number;
}
interface SFDC_ProfileLoginHourRestriction extends DataWithoutScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_ProfileLoginHourRestriction;
    /**
    * @description Starting hour of the restriction (HH:MM format)
    * @type {string}
    * @public
    */
    fromTime: string;
    /**
     * @description Ending hour of the restriction (HH:MM format)
     * @type {string}
     * @public
     */
    toTime: string;
    /**
     * @description Label of the week day
     * @type {string}
     * @public
     */
    day: string;
    /**
     * @description Number of hours in this range (= toTime - fromTime)
     * @type {number}
     * @public
     */
    difference: number;
}

interface SFDC_Report extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Report;
    /**
    * @description Unique identifier of this report in the org.
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name of the report.
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Developer name of the report.
     * @type {string}
     * @public
     */
    developerName: string;
    /**
     * @description Format of the report (e.g. Tabular, Summary, Matrix, Joined).
     * @type {string}
     * @public
     */
    format: string;
    /**
     * @description Description of the report.
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Date/Time when this report was last run in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastRunDate: number;
    /**
     * @description Date/Time when this report was last viewed in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastViewedDate: number;
    /**
     * @description Date/Time when this report was last referenced in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastReferencedDate: number;
    /**
     * @description Name of the folder where this report is stored.
     * @type {string}
     * @public
     */
    folderName: string;
    /**
     * @description Url to the report in the setup of the org.
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Name of the package where this report is stored.
     * @type {string}
     * @public
     */
    package: string;
}

interface SFDC_StaticResource extends DataWithScoreAndDependencies {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_StaticResource;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Content type of this item
     * @type {string}
     * @public
     */
    contentType: string;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
}

interface SFDC_UserRole extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_UserRole;
    /**
     * @description Salesforce Id
     * @type {string}
     * @public
     */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description API Name
     * @type {string}
     * @public
     */
    apiname: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Salesforce Id of the related parent Role
     * @type {string}
     * @public
     */
    parentId: string;
    /**
     * @description The related parent reference
     * @type {SFDC_UserRole}}
     * @public
     */
    parentRef: SFDC_UserRole;
    /**
     * @description Level of this role in the global role hierarchy
     * @type {number}
     * @public
     */
    level: number;
    /**
     * @description Is this role a parent?
     * @type {boolean}
     * @public
     */
    hasParent: boolean;
    /**
     * @description Number of active members in this role
     * @type {number}
     * @public
     */
    activeMembersCount: number;
    /**
     * @description Array of active member user ids
     * @type {Array<string>}
     * @public
     */
    activeMemberIds: Array<string>;
    /**
     * @description Array of active member user references
     * @type {Array<SFDC_User>}
     * @public
     */
    activeMemberRefs: Array<SFDC_User>;
    /**
     * @description Does this role have active members?
     * @type {boolean}
     * @public
     */
    hasActiveMembers: boolean;
}

interface SFDC_VisualForceComponent extends DataWithScoreAndDependencies {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_VisualForceComponent;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion: number;
    /**
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs: Array<string>;
    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs: Array<string>;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
}

interface SFDC_VisualForcePage extends DataWithScoreAndDependencies {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_VisualForcePage;
    /**
    * @description Salesforce Id
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion: number;
    /**
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs: Array<string>;
    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs: Array<string>;
    /**
     * @description Is this page ready for mobile?
     * @type {boolean}
     * @public
     */
    isMobileReady: boolean;
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package: string;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url: string;
}

interface SFDC_CustomTab extends DataWithScoreAndDependencies {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_CustomTab;
    /**
    * @description Unique identifier of this custom tab in the org.
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Name of this custom tab in the org.
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Type of this custom tab
     * @type {string}
     * @public
     */
    type: string;
    /**
     * @description Full description of that item
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Unique list of hard coded Salesforce URLs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedURLs: Array<string>;
    /**
     * @description Unique list of hard coded Salesforce IDs in this item
     * @type {Array<string>}
     * @public
     */
    hardCodedIDs: Array<string>;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Url to the group in the setup of the org.
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Name of the package where this page is stored.
     * @type {string}
     * @public
     */
    package: string;
}

interface SFDC_Dashboard extends DataWithScore {
    /**
     * @description Identifier of what this interface represents
     * @type {DataAliases}
     * @public
     */
    dataType: DataAliases.SFDC_Dashboard;
    /**
    * @description Unique identifier of this dashboard in the org.
    * @type {string}
    * @public
    */
    id: string;
    /**
     * @description Title of the dashboard.
     * @type {string}
     * @public
     */
    title: string;
    /**
     * @description Developer name of the dashboard.
     * @type {string}
     * @public
     */
    developerName: string;
    /**
     * @description Type of the dashboard.
     * @type {string}
     * @public
     */
    type: string;
    /**
     * @description Description of the dashboard.
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate: number;
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate: number;
    /**
     * @description Date/Time when this dashboard was last viewed in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastViewedDate: number;
    /**
     * @description Date/Time when this dashboard was last referenced in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastReferencedDate: number;
    /**
     * @description Date/Time when this dashboard's result was last refreshed in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    resultRefreshedDate: number;
    /**
     * @description Name of the folder where this dashboard is stored.
     * @type {string}
     * @public
     */
    folderName: string;
    /**
     * @description Url to the dashboard in the setup of the org.
     * @type {string}
     * @public
     */
    url: string;
    /**
     * @description Name of the package where this dashboard is stored.
     * @type {string}
     * @public
     */
    package: string;
}

interface DataCollectionStatisticsIntf {
    /**
     * @description Indicates if an error occurred while building the collection
     * @type {boolean}
     * @public
     */
    hadError: boolean;
    /**
     * @description Last error message if any
     * @type {string}
     * @public
     */
    lastErrorMessage: string;
    /**
     * @description Number of all records
     * @type {number}
     * @public
     */
    countAll: number;
    /**
     * @description Number of records that are considered "bad" (i.e. at least one bad reason id)
     * @type {number}
     * @public
     */
    countBad: number;
    /**
     * @description Number of records that are considered "good" (i.e. no bad reason ids)
     * @type {number}
     * @public
     */
    countGood: number;
    /**
     * @description Number of bad records by rule
     * @type {Array<{ruleId: number, ruleName: string, count: number}>}
     * @default []
     * @public
     */
    countBadByRule: Array<{
        ruleId: number;
        ruleName: string;
        count: number;
    }>;
    /**
     * @description List of all data items that are part of this collection
     * @type {Array<Data>}
     * @default []
     * @public
     */
    data: Array<Data>;
}

/**
 * @description Basic logger Interface for
 */
interface BasicLoggerIntf {
    /**
     * @description Check if this logger is a console fallback logger
     * @returns {boolean} true if this logger is a console fallback logger, false otherwise
     * @public
     */
    isConsoleFallback(): boolean;
    /**
     * @description The logger logs
     * @param {string} operationName - the name of the operation
     * @param {string} [message] - the message to log
     * @public
     */
    log(operationName: string, message?: string): void;
    /**
     * @description The given operation ended (with an optional message)
     * @param {string} operationName - the name of the operation
     * @param {string} [message] - the message to log
     * @public
     */
    ended(operationName: string, message?: string): void;
    /**
     * @description The given operation failed (with an optional message/error)
     * @param {string} operationName - the name of the operation
     * @param {Error | string} [error] - the error to log
     * @public
     */
    failed(operationName: string, error?: Error | string): void;
}

interface LoggerSetup extends BasicLoggerIntf {
}

interface SalesforceAuthenticationOptions {
    accessToken?: string;
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
}
interface SalesforceManagerSetup {
    connection?: any;
    authenticationOptions?: SalesforceAuthenticationOptions;
}

interface StorageSetup {
    /**
     * @description Set an item in a storage
     * @param {string} key - The key to set
     * @param {string} value - The value to set
     */
    setItem(key: string, value: string): void;
    /**
     * @description Get an item from a storage
     * @param {string} key - The key to set
     * @returns {string} The stored value for the given key
     */
    getItem(key: string): string;
    /**
     * @description Removes an item from a storage
     * @param {string} key - The key to remove
     */
    removeItem(key: string): void;
    /**
     * @description Get the nth key from a storage
     * @param {number} n - The index of the key
     * @returns {string} The nth key
     */
    key(n: number): string;
    /**
     * @description The size of a storage
     * @property
     */
    length(): number;
}

/**
 * @description Cache item interface
 */
interface DataCacheItemIntf {
    /**
     * @type {string}
     */
    name: string;
    /**
     * @type {boolean}
     */
    isEmpty: boolean;
    /**
     * @type {boolean}
     */
    isMap: boolean;
    /**
     * @type {boolean}
     */
    isArray: boolean;
    /**
     * @type {boolean}
     */
    isObject: boolean;
    /**
     * @type {number}
     */
    length: number;
    /**
     * @type {string}
     */
    created: string;
}

interface ApiSetup {
    /**
     * @description Setup for the logger
     * @type {LoggerSetup}
     * @public
     */
    logSettings: LoggerSetup;
    /**
     * @description Setup for the salesforce manager
     * @type {SalesforceManagerSetup}
     * @public
     */
    salesforce: SalesforceManagerSetup;
    /**
     * @description Setup for the storage
     * @type {StorageSetup}
     * @public
     */
    storage: StorageSetup;
}
interface ApiIntf {
    /**
     * @description String representation of the Org Check version in a form of Element [El,n]
     * @type {string}
     * @public
     */
    version: string;
    /**
     * @description Numerical representation of the Salesforce API Version we use
     * @type {number}
     * @public
     */
    salesforceApiVersion: number;
    /**
     * @description Remove all cache from dataset manager
     * @public
     */
    removeAllFromCache(): void;
    /**
     * @description Get cache information from dataset manager
     * @returns {Array<DataCacheItemIntf>} list of cache information
     * @public
     */
    getCacheInformation(): Array<DataCacheItemIntf>;
    /**
     * @description Get cache data from dataset manager
     * @param {string} itemName - the name of the cache item to get
     * @returns {any} cached data
     * @public
     */
    getCacheData(itemName: string): any;
    /**
     * @description Get the list of all Org Check "score rules" as a matrix
     * @returns {DataMatrixIntf} Information about score rules as a matrix
     * @public
     */
    getAllScoreRulesAsDataMatrix(): DataMatrixIntf;
    /**
     * @description Get the lastest Daily API Usage from JSForce, and the level of confidence we have in this ratio to continue using org check.
     * @returns {SalesforceUsageInformationIntf} Percentage of the daily api usage and a confidence precentage.
     * @public
     */
    dailyApiRequestLimitInformation: SalesforceUsageInformationIntf;
    /**
     * @description Send a request to run all tests in the org. When this method is finished, it does not mean all tests are run.
     * @returns {Promise<string>} The Salesforce Id of the AsyncApexJob
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    runAllTestsAsync(): Promise<string>;
    /**
     * @description Compile the given list of Apex Classes and return the status of the compilation
     * @param {Array<string>} apexClassIds - the list of Apex Class Ids to compile
     * @returns {Promise<Map<string, { isSuccess: boolean, reasons?: Array<string>}>>} List of results by Apex Class ID
     * @async
     * @public
     */
    compileClasses(apexClassIds: Array<string>): Promise<Map<string, {
        isSuccess: boolean;
        reasons?: Array<string>;
    }>>;
    /**
     * @description Get information about the organization
     * @returns {Promise<SFDC_Organization>} Org information to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getOrganizationInformation(): Promise<SFDC_Organization>;
    /**
     * @description Check if we can use the current org according to the terms (specially if this is a production org)
     * @returns {Promise<boolean>} true if this org can be used, false otehrwise.
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    checkUsageTerms(): Promise<boolean>;
    /**
     * @description Returns if the usage terms were accepted manually
     * @returns {boolean} true if the usage terms were accepted manually, false otherwise
     * @public
     */
    wereUsageTermsAcceptedManually(): boolean;
    /**
     * @description Accept manually the usage terms
     * @public
     */
    acceptUsageTermsManually(): void;
    /**
     * @description Check if the current user can run the application
     * @returns {Promise<boolean>} true if this user can run the application. Never returns false (see exception)
     * @throws Exception if not enough permissions to run the application
     * @async
     * @public
     */
    checkCurrentUserPermissions(): Promise<boolean>;
    /**
     * @description Get information about the packages
     * @returns {Promise<Array<SFDC_Package>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getPackages(): Promise<Array<SFDC_Package>>;
    /**
     * @description Remove all the cached information about packages
     * @public
     */
    removeAllPackagesFromCache(): void;
    /**
     * @description Get information about the page layouts
     * @param {string} namespace - the namespace of the package to filter the page layouts
     * @param {string} sobjectType - the sobject type to filter the page layouts
     * @param {string} sobject - the sobject to filter the page layouts
     * @returns {Promise<Array<SFDC_PageLayout>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getPageLayouts(namespace: string, sobjectType: string, sobject: string): Promise<Array<SFDC_PageLayout>>;
    /**
     * @description Remove all the cached information about page layouts
     * @public
     */
    removeAllPageLayoutsFromCache(): void;
    /**
     * @description Get information about the object types
     * @returns {Promise<Array<SFDC_ObjectType>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getObjectTypes(): Promise<Array<SFDC_ObjectType>>;
    /**
     * @description Get information about the objects
     * @param {string} namespace - the namespace of the package to filter the objects
     * @param {string} sobjectType - the sobject type to filter the objects
     * @returns {Promise<Array<SFDC_Object>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getObjects(namespace: string, sobjectType: string): Promise<Array<SFDC_Object>>;
    /**
     * @description Remove all the cached information about objects
     * @public
     */
    removeAllObjectsFromCache(): void;
    /**
     * @description Get information about a specific sobject
     * @param {string} sobject - the name of the sobject to get information about
     * @returns {Promise<SFDC_Object>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getObject(sobject: string): Promise<SFDC_Object>;
    /**
     * @description Remove all the cached information about a specific sobject
     * @param {string} sobject - the name of the sobject to remove from cache
     * @public
     */
    removeObjectFromCache(sobject: string): void;
    /**
     * @description Get information about object permissions per parent (kind of matrix view)
     * @param {string} namespace - the namespace of the package to filter the object permissions
     * @returns {Promise<DataMatrixIntf>} Information about objects (list of string) and permissions (list of SFDC_ObjectPermissionsPerParent)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getObjectPermissionsPerParent(namespace: string): Promise<DataMatrixIntf>;
    /**
     * @description Remove all the cached information about object permissions
     * @public
     */
    removeAllObjectPermissionsFromCache(): void;
    /**
     * @description Get information about application permissions per parent (kind of matrix view)
     * @param {string} namespace - the namespace of the package to filter the application permissions
     * @returns {Promise<DataMatrixIntf>} Information about applications (list of string) and permissions (list of SFDC_AppPermissionsPerParent)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getApplicationPermissionsPerParent(namespace: string): Promise<DataMatrixIntf>;
    /**
     * @description Remove all the cached information about application permissions
     * @public
     */
    removeAllAppPermissionsFromCache(): void;
    /**
     * @description Get information about knowledge articles
     * @returns {Promise<Array<SFDC_KnowledgeArticle>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getKnowledgeArticles(): Promise<Array<SFDC_KnowledgeArticle>>;
    /**
     * @description Remove all the cached information about knowledge articles
     * @public
     */
    removeAllKnowledgeArticlesFromCache(): void;
    /**
     * @description Get information about Chatter groups
     * @returns {Promise<Array<SFDC_CollaborationGroup>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getChatterGroups(): Promise<Array<SFDC_CollaborationGroup>>;
    /**
     * @description Remove all the cached information about Chatter groups
     * @public
     */
    removeAllChatterGroupsFromCache(): void;
    /**
     * @description Get information about custom fields (filtered out by namespace/pakage, type and sobject)
     * @param {string} namespace - the namespace of the package to filter the custom fields
     * @param {string} sobjectType - the sobject type to filter the custom fields
     * @param {string} sobject - the sobject to filter the custom fields
     * @returns {Promise<Array<SFDC_Field>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getCustomFields(namespace: string, sobjectType: string, sobject: string): Promise<Array<SFDC_Field>>;
    /**
     * @description Remove all the cached information about custom fields
     * @public
     */
    removeAllCustomFieldsFromCache(): void;
    /**
     * @description Get information about permission sets (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the permission sets
     * @returns {Promise<Array<SFDC_PermissionSet>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getPermissionSets(namespace: string): Promise<Array<SFDC_PermissionSet>>;
    /**
     * @description Remove all the cached information about permission sets
     * @public
     */
    removeAllPermSetsFromCache(): void;
    /**
     * @description Get information about permission set licenses
     * @returns {Promise<Array<SFDC_PermissionSetLicense>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getPermissionSetLicenses(): Promise<Array<SFDC_PermissionSetLicense>>;
    /**
     * @description Remove all the cached information about permission set licenses
     * @public
     */
    removeAllPermSetLicensesFromCache(): void;
    /**
     * @description Get information about profiles (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the profiles
     * @returns {Promise<Array<SFDC_Profile>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getProfiles(namespace: string): Promise<Array<SFDC_Profile>>;
    /**
     * @description Remove all the cached information about profiles
     * @public
     */
    removeAllProfilesFromCache(): void;
    /**
     * @description Get information about profile restrictions (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the profile restrictions
     * @returns {Promise<Array<SFDC_ProfileRestrictions>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getProfileRestrictions(namespace: string): Promise<Array<SFDC_ProfileRestrictions>>;
    /**
     * @description Remove all the cached information about profile restrictions
     * @public
     */
    removeAllProfileRestrictionsFromCache(): void;
    /**
     * @description Get information about profile password policies
     * @returns {Promise<Array<SFDC_ProfilePasswordPolicy>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getProfilePasswordPolicies(): Promise<Array<SFDC_ProfilePasswordPolicy>>;
    /**
     * @description Remove all the cached information about profile password policies
     * @public
     */
    removeAllProfilePasswordPoliciesFromCache(): void;
    /**
     * @description Get information about active users
     * @returns {Promise<Array<SFDC_User>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getActiveUsers(): Promise<Array<SFDC_User>>;
    /**
     * @description Remove all the cached information about active users
     * @public
     */
    removeAllActiveUsersFromCache(): void;
    /**
     * @description Get information about browsers
     * @returns {Promise<Array<SFDC_Browser>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getBrowsers(): Promise<Array<SFDC_Browser>>;
    /**
     * @description Remove all the cached information about browsers
     * @public
     */
    removeAllBrowsersFromCache(): void;
    /**
     * @description Get information about custom labels (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the custom labels
     * @returns {Promise<Array<SFDC_CustomLabel>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getCustomLabels(namespace: string): Promise<Array<SFDC_CustomLabel>>;
    /**
     * @description Remove all the cached information about custom labels
     * @public
     */
    removeAllCustomLabelsFromCache(): void;
    /**
     * @description Get information about custom tabs (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the custom tabs
     * @returns {Promise<Array<SFDC_CustomTab>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getCustomTabs(namespace: string): Promise<Array<SFDC_CustomTab>>;
    /**
     * @description Remove all the cached information about custom tabs
     * @public
     */
    removeAllCustomTabsFromCache(): void;
    /**
     * @description Get information about documents (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the documents
     * @returns {Promise<Array<SFDC_Document>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getDocuments(namespace: string): Promise<Array<SFDC_Document>>;
    /**
     * @description Remove all the cached information about documents
     * @public
     */
    removeAllDocumentsFromCache(): void;
    /**
     * @description Get information about LWCs (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the lightning web components
     * @returns {Promise<Array<SFDC_LightningWebComponent>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getLightningWebComponents(namespace: string): Promise<Array<SFDC_LightningWebComponent>>;
    /**
     * @description Remove all the cached information about lightning web components
     * @public
     */
    removeAllLightningWebComponentsFromCache(): void;
    /**
     * @description Get information about Aura Components (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the lightning aura components
     * @returns {Promise<Array<SFDC_LightningAuraComponent>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getLightningAuraComponents(namespace: string): Promise<Array<SFDC_LightningAuraComponent>>;
    /**
     * @description Remove all the cached information about lightning aura components
     * @public
     */
    removeAllLightningAuraComponentsFromCache(): void;
    /**
     * @description Get information about flexipages (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the lightning pages
     * @returns {Promise<Array<SFDC_LightningPage>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getLightningPages(namespace: string): Promise<Array<SFDC_LightningPage>>;
    /**
     * @description Remove all the cached information about lightning pages
     * @public
     */
    removeAllLightningPagesFromCache(): void;
    /**
     * @description Get information about VFCs (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the visualforce components
     * @returns {Promise<Array<SFDC_VisualForceComponent>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getVisualForceComponents(namespace: string): Promise<Array<SFDC_VisualForceComponent>>;
    /**
     * @description Remove all the cached information about Visualforce Components
     * @public
     */
    removeAllVisualForceComponentsFromCache(): void;
    /**
     * @description Get information about VFPs (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the visualforce pages
     * @returns {Promise<Array<SFDC_VisualForcePage>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getVisualForcePages(namespace: string): Promise<Array<SFDC_VisualForcePage>>;
    /**
     * @description Remove all the cached information about Visualforce Pages
     * @public
     */
    removeAllVisualForcePagesFromCache(): void;
    /**
     * @description Get information about Public Groups
     * @returns {Promise<Array<SFDC_Group>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getPublicGroups(): Promise<Array<SFDC_Group>>;
    /**
     * @description Remove all the cached information about public groups
     * @public
     */
    removeAllPublicGroupsFromCache(): void;
    /**
     * @description Get information about Queues
     * @returns {Promise<Array<SFDC_Group>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getQueues(): Promise<Array<SFDC_Group>>;
    /**
     * @description Remove all the cached information about queues
     * @public
     */
    removeAllQueuesFromCache(): void;
    /**
     * @description Get information about Apex Classes (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the apex classes
     * @returns {Promise<Array<SFDC_ApexClass>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getApexClasses(namespace: string): Promise<Array<SFDC_ApexClass>>;
    /**
     * @description Remove all the cached information about apex classes
     * @public
     */
    removeAllApexClassesFromCache(): void;
    /**
     * @description Get information about Apex Tests (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the apex tests
     * @returns {Promise<Array<SFDC_ApexClass>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getApexTests(namespace: string): Promise<Array<SFDC_ApexClass>>;
    /**
     * @description Remove all the cached information about apex tests
     * @public
     */
    removeAllApexTestsFromCache(): void;
    /**
     * @description Get information about Apex Uncompiled Classes (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the apex uncompiled classes
     * @returns {Promise<Array<SFDC_ApexClass>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getApexUncompiled(namespace: string): Promise<Array<SFDC_ApexClass>>;
    /**
     * @description Remove all the cached information about apex uncompiled classes
     * @public
     */
    removeAllApexUncompiledFromCache(): void;
    /**
     * @description Get information about Apex triggers (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the apex triggers
     * @returns {Promise<Array<SFDC_ApexTrigger>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getApexTriggers(namespace: string): Promise<Array<SFDC_ApexTrigger>>;
    /**
     * @description Remove all the cached information about apex triggers
     * @public
     */
    removeAllApexTriggersFromCache(): void;
    /**
     * @description Get information about User roles in a tabular view
     * @returns {Promise<Array<SFDC_UserRole>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getRoles(): Promise<Array<SFDC_UserRole>>;
    /**
     * @description Remove all the cached information about roles
     * @public
     */
    removeAllRolesFromCache(): void;
    /**
     * @description Get information about User Roles in a tree view
     * @returns {Promise<SFDC_UserRole>} Tree
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getRolesTree(): Promise<SFDC_UserRole>;
    /**
     * @description Get information about Static Resources
     * @param {string} namespace - the namespace of the package to filter the weblinks
     * @returns {Promise<Array<SFDC_StaticResource>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getStaticResources(namespace: string): Promise<Array<SFDC_StaticResource>>;
    /**
     * @description Remove all the cached information about Static Resources
     * @public
     */
    removeAllStaticResourcesFromCache(): void;
    /**
     * @description Get information about WebLinks
     * @param {string} namespace - the namespace of the package to filter the weblinks
     * @param {string} sobjectType - the sobject type to filter the weblinks
     * @param {string} sobject - the sobject to filter the weblinks
     * @returns {Promise<Array<SFDC_WebLink>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getWeblinks(namespace: string, sobjectType: string, sobject: string): Promise<Array<SFDC_WebLink>>;
    /**
     * @description Remove all the cached information about WebLinks
     * @public
     */
    removeAllWeblinksFromCache(): void;
    /**
     * @description Get information about Workflows
     * @returns {Promise<Array<SFDC_Workflow>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getWorkflows(): Promise<Array<SFDC_Workflow>>;
    /**
     * @description Remove all the cached information about workflows
     * @public
     */
    removeAllWorkflowsFromCache(): void;
    /**
     * @description Get information about record types
     * @param {string} namespace - the namespace of the package to filter the record types
     * @param {string} sobjectType - the sobject type to filter the record types
     * @param {string} sobject - the sobject to filter the record types
     * @returns {Promise<Array<SFDC_RecordType>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getRecordTypes(namespace: string, sobjectType: string, sobject: string): Promise<Array<SFDC_RecordType>>;
    /**
     * @description Remove all the cached information about record types
     * @public
     */
    removeAllRecordTypesFromCache(): void;
    /**
     * @description Get information about field permissions per parent (kind of matrix view) for a specific sobject
     * @param {string} sobject - the name of the sobject to get information about
     * @param {string} namespace - the namespace of the package to filter the field permissions
     * @returns {Promise<DataMatrixIntf>} Information about fields (list of string) and permissions (list of SFDC_FieldPermissionsPerParent)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getFieldPermissionsPerParent(sobject: string, namespace: string): Promise<DataMatrixIntf>;
    /**
     * @description Remove all the cached information about field permissions
     * @public
     */
    removeAllFieldPermissionsFromCache(): void;
    /**
     * @description Get information about Flows
     * @returns {Promise<Array<SFDC_Flow>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getFlows(): Promise<Array<SFDC_Flow>>;
    /**
     * @description Remove all the cached information about flows
     * @public
     */
    removeAllFlowsFromCache(): void;
    /**
     * @description Get information about EmailTemplate
     * @param {string} namespace - the namespace of the package to filter the email templates
     * @returns {Promise<Array<SFDC_EmailTemplate>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getEmailTemplates(namespace: string): Promise<Array<SFDC_EmailTemplate>>;
    /**
     * @description Remove all the cached information about email template
     * @public
     */
    removeAllEmailTemplatesFromCache(): void;
    /**
     * @description Get information about home page components
     * @returns {Promise<Array<SFDC_HomePageComponent>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getHomePageComponents(): Promise<Array<SFDC_HomePageComponent>>;
    /**
     * @description Remove all the cached information about home page components
     * @public
     */
    removeAllHomePageComponentsFromCache(): void;
    /**
     * @description Get information about Process Builders
     * @returns {Promise<Array<SFDC_Flow>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getProcessBuilders(): Promise<Array<SFDC_Flow>>;
    /**
     * @description Remove all the cached information about process builders
     * @public
     */
    removeAllProcessBuildersFromCache(): void;
    /**
     * @description Get information about Validation rules
     * @param {string} namespace - the namespace of the package to filter the validation rules
     * @param {string} sobjectType - the sobject type to filter the validation rules
     * @param {string} sobject - the sobject to filter the validation rules
     * @returns {Promise<Array<SFDC_ValidationRule>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getValidationRules(namespace: string, sobjectType: string, sobject: string): Promise<Array<SFDC_ValidationRule>>;
    /**
     * @description Remove all the cached information about validation rules
     * @public
     */
    removeAllValidationRulesFromCache(): void;
    /**
     * @description Get information about dashboards
     * @returns {Promise<Array<SFDC_Dashboard>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getDashboards(): Promise<Array<SFDC_Dashboard>>;
    /**
     * @description Remove all the cached information about dashboards
     * @public
     */
    removeAllDashboardsFromCache(): void;
    /**
     * @description Get information about reports
     * @returns {Promise<Array<SFDC_Report>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getReports(): Promise<Array<SFDC_Report>>;
    /**
     * @description Remove all the cached information about reports
     * @public
     */
    removeAllReportsFromCache(): void;
    /**
     * @description Get global view of the org
     * @returns {Promise<Map<string, DataCollectionStatisticsIntf>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getGlobalView(): Promise<Map<string, DataCollectionStatisticsIntf>>;
    /**
     * @description Remove all the cached information about global view
     * @public
     */
    removeGlobalViewFromCache(): void;
    /**
     * @description Get hardcoded URLs view of the org
     * @returns {Promise<Map<string, DataCollectionStatisticsIntf>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getHardcodedURLsView(): Promise<Map<string, DataCollectionStatisticsIntf>>;
    /**
     * @description Remove all the cached information about hardcoded URLs view
     * @public
     */
    removeHardcodedURLsFromCache(): void;
}

/**
 * @description Org Check API main class
 */
declare class API implements ApiIntf {
    /**
     * @description String representation of the Org Check version in a form of Element [El,n]
     * @type {string}
     * @public
     */
    readonly version: string;
    /**
     * @description Numerical representation of the Salesforce API Version we use
     * @type {number}
     * @public
     */
    readonly salesforceApiVersion: number;
    /**
     * @description Private Recipe Manager property used to run a recipe given its alias
     * @type {RecipeManagerIntf}
     * @private
     */
    private _recipeManager;
    /**
     * @description Private Dataset Manager property used to run a dataset given its alias
     * @type {DatasetManagerIntf}
     * @private
     */
    private _datasetManager;
    /**
     * @description Private Salesforce Manager property used to call the salesforce APIs using JsForce framework
     * @type {SalesforceManagerIntf}
     * @private
     */
    private _sfdcManager;
    /**
     * @description Private data cache manager to store data from datasetManager
     * @type {DataCacheManagerIntf}
     * @private
     */
    private _cacheManager;
    /**
     * @description Private Logger property used to send log information to the UI (if any)
     * @type {LoggerIntf}
     * @private
     */
    private _logger;
    /**
     * @description Is the current user accepted the terms manually to use Org Check in this org?
     * @type {boolean}
     * @private
     */
    private _usageTermsAcceptedManually;
    /**
     * @description Org Check constructor
     * @param {ApiSetup} setup - the setup object to configure the Org Check API
     */
    constructor(setup: ApiSetup);
    /**
     * @description Remove all cache from dataset manager
     * @public
     */
    removeAllFromCache(): void;
    /**
     * @description Get cache information from dataset manager
     * @returns {Array<DataCacheItemIntf>} list of cache information
     * @public
     */
    getCacheInformation(): Array<DataCacheItemIntf>;
    /**
     * @description Get cache data from dataset manager
     * @param {string} itemName - the name of the cache item to get
     * @returns {any} cached data
     * @public
     */
    getCacheData(itemName: string): any;
    /**
     * @description Get the list of all Org Check "score rules" as a matrix
     * @returns {DataMatrixIntf} Information about score rules as a matrix
     * @public
     */
    getAllScoreRulesAsDataMatrix(): DataMatrixIntf;
    /**
     * @description Get the lastest Daily API Usage from JSForce, and the level of confidence we have in this ratio to continue using org check.
     * @returns {SalesforceUsageInformationIntf} Percentage of the daily api usage and a confidence precentage.
     * @public
     */
    get dailyApiRequestLimitInformation(): SalesforceUsageInformationIntf;
    /**
     * @description Send a request to run all tests in the org. When this method is finished, it does not mean all tests are run.
     * @returns {Promise<string>} The Salesforce Id of the AsyncApexJob
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    runAllTestsAsync(): Promise<string>;
    /**
     * @description Compile the given list of Apex Classes and return the status of the compilation
     * @param {Array<string>} apexClassIds - the list of Apex Class Ids to compile
     * @returns {Promise<Map<string, { isSuccess: boolean, reasons?: Array<string>}>>} List of results by Apex Class ID
     * @async
     * @public
     */
    compileClasses(apexClassIds: Array<string>): Promise<Map<string, {
        isSuccess: boolean;
        reasons?: Array<string>;
    }>>;
    /**
     * @description Get information about the organization
     * @returns {Promise<SFDC_Organization>} Org information to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getOrganizationInformation(): Promise<SFDC_Organization>;
    /**
     * @description Check if we can use the current org according to the terms (specially if this is a production org)
     * @returns {Promise<boolean>} true if this org can be used, false otehrwise.
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    checkUsageTerms(): Promise<boolean>;
    /**
     * @description Returns if the usage terms were accepted manually
     * @returns {boolean} true if the usage terms were accepted manually, false otherwise
     * @public
     */
    wereUsageTermsAcceptedManually(): boolean;
    /**
     * @description Accept manually the usage terms
     * @public
     */
    acceptUsageTermsManually(): void;
    /**
     * @description Check if the current user can run the application
     * @returns {Promise<boolean>} true if this user can run the application. Never returns false (see exception)
     * @throws Exception if not enough permissions to run the application
     * @async
     * @public
     */
    checkCurrentUserPermissions(): Promise<boolean>;
    /**
     * @description Get information about the packages
     * @returns {Promise<Array<SFDC_Package>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getPackages(): Promise<Array<SFDC_Package>>;
    /**
     * @description Remove all the cached information about packages
     * @public
     */
    removeAllPackagesFromCache(): void;
    /**
     * @description Get information about the page layouts
     * @param {string} namespace - the namespace of the package to filter the page layouts
     * @param {string} sobjectType - the sobject type to filter the page layouts
     * @param {string} sobject - the sobject to filter the page layouts
     * @returns {Promise<Array<SFDC_PageLayout>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getPageLayouts(namespace: string, sobjectType: string, sobject: string): Promise<Array<SFDC_PageLayout>>;
    /**
     * @description Remove all the cached information about page layouts
     * @public
     */
    removeAllPageLayoutsFromCache(): void;
    /**
     * @description Get information about the object types
     * @returns {Promise<Array<SFDC_ObjectType>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getObjectTypes(): Promise<Array<SFDC_ObjectType>>;
    /**
     * @description Get information about the objects
     * @param {string} namespace - the namespace of the package to filter the objects
     * @param {string} sobjectType - the sobject type to filter the objects
     * @returns {Promise<Array<SFDC_Object>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getObjects(namespace: string, sobjectType: string): Promise<Array<SFDC_Object>>;
    /**
     * @description Remove all the cached information about objects
     * @public
     */
    removeAllObjectsFromCache(): void;
    /**
     * @description Get information about a specific sobject
     * @param {string} sobject - the name of the sobject to get information about
     * @returns {Promise<SFDC_Object>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getObject(sobject: string): Promise<SFDC_Object>;
    /**
     * @description Remove all the cached information about a specific sobject
     * @param {string} sobject - the name of the sobject to remove from cache
     * @public
     */
    removeObjectFromCache(sobject: string): void;
    /**
     * @description Get information about object permissions per parent (kind of matrix view)
     * @param {string} namespace - the namespace of the package to filter the object permissions
     * @returns {Promise<DataMatrixIntf>} Information about objects (list of string) and permissions (list of SFDC_ObjectPermissionsPerParent)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getObjectPermissionsPerParent(namespace: string): Promise<DataMatrixIntf>;
    /**
     * @description Remove all the cached information about object permissions
     * @public
     */
    removeAllObjectPermissionsFromCache(): void;
    /**
     * @description Get information about application permissions per parent (kind of matrix view)
     * @param {string} namespace - the namespace of the package to filter the application permissions
     * @returns {Promise<DataMatrixIntf>} Information about applications (list of string) and permissions (list of SFDC_AppPermissionsPerParent)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getApplicationPermissionsPerParent(namespace: string): Promise<DataMatrixIntf>;
    /**
     * @description Remove all the cached information about application permissions
     * @public
     */
    removeAllAppPermissionsFromCache(): void;
    /**
     * @description Get information about knowledge articles
     * @returns {Promise<Array<SFDC_KnowledgeArticle>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getKnowledgeArticles(): Promise<Array<SFDC_KnowledgeArticle>>;
    /**
     * @description Remove all the cached information about knowledge articles
     * @public
     */
    removeAllKnowledgeArticlesFromCache(): void;
    /**
     * @description Get information about Chatter groups
     * @returns {Promise<Array<SFDC_CollaborationGroup>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getChatterGroups(): Promise<Array<SFDC_CollaborationGroup>>;
    /**
     * @description Remove all the cached information about Chatter groups
     * @public
     */
    removeAllChatterGroupsFromCache(): void;
    /**
     * @description Get information about custom fields (filtered out by namespace/pakage, type and sobject)
     * @param {string} namespace - the namespace of the package to filter the custom fields
     * @param {string} sobjectType - the sobject type to filter the custom fields
     * @param {string} sobject - the sobject to filter the custom fields
     * @returns {Promise<Array<SFDC_Field>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getCustomFields(namespace: string, sobjectType: string, sobject: string): Promise<Array<SFDC_Field>>;
    /**
     * @description Remove all the cached information about custom fields
     * @public
     */
    removeAllCustomFieldsFromCache(): void;
    /**
     * @description Get information about permission sets (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the permission sets
     * @returns {Promise<Array<SFDC_PermissionSet>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getPermissionSets(namespace: string): Promise<Array<SFDC_PermissionSet>>;
    /**
     * @description Remove all the cached information about permission sets
     * @public
     */
    removeAllPermSetsFromCache(): void;
    /**
     * @description Get information about permission set licenses
     * @returns {Promise<Array<SFDC_PermissionSetLicense>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getPermissionSetLicenses(): Promise<Array<SFDC_PermissionSetLicense>>;
    /**
     * @description Remove all the cached information about permission set licenses
     * @public
     */
    removeAllPermSetLicensesFromCache(): void;
    /**
     * @description Get information about profiles (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the profiles
     * @returns {Promise<Array<SFDC_Profile>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getProfiles(namespace: string): Promise<Array<SFDC_Profile>>;
    /**
     * @description Remove all the cached information about profiles
     * @public
     */
    removeAllProfilesFromCache(): void;
    /**
     * @description Get information about profile restrictions (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the profile restrictions
     * @returns {Promise<Array<SFDC_ProfileRestrictions>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getProfileRestrictions(namespace: string): Promise<Array<SFDC_ProfileRestrictions>>;
    /**
     * @description Remove all the cached information about profile restrictions
     * @public
     */
    removeAllProfileRestrictionsFromCache(): void;
    /**
     * @description Get information about profile password policies
     * @returns {Promise<Array<SFDC_ProfilePasswordPolicy>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getProfilePasswordPolicies(): Promise<Array<SFDC_ProfilePasswordPolicy>>;
    /**
     * @description Remove all the cached information about profile password policies
     * @public
     */
    removeAllProfilePasswordPoliciesFromCache(): void;
    /**
     * @description Get information about active users
     * @returns {Promise<Array<SFDC_User>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getActiveUsers(): Promise<Array<SFDC_User>>;
    /**
     * @description Remove all the cached information about active users
     * @public
     */
    removeAllActiveUsersFromCache(): void;
    /**
     * @description Get information about browsers
     * @returns {Promise<Array<SFDC_Browser>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getBrowsers(): Promise<Array<SFDC_Browser>>;
    /**
     * @description Remove all the cached information about browsers
     * @public
     */
    removeAllBrowsersFromCache(): void;
    /**
     * @description Get information about custom labels (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the custom labels
     * @returns {Promise<Array<SFDC_CustomLabel>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getCustomLabels(namespace: string): Promise<Array<SFDC_CustomLabel>>;
    /**
     * @description Remove all the cached information about custom labels
     * @public
     */
    removeAllCustomLabelsFromCache(): void;
    /**
     * @description Get information about custom tabs (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the custom tabs
     * @returns {Promise<Array<SFDC_CustomTab>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getCustomTabs(namespace: string): Promise<Array<SFDC_CustomTab>>;
    /**
     * @description Remove all the cached information about custom tabs
     * @public
     */
    removeAllCustomTabsFromCache(): void;
    /**
     * @description Get information about documents (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the documents
     * @returns {Promise<Array<SFDC_Document>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getDocuments(namespace: string): Promise<Array<SFDC_Document>>;
    /**
     * @description Remove all the cached information about documents
     * @public
     */
    removeAllDocumentsFromCache(): void;
    /**
     * @description Get information about LWCs (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the lightning web components
     * @returns {Promise<Array<SFDC_LightningWebComponent>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getLightningWebComponents(namespace: string): Promise<Array<SFDC_LightningWebComponent>>;
    /**
     * @description Remove all the cached information about lightning web components
     * @public
     */
    removeAllLightningWebComponentsFromCache(): void;
    /**
     * @description Get information about Aura Components (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the lightning aura components
     * @returns {Promise<Array<SFDC_LightningAuraComponent>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getLightningAuraComponents(namespace: string): Promise<Array<SFDC_LightningAuraComponent>>;
    /**
     * @description Remove all the cached information about lightning aura components
     * @public
     */
    removeAllLightningAuraComponentsFromCache(): void;
    /**
     * @description Get information about flexipages (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the lightning pages
     * @returns {Promise<Array<SFDC_LightningPage>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getLightningPages(namespace: string): Promise<Array<SFDC_LightningPage>>;
    /**
     * @description Remove all the cached information about lightning pages
     * @public
     */
    removeAllLightningPagesFromCache(): void;
    /**
     * @description Get information about VFCs (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the visualforce components
     * @returns {Promise<Array<SFDC_VisualForceComponent>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getVisualForceComponents(namespace: string): Promise<Array<SFDC_VisualForceComponent>>;
    /**
     * @description Remove all the cached information about Visualforce Components
     * @public
     */
    removeAllVisualForceComponentsFromCache(): void;
    /**
     * @description Get information about VFPs (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the visualforce pages
     * @returns {Promise<Array<SFDC_VisualForcePage>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getVisualForcePages(namespace: string): Promise<Array<SFDC_VisualForcePage>>;
    /**
     * @description Remove all the cached information about Visualforce Pages
     * @public
     */
    removeAllVisualForcePagesFromCache(): void;
    /**
     * @description Get information about Public Groups
     * @returns {Promise<Array<SFDC_Group>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getPublicGroups(): Promise<Array<SFDC_Group>>;
    /**
     * @description Remove all the cached information about public groups
     * @public
     */
    removeAllPublicGroupsFromCache(): void;
    /**
     * @description Get information about Queues
     * @returns {Promise<Array<SFDC_Group>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getQueues(): Promise<Array<SFDC_Group>>;
    /**
     * @description Remove all the cached information about queues
     * @public
     */
    removeAllQueuesFromCache(): void;
    /**
     * @description Get information about Apex Classes (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the apex classes
     * @returns {Promise<Array<SFDC_ApexClass>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getApexClasses(namespace: string): Promise<Array<SFDC_ApexClass>>;
    /**
     * @description Remove all the cached information about apex classes
     * @public
     */
    removeAllApexClassesFromCache(): void;
    /**
     * @description Get information about Apex Tests (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the apex tests
     * @returns {Promise<Array<SFDC_ApexClass>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getApexTests(namespace: string): Promise<Array<SFDC_ApexClass>>;
    /**
     * @description Remove all the cached information about apex tests
     * @public
     */
    removeAllApexTestsFromCache(): void;
    /**
     * @description Get information about Apex Uncompiled Classes (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the apex uncompiled classes
     * @returns {Promise<Array<SFDC_ApexClass>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getApexUncompiled(namespace: string): Promise<Array<SFDC_ApexClass>>;
    /**
     * @description Remove all the cached information about apex uncompiled classes
     * @public
     */
    removeAllApexUncompiledFromCache(): void;
    /**
     * @description Get information about Apex triggers (filtered out by namespace/pakage)
     * @param {string} namespace - the namespace of the package to filter the apex triggers
     * @returns {Promise<Array<SFDC_ApexTrigger>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getApexTriggers(namespace: string): Promise<Array<SFDC_ApexTrigger>>;
    /**
     * @description Remove all the cached information about apex triggers
     * @public
     */
    removeAllApexTriggersFromCache(): void;
    /**
     * @description Get information about User roles in a tabular view
     * @returns {Promise<Array<SFDC_UserRole>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getRoles(): Promise<Array<SFDC_UserRole>>;
    /**
     * @description Remove all the cached information about roles
     * @public
     */
    removeAllRolesFromCache(): void;
    /**
     * @description Get information about User Roles in a tree view
     * @returns {Promise<SFDC_UserRole>} Tree
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getRolesTree(): Promise<SFDC_UserRole>;
    /**
     * @description Get information about Static Resources
     * @param {string} namespace - the namespace of the package to filter the weblinks
     * @returns {Promise<Array<SFDC_StaticResource>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getStaticResources(namespace: string): Promise<Array<SFDC_StaticResource>>;
    /**
     * @description Remove all the cached information about Static Resources
     * @public
     */
    removeAllStaticResourcesFromCache(): void;
    /**
     * @description Get information about WebLinks
     * @param {string} namespace - the namespace of the package to filter the weblinks
     * @param {string} sobjectType - the sobject type to filter the weblinks
     * @param {string} sobject - the sobject to filter the weblinks
     * @returns {Promise<Array<SFDC_WebLink>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getWeblinks(namespace: string, sobjectType: string, sobject: string): Promise<Array<SFDC_WebLink>>;
    /**
     * @description Remove all the cached information about WebLinks
     * @public
     */
    removeAllWeblinksFromCache(): void;
    /**
     * @description Get information about Workflows
     * @returns {Promise<Array<SFDC_Workflow>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getWorkflows(): Promise<Array<SFDC_Workflow>>;
    /**
     * @description Remove all the cached information about workflows
     * @public
     */
    removeAllWorkflowsFromCache(): void;
    /**
     * @description Get information about record types
     * @param {string} namespace - the namespace of the package to filter the record types
     * @param {string} sobjectType - the sobject type to filter the record types
     * @param {string} sobject - the sobject to filter the record types
     * @returns {Promise<Array<SFDC_RecordType>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getRecordTypes(namespace: string, sobjectType: string, sobject: string): Promise<Array<SFDC_RecordType>>;
    /**
     * @description Remove all the cached information about record types
     * @public
     */
    removeAllRecordTypesFromCache(): void;
    /**
     * @description Get information about field permissions per parent (kind of matrix view) for a specific sobject
     * @param {string} sobject - the name of the sobject to get information about
     * @param {string} namespace - the namespace of the package to filter the field permissions
     * @returns {Promise<DataMatrixIntf>} Information about fields (list of string) and permissions (list of SFDC_FieldPermissionsPerParent)
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getFieldPermissionsPerParent(sobject: string, namespace: string): Promise<DataMatrixIntf>;
    /**
     * @description Remove all the cached information about field permissions
     * @public
     */
    removeAllFieldPermissionsFromCache(): void;
    /**
     * @description Get information about Flows
     * @returns {Promise<Array<SFDC_Flow>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getFlows(): Promise<Array<SFDC_Flow>>;
    /**
     * @description Remove all the cached information about flows
     * @public
     */
    removeAllFlowsFromCache(): void;
    /**
     * @description Get information about EmailTemplate
     * @param {string} namespace - the namespace of the package to filter the email templates
     * @returns {Promise<Array<SFDC_EmailTemplate>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getEmailTemplates(namespace: string): Promise<Array<SFDC_EmailTemplate>>;
    /**
     * @description Remove all the cached information about email template
     * @public
     */
    removeAllEmailTemplatesFromCache(): void;
    /**
     * @description Get information about home page components
     * @returns {Promise<Array<SFDC_HomePageComponent>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getHomePageComponents(): Promise<Array<SFDC_HomePageComponent>>;
    /**
     * @description Remove all the cached information about home page components
     * @public
     */
    removeAllHomePageComponentsFromCache(): void;
    /**
     * @description Get information about Process Builders
     * @returns {Promise<Array<SFDC_Flow>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getProcessBuilders(): Promise<Array<SFDC_Flow>>;
    /**
     * @description Remove all the cached information about process builders
     * @public
     */
    removeAllProcessBuildersFromCache(): void;
    /**
     * @description Get information about Validation rules
     * @param {string} namespace - the namespace of the package to filter the validation rules
     * @param {string} sobjectType - the sobject type to filter the validation rules
     * @param {string} sobject - the sobject to filter the validation rules
     * @returns {Promise<Array<SFDC_ValidationRule>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getValidationRules(namespace: string, sobjectType: string, sobject: string): Promise<Array<SFDC_ValidationRule>>;
    /**
     * @description Remove all the cached information about validation rules
     * @public
     */
    removeAllValidationRulesFromCache(): void;
    /**
     * @description Get information about dashboards
     * @returns {Promise<Array<SFDC_Dashboard>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getDashboards(): Promise<Array<SFDC_Dashboard>>;
    /**
     * @description Remove all the cached information about dashboards
     * @public
     */
    removeAllDashboardsFromCache(): void;
    /**
     * @description Get information about reports
     * @returns {Promise<Array<SFDC_Report>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getReports(): Promise<Array<SFDC_Report>>;
    /**
     * @description Remove all the cached information about reports
     * @public
     */
    removeAllReportsFromCache(): void;
    /**
     * @description Get global view of the org
     * @returns {Promise<Map<string, DataCollectionStatisticsIntf>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getGlobalView(): Promise<Map<string, DataCollectionStatisticsIntf>>;
    /**
     * @description Remove all the cached information about global view
     * @public
     */
    removeGlobalViewFromCache(): void;
    /**
     * @description Get hardcoded URLs view of the org
     * @returns {Promise<Map<string, DataCollectionStatisticsIntf>>} List of items to return
     * @throws Exception from recipe manager
     * @async
     * @public
     */
    getHardcodedURLsView(): Promise<Map<string, DataCollectionStatisticsIntf>>;
    /**
     * @description Remove all the cached information about hardcoded URLs view
     * @public
     */
    removeHardcodedURLsFromCache(): void;
}

/**
 * @description This interface describe the field/property name in a Row where we find the "value" to show
 */
interface WhereToGetData {
    /**
     * @description Property containing the value
     * @type {string}
     */
    value: string;
}
/**
 * @description This interface describe the field/property name in a Row where we find the "values" to iterate over
 */
interface WhereToGetMultipleData {
    /**
     * @description Property containing the values
     * @type {string}
     */
    values: string;
}
/**
 * @description The score is the value in this case, and we add the fields to find the id and name of the item that has this score
 */
interface WhereToGetScoreData extends WhereToGetData {
    /**
     * @description Property containing the Salesforce ID of the entity that has this score
     * @type {string}
     */
    id: string;
    /**
     * @description Property containing the name/label of the entity that has this score
     * @type {string}
     */
    name: string;
}
/**
 * @description The text is the value in this case, no additional field needed
 */
interface WhereToGetTextData extends WhereToGetData {
}
/**
 * @description The URL is the value in this case, and we add the field to find the label for the hyperlink
 */
interface WhereToGetLinkData extends WhereToGetData {
    /**
     * @description Property containing the label to be used in the link
     * @type {string}
     */
    label: string;
}
/**
 * @description The Object is the value in this case, and we add a method to render this object as a string
 */
interface WhereToGetObjectData extends WhereToGetData {
    /**
     * @description Template function to generate a text based on the object
     * @type {function(any): string}
     */
    template(arg0: any): string;
}
/**
 * @description Values is the list, Value is the field to get the object (for each item)
 */
interface WhereToGetObjectsData extends WhereToGetObjectData, WhereToGetMultipleData {
}
/**
 * @description Values is the list, Value is the field to get the text (for each item)
 */
interface WhereToGetTextsData extends WhereToGetTextData, WhereToGetMultipleData {
}
/**
 * @description Values is the list, Value is the field to get the URL (for each item)
 */
interface WhereToGetLinksData extends WhereToGetLinkData, WhereToGetMultipleData {
}

interface Modifier {
    /**
     * @description If value is empty (undefined, empty string, numerical zero, empty list, etc...), this is the substitute text to use
     * @type {string}
     */
    valueIfEmpty?: string;
    /**
     * @description If text value has more than this maximum length of characters, the string will be truncated accordingly.
     * @type {number}
     */
    maximumLength?: number;
    /**
     * @description If text value will be rendered as preformatted (like code or formulas etc.)
     * @type {boolean}
     */
    preformatted?: boolean;
    /**
 * @description If the value is less that this value, the text will be substituted.
 * @type {number}
 */
    minimum?: number;
    /**
     * @description If value is less than 'min', this is the substitute text to use
     * @type {string}
     */
    valueBeforeMin?: string;
    /**
     * @description If the value is greater that this value, the text will be substituted.
     * @type {number}
     */
    maximum?: number;
    /**
     * @description If value is greater than 'max', this is the substitute text to use
     * @type {string}
     */
    valueAfterMax?: string;
}

declare enum ColumnType {
    IDX = "index",
    SCR = "score",
    TXT = "text",
    TXTS = "texts",
    NUM = "numeric",
    PRC = "percentage",
    URL = "id",
    URLS = "ids",
    CHK = "boolean",
    DTM = "datetime",
    DEP = "dependencies",
    OBJS = "objects"
}

declare enum Orientation {
    HORIZONTAL = "horizontal",
    VERTICAL = "vertical"
}

interface TableColumn {
    /**
     * @description Label used in the header of the column
     * @type {string}
     */
    label: string;
    /**
     * @description Type used in the header of the column
     * @type {ColumnType}
     */
    type: ColumnType;
    /**
     * @description Defines how to retrieve the data -- in which property
     * @type { WhereToGetTextData | WhereToGetScoreData | WhereToGetLinkData | WhereToGetObjectData | WhereToGetTextsData | WhereToGetLinksData | WhereToGetObjectsData }
     */
    data?: WhereToGetTextData | WhereToGetScoreData | WhereToGetLinkData | WhereToGetObjectData | WhereToGetTextsData | WhereToGetLinksData | WhereToGetObjectsData;
    /**
     * @description Optional modifier around the data
     * @type { Modifier }
     */
    modifier?: Modifier;
    /**
     * @description In which orientation the column should be. This is optional, by default the column will be horizontal.
     * @type {Orientation}
     */
    orientation?: Orientation;
}

declare enum SortOrder {
    DESC = "desc",
    ASC = "asc"
}

interface Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}
interface ExportedTable {
    /**
     * @description Name of the exported table (like a title)
     * @type {string}
     */
    header: string;
    /**
     * @description List of column labels
     * @type {Array<string>}
     */
    columns: Array<string>;
    /**
     * @description List of rows with cells
     * @type {Array<Array<string>>}
     */
    rows: Array<Array<string>>;
}

declare class ApexTestsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class AbstractApexTriggersTableDefinitions implements Table {
    /**
     * @description Constructor to specify if this table is in a context of an object.
     * @param {boolean} isObjectInformationNeeded - Is the object information needed in the table (true by default) (true by default)
     */
    constructor(isObjectInformationNeeded: boolean);
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}
declare class ApexTriggersTableDefinitions extends AbstractApexTriggersTableDefinitions {
    constructor();
}
declare class ApexTriggersInObjectTableDefinitions extends AbstractApexTriggersTableDefinitions {
    constructor();
}

declare class ApexUncompiledTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class ObjectPermissionsTableDefinitions implements Table {
    private _matrix;
    /**
     * @description Constructor to specify a datamatrix to use
     * @param {DataMatrixIntf} matrix - DataMatrix to use to generate this table
     */
    constructor(matrix: DataMatrixIntf);
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    get columns(): Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class AuraComponentsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class BrowsersTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class ChatterGroupsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class AbstractCustomFieldsTableDefinitions implements Table {
    /**
     * @description Constructor to specify if this table is in a context of an object.
     * @param {boolean} isObjectInformationNeeded - Is the object information needed in the table (true by default)
     */
    constructor(isObjectInformationNeeded: boolean);
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}
declare class CustomFieldsTableDefinitions extends AbstractCustomFieldsTableDefinitions {
    constructor();
}
declare class CustomFieldsInObjectTableDefinitions extends AbstractCustomFieldsTableDefinitions {
    constructor();
}

declare class CustomLabelsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class CustomTabsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class DashboardsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class DocumentsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class EmailTemplatesTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class FieldPermissionsTableDefinitions implements Table {
    private _matrix;
    /**
     * @description Constructor to specify a datamatrix to use
     * @param {DataMatrixIntf} matrix - DataMatrix to use to generate this table
     */
    constructor(matrix: DataMatrixIntf);
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    get columns(): Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class FieldSetsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class AbstractFlexiPagesTableDefinitions implements Table {
    /**
     * @description Constructor to specify if this table is in a context of an object.
     * @param {boolean} isObjectInformationNeeded - Is the object information needed in the table (true by default)
     */
    constructor(isObjectInformationNeeded: boolean);
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}
declare class FlexiPagesTableDefinitions extends AbstractFlexiPagesTableDefinitions {
    constructor();
}
declare class FlexiPagesInObjectTableDefinitions extends AbstractFlexiPagesTableDefinitions {
    constructor();
}

declare class FlowsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class GlobalViewItemsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class HardCodedURLsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class HomePageComponentsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class KnowledgeArticlesTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class LayoutsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class LightningWebComponentsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class LimitsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class AppPermissionsTableDefinitions implements Table {
    private _matrix;
    /**
     * @description Constructor to specify a datamatrix to use
     * @param {DataMatrixIntf} matrix - DataMatrix to use to generate this table
     */
    constructor(matrix: DataMatrixIntf);
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    get columns(): Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class ObjectsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class PageLayoutsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class PermissionSetLicensesTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class PermissionSetsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class ProcessBuildersTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class ProfilePasswordPoliciesTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class ProfileRestrictionsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class ProfilesTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class PublicGroupsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class QueuesTableDefinitions extends PublicGroupsTableDefinitions {
}

declare class AbstractRecordTypesTableDefinitions implements Table {
    /**
     * @description Constructor to specify if this table is in a context of an object.
     * @param {boolean} isObjectInformationNeeded - Is the object information needed in the table (true by default)
     */
    constructor(isObjectInformationNeeded: boolean);
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}
declare class RecordTypesTableDefinitions extends AbstractRecordTypesTableDefinitions {
    constructor();
}
declare class RecordTypesInObjectTableDefinitions extends AbstractRecordTypesTableDefinitions {
    constructor();
}

declare class RelationshipsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class ReportsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class RolesTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class ScoreRulesTableDefinitions implements Table {
    private _matrix;
    /**
     * @description Constructor to specify a datamatrix to use
     * @param {DataMatrixIntf} matrix - DataMatrix to use to generate this table
     */
    constructor(matrix: DataMatrixIntf);
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    get columns(): Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class StandardFieldsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class StaticResourcesTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class UsersTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class AbstractValidationRulesTableDefinitions implements Table {
    /**
     * @description Constructor to specify if this table is in a context of an object.
     * @param {boolean} isObjectInformationNeeded - Is the object information needed in the table (true by default)
     */
    constructor(isObjectInformationNeeded: boolean);
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}
declare class ValidationRulesTableDefinitions extends AbstractValidationRulesTableDefinitions {
    constructor();
}
declare class ValidationRulesInObjectTableDefinitions extends AbstractValidationRulesTableDefinitions {
    constructor();
}

declare class VisualForceComponentsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class VisualForcePagesTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class AbstractWebLinksTableDefinitions implements Table {
    /**
     * @description Constructor to specify if this table is in a context of an object.
     * @param {boolean} isObjectInformationNeeded - Is the object information needed in the table (true by default)
     */
    constructor(isObjectInformationNeeded: boolean);
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}
declare class WebLinksTableDefinitions extends AbstractWebLinksTableDefinitions {
    constructor();
}

declare class WorkflowsTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class ApexClassesTableDefinitions implements Table {
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;
    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number;
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder;
}

declare class TableDefinitions {
    static ApexClasses: typeof ApexClassesTableDefinitions;
    static ApexTests: typeof ApexTestsTableDefinitions;
    static ApexTriggers: typeof ApexTriggersTableDefinitions;
    static ApexTriggersInObject: typeof ApexTriggersInObjectTableDefinitions;
    static ApexUncompiled: typeof ApexUncompiledTableDefinitions;
    static AppPermissions: typeof AppPermissionsTableDefinitions;
    static AuraComponents: typeof AuraComponentsTableDefinitions;
    static Browsers: typeof BrowsersTableDefinitions;
    static ChatterGroups: typeof ChatterGroupsTableDefinitions;
    static CustomFields: typeof CustomFieldsTableDefinitions;
    static CustomFieldsInObject: typeof CustomFieldsInObjectTableDefinitions;
    static CustomLabels: typeof CustomLabelsTableDefinitions;
    static CustomTabs: typeof CustomTabsTableDefinitions;
    static Dashboards: typeof DashboardsTableDefinitions;
    static Documents: typeof DocumentsTableDefinitions;
    static EmailTemplates: typeof EmailTemplatesTableDefinitions;
    static FieldPermissions: typeof FieldPermissionsTableDefinitions;
    static FieldSets: typeof FieldSetsTableDefinitions;
    static FlexiPages: typeof FlexiPagesTableDefinitions;
    static FlexiPagesInObject: typeof FlexiPagesInObjectTableDefinitions;
    static Flows: typeof FlowsTableDefinitions;
    static GlobalView: typeof GlobalViewItemsTableDefinitions;
    static HardCodedURLs: typeof HardCodedURLsTableDefinitions;
    static HomePageComponents: typeof HomePageComponentsTableDefinitions;
    static KnowledgeArticles: typeof KnowledgeArticlesTableDefinitions;
    static Layouts: typeof LayoutsTableDefinitions;
    static LightningWebComponents: typeof LightningWebComponentsTableDefinitions;
    static Limits: typeof LimitsTableDefinitions;
    static ObjectPermissions: typeof ObjectPermissionsTableDefinitions;
    static Objects: typeof ObjectsTableDefinitions;
    static PageLayouts: typeof PageLayoutsTableDefinitions;
    static PermissionSetLicenses: typeof PermissionSetLicensesTableDefinitions;
    static PermissionSets: typeof PermissionSetsTableDefinitions;
    static ProcessBuilders: typeof ProcessBuildersTableDefinitions;
    static ProfilePasswordPolicies: typeof ProfilePasswordPoliciesTableDefinitions;
    static ProfileRestrictions: typeof ProfileRestrictionsTableDefinitions;
    static Profiles: typeof ProfilesTableDefinitions;
    static PublicGroups: typeof PublicGroupsTableDefinitions;
    static Queues: typeof QueuesTableDefinitions;
    static RecordTypes: typeof RecordTypesTableDefinitions;
    static RecordTypesInObject: typeof RecordTypesInObjectTableDefinitions;
    static Relationships: typeof RelationshipsTableDefinitions;
    static Reports: typeof ReportsTableDefinitions;
    static Roles: typeof RolesTableDefinitions;
    static ScoreRules: typeof ScoreRulesTableDefinitions;
    static StandardFields: typeof StandardFieldsTableDefinitions;
    static StaticResources: typeof StaticResourcesTableDefinitions;
    static Users: typeof UsersTableDefinitions;
    static ValidationRules: typeof ValidationRulesTableDefinitions;
    static ValidationRulesInObject: typeof ValidationRulesInObjectTableDefinitions;
    static VisualForceComponents: typeof VisualForceComponentsTableDefinitions;
    static VisualForcePages: typeof VisualForcePagesTableDefinitions;
    static WebLinks: typeof WebLinksTableDefinitions;
    static WebLinksInObject: typeof WebLinksTableDefinitions;
    static Workflows: typeof WorkflowsTableDefinitions;
}

declare class Exporter {
    /**
     * @param {Array<ExportedTable> | ExportedTable} source - Data to export
     * @returns {ArrayBuffer} Generated XLS data
     */
    static exportAsXls(source: Array<ExportedTable> | ExportedTable): ArrayBuffer;
}

interface Row {
    /**
     * @description Pre-calcultaed index of the row (needs to be recalculated when sroting for example!)
     * @type {number}
     * @public
     */
    index: number;
    /**
     * @description Name of the row
     * @type {string}
     * @public
     */
    name: string;
    /**
     * @description Score of the row if it has one
     * @type {number}
     * @public
     */
    score: number;
    /**
     * @description List of bad fields (must match column's value)
    /* @type {Array<string>}
     * @public
     */
    badFields: Array<string>;
    /**
     * @description List of reason id when this row is bad (can be empty, should not have duplicates)
    /* @type {Array<string>}
     * @public
     */
    badReasonIds: Array<string>;
    /**
     * @description List of cells in this row
    /* @type {Array<any>}
     * @public
     */
    cells: Array<any>;
    /**
     * @description Flag used when filtering the table. Meaning is obvious.
    /* @type {boolean}
     * @public
     */
    isVisible: boolean;
}

declare class RowsFactory {
    /**
     * @description Create the rows of a table
     * @param {Table} tableDefinition - Definition of the table
     * @param {Array<any>} records - List of records
     * @param {Function} onEachRowCallback - Callback to be called for each row
     * @param {Function} onEachCellCallback - Callback to be called for each cell
     * @returns {Array<Row>} List of rows
     */
    static create(tableDefinition: Table, records: Array<any>, onEachRowCallback: Function, onEachCellCallback: Function): Array<Row>;
    /**
     * @description Sort table
     * @param {Table} tableDefintion - Definition of the table
     * @param {Array<Row>} rows - List of rows
     * @param {number} columnIndex - Index of the column to sort
     * @param {SortOrder} order - Sort order, can be ASC or DESC
     */
    static sort(tableDefintion: Table, rows: Array<Row>, columnIndex: number, order: SortOrder): void;
    /**
     * @description Filter table
     * @param {Array<Row>} rows - List of rows
     * @param {string} searchInput - Search input
     */
    static filter(rows: Array<Row>, searchInput: string): void;
    /**
     * @description Export table
     * @param {Table} tableDefintion - Definition of the table
     * @param {Array<Row>} rows - List of rows
     * @param {string} title - Title of the exported table
     * @returns {ExportedTable} Exported table
     */
    static export(tableDefintion: Table, rows: Array<Row>, title: string): ExportedTable;
    /**
     * @description Export table
     * @param {Table} tableDefintion - Definition of the table
     * @param {Array<any>} records - List of records
     * @param {string} title - Title of the exported table
     * @returns {ExportedTable} Exported table
     */
    static createAndExport(tableDefintion: Table, records: Array<any>, title: string): ExportedTable;
}

/**
 * @description Org Check "score rule" used to qualify if an item is bad or not
 * @public
 */
interface ScoreRule {
    /**
     * @description Unique identifier of that rule
     * @type {number}
     * @public
     */
    id: number;
    /**
     * @description Description of that rule
     * @type {string}
     * @public
     */
    description: string;
    /**
     * @description Rule's formula with the data as only parameter. Function returns true or false.
     * @type {Function}
     * @public
     */
    formula: Function;
    /**
     * @description Message to show if the formula returns false for a given data.
     * @type {string}
     * @public
     */
    errorMessage: string;
    /**
     * @description Technical name of the field that is considered 'bad'
     * @type {string}
     * @public
     */
    badField: string;
    /**
     * @description For which data this rule is applicable?
     * @type {Array<any>}
     * @public
     */
    applicable: Array<DataAliases>;
    /**
     * @description Category of the rule
     * @type {string}
     * @public
     */
    category: string;
}

/**
 * @description In Org Check, there are two main ingredients for our secret sauce: the score rules and
 *                  the current api version of an org. Of course this secret sauce object is unmutable.
 * @public
 */
declare class SecretSauce {
    /**
     * @description Returns an unmutable list of all score rules.
     * @returns {Array<ScoreRule>} List of score rules
     * @static
     * @readonly
     */
    static get AllScoreRules(): Array<ScoreRule>;
    /**
     * @description Returns an unmutable array of score rules only related to hardcoded urls.
     * @returns {Array<number>} Score rues only related to hardcoded urls
     * @static
     * @readonly
     */
    static GetScoreRulesForHardCodedURLs(): Array<number>;
    /**
     * @description Returns an unmutable score rule given its id.
     * @param {number} id - The ID of the score rule to retrieve.
     * @returns {ScoreRule} The score rule given its id
     * @static
     * @readonly
     */
    static GetScoreRule(id: number): ScoreRule;
    /**
     * @description Returns the description of a given rule from its id.
     * @param {number} id - The ID of the score rule.
     * @returns {string} Description of the given rule
     * @static
     * @readonly
     */
    static GetScoreRuleDescription(id: number): string;
    /**
     * @description Returns the "potential" latest API version that a production org and non preview org can have
     * @returns {number} Api Version to use
     * @static
     * @readonly
     */
    static get CurrentApiVersion(): number;
}

declare class ApiFactory {
    static create(setup: ApiSetup): ApiIntf;
}
declare class OrgCheck {
    API: typeof API;
    rules: {
        get: typeof SecretSauce.GetScoreRule;
    };
    export: {
        asXlsx: typeof Exporter.exportAsXls;
        asRaw: typeof RowsFactory.export;
    };
    ui: {
        table: {
            createRows: typeof RowsFactory.create;
            createAndExport: typeof RowsFactory.createAndExport;
            filterRows: typeof RowsFactory.filter;
            sortRows: typeof RowsFactory.sort;
            definitions: typeof TableDefinitions;
        };
    };
}
declare const orgcheck: OrgCheck;

export { ApiFactory, orgcheck as default };
export type { ApiIntf, ApiSetup, DataCollectionStatisticsIntf, LoggerSetup, SalesforceAuthenticationOptions, SalesforceManagerSetup, StorageSetup };
