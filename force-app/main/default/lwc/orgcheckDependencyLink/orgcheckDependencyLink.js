import { LightningElement, api } from 'lwc';

export default class OrgcheckDependencyLink extends LightningElement {

    @api whatid;
    @api whatname;
    @api dependencies;

    handleClick() {
        this.dispatchEvent(new CustomEvent('view', { detail: { whatid: this.whatid, whatname: this.whatname, dependencies: this.dependencies }, bubbles: false }));
    }
}