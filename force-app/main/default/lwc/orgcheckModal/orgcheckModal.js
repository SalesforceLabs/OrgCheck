import { LightningElement, api, track } from 'lwc';

export default class OrgCheckModal extends LightningElement {

    /**
     * Connected callback function
     */
    connectedCallback() {
        this.isShown = false;
    }
    
    @api open(title, content) {
        if (this.isShown === false) {
            this.isShown = true;
            this.title = title;
            this.content = content;
        }
    }

    handleClose() {
        this.isShown = false;
    }

    isShown;
    title;
    content;
}