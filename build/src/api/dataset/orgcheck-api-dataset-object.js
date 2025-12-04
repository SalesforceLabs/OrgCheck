import { Dataset } from '../core/orgcheck-api-dataset';
import { Processor } from '../core/orgcheck-api-processor';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_Field } from '../data/orgcheck-api-data-field';
import { SFDC_FieldSet } from '../data/orgcheck-api-data-fieldset';
import { SFDC_PageLayout } from '../data/orgcheck-api-data-pagelayout';
import { SFDC_Limit } from '../data/orgcheck-api-data-limit';
import { SFDC_ValidationRule } from '../data/orgcheck-api-data-validationrule';
import { SFDC_WebLink } from '../data/orgcheck-api-data-weblink';
import { SFDC_RecordType } from '../data/orgcheck-api-data-recordtype';
import { SFDC_ObjectRelationShip } from '../data/orgcheck-api-data-objectrelationship';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { CodeScanner } from '../core/orgcheck-api-codescanner';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class DatasetObject extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} parameters - The parameters
     * @returns {Promise<SFDC_Object>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger, parameters) {

        const fullObjectApiName = OrgCheckGlobalParameter.getSObjectName(parameters);

        // Checking parameters
        if (fullObjectApiName === undefined || typeof fullObjectApiName !== 'string') {
            throw new Error(`DatasetObject: No object were provided in the parameters.`);
        }

        // split name and namespace frpm object api name
        const splittedApiName = fullObjectApiName.split('__');
        const packageName = splittedApiName.length === 3 ? splittedApiName[0] : '';

        // Init the factories
        const fieldDataFactory = dataFactory.getInstance(SFDC_Field);
        const fieldSetDataFactory = dataFactory.getInstance(SFDC_FieldSet);
        const layoutDataFactory = dataFactory.getInstance(SFDC_PageLayout);
        const limitDataFactory = dataFactory.getInstance(SFDC_Limit);
        const validationRuleDataFactory = dataFactory.getInstance(SFDC_ValidationRule);
        const webLinkDataFactory = dataFactory.getInstance(SFDC_WebLink);
        const recordTypeDataFactory = dataFactory.getInstance(SFDC_RecordType);
        const relationshipDataFactory = dataFactory.getInstance(SFDC_ObjectRelationShip);
        const objectDataFactory = dataFactory.getInstance(SFDC_Object);

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
        /** @type {Array<string>} */
        const customFieldIds = []; 
        const standardFieldsMapper = new Map();
        await Processor.forEach(fields, (/** @type {any} */f) => {
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
        /** @type {Array<SFDC_Field>} */
        const standardFields = await Processor.map(
            sobjectDescribed.fields,
            (/** @type {any} */ field) => {
                const fieldMapper = standardFieldsMapper.get(field.name);
                return fieldDataFactory.createWithScore({
                    properties: {
                        id: fieldMapper.id,
                        name: field.label, 
                        label: field.label, 
                        description: fieldMapper.description,
                        tooltip: field.inlineHelpText,
                        type: field.type,
                        length: field.length,
                        isUnique: field.unique,
                        isEncrypted: field.encrypted,
                        isExternalId: field.externalId,
                        isIndexed: fieldMapper.isIndexed,
                        defaultValue: field.defaultValue,
                        formula: field.calculatedFormula,
                        url: sfdcManager.setupUrl(fieldMapper.id, SalesforceMetadataTypes.STANDARD_FIELD, entity.DurableId, sobjectType)
                    }
                });
            },
            (/** @type {any} */ field) => standardFieldsMapper.has(field.name)
        );

        // apex triggers
        /** @type {Array<string>} */
        const apexTriggerIds = await Processor.map(
            entity.ApexTriggers?.records, 
            (/** @type {any} */ t) => sfdcManager.caseSafeId(t.Id)
        );

        // workflow rules
        /** @type {Array<string>} */
        const workflowRuleIds = await Processor.map(
            workflowRules, 
            (/** @type {any} */ wr) => sfdcManager.caseSafeId(wr.Id)
        );

        // field sets
        /** @type {Array<SFDC_FieldSet>} */
        const fieldSets = await Processor.map(
            entity.FieldSets?.records,
            (/** @type {any} */ t) => fieldSetDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.Id), 
                    label: t.MasterLabel, 
                    description: t.Description,
                    url: sfdcManager.setupUrl(t.Id, SalesforceMetadataTypes.FIELD_SET, entity.DurableId)
                }
            })
        );

        // page layouts
        /** @type {Array<SFDC_PageLayout>} */
        const layouts = await Processor.map(
            entity.Layouts?.records,
            (/** @type {any} */ t) => layoutDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.Id), 
                    name: t.Name, 
                    type: t.LayoutType,
                    url: sfdcManager.setupUrl(t.Id, SalesforceMetadataTypes.PAGE_LAYOUT, entity.DurableId)
                }
            })
        );
        
        // limits
        /** @type {Array<SFDC_Limit>} */
        const limits = await Processor.map(
            entity.Limits?.records,
            (/** @type {any} */ t) => limitDataFactory.createWithScore({ 
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
        /** @type {Array<SFDC_ValidationRule>} */
        const validationRules = await Processor.map(
            entity.ValidationRules?.records,
            (/** @type {any} */ t) => validationRuleDataFactory.createWithScore({ 
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
        /** @type {Array<SFDC_WebLink>} */
        const webLinks = await Processor.map(
            entity.WebLinks?.records,
            (/** @type {any} */ t) => webLinkDataFactory.createWithScore({ 
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
                }
            })
        );
        
        // record types
        /** @type {Array<SFDC_RecordType>} */
        const recordTypes = await Processor.map(
            sobjectDescribed.recordTypeInfos,
            (/** @type {any} */ t) => recordTypeDataFactory.createWithScore({ 
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
        /** @type {Array<SFDC_ObjectRelationShip>} */
        const relationships = await Processor.map(
            sobjectDescribed.childRelationships,
            (/** @type {any} */ relationship) => relationshipDataFactory.createWithScore({ 
                properties: {
                    name: relationship.relationshipName,
                    childObject: relationship.childSObject,
                    fieldName: relationship.field,
                    isCascadeDelete: relationship.cascadeDelete,
                    isRestrictedDelete: relationship.restrictedDelete
                }
            }),
            (/** @type {any} */ relationship) => relationship.relationshipName !== null
        );

        // Create the object
        /** @type {SFDC_Object} */
        const object = objectDataFactory.createWithScore({
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
                nbApexTriggers: apexTriggerIds.length ?? 0,
                fieldSets: fieldSets,
                limits: limits,
                layouts: layouts,
                nbPageLayouts: layouts.length ?? 0,
                validationRules: validationRules,
                nbValidationRules: validationRules.length ?? 0,
                webLinks: webLinks,
                standardFields: standardFields,
                customFieldIds: customFieldIds,
                nbCustomFields: customFieldIds.length ?? 0,
                recordTypes: recordTypes,
                nbRecordTypes: recordTypes.length ?? 0,
                relationships: relationships,
                workflowRuleIds: workflowRuleIds,
                nbWorkflowRules: workflowRuleIds.length ?? 0,
                recordCount: recordCount,
                url: sfdcManager.setupUrl(entity.Id, sobjectType)
            }
        });

        // Return data as object (and not as a map!!!)
        logger?.log(`Done`);
        return object;
    } 
}