import { LightningElement, api } from 'lwc';

export default class OrgcheckPublicGroups extends LightningElement {

    /**
     * Set the component data.
     * 
     * @param {Array<SFDC_Group>} data 
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
            { label: 'Name',             type: 'id',       data: { value: 'name', url: 'url' }},
            { label: 'Developer Name',   type: 'text',     data: { value: 'developerName' }},
            { label: 'With bosses?',     type: 'boolean',  data: { value: 'includeBosses' }},
            { label: 'Included groups',  type: 'ids',      data: { values: 'directGroups', value: 'id', url: 'url' }},
            { label: 'Included users',   type: 'ids',      data: { values: 'directUsers', value: 'id', url: 'url' }},
            { label: 'All active users', type: 'ids',      data: { values: 'indirectUsers', value: 'id', url: 'url' }},
        ];
        this.dispatchEvent(new CustomEvent('load'));
    }
}