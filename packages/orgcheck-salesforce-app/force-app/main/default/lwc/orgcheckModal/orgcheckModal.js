// @ts-check
import { LightningElement, api, track } from 'lwc';

export default class OrgcheckModal extends LightningElement {

    constructor() {
        super();
        this.isShown = false;
        this.errorChains = [];
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
        /** @type {{ index: number, name: string, chain: {message: string, body: string}[] }[]} */
        const errorChains = errors.map((error, index) => {
            const chain = [];
            for (let e = error; e !== undefined; e = e.cause) {
                chain.push({ message: e.message, body: JSON.stringify(e, (key, value) => key != 'cause' ? value : undefined, 2) });
            }
            return { index, name: title, chain };
        });
        if (this.isShown === false) {
            this.errorChains = errorChains;
            this.isShown = true;
            this.isClosable = true;
            this.headerTitle = title;
        } else {
            this.errorChains.push(...errorChains);
            // reset the index accordingly
            this.errorChains.forEach((errorChain, index) => errorChain.index = index);
        }
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
     * @type {{ index: number, chain: {message: string, body: string}[] }[]}
     * @public
     */
    @track errorChains;

    /**
     * @description Bound keydown handler reference
     * @type {(event: KeyboardEvent) => void}
     * @private
     */
    _boundHandleWindowKeyDown;
}