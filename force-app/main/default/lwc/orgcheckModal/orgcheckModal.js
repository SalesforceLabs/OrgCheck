import { LightningElement, api, track } from 'lwc';

export default class OrgCheckModal extends LightningElement {

    /**
     * Connected callback function
     */
    connectedCallback() {
        this.isShown = false;
        this.isClosable = false;
    }
    
    @api open(title, content, isClosable=true) {
        if (this.isShown === false) {
            this.isShown = true;
            this.title = title;
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

    handleClose() {
        this.isShown = false;
    }

    isShown;
    isClosable;
    title;
    message;
    stack;
}