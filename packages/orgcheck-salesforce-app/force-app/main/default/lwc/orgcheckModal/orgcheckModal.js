// @ts-check
import { LightningElement, api, track } from 'lwc';

export default class OrgcheckModal extends LightningElement {

    constructor() {
        super();
        this.isShown = false;
        this.errorChains = [];
        this._errorChainsAsMap = new Map();
        this.isClosable = false;
        this.message = '';
        this.headerTitle = '';
        this._boundHandleWindowKeyDown = this._handleWindowKeyDown.bind(this);
    }

    /**
     * @description Connected callback function
     * @public
     */
    connectedCallback() {
        window.addEventListener('keydown', this._boundHandleWindowKeyDown);
    }

    /**
     * @description Cleanup callback function
     * @public
     */
    disconnectedCallback() {
        window.removeEventListener('keydown', this._boundHandleWindowKeyDown);
    }
    
    /**
     * @description Opens the modal
     * @param {string} title - Title of the modal
     * @param {string} content - Content of the modal
     * @param {boolean} isClosable - Flag to allow the user to close the modal
     * @public
     */
    @api open(title, content, isClosable=true) {
        if (this.isShown === false) {
            this.isShown = true;
            this.headerTitle = title;
            this.isClosable = isClosable;
            this.message = content ?? 'Nothing to say...';
        }
    }

    /**
     * @description Show the error in a modal (that can be closed) with some context and the errors
     * @param {string} context - Some context for the errors 
     * @param {Error | Error[]} errors - The errors to show in the error modal
     * @public
     */ 
    @api showErrors(context, errors) {
        if (Array.isArray(errors) === false) {
            errors = [ errors ];
        }
        if (this.isShown === false) {
            this._errorChainsAsMap.clear();
        }
        errors.forEach((error) => {
            for (let e = error; e !== undefined; e = e.cause) {
                this._errorChainsAsMap.set(e.message, e);
            }
        });
        /** @type {{ index: number, message: string, body: string }[]} */ const errorChains = [];
        this._errorChainsAsMap.forEach((error, key) => {
            errorChains.push({ 
                index: errorChains.length,
                message: key, 
                body: JSON.stringify(error, (key, value) => key != 'cause' ? value : undefined, 2) 
            });
        });
        this.errorChains = errorChains;
        this.isClosable = true;
        this.headerTitle = `Oops we had an issue... (${context || ''})`;
        this.isShown = true;
    }

    /**
     * @description Handle a click on the close button to.... close the modal!
     * @public
     */
    handleClose() {
        this.isShown = false;
    }

    /**
     * @description Close the modal when the user presses Escape.
     * @param {KeyboardEvent} event - Keyboard event fired on the window
     * @private
     */
    _handleWindowKeyDown(event) {
        if (event.key === 'Escape' && this.isShown === true && this.isClosable === true) {
            this.handleClose();
        }
    }

    /**
     * @description Should we show or hide the modal?
     * @type {boolean}
     * @public
     */
    isShown;

    /**
     * @description Should we show or hide the close button of the modal?
     * @type {boolean}
     * @public
     */
    isClosable;
    
    /**
     * @description Title of that modal
     * @type {string}
     * @public
     */
    headerTitle;
    
    /**
     * @description Message of that modal
     * @type {string}
     * @public
     */
    message;

    /**
     * @description In some case we want to show errors information 
     * @type {{ index: number, message: string, body: string }[]}
     * @public
     */
    @track errorChains;

    /**
     * @description Map of errors as a map of error messages to error objects
     * @type {Map<string, Error>}
     * @private
     */
    _errorChainsAsMap;

    /**
     * @description Bound keydown handler reference
     * @type {(event: KeyboardEvent) => void}
     * @private
     */
    _boundHandleWindowKeyDown;
}