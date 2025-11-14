import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_PermissionSetLicense } from '../data/orgcheck-api-data-permissionsetlicense';

export class DatasetPermissionSetLicenses extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_PermissionSetLicense>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

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
        const permissionSetLicenseDataFactory = dataFactory.getInstance(SFDC_PermissionSetLicense);
        const permissionSetLicenseRecords = results[0];
        const permissionSetsWithLicenseRecords = results[1];
        const assigneePermSetsWithLicenseRecords = results[2];

        // Create the map
        logger?.log(`Parsing ${permissionSetLicenseRecords.length} permission sets licenses...`);
        const permissionSetLicenses = new Map(await Processor.map(permissionSetLicenseRecords, (/** @type {any} */ record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);
        
            // Create the instance
            /** @type {SFDC_PermissionSetLicense} */
            const permissionSetLicense = permissionSetLicenseDataFactory.create({
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

        logger?.log(`Parsing ${assigneePermSetsWithLicenseRecords.length} Permission Sets with a link to a License...`);    
        const assigneePermSetLicense = new Map();    
        await Processor.forEach(assigneePermSetsWithLicenseRecords, (/** @type {any} */ record) => {
            if (record.PermissionSet && record.PermissionSet.LicenseId && record.PermissionSet.LicenseId.startsWith('0PL')) {
                const licenseId = sfdcManager.caseSafeId(record.PermissionSet.LicenseId);
                const assigneeId = sfdcManager.caseSafeId(record.AssigneeId);
                if (assigneePermSetLicense.has(licenseId) === false) {
                    assigneePermSetLicense.set(licenseId, new Set());
                }
                assigneePermSetLicense.get(licenseId).add(assigneeId);
                permissionSetLicenses.get(licenseId).distinctActiveAssigneeCount = assigneePermSetLicense.get(licenseId).size;
            }
        });

        logger?.log(`Parsing ${permissionSetsWithLicenseRecords.length} Permission Sets with a link to a License...`);
        await Processor.forEach(permissionSetsWithLicenseRecords, (/** @type {any} */ record) => {
            const permissionSetId = sfdcManager.caseSafeId(record.Id);
            const licenseId = sfdcManager.caseSafeId(record.LicenseId);
            if (permissionSetLicenses.has(licenseId)) {
                permissionSetLicenses.get(licenseId).permissionSetIds.push(permissionSetId);
            }
        });

        // Compute scores for all permission set licenses
        logger?.log(`Computing the score for ${permissionSetLicenses.size} permission set licenses...`);
        await Processor.forEach(permissionSetLicenses, (/** @type {any} */ record) => {
            permissionSetLicenseDataFactory.computeScore(/** @type {any} */ record);
        });
        
        // Return data as map
        logger?.log(`Done`);
        return permissionSetLicenses;
    } 
}