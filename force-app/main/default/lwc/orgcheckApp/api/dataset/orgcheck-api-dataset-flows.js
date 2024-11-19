import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { TYPE_FLOW_DEFINITION, TYPE_FLOW_VERSION } from '../core/orgcheck-api-sfconnectionmanager';
import { SFDC_Flow, SFDC_FlowVersion } from '../data/orgcheck-api-data-flow';

export class OrgCheckDatasetFlows extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL query
        localLogger.log(`Querying Tooling API about FlowDefinition in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            // List all FlowDefinition (on top of flow verions)
            string: 'SELECT Id, MasterLabel, DeveloperName, ApiVersion, Description, ActiveVersionId, '+
                        'LatestVersionId, CreatedDate, LastModifiedDate '+
                    'FROM FlowDefinition',
            tooling: true
        }, {
            // List all Flow (attached to a FlowDefintion)
            string: 'SELECT Id, DefinitionId, Status, ProcessType FROM Flow where DefinitionId <> null',
            tooling: true
        }], localLogger);
            
        // Init the factories
        const flowDefinitionDataFactory = dataFactory.getInstance(SFDC_Flow);
        const flowVersionDataFactory = dataFactory.getInstance(SFDC_FlowVersion);
        const flowDefRecords = results[0].records;
        const flowRecords = results[1].records;
        
        // Then retreive dependencies
        localLogger.log(`Retrieving dependencies of ${flowDefRecords.length} flow versions...`);
        const flowDefinitionsDependencies = await sfdcManager.dependenciesQuery(
            await OrgCheckProcessor.map(flowDefRecords, (record) => sfdcManager.caseSafeId(record.ActiveVersionId ?? record.LatestVersionId)), 
            localLogger
        );
        
        // List of active flows that we need to get information later (with Metadata API)
        const activeFlowIds = [];

        // Create the map
        localLogger.log(`Parsing ${flowDefRecords.length} flow definitions...`);
        const flowDefinitions = new Map(await OrgCheckProcessor.map(flowDefRecords, (record) => {
        
            // Get the ID15 of this flow definition and others
            const id = sfdcManager.caseSafeId(record.Id);
            const activeVersionId = sfdcManager.caseSafeId(record.ActiveVersionId);
            const latestVersionId = sfdcManager.caseSafeId(record.LatestVersionId);

            // Create the instance
            const flowDefinition = flowDefinitionDataFactory.create({
                    properties: {
                    id: id,
                    name: record.DeveloperName,
                    apiVersion: record.ApiVersion,
                    currentVersionId: activeVersionId ?? latestVersionId,
                    isLatestCurrentVersion: activeVersionId === latestVersionId,
                    isVersionActive: activeVersionId ? true : false,
                    versionsCount: 0,
                    description: record.Description,
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    url: sfdcManager.setupUrl(id, TYPE_FLOW_DEFINITION)
                }, 
                dependencies: {
                    data: flowDefinitionsDependencies,
                    idField: 'currentVersionId'
                }
            });
                
            // Add only the active flow (the ones we want to analyze)
            activeFlowIds.push(flowDefinition.currentVersionId);

            // Add it to the map
            return [ flowDefinition.id, flowDefinition ];
        }));

        // Add count of Flow verions (whatever they are active or not)
        localLogger.log(`Parsing ${flowRecords.length} flow versions...`);
        await OrgCheckProcessor.forEach(flowRecords, (record) => {
                
            // Get the ID15s of the parent flow definition
            const parentId = sfdcManager.caseSafeId(record.DefinitionId);

            // Get the parent Flow definition
            const flowDefinition = flowDefinitions.get(parentId);

            // Add to the version counter (whatever the status);
            flowDefinition.versionsCount++;
            flowDefinition.type = record.ProcessType;
        });

        // Get information about the previous identified active flows using metadata api
        localLogger.log(`Calling Tooling API Composite to get more information about these ${activeFlowIds.length} flow versions...`);
        const records = await sfdcManager.readMetadataAtScale('Flow', activeFlowIds, [ 'UNKNOWN_EXCEPTION' ], localLogger); // There are GACKs throwing that errors for some flows!

        localLogger.log(`Parsing ${records.length} flow versions...`);
        await OrgCheckProcessor.forEach(records, async (record)=> {

            // Get the ID15s of this flow version and parent flow definition
            const id = sfdcManager.caseSafeId(record.Id);
            const parentId = sfdcManager.caseSafeId(record.DefinitionId);

            // Create the instance
            const activeFlowVersion = flowVersionDataFactory.create({
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
                    isActive: record.Status === 'Active',
                    description: record.Description,
                    type: record.ProcessType,
                    runningMode: record.RunInMode,
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    url: sfdcManager.setupUrl(id, TYPE_FLOW_VERSION)
                }
            });
            await OrgCheckProcessor.forEach(
                record.Metadata.processMetadataValues,
                (m) => {
                    if (m.name === 'ObjectType') activeFlowVersion.sobject = m.value.stringValue;
                    if (m.name === 'TriggerType') activeFlowVersion.triggerType = m.value.stringValue;
                },
                (m) => m.name === 'ObjectType' || m.name === 'TriggerType'
            );

            // Get the parent Flow definition
            const flowDefinition = flowDefinitions.get(parentId);

            // Set reference only to the active flow
            flowDefinition.currentVersionRef = activeFlowVersion;
        });

        // Compute the score of all definitions
        await OrgCheckProcessor.forEach(flowDefinitions, (flowDefinition) => flowDefinitionDataFactory.computeScore(flowDefinition));

        // Return data as map
        localLogger.log(`Done`);
        return flowDefinitions;
    } 
}