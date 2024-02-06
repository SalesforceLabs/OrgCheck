import { LightningElement, api } from 'lwc';

export default class OrgcheckObjectInformation extends LightningElement {

    @api set objectInformationData(data) {
        if (data) {
            this.isObjectDefined = true;
            this.object = data;
            this.exportBasename = data.apiname;
        } else {
            this.isObjectDefined = false;
            this.object = undefined;
            this.exportBasename = undefined;
        }
    }

    get objectInformationData() {
        return this.object;
    }

    isObjectDefined;
    object;

    exportBasename;

    get exportSource() {
        return [
            {
                header: 'General information',
                columns: [
                    { label: 'Label', field: 'label' },  
                    { label: 'Value', field: 'value' }
                ], 
                rows: [
                    { label: 'API Name', value: this.object.apiname },
                    { label: 'Package', value: this.object.package },
                    { label: 'Singular Label', value: this.object.label },
                    { label: 'Plural Label', value: this.object.labelPlural },
                    { label: 'Description', value: this.object.description },
                    { label: 'Key Prefix', value: this.object.keyPrefix },
                    { label: 'Record Count (including deleted ones)', value: this.object.recordCount },
                    { label: 'Is Custom?', value: this.object.isCustom },
                    { label: 'Feed Enable?', value: this.object.isFeedEnabled },
                    { label: 'Most Recent Enabled?', value: this.object.isMostRecentEnabled },
                    { label: 'Global Search Enabled?', value: this.object.isSearchable },
                    { label: 'Internal Sharing', value: this.object.internalSharingModel },
                    { label: 'External Sharing', value: this.object.externalSharingModel }
                ]
            },
            {
                header: 'Apex Triggers',
                columns: [
                    { label: 'Id', field: 'id' },  
                    { label: 'Name', field: 'name' },  
                    { label: 'URL', field: 'url' }
                ], 
                rows: this.object.apexTriggers
            },
            {
                header: 'Field Sets',
                columns: [
                    { label: 'Id', field: 'id' },  
                    { label: 'Name', field: 'label' },  
                    { label: 'URL', field: 'url' },  
                    { label: 'Description', field: 'description' }
                ], 
                rows: this.object.fieldSets
            },
            {
                header: 'Page Layouts',
                columns: [
                    { label: 'Id', field: 'id' },  
                    { label: 'Name', field: 'name' },  
                    { label: 'URL', field: 'url' },  
                    { label: 'Type', field: 'type' }
                ], 
                rows: this.object.layouts
            },           
            {
                header: 'Limits',
                columns: [
                    { label: 'Name', field: 'label' },  
                    { label: 'Maximum', field: 'max' },  
                    { label: 'Used', field: 'used' },  
                    { label: 'Remaining', field: 'remaining' },  
                    { label: 'Type', field: 'type' }
                ], 
                rows: this.object.limits
            },
            {
                header: 'Validation Rules',
                columns: [
                    { label: 'Id', field: 'id' },  
                    { label: 'Name', field: 'label' },  
                    { label: 'URL', field: 'url' },  
                    { label: 'Is Active?', field: 'isActive' },  
                    { label: 'Error Display Field', field: 'errorDisplayField' },  
                    { label: 'Error Message', field: 'errorMessage' },  
                    { label: 'Description', field: 'description' }
                ], 
                rows: this.object.validationRules
            },
            {
                header: 'Web Links',
                columns: [
                    { label: 'Id', field: 'id' },  
                    { label: 'Name', field: 'name' },  
                    { label: 'URL', field: 'url' }
                ], 
                rows: this.object.webLinks
            },
            {
                header: 'Fields',
                columns: [
                    { label: 'Id', field: 'id' },  
                    { label: 'Name', field: 'name' },  
                    { label: 'URL', field: 'url' },  
                    { label: 'Custom', field: 'isCustom' },  
                    { label: 'Tooltip', field: 'tooltip' },  
                    { label: 'Type', field: 'type' },  
                    { label: 'Length', field: 'length' },  
                    { label: 'Unique', field: 'isUnique' },  
                    { label: 'Encrypted', field: 'isEncrypted' },  
                    { label: 'External Id', field: 'isExternalId' },  
                    { label: 'Default', field: 'defaultValue' },  
                    { label: 'Formula', field: 'formula' },  
                    { label: 'Description', field: 'description' }
                ], 
                rows: this.object.fields
            },
            {
                header: 'Record Types',
                columns: [
                    { label: 'Id', field: 'id' },  
                    { label: 'Name', field: 'name' },  
                    { label: 'URL', field: 'url' },  
                    { label: 'Developer Name', field: 'ladeveloperNamebel' },  
                    { label: 'Master', field: 'isMaster' },  
                    { label: 'Is Active?', field: 'isActive' },  
                    { label: 'Is Available?', field: 'isAvailable' },  
                    { label: 'Default Mapping', field: 'isDefaultRecordTypeMapping' }
                ], 
                rows: this.object.recordTypes
            },
            {
                header: 'Relationships',
                columns: [
                    { label: 'Name', field: 'name' },  
                    { label: 'Child Object', field: 'childObject' },  
                    { label: 'Field', field: 'fieldName' },  
                    { label: 'Cascade Delete?', field: 'isCascadeDelete' },  
                    { label: 'Restricted Delete?', field: 'isRestrictedDelete' }
                ], 
                rows: this.object.relationships
            }
        ];
    }

