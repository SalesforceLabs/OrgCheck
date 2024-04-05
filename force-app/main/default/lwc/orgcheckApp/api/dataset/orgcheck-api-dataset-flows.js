import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_Flow } from '../data/orgcheck-api-data-flow';

export class OrgCheckDatasetFlows extends OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject) {

        // List all ids for Flows and Process Builders
        // (only ids because metadata can't be read via SOQL in bulk!
        sfdcManager.soqlQuery([{ 
            string: 'SELECT Id FROM Flow', 
            addDependenciesBasedOnField: 'Id',
            tooling: true 
        }]).then((results) => {
            
            // List of flow ids
            localLogger.log(`Parsing ${results[0].records.length} Flows...`);
            const flowIds = results[0].records.map((record) => record.Id);

            // Init the map
            const flows = new Map();

            // Init the factory
            const flowDataFactory = dataFactory.getInstance(SFDC_Flow);

            // Get information about flows and process builders using metadata
            localLogger.log(`Calling Composite Tooling API to get Metadata information about ${flowIds.length} flows...`);
            sfdcManager.readMetadataAtScale('Flow', flowIds, [ 'UNKNOWN_EXCEPTION' ])
                .then((records) => {
                    localLogger.log(`Parsing ${records.length} Flows...`);
                    records.forEach((record)=> {
                        
                        // Get the ID15 of this user
                        const id = sfdcManager.caseSafeId(record.Id);

                        // Create the instance
                        const flow = flowDataFactory.create({
                            id: id,
                            name: record.FullName,
                            url: sfdcManager.setupUrl('flow', id),
                            definitionId: sfdcManager.caseSafeId(record.DefinitionId),
                            definitionName: record.MasterLabel,
                            version: record.VersionNumber,
                            apiVersion: record.ApiVersion,
                            dmlCreates: record.Metadata.recordCreates?.length || 0,
                            dmlDeletes: record.Metadata.recordDeletes?.length || 0,
                            dmlUpdates: record.Metadata.recordUpdates?.length || 0,
                            isActive: record.Status === 'Active',
                            description: record.Description,
                            type: record.ProcessType,
                            createdDate: record.CreatedDate,
                            lastModifiedDate: record.LastModifiedDate,
                                isDependenciesNeeded: true,
                            dependenciesFor: 'id',
                            allDependencies: results[0].allDependencies
                        });
                        record.Metadata.processMetadataValues?.forEach(m => {
                            if (m.name === 'ObjectType') flow.sobject = m.value.stringValue;
                            if (m.name === 'TriggerType') flow.triggerType = m.value.stringValue;
                        });

                        // Compute the score of this item
                        flowDataFactory.computeScore(flow);
                        /*
                        if (flow.isActive === false) flow.setBadField('isActive');
                        if (sfdcManager.isEmpty(flow.description)) flow.setBadField('description');
                        if (flow.isItReferenced() === false) flow.setBadField('dependencies.referenced');
                        */

                        // Add it to the map  
                        flows.set(flow.id, flow);
                    });

                    // Return data
                    resolve(flows);

                }).catch(reject);
        }).catch(reject);
    } 
}