import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_Workflow } from '../data/orgcheck-api-data-workflow';

export class DatasetWorkflows extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_Workflow>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        // (only ids because metadata can't be read via SOQL in bulk!
        logger?.log(`Querying Tooling API about WorkflowRule in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id FROM WorkflowRule',
            tooling: true
        }], logger);
        
        // List of flow ids
        const workflowRuleRecords = results[0];
        logger?.log(`Parsing ${workflowRuleRecords.length} Workflow Rules...`);
        const workflowRuleIds = await Processor.map(workflowRuleRecords, (/** @type {any} */ record) => record.Id);

        // Init the factory and records
        const workflowDataFactory = dataFactory.getInstance(SFDC_Workflow);

        // Get information about flows and process builders using metadata
        logger?.log(`Calling Tooling API Composite to get more information about these ${workflowRuleIds.length} workflow rules...`);
        const records = await sfdcManager.readMetadataAtScale('WorkflowRule', workflowRuleIds, [ 'UNKNOWN_EXCEPTION' ], logger);

        // Create the map
        logger?.log(`Parsing ${records.length} workflows...`);
        const workflows = new Map(await Processor.map(records, async (/** @type {any} */ record) => {

            // Get the ID15 of this user
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_Workflow} */
            const workflow = workflowDataFactory.create({
                properties: {
                    id: id,
                    name: record.FullName,
                    description: record.Metadata.description,
                    isActive: record.Metadata.active,
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    hasAction: true,
                    futureActions: [],
                    emptyTimeTriggers: [],
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.WORKFLOW_RULE)
                }
            });

            // Add information about direction actions
            const directActions = record.Metadata.actions;
            workflow.actions = await Processor.map(
                directActions,
                (/** @type {any} */ action) => { return { name: action.name, type: action.type } }
            );

            // Add information about time triggered actions
            const timeTriggers = record.Metadata.workflowTimeTriggers;
            await Processor.forEach(
                timeTriggers, 
                (/** @type {any} */ tt) => {
                    const field = tt.offsetFromField || 'TriggerDate';
                    if (tt.actions.length === 0) {
                        workflow.emptyTimeTriggers.push({
                            field: field,
                            delay: `${tt.timeLength} ${tt.workflowTimeTriggerUnit}`
                        });
                    } else {
                        tt.actions.forEach((/** @type {any} */ action) => {
                            workflow.futureActions.push({ 
                                name: action.name, 
                                type: action.type, 
                                field: field,
                                delay: `${tt.timeLength} ${tt.workflowTimeTriggerUnit}` 
                            });
                        });
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
        logger?.log(`Done`);
        return workflows;
    } 
}