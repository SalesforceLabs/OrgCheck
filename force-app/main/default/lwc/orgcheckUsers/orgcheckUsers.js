import { LightningElement, api } from 'lwc';

export default class OrgcheckUsers extends LightningElement {

    /**
     * Set the component data.
     * 
     * @param {Array<SFDC_User>} data 
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
            { label: 'Score',           type: 'numeric',  data: { value: 'score' }, sorted: 'desc' },
            { label: 'User Name',       type: 'id',       data: { value: 'name', url: 'url' }},
            { label: 'Last login',      type: 'dateTime', data: { value: 'lastLogin' }},
            { label: 'Failed logins',   type: 'numeric',  data: { value: 'numberFailedLogins' }},
            { label: 'Password change', type: 'dateTime', data: { value: 'lastPasswordChange' }},
            { label: 'Key permissions', type: 'texts',    data: { values: 'importantPermissions' }},
            { label: 'Profile',         type: 'id',       data: { ref: 'profileRef', url: 'url', value: 'name' }},
            { label: 'Permission Sets', type: 'ids',      data: { values: 'permissionSetRefs', url: 'url', value: 'name' }}
        ];
        this.dispatchEvent(new CustomEvent('load', { detail: {}, bubbles: false }));
    }
}