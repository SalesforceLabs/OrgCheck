import { LightningElement, api } from 'lwc';

export default class OrgcheckDependencyLink extends LightningElement {

    @api whatid;
    @api whatname;
    @api dependencies;
    numberOfDependencies;

    connectedCallback() {
        this.numberOfDependencies = ((this.dependencies?.using?.length || 0) + (this.dependencies?.referenced?.length || 0));
    }

    handleClick() {
        this.dispatchEvent(new CustomEvent('view', { detail: { whatid: this.whatid, whatname: this.whatname, dependencies: this.dependencies }, bubbles: false }));
    }
}