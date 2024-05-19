import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class OrgcheckFlowScanner extends NavigationMixin(LightningElement) {

    @api whatId;
    @api whatName;

    handleClick() {


        // TODO Get Flow Metadata Based on WhatId - use jsforce?
        
        let metadata;

        const pageReference = {
            type: 'standard__app',
            attributes: {
                appTarget: 'c__Lightning_Flow_Scanner', 
                pageRef: {
                    type: 'standard__component',
                    attributes: {
                        componentName: 'lfs_component__lightningFlowScanner', 
                    },
                    state: {
                        name: this.whatName,
                        metadata
                    }
                }
            }
        };

        this[NavigationMixin.Navigate](pageReference);
    }
}
