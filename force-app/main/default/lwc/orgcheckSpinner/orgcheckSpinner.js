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
        this.isShown = false;
        this.isClosable = false;
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

    @api sectionFailed(sectionName, error) {
        if (error) {
            if (typeof error === 'string') {
                this._setSection(sectionName, error, SECTION_STATUS_FAILED);
            } else {
                this._setSection(sectionName, error.message, SECTION_STATUS_FAILED);
                this._setErrorDetail(error.stack);
            }
        } else {
            this._setSection(sectionName, 'The error was undefined...', SECTION_STATUS_FAILED);
        }
    }

    @api open() {
        if (this.isShown === false) {
            this.sections = [];
            this.#keysIndex = {};
            this.#openSince = new Date().getTime();
            this.isShown = true;
            this.isClosable = false;
        }
    }

    @api canBeClosed() {
        this.isClosable = true;
    }

    handleClose() {
        this.isShown = false;
        this.sections = [];
        this.#keysIndex = {};
    }

    /**
     * Close the spinner after a number of milliseconds
     * 
     * @param {Number} waitBeforeClosing
     */
    @api async close(waitBeforeClosing) {
        this.isClosable = false;
        const shownFor = new Date().getTime() - this.#openSince;
        const realClose = () => {
            this.isShown = false;
            this.sections = [];
            this.#keysIndex = {};    
        }
        if (shownFor > 1000 && waitBeforeClosing && waitBeforeClosing > 0) {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(realClose, waitBeforeClosing);
        } else {
            realClose();
        }
    }

    spinningURL = OrgCheckStaticRessource + '/img/Mascot+Animated.svg';

    isShown;
    isClosable;

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
            case SECTION_STATUS_IN_PROGRESS:
            default:
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
        }
        if (Object.keys(this.#keysIndex).includes(item.id) === false) {
            this.#keysIndex[item.id] = this.sections.length;
            this.sections.push(item);
        } else {
            const index = this.#keysIndex[item.id];
            this.sections[index] = item;
        }
    }

    _setErrorDetail(stack) {
        console.error(stack);
    }
}