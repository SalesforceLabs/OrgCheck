import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcFlow, SfdcFlowVersion } from 'src/api/data/orgcheck-api-data-flow';
import { LFSScanner } from 'src/api/core/salesforce/orgcheck-api-lfs-scanner';

// Limited list of known types of Flow ProcessType
// see all the list at https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_visual_workflow.htm
const PROCESSTYPE_TRANSLATION = { 
    'ApprovalWorkflow': 'Approval Workflow',
    'AutoLaunchedFlow': 'Auto-Launched Flow',
    'Flow': 'Screen Flow',
    'InvocableProcess': 'Invocable Process',
    'LoginFlow': 'Login Flow',
    'Survey': 'Survey',
    'Workflow': 'Process Builder'
};

export class DatasetFlows implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcFlow>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcFlow>> {

        // First SOQL query
        logger?.log(`Querying Tooling API about FlowDefinition in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            // List all FlowDefinition (on top of flow verions)
            string: 'SELECT Id, DeveloperName, ApiVersion, Description, ActiveVersionId, ' +
                        'LatestVersionId, CreatedDate, LastModifiedDate ' +
                    'FROM FlowDefinition',
            tooling: true
        }, {
            // Count of versions per definition
            string: 'SELECT DefinitionId, COUNT(Id) NbVersions ' + 
                    'FROM Flow ' +
                    'GROUP BY DefinitionId',
            queryMoreField: 'CreatedDate',
            tooling: true
        }], logger);
            
        // Init the factories
        const flowDefinitionDataFactory = dataFactory.getInstance(DataAliases.SfdcFlow);
        const flowVersionDataFactory = dataFactory.getInstance(DataAliases.SfdcFlowVersion);
        const flowDefRecords = results[0];
        const flowVersionsByDefRecords = results[1];
        
        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${flowDefRecords?.length} flow versions...`);
        const flowDependenciesIds: string[] = [];
        await MediumProcessor.forEach(flowDefRecords, async (record: any) => {
            // Add the ID15 of the most interesting flow version
            flowDependenciesIds.push(sfdcManager.caseSafeId(record.ActiveVersionId ?? record.LatestVersionId));
            // Add the ID15 of the flow definition
            flowDependenciesIds.push(sfdcManager.caseSafeId(record.Id));
        });
        const flowDefinitionsDependencies = await sfdcManager.dependenciesQuery(flowDependenciesIds, logger);
        
        // List of active flows that we need to get information later (with Metadata API)
        const activeFlowIds: string[] = [];

