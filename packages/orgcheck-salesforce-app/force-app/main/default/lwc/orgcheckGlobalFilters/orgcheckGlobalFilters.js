import { LightningElement, api } from 'lwc';

const ANY_VALUES = '*';
const NO_VALUE = '';
const TRUE_AS_STRING = 'true';
const FALSE_AS_STRING = 'false';

class Option {
    /** @type {string} */ label;
    /** @type {string} */ value;
}

export default class OrgcheckGlobalFilters extends LightningElement {

    /** 
     * @description Value for the package filter. Any values by default.
     * @type {string}
     * @public
     */
    package = ANY_VALUES;

    /** 
     * @description Value for the object type filter. Any values by default.
     * @type {string}
     * @public
     */
    sobjectType = ANY_VALUES;

    /** 
     * @description Value for the object name filter. Any values by default.
     * @type {string}
     * @public
     */
    sobjectApiName = ANY_VALUES;

    /** 
     * @description Package options
     * @type {Array<Option>}
     * @public
     */
    packageOptions;

    /** 
     * @description SObject type options
     * @type {Array<Option>}
     * @public
     */
    sobjectTypeOptions;

    /** 
     * @description SObject name options
     * @type {Array<Option>}
     * @public
     */
    sobjectApiNameOptions;

    /** 
     * @description SObject name original data (used for filtering and generate name options)
     * @type {Array<any>}
     * @public
     */
    sobjectApiNameData;

    /** 
     * @description Yes/No options
     * @type {Array<Option>}
     * @public
     */
    yesNoOptions = [
        { label: 'Yes', value: TRUE_AS_STRING },
        { label: 'No', value: FALSE_AS_STRING }
    ];

    /** 
     * @description Flag to show the options panel of the filter
     * @type {boolean}
     * @public
     */
    unavailable = true;
    
    /** 
     * @description Method to actually hide the options panel
     * @public
     */
    @api hide() {
        this.unavailable = true;
    }

    /** 
     * @description Method to actually show the options panel
     * @public
     */
    @api show() {
        this.unavailable = false;
    }

    /**
     * @description Update the list of package options. This method adds systematically the 'All packages' 
     *                 and the 'No package' options on top.  It also sets the current filter value back to 
     *                 the 'All packages' option.
     * @param {Array<any>} data - is an array coming from the Org Check API representing the list of Packages in the org
     * @public
     */
    @api updatePackageOptions(data) {
        if (data && data.map) {
            this.packageOptions = [
                { label: 'All packages', value: ANY_VALUES },
                { label: 'No package', value: NO_VALUE }
            ].concat(data.map((p) => {
                return {
                    label: `${p.name} (api=${p.namespace}, type=${p.type})`, 
                    value: p.namespace
                };
            }));
            this.package = ANY_VALUES;
        }
    }
    
    /**
     * @description Update the list of object type options. This method adds systematically the 'All types' 
     *                 option on top. It also sets the current filter value back to the 'All types' option.
     * @param {Array<any>} data - is an array coming from the Org Check API representing the list of SObject Types in the org
     * @public
     */
    @api updateSObjectTypeOptions(data) {
        if (data && data.map) {
            this.sobjectTypeOptions = [
                { label: 'All types', value: ANY_VALUES } 
            ].concat(data.map((t) => {
                return { 
                    label: t.label, 
                    value: t.id 
                };
            }));
            this.sobjectType = ANY_VALUES;
        }
    }

    /**
     * @description Update the list of object name options. This method adds systematically the 'All objects' 
     *                  option on top. It also sets the current filter value back to the 'All objects' option.
     * @param {Array<any>} data - is an array coming from the Org Check API representing the list of SObject in the org
     * @public
     */
    @api updateSObjectApiNameOptions(data) {
        if (data && data.map) {
            this.sobjectApiNameData = data;
            this._setSObjectApiNameOptions();
            this.sobjectApiName = ANY_VALUES;
        }
    }

    /**
     * @description Internal filtering of object options
     * @private 
     */
    _setSObjectApiNameOptions() {
        if (this.sobjectApiNameData) {
            this.sobjectApiNameOptions = [
                { label: 'All objects', value: ANY_VALUES }
            ].concat(this.sobjectApiNameData
                .filter((o) => {
                    return (this.package === ANY_VALUES || this.package === o.package) &&
                           (this.sobjectType === ANY_VALUES || this.sobjectType === o.typeId)
                })
                .map((o) => {
                    return {
                        label: `${o.label} (api=${o.name}, type=${o.typeRef?.label})`, 
                        value: o.id
                    };
                })
            );
        }
    }

    /** 
     * @description Get selected package value
     * @returns {string} Package value
     * @public
     */
    @api get selectedPackage() { return this.package; }

