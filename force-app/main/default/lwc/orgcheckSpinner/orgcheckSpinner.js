import { LightningElement, api } from 'lwc';
import OrgCheckStaticRessource from "@salesforce/resourceUrl/OrgCheck_SR";

export default class OrgCheckSpinner extends LightningElement {

    #keysIndex = {};
    isShow = false;
    spinningURL = OrgCheckStaticRessource + '/img/Mascot+Animated.svg';
    messages = [];

    @api setMessage(id, label, status) {
        let message;
        if (Object.keys(this.#keysIndex).includes(id) === false) {
            message = { id: id, label: label, status: status };
            this.#keysIndex[id] = this.messages.length;
            this.messages.push(message);
        } else {
            const index = this.#keysIndex[id];
            message = this.messages[index];
            message.label = label;
            message.status = status;
        }
    }

    @api open() {
        this.isShow = true;
    }

    @api close() {
        this.isShow = false;
        this.messages = [];
        this.#keysIndex = {};
    }
}