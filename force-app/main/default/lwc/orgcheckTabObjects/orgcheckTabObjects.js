import { LightningElement, api } from 'lwc';

export default class OrgcheckTabObjects extends LightningElement {

    @api package;

    @api sobjectApiName

    @api isSObjectSpecified;
}