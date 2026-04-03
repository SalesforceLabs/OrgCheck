import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SfdcObject } from 'src/api/data/orgcheck-api-data-object';
import { SfdcField } from 'src/api/data/orgcheck-api-data-field';
import { SfdcFieldSet } from 'src/api/data/orgcheck-api-data-fieldset';
import { SfdcPageLayout } from 'src/api/data/orgcheck-api-data-pagelayout';
import { SfdcLimit } from 'src/api/data/orgcheck-api-data-limit';
import { SfdcValidationRule } from 'src/api/data/orgcheck-api-data-validationrule';
import { SfdcWebLink } from 'src/api/data/orgcheck-api-data-weblink';
import { SfdcRecordType } from 'src/api/data/orgcheck-api-data-recordtype';
import { SfdcObjectRelationShip } from 'src/api/data/orgcheck-api-data-objectrelationship';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { CodeScanner } from 'src/api/core/orgcheck-api-codescanner';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';

export class DatasetObject implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} parameters - The parameters
     * @returns {Promise<SfdcObject>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<SfdcObject> {

        const fullObjectApiName = OrgCheckGlobalParameter.getSObjectName(parameters);

        // Checking parameters
        if (fullObjectApiName === undefined || typeof fullObjectApiName !== 'string') {
            throw new Error(`DatasetObject: No object were provided in the parameters.`);
        }

        // split name and namespace frpm object api name
        const splittedApiName = fullObjectApiName.split('__');
        const packageName = splittedApiName?.length === 3 ? splittedApiName[0] : '';

        // Init the factories
        const fieldDataFactory = dataFactory.getInstance(DataAliases.SfdcField);
        const fieldSetDataFactory = dataFactory.getInstance(DataAliases.SfdcFieldSet);
        const layoutDataFactory = dataFactory.getInstance(DataAliases.SfdcPageLayout);
        const limitDataFactory = dataFactory.getInstance(DataAliases.SfdcLimit);
        const validationRuleDataFactory = dataFactory.getInstance(DataAliases.SfdcValidationRule);
        const webLinkDataFactory = dataFactory.getInstance(DataAliases.SfdcWebLink);
        const recordTypeDataFactory = dataFactory.getInstance(DataAliases.SfdcRecordType);
        const relationshipDataFactory = dataFactory.getInstance(DataAliases.SfdcObjectRelationShip);
        const objectDataFactory = dataFactory.getInstance(DataAliases.SfdcObject);

        const results = await Promise.all([
            sfdcManager.describe(fullObjectApiName, logger),
            sfdcManager.soqlQuery([{
                tooling: true, // We need the tooling to get the Description, ApexTriggers, FieldSets, ... which are not accessible from REST API)
                string: 'SELECT Id, DurableId, DeveloperName, Description, NamespacePrefix, ExternalSharingModel, InternalSharingModel, ' +
                            '(SELECT Id FROM ApexTriggers), ' +
                            '(SELECT Id, MasterLabel, Description FROM FieldSets), ' +
                            '(SELECT Id, Name, LayoutType FROM Layouts), ' +
                            '(SELECT DurableId, Label, Max, Remaining, Type FROM Limits), ' +
                            '(SELECT Id, Active, Description, ErrorDisplayField, ErrorMessage, ValidationName, NamespacePrefix, CreatedDate, LastModifiedDate FROM ValidationRules), ' +
                            '(SELECT Id, Name, Url, LinkType, OpenType, Description, CreatedDate, LastModifiedDate, NamespacePrefix FROM WebLinks) ' +
                        'FROM EntityDefinition ' +
                        `WHERE QualifiedApiName = '${fullObjectApiName}' ` +
                        (packageName ? `AND NamespacePrefix = '${packageName}' ` : '') +
                        'LIMIT 1' // We should get zero or one record, not more!
            }, {
                tooling: true,
                string: 'SELECT DurableId, QualifiedApiName, Description, IsIndexed ' +
                        'FROM FieldDefinition '+
                        `WHERE EntityDefinition.QualifiedApiName = '${fullObjectApiName}' ` +
                        (packageName ? `AND EntityDefinition.NamespacePrefix = '${packageName}' ` : ''),
                queryMoreField: 'DurableId' // FieldDefinition does not support calling QueryMore, use the custom instead
            }, {
                string: 'SELECT TableEnumOrId, Id ' + // TableEnumOrId = EntityDefinition.QualifiedApiName
                        'FROM WorkflowRule ' +
                        `WHERE TableEnumOrId = '${fullObjectApiName}' ` +
                        (packageName ? `AND EntityDefinition.NamespacePrefix = '${packageName}' ` : ''),
                tooling: true,
            }], logger),
            sfdcManager.recordCount(fullObjectApiName, logger)
        ]);

        // the first promise was describe
        // so we initialize the object with the first result
        const sobjectDescribed = results[0]; 
        const sobjectType = sfdcManager.getObjectType(sobjectDescribed.name, sobjectDescribed.customSetting);

        // the second promise was three soql queries on EntityDefinition, on FieldDefinition and on WorkflowRule
        // so the first query response should be an EntityDefinition record corresponding to the object we want.
        const entity = results[1][0][0];
        if (!entity) { // If that entity was not found in the tooling API
            throw new TypeError(`No entity definition record found for: ${fullObjectApiName}`)
        }
        // the second query response should be a list of FieldDefinition records corresponding to the fields of the object
        const fields = results[1][1]; 
        // and the third query response should be a list of WorkflowRule records corresponding to the workflows of the object
        const workflowRules = results[1][2];
                
        // the third promise is the number of records!!
        const recordCount = results[2]; 

        // fields (standard and custom)
        /** @type {string[]} */
        const customFieldIds: string[] = []; 
        const standardFieldsMapper = new Map();
        await Processor.forEach(fields, async (/** @type {any} */f: any) => {
            if (f && f.DurableId && f.DurableId.split && f.DurableId.includes) {
                const id = sfdcManager.caseSafeId(f.DurableId.split('.')[1]);
                if (f.DurableId?.includes('.00N')) {
                    customFieldIds.push(id);
                } else {
                    standardFieldsMapper.set(f.QualifiedApiName, { 
                        id: id,
                        description: f.Description,
                        isIndexed: f.IsIndexed
                    });
                }
            }
        });
        /** @type {SfdcField[]} */
        const standardFields: SfdcField[] = await Processor.map(
            sobjectDescribed.fields,
            (/** @type {any} */ field: any) => {
                const fieldMapper = standardFieldsMapper.get(field.name);
                return fieldDataFactory.createWithScore({
                    properties: {
                        id: fieldMapper.id,
                        name: field.label, 
                        label: field.label, 
                        description: fieldMapper.description,
                        tooltip: field.inlineHelpText,
                        type: field.type,
                        length: field?.length,
                        isUnique: field.unique,
                        isEncrypted: field.encrypted,
                        isExternalId: field.externalId,
                        isIndexed: fieldMapper.isIndexed,
                        defaultValue: field.defaultValue,
                        formula: field.calculatedFormula,
                        url: sfdcManager.setupUrl(fieldMapper.id, SalesforceMetadataTypes.STANDARD_FIELD, entity.DurableId, sobjectType)
                    },
                    dependencyData: { records: [], errors: [] }
                });
            },
            (/** @type {any} */ field: any) => standardFieldsMapper.has(field.name)
        );

        // apex triggers
        /** @type {string[]} */
        const apexTriggerIds: string[] = await Processor.map(
            entity.ApexTriggers?.records, 
            (/** @type {any} */ t: any) => sfdcManager.caseSafeId(t.Id)
        );

        // workflow rules
        /** @type {string[]} */
        const workflowRuleIds: string[] = await Processor.map(
            workflowRules, 
            (/** @type {any} */ wr: any) => sfdcManager.caseSafeId(wr.Id)
        );

        // field sets
        /** @type {SfdcFieldSet[]} */
        const fieldSets: SfdcFieldSet[] = await Processor.map(
            entity.FieldSets?.records,
            (/** @type {any} */ t: any) => fieldSetDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.Id), 
                    label: t.MasterLabel, 
                    description: t.Description,
                    url: sfdcManager.setupUrl(t.Id, SalesforceMetadataTypes.FIELD_SET, entity.DurableId)
                }
            })
        );

        // page layouts
        /** @type {SfdcPageLayout[]} */
        const layouts: SfdcPageLayout[] = await Processor.map(
            entity.Layouts?.records,
            (/** @type {any} */ t: any) => layoutDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.Id), 
                    name: t.Name, 
                    type: t.LayoutType,
                    url: sfdcManager.setupUrl(t.Id, SalesforceMetadataTypes.PAGE_LAYOUT, entity.DurableId)
                },
                dependencyData: { records: [], errors: [] }
            })
        );
        
        // limits
        /** @type {SfdcLimit[]} */
        const limits: SfdcLimit[] = await Processor.map(
            entity.Limits?.records,
            (/** @type {any} */ t: any) => limitDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.DurableId), 
                    label: t.Label, 
                    max: t.Max, 
                    remaining: t.Remaining, 
                    used: (t.Max-t.Remaining), 
                    usedPercentage: ((t.Max-t.Remaining)/t.Max),
                    type: t.Type 
                }
            })
        );
        
        // validation rules
        /** @type {SfdcValidationRule[]} */
        const validationRules: SfdcValidationRule[] = await Processor.map(
            entity.ValidationRules?.records,
            (/** @type {any} */ t: any) => validationRuleDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.Id), 
                    name: t.ValidationName, 
                    isActive: t.Active,
                    description: t.Description,
                    errorDisplayField: t.ErrorDisplayField,
                    errorMessage: t.ErrorMessage,
                    package: (t.NamespacePrefix || ''),
                    createdDate: t.CreatedDate, 
                    lastModifiedDate: t.LastModifiedDate,
                    url: sfdcManager.setupUrl(t.Id, SalesforceMetadataTypes.VALIDATION_RULE)
                }
            })
        );
        
        // weblinks and actions
        /** @type {SfdcWebLink[]} */
        const webLinks: SfdcWebLink[] = await Processor.map(
            entity.WebLinks?.records,
            (/** @type {any} */ t: any) => webLinkDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.Id), 
                    name: t.Name, 
                    hardCodedURLs: CodeScanner.FindHardCodedURLs(t.Url),
                    hardCodedIDs: CodeScanner.FindHardCodedIDs(t.Url),
                    type: t.LinkType,
                    behavior: t.OpenType,
                    package: (t.NamespacePrefix || ''),
                    createdDate: t.CreatedDate,
                    lastModifiedDate: t.LastModifiedDate,
                    description: t.Description,                
                    url: sfdcManager.setupUrl(t.Id, SalesforceMetadataTypes.WEB_LINK, entity.DurableId)
                },
                dependencyData: { records: [], errors: [] }
            })
        );
        
        // record types
        /** @type {SfdcRecordType[]} */
        const recordTypes: SfdcRecordType[] = await Processor.map(
            sobjectDescribed.recordTypeInfos,
            (/** @type {any} */ t: any) => recordTypeDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.recordTypeId), 
                    name: t.name, 
                    developerName: t.developerName, 
                    isActive: t.active,
                    isAvailable: t.available,
                    isDefault: t.defaultRecordTypeMapping,
                    isMaster: t.master,
                    url: sfdcManager.setupUrl(t.recordTypeId, SalesforceMetadataTypes.RECORD_TYPE, entity.DurableId)
                }
            })
        );
        
        // relationships
        /** @type {SfdcObjectRelationShip[]} */
        const relationships: SfdcObjectRelationShip[] = await Processor.map(
            sobjectDescribed.childRelationships,
            (/** @type {any} */ relationship: any) => relationshipDataFactory.createWithScore({ 
                properties: {
                    name: relationship.relationshipName,
                    childObject: relationship.childSObject,
                    fieldName: relationship.field,
                    isCascadeDelete: relationship.cascadeDelete,
                    isRestrictedDelete: relationship.restrictedDelete
                }
            }),
            (/** @type {any} */ relationship: any) => relationship.relationshipName !== null
        );

        // Create the object
        /** @type {SfdcObject} */
        const object: SfdcObject = objectDataFactory.createWithScore({
            properties: {
                id: entity.DurableId,
                label: sobjectDescribed.label,
                labelPlural: sobjectDescribed.labelPlural,
                isCustom: sobjectDescribed.custom,
                isFeedEnabled: sobjectDescribed.feedEnabled,
                isMostRecentEnabled: sobjectDescribed.mruEnabled,
                isSearchable: sobjectDescribed.searchable,
                keyPrefix: sobjectDescribed.keyPrefix,
                name: entity.DeveloperName,
                apiname: sobjectDescribed.name,
                package: (entity.NamespacePrefix || ''),
                typeId: sobjectType,
                description: entity.Description,
                externalSharingModel: entity.ExternalSharingModel,
                internalSharingModel: entity.InternalSharingModel,
                apexTriggerIds: apexTriggerIds,
                nbApexTriggers: apexTriggerIds?.length ?? 0,
                fieldSets: fieldSets,
                limits: limits,
                layouts: layouts,
                nbPageLayouts: layouts?.length ?? 0,
                validationRules: validationRules,
                nbValidationRules: validationRules?.length ?? 0,
                webLinks: webLinks,
                standardFields: standardFields,
                customFieldIds: customFieldIds,
                nbCustomFields: customFieldIds?.length ?? 0,
                recordTypes: recordTypes,
                nbRecordTypes: recordTypes?.length ?? 0,
                relationships: relationships,
                workflowRuleIds: workflowRuleIds,
                nbWorkflowRules: workflowRuleIds?.length ?? 0,
                recordCount: recordCount,
                url: sfdcManager.setupUrl(entity.Id, sobjectType)
            }
        });

        // Return data as object (and not as a map!!!)
        logger?.log(`Done`);
        return object;
    } 
}