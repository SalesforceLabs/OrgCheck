import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { SFDC_Workflow } from '../data/orgcheck-api-data-workflow';

export class OrgCheckDatasetWorkflows extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL query
        // (only ids because metadata can't be read via SOQL in bulk!
        localLogger.log(`Querying Tooling API about WorkflowRule in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            string: 'SELECT Id FROM WorkflowRule', 
            tooling: true 
        }], localLogger);
        
        // List of flow ids
        const workflowRuleRecords = results[0].records;
        localLogger.log(`Parsing ${workflowRuleRecords.length} Workflow Rules...`);
        const workflowRuleIds = await OrgCheckProcessor.carte(workflowRuleRecords, (record) => record.Id);

        // Init the factory and records
        const workflowDataFactory = dataFactory.getInstance(SFDC_Workflow);

        // Get information about flows and process builders using metadata
        localLogger.log(`Calling Tooling API Composite to get more information about these ${workflowRuleIds.length} workflow rules...`);
        const records = await sfdcManager.readMetadataAtScale('WorkflowRule', workflowRuleIds, [ 'UNKNOWN_EXCEPTION' ]);

        // Create the map
        localLogger.log(`Parsing ${records.length} workflows...`);
        const workflows = new Map(await OrgCheckProcessor.carte(records, async (record) => {

            // Get the ID15 of this user
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const workflow = workflowDataFactory.create({
                id: id,
                name: record.FullName,
                url: sfdcManager.setupUrl('workflow', id),
                description: record.Metadata.description,
                isActive: record.Metadata.active,
                createdDate: record.CreatedDate,
                lastModifiedDate: record.LastModifiedDate,
                hasAction: true,
                futureActions: [],
                emptyTimeTriggers: []
            });

            // Add information about direction actions
            const directActions = record.Metadata.actions;
            workflow.actions = await OrgCheckProcessor.carte(
                directActions,
                (action) => { return { name: action.name, type: action.type } }
            );

            // Add information about time triggered actions
            const timeTriggers = record.Metadata.workflowTimeTriggers;
            await OrgCheckProcessor.chaque(
                timeTriggers, 
                async (tt) => {
                    const field = tt.offsetFromField || 'TriggerDate';
                    if (tt.actions.length === 0) {
                        workflow.emptyTimeTriggers.push({
                            field: field,
                            delay: `${tt.timeLength} ${tt.workflowTimeTriggerUnit}`
                        });
                    } else {
                        await OrgCheckProcessor.chaque(
                            tt.actions,
                            (action) => {
                                workflow.futureActions.push({ 
                                    name: action.name, 
                                    type: action.type, 
                                    field: field,
                                    delay: `${tt.timeLength} ${tt.workflowTimeTriggerUnit}` 
                                });
                            }
                        )
                    }
                }
            );

            // Add number of actions (direct or future)
            workflow.hasAction = (workflow.actions.length + workflow.futureActions.length > 0);

            // Compute the score of this item
            workflowDataFactory.computeScore(workflow);

            // Add it to the map  
            return [ workflow.id, workflow ];
        }));

        // Return data as map
        localLogger.log(`Done`);
        return workflows;
    } 
}