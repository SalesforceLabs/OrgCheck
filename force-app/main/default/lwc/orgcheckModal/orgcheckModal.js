// @ts-check
import { LightningElement, api } from 'lwc';

export default class OrgcheckModal extends LightningElement {

    /**
     * @description Connected callback function
     * @public
     */
    connectedCallback() {
        this.isShown = false;
        this.isClosable = false;
    }
    
    /**
     * @description Opens the modal
     * @param {string} title
     * @param {Error | string | object} content
     * @param {boolean} isClosable
     */
    @api open(title, content, isClosable=true) {
        if (this.isShown === false) {
            this.isShown = true;
            this.headerTitle = title;
            this.isClosable = isClosable;
            if (content) {
                if (content instanceof Error) {
                    this.message = content.message;
                    this.stack = content.stack;
                } else if (typeof content === 'string') {
                    this.message = content;
                    this.stack = undefined;
                } else {
                    this.message = JSON.stringify(content);
                    this.stack = undefined;
                } 
            } else {
                this.message = 'Nothing to say...';
            }
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
     * @description In some case we want to show an error stack below the message
     * @type {string}
     * @public
     */
    stack;
}