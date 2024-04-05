import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_ApexClass } from '../data/orgcheck-api-data-apexclass';

const REGEX_COMMENTS_AND_NEWLINES = new RegExp('(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/.*\\n|\\n)', 'gi');
const REGEX_ISINTERFACE = new RegExp("(?:public|global)\\s+(?:interface)\\s+\\w+(\\s+(?:extends)\\s+\\w+)?\\s*\\{", 'i');
const REGEX_ISENUM = new RegExp("(?:public|global)\\s+(?:enum)\\s+\\w+\\s*\\{", 'i');
const REGEX_ISTESTSEEALLDATA = new RegExp("@IsTest\\(.*SeeAllData=true.*\\)", 'i');
const REGEX_TESTNBASSERTS = new RegExp("System.assert(?:Equals|NotEquals|)\\(", 'ig');

export class OrgCheckDatasetApexClasses extends OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject) {

        // SOQL query on Apex Classes, Apex Coverage and Apex Jobs
        sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, '+
                        'Body, LengthWithoutComments, SymbolTable, '+
                        'CreatedDate, LastModifiedDate '+
                    'FROM ApexClass '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') ',
            tooling: true,
            addDependenciesBasedOnField: 'Id'
        }, {
            string: 'SELECT ApexClassOrTriggerId, ApexTestClassId '+
                    'FROM ApexCodeCoverage',
            tooling: true
        }, {
            string: 'SELECT ApexClassorTriggerId, NumLinesCovered, '+
                        'NumLinesUncovered, Coverage '+
                    'FROM ApexCodeCoverageAggregate',
            tooling: true
        }, { 
            string: 'SELECT ApexClassId '+
                    'FROM AsyncApexJob '+
                    'WHERE JobType = \'ScheduledApex\' '
        }]).then((results) => {

            // Init the map
            const classesMap = new Map();

            // Init the factory
            const apexClassDataFactory = dataFactory.getInstance(SFDC_ApexClass);

            // Set the map

            // Part 1- define the apex classes
            localLogger.log(`Parsing ${results[0].records.length} Apex Classes...`);
            results[0].records
                .forEach((record) => {
                    const apexClass = apexClassDataFactory.create({
                        id: sfdcManager.caseSafeId(record.Id),
                        url: sfdcManager.setupUrl('apex-class', record.Id),
                        name: record.Name,
                        apiVersion: record.ApiVersion,
                        package: record.NamespacePrefix,
                        isTest: false,
                        isAbstract: false,
                        isClass: true,
                        isEnum: false,
                        isInterface: false,
                        isSchedulable: false,
                        isScheduled: false,
                        isSharingMissing: false,
                        length: record.LengthWithoutComments,
                        sourceCode: record.Body,
                        needsRecompilation: (!record.SymbolTable ? true : false),
                        coverage: 0, // by default no coverage!
                        relatedTestClasses: [],
                        relatedClasses: [],
                        createdDate: record.CreatedDate,
                        lastModifiedDate: record.LastModifiedDate,
                        allDependencies: results[0].allDependencies
                    });
                    // Get information directly from the source code (if available)
                    if (record.Body) {
                        const sourceCode = record.Body.replaceAll(REGEX_COMMENTS_AND_NEWLINES, ' ');
                        apexClass.isInterface = sourceCode.match(REGEX_ISINTERFACE) !== null;
                        apexClass.isEnum = sourceCode.match(REGEX_ISENUM) !== null;
                        apexClass.isClass = (apexClass.isInterface === false && apexClass.isEnum === false);
                    }
                    // If the apex class compiled we will get information from compilation
                    if (record.SymbolTable) {
                        apexClass.innerClassesCount = record.SymbolTable.innerClasses.length || 0;
                        apexClass.interfaces = record.SymbolTable.interfaces;
                        apexClass.isSchedulable = record.SymbolTable.interfaces?.includes('System.Schedulable') ?? false;
                        apexClass.methodsCount = record.SymbolTable.methods.length || 0;
                        apexClass.extends = record.SymbolTable.parentClass;
                        if (record.SymbolTable.tableDeclaration) {
                            apexClass.annotations = record.SymbolTable.tableDeclaration.annotations;
                            if (record.SymbolTable.tableDeclaration.modifiers) {
                                record.SymbolTable.tableDeclaration.modifiers.forEach(m => {
                                    switch (m) {
                                        case 'with sharing':      apexClass.specifiedSharing = 'with';      break;
                                        case 'without sharing':   apexClass.specifiedSharing = 'without';   break;
                                        case 'inherited sharing': apexClass.specifiedSharing = 'inherited'; break;
                                        case 'public':            apexClass.specifiedAccess  = 'public';    break;
                                        case 'global':            apexClass.specifiedAccess  = 'global';    break;
                                        case 'abstract':          apexClass.isAbstract       = true;        break;
                                        case 'testMethod':        apexClass.isTest           = true;        break;
                                    }
                                });
                            }
                        }
                    }
                    // Defin type
                    if (apexClass.isTest === true) {
                        apexClass.type = 'test';
                    } else if (apexClass.isInterface === true) {
                        apexClass.type = 'interface';
                    } else if (apexClass.isEnum === true) {
                        apexClass.type = 'enum';
                    } else {
                        apexClass.type = 'class';
                    }
                    // Refine sharing spec
                    if (apexClass.isEnum === true || apexClass.isInterface === true) apexClass.specifiedSharing = 'Not applicable';
                    if (apexClass.isTest === false && apexClass.isClass === true && !apexClass.specifiedSharing) {
                        apexClass.isSharingMissing = true;
                    }
                    // Specific scanning for Test Classes
                    if (apexClass.isTest === true) {
                        apexClass.isTestSeeAllData = record.Body.match(REGEX_ISTESTSEEALLDATA) !== null;
                        apexClass.nbSystemAsserts = record.Body.match(REGEX_TESTNBASSERTS)?.length || 0;
                    }
                    classesMap.set(apexClass.id, apexClass);
                });

            // Part 2- add the related tests to apex classes
            localLogger.log(`Parsing ${results[1].records.length} Apex Code Coverages...`);
            const relatedTestsByApexClass = new Map();
            const relatedClassesByApexTest = new Map();
            results[1].records
                .filter((record) => {
                    return classesMap.has(sfdcManager.caseSafeId(record.ApexClassOrTriggerId));
                })
                .forEach((record) => {
                    // Get the ID15 of the class that is tested and the test class
                    const id = sfdcManager.caseSafeId(record.ApexClassOrTriggerId);
                    const testId = sfdcManager.caseSafeId(record.ApexTestClassId);
                    if (relatedTestsByApexClass.has(id) === false) relatedTestsByApexClass.set(id, new Set());
                    if (relatedClassesByApexTest.has(testId) === false) relatedClassesByApexTest.set(testId, new Set());
                    relatedTestsByApexClass.get(id).add(testId);
                    relatedClassesByApexTest.get(testId).add(id);
                });
            relatedTestsByApexClass.forEach((relatedTestsIds, apexClassId) => {
                classesMap.get(apexClassId).relatedTestClassIds = Array.from(relatedTestsIds);
            });
            relatedClassesByApexTest.forEach((relatedClassesIds, apexTestId) => {
                classesMap.get(apexTestId).relatedClassIds = Array.from(relatedClassesIds);
            });

            // Part 3- add the aggregate code coverage to apex classes
            localLogger.log(`Parsing ${results[2].records.length} Apex Code Coverage Aggregates...`);
            results[2].records
                .filter((record) => {
                    return classesMap.has(sfdcManager.caseSafeId(record.ApexClassOrTriggerId));
                })
                .forEach((record) => {
                    // Get the ID15 of the class that is tested
                    const id = sfdcManager.caseSafeId(record.ApexClassOrTriggerId);
                    classesMap.get(id).coverage = (record.NumLinesCovered / (record.NumLinesCovered + record.NumLinesUncovered));
                });

            // Part 4- add if class is scheduled
            localLogger.log(`Parsing ${results[3].records.length} Schedule Apex Classes...`);
            results[3].records
                .filter((record) => {
                    return classesMap.has(sfdcManager.caseSafeId(record.ApexClassId));
                })
                .forEach((record) => {
                    // Get the ID15 of the class that is scheduled
                    const id = sfdcManager.caseSafeId(record.ApexClassId);
                    classesMap.get(id).isScheduled = true;
                });

            // Compute the score of all items
            classesMap.forEach((apexClass) => {
                apexClassDataFactory.computeScore(apexClass);
                /*
                if (sfdcManager.isVersionOld(apexClass.apiVersion)) apexClass.setBadField('apiVersion');
                if (apexClass.isTest === true && apexClass.nbSystemAsserts === 0) apexClass.setBadField('nbSystemAsserts');
                if (apexClass.isSharingMissing === true) apexClass.setBadField('specifiedSharing');
                if (apexClass.isScheduled === false && apexClass.isSchedulable === true) apexClass.setBadField('isScheduled');
                if (apexClass.needsRecompilation === true) apexClass.setBadField('name');
                if (isNaN(apexClass.coverage) || !apexClass.coverage || apexClass.coverage < 0.75) apexClass.setBadField('coverage');
                if (apexClass.isItReferenced() === false) apexClass.setBadField('dependencies.referenced');
                */
            });

            // Return data
            resolve(classesMap);
        }).catch(reject);
    } 
}