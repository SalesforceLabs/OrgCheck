import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class FlowOverview extends NavigationMixin(LightningElement) {
    @api records = [];
    @api hasMoreRecords;
    @track err;
    @track columns = [
        { label: 'Label', fieldName: 'masterLabel', type: 'text' },
        { 
            label: 'API Name', 
            fieldName: 'developerNameUrl', 
            type: 'url', 
            typeAttributes: { 
                label: { fieldName: 'developerName' }, 
                target: '_blank' 
            } 
        },
        { label: 'Process Type', fieldName: 'processType', type: 'text' },
        { label: 'Is Active', fieldName: 'isActive', type: 'boolean', cellAttributes: { alignment: 'center' } },
        {
            type: 'button',
            typeAttributes: {
                label: 'Scan',
                name: 'scan',
                variant: 'base',
                title: 'Click to Scan Flow',
            }
        }
    ];

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'scan') {
            this.dispatchEvent(new CustomEvent('scanflow', {
                detail: { flowId: row.id }
            }));
        }
    }

    handleSearchInput(event) {
        const searchTerm = event.target.value;
        this.dispatchEvent(new CustomEvent('search', {
            detail: { searchTerm }
        }));
    }

    handleLoadMore() {
        this.dispatchEvent(new CustomEvent('loadmore'));
    }
}