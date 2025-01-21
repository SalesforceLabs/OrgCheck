// @ts-check
import { LightningElement, api, track } from 'lwc';
import OrgCheckStaticRessource from '@salesforce/resourceUrl/OrgCheck_SR';

/**
 * @description Represents the different statuses of a section
 */
const SectionStatus = {
  IN_PROGRESS: 'in-progress',
  ENDED: 'ended',
  FAILED: 'failed' 
};

/**
 * @description Represents an section with specific properties
 */
class Section {

  /** 
   * @description The unique identifier of the section
   * @type {string} 
   */
  id;

  /** 
   * @description The current status of the section
   * @type {string} 
   */
  status;

  /** 
   * @description The CSS classes for the list section
   * @type {string} 
   */
  liClasses;

  /** 
   * @description The CSS classes for the marker
   * @type {string} 
   */
  markerClasses;

  /** 
   * T@description he label of the section
   * @type {string} 
   */
  label;

  /**
   * @description The error stack trace (if any) that happened during the execution of the section
   * @type {string} 
   */
  stack;

  /** 
   * @description The context information of the section (mostly when an error occured)
   * @type {string} 
   */
  context;
}

/**
 * @description Displays a spinner to indicate that the organization check is in progress.
 */
export default class OrgcheckSpinner extends LightningElement {

  /**
   * @description Hide the element by setting the isShown property to false.
   * @private
   */
  hide() {
    this.isShown = false;
  }

  /**
   * @description Prevents the object from being closed.
   * @private
   */
  cantBeClosed() {
    this.isClosable = false;
  }

  /**
   * @description Initializes the object by setting default values for sections, error flag, waiting time, and keys index.
   * @private
   */
  init() {
    this.sections = [];
    this.hadError = false;
    this.waitingTime = 0;
    this._keysIndex = new Map();
    this.inProgressMessage = '';
  }

  /**
   * @description Connected callback function
   */
  connectedCallback() {
    this.hide();
    this.cantBeClosed();
    this.init();
  }

  /**
   * @description Continues the specified section in the spinner with the given message.
   * @param {string} sectionName - The name of the section to continue.
   * @param {string} message - The message to display for the continuation.
   */
  @api sectionLog(sectionName, message) {
    this._setSection(sectionName, message, SectionStatus.IN_PROGRESS);
  }

  /**
   * @description Marks the end of a section in the spinner with the given section name and optional message.
   * @param {string} sectionName - The name of the section being ended.
   * @param {string} message - An optional message to provide additional context.
   */
  @api sectionEnded(sectionName, message) {
    this._setSection(sectionName, message, SectionStatus.ENDED);
  }

  /**
   * @description Handles a failed section by updating the state variables and setting the section status.
   * @param {string} sectionName - The name of the section that failed.
   * @param {string | Error} error - The error object or message associated with the failure.
   */
  @api sectionFailed(sectionName, error) {
    this.hadError = true;
    if (error instanceof Error) {
      console.error(
        `name of the section: ${sectionName}`,
        `name of the error: ${error?.name}`,
        `message of the error: ${error?.message}`,
        `stacktrace of the error: ${error?.stack}`,
        `cause of the error: ${error?.cause}`,
        error
      );
    }
    this._setSection(sectionName, error, SectionStatus.FAILED);
  }

  /**
   * @description Opens the spinner and initializes necessary properties and timers.
   *                If the spinner is not already shown, it resets sections, keys index, and sets the open time.
   *                It then starts a timer to update the waiting time every second.
   */
  @api open() {
    if (this.isShown === false) {
      this.cantBeClosed();
      this.init();
      this._openSince = Date.now();
      this.isShown = true;
      const updateWaitingTime = () => {
        this.waitingTime = (Date.now() - this._openSince) / 1000;
      };
      clearInterval(this._intervalId);
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      this._intervalId = setInterval(updateWaitingTime, 1000);
    }
  }

  /**
   * @description Sets the 'isClosable' property to true and clears the interval timer
   */
  @api canBeClosed() {
    this.isClosable = true;
    clearInterval(this._intervalId);
  }