    /** 
     * @description Get selected SObject type value
     * @returns {string} SObject type value
     * @public
     */
    @api get selectedSObjectType() { return this.sobjectType; }

    /** 
     * @description Get selected SObject api name value
     * @returns {string} SObject api name value
     * @public
     */
    @api get selectedSObjectApiName() { return this.sobjectApiName; }

    /** 
     * @description Is selected package value means "ANY VALUES" ?
     * @returns {boolean} Is any package selected?
     * @public
     */
    @api get isSelectedPackageAny() { return this.package === ANY_VALUES; }

    /** 
     * @description Is selected package value means "NO VALUE" ?
     * @returns {boolean} Is no package selected?
     * @public
     */
    @api get isSelectedPackageNo() { return this.package === NO_VALUE; }

    /** 
     * @description Is selected SObject type value means "ANY VALUES" ?
     * @returns {boolean} Is any type selected?
     * @public
     */
    @api get isSelectedSObjectTypeAny() { return this.sobjectType === ANY_VALUES; }

    /** 
     * @description Is selected SObject api name value means "ANY VALUES" ?
     * @returns {boolean} Is any sobject selected?
     * @public
     */
    @api get isSelectedSObjectApiNameAny() { return this.sobjectApiName === ANY_VALUES; }

    /**
     * @description Reset values
     */ 
    @api resetValues() {
        this.handleClickReset();
    }

    /**
     * @description This map contains the values of the filters before the user validates them. So that we can 
     *                  reset the previous value of the filter if the user cancels the validation. And we can
     *                  compare the previous value with the current value to know if the user changed the value.
     * @type {Map<string, string>}
     * @public
     */
    whichFiltersChanged = new Map();

    /**
     * @description Boolean that indicates if at least one filter has changed. If true, the whichFiltersChanged property 
     *                  has at least one element. If false, the whichFiltersChanged property is an empty array.
     * @type {boolean}
     * @public
     */
    get filtersChanged() {
        return this.whichFiltersChanged.size > 0;
    }

    /**
     * @description Dynamic label of the APPLY button
     * @returns {string} Label of the APPLY button
     * @public
     */ 
    get applyButtonLabel() {
        return `Apply ${this.whichFiltersChanged.size} change${this.whichFiltersChanged.size>1?'s':''} in the app...`;
    }

    /**
     * @description Boolean that indicates if at least one filter has changed originally.
     * @type {boolean}
     * @public
     */
    get filtersOriginallyChanged() {
        return (this.package !== ANY_VALUES || this.sobjectType !== ANY_VALUES || this.sobjectApiName !== ANY_VALUES);
    }

    /**
     * @description Event triggered when one of the filters have changed
     * @param {Event | any} event - containing the id of the changed filter (identified by data-id property in html view)
     * @public
     */
    handleChangeValue(event) {
        const fieldId = event.target.dataset.id;
        const newValue = event.detail.value;
        if (this.whichFiltersChanged.has(fieldId) === false) {
            // if this field was never changed, we do save the current value (before the change) in the map as the "initial value"
            this.whichFiltersChanged.set(fieldId, this[fieldId]);
        } else {
            // if this field was already changed (present in the map) we check if the new value (from the event) 
            // is the same as the previous one (from the map), if so the field has returned to its initial value
            const previousValue = this.whichFiltersChanged.get(fieldId);
            if (previousValue === newValue) {
                // Value is the same, delete the field from the map (there is no change about this field!)
                this.whichFiltersChanged.delete(fieldId);
            }
        }
        // We populate the field with the new value
        this[fieldId] = newValue;
        // potentially, there is dependency from objecttype and package in the list of object apinames
        if (fieldId === 'sobjectType' || fieldId === 'package') this._setSObjectApiNameOptions();
    }

    /**
     * @description Event triggered when the user clicks on the validate button. This event fires a custom 
     *                  event called 'validatechange' for the parent component. this also reset the array 
     *                  and flag back to "no change" statuses.
     * @public
     */
    handleClickValidate() {
        this.dispatchEvent(new CustomEvent('validatechange', { detail: {} }));
        this.whichFiltersChanged = new Map();
    }

    /**
     * @description Event triggered when the user clicks on the reset button. This event reset all the 
     *                 values of the filter and then propagates the values.
     * @public
     */
    handleClickReset() {
        this.package = ANY_VALUES;
        this.sobjectType = ANY_VALUES;
        this.sobjectApiName = ANY_VALUES;
        this.handleClickValidate();
    }

    /**
     * @description Event triggered when the user clicks on the refresh button. 
     * @public
     */
    handleClickRefresh() {
        this.dispatchEvent(new CustomEvent('refresh', { detail: {} }));
    }
}