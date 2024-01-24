import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_ApexTrigger } from '../data/orgcheck-api-data-apextrigger';
import { SFDC_Field } from '../data/orgcheck-api-data-field';
import { SFDC_FieldSet } from '../data/orgcheck-api-data-fieldset';
import { SFDC_PageLayout } from '../data/orgcheck-api-data-pagelayout';
import { SFDC_Limit } from '../data/orgcheck-api-data-limit';
import { SFDC_ValidationRule } from '../data/orgcheck-api-data-validationrule';
import { SFDC_WebLink } from '../data/orgcheck-api-data-weblink';
import { SFDC_RecordType } from '../data/orgcheck-api-data-recordtype';
import { SFDC_ObjectRelationShip } from '../data/orgcheck-api-data-objectrelationship';

export class OrgCheckDatasetObject extends OrgCheckDataset {

    run(sfdcManager, localLogger, resolve, reject, parameters) {

        const fullObjectApiName = parameters.object;
        const splittedApiName = fullObjectApiName.split('__');
        const packageName = splittedApiName.length === 3 ? splittedApiName[0] : '';
        const objectApiNameWithoutExt = splittedApiName.length === 3 ? splittedApiName[1] : splittedApiName[0];
        const promises = [];
        promises.push(sfdcManager.describe(fullObjectApiName));
        promises.push(sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, DurableId, DeveloperName, Description, NamespacePrefix, ExternalSharingModel, InternalSharingModel, '+
                        '(SELECT Id, DurableId, QualifiedApiName, Description FROM Fields), '+
                        '(SELECT Id, Name FROM ApexTriggers), '+
                        '(SELECT Id, MasterLabel, Description FROM FieldSets), '+
                        '(SELECT Id, Name, LayoutType FROM Layouts), '+
                        '(SELECT DurableId, Label, Max, Remaining, Type FROM Limits), '+
                        '(SELECT Id, Active, Description, ErrorDisplayField, ErrorMessage, '+
                            'ValidationName FROM ValidationRules), '+
                        '(SELECT Id, Name FROM WebLinks) '+
                    'FROM EntityDefinition '+
                    `WHERE DeveloperName = '${objectApiNameWithoutExt}' `+
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
                    reject(`No entity definition record found for: ${JSON.stringify(parameters)}`)
                    return;
                }
                
                // the third promise is the number of records!!
                const recordCount = r[2]; 

                const fieldsMapper = {};
                if (entity.Fields) entity.Fields.records.forEach((f) => {
                    fieldsMapper[f.QualifiedApiName] = { 
                        'id': f.DurableId.split('.')[1], 
                        'description': f.Description 
                    };
                });
                const fields = (
                    sobjectDescribed.fields ?
                    sobjectDescribed.fields.map((t) => {
                        const mapper = fieldsMapper[t.name];
                        if (mapper) {
                            t.id = mapper.id;
                            t.description = mapper.description;
                        }
                        return new SFDC_Field({ 
                            id: sfdcManager.caseSafeId(t.id), 
                            name: t.label, 
                            label: t.label, 
                            description: t.description,
                            isCustom: t.custom,
                            tooltip: t.inlineHelpText,
                            type: t.type,
                            length: t.length,
                            isUnique: t.unique,
                            isEncrypted: t.encrypted,
                            isExternalId: t.externalId,
                            defaultValue: t.defaultValue,
                            formula: t.calculatedFormula,
                            url: sfdcManager.setupUrl('field', t.id, entity.DurableId, sobjectType)
                        });
                    }) :
                    []
                );

                const apexTriggers = (
                    entity.ApexTriggers ? 
                    entity.ApexTriggers.records.map((t) => new SFDC_ApexTrigger({ 
                        id: sfdcManager.caseSafeId(t.Id), 
                        name: t.Name, 
                        url: sfdcManager.setupUrl('apex-trigger', t.Id) 
                    })) : 
                    []
                );

                const fieldSets = (
                    entity.FieldSets ? 
                    entity.FieldSets.records.map((t) => new SFDC_FieldSet({ 
                        id: sfdcManager.caseSafeId(t.Id), 
                        label: t.MasterLabel, 
                        description: t.Description,
                        url: sfdcManager.setupUrl('field-set', t.Id, entity.DurableId) 
                    })) : 
                    []
                );

                const layouts = (
                    entity.Layouts ? 
                    entity.Layouts.records.map((t) => new SFDC_PageLayout({ 
                        id: sfdcManager.caseSafeId(t.Id), 
                        name: t.Name, 
                        url: sfdcManager.setupUrl('layout', t.Id, entity.DurableId), 
                        type: t.LayoutType 
                    })) : 
                    []
                );
                
                const limits = (
                    entity.Limits ? entity.Limits.records.map((t) => new SFDC_Limit({ 
                        id: sfdcManager.caseSafeId(t.DurableId), 
                        label: t.Label, 
                        max: t.Max, 
                        remaining: t.Remaining, 
                        used:(t.Max-t.Remaining), 
                        type: t.Type 
                    })) : 
                    []
                );
                
                const validationRules = (
                    entity.ValidationRules ? 
                    entity.ValidationRules.records.map((t) => new SFDC_ValidationRule({ 
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
                    entity.WebLinks.records.map((t) => new SFDC_WebLink({ 
                        id: sfdcManager.caseSafeId(t.Id), 
                        name: t.Name, 
                        url: sfdcManager.setupUrl('web-link', t.Id, entity.DurableId) 
                    })) : 
                    []
                );
                
                const recordTypes = (
                    sobjectDescribed.recordTypeInfos ? 
                    sobjectDescribed.recordTypeInfos.map((t) => new SFDC_RecordType({ 
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
                    sobjectDescribed.childRelationships.filter((t) => !sfdcManager.isEmpty(t.relationshipName)).map((t) => new SFDC_ObjectRelationShip({ 
                        name: t.relationshipName,
                        childObject: t.childSObject,
                        fieldName: t.field,
                        isCascadeDelete: t.cascadeDelete,
                        isRestrictedDelete: t.restrictedDelete
                    })) : 
                    []
                );

                resolve(new SFDC_Object({
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
                    apexTriggers: apexTriggers,
                    fieldSets: fieldSets,
                    limits: limits,
                    layouts: layouts,
                    validationRules: validationRules,
                    webLinks: webLinks,
                    fields: fields,
                    recordTypes: recordTypes,
                    relationships: relationships,
                    recordCount: recordCount
                }))
        })
        .catch(reject);
    }
}