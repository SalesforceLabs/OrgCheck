import { LightningElement, api } from 'lwc';

export default class OrgCheckModal extends LightningElement {

    /**
     * Connected callback function
     */
    connectedCallback() {
        this.isShown = false;
        this.isClosable = false;
    }
    
    /**
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
     * Handle a click on the close button to.... close the modal!
     */
    handleClose() {
        this.isShown = false;
    }

    /**
     * @type {boolean}
     */
    isShown;

    /**
     * @type {boolean}
     */
    isClosable;
    
    /**
     * @type {string}
     */
    headerTitle;
    
    /**
     * @type {string}
     */
    message;

    /**
     * @type {string}
     */
    stack;
}