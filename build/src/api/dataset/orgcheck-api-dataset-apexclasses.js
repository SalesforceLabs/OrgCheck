import { CodeScanner } from '../core/orgcheck-api-codescanner';
import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processing';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_ApexClass, SFDC_ApexTestMethodResult } from '../data/orgcheck-api-data-apexclass';

export class DatasetApexClasses extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
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
            tooling: true
        }, {
            string: 'SELECT ApexClassOrTriggerId, ApexTestClassId ' +
                    'FROM ApexCodeCoverage',
            tooling: true
        }, {
            string: 'SELECT ApexClassorTriggerId, NumLinesCovered, ' +
                        'NumLinesUncovered, Coverage ' +
                    'FROM ApexCodeCoverageAggregate',
            tooling: true
        }, {
            string: 'SELECT ApexClassId ' +
                    'FROM AsyncApexJob ' +
                    `WHERE JobType = 'ScheduledApex' `
        }, {
            string: 'SELECT id, ApexClassId, MethodName, ApexTestRunResult.CreatedDate, '+
                        'RunTime, Outcome, StackTrace '+
                    'FROM ApexTestResult '+
                    `WHERE ApexTestRunResult.Status = 'Completed' `+
                    `AND ApexClass.ManageableState IN ('installedEditable', 'unmanaged') `+
                    'ORDER BY ApexClassId, ApexTestRunResult.CreatedDate desc, MethodName ',
                tooling: true
        }], logger);

        // Init the factory and records and records
        const apexClassDataFactory = dataFactory.getInstance(SFDC_ApexClass);
        const apexTestResultDataFactory = dataFactory.getInstance(SFDC_ApexTestMethodResult);
        const apexClassRecords = results[0];
        const apexCodeCoverageRecords = results[1];
        const apexCodeCoverageAggRecords = results[2];
        const asyncApexJobRecords = results[3];
        const apexTestResultRecords = results[4];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${apexClassRecords.length} apex classes...`);
        const apexClassesDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(apexClassRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Part 1b- apex classes
        logger?.log(`Parsing ${apexClassRecords.length} apex classes...`);
        const apexClasses = new Map(await Processor.map(apexClassRecords, async (record) => {

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
                    length: record.LengthWithoutComments,
                    sourceCode: record.Body,
                    needsRecompilation: (!record.SymbolTable ? true : false),
                    coverage: 0, // by default no coverage!
                    relatedTestClasses: [],
                    relatedClasses: [],
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.APEX_CLASS)
                }, 
                dependencies: {
                    data: apexClassesDependencies
                }
            });

            // Get information from the compilation output information by the Apex compiler on salesforce side (if available)
            if (record.SymbolTable) {
                apexClass.innerClassesCount = record.SymbolTable.innerClasses?.length || 0;
                apexClass.interfaces = record.SymbolTable.interfaces;
                apexClass.isSchedulable = record.SymbolTable.interfaces?.includes('System.Schedulable') ?? false;
                apexClass.methodsCount = record.SymbolTable.methods?.length || 0;
                apexClass.extends = record.SymbolTable.parentClass;
                if (record.SymbolTable.tableDeclaration) {
                    apexClass.annotations = record.SymbolTable.tableDeclaration.annotations?.map((a) => a?.name ?? a);
                    await Processor.forEach(record.SymbolTable.tableDeclaration.modifiers, m => {
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
                const sourceCode = CodeScanner.RemoveComments(record.Body);
                apexClass.isInterface = CodeScanner.IsInterface(sourceCode);
                apexClass.isEnum = CodeScanner.IsEnum(sourceCode);
                apexClass.isClass = (apexClass.isInterface === false && apexClass.isEnum === false);
                apexClass.nbHardCodedURLs = CodeScanner.CountOfHardCodedURLs(sourceCode);
                apexClass.nbHardCodedIDs = CodeScanner.CountOfHardCodedIDs(sourceCode);
                
                // Specific scanning for Test Classes
                if (apexClass.isTest === true) { // this is defined only from the SymbolTable!
                    apexClass.isTestSeeAllData = CodeScanner.IsTestSeeAllData(sourceCode);
                    apexClass.nbSystemAsserts = CodeScanner.CountOfAsserts(sourceCode);
                }
            }

            // Refine sharing spec
            if (apexClass.isEnum === true || apexClass.isInterface === true) apexClass.specifiedSharing = 'Not applicable';

            // Add it to the map  
            return [ apexClass.id, apexClass ];
        }));

        // Part 2- add the related tests to apex classes
        logger?.log(`Parsing ${apexCodeCoverageRecords.length} apex code coverages...`);
        const relatedTestsByApexClass = new Map();
        const relatedClassesByApexTest = new Map();
        await Processor.forEach(
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
        await Processor.forEach(relatedTestsByApexClass, (relatedTestsIds, apexClassId) => {
            if (apexClasses.has(apexClassId)) { // Just to be safe!
                apexClasses.get(apexClassId).relatedTestClassIds = Array.from(relatedTestsIds);
            }
        });
        await Processor.forEach(relatedClassesByApexTest, (relatedClassesIds, apexTestId) => {
            if (apexClasses.has(apexTestId)) { // In case a test from a package is covering a classe the id will not be in the Class map!
                apexClasses.get(apexTestId).relatedClassIds = Array.from(relatedClassesIds);
            }
        });

        // Part 3- add the aggregate code coverage to apex classes
        logger?.log(`Parsing ${apexCodeCoverageAggRecords.length} apex code coverage aggregates...`);
        await Processor.forEach(
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
        await Processor.forEach(
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

        // Part 4- add if class is scheduled
        logger?.log(`Parsing ${apexTestResultRecords.length} test results...`);
        await Processor.forEach(
            apexTestResultRecords,
            (record) => {
                // Get the ID15 of the related test class
                const id = sfdcManager.caseSafeId(record.ApexClassId);
                if (apexClasses.has(id)) { // make sure the id is an existing class
                    const tc = apexClasses.get(id);
                    if (tc.isTest === true) { // make sure this is a Test class!
                        if (!tc.lastTestRunDate) {
                            tc.lastTestRunDate = record.ApexTestRunResult?.CreatedDate;
                            tc.testMethodsRunTime = 0;
                            tc.testPassedMethods = [];
                            tc.testFailedMethods = [];
                        }
                        if (tc.lastTestRunDate === record.ApexTestRunResult?.CreatedDate) {
                            const result = apexTestResultDataFactory.create({ 
                                properties: {
                                    methodName: record.MethodName,
                                    isSuccessful: record.Outcome === 'Pass',
                                    runtime: record.RunTime,
                                    stacktrace: record.StackTrace
                                }
                            });
                            tc.testMethodsRunTime += result.runtime;
                            (result.isSuccessful ? tc.testPassedMethods : tc.testFailedMethods).push(result);
                        }
                    }
                }
            }
        );

        // Compute the score of all items
        await Processor.forEach(apexClasses, (apexClass) => {
            apexClassDataFactory.computeScore(apexClass);
        });

        // Return data as map
        logger?.log(`Done`);
        return apexClasses;
    } 
}