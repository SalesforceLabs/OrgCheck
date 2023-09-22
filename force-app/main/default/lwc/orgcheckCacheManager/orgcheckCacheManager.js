import { LightningElement, api, track } from 'lwc';

export default class OrgcheckCacheManager extends LightningElement {

    @track items = [];

    /**
     * Connected callback function
     */
    connectedCallback() {
        this.dispatchEvent(new CustomEvent('load', { detail: {}, bubbles: false }));
    }
    
    /**
     * Set the component data.
     * 
     * @param {Array<DatasetCacheInfo>} data 
     * @param {Error} error (could be null)
     */
    @api setComponentData(data, error) {
        if (data && Array.isArray(data) && data.length > 0) {
            this.items = data;
        } else {
            this.items = [];
        }
    }

    handleRemoveAllCache() {
        this.dispatchEvent(new CustomEvent('removecache', { detail: { allItems: true }, bubbles: false }));
    }

    handleRemoveOneCache(event) {
        this.dispatchEvent(new CustomEvent('removecache', { detail: { allItems: false, itemName: event.srcElement.getAttribute('data-item-name') }, bubbles: false }));
    }
}