  /**
   * @description Handles the closing of a section by resetting all relevant properties and clearing intervals
   */
  handleClose() {
    this.hide();
    this.init();
    this._openSince = undefined;
    clearInterval(this._intervalId);
  }

  /**
   * @description Closes the spinner after a specified wait time.
   * @param {number} waitBeforeClosing - The time to wait before closing the API.
   * @async
   */
  @api async close(waitBeforeClosing) {
    this.cantBeClosed();
    const shownFor = Date.now() - this._openSince;
    const realClose = () => {
      this.hide();
      this.init();
      this._openSince = undefined;
      clearInterval(this._intervalId);
    };
    if (shownFor > 1000 && waitBeforeClosing && waitBeforeClosing > 0) {
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      setTimeout(realClose, waitBeforeClosing);
    } else {
      realClose();
    }
  }

  /**
   * @description URL of the spinning mascot
   * @type {string}
   */
  spinningURL = OrgCheckStaticRessource + '/img/Mascot+Animated.svg';

  /**
   * @description Switch to show the spinner or not
   * @type {boolean}
   */
  isShown;

  /**
   * @description Switch to show the close button of the spinner or not
   * @type {boolean}
   */
  isClosable;

  /**
   * @description Number of millisecond to wait before closing the spinner
   * @type {number}
   */
  waitingTime;

  /**
   * @description Say if we had an error during spinning and then need to stop to let the user see the error
   * @type {boolean}
   */
  hadError;

  /**
   * @description Map to find the section index from its name
   * @type {Map}
   * @private
   */
  _keysIndex;

  /**
   * @description Open since what time?
   * @type {number}
   * @private
   */
  _openSince;

  /**
   * @description Information to use internally with setInterval method.
   * @type {any}
   * @private
   */
  _intervalId;

  /**
   * @description Progression message
   * @type {string}
   * @public
   */ 
  inProgressMessage;

  /**
   * @description List of sections to show in the spinner
   * @type {Array<Section>}
   */
  @track sections;

  /**
   * @description Sets a section with the given section name, message, status, and error. We show the spinner if not yet opened.
   * @param {string} sectionName - The name of the section.
   * @param {string | Error} message - The message (string or error) to handle in the section.
   * @param {string} status - The status of the section.
   * @private
   */
  _setSection(sectionName, message, status) {

    // make sure the spinner is open (if not already)
    this.open();

    /** @type {Section} */
    let section = {
      id: sectionName,
      status: status,
      label: (message instanceof Error ? `${message.name}: ${message.message}` : message),
      stack: (message instanceof Error ? message?.stack : ''),
      context: (message instanceof Error ? JSON.stringify(message['context']) : ''),
      liClasses: 'slds-progress__item',
      markerClasses: 'slds-progress__marker'
    };

    // Add specific classes depending on the status
    switch (status) {
      case SectionStatus.IN_PROGRESS: section.liClasses += ' slds-is-completed';          section.markerClasses += ' progress-marker-started'; break;
      case SectionStatus.ENDED:       section.liClasses += ' slds-is-completed li-ended'; section.markerClasses += ' progress-marker-ended';   break;
      case SectionStatus.FAILED:      section.liClasses += ' slds-has-error';             section.markerClasses += ' progress-marker-error';   break;
    }
    
    // Is it a new section?
    if (this._keysIndex.has(sectionName) === false) {
      // Yes it's a new section!
      this._keysIndex.set(sectionName, this.sections.length);
      this.sections.push(section); // insert this section
    } else {
      // Existing section...
      const index = this._keysIndex.get(sectionName);
      this.sections[index] = section; // update the section
    }

    // Count the in_progress sections
    const countInProgressSections = this.sections.filter(s => s.status === SectionStatus.IN_PROGRESS).length;
    if (countInProgressSections === 0) {
      this.inProgressMessage = '';
      this.close(0);
    } else {
      this.inProgressMessage = `We have currently ${countInProgressSections} section${countInProgressSections>1?'s':''} in progress with a total of ${this.sections.length} section${this.sections.length>1?'s':''}...`;
    }
  }
}