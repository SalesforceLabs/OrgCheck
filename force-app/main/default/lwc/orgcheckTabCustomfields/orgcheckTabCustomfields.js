import { LightningElement, api } from 'lwc';

export default class OrgcheckTabCustomfields extends LightningElement {

    @api tableData;

    @api tableKeyField;

    @api tableColumns;
}