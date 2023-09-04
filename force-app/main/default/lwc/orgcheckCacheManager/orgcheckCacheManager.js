import { LightningElement, api, track } from 'lwc';

export default class OrgcheckCacheManager extends LightningElement {

    @track items = [];

    /**
     * Set the component data.
     * 
     * @param {Array<DatasetCacheInfo>} data 
     */
    @api setComponentData(data) {
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