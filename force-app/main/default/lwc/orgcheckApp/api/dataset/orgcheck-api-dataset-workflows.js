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
                .then((results) => {
                    results[0].forEach((record)=> {
                        
                        // Get the ID15 of this user
                        const id = sfdcManager.caseSafeId(record.Id);

                        // Create the instance
                        const workflow = new SFDC_Workflow({
                            id: id,
                            name: record.FullName,
                            url: sfdcManager.setupUrl('workflow', id),
                            description: record.Metadata.description,
                            actions: record.Metadata.actions || [],
                            futureActions: record.Metadata.workflowTimeTriggers || [],
                            isActive: record.Metadata.active,
                            createdDate: record.CreatedDate,
                            lastModifiedDate: record.LastModifiedDate,
                            noAction: true
                        });
                        workflow.noAction = (workflow.actions.length == 0 && workflow.futureActions.length == 0);

                        // Add it to the map  
                        workflows.set(workflow.id, workflow);
                    });
                });

            // Return data
            resolve(workflows);
        }).catch(reject);
    } 
}