    /**
     * Connected callback function
     */
    connectedCallback() {
        this.dispatchEvent(new CustomEvent('load'));
    }

    apexTriggersColumns = [
        { label: 'Name',  type: 'id', data: { value: 'name', url: 'url' }}
    ];

    fieldSetsColumns = [
        { label: 'Name',         type: 'id',    data: { value: 'label', url: 'url' }},
        { label: 'Description',  type: 'text',  data: { value: 'description', maximumLength: 30, valueIfEmpty: 'No description.' }}
    ];
    
    layoutsColumns = [
        { label: 'Name',  type: 'id',    data: { value: 'name', url: 'url' }},
        { label: 'Type',  type: 'text',  data: { value: 'type' }}
    ];
    
    limitsColumns = [
        { label: 'Name',       type: 'text',     data: { value: 'label' }},
        { label: 'Maximum',    type: 'numeric',  data: { value: 'max' }},
        { label: 'Used',       type: 'numeric',  data: { value: 'used' }},
        { label: 'Remaining',  type: 'numeric',  data: { value: 'remaining' }},
        { label: 'Type',       type: 'text',     data: { value: 'type' }},
    ];
    
    validationRulesColumns = [
        { label: 'Name',                 type: 'id',       data: { value: 'label', url: 'url' }},
        { label: 'Is Active?',           type: 'boolean',  data: { value: 'isActive' }},
        { label: 'Error Display Field',  type: 'text',     data: { value: 'errorDisplayField' }},
        { label: 'Error Message',        type: 'text',     data: { value: 'errorMessage' }},
        { label: 'Description',          type: 'text',     data: { value: 'description', maximumLength: 30, valueIfEmpty: 'No description.' }}
    ];
    
    webLinksColumns = [
        { label: 'Name',  type: 'id', data: { value: 'name', url: 'url' }}
    ];
    
    fieldsColumns = [
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

    recordTypesColumns = [
        { label: 'Name',            type: 'id',       data: { value: 'name', url: 'url' }},
        { label: 'Developer Name',  type: 'text',     data: { value: 'developerName' }},
        { label: 'Master',          type: 'boolean',  data: { value: 'isMaster' }},
        { label: 'Is Active?',      type: 'boolean',  data: { value: 'isActive' }},
        { label: 'Is Available?',   type: 'boolean',  data: { value: 'isAvailable' }},
        { label: 'Default Mapping', type: 'boolean',  data: { value: 'isDefaultRecordTypeMapping' }}
    ];
    
    relationshipsColumns = [
        { label: 'Name',                type: 'text',     data: { value: 'name' }},
        { label: 'Child Object',        type: 'text',     data: { value: 'childObject' }},
        { label: 'Field',               type: 'text',     data: { value: 'fieldName' }},
        { label: 'Cascade Delete?',     type: 'boolean',  data: { value: 'isCascadeDelete' }},
        { label: 'Restricted Delete?',  type: 'boolean',  data: { value: 'isRestrictedDelete' }}
    ];

}