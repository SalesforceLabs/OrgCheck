import { LightningElement } from 'lwc';

export default class OrgcheckCacheManager extends LightningElement {

    handleRemoveAllCache() {
        this.dispatchEvent(new CustomEvent('removeallcache', { bubbles: false }));
    }
}