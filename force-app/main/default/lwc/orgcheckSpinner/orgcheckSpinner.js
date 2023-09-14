import { LightningElement, api, track } from 'lwc';
import OrgCheckStaticRessource from "@salesforce/resourceUrl/OrgCheck_SR";

const SECTION_STATUS_STARTED = 'started';
const SECTION_STATUS_IN_PROGRESS = 'in-progress';
const SECTION_STATUS_ENDED = 'ended';
const SECTION_STATUS_FAILED = 'failed';

export default class OrgCheckSpinner extends LightningElement {

    /**
     * Connected callback function
     */
    connectedCallback() {
        this.isShow = false;
        this.sections = [];
        this.#keysIndex = {};
    }
    
    @api sectionStarts(sectionName, message='...') {
        this._setSection(sectionName, message, SECTION_STATUS_STARTED);
    }

    @api sectionContinues(sectionName, message='...') {
        this._setSection(sectionName, message, SECTION_STATUS_IN_PROGRESS);
    }

    @api sectionEnded(sectionName, message='...') {
        this._setSection(sectionName, message, SECTION_STATUS_ENDED);
    }

    @api sectionFailed(sectionName, message='...') {
        this._setSection(sectionName, message, SECTION_STATUS_FAILED);
    }

    @api open() {
        this.isShow = false;
        this.sections = [];
        this.#keysIndex = {};
        this.#openSince = new Date().getTime();
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
        const shownFor = new Date().getTime() - this.#openSince;
        if (shownFor > 1000 && waitBeforeClosing && waitBeforeClosing > 0) {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(realClose, waitBeforeClosing);
        } else {
            realClose();
        }
    }

    spinningURL = OrgCheckStaticRessource + '/img/Mascot+Animated.svg';

    isShow;

    #keysIndex;
    #openSince;

    @track sections;

    _setSection(sectionName, message, status) {
        let item = { 
            id: sectionName,
            liClasses: 'slds-progress__item',
            markerClasses: 'slds-progress__marker',
            label: message
        };
        switch (status) {
            case SECTION_STATUS_STARTED: 
                item.liClasses += ' slds-is-completed';
                item.markerClasses += ' progress-marker-started';
                break;
            case SECTION_STATUS_ENDED: 
                item.liClasses += ' slds-is-completed'; 
                item.markerClasses += ' progress-marker-ended';
                break;
            case SECTION_STATUS_FAILED: 
                item.liClasses += ' slds-has-error'; 
                item.markerClasses += ' progress-marker-error';
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
}