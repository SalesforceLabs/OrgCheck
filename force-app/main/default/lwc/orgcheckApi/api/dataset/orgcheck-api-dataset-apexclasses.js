import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_ApexClass } from '../data/orgcheck-api-data-apexclass';

const REGEX_ISINTERFACE = new RegExp("(?:public|global)\\s+(?:interface)\\s+\\w+\\s*\\{", 'i');
const REGEX_ISENUM = new RegExp("(?:public|global)\\s+(?:enum)\\s+\\w+\\s*\\{", 'i');
const REGEX_ISTESTSEEALLDATA = new RegExp("@IsTest\\(.*SeeAllData=true.*\\)", 'i');
const REGEX_TESTNBASSERTS = new RegExp("System.assert(?:Equals|NotEquals|)\\(", 'ig');

export class OrgCheckDatasetApexClass extends OrgCheckDataset {

    run(sfdcManager, resolve, reject) {

        // SOQL query on Apex Classes, Apex Coverage and Apex Jobs
        sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, '+
                        'Body, LengthWithoutComments, SymbolTable, '+
                        'CreatedDate, LastModifiedDate '+
                    'FROM ApexClass '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') ',
            tooling: true
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

            // Set the map

            // Part 1- define the apex classes
            results[0].records
                .forEach((record) => {
                    const apexClass = new SFDC_ApexClass({
                        id: sfdcManager.caseSafeId(record.Id),
                        name: record.Name,
                        apiVersion: record.ApiVersion,
                        package: record.NamespacePrefix,
                        isTest: false,
                        isAbstract: false,
                        isClass: true,
                        isEnum: false,
                        isInterface: false,
                        isSharingMissing: false,
                        length: record.LengthWithoutComments,
                        needsRecompilation: (!record.SymbolTable ? true : false),
                        coverage: 0, // by default no coverage!
                        relatedTestClasses: new Set(),
                        createdDate: record.CreatedDate,
                        lastModifiedDate: record.LastModifiedDate
                    });
                    // Get information directly from the source code (if available)
                    if (record.Body) {
                        apexClass.isInterface = record.Body.match(REGEX_ISINTERFACE) !== null;
                        apexClass.isEnum = record.Body.match(REGEX_ISENUM) !== null;
                        apexClass.isClass = (apexClass.isInterface === false && apexClass.isEnum === false);
                    }
                    // If the apex class compiled we will get information from compilation
                    if (record.SymbolTable) {
                        apexClass.innerClassesCount = record.SymbolTable.innerClasses.length || 0;
                        apexClass.interfaces = record.SymbolTable.interfaces;
                        apexClass.methodsCount = record.SymbolTable.methods.length || 0;
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
                    // Refine sharing spec
                    if (apexClass.isEnum === true || apexClass.isInterface === true) apexClass.specifiedSharing = 'n/a';
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
            results[1].records
                .filter((record) => {
                    return classesMap.has(sfdcManager.caseSafeId(record.ApexClassOrTriggerId));
                })
                .forEach((record) => {
                    // Get the ID15 of the class that is tested and the test class
                    const id = sfdcManager.caseSafeId(record.ApexClassOrTriggerId);
                    const testId = sfdcManager.caseSafeId(record.ApexTestClassId);
                    classesMap.get(id).relatedTestClasses.add(testId);
                });

            // Part 3- add the aggregate code coverage to apex classes
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
            results[3].records
                .filter((record) => {
                    return classesMap.has(sfdcManager.caseSafeId(record.ApexClassId));
                })
                .forEach((record) => {
                    // Get the ID15 of the class that is scheduled
                    const id = sfdcManager.caseSafeId(record.ApexClassId);
                    classesMap.get(id).isScheduled = true;
                });

            // Return data
            resolve(classesMap);
        }).catch(reject);
    } 
}