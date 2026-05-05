// @ts-check
import { LightningElement, api, track } from 'lwc';

export default class OrgcheckModal extends LightningElement {

    constructor() {
        super();
        this.isShown = false;
        this.errorChains = [];
        this._errorChainsAsMap = new Map();
        this.hasApiAccessControlIssue = false;
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
     * @description Show the error in a modal (that can be closed)
     * @param {string} title - Title of the modal
     * @param {Error | Error[]} errors - The errors to show in the error modal
     * @public
     */ 
    @api showErrors(title, errors) {
        if (Array.isArray(errors) === false) {
            errors = [ errors ];
        }
        if (this.isShown === false) {
            this._errorChainsAsMap.clear();
            this.hasApiAccessControlIssue = false;
        }
        errors.forEach((error) => {
            for (let e = error; e !== undefined; e = e.cause) {
                this._errorChainsAsMap.set(e.message, e);
            }
        });
        /** @type {{ index: number, message: string, body: string }[]} */ const errorChains = [];
        let hasApiAccessControlIssue = false;
        this._errorChainsAsMap.forEach((error, key) => {
            errorChains.push({ 
                index: errorChains.length,
                message: key, 
                body: JSON.stringify(error, (key, value) => key != 'cause' ? value : undefined, 2) 
            });
            if (hasApiAccessControlIssue === false && error.code === 'INVALID_SESSION_ID') {
                hasApiAccessControlIssue = true;
            }
        });
        this.errorChains = errorChains;
        this.hasApiAccessControlIssue = hasApiAccessControlIssue;
        this.isClosable = true;
        this.headerTitle = title;
        this.isShown = true;
    }

    /**
     * @description Handle a click on the close button to.... close the modal!
     * @public
     */
    handleClose() {
        this.isShown = false;
        this.hasApiAccessControlIssue = false;
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

    _errorChainsAsMap;

    /**
     * @description Flag to indicate the error is caused by API Access Control blocking Visualforce session IDs
     * @type {boolean}
     * @public
     */
    @track hasApiAccessControlIssue;

    /**
     * @description Bound keydown handler reference
     * @type {(event: KeyboardEvent) => void}
     * @private
     */
    _boundHandleWindowKeyDown;
}