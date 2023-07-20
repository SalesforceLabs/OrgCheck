import { LightningElement, api } from 'lwc';

const changeHandling = (me, filtername, event) => {
    const oldvalue = me[filtername];
    const newvalue = me[filtername] = event.detail.value;
    me.dispatchEvent(
        new CustomEvent(
            'change', 
            { 
                detail: {
                    oldValue: oldvalue,
                    newValue: newvalue,
                    what: filtername
                },
                bubbles: true 
            }
        )
    );
}

export default class OrgcheckGlobalFilters extends LightningElement {

    @api package;
    @api sobjectType;
    @api sobjectApiName;
    @api showExternalRoles = 'false';
    @api useInProductionConfirmation = 'false';
    @api packageOptions;
    @api sobjectApiNameOptions;
    @api sobjectTypeOptions;

    get yesNoOptions() {
        return [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' }
        ];
    }

    packageHandleChange(event) {
        changeHandling(this, 'package', event);
    }

    sobjectTypeHandleChange(event) {
        changeHandling(this, 'sobjectType', event);
    }

    sobjectApiNameHandleChange(event) {
        changeHandling(this, 'sobjectApiName', event);
    }

    showExternalRolesHandleChange(event) {
        changeHandling(this, 'showExternalRoles', event);
    }

    useInProductionConfirmationHandleChange(event) {
        changeHandling(this, 'useInProductionConfirmation', event);
    }
}