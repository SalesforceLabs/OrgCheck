import { LightningElement, api } from 'lwc';

export default class OrgcheckObjectInformation extends LightningElement {

    /**
     * Set the component data.
     * 
     * @param {SFDC_ObjectInformation} data 
     */
    @api setComponentData(data) {
        if (data && (typeof data === Object)) {
            console.error('TODO: implement method <updateData> in this component');
        } else {
            console.error('TODO: implement method <updateData> in this component');
        }
    }
    
    @api package;

    @api sobjectApiName

    @api isSObjectSpecified;

    /**
     * Connected callback function
     */
    connectedCallback() {
        this.dispatchEvent(new CustomEvent('load', { detail: {}, bubbles: false }));
    }
}