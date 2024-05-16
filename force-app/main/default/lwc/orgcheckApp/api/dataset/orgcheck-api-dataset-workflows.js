import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_Workflow } from '../data/orgcheck-api-data-workflow';

export class OrgCheckDatasetWorkflows extends OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject) {

        // List all ids for Workflow Rules
        // (only ids because metadata can't be read via SOQL in bulk!
        sfdcManager.soqlQuery([{ 
            string: 'SELECT Id FROM WorkflowRule', 
            tooling: true 
        }]).then((results) => {
            
            // List of flow ids
            localLogger.log(`Parsing ${results[0].records.length} Workflow Rules...`);
            const workflowRuleIds = results[0].records.map((record) => record.Id);

            // Init the map
            const workflows = new Map();

            // Init the factory
            const workflowDataFactory = dataFactory.getInstance(SFDC_Workflow);

            // Get information about flows and process builders using metadata
            localLogger.log(`Calling Composite Tooling API to get Metadata information about ${workflowRuleIds.length} workflow rules...`);
            sfdcManager.readMetadataAtScale('WorkflowRule', workflowRuleIds, [ 'UNKNOWN_EXCEPTION' ])
                .then((records) => {
                    localLogger.log(`Parsing ${records.length} Workflows Rules...`);
                    records.forEach((record)=> {
                        
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
                        const directActions = record.Metadata.actions;
                        if (directActions) {
                            workflow.actions = directActions.map((action) => { 
                                return { name: action.name, type: action.type }; 
                            });
                        } else {
                            workflow.actions = [];
                        }
                        const timeTriggers = record.Metadata.workflowTimeTriggers;
                        if (timeTriggers) {
                            timeTriggers.forEach((tt) => {
                                const field = tt.offsetFromField || 'TriggerDate';
                                if (tt.actions.length === 0) {
                                    workflow.emptyTimeTriggers.push({
                                        field: field,
                                        delay: `${tt.timeLength} ${tt.workflowTimeTriggerUnit}`
                                    });
                                } else {
                                    tt.actions.forEach((action) => {
                                        workflow.futureActions.push({ 
                                            name: action.name, 
                                            type: action.type, 
                                            field: field,
                                            delay: `${tt.timeLength} ${tt.workflowTimeTriggerUnit}` 
                                        });
                                    })
                                }
                            });
                        }
                        workflow.hasAction = (workflow.actions.length + workflow.futureActions.length > 0);

                        // Compute the score of this item
                        workflowDataFactory.computeScore(workflow);

                        // Add it to the map  
                        workflows.set(workflow.id, workflow);
                    });

                    // Return data
                    resolve(workflows);
                    
                }).catch(reject);
        }).catch(reject);
    } 
}