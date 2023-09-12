import { LightningElement, api } from 'lwc';

export default class OrgcheckPermissionsets extends LightningElement {

    /**
     * Set the component data.
     * 
     * @param {Array<SFDC_PermissionSet>} data 
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
            { label: 'Score',            type: 'numeric',  data: { value: 'score' }, sorted: 'desc' },
            { label: 'Name',             type: 'id',       data: { value: 'name', url: 'url' }},
            { label: 'Is Group?',        type: 'boolean',  data: { value: 'isGroup' }},
            { label: 'Custom',           type: 'boolean',  data: { value: 'isCustom' }},
            { label: '#FLSs',            type: 'numeric',  data: { value: 'nbFieldPermissions', max: 50, valueAfterMax: '50+' }},
            { label: '#Object CRUDs',    type: 'numeric',  data: { value: 'nbObjectPermissions', max: 50, valueAfterMax: '50+' }},            
            { label: 'License',          type: 'text',     data: { value: 'license' }},
            { label: 'Package',          type: 'text',     data: { value: 'package' }},
            { label: '#Active users',    type: 'numeric',  data: { value: 'memberCounts', max: 50, valueAfterMax: '50+' }},
            { label: 'Users\' profiles', type: 'ids',      data: { values: 'profileRefs', value: 'name', url: 'url' }},
            { label: 'Created date',     type: 'dateTime', data: { value: 'createdDate' }},
            { label: 'Modified date',    type: 'dateTime', data: { value: 'lastModifiedDate' }},
            { label: 'Description',      type: 'text',     data: { value: 'description' }}
        ];
        this.dispatchEvent(new CustomEvent('load', { detail: {}, bubbles: false }));
    }
}