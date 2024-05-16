import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_Flow, SFDC_FlowVersion } from '../data/orgcheck-api-data-flow';

export class OrgCheckDatasetFlows extends OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject) {

        // Init the factories
        const flowDefinitionDataFactory = dataFactory.getInstance(SFDC_Flow);
        const flowVersionDataFactory = dataFactory.getInstance(SFDC_FlowVersion);
        
        // SOQL queries
        sfdcManager.soqlQuery([{
            // List all FlowDefinition (on top of flow verions)
            string: 'SELECT Id, MasterLabel, DeveloperName, ApiVersion, Description, ActiveVersionId, '+
                        'LatestVersionId, CreatedDate, LastModifiedDate '+
                    'FROM FlowDefinition',
            addDependenciesBasedOnField: ['ActiveVersionId', 'LatestVersionId'],
            tooling: true
        }, {
            // List all Flow (attached to a FlowDefintion)
            string: 'SELECT Id, DefinitionId, Status, ProcessType FROM Flow where DefinitionId <> null',
            tooling: true
        }]).then((results) => {
            
            // Init the maps
            const flowDefinitions = new Map();
            const activeFlowIds = [];

            // Map of flow definitions
            localLogger.log(`Parsing ${results[0].records.length} flow definitions...`);
            results[0].records.forEach((record) => {

                // Get the ID15 of this flow definition
                const id = sfdcManager.caseSafeId(record.Id);
                const activeVersionId = sfdcManager.caseSafeId(record.ActiveVersionId);
                const latestVersionId = sfdcManager.caseSafeId(record.LatestVersionId);

                // Create the instance
                const flowDefinition = flowDefinitionDataFactory.create({
                    id: id,
                    name: record.DeveloperName,
                    url: sfdcManager.setupUrl('flowDefinition', id),
                    apiVersion: record.ApiVersion,
                    currentVersionId: activeVersionId ?? latestVersionId,
                    isLatestCurrentVersion: activeVersionId === latestVersionId,
                    isVersionActive: activeVersionId ? true : false,
                    versionsCount: 0,
                    description: record.Description,
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    dependenciesFor: 'currentVersionId',
                    allDependencies: results[0].allDependencies
                });
                
                // Add only the active flow (the ones we want to analyze)
                activeFlowIds.push(flowDefinition.currentVersionId);

                // Add it to the map
                flowDefinitions.set(id, flowDefinition);
            });

            // Add count of Flow verions (whatever they are active or not)
            localLogger.log(`Parsing ${results[1].records.length} flow versions...`);
            results[1].records.forEach((record) => {
                
                // Get the ID15s of the parent flow definition
                const parentId = sfdcManager.caseSafeId(record.DefinitionId);

                // Get the parent Flow definition
                const flowDefinition = flowDefinitions.get(parentId);

                // Add to the version counter (whatever the status);
                flowDefinition.versionsCount++;
                flowDefinition.type = record.ProcessType;
                flowDefinition.isProcessBuilder = 'Workflow';
            });

            // Get information about flows and process builders using metadata
            localLogger.log(`Calling Composite Tooling API to get Metadata information about ${activeFlowIds.length} flow versions...`);
            sfdcManager.readMetadataAtScale('Flow', activeFlowIds, [ 'UNKNOWN_EXCEPTION' ]) // There are GACKs throwing that errors for some flows!
                .then((records) => {
                    localLogger.log(`Parsing ${records.length} flow versions...`);
                    records.forEach((record)=> {

                        // Get the ID15s of this flow version and parent flow definition
                        const id = sfdcManager.caseSafeId(record.Id);
                        const parentId = sfdcManager.caseSafeId(record.DefinitionId);

                        // Create the instance
                        const activeFlowVersion = flowVersionDataFactory.create({
                            id: id,
                            name: record.FullName,
                            url: sfdcManager.setupUrl('flow', id),
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
                            lastModifiedDate: record.LastModifiedDate
                        });
                        record.Metadata.processMetadataValues?.filter(m => m.name === 'ObjectType' || m.name === 'TriggerType').forEach(m => {
                            if (m.name === 'ObjectType') activeFlowVersion.sobject = m.value.stringValue;
                            if (m.name === 'TriggerType') activeFlowVersion.triggerType = m.value.stringValue;
                        });

                        // Get the parent Flow definition
                        const flowDefinition = flowDefinitions.get(parentId);

                        // Set reference only to the active flow
                        flowDefinition.currentVersionRef = activeFlowVersion;
                    });

                    // Compute the score of all definitions
                    flowDefinitions.forEach(flowDefinition => flowDefinitionDataFactory.computeScore(flowDefinition));

                    // Return data
                    resolve(flowDefinitions);

                }).catch(reject);
        }).catch(reject);
    } 
}