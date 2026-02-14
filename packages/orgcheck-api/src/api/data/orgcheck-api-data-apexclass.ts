import { DataWithDependencies, DataWithoutScoring } from '../core/orgcheck-api-data';

export class SFDC_ApexTestMethodResult extends DataWithoutScoring {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Apex Test Result' };

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
export class SFDC_ApexClass extends DataWithDependencies {

    /** 
     * @description Logical name of what this class represents
     * @type {string}
     * @static
     * @public
     */
    static get label() { return 'Apex Class' };

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