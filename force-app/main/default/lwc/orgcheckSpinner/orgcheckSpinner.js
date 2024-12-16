// @ts-check
import { LightningElement, api, track } from 'lwc';
import OrgCheckStaticRessource from '@salesforce/resourceUrl/OrgCheck_SR';

/**
 * Represents the different statuses of a section
 */
const SectionStatus = {
  STARTED: 'started',
  IN_PROGRESS: 'in-progress',
  ENDED: 'ended',
  FAILED: 'failed' 
};

/**
 * Represents an section with specific properties
 */
class Section {

  /** 
   * The unique identifier of the section
   * @type {string} 
   */
  id;

  /** 
   * The CSS classes for the list section
   * @type {string} 
   */
  liClasses;

  /** 
   * The CSS classes for the marker
   * @type {string} 
   */
  markerClasses;

  /** 
   * The label of the section
   * @type {string} 
   */
  label;

  /**
   * The error stack trace (if any) that happened during the execution of the section
   * @type {string} 
   */
  stack;

  /** 
   * The context information of the section (mostly when an error occured)
   * @type {string} 
   */
  context;
}

/**
 * Displays a spinner to indicate that the organization check is in progress.
 */
export default class OrgCheckSpinner extends LightningElement {

  /**
   * Hide the element by setting the isShown property to false.
   * @private
   */
  hide() {
    this.isShown = false;
  }

  /**
   * Prevents the object from being closed.
   * @private
   */
  cantBeClosed() {
    this.isClosable = false;
  }

  /**
   * Initializes the object by setting default values for sections, error flag, waiting time, and keys index.
   * @private
   */
  init() {
    this.sections = [];
    this.hadError = false;
    this.waitingTime = 0;
    this.keysIndex = new Map();
  }

  /**
   * Connected callback function
   */
  connectedCallback() {
    this.hide();
    this.cantBeClosed();
    this.init();
  }

  /**
   * Marks the start of a new section in the spinner.
   * @param {string} sectionName - The name of the section being started.
   * @param {string} message - The message associated with starting the section.
   */
  @api sectionStarts(sectionName, message) {
    this.setSection(sectionName, message, SectionStatus.STARTED);
  }

  /**
   * Continues the specified section in the spinner with the given message.
   * @param {string} sectionName - The name of the section to continue.
   * @param {string} message - The message to display for the continuation.
   */
  @api sectionContinues(sectionName, message) {
    this.setSection(sectionName, message, SectionStatus.IN_PROGRESS);
  }

  /**
   * Marks the end of a section in the spinner with the given section name and optional message.
   * @param {string} sectionName - The name of the section being ended.
   * @param {string} message - An optional message to provide additional context.
   */
  @api sectionEnded(sectionName, message) {
    this.setSection(sectionName, message, SectionStatus.ENDED);
  }

  /**
   * Handles a failed section by updating the state variables and setting the section status.
   * @param {string} sectionName - The name of the section that failed.
   * @param {any} error - The error object or message associated with the failure.
   */
  @api sectionFailed(sectionName, error) {
    if (this.isShown === false) this.isShown = true;
    this.hadError = true;
    if (error) {
      if (typeof error === 'string') {
        this.setSection(sectionName, error, SectionStatus.FAILED);
      } else {
        this.setSection(sectionName, `${error.name}: ${error.message}`, SectionStatus.FAILED, error);
        console.error(
          `name of the section: ${sectionName}`,
          `name of the error: ${error?.name}`,
          `message of the error: ${error?.message}`,
          `stacktrace of the error: ${error?.stack}`,
          `cause of the error: ${error?.cause}`,
          error
        );
      }
    } else {
      this.setSection(sectionName, 'The error was undefined...', SectionStatus.FAILED);
    }
  }

  /**
   * Opens the spinner and initializes necessary properties and timers.
   * If the spinner is not already shown, it resets sections, keys index, and sets the open time.
   * It then starts a timer to update the waiting time every second.
   */
  @api open() {
    if (this.isShown === false) {
      this.cantBeClosed();
      this.init();
      this.openSince = new Date().getTime();
      this.isShown = true;
      const updateWaitingTime = () => {
        this.waitingTime = (new Date().getTime() - this.openSince) / 1000;
      };
      clearInterval(this.intervalId);
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      this.intervalId = setInterval(updateWaitingTime, 1000);
    }
  }

  /**
   * Sets the 'isClosable' property to true and clears the interval timer
   */
  @api canBeClosed() {
    this.isClosable = true;
    clearInterval(this.intervalId);
  }

  /**
   * Handles the closing of a section by resetting all relevant properties and clearing intervals
   */
  handleClose() {
    this.hide();
    this.init();
    this.openSince = undefined;
    clearInterval(this.intervalId);
  }

  /**
   * Closes the spinner after a specified wait time.
   * @param {number} waitBeforeClosing - The time to wait before closing the API.
   * @async
   */
  @api async close(waitBeforeClosing) {
    this.cantBeClosed();
    const shownFor = new Date().getTime() - this.openSince;
    const realClose = () => {
      this.hide();
      this.init();
      this.openSince = undefined;
      clearInterval(this.intervalId);
    };
    if (shownFor > 1000 && waitBeforeClosing && waitBeforeClosing > 0) {
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      setTimeout(realClose, waitBeforeClosing);
    } else {
      realClose();
    }
  }

  /**
   * URL of the spinning mascot
   * @type {string}
   */
  spinningURL = OrgCheckStaticRessource + '/img/Mascot+Animated.svg';

  /**
   * Switch to show the spinner or not
   * @type {boolean}
   */
  isShown;

  /**
   * Switch to show the close button of the spinner or not
   * @type {boolean}
   */
  isClosable;

  /**
   * Number of millisecond to wait before closing the spinner
   * @type {number}
   */
  waitingTime;

  /**
   * Say if we had an error during spinning and then need to stop to let the user see the error
   * @type {boolean}
   */
  hadError;

  /**
   * Map to find the section index from its name
   * @type {Map}
   * @private
   */
  keysIndex;

  /**
   * Open since what time?
   * @type {number}
   * @private
   */
  openSince;

  /**
   * Information to use internally with setInterval method.
   * @type {any}
   * @private
   */
  intervalId;

  /**
   * List of sections to show in the spinner
   * @type {Array<Section>}
   */
  @track sections;

  /**
   * Sets a section with the given section name, message, status, and error.
   * @param {string} sectionName - The name of the section.
   * @param {string} message - The message to display in the section.
   * @param {string} status - The status of the section.
   * @param {any} error - Any error associated with the section.
   * @private
   */
  setSection(sectionName, message, status, error) {
    
    /** @type {Section} */
    let section = {
      id: sectionName,
      liClasses: 'slds-progress__item',
      markerClasses: 'slds-progress__marker',
      label: message,
      stack: error?.stack,
      context: error ? JSON.stringify(error.context) : undefined
    };

    switch (status) {
      case SectionStatus.STARTED:
      case SectionStatus.IN_PROGRESS:
      default:
        section.liClasses += ' slds-is-completed';
        section.markerClasses += ' progress-marker-started';
        break;
      case SectionStatus.ENDED:
        section.liClasses += ' slds-is-completed';
        section.markerClasses += ' progress-marker-ended';
        break;
      case SectionStatus.FAILED:
        section.liClasses += ' slds-has-error';
        section.markerClasses += ' progress-marker-error';
        break;
    }
    
    if (this.keysIndex.has(section.id) === false) {
      this.keysIndex.set(section.id, this.sections.length);
      this.sections.push(section);
    } else {
      const index = this.keysIndex.get(section.id);
      this.sections[index] = section;
    }
  }
}