        // Create the map
        logger?.log(`Parsing ${flowDefRecords?.length} flow definitions...`);
        const flowDefinitions: Map<string, SfdcFlow> = new Map(await MediumProcessor.map(flowDefRecords, (record: any) => {
        
            // Get the ID15 of this flow definition and others
            const id = sfdcManager.caseSafeId(record.Id);
            const activeVersionId = sfdcManager.caseSafeId(record.ActiveVersionId);
            const latestVersionId = sfdcManager.caseSafeId(record.LatestVersionId);

            // Create the instance
            const flowDefinition: SfdcFlow = flowDefinitionDataFactory.create({
                    properties: {
                    id: id,
                    name: record.DeveloperName,
                    apiVersion: record.ApiVersion,
                    currentVersionId: activeVersionId ?? latestVersionId,
                    isLatestCurrentVersion: activeVersionId === latestVersionId,
                    isVersionActive: activeVersionId ? true : false,
                    versionsCount: 0,
                    description: record.Description, // could be null from FlowDefinition (but not empty in the Setup UI where they show the latest active version description)
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.FLOW_DEFINITION)
                }, 
                dependencyData: flowDefinitionsDependencies,
                dependencyIdFields: [ 'id', 'currentVersionId' ]
            });
                
            // Add only the active flow (the ones we want to analyze)
            activeFlowIds.push(flowDefinition.currentVersionId);

            // Add it to the map
            return [ flowDefinition.id, flowDefinition ];
        }));

        // Add count of Flow verions (whatever they are active or not)
        logger?.log(`Parsing ${flowVersionsByDefRecords?.length} flow versions...`);
        await MediumProcessor.forEach(flowVersionsByDefRecords, async (record: any) => {
                
            // Get the ID15s of the parent flow definition
            const parentId = sfdcManager.caseSafeId(record.DefinitionId);

            // Get the parent Flow definition
            const flowDefinition : SfdcFlow | undefined = flowDefinitions.get(parentId);
            if (flowDefinition) {
                
                // Add to the version counter to the definition
                // Using += because using custom queryMore could return multiple batches
                flowDefinition.versionsCount += record.NbVersions;
            }
        });

        // Get information about the previous identified active flows using metadata api
        logger?.log(`Calling Tooling API Composite to get more information about these ${activeFlowIds?.length} flow versions...`);
        const records = await sfdcManager.readMetadataAtScale('Flow', activeFlowIds, [ 'UNKNOWN_EXCEPTION' ], logger); // There are GACKs throwing that errors for some flows!

        // Scan flow versions with Lightning Flow Scanner
        logger?.log(`Scanning ${records?.length} flows with Lightning Flow Scanner...`);
        const lfsViolations = await LFSScanner.scanFlows(records, sfdcManager.caseSafeId);
        logger?.log(`LFS gave us ${lfsViolations.size} violations.`);

        // Lets parse the flow versions by ourselves
        logger?.log(`Parsing ${records?.length} flow versions from Tooling API...`);
        await MediumProcessor.forEach(records, async (record: any)=> {

            // Get the ID15s of this flow version and parent flow definition
            const id = sfdcManager.caseSafeId(record.Id);
            const parentId = sfdcManager.caseSafeId(record.DefinitionId);
            const violations = lfsViolations.get(id) ?? [];

            // Create the instance
            const activeFlowVersion: SfdcFlowVersion = flowVersionDataFactory.create({
                properties: {
                    id: id,
                    name: record.FullName,
                    version: record.VersionNumber,
                    apiVersion: record.ApiVersion,
                    totalNodeCount: ['actionCalls', 'apexPluginCalls', 'assignments',
                                        'collectionProcessors', 'decisions', 'loops',
                                        'orchestratedStages', 'recordCreates', 'recordDeletes',
                                        'recordLookups', 'recordRollbacks', 'recordUpdates',
                                        'screens', 'steps', 'waits'
                                    ].reduce((count, property) => count + record.Metadata[property]?.length || 0, 0),
                    dmlCreateNodeCount: record.Metadata.recordCreates?.length || 0,
                    dmlDeleteNodeCount: record.Metadata.recordDeletes?.length || 0,
                    dmlUpdateNodeCount: record.Metadata.recordUpdates?.length || 0,
                    screenNodeCount: record.Metadata.screens?.length || 0,
                    sobject: record.Metadata.start?.object || '',
                    triggerType: record.Metadata.start?.triggerType || '',
                    recordTriggerType: record.Metadata.start?.recordTriggerType || '',
                    isActive: record.Status === 'Active',
                    description: record.Description,
                    type: PROCESSTYPE_TRANSLATION[record.ProcessType] || `Other (${record.ProcessType})`,
                    isProcessBuilder: record.ProcessType === 'Workflow',
                    isScreenFlow: record.ProcessType === 'Flow',
                    runningMode: record.RunInMode,
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    lfsViolations: violations,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.FLOW_VERSION)
                }
            });
            if (activeFlowVersion.isProcessBuilder === true) {
                record.Metadata.processMetadataValues?.forEach((m: any) => {
                    if (m.name === 'ObjectType') activeFlowVersion.sobject = m.value.stringValue;
                    if (m.name === 'TriggerType') activeFlowVersion.triggerType = m.value.stringValue;
                });
            }

            // Get the parent Flow definition
            const flowDefinition = flowDefinitions.get(parentId);

            if (flowDefinition) {
                // Set reference only to the active flow
                flowDefinition.currentVersionRef = activeFlowVersion;

                // Set some fields (type and description) from the active version to the definition level
                flowDefinition.type = activeFlowVersion.type;
                flowDefinition.isProcessBuilder = activeFlowVersion.isProcessBuilder;
                flowDefinition.isScreenFlow = activeFlowVersion.isScreenFlow;
                if (!flowDefinition.description) {
                    flowDefinition.description = activeFlowVersion.description;
                }
            }
        });

        // Compute the score of all definitions
        await MediumProcessor.forEach(flowDefinitions, async (flowDefinition: SfdcFlow) => flowDefinitionDataFactory.computeScore(flowDefinition));

        // Return data as map
        logger?.log(`Done`);
        return flowDefinitions;
    } 
}