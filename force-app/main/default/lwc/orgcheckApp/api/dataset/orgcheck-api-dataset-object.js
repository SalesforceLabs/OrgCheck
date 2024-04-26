import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_Field } from '../data/orgcheck-api-data-field';
import { SFDC_FieldSet } from '../data/orgcheck-api-data-fieldset';
import { SFDC_PageLayout } from '../data/orgcheck-api-data-pagelayout';
import { SFDC_Limit } from '../data/orgcheck-api-data-limit';
import { SFDC_ValidationRule } from '../data/orgcheck-api-data-validationrule';
import { SFDC_WebLink } from '../data/orgcheck-api-data-weblink';
import { SFDC_RecordType } from '../data/orgcheck-api-data-recordtype';
import { SFDC_ObjectRelationShip } from '../data/orgcheck-api-data-objectrelationship';

export class OrgCheckDatasetObject extends OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject, parameters) {

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
        //const objectApiNameWithoutExt = splittedApiName.length === 3 ? splittedApiName[1] : splittedApiName[0];
        const promises = [];
        promises.push(sfdcManager.describe(fullObjectApiName));
        promises.push(sfdcManager.soqlQuery([{ 
            queryMore: false, // we should have only one record max so no need to have queryMore activated.
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
                    (sfdcManager.isEmpty(packageName) ? `AND PublisherId IN ('System', '<local>')` : `AND NamespacePrefix = '${packageName}' `)
        }]));
        promises.push(sfdcManager.recordCount(fullObjectApiName));
        Promise.all(promises)
            .then((r) => {
                // the first promise was describe
                // so we initialize the object with the first result
                const sobjectDescribed = r[0]; 
                const sobjectType = sfdcManager.getObjectType(sobjectDescribed.name, sobjectDescribed.customSetting);

                // the second promise was the soql query on EntityDefinition
                // so we get the record of that query and map it to the previous object.
                const entity = r[1][0].records[0];

                // If that entity was not found in the tooling API
                if (!entity) {
                    reject(`No entity definition record found for: ${fullObjectApiName}`)
                    return;
                }
                
                // the third promise is the number of records!!
                const recordCount = r[2]; 

                const customFieldIds = []; 
                const standardFieldsMapper = new Map();
                if (entity.Fields) entity.Fields.records.forEach((f) => {
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
                });
                const standardFields = (
                    sobjectDescribed.fields ? 
                    sobjectDescribed.fields
                        .filter(f => standardFieldsMapper.has(f.name))
                        .map((f) => {
                            const fieldMapper = standardFieldsMapper.get(f.name);
                            return fieldDataFactory.createWithScore({
                                id: fieldMapper.id,
                                name: f.label, 
                                label: f.label, 
                                description: fieldMapper.description,
                                tooltip: f.inlineHelpText,
                                type: f.type,
                                length: f.length,
                                isUnique: f.unique,
                                isEncrypted: f.encrypted,
                                isExternalId: f.externalId,
                                isIndexed: fieldMapper.isIndexed,
                                defaultValue: f.defaultValue,
                                formula: f.calculatedFormula,
                                url: sfdcManager.setupUrl('field', fieldMapper.id, entity.DurableId, sobjectType)
                            });
                        }) : 
                    []
                );

                const apexTriggerIds = entity.ApexTriggers ? entity.ApexTriggers.records.map((t) => sfdcManager.caseSafeId(t.Id)) : [];

                const fieldSets = (
                    entity.FieldSets ? 
                    entity.FieldSets.records.map((t) => fieldSetDataFactory.createWithScore({ 
                        id: sfdcManager.caseSafeId(t.Id), 
                        label: t.MasterLabel, 
                        description: t.Description,
                        url: sfdcManager.setupUrl('field-set', t.Id, entity.DurableId) 
                    })) : 
                    []
                );

                const layouts = (
                    entity.Layouts ? 
                    entity.Layouts.records.map((t) => layoutDataFactory.createWithScore({ 
                        id: sfdcManager.caseSafeId(t.Id), 
                        name: t.Name, 
                        url: sfdcManager.setupUrl('layout', t.Id, entity.DurableId), 
                        type: t.LayoutType 
                    })) : 
                    []
                );
                
                const limits = (
                    entity.Limits ? entity.Limits.records.map((t) => limitDataFactory.createWithScore({ 
                        id: sfdcManager.caseSafeId(t.DurableId), 
                        label: t.Label, 
                        max: t.Max, 
                        remaining: t.Remaining, 
                        used: (t.Max-t.Remaining), 
                        usedPercentage: ((t.Max-t.Remaining)/t.Max),
                        type: t.Type 
                    })) : 
                    []
                );
                
                const validationRules = (
                    entity.ValidationRules ? 
                    entity.ValidationRules.records.map((t) => validationRuleDataFactory.createWithScore({ 
                        id: sfdcManager.caseSafeId(t.Id), 
                        name: t.ValidationName, 
                        isActive: t.Active,
                        description: t.Description,
                        errorDisplayField: t.ErrorDisplayField,
                        errorMessage: t.ErrorMessage,
                        url: sfdcManager.setupUrl('validation-rule', t.Id), 
                    })) : 
                    []
                );
                
                const webLinks = (
                    entity.WebLinks ? 
                    entity.WebLinks.records.map((t) => webLinkDataFactory.createWithScore({ 
                        id: sfdcManager.caseSafeId(t.Id), 
                        name: t.Name, 
                        url: sfdcManager.setupUrl('web-link', t.Id, entity.DurableId) 
                    })) : 
                    []
                );
                
                const recordTypes = (
                    sobjectDescribed.recordTypeInfos ? 
                    sobjectDescribed.recordTypeInfos.map((t) => recordTypeDataFactory.createWithScore({ 
                        id: sfdcManager.caseSafeId(t.recordTypeId), 
                        name: t.name, 
                        developerName: t.developerName, 
                        url: sfdcManager.setupUrl('record-type', t.recordTypeId, entity.DurableId),
                        isActive: t.active,
                        isAvailable: t.available,
                        isDefaultRecordTypeMapping: t.defaultRecordTypeMapping,
                        isMaster: t.master 
                    })) : 
                    []
                );
                
                const relationships = (
                    sobjectDescribed.childRelationships ? 
                    sobjectDescribed.childRelationships.filter((t) => !sfdcManager.isEmpty(t.relationshipName)).map((t) => relationshipDataFactory.createWithScore({ 
                        name: t.relationshipName,
                        childObject: t.childSObject,
                        fieldName: t.field,
                        isCascadeDelete: t.cascadeDelete,
                        isRestrictedDelete: t.restrictedDelete
                    })) : 
                    []
                );

                resolve(objectDataFactory.createWithScore({
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
                    url: sfdcManager.setupUrl('object', '', entity.Id, sobjectType),
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
                    recordCount: recordCount
                }))
        })
        .catch(reject);
    }
}