import { LightningElement, wire } from 'lwc';
import { subscribe, unsubscribe, APPLICATION_SCOPE, publish, MessageContext } from 'lightning/messageService';
import orgcheckFilterEvent from '@salesforce/messageChannel/orgcheckFilter__c';
import orgcheckPingEvent from '@salesforce/messageChannel/orgcheckPing__c';

export default class OrgcheckApp extends LightningElement {

    /* ******** */
    /* SETTINGS */
    /* ******** */
    
    settingFilterPackage = '';
    settingFilterSObjectType = '';
    settingFilterSObject = '';
    settingShowExternalRoles = 'false';
    settingUseInProductionConfirmation = 'false';

    get settingFilterPackageOptions() {
        return [
            { label: 'All packages', value: '' },
            { label: 'Package1', value: 'ab1' },
            { label: 'Package2', value: 'cd2' },
            { label: 'Package3', value: 'ht3' }
        ];
    }

    get settingFilterSObjectTypeOptions() {
        return [
            { label: 'All types', value: '' },
            { label: 'Standard Objects', value: 'STANDARD_SOBJECTS' },
            { label: 'Custom Objects', value: 'CUSTOM_SOBJECTS' },
            { label: 'External Objects', value: 'CUSTOM_EXTERNAL_SOBJECTS' },
            { label: 'Custom Settings', value: 'CUSTOM_SETTINGS' },
            { label: 'Custom Metadata Types', value: 'CUSTOM_METADATA_TYPES' },
            { label: 'Platform Events', value: 'CUSTOM_EVENTS' },
            { label: 'Knowledge Articles', value: 'KNOWLEDGE_ARTICLES' },
            { label: 'Big Objects', value: 'CUSTOM_BIG_OBJECTS' }
        ];
    }

    get settingFilterSObjectOptions() {
        return [
            { label: 'All objects', value: '' },
        ];
    }

    get settingYesNoOptions() {
        return [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' }
        ];
    }

    settingFilterPackageHandleChange(event) {
        this.filterPackage = event.detail.value;
        this.settingChanged();
    }

    settingFilterSObjectTypeHandleChange(event) {
        this.settingFilterSObjectType = event.detail.value;
        this.settingChanged();
    }

    settingFilterSObjectHandleChange(event) {
        this.settingFilterSObject = event.detail.value;
        this.settingChanged();
    }

    settingShowExternalRolesHandleChange(event) {
        this.settingShowExternalRoles = event.detail.value;
        this.settingChanged();
    }

    settingUseInProductionConfirmationHandleChange(event) {
        this.settingUseInProductionConfirmation = event.detail.value;
        this.settingChanged();
    }

    /* ******** */
    /* ORG INFO */
    /* ******** */

    informationOrgId = '00D7Q00000ADl52UAD';
    informationOrgType = 'Developer Edition';
    informationOrgDailyApiLimitRate = 0.127;

    get isCurrentOrgAProduction() {
        return this.orgType === 'Production';
    }

    get orgInfo() {
        return this.orgId + ' (' + this.orgType + ')';
    }

    get themeForOrgInfo() {
        if (this.orgType === 'Production' && this.prodUsageConfirmation !== true) return 'slds-theme_error';
        return 'slds-theme_success';
    }

    get orgLimit () {
        return 'Daily API Request Limit: ' + ((this.orgDailyApiLimitRate * 100).toFixed(3)) + ' %';
    }

    get themeForOrgLimit() {
        if (this.orgDailyApiLimitRate > 0.9) return 'slds-theme_error';
        if (this.orgDailyApiLimitRate > 0.7) return 'slds-theme_warning';
        return 'slds-badge_lightest';
    }

    /* ********** */
    /* DATATABLES */
    /* ********** */

    customFieldsData = [];
    customFieldsColumns = [
        { label: '#', fieldName: 'index' },
        { label: 'Object', fieldName: 'sobject', type: 'url' },
        { label: 'Type', fieldName: 'type' },
        { label: 'Field', fieldName: 'field', type: 'url' },
        { label: 'Package', fieldName: 'namespace' },
        { label: 'Full API Name', fieldName: 'developerName' },
        { label: 'Using', fieldName: 'using' }
    ];

    usersData = [];
    usersColumns = [
        { label: '#', fieldName: 'index' },
        { label: 'Score', fieldName: 'score', type: 'number' },
        { label: 'User Name', fieldName: 'name' },
        { label: 'LastLogin', fieldName: 'lastLogin', type: 'datatime' }
    ];

    /* ****** */
    /* EVENTS */
    /* ****** */

    data = '';

    tabHandleActivation(event) {
        this.data = 'a tab was clicked: ' + JSON.stringify(event);
    }

    settingChanged() {
        this.data = 'filter changed: ' + JSON.stringify({
            'package': this.settingFilterPackage,
            'sobjectType': this.settingFilterSObjectType,
            'sobject': this.settingFilterSObject,
            'showExternalRoles': this.settingShowExternalRoles,
            'useInProdConfirm': this.settingUseInProductionConfirmation
        })
    }
}