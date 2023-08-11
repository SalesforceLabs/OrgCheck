import { LightningElement, api } from 'lwc';

export default class OrgcheckCustomfields extends LightningElement {

    /**
     * Set the component data.
     * 
     * @param {Array<SFDC_CustomField>} data 
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
            { label: 'Score',         type: 'numeric',  data: { value: 'score' }},
            { label: 'Object',        type: 'id',       data: { ref: 'objectRef', value: 'id', url: 'url', label: 'label' }},
            { label: 'Object Type',   type: 'text',     data: { ref: 'objectRef.typeRef', value: 'label' }},
            { label: 'Field',         type: 'id',       data: { value: 'id', url: 'url', label: 'name' }},
            { label: 'Package',       type: 'text',     data: { value: 'package' }},
            { label: 'Using',         type: 'numeric',  data: { value: 'using' }},
            { label: 'Referenced',    type: 'numeric',  data: { value: 'used' }},
            { label: 'Layout',        type: 'numeric',  data: { value: 'using.Layout' }},
            { label: 'Class',         type: 'numeric',  data: { value: 'using.Class' }},
            { label: 'Flow',          type: 'numeric',  data: { value: 'using.Flow' }},
            { label: 'Dependencies',  type: 'numeric',  data: { value: 'dependencies' }},
            { label: 'Created date',  type: 'dateTime', data: { value: 'createdDate' }},
            { label: 'Modified date', type: 'dateTime', data: { value: 'lastModifiedDate' }},
            { label: 'Description',   type: 'text',     data: { value: 'description' }}
        ];
        this.tableKeyField = 'index';
        this.dispatchEvent(new CustomEvent('load', { detail: {}, bubbles: false }));
    }
}