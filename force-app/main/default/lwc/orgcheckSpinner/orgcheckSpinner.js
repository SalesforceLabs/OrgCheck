import { LightningElement, api, track } from 'lwc';
import OrgCheckStaticRessource from "@salesforce/resourceUrl/OrgCheck_SR";

export const SECTION_STATUS_STARTED = 'started';
export const SECTION_STATUS_IN_PROGRESS = 'in-progress';
export const SECTION_STATUS_ENDED = 'ended';
export const SECTION_STATUS_FAILED = 'failed';

export default class OrgCheckSpinner extends LightningElement {

    spinningURL = OrgCheckStaticRessource + '/img/Mascot+Animated.svg';

    isShow;
    #keysIndex;
    @track sections;

    /**
     * Connected callback function
     */
    connectedCallback() {
        this.isShow = false;
        this.sections = [];
        this.#keysIndex = {};
    }

    @api setSection(sectionName, message, status) {
        let item = { 
            id: sectionName,
            liClasses: 'slds-progress__item',
            label: message
        };
        switch (status) {
            case SECTION_STATUS_STARTED: 
                item.liClasses += ' slds-is-completed';
                item.markerStyle = "border-color: ; background-image: url(/img/loading.gif); background-size: 8px";
                break;
            case SECTION_STATUS_ENDED: 
                item.liClasses += ' slds-is-completed'; 
                item.markerStyle = "border-color: green; background-image: url(/img/func_icons/util/checkmark16.gif); background-size: 8px";
                break;
            case SECTION_STATUS_FAILED: 
                item.liClasses += ' slds-has-error'; 
                item.markerStyle = "border-color: ; background-image: url(/img/func_icons/remove12_on.gif); background-size: 8px";
                break;
            case SECTION_STATUS_IN_PROGRESS:
            default:
        }
        if (Object.keys(this.#keysIndex).includes(item.id) === false) {
            this.#keysIndex[item.id] = this.sections.length;
            this.sections.push(item);
        } else {
            const index = this.#keysIndex[item.id];
            this.sections[index] = item;
        }
    }

    @api open() {
        this.isShow = false;
        this.sections = [];
        this.#keysIndex = {};
        this.isShow = true;
    }

    /**
     * Close the spinner after a number of milliseconds
     * 
     * @param {Number} waitBeforeClosing
     */
    @api async close(waitBeforeClosing) {
        const realClose = () => {
            this.isShow = false;
            this.sections = [];
            this.#keysIndex = {};
        };
        if (waitBeforeClosing && waitBeforeClosing > 0) {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(realClose, waitBeforeClosing);
        } else {
            realClose();
        }
    }
}