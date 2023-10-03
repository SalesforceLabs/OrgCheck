import { LightningElement, api, track } from 'lwc';

export default class OrgcheckObjectInformation extends LightningElement {

    /**
     * Set the component data.
     * 
     * @param {SFDC_Object} data 
     * @param {Error} error (could be null)
     */
    @api setComponentData(data, error) {
        if (error) {
            console.error(error, error.message, error.stack);
            this.isSObjectSpecified = false;
        } else {
            this.object = data;
            this.objectGeneralInfo = [
                { label: 'API Name', value: data.apiname },
                { label: 'Package', value: data.package },
                { label: 'Singular Label', value: data.label },
                { label: 'Plural Label', value: data.labelPlural },
                { label: 'Is Custom?', value: data.isCustom },
                { label: 'Key Prefix', value: data.keyPrefix },
                { label: 'Feed Enable?', value: data.isFeedEnabled },
                { label: 'Most Recent Enabled?', value: data.isMostRecentEnabled },
                { label: 'Global Search Enabled?', value: data.isSearchable },
                { label: 'Record Count (including deleted ones)', value: data.recordCount },
                { label: 'Internal Sharing', value: data.internalSharingModel },
                { label: 'External Sharing', value: data.externalSharingModel },
                { label: 'Description', value: data.description }	
            ];
            this.isSObjectSpecified = true;
        }
    }
    
    @track object;
    objectGeneralInfo;
    isSObjectSpecified;

    generalInfoColumns;
    apexTriggersColumns;
    fieldSetsColumns;
    layoutsColumns;
    limitsColumns;
    validationRulesColumns;
    webLinksColumns;
    fieldsColumns;
    recordTypesColumns;
    relationshipsColumns;

    /**
     * Connected callback function
     */
    connectedCallback() {

        this.generalInfoColumns = [
            { label: 'Label',  type: 'text', data: { value: 'label' }},
            { label: 'Value',  type: 'text', data: { value: 'value' }}
        ];
        this.apexTriggersColumns = [
            { label: 'Name',  type: 'id', data: { value: 'name', url: 'url' }}
        ];
        this.fieldSetsColumns = [
            { label: 'Name',         type: 'id',    data: { value: 'label', url: 'url' }},
            { label: 'Description',  type: 'text',  data: { value: 'description', maximumLength: 30, valueIfEmpty: 'No description.' }}
        ];
        this.layoutsColumns = [
            { label: 'Name',  type: 'id',    data: { value: 'name', url: 'url' }},
            { label: 'Type',  type: 'text',  data: { value: 'type' }}
        ];
        this.limitsColumns = [
            { label: 'Name',       type: 'text',     data: { value: 'label' }},
            { label: 'Maximum',    type: 'numeric',  data: { value: 'max' }},
            { label: 'Used',       type: 'numeric',  data: { value: 'used' }},
            { label: 'Remaining',  type: 'numeric',  data: { value: 'remaining' }},
            { label: 'Type',       type: 'text',     data: { value: 'type' }},
        ];
        this.validationRulesColumns = [
            { label: 'Name',                 type: 'id',       data: { value: 'label', url: 'url' }},
            { label: 'Is Active?',           type: 'boolean',  data: { value: 'isActive' }},
            { label: 'Error Display Field',  type: 'text',     data: { value: 'errorDisplayField' }},
            { label: 'Error Message',        type: 'text',     data: { value: 'errorMessage' }},
            { label: 'Description',          type: 'text',     data: { value: 'description', maximumLength: 30, valueIfEmpty: 'No description.' }}
        ];
        this.webLinksColumns = [
            { label: 'Name',  type: 'id', data: { value: 'name', url: 'url' }}
        ];
        this.fieldsColumns = [
            { label: 'Name',           type: 'id',       data: { value: 'name', url: 'url' }},
            { label: 'Custom',         type: 'boolean',  data: { value: 'isCustom' }},
            { label: 'Tooltip',        type: 'text',     data: { value: 'tooltip' }},
            { label: 'Type',           type: 'text',     data: { value: 'type' }},
            { label: 'Length',         type: 'numeric',  data: { value: 'length' }},
            { label: 'Unique',         type: 'boolean',  data: { value: 'isUnique' }},
            { label: 'Encrypted',      type: 'boolean',  data: { value: 'isEncrypted' }},
            { label: 'External Id',    type: 'boolean',  data: { value: 'isExternalId' }},
            { label: 'Default',        type: 'text',     data: { value: 'defaultValue' }},
            { label: 'Formula',        type: 'text',     data: { value: 'formula' }},
            { label: 'Description',    type: 'text',     data: { value: 'description', maximumLength: 30, valueIfEmpty: 'No description.' }}
        ];
        this.recordTypesColumns = [
            { label: 'Name',            type: 'id',       data: { value: 'name', url: 'url' }},
            { label: 'Developer Name',  type: 'text',     data: { value: 'developerName' }},
            { label: 'Master',          type: 'boolean',  data: { value: 'isMaster' }},
            { label: 'Is Active?',      type: 'boolean',  data: { value: 'isActive' }},
            { label: 'Is Available?',   type: 'boolean',  data: { value: 'isAvailable' }},
            { label: 'Default Mapping', type: 'boolean',  data: { value: 'isDefaultRecordTypeMapping' }}
        ];
        this.relationshipsColumns = [
            { label: 'Name',                type: 'text',     data: { value: 'name' }},
            { label: 'Child Object',        type: 'text',     data: { value: 'childObject' }},
            { label: 'Field',               type: 'text',     data: { value: 'fieldName' }},
            { label: 'Cascade Delete?',     type: 'boolean',  data: { value: 'isCascadeDelete' }},
            { label: 'Restricted Delete?',  type: 'boolean',  data: { value: 'isRestrictedDelete' }}
        ];
        this.dispatchEvent(new CustomEvent('load', { detail: {}, bubbles: false }));
    }
}