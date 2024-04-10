import { OrgCheckDataDependencies } from './orgcheck-api-data-dependencies';
import { SFDC_ApexClass } from '../data/orgcheck-api-data-apexclass';
import { SFDC_ApexTrigger } from '../data/orgcheck-api-data-apextrigger';
import { SFDC_AppPermission } from '../data/orgcheck-api-data-apppermission';
import { SFDC_CustomLabel } from '../data/orgcheck-api-data-customlabel';
import { SFDC_Field } from '../data/orgcheck-api-data-field';
import { SFDC_FieldSet } from '../data/orgcheck-api-data-fieldset';
import { SFDC_Flow } from '../data/orgcheck-api-data-flow';
import { SFDC_Group } from '../data/orgcheck-api-data-group';
import { SFDC_LightningAuraComponent } from '../data/orgcheck-api-data-lightningauracomponent';
import { SFDC_LightningPage } from '../data/orgcheck-api-data-lightningpage';
import { SFDC_LightningWebComponent } from '../data/orgcheck-api-data-lightningwebcomponent';
import { SFDC_Limit } from '../data/orgcheck-api-data-limit';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_ObjectPermission } from '../data/orgcheck-api-data-objectpermission';
import { SFDC_ObjectRelationShip } from '../data/orgcheck-api-data-objectrelationship';
import { SFDC_ObjectType } from '../data/orgcheck-api-data-objecttype';
import { SFDC_Organization } from '../data/orgcheck-api-data-organization';
import { SFDC_Package } from '../data/orgcheck-api-data-package';
import { SFDC_PageLayout } from '../data/orgcheck-api-data-pagelayout';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';
import { SFDC_ProfilePasswordPolicy } from '../data/orgcheck-api-data-profilepasswordpolicy';
import { SFDC_ProfileIpRangeRestriction } from '../data/orgcheck-api-data-profilerestrictions';
import { SFDC_ProfileLoginHourRestriction } from '../data/orgcheck-api-data-profilerestrictions';
import { SFDC_ProfileRestrictions } from '../data/orgcheck-api-data-profilerestrictions';
import { SFDC_RecordType } from '../data/orgcheck-api-data-recordtype';
import { SFDC_User } from '../data/orgcheck-api-data-user';
import { SFDC_UserRole } from '../data/orgcheck-api-data-userrole';
import { SFDC_ValidationRule } from '../data/orgcheck-api-data-validationrule';
import { SFDC_VisualForceComponent } from '../data/orgcheck-api-data-visualforcecomponent';
import { SFDC_VisualForcePage } from '../data/orgcheck-api-data-visualforcepage';
import { SFDC_WebLink } from '../data/orgcheck-api-data-weblink';
import { SFDC_Workflow } from '../data/orgcheck-api-data-workflow.js';

export class OrgCheckDataFactory {

    #allValidations;
    #needDepencencies;
    #instances;

    constructor(sfdcManager) {

        this.#allValidations = [
            { 
                description: 'Not referenced anywhere',
                formula: (d) => d.dependencies.referenced.length === 0, 
                errorMessage: 'This component is not referenced anywhere (as we were told by the Dependency API). Please review the need to keep it in your org.',
                badField: 'dependencies.referenced',
                applicable: [ SFDC_ApexClass, SFDC_ApexTrigger, SFDC_Field, SFDC_CustomLabel, SFDC_Flow, SFDC_LightningPage, SFDC_VisualForceComponent, SFDC_VisualForcePage ]
            }, {
                description: 'API Version too old',
                formula: (d) => sfdcManager.isVersionOld(d.apiVersion) === true,
                errorMessage: 'The API version of this component is too old. Please update it to a newest version.',
                badField: 'apiVersion',
                applicable: [ SFDC_ApexClass, SFDC_ApexTrigger ]
            }, {
                description: 'API Version too old',
                formula: (d) => d.isTest === true && d.nbSystemAsserts === 0,
                errorMessage: 'This apex test does not contain any assert! Best practices force you to define asserts in tests.',
                badField: 'nbSystemAsserts',
                applicable: [ SFDC_ApexClass ]
            }, {
                description: 'No description',
                formula: (d) => sfdcManager.isEmpty(d.description) === true,
                errorMessage: 'This component does not have a description. Best practices force you to use the Description field to give some informative context about why and how it is used/set/govern.',
                badField: 'description',
                applicable: [ SFDC_Field, SFDC_Flow, SFDC_LightningPage, SFDC_LightningAuraComponent, SFDC_LightningWebComponent, SFDC_VisualForcePage, SFDC_VisualForceComponent, SFDC_Workflow ]
            }
        ].map((v, i) => { v.id = i; return v; });
        Object.freeze(this.#allValidations); 

        this.#needDepencencies = [
            SFDC_ApexClass, SFDC_ApexTrigger, SFDC_Field, SFDC_CustomLabel, SFDC_Flow, 
            SFDC_LightningAuraComponent, SFDC_LightningPage, SFDC_LightningWebComponent,
            SFDC_VisualForceComponent, SFDC_VisualForcePage
        ];
        Object.freeze(this.#needDepencencies); 

        this.#instances = new Map();
    }

    getValidationRule(id) {
        return this.#allValidations[id];
    }

    getInstance(dataClass) {
        // If this dataClass was never asked before, create it and store it in the cache
        if (this.#instances.has(dataClass) === false) {
            const validations = this.#allValidations.filter(v => v.applicable.includes(dataClass));
            const isDependenciesNeeded = this.#needDepencencies.includes(dataClass);
            const instance = {
                create: (setup) => {
                    // Create a row from the protofype
                    const row = new dataClass();
                    // Copy properties from setup to object
                    // NB: Please note that ONLY the properties explicitely set in the class will be copied from setup to object
                    Object.keys(row).forEach((p) => { row[p] = setup[p]; });
                    // We want to make sure no new property is added to the row (there should be only the ones declared in classes!)
                    Object.seal(row);
                    // For this type if we have at least one validation rule, then score is needed
                    if (validations.length > 0) {
                        row.score = 0;
                        row.badFields = [];
                        row.badReasonIds = [];
                    }
                    // If dependencies are needed...
                    if (isDependenciesNeeded === true && setup.allDependencies) {
                        row.dependencies = new OrgCheckDataDependencies(setup.allDependencies, row.id);
                    }
                    // Return the row finally
                    return row;
                },
                computeScore: (row) => { 
                    validations
                        .filter(v => v.formula(row))
                        .forEach(v => {
                            row.score++;
                            row.badFields.push(v.badField);
                            row.badReasonIds.push(v.id);
                        });
                }
            };
            this.#instances.set(dataClass, instance);
        }
        // Return the instance
        return this.#instances.get(dataClass);
    }
}