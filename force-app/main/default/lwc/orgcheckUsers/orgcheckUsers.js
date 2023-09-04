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

    tableKeyField;

    tableData;

    isTableEmpty;

    /**
     * Connected callback function
     */
    connectedCallback() {
        this.tableColumns = [
            { label: 'User Name',       type: 'id',       data: { value: 'id', url: 'url', label: 'name' }},
            { label: 'Last login',      type: 'dateTime', data: { value: 'lastLogin' }},
            { label: 'Failed logins',   type: 'numeric',  data: { value: 'numberFailedLogins' }},
            { label: 'Password change', type: 'dateTime', data: { value: 'lastPasswordChange' }},
            { label: 'Key permissions', type: 'texts',    data: { values: 'importantPermissions' }},
            { label: 'Profile',         type: 'id',       data: { ref: 'profileRef', url: 'url', label: 'name' }},
            { label: 'Permission Sets', type: 'ids',      data: { values: 'permissionSetRefs', url: 'url', label: 'name' }}
        ];
        this.tableKeyField = 'index';
        this.dispatchEvent(new CustomEvent('load', { detail: {}, bubbles: false }));
    }
}