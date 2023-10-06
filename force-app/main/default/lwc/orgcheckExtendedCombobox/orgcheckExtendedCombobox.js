import { LightningElement, api } from 'lwc';

const GET_WIDTH_FROM_LABEL = (label) => {
    return Math.max(20, label?.length);
}

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
                this.inputStyle = `width: ${GET_WIDTH_FROM_LABEL(label)}ch`;
            }
        }
        this.searchValue = value;
    }

    _options = [];

    searchValue = '';

    searchLabel = '';
    
    inputStyle;

    dropdownStyle;

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
            let maxWidth = 0;
            this.itemsFound = this.options.filter(i => {
                if (i.label.toUpperCase().indexOf(s) >= 0) {
                    const width = GET_WIDTH_FROM_LABEL(i.label);
                    if (maxWidth < width) {
                        maxWidth = width;
                    }
                    return true; 
                }
                return false;
            });
            this.dropdownStyle = `max-width: ${maxWidth}ch`;
        } else {
            this.itemsFound = [];
        }
    }

    itemsFound = [];

    handleSelection(event) {
        this.itemsFound = [];
        const id = event.currentTarget.getAttribute('data-id');
        const name = event.currentTarget.getAttribute('data-name');
        if (id && name) {
            this._setValue(id);
            this.dispatchEvent(new CustomEvent('change', { detail: { value: id, label: name } }));
        }
    }
} 