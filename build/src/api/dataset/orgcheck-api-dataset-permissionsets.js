import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';

export class DatasetPermissionSets extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_PermissionSet>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL queries
        logger?.log(`Querying REST API about PermissionSet, PermissionSetAssignment and PermissionSet (with a PermissionSetGroupId populated) in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, Description, IsCustom, License.Name, NamespacePrefix, Type, ' +
                        'PermissionsApiEnabled, PermissionsViewSetup, PermissionsModifyAllData, PermissionsViewAllData, ' +
                        'PermissionsManageUsers, PermissionsCustomizeApplication, ' +
                        'CreatedDate, LastModifiedDate ' +
                    'FROM PermissionSet ' +
                    'WHERE IsOwnedByProfile = FALSE '+
                    'ORDER BY Id '+
                    'LIMIT 2000'
        }, {
            byPasses: ['INVALID_TYPE'], // in some org PermissionSetGroup is not defined!
            string: 'SELECT Id, PermissionSetGroupId, PermissionSetGroup.Description ' +
                    'FROM PermissionSet ' +
                    'WHERE PermissionSetGroupId != null '+
                    'ORDER BY Id '+
                    'LIMIT 2000'
        }, {
            string: 'SELECT ParentId, COUNT(SobjectType) CountObject '+ 
                    'FROM ObjectPermissions '+
                    'WHERE Parent.IsOwnedByProfile = FALSE '+
                    'GROUP BY ParentId '+
                    'ORDER BY ParentId '+
                    'LIMIT 2000'
        }, {
            string: 'SELECT ParentId, COUNT(Field) CountField '+ 
                    'FROM FieldPermissions '+
                    'WHERE Parent.IsOwnedByProfile = FALSE '+
                    'GROUP BY ParentId '+
                    'ORDER BY ParentId '+
                    'LIMIT 2000'
        }, {
            string: 'SELECT PermissionSetId, COUNT(Id) CountAssignment '+ 
                    'FROM PermissionSetAssignment '+
                    'WHERE PermissionSet.IsOwnedByProfile = FALSE '+
                    'AND Assignee.IsActive = TRUE '+
                    'GROUP BY PermissionSetId '+
                    'ORDER BY PermissionSetId '+
                    'LIMIT 2000'
        }, {
            string: 'SELECT PermissionSetGroupId, PermissionSetId ' + 
                    'FROM PermissionSetGroupComponent ' +
                    'WHERE PermissionSet.IsOwnedByProfile = FALSE ' +
                    'ORDER BY PermissionSetGroupId '+
                    'LIMIT 2000'
        }], logger);

        // All salesforce records
        const permissionSetRecords = results[0];
        const permissionSetGroupRecords = results[1];
        const objectPermissionRecords = results[2];
        const fieldPermissionRecords = results[3];
        const userAssignmentRecords = results[4];
        const psAssignmentRecords = results[5];

        // Init the factory and records
        const permissionSetDataFactory = dataFactory.getInstance(SFDC_PermissionSet);

        // Create the map of permission sets
        logger?.log(`Parsing ${permissionSetRecords.length} permission sets...`);
        const permissionSets = new Map(await Processor.map(permissionSetRecords, (/** @type {any} */ record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);
        
            // Is it a permission set or a permission set group?
            const isPermissionSetGroup = (record.Type === 'Group'); // other values can be 'Regular', 'Standard', 'Session'

            // Create the instance
            /** @type {SFDC_PermissionSet} */
            const permissionSet = permissionSetDataFactory.create({
                properties: {
                    id: id,
                    name: record.Name,
                    description: record.Description,
                    license: (record.License ? record.License.Name : ''),
                    isCustom: record.IsCustom,
                    package: (record.NamespacePrefix || ''),
                    memberCounts: 0, // default value, may be changed in second SOQL
                    allIncludingGroupsAreEmpty: false, // default value
                    permissionSetIds: [],
                    permissionSetGroupIds: [],
                    isGroup: isPermissionSetGroup,
                    type: (isPermissionSetGroup ? 'Permission Set Group' : 'Permission Set'),
                    createdDate: record.CreatedDate, 
                    lastModifiedDate: record.LastModifiedDate,
                    nbFieldPermissions: 0,
                    nbObjectPermissions: 0,
                    importantPermissions: {
                        apiEnabled: record.PermissionsApiEnabled === true,
                        viewSetup: record.PermissionsViewSetup === true, 
                        modifyAllData: record.PermissionsModifyAllData === true, 
                        viewAllData: record.PermissionsViewAllData === true,
                        manageUsers: record.PermissionsManageUsers === true,
                        customizeApplication: record.PermissionsCustomizeApplication === true
                    },
                    isAdminLike: (
                        record.PermissionsModifyAllData === true || 
                        record.PermissionsViewAllData === true ||
                        record.PermissionsManageUsers === true || 
                        record.PermissionsCustomizeApplication === true
                    ),
                    url: (isPermissionSetGroup === false ? sfdcManager.setupUrl(id, SalesforceMetadataTypes.PERMISSION_SET) : '')
                }
            });

            // Add it to the map  
            return [ permissionSet.id, permissionSet ];
        }));

        logger?.log(`Parsing ${permissionSetGroupRecords.length} permission set groups, ${objectPermissionRecords.length} object permissions and ${fieldPermissionRecords.length} field permissions...`);
        const psgToPsIds = new Map();
        await Promise.all([
            Processor.forEach(permissionSetGroupRecords, (/** @type {any} */ record) => {
                const permissionSetId = sfdcManager.caseSafeId(record.Id);
                const permissionSetGroupId = sfdcManager.caseSafeId(record.PermissionSetGroupId);
                if (permissionSets.has(permissionSetId)) {
                    const permissionSet = permissionSets.get(permissionSetId);
                    permissionSet.isGroup = true;
                    permissionSet.groupId = permissionSetGroupId;
                    permissionSet.description = record.PermissionSetGroup?.Description ?? '';
                    permissionSet.url = sfdcManager.setupUrl(permissionSetGroupId, SalesforceMetadataTypes.PERMISSION_SET_GROUP);
                    psgToPsIds.set(permissionSetGroupId, permissionSetId);
                }
            }),
            Processor.forEach(objectPermissionRecords, (/** @type {any} */ record) => {
                const permissionSetId = sfdcManager.caseSafeId(record.ParentId);
                if (permissionSets.has(permissionSetId)) {
                    const permissionSet = permissionSets.get(permissionSetId);
                    permissionSet.nbObjectPermissions = record.CountObject;
                }
            }),
            Processor.forEach(fieldPermissionRecords, (/** @type {any} */ record) => {
                const permissionSetId = sfdcManager.caseSafeId(record.ParentId);
                if (permissionSets.has(permissionSetId)) {
                    const permissionSet = permissionSets.get(permissionSetId);
                    permissionSet.nbFieldPermissions = record.CountField;    
                }
            }),
            Processor.forEach(userAssignmentRecords, (/** @type {any} */ record) => {
                const permissionSetId = sfdcManager.caseSafeId(record.PermissionSetId);
                if (permissionSets.has(permissionSetId)) {
                    const permissionSet = permissionSets.get(permissionSetId);
                    permissionSet.memberCounts = record.CountAssignment;    
                }
            })
        ]);

        // Once all the ps and psg are in the map we can check the following:
        logger?.log(`Checking the ${psAssignmentRecords.length} Permission Set assignments to Permission Set Groups...`);
        const psgMemberCountSumByPermissionSetId = new Map();        
        await Processor.forEach(psAssignmentRecords, (/** @type {any} */ record) => {
            const permissionSetId = sfdcManager.caseSafeId(record.PermissionSetId);
            const permissionSetGroupId = sfdcManager.caseSafeId(record.PermissionSetGroupId);
            const permissionSetGroup_psId = psgToPsIds.get(permissionSetGroupId);
            if (permissionSets.has(permissionSetId) && permissionSets.has(permissionSetGroup_psId)) {
                const permissionSet = permissionSets.get(permissionSetId);
                const permissionSetGroup = permissionSets.get(permissionSetGroup_psId);
                permissionSet.permissionSetGroupIds.push(permissionSetGroup_psId);
                permissionSetGroup.permissionSetIds.push(permissionSetId);
                psgMemberCountSumByPermissionSetId.set(permissionSetId, psgMemberCountSumByPermissionSetId.get(permissionSetId) ?? 0 + permissionSetGroup.memberCounts);
            }
        });

        // Compute scores for all permission sets
        logger?.log(`Computing the score for ${permissionSets.size} permission sets...`);
        await Processor.forEach(permissionSets, (/** @type {SFDC_PermissionSet} */ permissionSet) => {
            if (psgMemberCountSumByPermissionSetId.get(permissionSet.id) === 0) {
                permissionSet.allIncludingGroupsAreEmpty = true;
            }
            permissionSetDataFactory.computeScore(permissionSet);
        });
        
        // Return data as map
        logger?.log(`Done`);
        return permissionSets;
    } 
}