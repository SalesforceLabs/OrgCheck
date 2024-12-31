import { OrgCheckData, OrgCheckDataWithDependencies, OrgCheckDataWithoutScoring } from './orgcheck-api-data';
import { SFDC_ApexClass } from '../data/orgcheck-api-data-apexclass';
import { SFDC_ApexTrigger } from '../data/orgcheck-api-data-apextrigger';
import { SFDC_CustomLabel } from '../data/orgcheck-api-data-customlabel';
import { SFDC_Field } from '../data/orgcheck-api-data-field';
import { SFDC_Flow } from '../data/orgcheck-api-data-flow';
import { SFDC_Group } from '../data/orgcheck-api-data-group';
import { SFDC_LightningAuraComponent } from '../data/orgcheck-api-data-lightningauracomponent';
import { SFDC_LightningPage } from '../data/orgcheck-api-data-lightningpage';
import { SFDC_LightningWebComponent } from '../data/orgcheck-api-data-lightningwebcomponent';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';
import { SFDC_ProfilePasswordPolicy } from '../data/orgcheck-api-data-profilepasswordpolicy';
import { SFDC_ProfileRestrictions } from '../data/orgcheck-api-data-profilerestrictions';
import { SFDC_User } from '../data/orgcheck-api-data-user';
import { SFDC_UserRole } from '../data/orgcheck-api-data-userrole';
import { SFDC_VisualForceComponent } from '../data/orgcheck-api-data-visualforcecomponent';
import { SFDC_VisualForcePage } from '../data/orgcheck-api-data-visualforcepage';
import { SFDC_Workflow } from '../data/orgcheck-api-data-workflow.js';
import { SFDC_ValidationRule } from '../data/orgcheck-api-data-validationrule';
import { SFDC_RecordType } from '../data/orgcheck-api-data-recordtype';
import { SFDC_Limit } from '../data/orgcheck-api-data-limit';
import { SFDC_FieldSet } from '../data/orgcheck-api-data-fieldset';
import { OrgCheckSalesforceManagerIntf } from './orgcheck-api-salesforcemanager';
import { OrgCheckDataDependenciesFactory } from './orgcheck-api-data-dependencies-factory';

/**
 * @description Validation Rule used to qualify if an item is bad or not
 * @public
 */
export class OrgCheckValidationRule {

    /**
     * @description Unique identifier of that rule
     * @type {number}
     * @public
     */
    id;

    /**
     * @description Description of that rule
     * @type {string}
     * @public
     */
    description;
    
    /**
     * @description Rule's formula with the data as only parameter. Function returns true or false.
     * @type {Function}
     * @public
     */
    formula;

    /**
     * @description Message to show if the formula returns false for a given data.
     * @type {string}
     * @public
     */
    errorMessage;

    /**
     * @description Technical name of the field that is considered 'bad'
     * @type {string}
     * @public
     */    
    badField;

    /**
     * @description For which data this rule is applicable?
     * @type {Array<any>}
     * @public
     */    
    applicable;
}

/**
 * @description Data factory interface
 * @public
 */
export class OrgCheckDataFactoryIntf {

    /**
     * @description Get the validation Rule given its ID
     * @param {number} id
     * @returns {OrgCheckValidationRule}
     * @throws if the given id is not found in the validation rules list
     * @public
     */
    getValidationRule(id) { throw new Error('Not implemented'); }

    /**
     * @description Get the instance of the factiry for a given data class
     * @param {any} dataClass 
     * @returns {OrgCheckDataFactoryInstanceIntf}
     * @throws if the given dataClass is not an instance of OrgCheckData or OrgCheckDataWithoutScoring
     * @public
     */
    getInstance(dataClass) { throw new Error('Not implemented'); }   
}

/**
 * @description Data factory interface for a given data class
 * @public
 */
export class OrgCheckDataFactoryInstanceIntf {

    /**
     * @description Creates a new instance of the given data class without computing the score
     * @param {any} configuration 
     * @returns {any}
     * @throws if configuration is null or configuration.properties is null
     * @public
     */
    create(configuration) { throw new Error('Not implemented'); }   

    /**
     * @description Computes the score on an existing row
     * @param {any} row 
     * @returns {any}
     * @public
     */
    computeScore(row) { throw new Error('Not implemented'); }   

    /**
     * @description Creates a new instance of the given data class AND computes the score
     * @param {any} configuration 
     * @returns {any}
     * @throws if configuration is null or configuration.properties is null
     * @public
     */
    createWithScore(configuration) { throw new Error('Not implemented'); }   
}