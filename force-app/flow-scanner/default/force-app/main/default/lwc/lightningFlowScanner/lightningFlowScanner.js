import { LightningElement, api } from 'lwc';

export default class LightningFlowScanner extends LightningElement {
    @api name;
    @api metadata;
    @api scanResult;
    @api numberOfRules;
    @api error;
    @api records;
    @api selectedFlowRecord;

    get hasScanResults() {
        return this.scanResult && this.scanResult.ruleResults && this.scanResult.ruleResults.length > 0;
    }

    get flowName() {
        return this.name || '';
    }

    get isFirstFlow() {
        if (!this.records || !this.selectedFlowRecord) return true;
        return this.records.findIndex(rec => rec.id === this.selectedFlowRecord.id) === 0;
    }

    get isLastFlow() {
        if (!this.records || !this.selectedFlowRecord) return true;
        return this.records.findIndex(rec => rec.id === this.selectedFlowRecord.id) === this.records.length - 1;
    }

    handlePreviousFlow() {
        this.dispatchEvent(new CustomEvent('navigateflow', {
            detail: { direction: 'previous' }
        }));
    }

    handleNextFlow() {
        this.dispatchEvent(new CustomEvent('navigateflow', {
            detail: { direction: 'next' }
        }));
    }
}