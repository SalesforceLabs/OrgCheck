import { CodeScanner } from '../core/orgcheck-api-codescanner';
import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_ApexClass, SFDC_ApexTestMethodResult } from '../data/orgcheck-api-data-apexclass';

export class DatasetApexClasses extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
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
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') ` +
                    'ORDER BY Id',
            tooling: true
        }, {
            string: 'SELECT ApexClassId ' +
                    'FROM AsyncApexJob ' +
                    `WHERE JobType = 'ScheduledApex' ` +
                    `AND ApexClass.ManageableState IN ('installedEditable', 'unmanaged') `,
            tooling: true
        }, {
            string: 'SELECT ApexClassId, MethodName, ApexTestRunResult.CreatedDate, '+
                        'RunTime, Outcome, StackTrace, (SELECT Cpu, AsyncCalls, Sosl, Soql, ' +
                        'QueryRows, DmlRows, Dml FROM ApexTestResults LIMIT 1) '+
                    'FROM ApexTestResult '+
                    `WHERE (Outcome != 'Pass' OR RunTime > 20000) `+
                    `AND ApexTestRunResult.Status = 'Completed' `+
                    `AND ApexClass.ManageableState IN ('installedEditable', 'unmanaged') `+
                    'ORDER BY ApexClassId, ApexTestRunResult.CreatedDate desc, MethodName ',
            tooling: true
        }], logger);
        
        // Init the factory and records and records
        const apexClassDataFactory = dataFactory.getInstance(SFDC_ApexClass);
        const apexTestResultDataFactory = dataFactory.getInstance(SFDC_ApexTestMethodResult);
        const apexClassRecords = results[0];
        const asyncApexJobRecords = results[1];
        const apexTestResultRecords = results[2];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${apexClassRecords.length} apex classes...`);
        const apexClassIds = await Processor.map(apexClassRecords, (/** @type {any} */ record) => sfdcManager.caseSafeId(record.Id));
        const apexClassesDependencies = await sfdcManager.dependenciesQuery(apexClassIds, logger);

        // Second set of SOQL queries only for the apex classes that are editable
        // This workaround is due to the fact that we can't filter on ApexClassOrTrigger.ManageableState in these queres
        const apexCodeCoverageQueries = [];
        const apexCodeCoverageAggQueries = [];
        for (let i = 0; i < apexClassIds.length; i += 500) {
            const subsetIds = `'${apexClassIds.slice(i, i + 500).join("','")}'`;
            apexCodeCoverageQueries.push({
                string: 'SELECT ApexClassOrTriggerId, ApexTestClassId ' +
                        'FROM ApexCodeCoverage ' +
                        `WHERE ApexClassOrTriggerId IN (${subsetIds}) `+
                        `AND ApexTestClass.ManageableState IN ('installedEditable', 'unmanaged') `+
                        'GROUP BY ApexClassOrTriggerId, ApexTestClassId ',
                queryMoreField: 'CreatedDate',
                tooling: true
            });
            apexCodeCoverageAggQueries.push({
                string: 'SELECT ApexClassOrTriggerId, NumLinesCovered, ' +
                            'NumLinesUncovered, Coverage ' +
                        'FROM ApexCodeCoverageAggregate ' +
                        `WHERE ApexClassOrTriggerId IN (${subsetIds}) `,
                tooling: true
            });
        }
        const results2 = await Promise.all([
            sfdcManager.soqlQuery(apexCodeCoverageQueries, logger),
            sfdcManager.soqlQuery(apexCodeCoverageAggQueries, logger)
        ]);
        const apexCodeCoverageRecords = [].concat(... results2[0]);
        const apexCodeCoverageAggRecords = [].concat(... results2[1]);

        // Create instances of SFDC_ApexClass
        logger?.log(`Parsing ${apexClassRecords.length} apex classes...`);
        /** @type {Map<string, SFDC_ApexClass>} */
        const apexClasses = new Map(await Processor.map(apexClassRecords, async (/** @type {any} */ record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);
            
            // Create the instance
            /** @type {SFDC_ApexClass} */
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
                    needsRecompilation: (!record.SymbolTable ? true : false),
                    coverage: 0, // by default no coverage!
                    relatedTestClasses: [],
                    relatedClasses: [],
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.APEX_CLASS)
                }, 
                dependencyData: apexClassesDependencies
            });

            // Get information from the compilation output information by the Apex compiler on salesforce side (if available)
            if (record.SymbolTable) {
                apexClass.innerClassesCount = record.SymbolTable.innerClasses?.length || 0;
                apexClass.interfaces = record.SymbolTable.interfaces;
                apexClass.isSchedulable = record.SymbolTable.interfaces?.includes('System.Schedulable') ?? false;
                apexClass.methodsCount = record.SymbolTable.methods?.length || 0;
                apexClass.extends = record.SymbolTable.parentClass;
                if (record.SymbolTable.tableDeclaration) {
                    apexClass.annotations = record.SymbolTable.tableDeclaration.annotations?.map((/** @type {any} */ a) => a?.name ?? a);
                    await Processor.forEach(record.SymbolTable.tableDeclaration.modifiers, (/** @type {any} */ m) => {
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
                const sourceCode = CodeScanner.RemoveCommentsFromCode(record.Body);
                apexClass.isInterface = CodeScanner.IsInterfaceFromApexCode(sourceCode);
                apexClass.isEnum = CodeScanner.IsEnumFromApexCode(sourceCode);
                apexClass.isClass = (apexClass.isInterface === false && apexClass.isEnum === false);
                apexClass.hardCodedURLs = CodeScanner.FindHardCodedURLs(sourceCode);
                apexClass.hardCodedIDs = CodeScanner.FindHardCodedIDs(sourceCode);
                
                // Specific scanning for Test Classes
                if (apexClass.isTest === true) { // this is defined only from the SymbolTable!
                    apexClass.isTestSeeAllData = CodeScanner.IsTestSeeAllDataFromApexCode(sourceCode);
                    apexClass.nbSystemAsserts = CodeScanner.CountOfAssertsFromApexCode(sourceCode);
                }
            }

            // Refine sharing spec
            if (apexClass.isEnum === true || apexClass.isInterface === true) apexClass.specifiedSharing = 'Not applicable';

            // Add it to the map  
            return [ apexClass.id, apexClass ];
        }));

        // Add the related tests to apex classes
        logger?.log(`Parsing ${apexCodeCoverageRecords.length} apex code coverages...`);
        /** @type {Map<string, Set<string>>} */
        const relatedTestsByApexClass = new Map();
        /** @type {Map<string, Set<string>>} */
        const relatedClassesByApexTest = new Map();
        await Processor.forEach(
            apexCodeCoverageRecords,
            (/** @type {any} */ record) => {
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
        await Promise.all([
            Processor.forEach(relatedTestsByApexClass, (/** @type {Set<string>} */ relatedTestsIds, /** @type {string} */ apexClassId) => {
                if (apexClasses.has(apexClassId)) { // Just to be safe!
                    apexClasses.get(apexClassId).relatedTestClassIds = Array.from(relatedTestsIds);
                }
            }),
            Processor.forEach(relatedClassesByApexTest, (/** @type {Set<string>} */ relatedClassesIds, /** @type {string} */apexTestId) => {
                if (apexClasses.has(apexTestId)) { // In case a test from a package is covering a classe the id will not be in the Class map!
                    apexClasses.get(apexTestId).relatedClassIds = Array.from(relatedClassesIds);
                }
            })
        ]);

        // Add the aggregate code coverage to apex classes
        logger?.log(`Parsing ${apexCodeCoverageAggRecords.length} apex code coverage aggregates...`);
        await Processor.forEach(
            apexCodeCoverageAggRecords,
            (/** @type {any} */ record) => {
                // Get the ID15 of the class that is tested
                const id = sfdcManager.caseSafeId(record.ApexClassOrTriggerId);
                if (apexClasses.has(id)) { // make sure the id is an existing class!
                    // set the coverage of that class
                    apexClasses.get(id).coverage = (record.NumLinesCovered / (record.NumLinesCovered + record.NumLinesUncovered));
                }
            }
        );

        // Add if class is scheduled
        logger?.log(`Parsing ${asyncApexJobRecords.length} schedule apex classes...`);
        await Processor.forEach(
            asyncApexJobRecords,
            (/** @type {any} */ record) => {
                // Get the ID15 of the class that is scheduled
                const id = sfdcManager.caseSafeId(record.ApexClassId);
                if (apexClasses.has(id)) { // make sure the id is an existing class!
                    // set the scheduled flag to true
                    apexClasses.get(id).isScheduled = true;
                }
            }
        );

        // Add if unit test have been succesful or not
        logger?.log(`Parsing ${apexTestResultRecords.length} test results...`);
        await Processor.forEach(
            apexTestResultRecords,
            (/** @type {any} */ record) => {
                // Get the ID15 of the related test class
                const id = sfdcManager.caseSafeId(record.ApexClassId);
                if (apexClasses.has(id)) { // make sure the id is an existing class
                    const tc = apexClasses.get(id);
                    if (tc.isTest === true) { // make sure this is a Test class!
                        if (!tc.lastTestRunDate) {
                            tc.lastTestRunDate = record.ApexTestRunResult?.CreatedDate;
                            tc.testMethodsRunTime = 0;
                            tc.testPassedButLongMethods = [];
                            tc.testFailedMethods = [];
                        }
                        if (tc.lastTestRunDate === record.ApexTestRunResult?.CreatedDate) {
                            /** @type {SFDC_ApexTestMethodResult} */
                            const result = apexTestResultDataFactory.create({ 
                                properties: {
                                    methodName: record.MethodName,
                                    isSuccessful: record.Outcome === 'Pass',
                                    runtime: record.RunTime,
                                    stacktrace: record.StackTrace,
                                }
                            });
                            if (record.ApexTestResults?.records && record.ApexTestResults.records.length > 0) {
                                const limit = record.ApexTestResults.records[0];
                                if (limit.Cpu > 0) result.cpuConsumption = limit.Cpu; 
                                if (limit.AsyncCalls > 0) result.asyncCallsConsumption = limit.AsyncCalls;
                                if (limit.Sosl > 0) result.soslConsumption = limit.Sosl;
                                if (limit.Soql > 0) result.soqlConsumption = limit.Soql;
                                if (limit.QueryRows > 0) result.queryRowsConsumption = limit.QueryRows;
                                if (limit.DmlRows > 0) result.dmlRowsConsumption = limit.DmlRows;
                                if (limit.Dml > 0) result.dmlConsumption = limit.Dml;
                            }
                            tc.testMethodsRunTime += result.runtime;
                            (result.isSuccessful ? tc.testPassedButLongMethods : tc.testFailedMethods).push(result);
                        }
                    }
                }
            }
        );

        // FINALLY!!!! Compute the score of all items
        logger?.log(`Computing scores for ${apexClasses.size} Apex classes...`);
        await Processor.forEach(apexClasses, (/** @type {SFDC_ApexClass} */ apexClass) => {
            apexClassDataFactory.computeScore(apexClass);
        });

        // Return data as map
        logger?.log(`Done`);
        return apexClasses;
    } 
}