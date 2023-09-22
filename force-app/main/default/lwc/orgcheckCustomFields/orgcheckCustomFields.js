import { LightningElement, api } from 'lwc';

export default class OrgcheckCustomfields extends LightningElement {

    /**
     * Set the component data.
     * 
     * @param {Array<DatasetCacheInfo>} data 
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
            { label: 'Object',              type: 'id',               data: { ref: 'objectRef', value: 'label', url: 'url' }},
            { label: 'Object Type',         type: 'text',             data: { ref: 'objectRef.typeRef', value: 'label' }},
            { label: 'Field',               type: 'id',               data: { value: 'name', url: 'url' }},
            { label: 'Package',             type: 'text',             data: { value: 'package' }},
            { label: 'Using',               type: 'numeric',          data: { ref: 'dependencies.using', value: 'length' }},
            { label: 'Referenced in',       type: 'numeric',          data: { ref: 'dependencies.referenced', value: 'length', min: 1, valueBeforeMin: 'Not referenced anywhere.' }},
            { label: 'Ref. in Layout?',     type: 'numeric',          data: { ref: 'dependencies.referencedByTypes', value: 'Layout' }},
            { label: 'Ref. in Apex Class?', type: 'numeric',          data: { ref: 'dependencies.referencedByTypes', value: 'Class' }},
            { label: 'Ref. in Flow?',       type: 'numeric',          data: { ref: 'dependencies.referencedByTypes', value: 'Flow' }},
            { label: 'Dependencies',        type: 'dependencyViewer', data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',        type: 'dateTime',         data: { value: 'createdDate' }},
            { label: 'Modified date',       type: 'dateTime',         data: { value: 'lastModifiedDate' }},
            { label: 'Description',         type: 'text',             data: { value: 'description', valueIfEmpty: 'No description.' }}
        ];
        this.dispatchEvent(new CustomEvent('load', { detail: {}, bubbles: false }));
    }
}