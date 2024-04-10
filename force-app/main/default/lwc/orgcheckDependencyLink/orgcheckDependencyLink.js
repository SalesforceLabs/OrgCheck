import { LightningElement, api } from 'lwc';

export default class OrgcheckDependencyLink extends LightningElement {

    @api whatId;
    @api whatName;
    @api dependencies;
    numberOfDependencies;

    connectedCallback() {
        this.numberOfDependencies = ((this.dependencies?.using?.length || 0) + (this.dependencies?.referenced?.length || 0));
    }

    handleClick() {
        this.dispatchEvent(new CustomEvent('view', { detail: { whatId: this.whatId, whatName: this.whatName, dependencies: this.dependencies } }));
    }
}