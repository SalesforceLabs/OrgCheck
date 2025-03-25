import { Dataset } from '../core/orgcheck-api-dataset';
import { Processor } from '../core/orgcheck-api-processing';
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

export class DatasetObject extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @param {Map} parameters
     * @returns {Promise<SFDC_Object>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger, parameters) {

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

        const fullObjectApiName = parameters?.get('object');
        const splittedApiName = fullObjectApiName.split('__');
        const packageName = splittedApiName.length === 3 ? splittedApiName[0] : '';
        
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
            }], logger),
            sfdcManager.recordCount(fullObjectApiName, logger)
        ]);

        // the first promise was describe
        // so we initialize the object with the first result
        const sobjectDescribed = results[0]; 
        const sobjectType = sfdcManager.getObjectType(sobjectDescribed.name, sobjectDescribed.customSetting);

        // the second promise was two soql queries on EntityDefinition and on FieldDefinition
        // so the first query response should be an EntityDefinition record corresponding to the object we want.
        const entity = results[1][0][0];
        if (!entity) { // If that entity was not found in the tooling API
            throw new TypeError(`No entity definition record found for: ${fullObjectApiName}`)
        }
        // and the second query response should be a list of FieldDefinition records corresponding to the fields of the object
        const fields = results[1][1]; 
                
        // the third promise is the number of records!!
        const recordCount = results[2]; 

        // fields (standard and custom)
        const customFieldIds = []; 
        const standardFieldsMapper = new Map();
        await Processor.forEach(fields, (f) => {
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
        const standardFields = await Processor.map(
            sobjectDescribed.fields,
            (field) => {
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
            (field) => standardFieldsMapper.has(field.name)
        );

        // apex triggers
        const apexTriggerIds = await Processor.map(
            entity.ApexTriggers?.records, 
            (t) => sfdcManager.caseSafeId(t.Id)
        );

        // field sets
        const fieldSets = await Processor.map(
            entity.FieldSets?.records,
            (t) => fieldSetDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.Id), 
                    label: t.MasterLabel, 
                    description: t.Description,
                    url: sfdcManager.setupUrl(t.Id, SalesforceMetadataTypes.FIELD_SET, entity.DurableId)
                }
            })
        );

        // page layouts
        const layouts = await Processor.map(
            entity.Layouts?.records,
            (t) => layoutDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.Id), 
                    name: t.Name, 
                    type: t.LayoutType,
                    url: sfdcManager.setupUrl(t.Id, SalesforceMetadataTypes.PAGE_LAYOUT, entity.DurableId)
                }
            })
        );
        
        // limits
        const limits = await Processor.map(
            entity.Limits?.records,
            (t) => limitDataFactory.createWithScore({ 
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
        const validationRules = await Processor.map(
            entity.ValidationRules?.records,
            (t) => validationRuleDataFactory.createWithScore({ 
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
        const webLinks = await Processor.map(
            entity.WebLinks?.records,
            (t) => webLinkDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.Id), 
                    name: t.Name, 
                    hardCodedURLs: CodeScanner.FindHardCodedURLs(t.Url),
                    hardCodedIDs: CodeScanner.FindHardCodedIDs(t.Url),
                    type: t.LinkType,
                    behavior: t.OpenType,
                    package: t.NamespacePrefix,
                    createdDate: t.CreatedDate,
                    lastModifiedDate: t.LastModifiedDate,
                    description: t.Description,                
                    url: sfdcManager.setupUrl(t.Id, SalesforceMetadataTypes.WEB_LINK, entity.DurableId)
                }
            })
        );
        
        // record types
        const recordTypes = await Processor.map(
            sobjectDescribed.recordTypeInfos,
            (t) => recordTypeDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.recordTypeId), 
                    name: t.name, 
                    developerName: t.developerName, 
                    isActive: t.active,
                    isAvailable: t.available,
                    isDefaultRecordTypeMapping: t.defaultRecordTypeMapping,
                    isMaster: t.master,
                    url: sfdcManager.setupUrl(t.recordTypeId, SalesforceMetadataTypes.RECORD_TYPE, entity.DurableId)
                }
            })
        );
        
        // relationships
        const relationships = await Processor.map(
            sobjectDescribed.childRelationships,
            (relationship) => relationshipDataFactory.createWithScore({ 
                properties: {
                    name: relationship.relationshipName,
                    childObject: relationship.childSObject,
                    fieldName: relationship.field,
                    isCascadeDelete: relationship.cascadeDelete,
                    isRestrictedDelete: relationship.restrictedDelete
                }
            }),
            (relationship) => relationship.relationshipName !== null
        );

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
                fieldSets: fieldSets,
                limits: limits,
                layouts: layouts,
                validationRules: validationRules,
                webLinks: webLinks,
                standardFields: standardFields,
                customFieldIds: customFieldIds,
                recordTypes: recordTypes,
                relationships: relationships,
                recordCount: recordCount,
                url: sfdcManager.setupUrl(entity.Id, sobjectType)
            }
        });

        // Return data as object (and not as a map!!!)
        logger?.log(`Done`);
        return object;
    } 
}