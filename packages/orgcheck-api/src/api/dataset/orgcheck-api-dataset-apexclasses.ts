import { CodeScanner } from 'src/api/core/orgcheck-api-codescanner';
import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcApexClass, SfdcApexTestMethodResult } from 'src/api/data/orgcheck-api-data-apexclass';

export class DatasetApexClasses implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcApexClass>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcApexClass>> {

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
        const apexClassDataFactory = dataFactory.getInstance(DataAliases.SfdcApexClass);
        const apexTestResultDataFactory = dataFactory.getInstance(DataAliases.SfdcApexTestMethodResult);
        const apexClassRecords = results[0];
        const asyncApexJobRecords = results[1];
        const apexTestResultRecords = results[2];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${apexClassRecords?.length} apex classes...`);
        const apexClassIds = await MediumProcessor.map(apexClassRecords, (record: Record<string, unknown>) => sfdcManager.caseSafeId(record.Id as string));
        const apexClassesDependencies = await sfdcManager.dependenciesQuery(apexClassIds, logger);

        // Second set of SOQL queries only for the apex classes that are editable
        // This workaround is due to the fact that we can't filter on ApexClassOrTrigger.ManageableState in these queres
        const apexCodeCoverageQueries: { string: string; queryMoreField: string; tooling: boolean }[] = [];
        const apexCodeCoverageAggQueries: { string: string; tooling: boolean }[] = [];
        for (let i = 0; i < apexClassIds?.length; i += 500) {
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
        const apexCodeCoverageRecords = ([] as Record<string, unknown>[]).concat(...results2[0]);
        const apexCodeCoverageAggRecords = ([] as Record<string, unknown>[]).concat(...results2[1]);

        // Create instances of SfdcApexClass
        logger?.log(`Parsing ${apexClassRecords?.length} apex classes...`);
        const apexClasses: Map<string, SfdcApexClass> = new Map(await MediumProcessor.map(apexClassRecords, async (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id as string);
            
            // Create the instance
            const apexClass: SfdcApexClass = apexClassDataFactory.create<SfdcApexClass>({
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
                    length: record?.lengthWithoutComments,
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
                const symbolTable = record.SymbolTable as Record<string, unknown>;
                apexClass.innerClassesCount = (symbolTable.innerClasses as unknown[] | undefined)?.length || 0;
                apexClass.interfaces = (symbolTable.interfaces as string[] | undefined) ?? [];
                apexClass.isSchedulable = (symbolTable.interfaces as string[] | undefined)?.includes('System.Schedulable') ?? false;
                apexClass.methodsCount = (symbolTable.methods as unknown[] | undefined)?.length || 0;
                apexClass.extends = symbolTable.parentClass ? [symbolTable.parentClass as string] : [];
                if (symbolTable.tableDeclaration) {
                    const tableDeclaration = symbolTable.tableDeclaration as Record<string, unknown>;
                    apexClass.annotations = ((tableDeclaration.annotations as Array<{ name?: string }> | undefined) ?? []).map((a) => a?.name ?? '');
                    await MediumProcessor.forEach(tableDeclaration.modifiers as string[], async (m: string) => {
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
                const sourceCode = CodeScanner.RemoveCommentsFromCode(record.Body as string);
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
        logger?.log(`Parsing ${apexCodeCoverageRecords?.length} apex code coverages...`);
        const relatedTestsByApexClass: Map<string, Set<string>> = new Map();
        const relatedClassesByApexTest: Map<string, Set<string>> = new Map();
        await MediumProcessor.forEach(
            apexCodeCoverageRecords,
            async (record) => {
                // Get the ID15 of the class that is tested and the test class
                const id = sfdcManager.caseSafeId(record.ApexClassOrTriggerId as string);
                const testId = sfdcManager.caseSafeId(record.ApexTestClassId as string);
                if (apexClasses.has(id)) { // make sure the id is an existing class!
                    // Add the relationships between class and test class
                    if (relatedTestsByApexClass.has(id) === false) relatedTestsByApexClass.set(id, new Set());
                    if (relatedClassesByApexTest.has(testId) === false) relatedClassesByApexTest.set(testId, new Set());
                    relatedTestsByApexClass.get(id)?.add(testId);
                    relatedClassesByApexTest.get(testId)?.add(id);
                }
            }
        );
        await Promise.all([
            MediumProcessor.forEach(relatedTestsByApexClass, async (relatedTestsIds: Set<string>, apexClassId: string) => {
                if (apexClasses.has(apexClassId)) { // Just to be safe!
                    const clazz = apexClasses.get(apexClassId);
                    if (clazz) {
                        clazz.relatedTestClassIds = Array.from(relatedTestsIds);
                    }
                }
            }),
            MediumProcessor.forEach(relatedClassesByApexTest, async (relatedClassesIds: Set<string>, apexTestId: string) => {
                if (apexClasses.has(apexTestId)) { // In case a test from a package is covering a classe the id will not be in the Class map!
                    const testClazz = apexClasses.get(apexTestId);
                    if (testClazz) {
                        testClazz.relatedClassIds = Array.from(relatedClassesIds);
                    }
                }
            })
        ]);

        // Add the aggregate code coverage to apex classes
        logger?.log(`Parsing ${apexCodeCoverageAggRecords?.length} apex code coverage aggregates...`);
        await MediumProcessor.forEach(
            apexCodeCoverageAggRecords,
            async (record) => {
                // Get the ID15 of the class that is tested
                const id = sfdcManager.caseSafeId(record.ApexClassOrTriggerId as string);
                if (apexClasses.has(id)) { // make sure the id is an existing class!
                    // set the coverage of that class
                    const clazz = apexClasses.get(id);
                    if (clazz) {
                        clazz.coverage = ((record.NumLinesCovered as number) / ((record.NumLinesCovered as number) + (record.NumLinesUncovered as number)));
                    }
                }
            }
        );

        // Add if class is scheduled
        logger?.log(`Parsing ${asyncApexJobRecords?.length} schedule apex classes...`);
        await MediumProcessor.forEach(
            asyncApexJobRecords,
            async (record) => {
                // Get the ID15 of the class that is scheduled
                const id = sfdcManager.caseSafeId(record.ApexClassId as string);
                if (apexClasses.has(id)) { // make sure the id is an existing class!
                    // set the scheduled flag to true
                    const clazz = apexClasses.get(id);
                    if (clazz) {
                        clazz.isScheduled = true;
                    }
                }
            }
        );

        // Add whether unit tests have been successful or not
        logger?.log(`Parsing ${apexTestResultRecords?.length} test results...`);
        await MediumProcessor.forEach(
            apexTestResultRecords,
            async (record) => {
                // Get the ID15 of the related test class
                const id = sfdcManager.caseSafeId(record.ApexClassId as string);
                if (apexClasses.has(id)) { // make sure the id is an existing class
                    const tc = apexClasses.get(id);
                    if (tc?.isTest === true) { // make sure this is a Test class!
                        if (!tc.lastTestRunDate) {
                            tc.lastTestRunDate = ((record.ApexTestRunResult as Record<string, unknown> | undefined)?.CreatedDate) as unknown as number;
                            tc.testMethodsRunTime = 0;
                            tc.testPassedButLongMethods = [];
                            tc.testFailedMethods = [];
                        }
                        if (tc.lastTestRunDate === (record.ApexTestRunResult as Record<string, unknown> | undefined)?.CreatedDate) {
                            const result: SfdcApexTestMethodResult = apexTestResultDataFactory.create<SfdcApexTestMethodResult>({ 
                                properties: {
                                    methodName: record.MethodName,
                                    isSuccessful: record.Outcome === 'Pass',
                                    runtime: record.RunTime,
                                    stacktrace: record.StackTrace,
                                }
                            });
                            const apexTestResults = record.ApexTestResults as { records?: Record<string, unknown>[] } | undefined;
                            if (apexTestResults?.records && apexTestResults.records?.length > 0) {
                                const limitRec = apexTestResults.records[0] as Record<string, number>;
                                if (limitRec.Cpu > 0) result.cpuConsumption = limitRec.Cpu; 
                                if (limitRec.AsyncCalls > 0) result.asyncCallsConsumption = limitRec.AsyncCalls;
                                if (limitRec.Sosl > 0) result.soslConsumption = limitRec.Sosl;
                                if (limitRec.Soql > 0) result.soqlConsumption = limitRec.Soql;
                                if (limitRec.QueryRows > 0) result.queryRowsConsumption = limitRec.QueryRows;
                                if (limitRec.DmlRows > 0) result.dmlRowsConsumption = limitRec.DmlRows;
                                if (limitRec.Dml > 0) result.dmlConsumption = limitRec.Dml;
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
        await MediumProcessor.forEach(apexClasses, async (apexClass: SfdcApexClass) => {
            apexClassDataFactory.computeScore(apexClass);
        });

        // Return data as map
        logger?.log(`Done.`);
        return apexClasses;
    } 
}