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
            { label: 'Included groups',  type: 'texts',    data: { ref: 'directGroups', value: 'id' }},
            { label: 'Included users',   type: 'texts',    data: { ref: 'directUsers', value: 'id' }},
            { label: 'All active users', type: 'texts',    data: { ref: 'indirectUsers', value: 'id' }},
        ];
        this.dispatchEvent(new CustomEvent('load'));
    }
}