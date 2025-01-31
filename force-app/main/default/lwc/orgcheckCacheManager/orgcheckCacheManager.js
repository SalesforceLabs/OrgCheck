import { LightningElement, api, track } from 'lwc';

export default class OrgcheckCacheManager extends LightningElement {

    @track items = [];

    /**
     * Connected callback function
     */
    connectedCallback() {
        this.dispatchEvent(new CustomEvent('load'));
    }
    
    /**
     * Set the component data.
     * 
     * @param {Array<any>} data 
     */
    @api set cacheManagerData(data) {
        if (data && typeof data === 'string') {
            try {
                this.items = JSON.parse(data);
            } catch (e) {
                this.items = [];
            }
        } else if (data && Array.isArray(data) && data.length > 0) {
            this.items = data;
        } else {
            this.items = [];
        }
    }

    get cacheManagerData() {
        return this.items;
    }

    handleRemoveAllCache() {
        this.dispatchEvent(new CustomEvent('removecache'));
    }
}