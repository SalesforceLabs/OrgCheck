// @ts-check
import { LightningElement, api } from 'lwc';

/**
 * Represents a custom Lightning web component that handles clicking on a score link.
 */
export default class OrgcheckScoreLink extends LightningElement {

    /**
     * @type {string}
     */
    @api whatId;

    /**
     * @type {string}
     */
    @api whatName;

    /**
     * @type {number}
     */
    @api score;

    /**
     * @type {Array<string>}
     */
    @api reasonIds; 

    /**
     * @type {Array<string>}
     */
    @api fields;

    /**
     * @type {boolean}
     */
    get isShown() { return this.score > 0; }

    /**
     * Dispatches a custom 'view' event with details including whatId, whatName, score, reasonIds, and fields
     */
    handleClick() {
        this.dispatchEvent(new CustomEvent('view', { detail: { 
            whatId: this.whatId,
            whatName: this.whatName,
            score: this.score,
            reasonIds: this.reasonIds, 
            fields: this.fields 
        }}));
    }
}