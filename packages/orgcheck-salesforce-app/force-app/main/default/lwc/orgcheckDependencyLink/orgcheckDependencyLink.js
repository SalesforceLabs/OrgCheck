import { LightningElement, api } from 'lwc';

export default class OrgcheckDependencyLink extends LightningElement {

    /**
     * @description The Salesforce ID of the item
     * @type {string}
     * @public
     */ 
    @api whatId;

    /**
     * @description The Salesforce ID of the item
     * @type {string}
     * @public
     */ 
    @api whatName;

    /**
     * @description Data dependencies of the item
     * @public
     */ 
    @api dependencies;

    /**
     * @description Number of the using and referenced items for this item
     * @type {number}
     * @public
     */
    numberOfDependencies;

    /** 
     * @description HadError flag of the given Dependencies
     * @type {boolean}
     */
    hadError;

    /**
     * @description Connected callback function
     * @public
     */
    connectedCallback() {
        this.numberOfDependencies = ((this.dependencies?.using?.length || 0) + (this.dependencies?.referenced?.length || 0));
        this.hadError = this.dependencies?.hadError || false;
    }

    /**
     * @description Label of the link, including the number of dependencies (like "Dependencies (12)")
     * @type {string}
     * @public
     */
    get dependenciesLabel() {
        // Non-breaking space: lightning-button resets white-space internally, so CSS cannot prevent the wrap
        return `Dependencies\u00A0(${this.numberOfDependencies})`;
    }

    /**
     * @description Event when a user click on the view button
     * @public
     */
    handleViewClick() {
        this.dispatchEvent(new CustomEvent('view', { detail: { whatId: this.whatId, whatName: this.whatName, dependencies: this.dependencies } }));
    }
}