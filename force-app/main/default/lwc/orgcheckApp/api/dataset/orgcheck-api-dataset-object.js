import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_Field } from '../data/orgcheck-api-data-field';
import { SFDC_FieldSet } from '../data/orgcheck-api-data-fieldset';
import { SFDC_PageLayout } from '../data/orgcheck-api-data-pagelayout';
import { SFDC_Limit } from '../data/orgcheck-api-data-limit';
import { SFDC_ValidationRule } from '../data/orgcheck-api-data-validationrule';
import { SFDC_WebLink } from '../data/orgcheck-api-data-weblink';
import { SFDC_RecordType } from '../data/orgcheck-api-data-recordtype';
import { SFDC_ObjectRelationShip } from '../data/orgcheck-api-data-objectrelationship';
import { TYPE_FIELD_SET, TYPE_PAGE_LAYOUT, TYPE_RECORD_TYPE, TYPE_STANDARD_FIELD, TYPE_VALIDATION_RULE, TYPE_WEB_LINK } from '../core/orgcheck-api-sfconnectionmanager';

export class OrgCheckDatasetObject extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger, parameters) {

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

        const fullObjectApiName = parameters.get('object');
        const splittedApiName = fullObjectApiName.split('__');
        const packageName = splittedApiName.length === 3 ? splittedApiName[0] : '';
        
        const results = await Promise.all([
            sfdcManager.describe(fullObjectApiName),
            sfdcManager.soqlQuery([{ 
                tooling: true, // We need the tooling to get the Description, ApexTriggers, FieldSets, ... which are not accessible from REST API)
                string: 'SELECT Id, DurableId, DeveloperName, Description, NamespacePrefix, ExternalSharingModel, InternalSharingModel, '+
                            '(SELECT DurableId, QualifiedApiName, Description, IsIndexed FROM Fields), '+
                            '(SELECT Id FROM ApexTriggers), '+
                            '(SELECT Id, MasterLabel, Description FROM FieldSets), '+
                            '(SELECT Id, Name, LayoutType FROM Layouts), '+
                            '(SELECT DurableId, Label, Max, Remaining, Type FROM Limits), '+
                            '(SELECT Id, Active, Description, ErrorDisplayField, ErrorMessage, '+
                                'ValidationName FROM ValidationRules), '+
                            '(SELECT Id, Name FROM WebLinks) '+
                        'FROM EntityDefinition '+
                        `WHERE QualifiedApiName = '${fullObjectApiName}' `+
                        (packageName ? `AND NamespacePrefix = '${packageName}' `: '') +
                        'LIMIT 1' // We should get zero or one record, not more!
            }]),
            sfdcManager.recordCount(fullObjectApiName)
        ]);

        // the first promise was describe
        // so we initialize the object with the first result
        const sobjectDescribed = results[0]; 
        const sobjectType = sfdcManager.getObjectType(sobjectDescribed.name, sobjectDescribed.customSetting);

        // the second promise was the soql query on EntityDefinition
        // so we get the record of that query and map it to the previous object.
        const entity = results[1][0].records[0];
        if (!entity) { // If that entity was not found in the tooling API
            throw new TypeError(`No entity definition record found for: ${fullObjectApiName}`)
        }
                
        // the third promise is the number of records!!
        const recordCount = results[2]; 

        // fields (standard and custom)
        const customFieldIds = []; 
        const standardFieldsMapper = new Map();
        await OrgCheckProcessor.forEach(entity.Fields?.records, (f) => {
            if (f && f.DurableId && f.DurableId.split && f.DurableId.includes) {
                const id = sfdcManager.caseSafeId(f.DurableId.split('.')[1]);
                if (f.DurableId.includes('.00N')) {
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
        const standardFields = await OrgCheckProcessor.map(
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
                        url: sfdcManager.setupUrl(fieldMapper.id, TYPE_STANDARD_FIELD, entity.DurableId, sobjectType)
                    }
                });
            },
            (field) => standardFieldsMapper.has(field.name)
        );

        // apex triggers
        const apexTriggerIds = await OrgCheckProcessor.map(
            entity.ApexTriggers?.records, 
            (t) => sfdcManager.caseSafeId(t.Id)
        );

        // field sets
        const fieldSets = await OrgCheckProcessor.map(
            entity.FieldSets?.records,
            (t) => fieldSetDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.Id), 
                    label: t.MasterLabel, 
                    description: t.Description,
                    url: sfdcManager.setupUrl(t.Id, TYPE_FIELD_SET, entity.DurableId)
                }
            })
        );

        // page layouts
        const layouts = await OrgCheckProcessor.map(
            entity.Layouts?.records,
            (t) => layoutDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.Id), 
                    name: t.Name, 
                    type: t.LayoutType,
                    url: sfdcManager.setupUrl(t.Id, TYPE_PAGE_LAYOUT, entity.DurableId)
                }
            })
        );
        
        // limits
        const limits = await OrgCheckProcessor.map(
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
        const validationRules = await OrgCheckProcessor.map(
            entity.ValidationRules?.records,
            (t) => validationRuleDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.Id), 
                    name: t.ValidationName, 
                    isActive: t.Active,
                    description: t.Description,
                    errorDisplayField: t.ErrorDisplayField,
                    errorMessage: t.ErrorMessage,
                    url: sfdcManager.setupUrl(t.Id, TYPE_VALIDATION_RULE)
                }
            })
        );
        
        // weblinks and actions
        const webLinks = await OrgCheckProcessor.map(
            entity.WebLinks?.records,
            (t) => webLinkDataFactory.createWithScore({ 
                properties: {
                    id: sfdcManager.caseSafeId(t.Id), 
                    name: t.Name, 
                    url: sfdcManager.setupUrl(t.Id, TYPE_WEB_LINK, entity.DurableId)
                }
            })
        );
        
        // record types
        const recordTypes = await OrgCheckProcessor.map(
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
                    url: sfdcManager.setupUrl(t.recordTypeId, TYPE_RECORD_TYPE, entity.DurableId)
                }
            })
        );
        
        // relationships
        const relationships = await OrgCheckProcessor.map(
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
        localLogger.log(`Done`);
        return object;
    } 
}