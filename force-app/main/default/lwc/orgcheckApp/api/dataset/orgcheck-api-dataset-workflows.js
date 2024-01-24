import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_Workflow } from '../data/orgcheck-api-data-workflow';

export class OrgCheckDatasetWorkflows extends OrgCheckDataset {

    run(sfdcManager, resolve, reject) {

        // List all ids for Workflow Rules
        // (only ids because metadata can't be read via SOQL in bulk!
        sfdcManager.soqlQuery([{ 
            string: 'SELECT Id FROM WorkflowRule', 
            tooling: true 
        }]).then((results) => {
            
            // List of flow ids
            const workflowRuleIds = results[0].records.map((record) => record.Id);

            // Init the map
            const workflows = new Map();

            // Get information about flows and process builders using metadata
            sfdcManager.readMetadataAtScale('WorkflowRule', workflowRuleIds, [ 'UNKNOWN_EXCEPTION' ])
                .then((records) => {
                    records.forEach((record)=> {
                        
                        // Get the ID15 of this user
                        const id = sfdcManager.caseSafeId(record.Id);

                        // Create the instance
                        const workflow = new SFDC_Workflow({
                            id: id,
                            name: record.FullName,
                            url: sfdcManager.setupUrl('workflow', id),
                            description: record.Metadata.description,
                            isActive: record.Metadata.active,
                            createdDate: record.CreatedDate,
                            lastModifiedDate: record.LastModifiedDate,
                            hasAction: true,
                            futureActions: [],
                            emptyTimeTriggers: [],
                            description: record.description,
                            isScoreNeeded: true
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
                        workflow.hasAction = (workflow.actions.length === 0 && workflow.futureActions.length === 0);

                        // Compute the score of this workflow, with the following rule:
                        //  - If the workflow is not active, then you get +1.
                        //  - If the workflow ihas no action (either direct or future), then you get +1.
                        //  - If the workflow has timetrigger with no action, then you get +1.
                        //  - If the field has no description, then you get +1.
                        if (workflow.isActive === false) workflow.setBadField('isActive');
                        if (workflow.hasAction === false) workflow.setBadField('hasAction');
                        if (workflow.emptyTimeTriggers.length > 0) workflow.setBadField('emptyTimeTriggers');
                        if (sfdcManager.isEmpty(workflow.description)) workflow.setBadField('description');

                        // Add it to the map  
                        workflows.set(workflow.id, workflow);
                    });

                    // Return data
                    resolve(workflows);
                    
                }).catch(reject);
        }).catch(reject);
    } 
}