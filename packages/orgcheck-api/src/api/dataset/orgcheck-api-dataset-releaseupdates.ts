import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcReleaseUpdate } from 'src/api/data/orgcheck-api-data-releaseupdate';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';

export class DatasetReleaseUpdates implements Dataset {
    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcReleaseUpdate>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcReleaseUpdate>> {
        // SOQL query
        logger?.log(`Querying Tooling API about ReleaseUpdate records in the org...`);
        const results = await sfdcManager.soqlQuery([{
            tooling: true,
            string: 'SELECT DurableId, Title, Category, DueDate, IsReleased, '+
                        'NumCompSteps, NumSteps, ReleaseLabel, Status ' +
                    'FROM ReleaseUpdate '
        }], logger);

        // Init the factory and records
        const releaseUpdateDataFactory = dataFactory.getInstance(DataAliases.SfdcReleaseUpdate);

        // Create the map
        const releaseUpdateRecords = results[0];
        logger?.log(`Parsing ${releaseUpdateRecords?.length} release updates...`);
        const releaseUpdates: Map<string, SfdcReleaseUpdate> = new Map(await MediumProcessor.map(releaseUpdateRecords, (record: any) => {
            const nbCompletedSteps = record.NumCompSteps > 0 ? record.NumCompSteps : 0;
            const nbAllSteps = record.NumSteps > 0 ? record.NumSteps : 0;
            const dueDateInTimestamp = record.DueDate ? Date.parse(record.DueDate) : undefined;
            const diff = dueDateInTimestamp ? (dueDateInTimestamp - Date.now()) : undefined;
            const remainingDaysBeforeDueDate = (diff !== undefined && diff >= 0) ? (diff/1000/60/60/24) : undefined;
            const releaseUpdate: SfdcReleaseUpdate = releaseUpdateDataFactory.createWithScore({
                properties: {
                    id: record.DurableId,
                    name: record.Title,
                    category: record.Category,
                    dueDate: dueDateInTimestamp,
                    remainingDaysBeforeDueDate: remainingDaysBeforeDueDate,
                    isReleased: record.IsReleased === true,
                    nbCompletedSteps: nbCompletedSteps,
                    nbAllSteps: nbAllSteps,
                    completionPercentage: nbAllSteps > 0 ? nbCompletedSteps / nbAllSteps : 1,
                    sfdcReleaseLabel: record.ReleaseLabel ?? '',
                    status: record.Status,
                    url: sfdcManager.setupUrl(record.DurableId, SalesforceMetadataTypes.RELEASE_UPDATE)
                }
            });
            return [releaseUpdate.id, releaseUpdate];
        }));

        // Return data as map
        logger?.log(`Done.`);
        return releaseUpdates;
    }
}
