import { OrgCheckDataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckSalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { OrgCheckSalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_ApexClass } from '../data/orgcheck-api-data-apexclass';

const REGEX_COMMENTS_AND_NEWLINES = new RegExp('(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/.*\\n|\\n)', 'gi');
const REGEX_ISINTERFACE = new RegExp("(?:public|global)\\s+(?:interface)\\s+\\w+(\\s+(?:extends)\\s+\\w+)?\\s*\\{", 'i');
const REGEX_ISENUM = new RegExp("(?:public|global)\\s+(?:enum)\\s+\\w+\\s*\\{", 'i');
const REGEX_ISTESTSEEALLDATA = new RegExp("@IsTest\\(.*SeeAllData=true.*\\)", 'i');
const REGEX_TESTNBASSERTS = new RegExp("(System.assert(Equals|NotEquals|)\\(|Assert\\.[a-zA-Z]*\\()", 'ig');

export class OrgCheckDatasetApexClasses extends OrgCheckDataset {

    /**
     * @description Run the dataset and return the result
     * @param {OrgCheckSalesforceManagerIntf} sfdcManager
     * @param {OrgCheckDataFactoryIntf} dataFactory
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_ApexClass>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL queries
        logger?.log(`Querying Tooling API about ApexClass, ApexCodeCoverage, ApexCodeCoverageAggregate and AsyncApexJob in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, ' +
                        'Body, LengthWithoutComments, SymbolTable, ' +
                        'CreatedDate, LastModifiedDate ' +
                    'FROM ApexClass ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') `,
            tooling: true,
            byPasses: [],
            queryMoreField: 'Id'
        }, {
            string: 'SELECT ApexClassOrTriggerId, ApexTestClassId ' +
                    'FROM ApexCodeCoverage',
            tooling: true,
            byPasses: [],
            queryMoreField: ''
        }, {
            string: 'SELECT ApexClassorTriggerId, NumLinesCovered, ' +
                        'NumLinesUncovered, Coverage ' +
                    'FROM ApexCodeCoverageAggregate',
            tooling: true,
            byPasses: [],
            queryMoreField: ''
        }, {
            string: 'SELECT ApexClassId ' +
                    'FROM AsyncApexJob ' +
                    'WHERE JobType = \'ScheduledApex\' ',
            tooling: false,
            byPasses: [],
            queryMoreField: ''
        }], logger);

        // Init the factory and records and records
        const apexClassDataFactory = dataFactory.getInstance(SFDC_ApexClass);
        const apexClassRecords = results[0].records;
        const apexCodeCoverageRecords = results[1].records;
        const apexCodeCoverageAggRecords = results[2].records;
        const asyncApexJobRecords = results[3].records;

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${apexClassRecords.length} apex classes...`);
        const apexClassesDependencies = await sfdcManager.dependenciesQuery(
            await OrgCheckProcessor.map(apexClassRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Part 1b- apex classes
        logger?.log(`Parsing ${apexClassRecords.length} apex classes...`);
        const apexClasses = new Map(await OrgCheckProcessor.map(apexClassRecords, async (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);
            
            // Create the instance
            const apexClass = apexClassDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name,
                    apiVersion: record.ApiVersion,
                    package: (record.NamespacePrefix || ''),
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
                    url: sfdcManager.setupUrl(id, OrgCheckSalesforceMetadataTypes.APEX_CLASS)
                }, 
                dependencies: {
                    data: apexClassesDependencies
                }
            });

            // Get information from the compilation output information by the Apex compiler on salesforce side (if available)
            if (record.SymbolTable) {
                apexClass.innerClassesCount = record.SymbolTable.innerClasses.length || 0;
                apexClass.interfaces = record.SymbolTable.interfaces;
                apexClass.isSchedulable = record.SymbolTable.interfaces?.includes('System.Schedulable') ?? false;
                apexClass.methodsCount = record.SymbolTable.methods.length || 0;
                apexClass.extends = record.SymbolTable.parentClass;
                if (record.SymbolTable.tableDeclaration) {
                    apexClass.annotations = record.SymbolTable.tableDeclaration.annotations;
                    await OrgCheckProcessor.forEach(record.SymbolTable.tableDeclaration.modifiers, m => {
                        switch (m) {
                            case 'with sharing':      apexClass.specifiedSharing = 'with';      break;
                            case 'without sharing':   apexClass.specifiedSharing = 'without';   break;
                            case 'inherited sharing': apexClass.specifiedSharing = 'inherited'; break;
                            case 'public':            apexClass.specifiedAccess  = 'public';    break;
                            case 'private':           apexClass.specifiedAccess  = 'private';   break;
                            case 'global':            apexClass.specifiedAccess  = 'global';    break;
                            case 'virtual':           apexClass.specifiedAccess  = 'virtual';   break;
                            case 'abstract':          apexClass.isAbstract       = true;        break;
                            case 'testMethod':        apexClass.isTest           = true;        break;
                            default:                  console.error(`Unsupported modifier in SymbolTable.tableDeclaration: ${m} (ApexClassId=${apexClass.id})`);
                        }
                    });
                }
            }
            
            // Get information directly from the source code (if available)
            if (record.Body) {
                const sourceCode = record.Body.replaceAll(REGEX_COMMENTS_AND_NEWLINES, ' ');
                apexClass.isInterface = sourceCode.match(REGEX_ISINTERFACE) !== null;
                apexClass.isEnum = sourceCode.match(REGEX_ISENUM) !== null;
                apexClass.isClass = (apexClass.isInterface === false && apexClass.isEnum === false);
                
                // Specific scanning for Test Classes
                if (apexClass.isTest === true) { // this is defined only from the SymbolTable!
                    apexClass.isTestSeeAllData = sourceCode.match(REGEX_ISTESTSEEALLDATA) !== null;
                    apexClass.nbSystemAsserts = sourceCode.match(REGEX_TESTNBASSERTS)?.length || 0;
                }
            }

            // Refine sharing spec
            if (apexClass.isEnum === true || apexClass.isInterface === true) apexClass.specifiedSharing = 'Not applicable';
            if (apexClass.isTest === false && apexClass.isClass === true && !apexClass.specifiedSharing) {
                apexClass.isSharingMissing = true;
            }

            // Add it to the map  
            return [ apexClass.id, apexClass ];
        }));

        // Part 2- add the related tests to apex classes
        logger?.log(`Parsing ${apexCodeCoverageRecords.length} apex code coverages...`);
        const relatedTestsByApexClass = new Map();
        const relatedClassesByApexTest = new Map();
        await OrgCheckProcessor.forEach(
            apexCodeCoverageRecords,
            (record) => {
                // Get the ID15 of the class that is tested and the test class
                const id = sfdcManager.caseSafeId(record.ApexClassOrTriggerId);
                const testId = sfdcManager.caseSafeId(record.ApexTestClassId);
                if (apexClasses.has(id)) { // make sure the id is an existing class!
                    // Add the relationships between class and test class
                    if (relatedTestsByApexClass.has(id) === false) relatedTestsByApexClass.set(id, new Set());
                    if (relatedClassesByApexTest.has(testId) === false) relatedClassesByApexTest.set(testId, new Set());
                    relatedTestsByApexClass.get(id).add(testId);
                    relatedClassesByApexTest.get(testId).add(id);
                }
            }
        );
        await OrgCheckProcessor.forEach(relatedTestsByApexClass, (relatedTestsIds, apexClassId) => {
            if (apexClasses.has(apexClassId)) { // Just to be safe!
                apexClasses.get(apexClassId).relatedTestClassIds = Array.from(relatedTestsIds);
            }
        });
        await OrgCheckProcessor.forEach(relatedClassesByApexTest, (relatedClassesIds, apexTestId) => {
            if (apexClasses.has(apexTestId)) { // In case a test from a package is covering a classe the id will not be in the Class map!
                apexClasses.get(apexTestId).relatedClassIds = Array.from(relatedClassesIds);
            }
        });

        // Part 3- add the aggregate code coverage to apex classes
        logger?.log(`Parsing ${apexCodeCoverageAggRecords.length} apex code coverage aggregates...`);
        await OrgCheckProcessor.forEach(
            apexCodeCoverageAggRecords,
            (record) => {
                // Get the ID15 of the class that is tested
                const id = sfdcManager.caseSafeId(record.ApexClassOrTriggerId);
                if (apexClasses.has(id)) { // make sure the id is an existing class!
                    // set the coverage of that class
                    apexClasses.get(id).coverage = (record.NumLinesCovered / (record.NumLinesCovered + record.NumLinesUncovered));
                }
            }
        );

        // Part 4- add if class is scheduled
        logger?.log(`Parsing ${asyncApexJobRecords.length} schedule apex classes...`);
        await OrgCheckProcessor.forEach(
            asyncApexJobRecords,
            (record) => {
                // Get the ID15 of the class that is scheduled
                const id = sfdcManager.caseSafeId(record.ApexClassId);
                if (apexClasses.has(id)) { // make sure the id is an existing class!
                    // set the scheduled flag to true
                    apexClasses.get(id).isScheduled = true;
                }
            }
        );

        // Compute the score of all items
        await OrgCheckProcessor.forEach(apexClasses, (apexClass) => {
            apexClassDataFactory.computeScore(apexClass);
        });

        // Return data as map
        logger?.log(`Done`);
        return apexClasses;
    } 
}