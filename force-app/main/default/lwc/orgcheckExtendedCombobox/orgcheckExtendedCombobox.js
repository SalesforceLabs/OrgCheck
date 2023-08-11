import { LightningElement, api } from 'lwc';

export default class OrgcheckExtendedCombobox extends LightningElement {

    @api label;

    @api fieldLevelHelp;
    
    @api get options() { return this._options; }

    set options(values) {
        this._options = values;
        if (values?.length > 0) {
            this._setValue(values[0]?.value);
        }
    }
    
    @api get value() { return this.searchValue; }

    set value(value) { this._setValue(value); }

    _setValue(value) {
        if (this.options) {
            const s = this.options.filter(i => i.value === value);
            if (s?.length === 1) {
                const label = s[0].label;
                this.searchLabel = label;
                this.style = 'width: '+Math.max(20, label?.length)+'ch';
            }
        }
        this.searchValue = value;
    }

    _options = [];

    searchValue = '';

    searchLabel = '';
    
    style;

    handleShowAllOptions() {
        this.itemsFound = this.options;
    }

    handleFocus(event) {
        event.target.selectionStart = 0;
        event.target.selectionEnd = event.target.value.length || 0;
    }

    handleSearch(event) {
        const searchingValue = event.target.value;
        if (searchingValue && searchingValue.length > 2) {
            const s = searchingValue.toUpperCase();
            this.itemsFound = this.options.filter(i => {
                if (i.label.toUpperCase().indexOf(s) >= 0) return true; 
                return false;
            });
        } else {
            this.itemsFound = [];
        }
        // we don't want the event to be more propagated
        event.stopPropagation();
    }

    itemsFound = [];

    handleSelection(event) {
        this.itemsFound = [];
        const id = event.currentTarget.getAttribute('data-id');
        const name = event.currentTarget.getAttribute('data-name');
        if (id && name) {
            this._setValue(id);
            this.dispatchEvent(new CustomEvent('change', { detail: { value: id, label: name }, bubbles: false }));
        }
    }
} 