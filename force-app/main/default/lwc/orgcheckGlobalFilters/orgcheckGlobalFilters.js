import { LightningElement, api, track } from 'lwc';

const ANY_VALUES = '*';
const NO_VALUE = '';
const TRUE_AS_STRING = 'true';
const FALSE_AS_STRING = 'false';

export default class OrgcheckGlobalFilters extends LightningElement {

    /** 
     * Value for the package filter
     * Any values by default.
     */
    package = ANY_VALUES;

    /** 
     * Value for the object type filter
     * Any values by default.
     */
    sobjectType = ANY_VALUES;

    /** 
     * Value for the object name filter
     * Any values by default.
     */
    sobjectApiName = ANY_VALUES;

    /** 
     * Show external roles option selected in the filter
     * False by default;
     */
    showExternalRoles = FALSE_AS_STRING;

    /** 
     * Production by-pass option selected in the filter
     * False by default;
     */
    useInProductionConfirmation = FALSE_AS_STRING;
    
    /** 
     * Package options
     */
    packageOptions;

    /** 
     * SObject type options
     */
    sobjectTypeOptions;

    /** 
     * SObject name options
     */
    sobjectApiNameOptions;

    /** 
     * Yes/No options
     */
    yesNoOptions = [
        { label: 'Yes', value: TRUE_AS_STRING },
        { label: 'No', value: FALSE_AS_STRING }
    ];

    /**
     * Update the list of package options.
     * This method adds systematically the 'All packages' and the 'No package' options on top.
     * It also sets the current filter value back to the 'All packages' option.
     * 
     * @param data is an array coming from the Org Check API representing the list of Packages in the org
     */
    @api updatePackageOptions(data) {
        if (data && data.map) {
            this.packageOptions = [
                { label: 'All packages', value: ANY_VALUES },
                { label: 'No package', value: NO_VALUE }
            ].concat(data.map(p => { 
                return {
                    label: `${p.name} (api=${p.namespace}, type=${p.type})`, 
                    value: p.namespace
                }
            }));
            this.package = ANY_VALUES;
        }
    }
    
    /**
     * Update the list of object type options.
     * This method adds systematically the 'All types' option on top.
     * It also sets the current filter value back to the 'All types' option.
     * 
     * @param data is an array coming from the Org Check API representing the list of SObject Types in the org
     */
    @api updateSObjectTypeOptions(data) {
        if (data && data.map) {
            this.sobjectTypeOptions = [ 
                { label: 'All types', value: ANY_VALUES } 
            ].concat(data.map(t => { 
                return { 
                    label: t.label, 
                    value: t.id 
                }
            }));
            this.sobjectType = ANY_VALUES;
        }
    }

    /**
     * Update the list of object name options.
     * This method adds systematically the 'All objects' option on top.
     * It also sets the current filter value back to the 'All objects' option.
     * 
     * @param data is an array coming from the Org Check API representing the list of SObjects in the org
     */
    @api updateSObjectApiNameOptions(data) {
        if (data && data.map) {
            this.sobjectApiNameOptions = [ 
                { label: 'All objects', value: ANY_VALUES } 
            ].concat(data.map(o => {
                return {
                    label: `${o.label} (api=${o.name}, type=${o.typeRef.label})`, 
                    value: o.id
                }
            }));
            this.sobjectApiName = ANY_VALUES;
        }
    }

    /** 
     * Get selected package value
     */
    @api get selectedPackage() { return this.package; }

    /** 
     * Get selected SObject type value
     */
    @api get selectedSObjectType() { return this.sobjectType; }

    /** 
     * Get selected SObject api name value
     */
    @api get selectedSObjectApiName() { return this.sobjectApiName; }

    /** 
     * Is selected package value means "ANY VALUES" ?
     */
    @api get isSelectedPackageAny() { return this.package === ANY_VALUES; }

    /** 
     * Is selected package value means "NO VALUE" ?
     */
    @api get isSelectedPackageNo() { return this.package === NO_VALUE; }

    /** 
     * Is selected SObject type value means "ANY VALUES" ?
     */
    @api get isSelectedSObjectTypeAny() { return this.sobjectType === ANY_VALUES; }

    /** 
     * Is selected SObject api name value means "ANY VALUES" ?
     */
    @api get isSelectedSObjectApiNameAny() { return this.sobjectApiName === ANY_VALUES; }

    /**
     * This array indicates which filters has changed since last validation
     * By default, the array is empty.
     * After validation, the array becomes empty.
     * After modification in one of the filters, the array will grow if the name 
     *   of the filter that changed only if it is not yet referenced.
     */
    @track whichFiltersChanged = [];

    /**
     * Boolean that indicates if at least one filter has changed.
     * If true, the whichFiltersChanged property has at least one element.
     * If false, the whichFiltersChanged property is an empty array.
     */
    filtersChanged = false;

    /**
     * Event triggered when one of the filters have changed
     * 
     * @param event containing the id of the changed filter (identified by data-id property in html view)
     */
    filterChanged(event) {
        const fieldId = event.target.dataset.id;
        if (this.whichFiltersChanged.includes(fieldId) === false) this.whichFiltersChanged.push(fieldId);
        this.filtersChanged = true;
        this[fieldId] = event.detail.value;
    }

    /**
     * Event triggered when the user clicks on the validate button
     * This event fire a custom event called 'validatechange' for the parent component.
     * this also reset the array and flag back to "no change" statuses.
     */
    propagateValues() {
        this.dispatchEvent(new CustomEvent('validatechange', { 
            detail: {},
            bubbles: false 
        }));
        this.whichFiltersChanged = [];
        this.filtersChanged = false;
    }
}