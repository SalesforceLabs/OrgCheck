import { LightningElement, api } from 'lwc';

export default class OrgcheckVisualForceComponents extends LightningElement {

    /**
     * Set the component data.
     * 
     * @param {Array<SFDC_VisualForceComponent>} data 
     * @param {Error} error (could be null)
     */
    @api setComponentData(data, error) {
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
            { label: 'Name',                type: 'id',               data: { value: 'name', url: 'url' }},
            { label: 'API Version',         type: 'numeric',          data: { value: 'apiVersion' }},
            { label: 'Package',             type: 'text',             data: { value: 'package' }},
            { label: 'Using',               type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
            { label: 'Referenced in',       type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length', min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
            { label: 'Dependencies',        type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',        type: 'dateTime',         data: { value: 'createdDate' }},
            { label: 'Modified date',       type: 'dateTime',         data: { value: 'lastModifiedDate' }},
            { label: 'Description',         type: 'text',             data: { value: 'description', maximumLength: 30, valueIfEmpty: 'No description.' }}
        ];
        this.dispatchEvent(new CustomEvent('load', { detail: {}, bubbles: false }));
    }
}