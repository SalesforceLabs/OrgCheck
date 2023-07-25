import { LightningElement, api, track } from 'lwc';

const ANY_VALUES = '*';
const NO_VALUE = '';
const TRUE_AS_STRING = 'true';
const FALSE_AS_STRING = 'false';

export default class OrgcheckGlobalFilters extends LightningElement {

    /** 
     * Internal value for the package filter
     * Any values by default.
     */
    _package = ANY_VALUES;

    /** 
     * Public getter for the package value selected in the filter
     */
    @api get package() { return this._package; }

    /** 
     * Public setter for the package value selected in the filter
     */
    set package(value) { this._package = value; }

    /** 
     * Public getter to know if the package value selected means ANY VALUES
     */
    @api get isAnyPackage() { return this._package === ANY_VALUES; }

    /** 
     * Public getter to know if the package value selected means NO VALUE
     */
    @api get isWithoutPackage() { return this._package === NO_VALUE; }

    /** 
     * Internal value for the object type filter
     * Any values by default.
     */
    _sobjectType = ANY_VALUES;

    /** 
     * Public getter for the object type value selected in the filter
     */
    @api get sobjectType() { return this._sobjectType; }

    /** 
     * Public setter for the object type value selected in the filter
     */
    set sobjectType(value) { this._sobjectType = value; }

    /** 
     * Public getter to know if the object type value selected means ANY VALUE
     */
    @api get isAnySObjectType() { return this._sobjectType === ANY_VALUES; }

    /** 
     * Internal value for the object name filter
     * Any values by default.
     */
    _sobjectApiName = ANY_VALUES;

    /** 
     * Public getter for the object name value selected in the filter
     */
    @api get sobjectApiName() { return this._sobjectApiName; }

    /** 
     * Public setter for the object name value selected in the filter
     */
    set sobjectApiName(value) { this._sobjectApiName = value; }

    /** 
     * Public getter to know if the object name value selected means ANY VALUE
     */
    @api get isAnySObjectApiName() { return this._sobjectApiName === ANY_VALUES; }

    /** 
     * Public getter for the show external roles option selected in the filter
     * False by default;
     */
    @api showExternalRoles = FALSE_AS_STRING;

    /** 
     * Public getter for the production by-pass option selected in the filter
     * False by default;
     */
    @api useInProductionConfirmation = FALSE_AS_STRING;

    /** 
     * Internal value for the package options
     */
    _packageOptions = [];

    /** 
     * Public getter for the list of package options
     */
    @api get packageOptions() { return this._packageOptions; }

    /**
     * Public setter for the list of package options.
     * This method adds systematically the 'All packages' and the 'No package' options on top.
     * It also sets the current filter value back to the 'All packages' option.
     */
    set packageOptions(values) {
        this._packageOptions = [
            { label: 'All packages', value: ANY_VALUES },
            { label: 'No package', value: NO_VALUE }
        ].concat(values);
        this._package = ANY_VALUES;
    }

    /** 
     * Internal value for the object type options
     */
    _sobjectTypeOptions = [];

    /** 
     * Public getter for the list of object type options
     */
    @api get sobjectTypeOptions() { return this._sobjectTypeOptions; }

    /**
     * Public setter for the list of object type options.
     * This method adds systematically the 'All types' option on top.
     * It also sets the current filter value back to the 'All types' option.
     */
    set sobjectTypeOptions(values) { 
        this._sobjectTypeOptions = [ 
            { label: 'All types', value: ANY_VALUES } 
        ].concat(values);
        this._sobjectType = ANY_VALUES;
     }

    /** 
     * Internal value for the object name options
     */
    _sobjectApiNameOptions = [];

    /** 
     * Public getter for the list of object name options
     */
    @api get sobjectApiNameOptions() { return this._sobjectApiNameOptions; }

    /**
     * Public setter for the list of object name options.
     * This method adds systematically the 'All objects' option on top.
     * It also sets the current filter value back to the 'All objects' option.
     */
    set sobjectApiNameOptions(values) {
        this._sobjectApiNameOptions = [ 
            { label: 'All objects', value: ANY_VALUES } 
        ].concat(values);
        this._sobjectApiName = ANY_VALUES;
    }

    /**
     * Public getter for a typical boolean Yes/No options 
     */
    get yesNoOptions() {
        return [
            { label: 'Yes', value: TRUE_AS_STRING },
            { label: 'No', value: FALSE_AS_STRING }
        ];
    }

    @track whichFiltersChanged = [];

    filtersChanged = false;

    filterChanged(event) {
        const fieldId = event.target.dataset.id;
        if (this.whichFiltersChanged.includes(fieldId) === false) this.whichFiltersChanged.push(fieldId);
        this.filtersChanged = true;
        this[fieldId] = event.detail.value;
        this.dispatchEvent(new CustomEvent('change', { 
            detail: { what: fieldId }, 
            bubbles: false 
        }));
    }

    propagateValues() {
        this.dispatchEvent(new CustomEvent('validatechange', { 
            detail: {},
            bubbles: false 
        }));
        this.whichFiltersChanged = [];
        this.filtersChanged = false;
    }
}