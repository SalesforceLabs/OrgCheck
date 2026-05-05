import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcPermissionSetLicense } from 'src/api/data/orgcheck-api-data-permissionsetlicense';

export class DatasetPermissionSetLicenses implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcPermissionSetLicense>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcPermissionSetLicense>> {

        // First SOQL queries
        logger?.log(`Querying REST API about PermissionSetLicenses in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, MasterLabel, CreatedDate, LastModifiedDate, '+
                        'TotalLicenses, Status, ExpirationDate, UsedLicenses, IsAvailableForIntegrations '+
                    'FROM PermissionSetLicense '
        }, {
            string: 'SELECT Id, LicenseId '+ 
                    'FROM PermissionSet '+
                    'WHERE IsOwnedByProfile = false '+
                    'AND LicenseId <> NULL '
        }, {
            string: 'SELECT AssigneeId, PermissionSet.LicenseId ' +
                    'FROM PermissionSetAssignment ' +
                    'WHERE Assignee.IsActive = TRUE ' +
                    'AND PermissionSet.LicenseId <> NULL '+
                    'AND PermissionSet.IsOwnedByProfile = FALSE ' +
                    'ORDER BY PermissionSetId '
        }], logger);

        // Init the factory and records
        const permissionSetLicenseDataFactory = dataFactory.getInstance(DataAliases.SfdcPermissionSetLicense);
        const permissionSetLicenseRecords = results[0];
        const permissionSetsWithLicenseRecords = results[1];
        const assigneePermSetsWithLicenseRecords = results[2];

        // Create the map
        logger?.log(`Parsing ${permissionSetLicenseRecords?.length} permission sets licenses...`);
        const permissionSetLicenses: Map<string, SfdcPermissionSetLicense> = new Map(await MediumProcessor.map(permissionSetLicenseRecords, (record: any) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);
        
            // Create the instance
            const permissionSetLicense: SfdcPermissionSetLicense = permissionSetLicenseDataFactory.create({
                properties: {
                    id: id,
                    name: record.MasterLabel,
                    createdDate: record.CreatedDate, 
                    lastModifiedDate: record.LastModifiedDate, 
                    totalCount: record.TotalLicenses, 
                    usedCount: record.UsedLicenses,
                    usedPercentage: record.TotalLicenses !== 0 ? record.UsedLicenses / record.TotalLicenses : undefined,
                    remainingCount: record.TotalLicenses - record.UsedLicenses,
                    permissionSetIds: [],
                    distinctActiveAssigneeCount: 0,
                    status: record.Status, 
                    expirationDate: record.ExpirationDate, 
                    isAvailableForIntegrations: record.IsAvailableForIntegrations,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.PERMISSION_SET_LICENSE)
                }
            });

            // Add it to the map  
            return [ permissionSetLicense.id, permissionSetLicense ];
        }));

        logger?.log(`Parsing ${assigneePermSetsWithLicenseRecords?.length} permission sets with a link to a license...`);    
        const assigneePermSetLicense = new Map();    
        await MediumProcessor.forEach(assigneePermSetsWithLicenseRecords, async (record: any) => {
            if (record.PermissionSet && record.PermissionSet.LicenseId && record.PermissionSet.LicenseId.startsWith('0PL')) {
                const licenseId = sfdcManager.caseSafeId(record.PermissionSet.LicenseId);
                const assigneeId = sfdcManager.caseSafeId(record.AssigneeId);
                if (assigneePermSetLicense.has(licenseId) === false) {
                    assigneePermSetLicense.set(licenseId, new Set());
                }
                assigneePermSetLicense.get(licenseId).add(assigneeId);
                const permissionSeLicense = permissionSetLicenses.get(licenseId);
                if (permissionSeLicense) {
                    permissionSeLicense.distinctActiveAssigneeCount = assigneePermSetLicense.get(licenseId).size;
                }
            }
        });

        logger?.log(`Parsing ${permissionSetsWithLicenseRecords?.length} permission sets with a link to a license...`);
        await MediumProcessor.forEach(permissionSetsWithLicenseRecords, async (record: any) => {
            const permissionSetId = sfdcManager.caseSafeId(record.Id);
            const licenseId = sfdcManager.caseSafeId(record.LicenseId);
            const permissionSeLicense = permissionSetLicenses.get(licenseId);
            if (permissionSeLicense) {
                permissionSeLicense.permissionSetIds.push(permissionSetId);
            }
        });

        // Compute scores for all permission set licenses
        logger?.log(`Computing the score for ${permissionSetLicenses.size} permission set licenses...`);
        await MediumProcessor.forEach(permissionSetLicenses, async (record: any) => {
            permissionSetLicenseDataFactory.computeScore(record);
        });
        
        // Return data as map
        logger?.log(`Done.`);
        return permissionSetLicenses;
    } 
}