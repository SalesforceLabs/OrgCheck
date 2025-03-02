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
    methodName;

    /**
     * @description Is this method was successful or failed
     * @type {boolean}
     * @public
     */
    isSuccessful;

    /**
     * @description Runtime of that method whatever its result
     * @type {number}
     * @public
     */
    runtime;

    /**
     * @description If the method failed this is the error stack trace
     * @type {string}
     * @public
     */
    stacktrace;
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
    id;
    
    /**
     * @description Name
     * @type {string}
     * @public
     */
    name;
    
    /**
     * @description Setup URL of this item
     * @type {string}
     * @public
     */
    url;
    
    /**
     * @description API Version (as a number) set in the metadata for this item.
     * @type {number}
     * @public
     */
    apiVersion;
    
    /**
     * @description Name of the potential namespace/package where this item comes from. Empty string if none.
     * @type {string}
     * @public
     */
    package;

    /**
     * @description Is this class a test class?
     * @type {boolean}
     * @public
     */
    isTest;

    /**
     * @description Is this class a test class with See All Data option?
     * @type {boolean}
     * @public
     */
    isTestSeeAllData;

    /**
     * @description Number of direct asserts in this class (if it's a test class)
     * @type {number}
     * @public
     */
    nbSystemAsserts;

    /**
     * @description Is this class with the Asbtract modifier?
     * @type {boolean}
     * @public
     */
    isAbstract;

    /**
     * @description Is this a class? (and not an interface or an enum)
     * @type {boolean}
     * @public
     */
    isClass;

    /**
     * @description Is this an enum? (and not an interface or a class)
     * @type {boolean}
     * @public
     */
    isEnum;

    /**
     * @description Is this an interface? (and not a class or an enum)
     * @type {boolean}
     * @public
     */
    isInterface;

    /**
     * @description Number of inner classs in this class
     * @type {number}
     * @public
     */
    innerClassesCount;

    /**
     * @description Is this a class implements Schedulable?
     * @type {boolean}
     * @public
     */
    isSchedulable;

    /**
     * @description Is this Schedulable class even scheduled in this org?
     * @type {boolean}
     * @public
     */
    isScheduled;

    /**
     * @description List of interface that this class implements
     * @type {Array<string>}
     * @public
     */
    interfaces;
    
    /**
     * @description List of super class that this class extends
     * @type {Array<string>}
     * @public
     */
    extends;

    /**
     * @description Number of methods in this class (Note: if the class is a test, this not only the testing methods, this is ALL the methods)
     * @type {number}
     * @public
     */
    methodsCount;

    /**
     * @description List of test methods that were OK in the last run results
     * @type {Array<SFDC_ApexTestMethodResult>}
     * @public
     */
    testPassedMethods;

    /**
     * @description List of test methods that were OK in the last run results
     * @type {Array<SFDC_ApexTestMethodResult>}
     * @public
     */
    testFailedMethods;

    /**
     * @description Date/Time when this test class was last run. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastTestRunDate;

    /**
     * @description Entire time (at the class level) it took to run all test methods (whatever their result) during the last run.
     * @type {number}
     * @public
     */
    testMethodsRunTime;

    /**
     * @description List of annotations that this class uses
     * @type {Array<string>}
     * @public
     */
    annotations;

    /**
     * @description Specified sharing mode for this class
     * @type {string}
     * @public
     */
    specifiedSharing;

    /**
     * @description Specified access mode for this class
     * @type {string}
     * @public
     */
    specifiedAccess;

    /**
     * @description Number of characters used in the class (without comments)
     * @type {number}
     * @public
     */
    length;

    /**
     * @description Source code of the apex class when it's available
     * @type {string}
     * @public
     */
    sourceCode;

    /**
     * @description When we do not have compiler information about this class, it means it needs to be recompiled manually.
     * @type {boolean}
     * @public
     */
    needsRecompilation;

    /**
     * @description Current code coverage of this class. May vary if you have run all test classes or not.
     * @type {number}
     * @public
     */
    coverage;

    /**
     * @description List of test class Ids that participate in the current code coverage of this class (if this is a not test class).
     * @type {Array<string>}
     * @public
     */
    relatedTestClassIds;

    /**
     * @description List of test class that participate in the current code coverage of this class (if this is a not test class).
     * @type {Array<SFDC_ApexClass>}
     * @public
     */
    relatedTestClassRefs;

    /**
     * @description List of class Ids that are tested by this class (if this is a test class).
     * @type {Array<string>}
     * @public
     */
    relatedClassIds;

    /**
     * @description List of class that are tested by this class (if this is a test class).
     * @type {Array<SFDC_ApexClass>}
     * @public
     */
    relatedClassRefs;
    
    /**
     * @description Date/Time when this item was created in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    createdDate;
    
    /**
     * @description Date/Time when this item was last modified in the org. Information stored as a Unix timestamp.
     * @type {number}
     * @public
     */
    lastModifiedDate;
}