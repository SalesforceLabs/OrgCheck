import { LightningElement, api } from 'lwc';

export default class OrgcheckProfiles extends LightningElement {

    /**
     * Set the component data.
     * 
     * @param {Array<SFDC_Profile>} data 
     */
    @api setComponentData(data) {
        if (data && Array.isArray(data) && data.length > 0) {
            this.tableData = data;
            this.isTableEmpty = false;
        } else {
            this.tableData = [];
            this.isTableEmpty = true;
        }
    }

    tableColumns;

    tableKeyField;

    tableData;

    isTableEmpty;

    /**
     * Connected callback function
     */
    connectedCallback() { 
        this.tableColumns = [
            { label: 'Score',           type: 'numeric',  data: { value: 'score' }, sorted: 'asc' },
            { label: 'Name',            type: 'id',       data: { value: 'name', url: 'url' }},
            { label: 'Custom',          type: 'boolean',  data: { value: 'isCustom' }},
            { label: '#FLSs',           type: 'numeric',  data: { value: 'nbFieldPermissions' }},
            { label: '#Object CRUDs',   type: 'numeric',  data: { value: 'nbObjectPermissions' }},            
            { label: 'License',         type: 'text',     data: { value: 'license' }},
            { label: 'Package',         type: 'text',     data: { value: 'package' }},
            { label: '#Active users',   type: 'numeric',  data: { value: 'memberCounts' }},
            { label: 'Created date',    type: 'dateTime', data: { value: 'createdDate' }},
            { label: 'Modified date',   type: 'dateTime', data: { value: 'lastModifiedDate' }},
            { label: 'Description',     type: 'text',     data: { value: 'description' }}
        ];
        this.tableKeyField = 'index';
        this.dispatchEvent(new CustomEvent('load', { detail: {}, bubbles: false }));
    }
}