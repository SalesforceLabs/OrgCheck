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

    tableKeyField;

    tableData;

    isTableEmpty;

    /**
     * Connected callback function
     */
    connectedCallback() {
        this.tableColumns = [
            { fieldName: 'index', label: '#' },
            { fieldName: 'score', label: 'Score' }
        ];
        this.tableKeyField = 'index';
        this.dispatchEvent(new CustomEvent('load', { detail: {}, bubbles: false }));
    }
}