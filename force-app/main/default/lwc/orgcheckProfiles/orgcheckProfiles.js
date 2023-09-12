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

    tableData;

    isTableEmpty;

    /**
     * Connected callback function
     */
    connectedCallback() { 
        this.tableColumns = [
            { label: 'Name',            type: 'id',       data: { value: 'name', url: 'url' }},
            { label: 'Custom',          type: 'boolean',  data: { value: 'isCustom' }},
            { label: '#FLSs',           type: 'numeric',  data: { value: 'nbFieldPermissions', max: 50, valueAfterMax: '50+' }},
            { label: '#Object CRUDs',   type: 'numeric',  data: { value: 'nbObjectPermissions', max: 50, valueAfterMax: '50+' }},            
            { label: 'License',         type: 'text',     data: { value: 'license' }},
            { label: 'Package',         type: 'text',     data: { value: 'package' }},
            { label: '#Active users',   type: 'numeric',  data: { value: 'memberCounts', max: 50, valueAfterMax: '50+' }},
            { label: 'Created date',    type: 'dateTime', data: { value: 'createdDate' }},
            { label: 'Modified date',   type: 'dateTime', data: { value: 'lastModifiedDate' }},
            { label: 'Description',     type: 'text',     data: { value: 'description' }}
        ];
        this.dispatchEvent(new CustomEvent('load', { detail: {}, bubbles: false }));
    }
}